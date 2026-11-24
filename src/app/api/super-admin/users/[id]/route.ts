import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, isAuthorizedOwnerIdentity } from "@/lib/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { generateSecureTempPassword } from "@/lib/auth/password-utils";

export const runtime = "nodejs";

/**
 * GET /api/super-admin/users/[id]
 * Uses service-role admin client when configured, otherwise falls back cleanly
 * to the authenticated Super Admin's RLS Supabase client (zero 503 errors).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  const adminClient = createAdminClient();
  const dbClient = adminClient || (await createServerClient());
  if (!dbClient) {
    return NextResponse.json({
      success: false,
      mode: "local_demo_fallback",
      error: "Database client unavailable",
    });
  }

  const { data, error } = await dbClient
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    mode: "live_supabase",
    user: {
      id: data.id,
      email: data.email || "",
      full_name: data.full_name || "Campus User",
      role: data.role || "student",
      college_name: data.college_name || "",
      roll_no: data.roll_no || "",
      department: data.department || "",
      batch_year: Number(data.batch_year) || new Date().getFullYear(),
      readiness_score: Number(data.readiness_score) || 0,
      problems_solved: Number(data.problems_solved) || 0,
      account_status: data.account_status || "active",
      created_at: data.created_at,
      last_sign_in_at: data.updated_at || data.created_at,
    },
  });
}

/**
 * PATCH /api/super-admin/users/[id]
 * Supports profile edits, role changes, suspend/reactivate/archive, and password reset.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  if (isAuthorizedOwnerIdentity({ id })) {
    return NextResponse.json(
      { success: false, error: "Sovereign Owner account cannot be modified via user management." },
      { status: 403 }
    );
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { success: false, mode: "local_demo_fallback", error: "SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      full_name?: string;
      email?: string;
      role?: "student" | "teacher" | "tpo" | "mentor";
      department?: string;
      roll_no?: string;
      batch_year?: number;
      college_name?: string;
      account_status?: "active" | "suspended" | "inactive" | "archived";
      resetPassword?: boolean;
      newPassword?: string;
    };

    // Check target isn't owner by email
    const { data: existing } = await adminClient
      .from("profiles")
      .select("id, email, role")
      .eq("id", id)
      .single();

    if (existing && isAuthorizedOwnerIdentity({ id: existing.id, email: existing.email })) {
      return NextResponse.json(
        { success: false, error: "Sovereign Owner account is protected." },
        { status: 403 }
      );
    }

    const authUpdate: {
      email?: string;
      password?: string;
      app_metadata?: Record<string, unknown>;
      user_metadata?: Record<string, unknown>;
      ban_duration?: string;
    } = {};

    const profileUpdate: Record<string, unknown> = {};
    if (body.full_name !== undefined) {
      profileUpdate.full_name = body.full_name.trim();
      authUpdate.user_metadata = { full_name: body.full_name.trim() };
    }
    if (body.email !== undefined) {
      profileUpdate.email = body.email.trim().toLowerCase();
      authUpdate.email = body.email.trim().toLowerCase();
    }
    if (body.role !== undefined) {
      const normalizedRole = body.role === "mentor" ? "teacher" : body.role;
      profileUpdate.role = normalizedRole;
      authUpdate.app_metadata = { role: normalizedRole };
    }
    if (body.department !== undefined) profileUpdate.department = body.department.trim();
    if (body.roll_no !== undefined) profileUpdate.roll_no = body.roll_no.trim();
    if (body.batch_year !== undefined) profileUpdate.batch_year = Number(body.batch_year);
    if (body.college_name !== undefined) profileUpdate.college_name = body.college_name.trim();

    if (body.account_status !== undefined) {
      profileUpdate.account_status = body.account_status;
      if (body.account_status === "suspended" || body.account_status === "archived") {
        profileUpdate.suspended_at = new Date().toISOString();
        authUpdate.ban_duration = "876000h"; // ~100 years until reactivated
      } else if (body.account_status === "active") {
        profileUpdate.suspended_at = null;
        authUpdate.ban_duration = "none";
      }
    }

    let generatedPassword: string | undefined;
    if (body.resetPassword) {
      generatedPassword = body.newPassword?.trim() || generateSecureTempPassword(12);
      authUpdate.password = generatedPassword;
    }

    if (Object.keys(authUpdate).length > 0) {
      const { error: authErr } = await adminClient.auth.admin.updateUserById(id, authUpdate);
      if (authErr) {
        return NextResponse.json({ success: false, error: authErr.message }, { status: 400 });
      }
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profErr } = await adminClient
        .from("profiles")
        .update(profileUpdate)
        .eq("id", id);
      if (profErr) {
        return NextResponse.json({ success: false, error: profErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      tempPassword: generatedPassword,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/super-admin/users/[id]
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  if (isAuthorizedOwnerIdentity({ id })) {
    return NextResponse.json(
      { success: false, error: "Sovereign Owner account cannot be deleted." },
      { status: 403 }
    );
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { success: false, mode: "local_demo_fallback", error: "SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 503 }
    );
  }

  const { data: existing } = await adminClient
    .from("profiles")
    .select("id, email")
    .eq("id", id)
    .single();

  if (existing && isAuthorizedOwnerIdentity({ id: existing.id, email: existing.email })) {
    return NextResponse.json(
      { success: false, error: "Sovereign Owner account cannot be deleted." },
      { status: 403 }
    );
  }

  const { error: delAuthErr } = await adminClient.auth.admin.deleteUser(id);
  if (delAuthErr) {
    return NextResponse.json({ success: false, error: delAuthErr.message }, { status: 500 });
  }

  await adminClient.from("profiles").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
