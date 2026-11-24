"use client";

import { useState, useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DataService } from "@/lib/supabase/db";
import { UserCredentialsService } from "@/lib/services/user-credentials";
import { UserProfile } from "@/types";
import { Key, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AccountSecuritySettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    DataService.getCurrentUser().then(setUser).catch(() => {});
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMsg("Password must contain at least one uppercase letter and one number.");
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
      } else if (user && user.email) {
        UserCredentialsService.saveCredential({
          userId: user.id,
          email: user.email,
          rollNo: user.roll_no,
          password: newPassword,
          isTemp: false,
        });
      }

      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Your password has been updated securely.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 sm:p-10 space-y-6 font-sans text-[#F4F7F5]">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#9DFF00] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Account Security</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5]">
          Change Password
        </h1>
        <p className="text-xs text-[#99A9A0]">
          Replace your temporary institutional password with a personal strong password.
        </p>
      </div>

      {user && user.id !== "guest" && (
        <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-[#F4F7F5]">{user.full_name}</div>
            <div className="text-[#99A9A0] font-mono">{user.email}</div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#9DFF00]/10 border border-[#9DFF00]/30 text-[#9DFF00] font-mono font-bold uppercase text-[10px]">
            {user.role}
          </span>
        </div>
      )}

      <form
        onSubmit={handleChangePassword}
        className="p-6 sm:p-7 rounded-2xl bg-[#0C120F] border border-[#1E2C24] shadow-obsidian space-y-5"
      >
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="block text-xs font-mono font-bold text-[#99A9A0]">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#85998D] absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="new-password"
              name="newPassword"
              type={showPass ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 chars, 1 uppercase, 1 number"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/50 focus:border-[#9DFF00]"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="absolute right-3 top-2.5 p-1 text-[#85998D] hover:text-[#F4F7F5] cursor-pointer"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-xs font-mono font-bold text-[#99A9A0]">
            Confirm New Password
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-[#85998D] absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showPass ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:ring-2 focus:ring-[#9DFF00]/50 focus:border-[#9DFF00]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-extrabold transition-all shadow-[0_0_24px_-6px_rgba(157,255,0,0.45)] cursor-pointer disabled:opacity-50"
        >
          {loading ? "Updating Password..." : "Save New Password"}
        </button>
      </form>
    </main>
  );
}
