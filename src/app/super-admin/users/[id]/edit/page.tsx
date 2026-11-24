"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SuperAdminService, ManagedUser } from "@/lib/services/super-admin-service";
import {
  ChevronLeft,
  AlertTriangle,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Users,
  Check,
} from "lucide-react";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<ManagedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "tpo">("student");
  const [initialRole, setInitialRole] = useState<string>("student");
  const [department, setDepartment] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [batchYear, setBatchYear] = useState(2026);
  const [collegeName, setCollegeName] = useState("");

  // Role Change Confirmation Dialog State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleChangeReason, setRoleChangeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      setIsLoading(true);
      let found: ManagedUser | null = null;
      try {
        const res = await fetch(`/api/super-admin/users/${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) found = data.user;
        }
      } catch {}

      if (!found) {
        found = SuperAdminService.getUserById(userId);
      }

      if (cancelled) return;

      if (found) {
        setUser(found);
        setFullName(found.full_name);
        setEmail(found.email || "");
        const normalizedRole =
          found.role === "teacher"
            ? "teacher"
            : found.role === "tpo" || found.role === "admin"
            ? "tpo"
            : "student";
        setRole(normalizedRole);
        setInitialRole(found.role);
        setDepartment(found.department || "");
        setRollNo(found.roll_no || "");
        setBatchYear(found.batch_year || new Date().getFullYear());
        setCollegeName(found.college_name || "");
      }
      setIsLoading(false);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#99A9A0] font-mono text-xs">
        Loading user account...
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

  const isOwner =
    user.email === "owner@eqlv.code" ||
    user.email?.toLowerCase() === "mmam92005@gmail.com" ||
    user.id === "usr-super-admin-owner" ||
    user.id === "c8d50800-aae2-42b6-84a7-f10241621c5a";
  if (isOwner) {
    return (
      <div className="p-8 text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-sm font-display font-bold text-[#F4F7F5]">Owner Account Protected</h2>
        <p className="text-xs text-[#99A9A0]">The Sovereign Owner identity cannot be edited via ordinary user management.</p>
        <Link href="/super-admin/users" className="text-xs text-[#9DFF00] underline font-mono">
          Return to All Users
        </Link>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If role changed from initial, trigger confirmation modal
    if (role !== initialRole) {
      setIsRoleModalOpen(true);
      return;
    }

    executeUpdate();
  };

  const executeUpdate = async () => {
    setIsSubmitting(true);
    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      role,
      department: department.trim(),
      roll_no: rollNo.trim(),
      batch_year: batchYear,
      college_name: collegeName.trim(),
    };

    try {
      const apiRes = await fetch(`/api/super-admin/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success) {
        setIsSubmitting(false);
        setIsRoleModalOpen(false);
        router.push(`/super-admin/users/${userId}`);
        return;
      }
      if (apiRes.status !== 503 && apiData.mode !== "local_demo_fallback") {
        setIsSubmitting(false);
        setErrorMessage(apiData.error || "Update rejected.");
        return;
      }
    } catch {}

    const res = SuperAdminService.updateUser(
      userId,
      payload,
      role !== initialRole ? roleChangeReason || "Administrative role transition" : "Profile metadata edit"
    );

    setIsSubmitting(false);

    if (res.success) {
      setIsRoleModalOpen(false);
      router.push(`/super-admin/users/${userId}`);
    } else {
      setErrorMessage(res.error || "Update rejected.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#99A9A0]">
        <Link href={`/super-admin/users/${userId}`} className="hover:text-[#F4F7F5] flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>User Dossier</span>
        </Link>
        <span>/</span>
        <span className="text-[#F4F7F5]">Edit Profile</span>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F4F7F5] tracking-tight">
          Edit User Profile
        </h1>
        <p className="text-xs text-[#99A9A0] mt-1">
          Update account metadata and academic affiliation for <strong className="text-[#F4F7F5]">{user.full_name}</strong>.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role Switcher with Safeguards */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase text-[#99A9A0] font-bold tracking-wider">
            Role Assignment (3 Allowed Roles Only)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                role === "teacher"
                  ? "bg-sky-500/10 border-sky-400 text-[#F4F7F5] font-bold"
                  : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034]"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span className="text-xs">Mentor</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("student")}
              className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                role === "student"
                  ? "bg-[#9DFF00]/10 border-[#9DFF00] text-[#F4F7F5] font-bold"
                  : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034]"
              }`}
            >
              <Users className="w-4 h-4 text-[#9DFF00]" />
              <span className="text-xs">Student</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("tpo")}
              className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                role === "tpo"
                  ? "bg-amber-500/10 border-amber-400 text-[#F4F7F5] font-bold"
                  : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034]"
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span className="text-xs">TPO</span>
            </button>
          </div>
        </div>

        {/* Identity Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-user-fullname" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">Full Name</label>
            <input
              id="edit-user-fullname"
              name="edit-user-fullname"
              aria-label="Full Name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
            />
          </div>

          <div>
            <label htmlFor="edit-user-email" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">Email Address</label>
            <input
              id="edit-user-email"
              name="edit-user-email"
              aria-label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="edit-user-department" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">Department</label>
            <input
              id="edit-user-department"
              name="edit-user-department"
              aria-label="Department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
            />
          </div>

          <div>
            <label htmlFor="edit-user-rollno" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">Roll / Staff No</label>
            <input
              id="edit-user-rollno"
              name="edit-user-rollno"
              aria-label="Roll or Staff Number"
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] font-mono placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
            />
          </div>

          <div>
            <label htmlFor="edit-user-batchyear" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">Batch Year</label>
            <input
              id="edit-user-batchyear"
              name="edit-user-batchyear"
              aria-label="Batch Year"
              type="number"
              value={batchYear}
              onChange={(e) => setBatchYear(Number(e.target.value))}
              className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] font-mono placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-user-college" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">Institution / College</label>
          <input
            id="edit-user-college"
            name="edit-user-college"
            aria-label="Institution or College Name"
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2C24]">
          <Link
            href={`/super-admin/users/${userId}`}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#99A9A0] hover:text-[#F4F7F5]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* Role Transition Safeguard Confirmation Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0C120F] border border-amber-500/40 p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Role Transition</span>
            </div>
            <p className="text-[#D5E0D9] leading-relaxed">
              You are changing the account role for <strong className="text-[#F4F7F5]">{user.full_name}</strong> from{" "}
              <span className="font-mono text-[#F4F7F5] uppercase">{initialRole}</span> to{" "}
              <span className="font-mono text-[#9DFF00] uppercase font-bold">{role}</span>.
            </p>
            <div className="p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#99A9A0] space-y-1">
              <div>&bull; User portal permissions will update immediately.</div>
              <div>&bull; Historical submissions, assessment records, and placement data are safely preserved.</div>
              <div>&bull; This transition is permanently logged in the audit trail.</div>
            </div>

            <div>
              <label htmlFor="role-change-reason" className="block text-[11px] font-mono text-[#D5E0D9] mb-1">
                Reason for Role Change:
              </label>
              <input
                id="role-change-reason"
                name="role-change-reason"
                aria-label="Reason for Role Change"
                type="text"
                value={roleChangeReason}
                onChange={(e) => setRoleChangeReason(e.target.value)}
                placeholder="e.g. Promoted to departmental placement officer..."
                className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeUpdate}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#070B09] font-bold text-xs"
              >
                Confirm & Apply Role Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
