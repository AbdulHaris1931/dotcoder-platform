import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireApiAuth } from "@/lib/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { generateSecureTempPassword } from "@/lib/auth/password-utils";

export const runtime = "nodejs";

interface ProvisionUserRequest {
  fullName: string;
  email: string;
  role: "student" | "teacher" | "tpo" | "mentor";
  department?: string;
  rollNo?: string;
  batchYear?: number;
  collegeName?: string;
  password?: string;
  sendWelcomeEmail?: boolean;
}

interface BatchProvisionPayload {
  users: ProvisionUserRequest[];
}

/**
 * GET /api/super-admin/users
 * Lists all real users from `public.profiles` (Super Admin only).
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const adminClient = createAdminClient();
  const dbClient = adminClient || (await createServerClient());
  if (!dbClient) {
    return NextResponse.json({
      success: true,
      mode: "local_demo_fallback",
      users: [],
    });
  }

  try {
    const { data, error } = await dbClient
      .from("profiles")
      .select("*")
      .neq("role", "super_admin")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const users = (data || []).map((p) => ({
      id: p.id,
      email: p.email || "",
      full_name: p.full_name || "Campus User",
      role: p.role || "student",
      college_name: p.college_name || "",
      roll_no: p.roll_no || "",
      department: p.department || "",
      batch_year: Number(p.batch_year) || new Date().getFullYear(),
      readiness_score: Number(p.readiness_score) || 0,
      problems_solved: Number(p.problems_solved) || 0,
      account_status: p.account_status || "active",
      created_at: p.created_at,
      last_sign_in_at: p.updated_at || p.created_at,
    }));

    return NextResponse.json({ success: true, mode: "live_supabase", users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list users";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/super-admin/users
 * Supports BOTH single user provisioning AND batch CSV bulk provisioning (`{ users: [...] }`).
 * Creates real Supabase Auth accounts (server-locked `app_metadata.role`) + `public.profiles` rows.
 */
