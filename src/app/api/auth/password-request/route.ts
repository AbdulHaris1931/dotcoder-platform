import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  fallbackCompleteRequest,
  fallbackCreateRequest,
  fallbackGetLatestForUser,
  isMissingTableError,
} from "@/lib/password-request-store";

export const runtime = "nodejs";

/**
 * GET /api/auth/password-request
 * Returns the signed-in user's latest password change approval request.
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  const db = createAdminClient({ silent: true }) || (await createServerClient());
  if (!db) {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      request: fallbackGetLatestForUser(auth.user.id),
    });
  }

  try {
    const { data, error } = await db
      .from("password_change_requests")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({
          success: true,
          mode: "memory_fallback",
          request: fallbackGetLatestForUser(auth.user.id),
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (
      data &&
      data.status === "approved" &&
      data.approved_until &&
      new Date(data.approved_until).getTime() < Date.now()
    ) {
      return NextResponse.json({
        success: true,
        request: { ...data, status: "expired" },
      });
    }

    return NextResponse.json({ success: true, request: data || null });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load request.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/password-request
 * Submits a new password-change approval request to the Super Admin queue.
 */
export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  let reason = "";
  try {
    const body = (await req.json()) as { reason?: string };
    reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : "";
  } catch {
    reason = "";
  }

  const db = createAdminClient({ silent: true }) || (await createServerClient());
  let profileName = auth.user.email.split("@")[0] || "Campus User";
  let profileRole = auth.user.role;
  let profileDept = "";
  let profileRoll = "";

  if (db) {
    try {
      const { data: profile } = await db
        .from("profiles")
        .select("full_name, department, roll_no, role")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (profile) {
        profileName = profile.full_name || profileName;
        profileRole = profile.role || profileRole;
        profileDept = profile.department || "";
        profileRoll = profile.roll_no || "";
      }
    } catch {
      // Non-fatal
    }
  }

  if (!db) {
    const res = fallbackCreateRequest({
      user_id: auth.user.id,
      user_email: auth.user.email,
      user_name: profileName,
      user_role: profileRole,
      department: profileDept,
      roll_no: profileRoll,
      reason,
    });
    return NextResponse.json(
      { success: true, mode: "memory_fallback", ...res },
      { status: res.alreadyPending ? 200 : 201 }
    );
  }

  try {
    const { data: existing, error: existingErr } = await db
      .from("password_change_requests")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existingErr && isMissingTableError(existingErr.message)) {
      const res = fallbackCreateRequest({
        user_id: auth.user.id,
        user_email: auth.user.email,
        user_name: profileName,
        user_role: profileRole,
        department: profileDept,
        roll_no: profileRoll,
        reason,
      });
      return NextResponse.json(
        { success: true, mode: "memory_fallback", ...res },
        { status: res.alreadyPending ? 200 : 201 }
      );
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyPending: true,
        request: existing,
      });
    }

    const { data: created, error } = await db
      .from("password_change_requests")
      .insert({
        user_id: auth.user.id,
        user_email: auth.user.email,
        user_name: profileName,
        user_role: profileRole,
        department: profileDept,
        roll_no: profileRoll,
        reason,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        const res = fallbackCreateRequest({
          user_id: auth.user.id,
          user_email: auth.user.email,
          user_name: profileName,
          user_role: profileRole,
          department: profileDept,
          roll_no: profileRoll,
          reason,
        });
        return NextResponse.json(
          { success: true, mode: "memory_fallback", ...res },
          { status: res.alreadyPending ? 200 : 201 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, request: created }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to submit request.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/password-request
 * Marks the user's active approved request as `completed` right after password update.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  let requestId = "";
  try {
    const body = (await req.json()) as { requestId?: string };
    requestId = typeof body.requestId === "string" ? body.requestId : "";
  } catch {
    requestId = "";
  }

  if (!requestId) {
    return NextResponse.json({ success: true });
  }

  fallbackCompleteRequest(auth.user.id, requestId);

  const db = createAdminClient({ silent: true }) || (await createServerClient());
  if (!db) {
    return NextResponse.json({ success: true });
  }

  try {
    await db
      .from("password_change_requests")
      .update({ status: "completed" })
      .eq("id", requestId)
      .eq("user_id", auth.user.id)
      .eq("status", "approved");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
