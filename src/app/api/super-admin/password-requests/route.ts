import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  fallbackListAllRequests,
  fallbackReviewRequest,
  isMissingTableError,
} from "@/lib/password-request-store";

export const runtime = "nodejs";

/**
 * GET /api/super-admin/password-requests
 * Lists all password-change approval requests (Super Admin only).
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const db = createAdminClient() || (await createServerClient());
  if (!db) {
    const fallbackList = fallbackListAllRequests();
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      requests: fallbackList,
      pendingCount: fallbackList.filter((r) => r.status === "pending").length,
    });
  }

  try {
    const { data, error } = await db
      .from("password_change_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      if (isMissingTableError(error.message)) {
        const fallbackList = fallbackListAllRequests();
        return NextResponse.json({
          success: true,
          mode: "memory_fallback",
          requests: fallbackList,
          pendingCount: fallbackList.filter((r) => r.status === "pending").length,
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const now = Date.now();
    const normalized = (data || []).map((row) => {
      if (
        row.status === "approved" &&
        row.approved_until &&
        new Date(row.approved_until).getTime() < now
      ) {
        return { ...row, status: "expired" };
      }
      return row;
    });

    const pendingCount = normalized.filter((r) => r.status === "pending").length;
    return NextResponse.json({
      success: true,
      requests: normalized,
      pendingCount,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch requests.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/super-admin/password-requests
 * Approves (30-min unlock window) or rejects a user's password-change request.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  let payload: {
    id?: string;
    action?: "approve" | "reject";
    adminNote?: string;
    unlockMinutes?: number;
  };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  if (!payload.id || (payload.action !== "approve" && payload.action !== "reject")) {
    return NextResponse.json(
      { success: false, error: "Request id and valid action (approve|reject) are required." },
      { status: 400 }
    );
  }

  const unlockMinutes =
    typeof payload.unlockMinutes === "number" &&
    payload.unlockMinutes >= 5 &&
    payload.unlockMinutes <= 120
      ? payload.unlockMinutes
      : 30;

  const adminNote =
    typeof payload.adminNote === "string" ? payload.adminNote.trim().slice(0, 300) : "";

  const db = createAdminClient() || (await createServerClient());
  if (!db) {
    const updated = fallbackReviewRequest({
      id: payload.id,
      action: payload.action,
      adminNote,
      reviewedBy: auth.user.email,
      unlockMinutes,
    });
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      request: updated,
    });
  }

  const isApprove = payload.action === "approve";
  const nowIso = new Date().toISOString();
  const approvedUntil = isApprove
    ? new Date(Date.now() + unlockMinutes * 60 * 1000).toISOString()
    : null;

  try {
    const { data, error } = await db
      .from("password_change_requests")
      .update({
        status: isApprove ? "approved" : "rejected",
        approved_until: approvedUntil,
        admin_note: adminNote,
        reviewed_by: auth.user.email,
        reviewed_at: nowIso,
      })
      .eq("id", payload.id)
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        const updated = fallbackReviewRequest({
          id: payload.id,
          action: payload.action,
          adminNote,
          reviewedBy: auth.user.email,
          unlockMinutes,
        });
        return NextResponse.json({
          success: true,
          mode: "memory_fallback",
          request: updated,
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, request: data });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update request.",
      },
      { status: 500 }
    );
  }
}
