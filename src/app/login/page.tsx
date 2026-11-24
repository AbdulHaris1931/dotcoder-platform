"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DemoStore } from "@/lib/demo-store";
import { UserCredentialsService } from "@/lib/services/user-credentials";
import { SuperAdminService } from "@/lib/services/super-admin-service";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile } from "@/types";
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Code2,
  BarChart3,
  Briefcase,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isRestricted = searchParams.get("notice") === "registration_restricted";

  // Enforce pure dark background on html and body to eliminate any white space leakage
  useEffect(() => {
    setIsHydrated(true);
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevBodyOverflowX = document.body.style.overflowX;
    const prevHtmlOverflowX = document.documentElement.style.overflowX;

    document.documentElement.style.backgroundColor = "#070B09";
    document.body.style.backgroundColor = "#070B09";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanIdentifier = email.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMsg("Please enter your email or roll number, and password.");
      setLoading(false);
      return;
    }

    // 1. Live Production Mode: Strict Supabase Auth (NEVER fall back to unsigned demo cookies)
    const supabase = createClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanIdentifier,
          password: cleanPassword,
        });

        if (error || !data?.user) {
          setLoading(false);
          setErrorMsg(
            error?.message || "Invalid email or password. Please check your institutional credentials."
          );
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const accountStatus = String(profile?.account_status || "active").toLowerCase();
        if (accountStatus === "suspended" || accountStatus === "archived") {
          await supabase.auth.signOut();
          setLoading(false);
          setErrorMsg(
            "Your account has been suspended or archived. Please contact your institution administrator."
          );
          return;
        }

        const appMetaRole =
          typeof data.user.app_metadata?.role === "string"
            ? data.user.app_metadata.role.trim().toLowerCase()
            : null;
        const resolvedRole = (profile?.role || appMetaRole || "student").toLowerCase();

        // Clear any stale local demo cookie so server middleware strictly uses Supabase JWT
        document.cookie = "eqlv_demo_user=; path=/; max-age=0; SameSite=Lax";

        if (profile) {
          DemoStore.setCurrentUser({
            id: profile.id,
            email: data.user.email || profile.email || "",
            full_name: profile.full_name || "Campus User",
            role: resolvedRole as UserProfile["role"],
            college_name: profile.college_name || "",
            roll_no: profile.roll_no || "",
            department: profile.department || "",
            batch_year: profile.batch_year || new Date().getFullYear(),
            readiness_score: Number(profile.readiness_score) || 0,
            problems_solved: profile.problems_solved || 0,
            created_at: profile.created_at,
          });
        }

        if (resolvedRole === "super_admin") {
          router.push("/super-admin/dashboard");
        } else if (resolvedRole === "teacher" || resolvedRole === "mentor") {
          router.push("/teacher/dashboard");
        } else if (resolvedRole === "tpo" || resolvedRole === "admin") {
          router.push("/tpo/dashboard");
        } else if (resolvedRole === "recruiter") {
          router.push("/recruiter/dashboard");
        } else {
          router.push("/student/dashboard");
        }
        return;
      } catch (err: unknown) {
        setLoading(false);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Unable to reach authentication server. Please try again."
        );
        return;
      }
    }

    // 2. Local Demo Mode ONLY (when Supabase env vars are not configured)
    setTimeout(() => {
      setLoading(false);

      const authResult = UserCredentialsService.verifyCredentials(cleanIdentifier, cleanPassword);

      if (!authResult.valid || !authResult.user) {
        setErrorMsg(
          authResult.error || "Invalid login credentials. Please check your username/email and password."
        );
        return;
      }

      const user = authResult.user;

      try {
        SuperAdminService.recordUserSignIn(user.id);
      } catch {}

      DemoStore.setCurrentUser(user);
      document.cookie = `eqlv_demo_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;

      const role = user.role?.toLowerCase();
      if (role === "super_admin") {
        router.push("/super-admin/dashboard");
      } else if (role === "teacher" || role === "mentor") {
        router.push("/teacher/dashboard");
      } else if (role === "tpo" || role === "admin") {
        router.push("/tpo/dashboard");
      } else if (role === "recruiter") {
        router.push("/recruiter/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }, 350);
  };

  return (
    <div id="login-page-root" className="min-h-screen w-full max-w-full bg-[#070B09] text-white flex flex-col justify-between font-sans relative overflow-x-hidden select-none">
      {/* Subtle Focused Obsidian Spotlight - Zero Muddy Olive Spread */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-obsidian-grid bg-obsidian-radial">
        <div className="absolute bottom-0 left-0 w-full h-36 overflow-hidden opacity-25">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full text-[#9DFF00]">
            <path
              d="M0,160 C300,80 600,220 1200,100 L1200,200 L0,200 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeOpacity="0.28"
            />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP HEADER: Brand Emblem & Secure Access Pill                             */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 min-h-[38px] group">
            <Image
              src="/logo.png"
              alt="EQLV CODE"
              width={32}
              height={32}
              priority
              className="w-8 h-8 object-contain rounded-xl flex-shrink-0 ring-1 ring-white/10"
            />
            <span className="inline-flex items-baseline gap-1.5 text-lg sm:text-xl">
              <span className="font-display font-bold tracking-tight text-white">
                EQLV
              </span>
              <span className="font-mono font-bold tracking-wider text-sm sm:text-base text-[#9DFF00]">
                CODE
              </span>
            </span>
          </Link>

          <div className="hidden sm:block w-px h-5 bg-[#1E2C24]" />

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-[#A3B4AA] font-semibold uppercase">
            <span>INSTITUTIONAL WORKSPACE</span>
          </div>
        </div>

        {/* Right: Secure Access Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C120F] border border-[#1E2C24] text-xs font-mono font-bold text-[#9DFF00]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#9DFF00]" />
          <span>Secure Access</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF00] animate-pulse" />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN SPLIT (MOBILE-FIRST LOGIN CARD ON TOP)                    */}
      {/* ========================================================================= */}
      <main id="main-content" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 my-auto flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN (order-2 on mobile so login card appears FIRST above the fold) */}
          <div className="order-2 lg:order-1 lg:col-span-7 min-w-0 flex flex-col justify-between space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-4 lg:gap-5">
              {/* Main Headline - Space Grotesk Display */}
              <div className="space-y-3 shrink-0 max-w-xs text-center sm:text-left">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[48px] xl:text-[56px] font-bold tracking-[-0.04em] text-[#F4F7F5] leading-[1.03]">
                  Code
                  <br />
                  Learn
                  <br />
                  Assess
                  <br />
                  <span className="text-[#9DFF00]">Get Hired.</span>
                </h1>
                <div className="w-12 h-1 bg-[#9DFF00] rounded-full mx-auto sm:mx-0" />
                <p className="text-xs sm:text-sm text-[#A3B4AA] font-medium max-w-[260px] pt-0.5 leading-relaxed mx-auto sm:mx-0">
                  A complete coding lab and placement readiness platform for colleges.
                </p>
              </div>

              {/* 3D Perspective Laptop Visual */}
              <div className="relative w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[330px] xl:max-w-[390px] shrink-0 flex items-center justify-center">
                <Image
                  src="/login-laptop-hero.webp"
                  alt="EQLV CODE Platform Workspace"
                  width={905}
                  height={728}
                  priority
                  className="w-full h-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

            {/* 3 Feature Pillars (Fixed Duplicate Icon Bug) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-4 border-t border-[#1E2C24] max-w-lg mx-auto sm:mx-0 w-full">
              <div className="space-y-1">
                <div className="text-[#9DFF00] flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#F4F7F5] leading-tight">
                  Practice Coding
                </div>
                <div className="text-[11px] text-[#85998D] font-medium">
                  Real MNC suites
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[#9DFF00] flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#F4F7F5] leading-tight">
                  Track Progress
                </div>
                <div className="text-[11px] text-[#85998D] font-medium">
                  6D skill telemetry
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[#9DFF00] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#F4F7F5] leading-tight">
                  Get Placed
                </div>
                <div className="text-[11px] text-[#85998D] font-medium">
                  Verified readiness
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Precision Obsidian Floating Login Card (order-1 on mobile!) */}
          <div className="order-1 lg:order-2 lg:col-span-5 min-w-0 flex justify-center lg:justify-end">
            <div className="w-full max-w-[408px] xl:max-w-[432px] bg-[#0C120F]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 xl:p-9 shadow-[0_1px_0_0_rgba(255,255,255,0.07)_inset,0_28px_70px_-15px_rgba(0,0,0,0.95)] border border-[#24352B] text-[#F4F7F5] flex flex-col justify-between space-y-5">
              {/* Top Card Logo with Underline Accent */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2.5 select-none justify-center">
                  <Image
                    src="/logo.png"
                    alt="EQLV CODE"
                    width={32}
                    height={32}
                    priority
                    className="w-8 h-8 object-contain rounded-xl flex-shrink-0 ring-1 ring-white/10"
                  />
                  <span className="inline-flex items-baseline gap-1.5 text-xl">
                    <span className="font-display font-bold tracking-tight text-white">
                      EQLV
                    </span>
                    <span className="font-mono font-bold tracking-wider text-base text-[#9DFF00]">
                      CODE
                    </span>
                  </span>
                </div>
                <div className="w-10 h-1 bg-[#9DFF00] rounded-full mx-auto" />

                <div className="pt-2 space-y-1">
                  <h2 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-[#F4F7F5]">
                    Welcome Back
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A3B4AA] font-medium">
                    Sign in to your institutional EQLV CODE workspace
                  </p>
                </div>
              </div>

              {/* Restricted Banner */}
              {isRestricted && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    Accounts are provisioned exclusively by the platform Super Admin.
                  </span>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form method="post" onSubmit={handleSignIn} className="space-y-3.5 pt-1">
                {/* Email / Username Input */}
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#85998D] absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="email"
                    aria-label="Institutional Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or Username"
                    className="w-full pl-11 pr-4 py-3 min-h-[46px] rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/40 focus:border-[#9DFF00] transition-all font-medium"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#85998D] absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    aria-label="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    className="w-full pl-11 pr-12 py-3 min-h-[46px] rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/40 focus:border-[#9DFF00] transition-all font-medium"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-1.5 top-1 w-9 h-9 flex items-center justify-center rounded-lg text-[#85998D] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center min-h-[36px] px-1 text-xs font-semibold text-[#A3B4AA] hover:text-[#9DFF00] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Crisp Specular Lime Login Button */}
                <button
                  type="submit"
                  disabled={!isHydrated || loading}
                  className="w-full py-3.5 min-h-[48px] rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-sm sm:text-base shadow-[0_1px_0_0_rgba(255,255,255,0.45)_inset,0_10px_28px_-10px_rgba(157,255,0,0.55)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-[#070B09] border-t-transparent animate-spin" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-black">
                      <span>Portal Login</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </button>
              </form>

              {/* Bottom Card Footer: Security Badge & Copyright */}
              <div className="pt-2 text-center space-y-2.5 border-t border-[#1E2C24]">
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-[#A3B4AA] pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
                  <span>Secure &amp; Private Access</span>
                </div>
                <div className="text-[11px] text-[#85998D] font-medium">
                  &copy; 2026 EQLV CODE. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle accessible footer */}
      <footer className="relative z-10 py-3.5 text-center text-xs text-[#85998D] font-mono">
        EQLV CODE &bull; Enterprise Campus Placement Platform
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B09] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#9DFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
