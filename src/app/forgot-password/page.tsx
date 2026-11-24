"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Please enter your registered institutional email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase && isSupabaseConfigured()) {
        const redirectTo = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
        });
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not dispatch password reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#070B09] bg-obsidian-grid bg-obsidian-radial text-[#F4F7F5] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="relative z-10 w-full max-w-[420px] bg-[#0C120F] rounded-[28px] p-7 sm:p-9 border border-[#1E2C24] shadow-obsidian text-[#F4F7F5] space-y-6">
        <div className="text-center space-y-2">
          <Link href="/login" className="inline-flex items-center gap-2 justify-center">
            <Image
              src="/logo.png"
              alt="EQLV CODE"
              width={32}
              height={32}
              className="w-8 h-8 object-contain rounded-xl ring-1 ring-white/10"
            />
            <span className="inline-flex items-baseline gap-1.5 text-xl">
              <span className="font-display font-bold tracking-tight text-white">EQLV</span>
              <span className="font-mono font-bold tracking-wider text-base text-[#9DFF00]">CODE</span>
            </span>
          </Link>
          <div className="w-12 h-1 bg-[#9DFF00] rounded-full mx-auto" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F4F7F5] pt-2">
            Reset Your Password
          </h1>
          <p className="text-xs text-[#99A9A0]">
            Enter your institutional email and we&apos;ll send a secure recovery link.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#9DFF00] mx-auto" />
            <div className="font-bold text-sm text-white">Check your inbox</div>
            <p className="text-xs text-[#99A9A0] leading-relaxed">
              If an account exists for <strong className="text-white">{email}</strong>, a secure password reset link has been dispatched.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-extrabold transition-all"
            >
              <span>Return to Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-[#85998D] absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="email"
                name="email"
                aria-label="Institutional Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your institutional email"
                className="w-full pl-11 pr-4 py-3 min-h-[46px] rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/40 focus:border-[#9DFF00] transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 min-h-[48px] rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-sm shadow-[0_1px_0_0_rgba(255,255,255,0.45)_inset,0_10px_28px_-10px_rgba(157,255,0,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Sending Recovery Link..." : "Send Reset Link"}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}

        <div className="pt-2 text-center space-y-2.5 border-t border-[#1E2C24]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 min-h-[36px] px-2 text-xs font-semibold text-[#A3B4AA] hover:text-[#9DFF00] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Login</span>
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold text-[#85998D]">
            <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
            <span>Protected Institutional Recovery</span>
          </div>
        </div>
      </div>
    </main>
  );
}
