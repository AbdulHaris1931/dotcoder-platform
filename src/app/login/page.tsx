"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { DemoStore } from "@/lib/demo-store";
import { POPULAR_COLLEGES, UserRole } from "@/types";
import {
  Code2,
  GraduationCap,
  Building2,
  Lock,
  Mail,
  User,
  School,
  Hash,
  BookOpen,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Search,
} from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  // Target Signup Role: 'student' | 'admin'
  const [signupRole, setSignupRole] = useState<"student" | "admin">("student");

  // Common Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Student Specific Fields
  const [collegeName, setCollegeName] = useState("Cauvery Institute of Technology, Thanjavur");
  const [customCollege, setCustomCollege] = useState("");
  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [rollNo, setRollNo] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [batchYear, setBatchYear] = useState(2026);

  // Admin Specific Field
  const [institutionName, setInstitutionName] = useState("");

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("tab") === "signup") {
      setAuthMode("signup");
    }
  }, [searchParams]);

  // Filtered colleges for combobox
  const filteredColleges = POPULAR_COLLEGES.filter((c) =>
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  // Quick Instant Pitch Demo Launch
  const handleLaunchStudentDemo = () => {
    DemoStore.switchRole("student");
    router.push("/student/dashboard");
  };

  const handleLaunchAdminDemo = () => {
    DemoStore.switchRole("tpo");
    router.push("/admin/dashboard");
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check role in profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          if (profile?.role === "admin" || profile?.role === "super_admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/student/dashboard");
          }
          return;
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Invalid email or password.");
        setLoading(false);
        return;
      }
    }

    // Fallback in demo mode
    setTimeout(() => {
      setLoading(false);
      if (email.toLowerCase().includes("admin") || email.toLowerCase().includes("tpo")) {
        DemoStore.switchRole("tpo");
        router.push("/admin/dashboard");
      } else {
        DemoStore.switchRole("student");
        router.push("/student/dashboard");
      }
    }, 400);
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const effectiveCollege =
      signupRole === "admin"
        ? institutionName || "Independent Academy"
        : isCustomCollege
        ? customCollege || "Independent / General"
        : collegeName;

    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: signupRole,
              college_name: effectiveCollege,
              roll_no: signupRole === "student" ? rollNo || `ROLL-${Date.now().toString().slice(-4)}` : "ADMIN-01",
              department: signupRole === "student" ? department : "Administration",
              batch_year: batchYear,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg("Account created successfully! Redirecting to workspace...");
          setTimeout(() => {
            if (signupRole === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/student/dashboard");
            }
          }, 800);
          return;
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to create account.");
        setLoading(false);
        return;
      }
    }

    // Demo Mode Sign Up Fallback
    setTimeout(() => {
      setLoading(false);
      DemoStore.setCurrentUser({
        id: `user-${Date.now()}`,
        email,
        full_name: fullName || (signupRole === "admin" ? "Placement Officer" : "Candidate"),
        role: signupRole,
        college_name: effectiveCollege,
        roll_no: rollNo || "GEN-001",
        department: department || "CSE",
        batch_year: batchYear,
        readiness_score: 70,
        problems_solved: 0,
        created_at: new Date().toISOString(),
      });

      if (signupRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-12 bg-[#09090B] text-slate-100 overflow-hidden font-sans">
      {/* Left Column: Form & Persona Switching (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 border-r border-white/[0.08] relative z-10 bg-[#0C0C0E]/95 backdrop-blur-xl overflow-y-auto max-h-screen">
        {/* Top Brand Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_24px_-2px_rgba(99,102,241,0.6)]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                DotCoder
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Open SaaS
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                Self-Serve Campus Placement & Assessment Platform
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs: Sign In vs Create Account */}
          <div className="grid grid-cols-2 p-1 bg-[#141418] border border-white/[0.08] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                authMode === "signin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                authMode === "signup"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {authMode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu or admin@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT (Self-Serve Open Signup) */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Role Toggle: Student vs Admin */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole("student")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      signupRole === "student"
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                        : "bg-[#111114] border-white/[0.06] text-slate-400 hover:text-white"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>I am a Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole("admin")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      signupRole === "admin"
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm"
                        : "bg-[#111114] border-white/[0.06] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>I am College Admin</span>
                  </button>
                </div>
              </div>

              {/* Common: Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adithya K. Sundaram"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Common: Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    {signupRole === "admin" ? "Official Work Email" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* STUDENT FIELDS: College Picker, Roll No, Dept, Year */}
              {signupRole === "student" && (
                <>
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono uppercase text-slate-400">
                        College / Institution
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCollege(!isCustomCollege)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono"
                      >
                        {isCustomCollege ? "Pick from list" : "Other / Type Custom"}
                      </button>
                    </div>

                    {isCustomCollege ? (
                      <input
                        type="text"
                        placeholder="Type your college name..."
                        value={customCollege}
                        onChange={(e) => setCustomCollege(e.target.value)}
                        className="w-full px-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search university or college..."
                          value={collegeName}
                          onFocus={() => setShowCollegeDropdown(true)}
                          onChange={(e) => {
                            setCollegeName(e.target.value);
                            setCollegeSearch(e.target.value);
                            setShowCollegeDropdown(true);
                          }}
                          className="w-full px-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        {showCollegeDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-[#141418] border border-white/[0.1] rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-white/[0.04]">
                            {filteredColleges.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCollegeName(c);
                                  setShowCollegeDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 22CS001"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full px-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-2 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      >
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="Mech">MECH</option>
                        <option value="Other">OTHER</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400">
                        Batch
                      </label>
                      <select
                        value={batchYear}
                        onChange={(e) => setBatchYear(Number(e.target.value))}
                        className="w-full px-2 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      >
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                        <option value={2028}>2028</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ADMIN FIELDS: Institution Name */}
              {signupRole === "admin" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">
                    Institution / University / Academy Name
                  </label>
                  <div className="relative">
                    <School className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cauvery Institute of Technology"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Registering in Supabase..." : "Create Account & Start"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Quick Instant Pitch Preview Strip (Zero Credentials Demo) */}
          <div className="pt-4 border-t border-white/[0.06] space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Instant Evaluator Demo</span>
              <span className="text-indigo-400">Zero Signup</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLaunchStudentDemo}
                className="py-2 px-3 rounded-lg bg-[#141418] hover:bg-[#1c1c22] border border-white/[0.06] text-[11px] font-medium text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student Lab</span>
              </button>
              <button
                type="button"
                onClick={handleLaunchAdminDemo}
                className="py-2 px-3 rounded-lg bg-[#141418] hover:bg-[#1c1c22] border border-white/[0.06] text-[11px] font-medium text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Suite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-2">
          <span>Open Self-Serve SaaS</span>
          <span>Supabase SSR Engine</span>
        </div>
      </div>

      {/* Right Column: Visual Telemetry Showcase (7 cols) */}
      <div className="lg:col-span-7 hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-[#09090B]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-lg space-y-4 relative z-10">
          <div className="card-obsidian rounded-2xl p-6 border-white/[0.1] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-white font-semibold tracking-wide">
                  OPEN SAAS ONBOARDING LIVE
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Multi-Tenant
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Self-Serve Architecture</div>
                <div className="text-white font-sans text-xs leading-relaxed">
                  Students from any engineering or arts college can sign up independently, practice on 10+ real placement challenges, and benchmark their readiness across state percentiles.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="text-[10px] text-slate-500 uppercase">Institution Autonomy</div>
                <div className="text-white font-sans text-xs leading-relaxed">
                  Placement Officers can filter analytics by their specific college, manage custom Question Banks, and publish proctored tests with 1-click NAAC CSV export.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                PostgreSQL Trigger Auto-Provisioning
              </span>
              <span className="text-slate-500">Zero Race Conditions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-slate-500 font-mono text-xs">
          Loading authentication portal...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
