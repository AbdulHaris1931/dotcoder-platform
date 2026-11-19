"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShowcasePanel } from "@/components/auth/auth-showcase-panel";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import { DemoStore } from "@/lib/demo-store";
import { SEED_TPO } from "@/lib/seed-data";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotHint, setShowForgotHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("tab") === "signup") {
      router.replace("/signup");
    }
  }, [searchParams, router]);

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
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profile) {
            DemoStore.setCurrentUser({
              id: profile.id,
              email: data.user.email || profile.email || "",
              full_name: profile.full_name || "Campus User",
              role: profile.role || "student",
              college_name: profile.college_name || "Annai Vailankanni Arts and Science College, Thanjavur",
              roll_no: profile.roll_no || "",
              department: profile.department || "",
              batch_year: profile.batch_year || 2026,
              readiness_score: Number(profile.readiness_score) || 0,
              problems_solved: profile.problems_solved || 0,
              created_at: profile.created_at,
            });
          }

          if (profile?.role === "admin" || profile?.role === "super_admin" || profile?.role === "tpo") {
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

    // Local fallback sign-in
    setTimeout(() => {
      setLoading(false);
      const isCandidateAdmin =
        email.toLowerCase().includes("admin") ||
        email.toLowerCase().includes("tpo") ||
        email.toLowerCase().includes("faculty");

      if (isCandidateAdmin) {
        DemoStore.setCurrentUser(SEED_TPO);
        router.push("/admin/dashboard");
      } else {
        const students = DemoStore.getStudents();
        const matched = students.find((s) => s.email?.toLowerCase() === email.toLowerCase());
        DemoStore.setCurrentUser(matched || students[0]);
        router.push("/student/dashboard");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F4F7F4] font-sans text-slate-900">
      {/* Left Code Showcase Panel (Desktop) matching Screen 10 */}
      <AuthShowcasePanel />

      {/* Right Form Panel matching Screen 10 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto bg-white">
        {/* Top Header / Switcher */}
        <div className="flex items-center justify-between mb-8">
          <div className="lg:hidden">
            <DotCoderLogo size="md" theme="light" />
          </div>
          <div className="ml-auto inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0F1412] text-white shadow-xs"
            >
              Login
            </button>
            <Link
              href="/signup"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Welcome Back</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Login to your DotCoder account.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@avc.edu.in or karthik.bca@avc.edu.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAF8] border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9DFF00] focus:border-slate-800 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotHint((prev) => !prev)}
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password@123"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#F8FAF8] border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9DFF00] focus:border-slate-800 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {showForgotHint && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-sans leading-relaxed flex items-start justify-between gap-2 animate-in fade-in">
                  <span>💡 For institutional test accounts, all passwords are pre-set to <strong>Password@123</strong>. For college SSO recovery, contact your Placement Cell coordinator.</span>
                  <button type="button" onClick={() => setShowForgotHint(false)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
                </div>
              )}
            </div>

            {/* Neon Lime Primary CTA matching Screen 10 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              <span>{loading ? "Authenticating..." : "Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switcher */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="text-xs font-bold text-slate-900 hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-6">
          © 2026 DotCoder, Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center text-xs">Loading DotCoder...</div>}>
      <LoginForm />
    </Suspense>
  );
}
