/**
 * Converts Supabase auth cookie options into browser Session Cookies
 * (omitting `maxAge` and `expires`) so closing the browser automatically
 * signs the user out on shared lab machines.
 *
 * Preserves `maxAge: 0` / empty-value cookie deletions so explicit sign-out
 * always clears cookies cleanly.
 */
export function toSessionCookieOptions(
  value: string,
  options?: Record<string, unknown>
): Record<string, unknown> {
  const isDeletion =
    value === "" ||
    options?.maxAge === 0 ||
    (options?.expires instanceof Date && options.expires.getTime() <= 0);

  if (isDeletion) {
    return {
      path: "/",
      ...options,
      maxAge: 0,
    };
  }

  const next: Record<string, unknown> = {
    path: "/",
    sameSite: "lax",
    ...options,
  };
  delete next.maxAge;
  delete next.expires;
  return next;
}

export function parseBrowserCookies(): Array<{ name: string; value: string }> {
  if (typeof document === "undefined" || !document.cookie) {
    return [];
  }

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eqIdx = part.indexOf("=");
      if (eqIdx === -1) {
        return { name: part, value: "" };
      }
      const name = decodeURIComponent(part.slice(0, eqIdx).trim());
      const value = decodeURIComponent(part.slice(eqIdx + 1).trim());
      return { name, value };
    });
}

export function writeBrowserSessionCookie(
  name: string,
  value: string,
  options?: Record<string, unknown>
): void {
  if (typeof document === "undefined") return;

  const sessionOpts = toSessionCookieOptions(value, options);
  const parts: string[] = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
  ];

  const path = typeof sessionOpts.path === "string" ? sessionOpts.path : "/";
  parts.push(`path=${path}`);

  if (typeof sessionOpts.domain === "string" && sessionOpts.domain) {
    parts.push(`domain=${sessionOpts.domain}`);
  }

  if (typeof sessionOpts.maxAge === "number") {
    parts.push(`max-age=${sessionOpts.maxAge}`);
  }

  const sameSite =
    typeof sessionOpts.sameSite === "string" ? sessionOpts.sameSite : "lax";
  parts.push(`SameSite=${sameSite}`);

  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  if (sessionOpts.secure === true || isHttps) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}
