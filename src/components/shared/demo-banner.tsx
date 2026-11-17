"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile } from "@/types";
import { Sparkles, GraduationCap, Building2, RotateCcw } from "lucide-react";

export function DemoBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(DemoStore.getCurrentUser());
    const unsubscribe = subscribeToDemoStore(() => {
      setCurrentUser(DemoStore.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleSwitch = (role: "student" | "tpo") => {
    DemoStore.switchRole(role);
    if (role === "student") {
      router.push("/student/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
  };

  const handleReset = () => {
    DemoStore.resetStore();
    window.location.reload();
  };

  // Don't show inside active exam mode to preserve full immersion
  if (pathname.startsWith("/student/exam/")) {
    return null;
  }

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 text-xs px-5 py-2 flex flex-wrap items-center justify-between gap-3 shadow-xs font-sans z-30">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-bold text-[11px] tracking-wide uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3 text-indigo-600" /> Pitch Demo Mode
        </span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span className="hidden md:inline text-slate-600 font-semibold">
          Cauvery Institute of Technology, Thanjavur
        </span>
        {currentUser && (
          <span className="text-slate-500 hidden lg:inline">
            • Active Profile:{" "}
            <strong className="text-slate-900 font-bold">
              {currentUser.full_name} ({currentUser.role.toUpperCase()})
            </strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => handleSwitch("student")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all text-xs font-semibold ${
            currentUser?.role === "student"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-bold"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student View</span>
        </button>

        <button
          onClick={() => handleSwitch("tpo")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all text-xs font-semibold ${
            currentUser?.role === "tpo"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-bold"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Admin / TPO View</span>
        </button>

        <button
          onClick={handleReset}
          title="Reset Demo State"
          className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors ml-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
