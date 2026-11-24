import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";

export const runtime = "nodejs";

/**
 * GET /api/super-admin/health
 * Reports live infrastructure & integration readiness (booleans only, zero secrets).
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const upstashConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const externalCompilerConfigured = Boolean(
    process.env.ONLINECOMPILER_API_KEY || process.env.JUDGE0_API_URL
  );

  return NextResponse.json({
    success: true,
    health: {
      supabaseConfigured,
      serviceRoleConfigured,
      geminiConfigured,
      upstashConfigured,
      resendConfigured,
      externalCompilerConfigured,
      pythonWasmEnabled: true,
      sqlWasmEnabled: true,
      checkedAt: new Date().toISOString(),
    },
  });
}
