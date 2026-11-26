import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_GOVERNANCE_CONFIG,
  getFallbackGovernance,
  isGovernanceTableMissing,
  setFallbackGovernance,
  type PlatformGovernanceConfig,
} from "@/lib/governance-store";

export const runtime = "nodejs";

function normalizeGovernanceRow(
  row: Record<string, unknown> | null | undefined
): PlatformGovernanceConfig {
  if (!row) return { ...DEFAULT_GOVERNANCE_CONFIG };
  const rawDepts = row.departments;
  const departments = Array.isArray(rawDepts)
    ? rawDepts.map((d) => String(d).trim()).filter(Boolean)
    : DEFAULT_GOVERNANCE_CONFIG.departments;

  const target = String(row.broadcast_target || "all");
  const severity = String(row.broadcast_severity || "info");

  return {
    college_name:
      typeof row.college_name === "string" && row.college_name.trim()
        ? row.college_name.trim()
        : DEFAULT_GOVERNANCE_CONFIG.college_name,
    active_batch_year:
      Number(row.active_batch_year) || DEFAULT_GOVERNANCE_CONFIG.active_batch_year,
    departments:
      departments.length > 0 ? departments : DEFAULT_GOVERNANCE_CONFIG.departments,
    ai_mentor_frozen: Boolean(row.ai_mentor_frozen),
    idle_timeout_minutes:
      Number(row.idle_timeout_minutes) >= 5 && Number(row.idle_timeout_minutes) <= 180
        ? Number(row.idle_timeout_minutes)
        : 30,
    broadcast_enabled: Boolean(row.broadcast_enabled),
    broadcast_message:
      typeof row.broadcast_message === "string" ? row.broadcast_message : "",
    broadcast_target:
      target === "student" || target === "teacher" || target === "tpo"
        ? target
        : "all",
    broadcast_severity:
      severity === "warning" || severity === "urgent" ? severity : "info",
    updated_by: typeof row.updated_by === "string" ? row.updated_by : null,
    updated_at:
      typeof row.updated_at === "string"
        ? row.updated_at
        : new Date().toISOString(),
  };
}

/**
 * GET /api/platform/governance
 * Returns active institutional governance settings (authenticated users).
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  const db = createAdminClient({ silent: true }) || (await createServerClient());
  if (!db) {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      config: getFallbackGovernance(),
    });
  }

  try {
    const { data, error } = await db
      .from("platform_governance")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      if (isGovernanceTableMissing(error.message)) {
        return NextResponse.json({
          success: true,
          mode: "memory_fallback",
          config: getFallbackGovernance(),
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config: normalizeGovernanceRow(data as Record<string, unknown> | null),
    });
  } catch {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      config: getFallbackGovernance(),
    });
  }
}

/**
 * PATCH /api/platform/governance
 * Persists institutional governance controls (Super Admin only).
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  let body: Partial<PlatformGovernanceConfig>;
  try {
    body = (await req.json()) as Partial<PlatformGovernanceConfig>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const sanitized = normalizeGovernanceRow({
    ...getFallbackGovernance(),
    ...body,
    updated_by: auth.user.email,
    updated_at: new Date().toISOString(),
  } as unknown as Record<string, unknown>);

  // Always update in-memory mirror for instant zero-crash consistency
  setFallbackGovernance(sanitized);

  const db = createAdminClient({ silent: true }) || (await createServerClient());
  if (!db) {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      config: sanitized,
    });
  }

  try {
    const { data, error } = await db
      .from("platform_governance")
      .upsert(
        {
          id: "default",
          ...sanitized,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error) {
      if (isGovernanceTableMissing(error.message)) {
        return NextResponse.json({
          success: true,
          mode: "memory_fallback",
          config: sanitized,
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config: normalizeGovernanceRow(data as Record<string, unknown>),
    });
  } catch {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      config: sanitized,
    });
  }
}
