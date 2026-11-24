import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  addFallbackRevokedCredential,
  getFallbackRevokedCredentials,
  isGovernanceTableMissing,
  removeFallbackRevokedCredential,
} from "@/lib/governance-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const db = createAdminClient() || (await createServerClient());
  if (!db) {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      revoked: getFallbackRevokedCredentials(),
    });
  }

  try {
    const { data, error } = await db
      .from("revoked_credentials")
      .select("*")
      .order("revoked_at", { ascending: false });

    if (error) {
      if (isGovernanceTableMissing(error.message)) {
        return NextResponse.json({
          success: true,
          mode: "memory_fallback",
          revoked: getFallbackRevokedCredentials(),
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, revoked: data || [] });
  } catch {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      revoked: getFallbackRevokedCredentials(),
    });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  let body: { credentialHash?: string; reason?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const hash = typeof body.credentialHash === "string" ? body.credentialHash.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : "";

  if (!hash) {
    return NextResponse.json(
      { success: false, error: "Credential hash is required." },
      { status: 400 }
    );
  }

  const record = {
    credential_hash: hash,
    reason: reason || "Revoked by Super Admin integrity review",
    revoked_by: auth.user.email,
    revoked_at: new Date().toISOString(),
  };

  addFallbackRevokedCredential(record);

  const db = createAdminClient() || (await createServerClient());
  if (!db) {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      record,
    });
  }

  try {
    const { error } = await db
      .from("revoked_credentials")
      .upsert(record, { onConflict: "credential_hash" });

    if (error && !isGovernanceTableMissing(error.message)) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: true,
      mode: "memory_fallback",
      record,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth(req, { allowedRoles: ["super_admin"] });
  if (auth.errorResponse) return auth.errorResponse;

  const hash = req.nextUrl.searchParams.get("hash")?.trim() || "";
  if (!hash) {
    return NextResponse.json(
      { success: false, error: "Query param ?hash= is required." },
      { status: 400 }
    );
  }

  removeFallbackRevokedCredential(hash);

  const db = createAdminClient() || (await createServerClient());
  if (!db) {
    return NextResponse.json({ success: true, mode: "memory_fallback" });
  }

  try {
    const { error } = await db
      .from("revoked_credentials")
      .delete()
      .eq("credential_hash", hash);

    if (error && !isGovernanceTableMissing(error.message)) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true, mode: "memory_fallback" });
  }
}
