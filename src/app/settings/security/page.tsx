"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DataService } from "@/lib/supabase/db";
import { UserCredentialsService } from "@/lib/services/user-credentials";
import { UserProfile } from "@/types";
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Send,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface PasswordChangeRequestRecord {
  id: string;
  status: "pending" | "approved" | "rejected" | "completed" | "expired";
  reason?: string;
  admin_note?: string;
  approved_until?: string | null;
  created_at: string;
}

export default function AccountSecuritySettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [requestRecord, setRequestRecord] =
    useState<PasswordChangeRequestRecord | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [reason, setReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSuperAdmin =
    user?.role?.toLowerCase() === "super_admin" ||
    user?.email?.toLowerCase() === "mmam92005@gmail.com";

  const fetchRequestStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/auth/password-request", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          request?: PasswordChangeRequestRecord | null;
        };
        if (data.success) {
          setRequestRecord(data.request || null);
        }
      }
    } catch {
      // Keep current state gracefully if offline
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    DataService.getCurrentUser()
      .then((u) => {
        setUser(u);
      })
      .catch(() => {});
    fetchRequestStatus();
  }, [fetchRequestStatus]);

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmittingRequest(true);
    try {
      const res = await fetch("/api/auth/password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        request?: PasswordChangeRequestRecord;
      };
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Unable to submit password change request.");
      } else {
        setRequestRecord(data.request || null);
        setReason("");
        setSuccessMsg(
          "Request sent to Super Admin. Your password form will unlock for 30 minutes once approved."
        );
      }
    } catch {
      setErrorMsg("Network error while submitting request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMsg(
        "Password must contain at least one uppercase letter and one number."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }
      } else if (user && user.email) {
        UserCredentialsService.saveCredential({
          userId: user.id,
          email: user.email,
          rollNo: user.roll_no,
          password: newPassword,
          isTemp: false,
        });
      }

      // Immediately consume & re-lock the approval window
      if (!isSuperAdmin && requestRecord?.id) {
        await fetch("/api/auth/password-request", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: requestRecord.id }),
        }).catch(() => {});
        setRequestRecord((prev) =>
          prev ? { ...prev, status: "completed" } : null
        );
      }

      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg(
        "Your password has been updated securely and this approval window is now closed."
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  const isApprovedUnlocked =
    isSuperAdmin ||
    (requestRecord?.status === "approved" &&
      (!requestRecord.approved_until ||
        new Date(requestRecord.approved_until).getTime() > Date.now()));

  return (
    <main className="max-w-2xl mx-auto p-6 sm:p-10 space-y-6 font-sans text-[#F4F7F5]">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#9DFF00] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Account Security</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5]">
          Change Password
        </h1>
        <p className="text-xs text-[#99A9A0]">
          {isSuperAdmin
            ? "Super Admin accounts can update credentials directly without approval."
            : "Password updates require Super Admin approval. Once approved, a 30-minute unlock window opens here."}
        </p>
      </div>

      {user && user.id !== "guest" && (
        <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-[#F4F7F5]">{user.full_name}</div>
            <div className="text-[#99A9A0] font-mono">{user.email}</div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#9DFF00]/10 border border-[#9DFF00]/30 text-[#9DFF00] font-mono font-bold uppercase text-[10px]">
            {user.role}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoadingStatus && !isSuperAdmin ? (
        <div className="p-8 rounded-2xl bg-[#0C120F] border border-[#1E2C24] text-center text-xs font-mono text-[#99A9A0]">
          Checking password change approval status...
        </div>
      ) : isApprovedUnlocked ? (
        <form
          onSubmit={handleChangePassword}
          className="p-6 sm:p-7 rounded-2xl bg-[#0C120F] border border-[#1E2C24] shadow-obsidian space-y-5"
        >
          {!isSuperAdmin && requestRecord?.approved_until && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#9DFF00]" />
              <span>
                Approved by Super Admin. Unlocked until{" "}
                {new Date(requestRecord.approved_until).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="new-password"
              className="block text-xs font-mono font-bold text-[#99A9A0]"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#85998D] absolute left-3.5 top-3 pointer-events-none" />
              <input
                id="new-password"
                name="newPassword"
                type={showPass ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 chars, 1 uppercase, 1 number"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/50 focus:border-[#9DFF00]"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? "Hide password" : "Show password"}
                className="absolute right-3 top-2.5 p-1 text-[#85998D] hover:text-[#F4F7F5] cursor-pointer"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="block text-xs font-mono font-bold text-[#99A9A0]"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#85998D] absolute left-3.5 top-3 pointer-events-none" />
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPass ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/50 focus:border-[#9DFF00]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-extrabold transition-all shadow-[0_0_24px_-6px_rgba(157,255,0,0.45)] cursor-pointer disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Save New Password"}
          </button>
        </form>
      ) : requestRecord?.status === "pending" ? (
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0C120F] border border-amber-500/35 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#F4F7F5]">
                Pending Super Admin Approval
              </h2>
              <p className="text-xs text-[#99A9A0] leading-relaxed">
                Your password change request was sent on{" "}
                <span className="font-mono text-[#D5E0D9]">
                  {new Date(requestRecord.created_at).toLocaleString()}
                </span>
                . Once approved by the Super Admin, click Refresh Status below to unlock the password form.
              </p>
              {requestRecord.reason && (
                <p className="text-[11px] font-mono text-[#99A9A0] pt-1">
                  Reason: {requestRecord.reason}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={fetchRequestStatus}
            className="inline-flex items-center gap-2 min-h-[36px] px-4 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-xs font-mono font-bold text-[#9DFF00] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Approval Status</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleRequestApproval}
          className="p-6 sm:p-7 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-5"
        >
          {requestRecord?.status === "rejected" && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Previous request was rejected</div>
                {requestRecord.admin_note && (
                  <div className="font-mono text-[11px] mt-0.5 text-rose-200/90">
                    Admin note: {requestRecord.admin_note}
                  </div>
                )}
              </div>
            </div>
          )}

          {requestRecord?.status === "expired" && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                Your previous 30-minute approval window expired. Submit a new request below.
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121B16] border border-[#2C4034] flex items-center justify-center text-[#9DFF00] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#F4F7F5]">
                Super Admin Approval Required
              </h2>
              <p className="text-xs text-[#99A9A0] leading-relaxed">
                For campus account security, submit a quick request to the Super Admin. Once approved, you can set your new password here within 30 minutes.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="pwd-request-reason"
              className="block text-xs font-mono font-bold text-[#99A9A0]"
            >
              Reason for Password Change (Optional)
            </label>
            <input
              id="pwd-request-reason"
              name="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Replacing temporary password or shared lab login"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/50 focus:border-[#9DFF00]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingRequest}
            className="inline-flex items-center gap-2 min-h-[38px] px-5 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-extrabold font-mono transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSubmittingRequest
                ? "Sending Request..."
                : "Request Password Change"}
            </span>
          </button>
        </form>
      )}
    </main>
  );
}
