"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SuperAdminService, ManagedUser, AccountStatus } from "@/lib/services/super-admin-service";
import {
  ChevronLeft,
  Edit,
  Key,
  ShieldAlert,
  Archive,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<ManagedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "warn"; msg: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modals
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState<{ message: string; tempPassword?: string } | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const notify = (msg: string, type: "success" | "warn" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadUser = async (signal?: { cancelled: boolean }) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/super-admin/users/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (!signal?.cancelled && data.success && data.user) {
          setUser(data.user);
          setIsLoading(false);
          return;
        }
      }
    } catch {}
    if (signal?.cancelled) return;
    const found = SuperAdminService.getUserById(userId);
    setUser(found);
    setIsLoading(false);
  };

  useEffect(() => {
    const signal = { cancelled: false };
    void loadUser(signal);
    return () => {
      signal.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#99A9A0] font-mono text-xs">
        Loading user dossier...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-base font-display font-bold text-[#F4F7F5]">User not found</h2>
        <p className="text-xs text-[#99A9A0]">The requested user account does not exist or has been removed.</p>
        <Link
          href="/super-admin/users"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] text-xs font-mono text-[#F4F7F5]"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  const isMentor = user.role === "teacher";
  const isTpo = user.role === "tpo" || user.role === "admin";
  const status = user.account_status || "active";
  const isOwner =
    user.email === "owner@eqlv.code" ||
    user.email?.toLowerCase() === "mmam92005@gmail.com" ||
    user.id === "usr-super-admin-owner" ||
    user.id === "c8d50800-aae2-42b6-84a7-f10241621c5a";

  const handleStatusChange = async (newStatus: AccountStatus, reason: string) => {
    try {
      const apiRes = await fetch(`/api/super-admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_status: newStatus }),
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success) {
        notify(`Live account status updated to ${newStatus.toUpperCase()}`);
        await loadUser();
        return;
      }
      if (apiRes.status !== 503 && apiData.mode !== "local_demo_fallback") {
        notify(apiData.error || "Update failed", "warn");
        return;
      }
    } catch {}

    const res = SuperAdminService.setUserStatus(user.id, newStatus, reason);
    if (res.success) {
      notify(`Account status updated to ${newStatus.toUpperCase()}`);
      await loadUser();
    } else {
      notify(res.error || "Update failed", "warn");
    }
  };

  const handlePasswordReset = async (mode: "email_link" | "temp_password") => {
    try {
      const apiRes = await fetch(`/api/super-admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: true }),
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success && apiData.tempPassword) {
        setResetResult({
          message: `Supabase Auth password updated for ${user.email}. Share this one-time temporary password securely:`,
          tempPassword: apiData.tempPassword,
        });
        return;
      }
    } catch {}

    const res = SuperAdminService.initiatePasswordReset(user.id, mode);
    setResetResult(res);
  };

  const handleArchiveConfirm = async () => {
    try {
      const apiRes = await fetch(`/api/super-admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_status: "archived" }),
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success) {
        notify("Live user account archived safely. Academic history preserved.");
        setIsArchiveModalOpen(false);
        await loadUser();
        return;
      }
    } catch {}

    const res = SuperAdminService.archiveUser(user.id, archiveReason || "Administrative archival");
    if (res.success) {
      notify("User account archived safely. Academic history preserved.");
      setIsArchiveModalOpen(false);
      await loadUser();
    } else {
      notify(res.error || "Archival failed", "warn");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.trim() !== "DELETE") {
      setDeleteError('Please type "DELETE" in uppercase to confirm permanent removal.');
      return;
    }

    try {
      const apiRes = await fetch(`/api/super-admin/users/${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success) {
        router.push("/super-admin/users");
        return;
      }
      if (apiRes.status !== 503 && apiData.mode !== "local_demo_fallback") {
        setDeleteError(apiData.error || "Deletion rejected.");
        return;
      }
    } catch {}

    const res = SuperAdminService.permanentlyDeleteUser(user.id, deleteConfirmation);
    if (res.success) {
      router.push("/super-admin/users");
    } else {
      setDeleteError(res.error || "Deletion rejected.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : "bg-amber-950/80 border-amber-500/40 text-amber-300"
          }`}
        >
          <span>{notification.msg}</span>
          <button type="button" onClick={() => setNotification(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#99A9A0]">
        <Link href="/super-admin/users" className="hover:text-[#F4F7F5] flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Users</span>
        </Link>
        <span>/</span>
        <span className="text-[#F4F7F5] truncate max-w-xs">{user.full_name}</span>
      </div>

      {/* Top Profile Dossier Card */}
      <div className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center font-display font-bold text-xl text-[#F4F7F5] shrink-0">
            {user.full_name?.charAt(0) || "U"}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F4F7F5] tracking-tight">
                {user.full_name}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isMentor
                    ? "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                    : isTpo
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                    : "bg-[#9DFF00]/10 text-[#9DFF00] border border-[#9DFF00]/30"
                }`}
              >
                {isMentor ? "MENTOR (FACULTY)" : isTpo ? "TPO (PLACEMENT)" : "STUDENT"}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  status === "active"
                    ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/25"
                    : status === "suspended"
                    ? "text-rose-300 bg-rose-500/10 border border-rose-500/25"
                    : "text-[#99A9A0] bg-[#121B16] border border-[#1E2C24]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                {status.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#99A9A0] font-mono">
              <span>{user.email}</span>
              <span>&bull;</span>
              <span>{user.department || "General Department"}</span>
              {user.roll_no && (
                <>
                  <span>&bull;</span>
                  <span className="tabular-nums">Roll: {user.roll_no}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwner && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href={`/super-admin/users/${user.id}/edit`}
              className="px-3.5 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-xs font-bold text-[#F4F7F5] transition-all flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Reset Password</span>
            </button>

            {status === "active" ? (
              <button
                type="button"
                onClick={() => handleStatusChange("suspended", "Administrative suspension")}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStatusChange("active", "Administrative reactivation")}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reactivate</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details Grid: Metadata, Roles & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Metadata */}
        <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-4">
          <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Account Details</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
              <span className="text-[#99A9A0]">User ID</span>
              <div className="flex items-center gap-1.5 text-[#F4F7F5]">
                <span className="truncate max-w-[200px]">{user.id}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user.id, "id")}
                  className="p-1 hover:text-[#9DFF00]"
                >
                  {copiedText === "id" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
              <span className="text-[#99A9A0]">Institution</span>
              <span className="text-[#F4F7F5] text-right truncate max-w-[240px]">
                {user.college_name || "Annai Vailankanni Arts and Science College, Thanjavur"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
              <span className="text-[#99A9A0]">Department</span>
              <span className="text-[#F4F7F5]">{user.department || "General"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
              <span className="text-[#99A9A0]">Batch Year</span>
              <span className="text-[#F4F7F5] tabular-nums">{user.batch_year || "2026"}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
              <span className="text-[#99A9A0]">Created At</span>
              <span className="text-[#F4F7F5] tabular-nums">
                {user.created_at ? new Date(user.created_at).toLocaleString() : "Initial Seed Record"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#99A9A0]">Last Sign-in</span>
              <span className="text-[#F4F7F5] tabular-nums">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Recent Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Role & Performance Metrics */}
        <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-4">
          <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Platform Activity & Role Specs</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
              <span className="text-[#99A9A0]">Primary Normal Role</span>
              <span className="text-[#F4F7F5] font-bold">{user.role.toUpperCase()}</span>
            </div>

            {user.role === "student" && (
              <>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
                  <span className="text-[#99A9A0]">Problems Solved</span>
                  <span className="text-[#9DFF00] font-bold tabular-nums">{user.problems_solved || 0} Challenges</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
                  <span className="text-[#99A9A0]">Readiness Score</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{user.readiness_score ?? 0}%</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-[#1E2C24]/70">
              <span className="text-[#99A9A0]">Auth System</span>
              <span className="text-[#F4F7F5]">Supabase Auth (Postgres RLS)</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#99A9A0]">Session Status</span>
              <span className={status === "active" ? "text-emerald-400" : "text-rose-400"}>
                {status === "active" ? "Allowed & Active" : "Blocked / Revoked"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Archival & Permanent Deletion */}
      {!isOwner && (
        <div className="p-5 rounded-2xl bg-[#0C120F] border border-rose-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Lifecycle Management & Data Safeguards</h3>
          </div>
          <p className="text-xs text-[#99A9A0] leading-relaxed">
            Choose between non-destructive archival (recommended) or permanent deletion. Permanent deletion will purge all associated database records.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsArchiveModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-xs font-bold text-[#F4F7F5] transition-all flex items-center gap-1.5"
            >
              <Archive className="w-3.5 h-3.5 text-[#99A9A0]" />
              <span>Archive Account (Preserves Data)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-xs font-bold text-rose-300 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permanently Delete Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2C24]">
              <h3 className="font-display font-bold text-sm text-[#F4F7F5] flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Reset User Password</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetResult(null);
                }}
                className="text-[#99A9A0] hover:text-[#F4F7F5]"
              >
                &times;
              </button>
            </div>

            {resetResult ? (
              <div className="p-4 rounded-xl bg-[#070B09] border border-[#1E2C24] space-y-3 font-mono">
                <div className="text-emerald-400 font-bold">{resetResult.message}</div>
                {resetResult.tempPassword && (
                  <div className="p-2.5 rounded-lg bg-[#0C120F] border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#99A9A0]">Temporary Password:</div>
                      <div className="text-sm font-bold text-amber-400">{resetResult.tempPassword}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(resetResult.tempPassword!, "pwd")}
                      className="px-2 py-1 rounded bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-xs text-[#F4F7F5]"
                    >
                      {copiedText === "pwd" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetResult(null);
                  }}
                  className="w-full py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[#D5E0D9] leading-relaxed">
                  Select the password reset delivery method for <strong className="text-[#F4F7F5]">{user.full_name}</strong> ({user.email}):
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePasswordReset("email_link")}
                    className="p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] hover:border-amber-400 text-left transition-all space-y-1"
                  >
                    <div className="font-bold text-[#F4F7F5] text-xs">Email Link</div>
                    <div className="text-[10px] text-[#99A9A0]">Dispatches secure recovery URL to user inbox.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePasswordReset("temp_password")}
                    className="p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] hover:border-[#9DFF00] text-left transition-all space-y-1"
                  >
                    <div className="font-bold text-[#F4F7F5] text-xs">Temp Password</div>
                    <div className="text-[10px] text-[#99A9A0]">Generates instant credentials for administrative handover.</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Archive Modal (Level 1) */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-6 space-y-4 text-xs font-sans">
            <h3 className="font-display font-bold text-sm text-[#F4F7F5] flex items-center gap-2">
              <Archive className="w-4 h-4 text-[#99A9A0]" />
              <span>Archive Account</span>
            </h3>
            <p className="text-[#D5E0D9] leading-relaxed">
              Archiving <strong className="text-[#F4F7F5]">{user.full_name}</strong> will revoke access and block future logins. All coding submissions, test attempts, and academic grades will remain <strong className="text-[#F4F7F5]">100% intact</strong>.
            </p>
            <input
              id="user-archive-reason"
              name="user-archive-reason"
              aria-label="Reason for archival"
              type="text"
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              placeholder="Reason for archival (e.g. Graduated batch of 2026)..."
              className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                className="px-4 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs"
              >
                Confirm Archival
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal (Level 2 Purge) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0C120F] border border-rose-500/60 p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Permanent Account Purge</span>
            </div>
            <p className="text-[#D5E0D9] leading-relaxed">
              This action is <strong className="text-[#F4F7F5]">irreversible</strong>. Permanently deleting <strong className="text-[#F4F7F5]">{user.full_name}</strong> will remove their profile and cascade-delete submissions.
            </p>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1">
              <div>Type <strong className="font-mono text-[#F4F7F5]">DELETE</strong> to confirm:</div>
              <input
                id="user-purge-confirm-input"
                name="user-purge-confirm"
                aria-label="Type DELETE to confirm permanent account purge"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => {
                  setDeleteConfirmation(e.target.value);
                  setDeleteError(null);
                }}
                placeholder="DELETE"
                className="w-full bg-[#070B09] border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] font-mono mt-1 focus:outline-hidden focus:border-rose-400"
              />
            </div>
            {deleteError && <div className="text-rose-400 font-bold">{deleteError}</div>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteError(null);
                }}
                className="px-3 py-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmation !== "DELETE"}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-[#F4F7F5] font-bold text-xs"
              >
                Purge Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
