"use client";

import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile } from "@/types";
import {
  Code2,
  Terminal,
  ShieldCheck,
  BarChart3,
  Users,
  LogOut,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(DemoStore.getCurrentUser());
    const unsub = subscribeToDemoStore(() => {
      setCurrentUser(DemoStore.getCurrentUser());
    });
    return unsub;
  }, []);

  // Suppress navbar in proctored exam room for anti-cheating fullscreen feel
  if (pathname.startsWith("/student/exam/")) {
    return null;
  }

  const isTPO = currentUser?.role === "tpo";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto max-w-7xl flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 font-bold text-slate-900 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-lg tracking-tight font-extrabold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              DotCoder
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
              v2.6
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => router.push("/student/dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/student/dashboard") || pathname.startsWith("/student/lab")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Terminal className="w-4 h-4" />
              Coding Lab (DotLab)
            </button>

            <button
              onClick={() => router.push("/student/exam/22222222-0000-0000-0000-000000000001")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/student/exam")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Proctored Exam (DotExam)
            </button>

            <button
              onClick={() => router.push("/tpo/dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/tpo/dashboard")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              TPO Analytics
            </button>

            <button
              onClick={() => router.push("/tpo/students")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/tpo/students")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" />
              Bulk Onboarding
            </button>
          </nav>
        </div>

        {/* User Pill & Quick Actions */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-semibold text-slate-700 text-xs">
                {currentUser.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-semibold text-slate-900">{currentUser.full_name}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {currentUser.roll_no} • {currentUser.department}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
            title="Switch Session / Relogin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch</span>
          </button>
        </div>
      </div>
    </header>
  );
}
