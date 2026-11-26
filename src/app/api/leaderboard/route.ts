import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import { normalizeRole } from "@/lib/auth/rbac-routes";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DemoStore } from "@/lib/demo-store";
import {
  computeCampusLeaderboard,
  type RawLeaderboardCandidate,
} from "@/lib/leaderboard-engine";

export const runtime = "nodejs";

/**
 * GET /api/leaderboard?department=ALL&batch=ALL
 * Returns privacy-safe campus & department rankings.
 * - Students receive Top 25 + their own standing (zero student emails exposed).
 * - Faculty, TPO, Recruiter & Super Admin receive full cohort standings.
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  const viewerRole = normalizeRole(auth.user.role);
  const departmentFilter = req.nextUrl.searchParams.get("department") || "ALL";
  const batchFilter = req.nextUrl.searchParams.get("batch") || "ALL";

  const adminClient = createAdminClient({ silent: true });
  const db = adminClient || (await createServerClient());

  if (!db) {
    const demoStudents = DemoStore.getStudents();
    const candidates: RawLeaderboardCandidate[] = demoStudents.map((s) => ({
      id: s.id,
      fullName: s.full_name || "Campus Candidate",
      rollNo: s.roll_no || "GEN-001",
      department: s.department || "BCA",
      batchYear: Number(s.batch_year) || 2026,
      readinessScore: Number(s.readiness_score) || 0,
      problemsSolved: Number(s.problems_solved) || 0,
      examAvgScore: Math.round((Number(s.readiness_score) || 0) * 0.92),
      examsPassed: Number(s.problems_solved) > 5 ? 2 : 1,
    }));

    const result = computeCampusLeaderboard({
      candidates,
      viewerId: auth.user.id,
      viewerRole,
      departmentFilter,
      batchFilter,
    });

    return NextResponse.json({
      success: true,
      mode: "local_demo_fallback",
      ...result,
    });
  }

  try {
    const { data: profiles, error: profilesErr } = await db
      .from("profiles")
      .select(
        "id, full_name, roll_no, department, batch_year, readiness_score, problems_solved, account_status, role"
      )
      .eq("role", "student");

    if (profilesErr) {
      return NextResponse.json(
        { success: false, error: profilesErr.message },
        { status: 500 }
      );
    }

    // Aggregate optional proctored assessment scores per student if table exists
    const examStatsByUser = new Map<
      string,
      { sumScore: number; count: number; passedCount: number }
    >();

    try {
      const { data: attempts } = await db
        .from("assessment_attempts")
        .select("user_id, score, passed");

      if (Array.isArray(attempts)) {
        for (const att of attempts) {
          const uid = String(att.user_id || "");
          if (!uid) continue;
          const prev = examStatsByUser.get(uid) || {
            sumScore: 0,
            count: 0,
            passedCount: 0,
          };
          prev.sumScore += Number(att.score) || 0;
          prev.count += 1;
          if (att.passed) prev.passedCount += 1;
          examStatsByUser.set(uid, prev);
        }
      }
    } catch {
      // Non-fatal if assessment_attempts is empty or restricted
    }

    // Also count curriculum solved problems if `problems_solved` column hasn't synced yet
    const solvedCountByUser = new Map<string, Set<string>>();
    try {
      const { data: currSubs } = await db
        .from("curriculum_submissions")
        .select("user_id, problem_id, status")
        .eq("status", "Accepted");

      if (Array.isArray(currSubs)) {
        for (const sub of currSubs) {
          const uid = String(sub.user_id || "");
          const pid = String(sub.problem_id || "");
          if (!uid || !pid) continue;
          const set = solvedCountByUser.get(uid) || new Set<string>();
          set.add(pid);
          solvedCountByUser.set(uid, set);
        }
      }
    } catch {
      // Non-fatal
    }

    const activeProfiles = (profiles || []).filter((p) => {
      const st = String(p.account_status || "active").toLowerCase();
      return st !== "suspended" && st !== "archived";
    });

    const candidates: RawLeaderboardCandidate[] = activeProfiles.map((p) => {
      const uid = String(p.id);
      const examAgg = examStatsByUser.get(uid);
      const solvedSet = solvedCountByUser.get(uid);
      const profileSolved = Number(p.problems_solved) || 0;
      const effectiveSolved = Math.max(profileSolved, solvedSet ? solvedSet.size : 0);
      const examAvg =
        examAgg && examAgg.count > 0
          ? Math.round(examAgg.sumScore / examAgg.count)
          : 0;

      return {
        id: uid,
        fullName: String(p.full_name || "Campus Student"),
        rollNo: String(p.roll_no || `STU-${uid.slice(0, 6).toUpperCase()}`),
        department: String(p.department || "BCA"),
        batchYear: Number(p.batch_year) || 2026,
        readinessScore: Number(p.readiness_score) || 0,
        problemsSolved: effectiveSolved,
        examAvgScore: examAvg,
        examsPassed: examAgg ? examAgg.passedCount : 0,
      };
    });

    const result = computeCampusLeaderboard({
      candidates,
      viewerId: auth.user.id,
      viewerRole,
      departmentFilter,
      batchFilter,
    });

    return NextResponse.json({
      success: true,
      mode: "live_supabase_postgres",
      ...result,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to compute leaderboard.",
      },
      { status: 500 }
    );
  }
}
