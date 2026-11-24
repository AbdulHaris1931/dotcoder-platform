"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to login page with notice parameter
    const timer = setTimeout(() => {
      router.replace("/login?notice=registration_restricted");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F1412] text-white p-4 font-sans select-none">
      <div className="max-w-md w-full bg-[#161D1A] border border-[#232F2A] rounded-3xl p-8 space-y-6 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            Registration Restricted
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Public self-registration is disabled. All candidate, mentor, and TPO accounts are provisioned exclusively by the platform Super Admin.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
          Redirecting you to the secure login portal...
        </div>

        <Link
          href="/login?notice=registration_restricted"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs transition-all active:scale-[0.98]"
        >
          <span>Go to Login</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </Link>
      </div>
    </div>
  );
}
