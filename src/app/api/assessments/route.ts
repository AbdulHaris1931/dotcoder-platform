import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import { createClient } from "@/lib/supabase/server";
import { Assessment } from "@/types";

export const runtime = "nodejs";

/**
 * GET /api/assessments
 * Fetches published teacher/institutional assessments from Supabase so students
 * on any device immediately see exams published by faculty.
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ success: true, assessments: [], source: "local_demo" });
  }

  try {
    const { data, error } = await supabase
      .from("published_assessments")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      // Gracefully return empty list if migration 000011 hasn't been applied yet
      return NextResponse.json({ success: true, assessments: [], source: "fallback" });
    }

    const assessments: Assessment[] = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || "",
      target_college: row.target_college || "ALL",
      duration_minutes: Number(row.duration_minutes) || 60,
      is_proctored: row.is_proctored ?? true,
      is_active: row.is_active ?? true,
      created_at: row.created_at,
      problems: Array.isArray(row.problems_json) ? row.problems_json : [],
    }));

    return NextResponse.json({ success: true, assessments, source: "supabase" });
  } catch {
    return NextResponse.json({ success: true, assessments: [], source: "fallback" });
  }
}

/**
 * POST /api/assessments
 * Publishes a new Teacher / AI-generated assessment to Supabase for cross-device student access.
 */
export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, {
    allowedRoles: ["teacher", "mentor", "tpo", "admin", "super_admin"],
  });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await req.json()) as Assessment;
    if (!body?.id || !body?.title) {
      return NextResponse.json(
        { success: false, error: "Assessment id and title are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, persisted: false, source: "local_demo" });
    }

    const { error } = await supabase.from("published_assessments").upsert({
      id: body.id,
      title: body.title,
      description: body.description || "",
      target_college: body.target_college || "ALL",
      duration_minutes: Number(body.duration_minutes) || 60,
      is_proctored: body.is_proctored ?? true,
      is_active: body.is_active ?? true,
      problems_json: body.problems || [],
      created_by: auth.user.id,
      created_at: body.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn("[Assessments API] Supabase upsert notice:", error.message);
      return NextResponse.json({ success: true, persisted: false, warning: error.message });
    }

    return NextResponse.json({ success: true, persisted: true, source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to publish assessment";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
