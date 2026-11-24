import { createClient } from "@/lib/supabase/client";
import { DemoStore } from "@/lib/demo-store";

/**
 * Centralized, clean sign-out helper used by AppShell and SuperAdminLayout.
 * Clears Supabase session, local demo store, and legacy demo cookie before navigating.
 */
export async function performSignOut(
  navigate: (url: string) => void
): Promise<void> {
  try {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    // Always proceed with local cleanup even if network signOut fails
  }

  DemoStore.signOut();

  if (typeof document !== "undefined") {
    document.cookie = "eqlv_demo_user=; path=/; max-age=0; SameSite=Lax";
  }

  navigate("/login?logout=1");
}
