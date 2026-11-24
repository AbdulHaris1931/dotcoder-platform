/**
 * Single Source of Truth for Role-Based Access Control (RBAC) across
 * Edge Middleware (`src/middleware.ts`), Client AppShell (`src/components/shared/app-shell.tsx`),
 * and Command Palette (`src/components/shared/command-palette.tsx`).
 */

export type NormalizedRole =
  | "super_admin"
  | "teacher"
  | "tpo"
  | "recruiter"
  | "student";

export function normalizeRole(role?: string | null): NormalizedRole {
  const r = (role || "student").trim().toLowerCase();
  if (r === "super_admin") return "super_admin";
  if (r === "teacher" || r === "mentor") return "teacher";
  if (r === "tpo" || r === "admin") return "tpo";
  if (r === "recruiter") return "recruiter";
  return "student";
}

export function getRoleHomePath(role: NormalizedRole): string {
  switch (role) {
    case "super_admin":
      return "/super-admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "tpo":
      return "/tpo/dashboard";
    case "recruiter":
      return "/recruiter/dashboard";
    default:
      return "/student/dashboard";
  }
}

export function isAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  );
}

export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/verify/")
  );
}

/**
 * Authoritative route authorization matrix.
 * Returns true if `role` is permitted to access `pathname`.
 */
export function canRoleAccessPath(role: NormalizedRole, pathname: string): boolean {
  if (role === "super_admin") return true;
  if (isPublicPath(pathname) || isAuthPath(pathname)) return true;

  // Private Super Admin Enclave
  if (pathname.startsWith("/super-admin") || pathname.startsWith("/admin/users")) {
    return false;
  }

  // Teacher / Faculty Enclave
  if (pathname.startsWith("/teacher")) {
    return role === "teacher";
  }

  // TPO Placement Enclave
  if (
    pathname.startsWith("/tpo") ||
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/admin/drives")
  ) {
    return role === "tpo";
  }

  // Recruiter Portal
  if (pathname.startsWith("/recruiter")) {
    return role === "recruiter" || role === "tpo";
  }

  // Academic Authoring (Problem Bank & Assessment Admin)
  if (pathname.startsWith("/admin/problems") || pathname.startsWith("/admin/assessments")) {
    return role === "teacher" || role === "tpo";
  }

  // MNC 300 Prep and SQL Lab are shared with both Students and Faculty mentors
  if (
    pathname.startsWith("/student/mnc-prep") ||
    pathname.startsWith("/student/sql-lab")
  ) {
    return role === "student" || role === "teacher";
  }

  // Student Portal (Resume preview also permitted for Recruiters & TPOs)
  if (pathname.startsWith("/student/resume")) {
    return role === "student" || role === "recruiter" || role === "tpo";
  }

  if (pathname.startsWith("/student")) {
    return role === "student";
  }

  // Shared Learning Labs & Account Security
  if (
    pathname.startsWith("/curriculum") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/assessment") ||
    pathname.startsWith("/settings")
  ) {
    return true;
  }

  return true;
}
