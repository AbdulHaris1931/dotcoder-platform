"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShowcasePanel } from "@/components/auth/auth-showcase-panel";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import { DemoStore } from "@/lib/demo-store";
import { SEED_TPO } from "@/lib/seed-data";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      DemoStore.switchRole("student");
      router.push("/student/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Left Code Showcase Panel (Desktop) */}
      <AuthShowcasePanel />

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <DotCoderLogo size="md" />
          <Link
            href="/signup"
            className="text-xs font-semibold text-[#4F46E5] hover:text-indigo-700"
          >
            Start free →
          </Link>
        </div>

        {/* Center Auth Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">
              Continue your learning journey.
            </p>
          </div>

          {/* Social Auth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200/90 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-2xs"
          >
            {/* Google Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-medium">
              or use email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Alert messages */}
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

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#F9FAF8] border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMsg("Password reset link will be sent to your email.");
                  }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl bg-[#F9FAF8] border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              <span>{loading ? "Logging in..." : "Log in"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switcher */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">
              New to DotCoder?{" "}
            </span>
            <Link
              href="/signup"
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              Create an account
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
