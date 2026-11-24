"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SuperAdminService, ManagedUser, AccountStatus } from "@/lib/services/super-admin-service";
import {
  Users,
  Search,
  UserPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Key,
  Edit,
  Archive,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
} from "lucide-react";

function UsersTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search & Filters from Query Parameters
  const initialQuery = searchParams.get("q") || "";
  const initialRole = searchParams.get("role") || "ALL";
  const initialStatus = searchParams.get("status") || "ALL";

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<string>(initialRole);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [sortBy, setSortBy] = useState<"created" | "name">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Action Modal / Notification
  const [notification, setNotification] = useState<{ type: "success" | "warn"; msg: string } | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const notify = (msg: string, type: "success" | "warn" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/super-admin/users");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to local demo store when offline or service key unconfigured
    }
    const list = SuperAdminService.getAllUsers();
    setUsers(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update query params sync
  useEffect(() => {
    if (searchParams.get("q")) setSearchQuery(searchParams.get("q") || "");
    if (searchParams.get("role")) setRoleFilter(searchParams.get("role") || "ALL");
    if (searchParams.get("status")) setStatusFilter(searchParams.get("status") || "ALL");
  }, [searchParams]);

  // Filtering & Sorting
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.roll_no && u.roll_no.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      const isMentor = u.role === "teacher";
      const isStudent = u.role === "student";
      const isTpo = u.role === "tpo" || u.role === "admin";

      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "MENTOR" && isMentor) ||
        (roleFilter === "STUDENT" && isStudent) ||
        (roleFilter === "TPO" && isTpo);

      const status = u.account_status || "active";
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "active" && status === "active") ||
        (statusFilter === "suspended" && status === "suspended") ||
        (statusFilter === "inactive" && status === "inactive") ||
        (statusFilter === "archived" && status === "archived");

      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.full_name || "";
        const nameB = b.full_name || "";
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
    });
  }, [users, searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);

  // Paginated Slices
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setSortBy("created");
    setSortOrder("desc");
    setCurrentPage(1);
    router.replace("/super-admin/users");
  };

  const handleQuickStatusToggle = async (user: ManagedUser) => {
    const current = user.account_status || "active";
    const nextStatus: AccountStatus = current === "active" ? "suspended" : "active";

    try {
      const apiRes = await fetch(`/api/super-admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_status: nextStatus }),
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success) {
        notify(`Live account for ${user.full_name} is now ${nextStatus.toUpperCase()}`);
        await loadData();
        setActiveActionMenuId(null);
        return;
      }
      if (apiRes.status !== 503 && apiData.mode !== "local_demo_fallback") {
        notify(apiData.error || "Status update failed", "warn");
        setActiveActionMenuId(null);
        return;
      }
    } catch {}

    const res = SuperAdminService.setUserStatus(
      user.id,
      nextStatus,
      nextStatus === "suspended" ? "Administrative lock via directory" : "Administrative reactivation"
    );

    if (res.success) {
      notify(`Account for ${user.full_name} is now ${nextStatus.toUpperCase()}`);
      await loadData();
    } else {
      notify(res.error || "Action failed", "warn");
    }
    setActiveActionMenuId(null);
  };

  const handleQuickPasswordReset = async (user: ManagedUser) => {
    try {
      const apiRes = await fetch(`/api/super-admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPassword: true }),
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success && apiData.tempPassword) {
        notify(`Password reset for ${user.email}. New temporary password: ${apiData.tempPassword}`);
        setActiveActionMenuId(null);
        return;
      }
    } catch {}

    const res = SuperAdminService.initiatePasswordReset(user.id, "email_link");
    if (res.success) {
      notify(res.message);
    } else {
      notify(res.message, "warn");
    }
    setActiveActionMenuId(null);
  };

  return (
    <div className="space-y-5">
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
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F4F7F5] tracking-tight flex items-center gap-2">
            <span>Global User Directory</span>
            <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full bg-[#0C120F] border border-[#1E2C24] text-[#9DFF00]">
              {totalItems} accounts
            </span>
          </h1>
          <p className="text-xs text-[#99A9A0] mt-1">
            Browse, search, edit, reset passwords, and manage accounts for Mentors, Students, and TPOs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] text-[#D5E0D9] hover:text-[#F4F7F5] transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/super-admin/users/import"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] text-[#F4F7F5] transition-all flex items-center gap-1.5 font-mono shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span>AI Bulk Import</span>
          </Link>
          <Link
            href="/super-admin/users/add"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] transition-all flex items-center gap-1.5 shadow-xs font-mono"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#99A9A0] absolute left-3 top-2.5" />
            <input
              id="super-admin-users-search"
              name="super-admin-users-search"
              aria-label="Search users by name, email, roll number, or user ID"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, roll number, user ID..."
              className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
            />
          </div>

          {/* Role Filter */}
          <div>
            <ObsidianSelect value={String(roleFilter)} onChange={(val) => {
                setRoleFilter(val);
                setCurrentPage(1);
              }} options={[{ value: "ALL", label: "All Roles (Mentor, Student, TPO)" }, { value: "MENTOR", label: "Mentor (Faculty)" }, { value: "STUDENT", label: "Student (Candidate)" }, { value: "TPO", label: "TPO (Placement Officer)" }]} buttonClassName="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5] focus:outline-hidden focus:border-[#9DFF00]" />
          </div>

          {/* Status Filter */}
          <div>
            <ObsidianSelect value={String(statusFilter)} onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }} options={[{ value: "ALL", label: "All Statuses" }, { value: "active", label: "Active Only" }, { value: "suspended", label: "Suspended Only" }, { value: "inactive", label: "Inactive Only" }, { value: "archived", label: "Archived Only" }]} buttonClassName="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5] focus:outline-hidden focus:border-[#9DFF00]" />
          </div>
        </div>

        {/* Secondary controls: Sort, Page Size, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E2C24] text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#99A9A0] font-mono text-[11px]">Sort:</span>
            <button
              type="button"
              onClick={() => {
                setSortBy("created");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
              className={`font-mono text-[11px] px-2.5 min-h-[28px] rounded cursor-pointer ${
                sortBy === "created" ? "bg-[#121B16] text-[#9DFF00] font-bold" : "text-[#99A9A0] hover:text-[#F4F7F5]"
              }`}
            >
              Created Date {sortBy === "created" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy("name");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
              className={`font-mono text-[11px] px-2.5 min-h-[28px] rounded cursor-pointer ${
                sortBy === "name" ? "bg-[#121B16] text-[#9DFF00] font-bold" : "text-[#99A9A0] hover:text-[#F4F7F5]"
              }`}
            >
              Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#99A9A0]">
              <span>Show:</span>
              <ObsidianSelect value={String(pageSize)} onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }} options={[{ value: String(10), label: "10" }, { value: String(25), label: "25" }, { value: String(50), label: "50" }]} buttonClassName="bg-[#070B09] border border-[#1E2C24] rounded px-1.5 py-0.5 text-[#F4F7F5]" />
            </div>

            {(searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-mono text-[#99A9A0] hover:text-[#F4F7F5] underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#070B09] border-b border-[#1E2C24] text-[10px] font-mono uppercase text-[#99A9A0]">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold">Department</th>
                <th className="py-3 px-3 font-semibold">Roll No</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Created</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C24]/70">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#85998D] font-mono">
                    Loading records from database...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#121B16] border border-[#1E2C24] flex items-center justify-center mx-auto text-[#99A9A0]">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-display font-bold text-[#F4F7F5]">No users match your criteria</div>
                    <p className="text-xs text-[#85998D] max-w-sm mx-auto">
                      Try clearing search queries, adjusting role filters, or provisioning a new user account.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-3 py-1.5 rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-xs font-mono text-[#F4F7F5] mt-2"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isMentor = u.role === "teacher";
                  const isTpo = u.role === "tpo" || u.role === "admin";
                  const status = u.account_status || "active";
                  const isOwner =
                    u.email === "owner@eqlv.code" ||
                    u.email?.toLowerCase() === "mmam92005@gmail.com" ||
                    u.id === "usr-super-admin-owner" ||
                    u.id === "c8d50800-aae2-42b6-84a7-f10241621c5a";

                  return (
                    <tr key={u.id} className="hover:bg-[#18241D]/50 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#121B16] border border-[#1E2C24] flex items-center justify-center font-bold text-[10px] text-[#D5E0D9] shrink-0">
                            {u.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <Link
                              href={`/super-admin/users/${u.id}`}
                              className="font-bold text-[#F4F7F5] hover:text-[#9DFF00] transition-colors leading-tight inline-flex items-center min-h-[24px]"
                            >
                              {u.full_name}
                            </Link>
                            <div className="text-[10px] font-mono text-[#99A9A0]">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            isMentor
                              ? "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                              : isTpo
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                              : "bg-[#9DFF00]/10 text-[#9DFF00] border border-[#9DFF00]/30"
                          }`}
                        >
                          {isMentor ? "MENTOR" : isTpo ? "TPO" : "STUDENT"}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 font-mono text-[11px] text-[#D5E0D9]">
                        {u.department || "General"}
                      </td>

                      {/* Roll Number */}
                      <td className="py-3 px-3 font-mono tabular-nums text-[11px] text-[#99A9A0]">
                        {u.roll_no || "-"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            status === "active"
                              ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/25"
                              : status === "suspended"
                              ? "text-rose-300 bg-rose-500/10 border border-rose-500/25"
                              : "text-[#99A9A0] bg-[#121B16] border border-[#1E2C24]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status === "active" ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          {status.toUpperCase()}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 font-mono tabular-nums text-[10px] text-[#85998D]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/super-admin/users/${u.id}`}
                            className="px-2.5 py-1 rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-[10px] font-mono text-[#D5E0D9] hover:text-[#F4F7F5] transition-colors"
                          >
                            Details
                          </Link>

                          {!isOwner && (
                            <div className="relative">
                              <button
                                type="button"
                                aria-label={`Actions for ${u.full_name}`}
                                onClick={() =>
                                  setActiveActionMenuId(activeActionMenuId === u.id ? null : u.id)
                                }
                                className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg hover:bg-[#18241D] text-[#99A9A0] hover:text-[#F4F7F5] cursor-pointer"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeActionMenuId === u.id && (
                                <div className="absolute right-0 top-7 z-30 w-44 rounded-xl bg-[#0C120F] border border-[#1E2C24] shadow-2xl p-1 text-left space-y-0.5 font-sans text-xs">
                                  <Link
                                    href={`/super-admin/users/${u.id}/edit`}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#18241D] text-[#F4F7F5]"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-[#99A9A0]" />
                                    <span>Edit Profile</span>
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickPasswordReset(u)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#18241D] text-[#F4F7F5] text-left"
                                  >
                                    <Key className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Reset Password</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusToggle(u)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#18241D] text-left text-[#F4F7F5]"
                                  >
                                    {status === "active" ? (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                        <span>Suspend User</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Activate User</span>
                                      </>
                                    )}
                                  </button>

                                  <div className="border-t border-[#1E2C24] my-1" />

                                  <Link
                                    href={`/super-admin/users/${u.id}?tab=archive`}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                    <span>Archive Account</span>
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#070B09] border-t border-[#1E2C24] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono tabular-nums">
          <div className="text-[#99A9A0] text-[11px]">
            Showing <span className="text-[#F4F7F5] font-bold">{paginatedUsers.length}</span> of{" "}
            <span className="text-[#F4F7F5] font-bold">{totalItems}</span> total users
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous users page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] disabled:opacity-40 text-[#D5E0D9] hover:text-[#F4F7F5] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] text-[#99A9A0]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next users page"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] disabled:opacity-40 text-[#D5E0D9] hover:text-[#F4F7F5] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#99A9A0] font-mono">
          Loading user directory...
        </div>
      }
    >
      <UsersTableContent />
    </Suspense>
  );
}
