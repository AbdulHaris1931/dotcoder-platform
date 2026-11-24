import { redirect } from "next/navigation";
import {
  getAuthenticatedServerUser,
  isAuthorizedOwnerIdentity,
} from "@/lib/auth/server-auth";

export interface SuperAdminSession {
  id: string;
  email: string;
  fullName: string;
  isOwner: true;
}

/**
 * Returns the configured sovereign Super Admin owner email from server configuration.
 */
export function getSuperAdminOwnerEmail(): string {
  return (process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
}

/**
 * Checks if a given user object or email matches the authorized platform owner.
 */
export function isAuthorizedOwner(
  user: { id?: string; email?: string } | null | undefined
): boolean {
  return isAuthorizedOwnerIdentity(user ?? {});
}

/**
 * Server-side authorization check.
 * Uses authoritative Supabase JWT + profiles when Supabase is configured,
 * and allows Local Demo Mode cookie strictly when Supabase is unconfigured.
 */
export async function getSuperAdminSession(): Promise<SuperAdminSession | null> {
  const user = await getAuthenticatedServerUser();
  if (!user || !user.isOwner) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || getSuperAdminOwnerEmail(),
    fullName: user.fullName || process.env.SUPER_ADMIN_NAME || "Platform Owner",
    isOwner: true,
  };
}

/**
 * Server Component Gate.
 * Enforces owner-only access. Redirects unauthorized visitors to /login.
 */
export async function requireSuperAdmin(): Promise<SuperAdminSession> {
  const session = await getSuperAdminSession();
  if (!session) {
    redirect("/login?unauthorized=true");
  }
  return session;
}
