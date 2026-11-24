"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMsg("Password must include at least one uppercase letter and one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#070B09] bg-obsidian-grid bg-obsidian-radial text-[#F4F7F5] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="relative z-10 w-full max-w-[420px] bg-[#0C120F] rounded-[28px] p-7 sm:p-9 border border-[#1E2C24] shadow-obsidian text-[#F4F7F5] space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 justify-center">
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
          </div>
          <div className="w-12 h-1 bg-[#9DFF00] rounded-full mx-auto" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F4F7F5] pt-2">
            Set New Password
          </h1>
          <p className="text-xs text-[#99A9A0]">
            Choose a strong password (8+ chars, uppercase &amp; number).
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {done ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#9DFF00] mx-auto" />
            <div className="font-bold text-sm text-white">Password Updated</div>
            <p className="text-xs text-[#99A9A0]">
              Redirecting you to Portal Login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <Lock className="w-4 h-4 text-[#85998D] absolute left-4 top-3.5 pointer-events-none" />
              <input
                type={showPass ? "text" : "password"}
                name="newPassword"
                aria-label="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/50 focus:border-[#9DFF00] transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-3 p-1 text-[#85998D] hover:text-[#F4F7F5] cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-[#85998D] absolute left-4 top-3.5 pointer-events-none" />
              <input
                type={showPass ? "text" : "password"}
                name="confirmPassword"
                aria-label="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/50 focus:border-[#9DFF00] transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-sm shadow-[0_4px_24px_rgba(157,255,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Updating Password..." : "Update Password"}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}

        <div className="pt-2 text-center space-y-2">
          <Link href="/login" className="text-xs font-semibold text-[#99A9A0] hover:text-[#9DFF00]">
            Back to Portal Login
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-[#85998D]">
            <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
            <span>Encrypted Password Update</span>
          </div>
        </div>
      </div>
    </main>
  );
}
