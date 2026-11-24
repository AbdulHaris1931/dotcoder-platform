import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export interface AuthenticatedServerUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  rollNo: string;
  department: string;
  collegeName: string;
  batchYear: number;
  accountStatus: string;
  isOwner: boolean;
  authSource: "supabase" | "demo";
}

export function isServerSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isAuthorizedOwnerIdentity(user: {
  id?: string | null;
  email?: string | null;
}): boolean {
  if (!user) return false;
  const configuredEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const configuredId = process.env.SUPER_ADMIN_USER_ID?.trim();

  if (configuredId && user.id && user.id === configuredId) {
    return true;
  }

  const userEmail = user.email?.trim().toLowerCase();
  if (configuredEmail && userEmail && userEmail === configuredEmail) {
    return true;
  }

  // Allow default local-demo owner identity ONLY when Supabase is not configured
  if (!isServerSupabaseConfigured()) {
    if (userEmail === "owner@eqlv.code" || user.id === "usr-super-admin-owner") {
      return true;
    }
  }

  return false;
}

/**
 * Authoritatively resolves the authenticated user on the server.
 *
 * SECURITY INVARIANT:
 * - When Supabase is configured: STRICTLY verifies JWT via `supabase.auth.getUser()`
 *   and reads role from `public.profiles` or server-only `app_metadata.role`
 *   (NEVER `user_metadata.role`, NEVER unsigned `eqlv_demo_user` cookie).
 * - When Supabase is NOT configured (Local Demo Mode): reads `eqlv_demo_user` cookie
 *   so zero-crash local demos remain functional.
 */
export async function getAuthenticatedServerUser(
  req?: NextRequest | Request
): Promise<AuthenticatedServerUser | null> {
  const supabaseConfigured = isServerSupabaseConfigured();

  if (supabaseConfigured) {
    try {
      const supabase = await createServerSupabase();
      if (!supabase) return null;

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Fetch authoritative role & profile from DB (server-enforced)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, roll_no, department, college_name, batch_year, account_status")
        .eq("id", user.id)
        .single();

      const accountStatus = String(profile?.account_status || "active").toLowerCase();
      if (accountStatus === "suspended" || accountStatus === "archived") {
        return null;
      }

      const isOwner = isAuthorizedOwnerIdentity({ id: user.id, email: user.email });
      const appMetaRole =
        typeof user.app_metadata?.role === "string"
          ? user.app_metadata.role.trim().toLowerCase()
          : null;
      const profileRole =
        typeof profile?.role === "string"
          ? profile.role.trim().toLowerCase()
          : null;

      const resolvedRole = isOwner
        ? "super_admin"
        : profileRole || appMetaRole || "student";

      return {
        id: user.id,
        email: (user.email || "").trim().toLowerCase(),
        fullName:
          profile?.full_name ||
          (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
          "Campus User",
        role: resolvedRole,
        rollNo: profile?.roll_no || "",
        department: profile?.department || "",
        collegeName: profile?.college_name || "",
        batchYear: Number(profile?.batch_year) || new Date().getFullYear(),
        accountStatus,
        isOwner,
        authSource: "supabase",
      };
    } catch (err) {
      console.warn("[ServerAuth] Failed to verify Supabase user:", err);
      return null;
    }
  }

  // Local Demo Mode ONLY (Supabase env vars are absent)
  try {
    let rawCookie: string | undefined;
    if (req && "cookies" in req && typeof req.cookies?.get === "function") {
      rawCookie = req.cookies.get("eqlv_demo_user")?.value;
    } else {
      const cookieStore = await cookies();
      rawCookie = cookieStore.get("eqlv_demo_user")?.value;
    }

    if (!rawCookie) return null;
    const parsed = JSON.parse(decodeURIComponent(rawCookie));
    if (!parsed || typeof parsed !== "object" || !parsed.id) {
      return null;
    }

    const isOwner = isAuthorizedOwnerIdentity({ id: parsed.id, email: parsed.email });
    const role = isOwner
      ? "super_admin"
      : String(parsed.role || "student").trim().toLowerCase();

    return {
      id: String(parsed.id),
      email: String(parsed.email || "").trim().toLowerCase(),
      fullName: String(parsed.full_name || "Demo User"),
      role,
      rollNo: String(parsed.roll_no || ""),
      department: String(parsed.department || ""),
      collegeName: String(parsed.college_name || ""),
      batchYear: Number(parsed.batch_year) || 2026,
      accountStatus: "active",
      isOwner,
      authSource: "demo",
    };
  } catch {
    return null;
  }
}

/**
 * Route Handler Guard for all /api/* endpoints.
 * Returns either the verified server user or a 401/403 NextResponse.
 */
export async function requireApiAuth(
  req: NextRequest | Request,
  options?: { allowedRoles?: string[] }
): Promise<
  | { user: AuthenticatedServerUser; errorResponse: null }
  | { user: null; errorResponse: NextResponse }
> {
  const user = await getAuthenticatedServerUser(req);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required. Please sign in through the EQLV CODE portal.",
        },
        { status: 401 }
      ),
    };
  }

  if (options?.allowedRoles && options.allowedRoles.length > 0 && !user.isOwner) {
    const allowed = options.allowedRoles.map((r) => r.toLowerCase());
    if (!allowed.includes(user.role.toLowerCase())) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: "Your role does not have permission to perform this action.",
          },
          { status: 403 }
        ),
      };
    }
  }

  return { user, errorResponse: null };
}
