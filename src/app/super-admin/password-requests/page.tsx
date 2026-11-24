"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

interface PasswordRequestItem {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
  department?: string;
  roll_no?: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "expired";
  approved_until?: string | null;
  admin_note?: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export default function SuperAdminPasswordRequestsPage() {
  const [requests, setRequests] = useState<PasswordRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED" | "ALL"
  >("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/super-admin/password-requests", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          requests?: PasswordRequestItem[];
        };
        if (data.success && Array.isArray(data.requests)) {
          setRequests(data.requests);
        }
      }
    } catch {
      // Non-fatal
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleDecision = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    setActionBusyId(id);
    try {
      const res = await fetch("/api/super-admin/password-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action,
          adminNote: noteById[id] || "",
          unlockMinutes: 30,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        request?: PasswordRequestItem;
      };
      if (!res.ok || !data.success) {
        showToast(data.error || "Action failed.");
      } else {
        setRequests((prev) =>
          prev.map((item) =>
            item.id === id && data.request ? data.request : item
          )
        );
        showToast(
          action === "approve"
            ? "Approved: User can now set a new password within 30 minutes."
            : "Request rejected."
        );
      }
    } catch {
      showToast("Network error while updating request.");
    } finally {
      setActionBusyId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      completed: requests.filter((r) => r.status === "completed").length,
      rejected: requests.filter(
        (r) => r.status === "rejected" || r.status === "expired"
      ).length,
    };
  }, [requests]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && r.status === "pending") ||
        (statusFilter === "APPROVED" && r.status === "approved") ||
        (statusFilter === "COMPLETED" && r.status === "completed") ||
        (statusFilter === "REJECTED" &&
          (r.status === "rejected" || r.status === "expired"));

      const matchesQuery =
        !q ||
        r.user_name.toLowerCase().includes(q) ||
        r.user_email.toLowerCase().includes(q) ||
        (r.roll_no || "").toLowerCase().includes(q) ||
        (r.department || "").toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [requests, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E2C24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7F5] tracking-tight">
              Password Change Approvals
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
              {counts.pending} PENDING
            </span>
          </div>
          <p className="text-xs text-[#99A9A0] mt-1">
            Approve or reject user password change requests. Approved users receive a 30-minute one-time unlock window (zero passwords stored).
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-2 rounded-xl bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] text-xs font-mono font-bold text-[#9DFF00] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="min-w-[24px] min-h-[24px] inline-flex items-center justify-center cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24]">
          <div className="text-[11px] font-mono uppercase text-amber-300">
            Pending Review
          </div>
          <div className="text-2xl font-mono font-black text-[#F4F7F5] tabular-nums mt-1">
            {counts.pending}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24]">
          <div className="text-[11px] font-mono uppercase text-[#9DFF00]">
            Active Unlocks
          </div>
          <div className="text-2xl font-mono font-black text-[#F4F7F5] tabular-nums mt-1">
            {counts.approved}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24]">
          <div className="text-[11px] font-mono uppercase text-emerald-300">
            Completed
          </div>
          <div className="text-2xl font-mono font-black text-[#F4F7F5] tabular-nums mt-1">
            {counts.completed}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24]">
          <div className="text-[11px] font-mono uppercase text-rose-300">
            Rejected / Expired
          </div>
          <div className="text-2xl font-mono font-black text-[#F4F7F5] tabular-nums mt-1">
            {counts.rejected}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#85998D] absolute left-3 top-2.5" />
          <input
            type="text"
            aria-label="Search password requests"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, roll no, or department..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(["PENDING", "APPROVED", "COMPLETED", "REJECTED", "ALL"] as const).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`min-h-[28px] px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? "bg-[#9DFF00] text-[#070B09]"
                    : "bg-[#121B16] text-[#99A9A0] hover:text-[#F4F7F5] border border-[#1E2C24]"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-10 rounded-2xl bg-[#0C120F] border border-[#1E2C24] text-center text-xs font-mono text-[#99A9A0]">
            Loading password change requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#0C120F] border border-[#1E2C24] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#121B16] border border-[#1E2C24] flex items-center justify-center mx-auto text-[#9DFF00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-sm font-display font-bold text-[#F4F7F5]">
              No requests in this queue
            </div>
            <p className="text-xs text-[#99A9A0]">
              When a student, teacher, or TPO requests a password change, it will appear here immediately.
            </p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#9DFF00] shrink-0" />
                  <span className="font-bold text-sm text-[#F4F7F5]">
                    {req.user_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#121B16] text-[#D5E0D9] border border-[#2C4034]">
                    {req.user_role}
                  </span>
                  {req.roll_no && (
                    <span className="text-[11px] font-mono text-[#99A9A0]">
                      {req.roll_no}
                    </span>
                  )}
                  {req.department && (
                    <span className="text-[11px] font-mono text-[#99A9A0]">
                      &bull; {req.department}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-[#99A9A0]">
                  {req.user_email} &bull; Requested{" "}
                  {new Date(req.created_at).toLocaleString()}
                </div>

                {req.reason && (
                  <div className="text-xs text-[#D5E0D9] bg-[#070B09] border border-[#1E2C24] rounded-lg px-3 py-1.5 inline-block mt-1">
                    Reason: {req.reason}
                  </div>
                )}

                {req.admin_note && req.status !== "pending" && (
                  <div className="text-[11px] font-mono text-[#99A9A0]">
                    Note: {req.admin_note}
                  </div>
                )}
              </div>

              {req.status === "pending" ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <input
                    type="text"
                    aria-label={`Optional admin note for ${req.user_name}`}
                    value={noteById[req.id] || ""}
                    onChange={(e) =>
                      setNoteById((prev) => ({
                        ...prev,
                        [req.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional note..."
                    className="px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] sm:w-44"
                  />
                  <button
                    type="button"
                    disabled={actionBusyId === req.id}
                    onClick={() => handleDecision(req.id, "approve")}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-4 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve (30m)</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionBusyId === req.id}
                    onClick={() => handleDecision(req.id, "reject")}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase ${
                      req.status === "approved"
                        ? "bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30"
                        : req.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {req.status === "approved" && <Clock className="w-3 h-3" />}
                    {req.status}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