export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const rawBody = (await req.json()) as ProvisionUserRequest | BatchProvisionPayload;

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        {
          success: false,
          mode: "local_demo_fallback",
          error:
            "SUPABASE_SERVICE_ROLE_KEY is not configured on the server. Provisioning saved in local demo mode only.",
        },
        { status: 503 }
      );
    }

    // ---- BATCH MODE (AI CSV BULK IMPORT) ----
    if ("users" in rawBody && Array.isArray(rawBody.users)) {
      const batch = rawBody.users.slice(0, 500);
      if (batch.length === 0) {
        return NextResponse.json({ success: false, error: "User batch is empty." }, { status: 400 });
      }

      const { data: existingProfiles } = await adminClient
        .from("profiles")
        .select("email, roll_no");
      const existingEmails = new Set(
        (existingProfiles || [])
          .map((p) => (p.email ? String(p.email).toLowerCase().trim() : ""))
          .filter(Boolean)
      );
      const existingRolls = new Set(
        (existingProfiles || [])
          .map((p) => (p.roll_no ? String(p.roll_no).toUpperCase().trim() : ""))
          .filter(Boolean)
      );

      let imported = 0;
      let skipped = 0;
      const provisionedCredentials: Array<{
        id: string;
        full_name: string;
        email: string;
        roll_no: string;
        department: string;
        temp_password: string;
      }> = [];
      const errors: Array<{ email: string; reason: string }> = [];

      // Process in controlled chunks of 8 to respect Supabase Auth admin rate limits
      const CHUNK_SIZE = 8;
      for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
        const chunk = batch.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map(async (item) => {
            const email = item.email?.trim().toLowerCase();
            const fullName = item.fullName?.trim();
            const rollNo = item.rollNo?.trim() || "";
            const normalizedRole = item.role === "mentor" ? "teacher" : item.role || "student";

            if (!email || !fullName) {
              skipped++;
              return;
            }
            if (
              existingEmails.has(email) ||
              (rollNo && existingRolls.has(rollNo.toUpperCase()))
            ) {
              skipped++;
              return;
            }

            existingEmails.add(email);
            if (rollNo) existingRolls.add(rollNo.toUpperCase());

            const tempPassword = item.password?.trim() || generateSecureTempPassword(12);
            const { data: createdAuth, error: authErr } = await adminClient.auth.admin.createUser({
              email,
              password: tempPassword,
              email_confirm: true,
              app_metadata: { role: normalizedRole },
              user_metadata: { full_name: fullName },
            });

            if (authErr || !createdAuth?.user) {
              if (authErr?.message?.toLowerCase().includes("already")) {
                skipped++;
              } else {
                errors.push({ email, reason: authErr?.message || "Auth creation failed" });
              }
              return;
            }

            const { error: profErr } = await adminClient.from("profiles").upsert({
              id: createdAuth.user.id,
              email,
              full_name: fullName,
              role: normalizedRole,
              department: item.department || "",
              roll_no: rollNo,
              batch_year: Number(item.batchYear) || new Date().getFullYear(),
              college_name: item.collegeName || "",
              readiness_score: 0,
              problems_solved: 0,
              account_status: "active",
            });

            if (profErr) {
              await adminClient.auth.admin.deleteUser(createdAuth.user.id).catch(() => {});
              errors.push({ email, reason: profErr.message });
              return;
            }

            imported++;
            provisionedCredentials.push({
              id: createdAuth.user.id,
              full_name: fullName,
              email,
              roll_no: rollNo,
              department: item.department || "",
              temp_password: tempPassword,
            });
          })
        );
      }

      return NextResponse.json({
        success: true,
        imported,
        skipped,
        total: batch.length,
        credentials: provisionedCredentials,
        errors,
      });
    }

    // ---- SINGLE USER MODE ----
    const body = rawBody as ProvisionUserRequest;
    const email = body.email?.trim().toLowerCase();
    const fullName = body.fullName?.trim();
    const password = body.password?.trim() || generateSecureTempPassword(12);
    const normalizedRole = body.role === "mentor" ? "teacher" : body.role;

    if (!email || !fullName || !normalizedRole) {
      return NextResponse.json(
        { success: false, error: "fullName, email, and role are required." },
        { status: 400 }
      );
    }

    const { data: createdAuth, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: normalizedRole },
      user_metadata: { full_name: fullName },
    });

    if (authError || !createdAuth?.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || "Failed to create Supabase Auth user." },
        { status: 400 }
      );
    }

    const userId = createdAuth.user.id;

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      role: normalizedRole,
      department: body.department || "",
      roll_no: body.rollNo || "",
      batch_year: Number(body.batchYear) || new Date().getFullYear(),
      college_name: body.collegeName || "",
      readiness_score: 0,
      problems_solved: 0,
      account_status: "active",
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(userId).catch(() => {});
      return NextResponse.json(
        { success: false, error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    let emailSent = false;
    if (body.sendWelcomeEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "EQLV CODE <onboarding@eqlv.code>",
          to: email,
          subject: "Welcome to EQLV CODE - Your Institutional Portal Account",
          text: [
            `Hello ${fullName},`,
            "",
            `Your EQLV CODE ${normalizedRole.toUpperCase()} account has been provisioned.`,
            `Email: ${email}`,
            `Temporary Password: ${password}`,
            "",
            "Please sign in via Portal Login and update your password after first login.",
          ].join("\n"),
        });
        emailSent = true;
      } catch (mailErr) {
        console.warn("[SuperAdmin Provision] Welcome email dispatch failed:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        full_name: fullName,
        role: normalizedRole,
        department: body.department || "",
        roll_no: body.rollNo || "",
        batch_year: Number(body.batchYear) || new Date().getFullYear(),
        college_name: body.collegeName || "",
        readiness_score: 0,
        problems_solved: 0,
        account_status: "active",
        created_at: new Date().toISOString(),
      },
      emailSent,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "User provisioning error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
