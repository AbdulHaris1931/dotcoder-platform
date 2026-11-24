import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { toSessionCookieOptions } from "@/lib/supabase/cookie-options";
import {
  checkRateLimitDistributed,
  RATE_LIMIT_PRESETS,
  rateLimitExceededResponse,
  getRateLimitHeaders,
  getClientIp,
} from "@/lib/rate-limiter";
import {
  canRoleAccessPath,
  getRoleHomePath,
  isAuthPath,
  isPublicPath,
  normalizeRole,
} from "@/lib/auth/rbac-routes";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Static assets and Next.js build internals bypass middleware checks
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

  // 2. Global Perimeter Rate Limiting for all /api/ requests (Engineered for 300+ Concurrent Students)
  // SECURITY: Never trust unsigned client cookies for role exemptions or identity when Supabase is configured.
  if (pathname.startsWith("/api/")) {
    const clientIp = getClientIp(request);

    // Individual API routes enforce strict per-verified-user rate limits after verifying JWT.
    // Middleware enforces the shared Campus NAT perimeter cap (3,000 req/min per IP) with zero cookie bypass.
    const rateResult = await checkRateLimitDistributed({
      key: `campus_nat:${clientIp}`,
      config: RATE_LIMIT_PRESETS.GLOBAL_CAMPUS_NAT_IP,
    });

    if (!rateResult.allowed) {
      return rateLimitExceededResponse(
        rateResult,
        `Rate limit exceeded. Please wait ${rateResult.retryAfterSeconds} seconds.`
      );
    }

    return NextResponse.next({
      headers: getRateLimitHeaders(rateResult),
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  let userEmail: string | null = null;
  let userId: string | null = null;
  let userRole: string | null = null;
  let isOwner = false;

  const ownerEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || null;
  const ownerId = process.env.SUPER_ADMIN_USER_ID?.trim() || null;

  // 3. Authoritative Session Resolution
  if (isSupabaseEnabled && supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              toSessionCookieOptions(value, options)
            )
          );
        },
      },
    });

    try {
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser();

      if (sbUser) {
        userEmail = sbUser.email ? sbUser.email.trim().toLowerCase() : null;
        userId = sbUser.id;

        // Read role strictly from server-controlled app_metadata or public.profiles
        // NEVER trust user_metadata.role (users can modify their own user_metadata)
        const appMetaRole =
          typeof sbUser.app_metadata?.role === "string"
            ? sbUser.app_metadata.role.trim().toLowerCase()
            : null;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, account_status")
          .eq("id", sbUser.id)
          .single();

        const status = String(profile?.account_status || "active").toLowerCase();
        if (status === "suspended" || status === "archived") {
          // Block suspended/archived accounts from protected portals
          userEmail = null;
          userId = null;
          userRole = null;
        } else {
          userRole =
            (typeof profile?.role === "string"
              ? profile.role.trim().toLowerCase()
              : null) ||
            appMetaRole ||
            "student";
        }
      }
    } catch {
      // Fail closed when Supabase verification fails
    }
  } else {
    // Local Demo Mode ONLY (when Supabase environment variables are absent)
    const demoCookie = request.cookies.get("eqlv_demo_user")?.value;
    if (demoCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(demoCookie));
        if (parsed && typeof parsed === "object" && parsed.id) {
          if (parsed.email) userEmail = String(parsed.email).trim().toLowerCase();
          userId = String(parsed.id);
          if (parsed.role) userRole = String(parsed.role).trim().toLowerCase();
        }
      } catch {
        // Ignored if cookie format is non-JSON
      }
    }
  }

  // Resolve sovereign Super Admin platform owner strictly via env bindings (or demo owner only in Local Demo Mode)
  const isOwnerEmail = Boolean(
    userEmail &&
      ((ownerEmail && userEmail === ownerEmail) ||
        (!isSupabaseEnabled && userEmail === "owner@eqlv.code"))
  );
  const isOwnerId = Boolean(
    userId &&
      ((ownerId && userId === ownerId) ||
        (!isSupabaseEnabled && userId === "usr-super-admin-owner"))
  );

  if (isOwnerEmail || isOwnerId || userRole === "super_admin") {
    isOwner = true;
    userRole = "super_admin";
  }

  const isAuthenticated = Boolean(userId && userRole);

  const redirect = (targetUrl: string) => {
    const url = request.nextUrl.clone();
    const parts = targetUrl.split("?");
    url.pathname = parts[0];
    url.search = parts[1] ? `?${parts[1]}` : "";
    return NextResponse.redirect(url);
  };

  // Public Self-Registration is Disabled (Accounts provisioned exclusively by Super Admin)
  if (pathname === "/signup") {
    return redirect("/login?notice=registration_restricted");
  }

  // Public & Legal routes
  const isAuthPage = isAuthPath(pathname);
  const isPublicRoute = isPublicPath(pathname);

  if (isAuthPage) {
    if (
      isAuthenticated &&
      !request.nextUrl.searchParams.has("logout") &&
      !request.nextUrl.searchParams.has("switch")
    ) {
      const normalized = isOwner ? "super_admin" : normalizeRole(userRole);
      return redirect(getRoleHomePath(normalized));
    }
    return supabaseResponse;
  }

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Legacy route alias redirect
  if (pathname.startsWith("/admin/drives")) {
    return redirect("/tpo/drives");
  }

  // 4. Unified RBAC Enforcement Matrix (Single Source of Truth: rbac-routes.ts)
  const isProtectedRoute =
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/tpo") ||
    pathname.startsWith("/recruiter") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/curriculum") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/assessment") ||
    pathname.startsWith("/settings");

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    const normalized = isOwner ? "super_admin" : normalizeRole(userRole);
    if (!canRoleAccessPath(normalized, pathname)) {
      return redirect(`${getRoleHomePath(normalized)}?error=access_denied`);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
