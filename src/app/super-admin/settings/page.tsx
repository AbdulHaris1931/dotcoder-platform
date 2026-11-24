"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DemoStore } from "@/lib/demo-store";
import { UserProvisioningService } from "@/lib/services/user-provisioning";
import { UserCredentialsService } from "@/lib/services/user-credentials";
import { DataService } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";
import {
  DEFAULT_GOVERNANCE_CONFIG,
  type PlatformGovernanceConfig,
  type RevokedCredentialRecord,
} from "@/lib/governance-store";
import {
  ShieldAlert,
  LogOut,
  Database,
  RefreshCw,
  Activity,
  Megaphone,
  Building2,
  Ban,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

interface HealthSnapshot {
  supabaseConfigured: boolean;
  serviceRoleConfigured: boolean;
  geminiConfigured: boolean;
  upstashConfigured: boolean;
  resendConfigured: boolean;
  externalCompilerConfigured: boolean;
  pythonWasmEnabled: boolean;
  sqlWasmEnabled: boolean;
  checkedAt: string;
}

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("Platform Owner");
  const [ownerEmail, setOwnerEmail] = useState("owner@eqlv.edu.in");

  // Persisted Governance State
  const [config, setConfig] = useState<PlatformGovernanceConfig>(
    DEFAULT_GOVERNANCE_CONFIG
  );
  const [departmentsText, setDepartmentsText] = useState(
    DEFAULT_GOVERNANCE_CONFIG.departments.join(", ")
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Live System Health
  const [health, setHealth] = useState<HealthSnapshot | null>(null);

  // Credential Revocation Registry
  const [revokedList, setRevokedList] = useState<RevokedCredentialRecord[]>([]);
  const [revokeHashInput, setRevokeHashInput] = useState("");
  const [revokeReasonInput, setRevokeReasonInput] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAll = useCallback(async () => {
    DataService.getCurrentUser()
      .then((u) => {
        if (u?.full_name) setOwnerName(u.full_name);
        if (u?.email) setOwnerEmail(u.email);
      })
      .catch(() => {});

    try {
      const [govRes, healthRes, credRes] = await Promise.all([
        fetch("/api/platform/governance", { cache: "no-store" }),
        fetch("/api/super-admin/health", { cache: "no-store" }),
        fetch("/api/super-admin/credentials", { cache: "no-store" }),
      ]);

      if (govRes.ok) {
        const gData = (await govRes.json()) as {
          success?: boolean;
          config?: PlatformGovernanceConfig;
        };
        if (gData.success && gData.config) {
          setConfig(gData.config);
          setDepartmentsText(gData.config.departments.join(", "));
        }
      }

      if (healthRes.ok) {
        const hData = (await healthRes.json()) as {
          success?: boolean;
          health?: HealthSnapshot;
        };
        if (hData.success && hData.health) {
          setHealth(hData.health);
        }
      }

      if (credRes.ok) {
        const cData = (await credRes.json()) as {
          success?: boolean;
          revoked?: RevokedCredentialRecord[];
        };
        if (cData.success && Array.isArray(cData.revoked)) {
          setRevokedList(cData.revoked);
        }
      }
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveGovernance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const parsedDepts = departmentsText
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      const payload: PlatformGovernanceConfig = {
        ...config,
        departments:
          parsedDepts.length > 0
            ? parsedDepts
            : DEFAULT_GOVERNANCE_CONFIG.departments,
      };
      const res = await fetch("/api/platform/governance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        success?: boolean;
        config?: PlatformGovernanceConfig;
        error?: string;
      };
      if (!res.ok || !data.success) {
        notify(data.error || "Failed to save governance settings.");
      } else {
        if (data.config) setConfig(data.config);
        notify("Platform governance controls saved and active across portals.");
      }
    } catch {
      notify("Network error while saving settings.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleRevokeCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeHashInput.trim()) return;
    setIsRevoking(true);
    try {
      const res = await fetch("/api/super-admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialHash: revokeHashInput.trim(),
          reason: revokeReasonInput.trim(),
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        record?: RevokedCredentialRecord;
        error?: string;
      };
      if (res.ok && data.success && data.record) {
        setRevokedList((prev) => [
          data.record as RevokedCredentialRecord,
          ...prev.filter(
            (r) =>
              r.credential_hash.toLowerCase() !==
              data.record?.credential_hash.toLowerCase()
          ),
        ]);
        setRevokeHashInput("");
        setRevokeReasonInput("");
        notify("Credential hash revoked cleanly.");
      } else {
        notify(data.error || "Could not revoke credential.");
      }
    } catch {
      notify("Network error while revoking credential.");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRestoreCredential = async (hash: string) => {
    try {
      const res = await fetch(
        `/api/super-admin/credentials?hash=${encodeURIComponent(hash)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setRevokedList((prev) =>
          prev.filter((r) => r.credential_hash !== hash)
        );
        notify(`Restored credential ${hash}.`);
      }
    } catch {
      notify("Failed to restore credential.");
    }
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

  const handlePurgeTestUsers = () => {
    const result = UserProvisioningService.purgeTestUsers();
    DemoStore.purgeTestData();
    UserCredentialsService.clearAllCredentials();
    notify(
      `Clean Slate Complete: Purged ${result.removedCount} mock test users & dummy submissions (${result.remainingCount} real accounts preserved).`
    );
  };

  const ownerInitials =
    ownerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("") || "SA";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Dismiss notification"
            className="min-w-[24px] min-h-[24px] inline-flex items-center justify-center cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F4F7F5] tracking-tight flex items-center gap-2">
          <span>Security &amp; Platform Governance</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0C120F] border border-[#1E2C24] text-[#9DFF00]">
            OWNER ONLY
          </span>
        </h1>
        <p className="text-xs text-[#99A9A0] mt-1">
          Live system health, institutional settings, campus broadcast banners, credential revocation, and session controls.
        </p>
      </div>

      {/* Dynamic Sovereign Owner Profile */}
      <div className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2C24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/30 flex items-center justify-center font-display font-bold text-sm text-[#9DFF00]">
              {ownerInitials}
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-[#F4F7F5]">
                {ownerName}
              </h2>
              <div className="text-[10px] font-mono text-[#99A9A0]">
                {ownerEmail} &bull; Sovereign Platform Owner
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
            VERIFIED OWNER
          </span>
        </div>

        {/* Live System Health Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D5E0D9]">
              <Activity className="w-4 h-4 text-[#9DFF00]" />
              <span>Live System Health &amp; Integrations</span>
            </div>
            <button
              type="button"
              onClick={loadAll}
              className="inline-flex items-center gap-1 min-h-[28px] px-2.5 py-1 rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-[11px] font-mono text-[#99A9A0] hover:text-[#F4F7F5] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            {[
              {
                label: "Supabase Cloud",
                ok: Boolean(health?.supabaseConfigured),
                okText: "LIVE",
                warnText: "DEMO",
              },
              {
                label: "Service Role Key",
                ok: Boolean(health?.serviceRoleConfigured),
                okText: "CONFIGURED",
                warnText: "MISSING",
              },
              {
                label: "Gemini AI Engine",
                ok: Boolean(health?.geminiConfigured),
                okText: "READY",
                warnText: "NOT SET",
              },
              {
                label: "Rate Limiter",
                ok: Boolean(health?.upstashConfigured),
                okText: "UPSTASH REDIS",
                warnText: "IN-MEMORY",
              },
              {
                label: "Resend Email",
                ok: Boolean(health?.resendConfigured),
                okText: "READY",
                warnText: "OPTIONAL",
              },
              {
                label: "Python + SQL WASM",
                ok: true,
                okText: "CLIENT $0",
                warnText: "OFF",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] flex items-center justify-between gap-2"
              >
                <span className="text-[11px] text-[#99A9A0] truncate">
                  {item.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    item.ok
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {item.ok ? item.okText : item.warnText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persisted Platform Governance Form */}
      <form
        onSubmit={handleSaveGovernance}
        className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-6"
      >
        {/* Institution & Batch */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-display font-bold text-[#F4F7F5]">
            <Building2 className="w-4 h-4 text-[#9DFF00]" />
            <span>Institution &amp; Cohort Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="gov-college-name"
                className="block font-mono text-[#99A9A0]"
              >
                College / Institution Name
              </label>
              <input
                id="gov-college-name"
                type="text"
                value={config.college_name}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, college_name: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="gov-batch-year"
                className="block font-mono text-[#99A9A0]"
              >
                Active Batch Year
              </label>
              <input
                id="gov-batch-year"
                type="number"
                min={2024}
                max={2035}
                value={config.active_batch_year}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    active_batch_year: Number(e.target.value) || 2026,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] font-mono focus:outline-none focus:border-[#9DFF00]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="gov-depts"
                className="block font-mono text-[#99A9A0]"
              >
                Departments (comma-separated)
              </label>
              <input
                id="gov-depts"
                type="text"
                value={departmentsText}
                onChange={(e) => setDepartmentsText(e.target.value)}
                placeholder="BCA, B.Sc CS, B.Sc IT, MCA"
                className="w-full px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] font-mono focus:outline-none focus:border-[#9DFF00]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="block font-mono text-[#99A9A0]">
                Idle Auto-Sign-Out
              </span>
              <ObsidianSelect
                value={String(config.idle_timeout_minutes)}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    idle_timeout_minutes: Number(val) || 30,
                  }))
                }
                options={[
                  { value: "15", label: "15 minutes (Strict Lab)" },
                  { value: "30", label: "30 minutes (Default)" },
                  { value: "60", label: "60 minutes (Extended)" },
                ]}
                buttonClassName="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5]"
              />
            </div>
          </div>
        </div>

        {/* AI Freeze & Exam Controls */}
        <div className="pt-5 border-t border-[#1E2C24] space-y-3">
          <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#070B09] border border-[#1E2C24] cursor-pointer">
            <div>
              <div className="text-xs font-bold text-[#F4F7F5]">
                Global AI Mentor Freeze (Exam Lockdown)
              </div>
              <div className="text-[11px] text-[#99A9A0] mt-0.5">
                Temporarily suspends EQ AI Mentor across all student accounts during live campus exams.
              </div>
            </div>
            <input
              id="gov-ai-mentor-freeze"
              name="aiMentorFrozen"
              aria-label="Global AI Mentor Freeze"
              type="checkbox"
              checked={config.ai_mentor_frozen}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  ai_mentor_frozen: e.target.checked,
                }))
              }
              className="w-4 h-4 accent-[#9DFF00] rounded"
            />
          </label>
        </div>

        {/* Campus Broadcast Banner */}
        <div className="pt-5 border-t border-[#1E2C24] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#F4F7F5]">
              <Megaphone className="w-4 h-4 text-[#9DFF00]" />
              <span>Campus-Wide Broadcast Banner</span>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-mono text-[#D5E0D9] cursor-pointer">
              <input
                id="gov-broadcast-enabled"
                name="broadcastEnabled"
                aria-label="Enable campus-wide broadcast banner"
                type="checkbox"
                checked={config.broadcast_enabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    broadcast_enabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-[#9DFF00]"
              />
              <span>Banner Live</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
              <span className="block font-mono text-[#99A9A0]">Target Audience</span>
              <ObsidianSelect
                value={config.broadcast_target}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    broadcast_target: val as PlatformGovernanceConfig["broadcast_target"],
                  }))
                }
                options={[
                  { value: "all", label: "All Portals" },
                  { value: "student", label: "Students Only" },
                  { value: "teacher", label: "Teachers / Mentors Only" },
                  { value: "tpo", label: "TPOs Only" },
                ]}
                buttonClassName="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="block font-mono text-[#99A9A0]">Severity Style</span>
              <ObsidianSelect
                value={config.broadcast_severity}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    broadcast_severity: val as PlatformGovernanceConfig["broadcast_severity"],
                  }))
                }
                options={[
                  { value: "info", label: "Info (Electric Lime)" },
                  { value: "warning", label: "Warning (Amber)" },
                  { value: "urgent", label: "Urgent (Rose)" },
                ]}
                buttonClassName="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="gov-broadcast-msg"
                className="block font-mono text-[#99A9A0]"
              >
                Announcement Message
              </label>
              <input
                id="gov-broadcast-msg"
                type="text"
                value={config.broadcast_message}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    broadcast_message: e.target.value,
                  }))
                }
                placeholder="e.g., TCS Digital Mock Exam starts at 10:00 AM in Computer Lab 2."
                className="w-full px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingConfig}
          className="inline-flex items-center gap-2 min-h-[38px] px-5 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSavingConfig ? "Saving Controls..." : "Save Platform Governance"}</span>
        </button>
      </form>

      {/* Credential Revocation Console */}
      <div className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-4">
        <div className="flex items-center gap-2 text-sm font-display font-bold text-[#F4F7F5]">
          <Ban className="w-4 h-4 text-rose-400" />
          <span>Credential Revocation Registry</span>
        </div>
        <p className="text-xs text-[#99A9A0]">
          Revoke any issued AVASC credential hash if post-exam plagiarism or misconduct is confirmed.
        </p>

        <form
          onSubmit={handleRevokeCredential}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs"
        >
          <input
            type="text"
            aria-label="Credential hash to revoke"
            value={revokeHashInput}
            onChange={(e) => setRevokeHashInput(e.target.value)}
            placeholder="AVASC-2026-BCA-23BCA01-92-AI"
            className="sm:col-span-5 px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] font-mono text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-rose-400"
          />
          <input
            type="text"
            aria-label="Revocation reason"
            value={revokeReasonInput}
            onChange={(e) => setRevokeReasonInput(e.target.value)}
            placeholder="Reason (e.g., Code plagiarism confirmed)"
            className="sm:col-span-5 px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            disabled={isRevoking || !revokeHashInput.trim()}
            className="sm:col-span-2 min-h-[36px] px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-mono font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Revoke
          </button>
        </form>

        {revokedList.length > 0 && (
          <div className="space-y-2 pt-2">
            {revokedList.map((item) => (
              <div
                key={item.credential_hash}
                className="p-3 rounded-xl bg-[#070B09] border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-mono font-bold text-rose-300 truncate">
                    {item.credential_hash}
                  </div>
                  <div className="text-[11px] text-[#99A9A0]">
                    {item.reason} &bull; {new Date(item.revoked_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestoreCredential(item.credential_hash)}
                  className="inline-flex items-center gap-1 min-h-[28px] px-2.5 py-1 rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-[11px] font-mono text-[#D5E0D9] cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Sessions & Clean Slate */}
      <div className="p-6 rounded-2xl bg-[#0C120F] border border-rose-500/25 space-y-4">
        <div className="flex items-center gap-2 text-sm font-display font-bold text-rose-300">
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency Session &amp; Data Controls</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRevokeSessions}
            className="inline-flex items-center gap-2 min-h-[38px] px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Revoke All Active Sessions</span>
          </button>

          <button
            type="button"
            onClick={handlePurgeTestUsers}
            className="inline-flex items-center gap-2 min-h-[38px] px-4 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-[#D5E0D9] text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Purge Local Test Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
