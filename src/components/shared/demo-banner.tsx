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
      router.push("/tpo/dashboard");
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
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-white tracking-wide uppercase text-[11px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/50 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Pitch Demo Mode
        </span>
        <span className="hidden sm:inline text-slate-400">|</span>
        <span className="hidden md:inline text-slate-300 font-medium">
          Cauvery Institute of Technology, Thanjavur
        </span>
        {currentUser && (
          <span className="text-slate-400 hidden lg:inline">
            • Logged in as:{" "}
            <strong className="text-white font-medium">
              {currentUser.full_name} ({currentUser.role.toUpperCase()})
            </strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => handleSwitch("student")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors font-medium ${
            currentUser?.role === "student"
              ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student View</span>
        </button>

        <button
          onClick={() => handleSwitch("tpo")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors font-medium ${
            currentUser?.role === "tpo"
              ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>TPO Admin View</span>
        </button>

        <button
          onClick={handleReset}
          title="Reset Demo State"
          className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
