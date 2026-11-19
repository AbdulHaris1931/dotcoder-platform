"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShowcasePanel } from "@/components/auth/auth-showcase-panel";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import { DemoStore } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertTriangle, CheckCircle2, User, Mail, Lock, GraduationCap, Building2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              college_name: "Annai Vailankanni Arts and Science College, Thanjavur",
              roll_no: role === "admin" ? "AV-TPO-01" : "23BCA01",
              department: role === "admin" ? "Placement Cell" : "BCA",
              batch_year: 2026,
            },
          },
        });

        if (error) throw error;

        setSuccessMsg("Account successfully provisioned! Redirecting to workspace...");
        setTimeout(() => {
          if (role === "admin") {
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

    // Demo Mode fallback
    setTimeout(() => {
      setLoading(false);
      DemoStore.setCurrentUser({
        id: `user-${Date.now()}`,
        email,
        full_name: fullName || (role === "admin" ? "Placement Officer" : "Candidate"),
        role: role,
        college_name: "Annai Vailankanni Arts and Science College, Thanjavur",
        roll_no: role === "admin" ? "AV-TPO-01" : "23BCA01",
        department: role === "admin" ? "Placement Cell" : "BCA",
        batch_year: 2026,
        readiness_score: 75,
        problems_solved: 0,
        created_at: new Date().toISOString(),
      });

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F4F7F4] font-sans text-slate-900">
      {/* Left Code Showcase Panel matching Screen 10 */}
      <AuthShowcasePanel />

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto bg-white">
        {/* Top Header / Switcher */}
        <div className="flex items-center justify-between mb-8">
          <div className="lg:hidden">
            <DotCoderLogo size="md" theme="light" />
          </div>
          <div className="ml-auto inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0F1412] text-white shadow-xs"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Create an account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Join Annai Vailankanni Arts and Science College on DotCoder.
            </p>
          </div>

          {/* Role selector pill */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                role === "student"
                  ? "bg-[#0F1412] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                role === "admin"
                  ? "bg-[#0F1412] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>TPO / Admin</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Karthik S."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAF8] border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4F82A] focus:border-slate-800 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="karthik.bca@avc.edu.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAF8] border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4F82A] focus:border-slate-800 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAF8] border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4F82A] focus:border-slate-800 transition-all font-medium"
                />
              </div>
            </div>

            {/* Neon Lime Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#C4F82A] hover:bg-[#B5EA20] text-black font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              <span>{loading ? "Creating workspace..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switcher */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="text-xs font-bold text-slate-900 hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-6">
          By signing up, you agree to our Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
