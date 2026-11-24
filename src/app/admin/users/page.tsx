"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, UserRole } from "@/types";
import { UserProvisioningService } from "@/lib/services/user-provisioning";
import {
  UserPlus,
  FileSpreadsheet,
  Download,
  Sparkles,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
  Building2,
  GraduationCap,
  Briefcase,
  Key,
  UploadCloud,
} from "lucide-react";

export default function AdminUsersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [notification, setNotification] = useState<{ type: "success" | "info" | "warn"; msg: string } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Add User Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "student" as UserRole,
    department: "BCA",
    rollNo: "",
    batchYear: 2026,
    collegeName: "Annai Vailankanni Arts and Science College, Thanjavur",
  });

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [parsedPreviewCount, setParsedPreviewCount] = useState<number>(0);

  const notify = (msg: string, type: "success" | "info" | "warn" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadUsers = () => {
    const list = UserProvisioningService.getAllUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.roll_no && u.roll_no.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "STUDENT" && u.role === "student") ||
        (roleFilter === "TEACHER" && u.role === "teacher") ||
        (roleFilter === "TPO" && (u.role === "tpo" || u.role === "admin"));

      const matchesDept =
        deptFilter === "ALL" || (u.department && u.department.toLowerCase() === deptFilter.toLowerCase());

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [users, searchQuery, roleFilter, deptFilter]);

  // Derived KPIs
  const totalCount = users.length;
  const studentsCount = users.filter((u) => u.role === "student").length;
  const teachersCount = users.filter((u) => u.role === "teacher").length;
  const tpoCount = users.filter((u) => u.role === "tpo" || u.role === "admin").length;

  // Handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.rollNo.trim()) {
      notify("Please fill in all required fields.", "warn");
      return;
    }

    UserProvisioningService.addSingleUser(formData);
    loadUsers();
    setIsAddModalOpen(false);
    setFormData({
      fullName: "",
      email: "",
      role: "student",
      department: "BCA",
      rollNo: "",
      batchYear: 2026,
      collegeName: "Annai Vailankanni Arts and Science College, Thanjavur",
    });
    notify(`User ${formData.fullName} successfully provisioned!`);
  };

  const handleGenerate300 = () => {
    UserProvisioningService.generate300StudentsAnd10Staff();
    loadUsers();
    notify(
      `Populated 300 Students across BCA, CS, IT, MCA + 10 Faculty Mentors for Annai Vailankanni College!`,
      "success"
    );
  };

  const handleReset = () => {
    UserProvisioningService.resetToDefault();
    loadUsers();
    notify("Roster reset to baseline default personas.", "info");
  };

  const handleExportCsv = () => {
    const csvContent = UserProvisioningService.exportUsersCsv(filteredUsers);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Master_User_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Exported ${filteredUsers.length} users to CSV.`, "info");
  };

  const handleDownloadTemplate = (type: "student" | "staff") => {
    const template =
      type === "student"
        ? UserProvisioningService.getStudentCsvTemplate()
        : UserProvisioningService.getStaffCsvTemplate();

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setCsvText(content);
      const lines = content.split("\n").filter((l) => l.trim().length > 0);
      setParsedPreviewCount(Math.max(0, lines.length - 1)); // subtract header
    };
    reader.readAsText(file);
  };

  const handleExecuteCsvImport = () => {
    if (!csvText.trim()) {
      notify("Please select or paste a valid CSV file.", "warn");
      return;
    }

    const lines = csvText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      notify("CSV must contain a header row and at least 1 record.", "warn");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.replace(/["\r]/g, "").trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const rollIdx = headers.findIndex((h) => h.includes("roll") || h.includes("reg") || h.includes("id"));
    const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("mail"));
    const deptIdx = headers.findIndex((h) => h.includes("dept") || h.includes("department"));
    const batchIdx = headers.findIndex((h) => h.includes("batch") || h.includes("year"));
    const roleIdx = headers.findIndex((h) => h.includes("role"));

    const rowsToImport = lines.slice(1).map((line) => {
      const parts = line.split(",").map((p) => p.replace(/["\r]/g, "").trim());
      return {
        name: nameIdx >= 0 ? parts[nameIdx] : parts[0],
        rollNo: rollIdx >= 0 ? parts[rollIdx] : parts[1] || `REG-${Date.now()}`,
        email: emailIdx >= 0 ? parts[emailIdx] : `${parts[1] || "student"}@college.edu`,
        department: deptIdx >= 0 ? parts[deptIdx] : "BCA",
        batchYear: batchIdx >= 0 ? parseInt(parts[batchIdx], 10) || 2026 : 2026,
        role: (roleIdx >= 0 && parts[roleIdx]?.toLowerCase().includes("teach") ? "teacher" : "student") as UserRole,
      };
    });

    const res = UserProvisioningService.bulkImportUsers(rowsToImport);
    loadUsers();
    setIsImportModalOpen(false);
    setCsvText("");
    setCsvFileName(null);
    setParsedPreviewCount(0);
    notify(`Successfully imported ${res.imported} new users and updated ${res.updated} existing records!`);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#070B09] text-[#F4F7F5] pb-20 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-[#0C120F] text-[#9DFF00] border-[#9DFF00]/40"
                : notification.type === "warn"
                ? "bg-[#0C120F] text-amber-300 border-amber-500/40"
                : "bg-[#0C120F] text-sky-300 border-sky-500/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header / Master Banner */}
      <div className="bg-[#0C120F] border-b border-[#1E2C24] px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#9DFF00]/10 text-[#9DFF00] border border-[#9DFF00]/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#9DFF00]" />
                <span>Super Admin Console</span>
              </span>
              <span className="text-xs text-[#85998D] font-mono">Company Vendor Access Only</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/25">
                Institutional License Authority
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4F7F5] tracking-tight">
              Master User Provisioning & License Management
            </h1>
            <p className="text-xs sm:text-sm text-[#99A9A0] mt-1 max-w-2xl leading-relaxed">
              Only Super Admins from the company side can provision students, assign mentors, and onboard campus TPOs.
              College faculty accounts have strictly read-only access.
            </p>
          </div>

          {/* Master Toolbar Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-all shadow-md shadow-[#9DFF00]/20 cursor-pointer active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-[#070B09]" />
              <span>Add Single User</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#121B16] hover:bg-[#18241D] text-[#F4F7F5] border border-[#1E2C24] hover:border-[#2C4034] text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Bulk CSV Import</span>
            </button>

            <button
              onClick={handleGenerate300}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
              title="Populate 300 students across BCA, CS, IT, MCA + 10 staff for client demo"
            >
              <Sparkles className="w-4 h-4" />
              <span>Populate 300 Students (Demo)</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] hover:border-[#2C4034] text-[#D5E0D9] text-xs font-bold transition-all cursor-pointer"
              title="Export filtered roster to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
              title="Reset to default seed roster"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-1">
            <span className="text-[11px] font-mono font-bold text-[#99A9A0] uppercase tracking-wider">
              Total Provisioned
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#F4F7F5] tracking-tight">{totalCount}</div>
            <div className="text-[11px] text-[#85998D] font-medium">Licensed Campus Accounts</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-1">
            <span className="text-[11px] font-mono font-bold text-[#99A9A0] uppercase tracking-wider">
              Student Seats
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-sky-300 tracking-tight">{studentsCount}</div>
            <div className="text-[11px] text-[#85998D] font-medium">BCA, CS, IT, MCA Batches</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-1">
            <span className="text-[11px] font-mono font-bold text-[#99A9A0] uppercase tracking-wider">
              Faculty Mentors
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-300 tracking-tight">{teachersCount}</div>
            <div className="text-[11px] text-[#85998D] font-medium">Department Cohort Mentors</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-1">
            <span className="text-[11px] font-mono font-bold text-[#99A9A0] uppercase tracking-wider">
              Campus TPOs
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-amber-300 tracking-tight">{tpoCount}</div>
            <div className="text-[11px] text-[#85998D] font-medium">Training & Placement Cell</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-search-users"
              name="admin-search-users"
              aria-label="Search users by name, roll no, email, or department"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no, email, or department..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#070B09] border border-[#1E2C24] rounded-xl">
              {[
                { id: "ALL", label: `All (${totalCount})` },
                { id: "STUDENT", label: `Students (${studentsCount})` },
                { id: "TEACHER", label: `Mentors (${teachersCount})` },
                { id: "TPO", label: `TPOs (${tpoCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === tab.id
                      ? "bg-[#9DFF00] text-[#070B09]"
                      : "text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Department Filter */}
            <ObsidianSelect value={String(deptFilter)} onChange={(val) => setDeptFilter(val)} options={[{ value: "ALL", label: "All Departments" }, { value: "BCA", label: "BCA" }, { value: "B.Sc CS", label: "B.Sc CS" }, { value: "B.Sc IT", label: "B.Sc IT" }, { value: "MCA", label: "MCA" }]} buttonClassName="px-3 py-1.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs font-medium text-[#F4F7F5] focus:border-[#9DFF00] focus:outline-none cursor-pointer" />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E2C24] flex items-center justify-between bg-[#121B16]">
            <h2 className="font-display text-sm font-bold tracking-tight text-[#F4F7F5]">
              Master User Roster ({filteredUsers.length} Users)
            </h2>
            <span className="text-xs text-[#85998D] font-mono">
              College: Annai Vailankanni Arts and Science College, Thanjavur
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2C24] bg-[#121B16] text-[#99A9A0] font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-bold">User</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Register / Staff ID</th>
                  <th className="py-3 px-4 font-bold">Department</th>
                  <th className="py-3 px-4 font-bold">Batch</th>
                  <th className="py-3 px-4 font-bold">Readiness Score</th>
                  <th className="py-3 px-4 font-bold text-right">Credentials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2C24]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#85998D]">
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isStudent = user.role === "student";
                    const isTeacher = user.role === "teacher";
                    const isTpo = user.role === "tpo" || user.role === "admin";

                    return (
                      <tr key={user.id} className="hover:bg-[#18241D] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#121B16] border border-[#1E2C24] flex items-center justify-center font-mono font-bold text-xs text-[#D5E0D9] shrink-0">
                              {user.full_name?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#F4F7F5] truncate">{user.full_name}</div>
                              <div className="text-[11px] text-[#85998D] font-mono truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                              isStudent
                                ? "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                                : isTeacher
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                            }`}
                          >
                            {isStudent && <GraduationCap className="w-3 h-3" />}
                            {isTeacher && <Briefcase className="w-3 h-3" />}
                            {isTpo && <Building2 className="w-3 h-3" />}
                            <span>{user.role}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-[#D5E0D9]">
                          {user.roll_no || " - "}
                        </td>

                        <td className="py-3.5 px-4 text-[#D5E0D9] font-medium">
                          {user.department || "General"}
                        </td>

                        <td className="py-3.5 px-4 font-mono tabular-nums text-[#99A9A0]">
                          {user.batch_year || 2026}
                        </td>

                        <td className="py-3.5 px-4">
                          {isStudent ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono tabular-nums font-bold text-[#F4F7F5]">
                                {user.readiness_score || 0}%
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-[#121B16] border border-[#1E2C24] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    (user.readiness_score || 0) >= 75
                                      ? "bg-emerald-500"
                                      : (user.readiness_score || 0) >= 60
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                  }`}
                                  style={{ width: `${Math.min(100, user.readiness_score || 0)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-[#85998D]">Faculty/TPO</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              notify(
                                `Reset credentials for ${user.full_name}: Default password set to 'College@2026'.`
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#121B16] text-[#D5E0D9] hover:text-[#9DFF00] hover:bg-[#18241D] transition-colors border border-[#1E2C24] hover:border-[#2C4034] cursor-pointer"
                            title="Reset password to College@2026"
                          >
                            <Key className="w-3 h-3 text-[#85998D]" />
                            <span>Reset Pass</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: Add Single User                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0C120F] rounded-2xl shadow-2xl border border-[#1E2C24] p-6 z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2C24]">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#9DFF00]" />
                  <h3 className="font-display font-extrabold text-base tracking-tight text-[#F4F7F5]">Provision New Institutional User</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-[#85998D] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#D5E0D9] mb-1">Role *</label>
                    <ObsidianSelect value={String(formData.role)} onChange={(val) => setFormData({ ...formData, role: val as UserRole })} options={[{ value: "student", label: "Student (Candidate)" }, { value: "teacher", label: "Faculty Mentor (Teacher)" }, { value: "tpo", label: "Training & Placement Officer (TPO)" }]} buttonClassName="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] focus:border-[#9DFF00] focus:outline-none font-medium" />
                  </div>

                  <div>
                    <label className="block font-bold text-[#D5E0D9] mb-1">Department *</label>
                    <ObsidianSelect value={String(formData.department)} onChange={(val) => setFormData({ ...formData, department: val })} options={[{ value: "BCA", label: "BCA" }, { value: "B.Sc CS", label: "B.Sc Computer Science" }, { value: "B.Sc IT", label: "B.Sc Information Tech" }, { value: "MCA", label: "MCA" }, { value: "Placement Cell", label: "Placement Cell" }]} buttonClassName="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] focus:border-[#9DFF00] focus:outline-none font-medium" />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-full-name" className="block font-bold text-[#D5E0D9] mb-1">Full Name *</label>
                  <input
                    id="admin-full-name"
                    name="admin-full-name"
                    aria-label="Full Name"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Aravind Kumar S."
                    className="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="admin-roll-no" className="block font-bold text-[#D5E0D9] mb-1">Register / Staff ID *</label>
                    <input
                      id="admin-roll-no"
                      name="admin-roll-no"
                      aria-label="Register or Staff ID"
                      type="text"
                      required
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      placeholder="e.g. 23BCA45 or STF-BCA-03"
                      className="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="admin-batch-year" className="block font-bold text-[#D5E0D9] mb-1">Batch Year</label>
                    <input
                      id="admin-batch-year"
                      name="admin-batch-year"
                      aria-label="Batch Year"
                      type="number"
                      value={formData.batchYear}
                      onChange={(e) => setFormData({ ...formData, batchYear: parseInt(e.target.value, 10) || 2026 })}
                      className="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-email" className="block font-bold text-[#D5E0D9] mb-1">Institutional Email *</label>
                  <input
                    id="admin-email"
                    name="admin-email"
                    aria-label="Institutional Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. 23bca45@annai.edu.in"
                    className="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="admin-college-name" className="block font-bold text-[#D5E0D9] mb-1">College Name</label>
                  <input
                    id="admin-college-name"
                    name="admin-college-name"
                    aria-label="College Name"
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#D5E0D9] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E2C24]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#D5E0D9] hover:bg-[#18241D] font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold transition-all shadow-md shadow-[#9DFF00]/20 cursor-pointer"
                  >
                    Provision User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: Bulk CSV Import                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#0C120F] rounded-2xl shadow-2xl border border-[#1E2C24] p-6 z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2C24]">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-display font-extrabold text-base tracking-tight text-[#F4F7F5]">Bulk User CSV Import</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 rounded-lg text-[#85998D] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Download sample templates */}
                <div className="p-3.5 rounded-xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#F4F7F5]">Need the official formatting?</div>
                    <div className="text-[11px] text-[#99A9A0]">Download formatted CSV templates for Excel</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("student")}
                      className="px-2.5 py-1.5 rounded-lg bg-[#070B09] hover:bg-[#18241D] border border-[#1E2C24] hover:border-[#2C4034] font-mono text-[11px] font-bold text-[#D5E0D9] cursor-pointer"
                    >
                      Student Template
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("staff")}
                      className="px-2.5 py-1.5 rounded-lg bg-[#070B09] hover:bg-[#18241D] border border-[#1E2C24] hover:border-[#2C4034] font-mono text-[11px] font-bold text-[#D5E0D9] cursor-pointer"
                    >
                      Staff Template
                    </button>
                  </div>
                </div>

                {/* Upload drag area */}
                <input
                  ref={fileInputRef}
                  id="admin-csv-file-upload"
                  name="admin-csv-file-upload"
                  aria-label="Upload CSV file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-[#2C4034] hover:border-[#9DFF00]/60 bg-[#070B09] hover:bg-[#121B16] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all focus:outline-none focus:border-[#9DFF00]"
                >
                  <UploadCloud className="w-8 h-8 text-[#85998D]" />
                  <div className="font-bold text-[#F4F7F5]">
                    {csvFileName ? csvFileName : "Click to select CSV file from your computer"}
                  </div>
                  <div className="text-[11px] text-[#85998D]">
                    Supports .csv files with columns: Name, Register_No, Email, Department
                  </div>
                  {parsedPreviewCount > 0 && (
                    <span className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-mono tabular-nums font-bold text-[10px]">
                      {parsedPreviewCount} student records detected
                    </span>
                  )}
                </div>

                {/* Manual CSV paste textarea */}
                <div>
                  <label className="block font-bold text-[#D5E0D9] mb-1">Or Paste CSV Text:</label>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => {
                      setCsvText(e.target.value);
                      const lines = e.target.value.split("\n").filter((l) => l.trim().length > 0);
                      setParsedPreviewCount(Math.max(0, lines.length - 1));
                    }}
                    placeholder="Name,Register_No,Email,Department,Batch_Year&#10;Aravind S,23BCA01,aravind@annai.edu.in,BCA,2026"
                    className="w-full p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] font-mono text-[11px] focus:border-[#9DFF00] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E2C24]">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#D5E0D9] hover:bg-[#18241D] font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteCsvImport}
                    disabled={!csvText.trim()}
                    className={`px-5 py-2 rounded-xl font-bold transition-all ${
                      csvText.trim()
                        ? "bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] shadow-md shadow-[#9DFF00]/20 cursor-pointer"
                        : "bg-[#121B16] text-[#85998D] border border-[#1E2C24] cursor-not-allowed"
                    }`}
                  >
                    Import {parsedPreviewCount > 0 ? `${parsedPreviewCount} Users` : "CSV"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
