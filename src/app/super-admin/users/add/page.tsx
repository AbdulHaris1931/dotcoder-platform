"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SuperAdminService, AccountStatus } from "@/lib/services/super-admin-service";
import { generateSecureTempPassword } from "@/lib/services/user-credentials";
import {
  UserPlus,
  ChevronLeft,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  Key,
  Mail,
  Check,
  Copy,
} from "lucide-react";

function AddUserFormContent() {
  const searchParams = useSearchParams();

  // Initial role from query parameter
  const initialRole = (searchParams.get("role") || "STUDENT").toUpperCase();
  const validInitialRole =
    initialRole === "MENTOR" ? "teacher" : initialRole === "TPO" ? "tpo" : "student";

  const [role, setRole] = useState<"student" | "teacher" | "tpo">(validInitialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [rollNo, setRollNo] = useState("");
  const [batchYear, setBatchYear] = useState(2026);
  const [collegeName, setCollegeName] = useState(
    "Annai Vailankanni Arts and Science College, Thanjavur"
  );
  const [accountStatus, setAccountStatus] = useState<AccountStatus>("active");
  const [passwordOption, setPasswordOption] = useState<"temp_password" | "invite_link">(
    "temp_password"
  );
  const [tempPassword, setTempPassword] = useState(() => generateSecureTempPassword(12));

  // Form Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    tempPassword?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage("Full Name and Email Address are mandatory.");
      return;
    }

    if (role === "student" && !rollNo.trim()) {
      setErrorMessage("Roll number is mandatory for student candidate records.");
      return;
    }

    setIsSubmitting(true);
    const chosenPassword =
      passwordOption === "temp_password"
        ? tempPassword.trim() || generateSecureTempPassword(12)
        : generateSecureTempPassword(14);

    try {
      // 1. Attempt Live Server-Side Supabase Provisioning first
      const apiRes = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          department: department.trim(),
          rollNo: rollNo.trim(),
          batchYear,
          collegeName: collegeName.trim(),
          password: chosenPassword,
          sendWelcomeEmail: passwordOption === "invite_link",
        }),
      });

      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && apiData.success && apiData.user) {
        // Also mirror in client store for instant UI visibility
        SuperAdminService.createUser({
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          department: department.trim(),
          rollNo: rollNo.trim(),
          batchYear,
          collegeName: collegeName.trim(),
          accountStatus,
          passwordOption,
          tempPassword: chosenPassword,
        });

        setIsSubmitting(false);
        setSuccessResult({
          id: apiData.user.id,
          fullName: apiData.user.full_name,
          email: apiData.user.email,
          role: apiData.user.role,
          tempPassword: chosenPassword,
        });
        return;
      }

      // If server returned a real validation/duplicate error (not 503 demo fallback), surface it
      if (apiRes.status !== 503 && apiData.mode !== "local_demo_fallback") {
        setIsSubmitting(false);
        setErrorMessage(apiData.error || "Failed to provision user on server.");
        return;
      }
    } catch {
      // Network/offline fallback into Local Demo Mode
    }

    // 2. Local Demo Mode fallback (when SUPABASE_SERVICE_ROLE_KEY is unconfigured)
    const res = SuperAdminService.createUser({
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      department: department.trim(),
      rollNo: rollNo.trim(),
      batchYear,
      collegeName: collegeName.trim(),
      accountStatus,
      passwordOption,
      tempPassword: chosenPassword,
    });

    setIsSubmitting(false);

    if (res.success && res.user) {
      setSuccessResult({
        id: res.user.id,
        fullName: res.user.full_name,
        email: res.user.email || email,
        role: res.user.role,
        tempPassword: chosenPassword,
      });
    } else {
      setErrorMessage(res.error || "Failed to provision user.");
    }
  };

  const handleCopyCredentials = () => {
    const text = `EQLV CODE Account:\nEmail: ${successResult?.email}\nTemporary Password: ${successResult?.tempPassword}\nPortal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#99A9A0]">
        <Link href="/super-admin/users" className="hover:text-[#F4F7F5] flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Users</span>
        </Link>
        <span>/</span>
        <span className="text-[#F4F7F5]">Add User</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F4F7F5] tracking-tight flex items-center gap-2">
          <span>Provision New Account</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0C120F] border border-[#1E2C24] text-[#9DFF00]">
            SUPER ADMIN
          </span>
        </h1>
        <p className="text-xs text-[#99A9A0] mt-1">
          Create an official account for one of the three accredited application roles: Mentor, Student, or TPO.
        </p>
      </div>

      {/* Success Confirmation Card */}
      {successResult ? (
        <div className="p-6 rounded-2xl bg-[#0C120F] border border-[#9DFF00]/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#9DFF00]/10 border border-[#9DFF00]/30 flex items-center justify-center text-[#9DFF00]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#F4F7F5]">Account Successfully Provisioned</h3>
              <p className="text-xs text-[#99A9A0] font-mono">
                {successResult.fullName} ({successResult.email}) has been enrolled as{" "}
                {successResult.role.toUpperCase()}.
              </p>
            </div>
          </div>

          {successResult.tempPassword && (
            <div className="p-4 rounded-xl bg-[#070B09] border border-[#1E2C24] space-y-2 font-mono text-xs">
              <div className="text-[#99A9A0] text-[11px]">Temporary Password Credentials:</div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0C120F] border border-amber-500/30">
                <span className="font-bold text-amber-400">{successResult.tempPassword}</span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="px-2.5 py-1 rounded bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-xs font-bold text-[#F4F7F5] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Credentials"}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/super-admin/users/${successResult.id}`}
              className="px-4 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs font-mono"
            >
              View User Dossier
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccessResult(null);
                setFullName("");
                setEmail("");
                setRollNo("");
              }}
              className="px-4 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-[#F4F7F5] font-bold text-xs font-mono"
            >
              Add Another User
            </button>
          </div>
        </div>
      ) : (
        /* Add User Form */
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Selection Tabs (Only 3 Allowed Roles) */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-[#99A9A0] font-bold tracking-wider">
              1. Select Application Role <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Mentor */}
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  role === "teacher"
                    ? "bg-sky-500/10 border-sky-400 text-[#F4F7F5]"
                    : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <GraduationCap className={`w-4 h-4 ${role === "teacher" ? "text-sky-400" : "text-[#85998D]"}`} />
                  {role === "teacher" && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                </div>
                <div className="font-bold text-xs text-[#F4F7F5]">Mentor (Faculty)</div>
                <div className="text-[10px] text-[#99A9A0] leading-tight">Assignments, code grading, academic cohort tracking.</div>
              </button>

              {/* Student */}
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  role === "student"
                    ? "bg-[#9DFF00]/10 border-[#9DFF00] text-[#F4F7F5]"
                    : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Users className={`w-4 h-4 ${role === "student" ? "text-[#9DFF00]" : "text-[#85998D]"}`} />
                  {role === "student" && <span className="w-2 h-2 rounded-full bg-[#9DFF00]" />}
                </div>
                <div className="font-bold text-xs text-[#F4F7F5]">Student (Candidate)</div>
                <div className="text-[10px] text-[#99A9A0] leading-tight">Monaco IDE practice, assessments, placement drives.</div>
              </button>

              {/* TPO */}
              <button
                type="button"
                onClick={() => setRole("tpo")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  role === "tpo"
                    ? "bg-amber-500/10 border-amber-400 text-[#F4F7F5]"
                    : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Briefcase className={`w-4 h-4 ${role === "tpo" ? "text-amber-400" : "text-[#85998D]"}`} />
                  {role === "tpo" && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <div className="font-bold text-xs text-[#F4F7F5]">TPO (Placement)</div>
                <div className="text-[10px] text-[#99A9A0] leading-tight">Company drives, student eligibility, placement metrics.</div>
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-4 pt-2 border-t border-[#1E2C24]">
            <div className="text-xs font-mono uppercase text-[#99A9A0] font-bold tracking-wider">
              2. Core Identity Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-user-fullname" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="add-user-fullname"
                  name="add-user-fullname"
                  aria-label="Full Name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Karthik Raman"
                  className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
                />
              </div>

              <div>
                <label htmlFor="add-user-email" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  id="add-user-email"
                  name="add-user-email"
                  aria-label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. karthik.r@avasc.edu.in"
                  className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-user-college" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">
                  Institution / College
                </label>
                <input
                  id="add-user-college"
                  name="add-user-college"
                  aria-label="Institution or College Name"
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
                />
              </div>

              <div>
                <label htmlFor="add-user-account-status" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">
                  Initial Account Status
                </label>
                <ObsidianSelect id="add-user-account-status" ariaLabel="Initial Account Status" value={String(accountStatus)} onChange={(val) => setAccountStatus(val as AccountStatus)} options={[{ value: "active", label: "Active (Immediate Portal Access)" }, { value: "inactive", label: "Inactive (Pending Semester Activation)" }, { value: "suspended", label: "Suspended (Blocked from Login)" }]} buttonClassName="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] focus:outline-hidden focus:border-[#9DFF00]" />
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          <div className="space-y-4 pt-2 border-t border-[#1E2C24]">
            <div className="text-xs font-mono uppercase text-[#99A9A0] font-bold tracking-wider">
              3. Role Attributes ({role.toUpperCase()})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="add-user-department" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">
                  Department
                </label>
                <input
                  id="add-user-department"
                  name="add-user-department"
                  aria-label="Department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. BCA, CSE, IT"
                  className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
                />
              </div>

              <div>
                <label htmlFor="add-user-rollno" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">
                  {role === "student" ? "Roll / Reg Number" : "Staff / Employee ID"}
                  {role === "student" && <span className="text-rose-400"> *</span>}
                </label>
                <input
                  id="add-user-rollno"
                  name="add-user-rollno"
                  aria-label={role === "student" ? "Roll or Registration Number" : "Staff or Employee ID"}
                  type="text"
                  required={role === "student"}
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder={role === "student" ? "e.g. 23BCA42" : "e.g. FAC-CSE-09"}
                  className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
                />
              </div>

              <div>
                <label htmlFor="add-user-batchyear" className="block text-xs text-[#D5E0D9] font-bold mb-1.5">
                  {role === "student" ? "Graduation Year" : "Academic Batch"}
                </label>
                <input
                  id="add-user-batchyear"
                  name="add-user-batchyear"
                  aria-label={role === "student" ? "Graduation Year" : "Academic Batch"}
                  type="number"
                  value={batchYear}
                  onChange={(e) => setBatchYear(Number(e.target.value))}
                  className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
                />
              </div>
            </div>
          </div>

          {/* Password & Onboarding Options */}
          <div className="space-y-4 pt-2 border-t border-[#1E2C24]">
            <div className="text-xs font-mono uppercase text-[#99A9A0] font-bold tracking-wider">
              4. Password & Onboarding Method
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                htmlFor="password-option-temp"
                className={`p-3.5 rounded-xl border text-left cursor-pointer flex flex-col gap-1 transition-all ${
                  passwordOption === "temp_password"
                    ? "bg-[#070B09] border-[#9DFF00] text-[#F4F7F5]"
                    : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="password-option-temp"
                      type="radio"
                      name="passwordOption"
                      aria-label="Generate Temporary Password"
                      checked={passwordOption === "temp_password"}
                      onChange={() => setPasswordOption("temp_password")}
                      className="text-[#9DFF00]"
                    />
                    <span className="font-bold text-xs text-[#F4F7F5]">Generate Temporary Password</span>
                  </div>
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[10px] text-[#99A9A0] pl-5">
                  Provides immediate login credentials to give the user or print in cohort rosters.
                </p>
              </label>

              <label
                htmlFor="password-option-invite"
                className={`p-3.5 rounded-xl border text-left cursor-pointer flex flex-col gap-1 transition-all ${
                  passwordOption === "invite_link"
                    ? "bg-[#070B09] border-[#9DFF00] text-[#F4F7F5]"
                    : "bg-[#070B09] border-[#1E2C24] text-[#99A9A0]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="password-option-invite"
                      type="radio"
                      name="passwordOption"
                      aria-label="Send Email Invitation Link"
                      checked={passwordOption === "invite_link"}
                      onChange={() => setPasswordOption("invite_link")}
                      className="text-[#9DFF00]"
                    />
                    <span className="font-bold text-xs text-[#F4F7F5]">Send Email Invitation Link</span>
                  </div>
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <p className="text-[10px] text-[#99A9A0] pl-5">
                  Dispatches a secure Supabase Auth magic link for the student/mentor to set their own password.
                </p>
              </label>
            </div>

            {passwordOption === "temp_password" && (
              <div className="pt-2">
                <label htmlFor="add-user-temp-password" className="block text-xs text-[#D5E0D9] font-bold mb-1">
                  Assign Temporary Password
                </label>
                <input
                  id="add-user-temp-password"
                  name="add-user-temp-password"
                  aria-label="Assign Temporary Password"
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs font-mono text-amber-400 focus:outline-hidden focus:border-[#9DFF00]"
                />
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2C24]">
            <Link
              href="/super-admin/users"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#99A9A0] hover:text-[#F4F7F5]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] disabled:opacity-50 text-[#070B09] font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? "Provisioning..." : `Create ${role.toUpperCase()} Account`}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AddUserPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#99A9A0] font-mono">
          Loading user provisioning wizard...
        </div>
      }
    >
      <AddUserFormContent />
    </Suspense>
  );
}
