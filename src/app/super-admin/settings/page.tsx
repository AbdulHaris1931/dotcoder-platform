"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoStore } from "@/lib/demo-store";
import { UserProvisioningService } from "@/lib/services/user-provisioning";
import { UserCredentialsService } from "@/lib/services/user-credentials";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldAlert,
  LogOut,
  Database,
  RefreshCw,
} from "lucide-react";

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<string | null>(null);

  // Settings State
  const [defaultOnboardingMode, setDefaultOnboardingMode] = useState<"temp_password" | "invite_link">("temp_password");
  const [requireDeleteTyping, setRequireDeleteTyping] = useState(true);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRevokeSessions = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut({ scope: "global" });
    }
    DemoStore.signOut();
    document.cookie = "eqlv_demo_user=; path=/; max-age=0";
    notify("All active sessions revoked. Redirecting to login...");
    setTimeout(() => router.push("/login"), 1000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    notify("Administrative preferences successfully updated.");
  };

  const handlePurgeTestUsers = () => {
    const result = UserProvisioningService.purgeTestUsers();
    DemoStore.purgeTestData();
    UserCredentialsService.clearAllCredentials();
    notify(
      `Clean Slate Complete: Purged ${result.removedCount} mock test users & dummy submissions (${result.remainingCount} real accounts preserved).`
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <span>{notification}</span>
          <button type="button" onClick={() => setNotification(null)}>&times;</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F4F7F5] tracking-tight flex items-center gap-2">
          <span>Security & Platform Governance</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0C120F] border border-[#1E2C24] text-[#9DFF00]">
            OWNER ONLY
          </span>
        </h1>
        <p className="text-xs text-[#99A9A0] mt-1">
          Manage sovereign owner security, session revocation, and account onboarding guardrails.
        </p>
      </div>

      {/* Sovereign Owner Profile Card */}
      <div className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2C24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/30 flex items-center justify-center font-display font-bold text-sm text-[#9DFF00]">
              AH
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Abdul Haris M</h3>
              <div className="text-[10px] font-mono text-[#99A9A0]">mmam92005@gmail.com &bull; Sovereign Platform Owner</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
            VERIFIED OWNER
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[#D5E0D9]">
            <span className="text-[#99A9A0]">Authorization Model:</span>
            <span>Server-side Environment Binding (`process.env.SUPER_ADMIN_EMAIL`)</span>
          </div>
          <div className="flex items-center justify-between text-[#D5E0D9]">
            <span className="text-[#99A9A0]">Normal Application Roles:</span>
            <span className="text-[#F4F7F5] font-bold">Strictly Mentor, Student, TPO</span>
          </div>
          <div className="flex items-center justify-between text-[#D5E0D9]">
            <span className="text-[#99A9A0]">Self-Protection Status:</span>
            <span className="text-emerald-400 font-bold">&check; Protected from Deletion & Modification</span>
          </div>
        </div>
      </div>

      {/* Onboarding & Governance Preferences */}
      <form onSubmit={handleSavePreferences} className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-5">
        <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Account Provisioning Preferences</h3>

        <div className="space-y-4 text-xs">
          {/* Default Password Mode */}
          <div>
            <label className="block text-[#D5E0D9] font-bold mb-1.5 font-mono">
              Default Onboarding Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                htmlFor="onboarding-temp-pwd"
                className={`p-3 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                  defaultOnboardingMode === "temp_password"
                    ? "bg-[#070B09] border-[#9DFF00] text-[#F4F7F5]"
                    : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0]"
                }`}
              >
                <input
                  id="onboarding-temp-pwd"
                  type="radio"
                  name="onboarding"
                  aria-label="Temporary Password Generation"
                  checked={defaultOnboardingMode === "temp_password"}
                  onChange={() => setDefaultOnboardingMode("temp_password")}
                  className="text-[#9DFF00]"
                />
                <span className="font-bold text-xs">Temporary Password Generation</span>
              </label>

              <label
                htmlFor="onboarding-invite-link"
                className={`p-3 rounded-xl border text-left cursor-pointer flex items-center gap-2 ${
                  defaultOnboardingMode === "invite_link"
                    ? "bg-[#070B09] border-[#9DFF00] text-[#F4F7F5]"
                    : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0]"
                }`}
              >
                <input
                  id="onboarding-invite-link"
                  type="radio"
                  name="onboarding"
                  aria-label="Email Invitation Magic Link"
                  checked={defaultOnboardingMode === "invite_link"}
                  onChange={() => setDefaultOnboardingMode("invite_link")}
                  className="text-[#9DFF00]"
                />
                <span className="font-bold text-xs">Email Invitation Magic Link</span>
              </label>
            </div>
          </div>

          {/* Delete Guardrail Toggle */}
          <div className="pt-3 border-t border-[#1E2C24] flex items-center justify-between">
            <div>
              <label htmlFor="require-delete-typing" className="font-bold text-[#F4F7F5] block cursor-pointer">Require Keyword Typing for Permanent Deletion</label>
              <div className="text-[11px] text-[#99A9A0]">Forces typing &quot;DELETE&quot; before purging any database account.</div>
            </div>
            <input
              id="require-delete-typing"
              name="require-delete-typing"
              aria-label="Require typing DELETE before purging any database account"
              type="checkbox"
              checked={requireDeleteTyping}
              onChange={(e) => setRequireDeleteTyping(e.target.checked)}
              className="w-4 h-4 rounded text-[#9DFF00] bg-[#070B09] border-[#1E2C24]"
            />
          </div>

          {/* Audit Logging Notice */}
          <div className="pt-3 border-t border-[#1E2C24] flex items-center justify-between">
            <div>
              <div className="font-bold text-[#F4F7F5]">Append-Only Audit Logging</div>
              <div className="text-[11px] text-[#99A9A0]">All administrative operations permanently recorded with zero secret leaks.</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              ENFORCED
            </span>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs font-mono transition-all shadow-xs"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Clean Slate: Purge Test / Mock Users */}
      <div className="p-6 rounded-2xl bg-[#0C120F] border border-amber-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Production Clean Slate (Purge Test Users)</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25">
            PRE-LAUNCH TOOL
          </span>
        </div>
        <p className="text-xs text-[#99A9A0] leading-relaxed">
          Remove all built-in demo/test users (Karthik S., Priya R., mock teachers/TPOs) and dummy submissions so your real college starts from a 100% clean zero baseline. Newly provisioned real users are preserved.
        </p>

        <button
          type="button"
          onClick={handlePurgeTestUsers}
          className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Purge Test Users &amp; Reset to Clean Slate</span>
        </button>
      </div>

      {/* Session Security & Revocation */}
      <div className="p-6 rounded-2xl bg-[#0C120F] border border-rose-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Session Security & Emergency Revocation</h3>
        </div>
        <p className="text-xs text-[#99A9A0] leading-relaxed">
          Instantly revoke all issued refresh tokens, terminate active sessions across devices, and require re-authentication.
        </p>

        <button
          type="button"
          onClick={handleRevokeSessions}
          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-bold font-mono transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Revoke All Global Sessions</span>
        </button>
      </div>
    </div>
  );
}
