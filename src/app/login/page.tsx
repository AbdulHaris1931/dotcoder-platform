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

    // Demo Mode Sign In Fallback
    setTimeout(() => {
      setLoading(false);
      const isCandidateAdmin = email.toLowerCase().includes("admin") || email.toLowerCase().includes("tpo");
      if (isCandidateAdmin) {
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

    const effectiveCollege =
      signupRole === "admin"
        ? institutionName || "Cauvery Institute of Technology, Thanjavur"
        : isCustomCollege
        ? customCollege || "State Technical University"
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
              roll_no: rollNo || "22CS001",
              department: department || "CSE",
              batch_year: batchYear || 2026,
            },
          },
        });

        if (error) throw error;

        setSuccessMsg("Account successfully provisioned! Redirecting to workspace...");
        setTimeout(() => {
          if (signupRole === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/student/dashboard");
          }
        }, 800);
        return;
      } catch (err: any) {
        setErrorMsg(err.message || "Registration encountered an error. Please try again.");
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
    <div className="min-h-screen w-full grid lg:grid-cols-12 bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      {/* Left Column: Form & Persona Switching (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 border-r border-slate-200/90 relative z-10 bg-white/95 backdrop-blur-xl overflow-y-auto max-h-screen">
        {/* Top Brand Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                DotCoder
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Open SaaS
                </span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Self-Serve Campus Placement & Assessment Platform
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                authMode === "signin"
                  ? "bg-white text-indigo-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
              className={`py-2 rounded-xl transition-all ${
                authMode === "signup"
                  ? "bg-white text-indigo-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {authMode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu or admin@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 btn-luxury-primary text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Role Toggle */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole("student")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      signupRole === "student"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>I am a Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole("admin")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      signupRole === "admin"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span>College Admin</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adithya K. Sundaram"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    {signupRole === "admin" ? "Official Work Email" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Student Fields */}
              {signupRole === "student" && (
                <>
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                        College / Institution
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCollege(!isCustomCollege)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 font-mono font-bold"
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
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
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
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                        {showCollegeDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-100">
                            {filteredColleges.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCollegeName(c);
                                  setShowCollegeDropdown(false);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
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
                      <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 22CS001"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
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
                      <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                        Batch
                      </label>
                      <select
                        value={batchYear}
                        onChange={(e) => setBatchYear(Number(e.target.value))}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
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

              {/* Admin Fields */}
              {signupRole === "admin" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Institution / University / Academy Name
                  </label>
                  <div className="relative">
                    <School className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cauvery Institute of Technology"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 btn-luxury-primary text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <span>{loading ? "Registering in Supabase..." : "Create Account & Start"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Instant Demo Preview Strip */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between font-bold">
              <span>Instant Evaluator Demo</span>
              <span className="text-indigo-600">Zero Signup</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLaunchStudentDemo}
                className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Student Lab</span>
              </button>
              <button
                type="button"
                onClick={handleLaunchAdminDemo}
                className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Admin Suite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-2">
          <span>Open Self-Serve SaaS</span>
          <span>Supabase PostgreSQL 17</span>
        </div>
      </div>

      {/* Right Column: Visual Telemetry Showcase (7 cols) */}
      <div className="lg:col-span-7 hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-stripe-mesh">
        <div className="w-full max-w-lg space-y-6 relative z-10">
          <div className="rounded-3xl p-8 bg-white border border-slate-200/90 shadow-luxury space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs text-slate-900 font-bold tracking-wide">
                  OPEN SAAS ONBOARDING LIVE
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
                Multi-Tenant
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Self-Serve Architecture</div>
                <div className="text-slate-700 font-sans text-xs leading-relaxed font-medium">
                  Students from any engineering or arts college can sign up independently, practice on real company placement challenges, and benchmark their readiness across state percentiles.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Institution Autonomy</div>
                <div className="text-slate-700 font-sans text-xs leading-relaxed font-medium">
                  Placement Officers can filter analytics by their specific college, manage custom Question Banks, and publish proctored tests with 1-click NAAC CSV export.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                PostgreSQL Trigger Auto-Provisioning
              </span>
              <span className="text-slate-400 font-medium">Zero Race Conditions</span>
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500 font-mono text-xs">
          Loading authentication portal...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
