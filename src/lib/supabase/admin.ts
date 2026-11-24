import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-Side Supabase Admin Client
 *
 * Uses the Supabase SERVICE_ROLE key strictly for privileged server operations
 * (provisioning auth users, triggering password resets, reading audit logs).
 *
 * NEVER falls back to the public ANON key (which would silently fail under RLS).
 * NEVER import this file in client components ("use client").
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    if (supabaseUrl && !serviceRoleKey) {
      console.warn(
        "[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is missing. Privileged server admin operations are unavailable."
      );
    }
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isAdminClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
