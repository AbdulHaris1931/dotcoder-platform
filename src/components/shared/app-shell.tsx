"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile } from "@/types";
import { CommandPalette } from "./command-palette";
import {
  Code2,
  Terminal,
  ShieldCheck,
  BarChart3,
  Users,
  Search,
  Sparkles,
  Command,
  GraduationCap,
  Building2,
  ChevronRight,
  LogOut,
  RotateCcw,
  FileCode,
  Briefcase,
  Award,
  Trophy,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(DemoStore.getCurrentUser());
    const unsub = subscribeToDemoStore(() => {
      setCurrentUser(DemoStore.getCurrentUser());
    });
    return unsub;
  }, []);

  // Global Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdKOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRoleSwitch = (role: "student" | "tpo") => {
    DemoStore.switchRole(role);
    if (role === "student") {
      router.push("/student/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
  };

  // Standalone / fullscreen / lockdown routes:
  const isPlainLayout =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/student/exam/") ||
    pathname.startsWith("/student/lab/") ||
    pathname === "/student/resume";

  if (isPlainLayout) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
        {children}
        <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
      </div>
    );
  }

  const isTPO = currentUser?.role === "tpo" || currentUser?.role === "admin" || currentUser?.role === "super_admin";

  // Build dynamic breadcrumb label
  const getBreadcrumb = () => {
    if (pathname.startsWith("/student/dashboard")) return "Student Workspace • DotLab";
    if (pathname.startsWith("/student/drives")) return "Campus Recruitment Drives • Openings";
    if (pathname.startsWith("/student/resume")) return "Placement Resume • Verified ATS Portfolio";
    if (pathname.startsWith("/student/exam")) return "Proctored Exam Suite • DotExam";
    if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/tpo/dashboard")) return "Placement Officer Command • Analytics";
    if (pathname.startsWith("/admin/drives")) return "Placement Drives Manager • Hiring Pipeline";
    if (pathname.startsWith("/admin/problems")) return "Question Bank Manager • Coding Challenges";
    if (pathname.startsWith("/admin/assessments")) return "Assessment Creator • Test Scheduler";
    if (pathname.startsWith("/tpo/students")) return "Roster Manager • Bulk CSV Import";
    if (pathname === "/") return "Platform Overview";
    return "Campus Workspace";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans">
      {/* Collapsible Luxury White Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between z-30 flex-shrink-0 hidden md:flex">
        {/* Top: Institution & Brand */}
        <div className="space-y-4">
          {/* Institution Switcher Badge */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span>DotCoder</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60">
                    {currentUser?.role ? currentUser.role.toUpperCase() : "PRO"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate" title={currentUser?.college_name || "Cauvery Inst of Tech"}>
                  {currentUser?.college_name || "Cauvery Inst of Tech"}
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Nav Items */}
          <div className="px-3 space-y-6">
            {/* Student Section */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Student Coding Hub
              </div>

              <button
                onClick={() => router.push("/student/dashboard")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/student/dashboard"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname === "/student/dashboard" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Coding Lab (DotLab)</span>
              </button>

              <button
                onClick={() => router.push("/student/drives")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/student/drives"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname === "/student/drives" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>Campus Drives</span>
              </button>

              <button
                onClick={() => router.push("/student/resume")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/student/resume"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname === "/student/resume" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Placement Resume</span>
              </button>

              <button
                onClick={() => router.push("/student/exam/22222222-0000-0000-0000-000000000001/simulator")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname.includes("/simulator")
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname.includes("/simulator") && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <Trophy className="w-4 h-4 text-indigo-600" />
                <span>TCS Exam Simulator</span>
              </button>

              <button
                onClick={() => router.push("/student/exam/22222222-0000-0000-0000-000000000001")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname.startsWith("/student/exam") && !pathname.includes("/simulator")
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname.startsWith("/student/exam") && !pathname.includes("/simulator") && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>DotExam Suite</span>
              </button>
            </div>

            {/* Placement Administration Section */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Placement Cell (Admin)
              </div>

              <button
                onClick={() => router.push("/admin/dashboard")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/admin/dashboard" || pathname === "/tpo/dashboard"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {(pathname === "/admin/dashboard" || pathname === "/tpo/dashboard") && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Executive Analytics</span>
              </button>

              <button
                onClick={() => router.push("/admin/drives")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/admin/drives"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname === "/admin/drives" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Drives & Pipeline</span>
              </button>

              <button
                onClick={() => router.push("/admin/problems")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/admin/problems"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname === "/admin/problems" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Question Bank</span>
              </button>

              <button
                onClick={() => router.push("/admin/assessments")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/admin/assessments"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname === "/admin/assessments" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Assessments Manager</span>
              </button>

              <button
                onClick={() => router.push("/tpo/students")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname === "/tpo/students"
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {pathname === "/tpo/students" && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <Users className="w-4 h-4 text-slate-500" />
                <span>Bulk CSV Onboarding</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Role Profile & Switcher */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center font-bold text-xs font-mono">
                {currentUser.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="truncate flex-1">
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {currentUser.role.toUpperCase()} • {currentUser.roll_no}
                </div>
              </div>
            </div>
          )}

          {/* Persona Switcher Pills */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <button
              onClick={() => handleRoleSwitch("student")}
              className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                currentUser?.role === "student"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-sm"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleSwitch("tpo")}
              className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                currentUser?.role === "tpo" || currentUser?.role === "admin" || currentUser?.role === "super_admin"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-sm"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Glassmorphic Top Header */}
        <header className="h-[54px] border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Left Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline max-w-[180px] truncate font-medium">
              {currentUser?.college_name || "Campus Placement"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <span className="font-semibold text-slate-900">{getBreadcrumb()}</span>
          </div>

          {/* Right Controls: Cmd+K + Status Pill */}
          <div className="flex items-center gap-3">
            {/* Cmd+K Search Trigger */}
            <button
              onClick={() => setIsCmdKOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs text-slate-600 hover:text-slate-900 transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline font-medium">Search or jump to...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-semibold shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Pitch Demo Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Live</span>
            </div>

            {/* Relogin / Switch button */}
            <button
              onClick={() => router.push("/login")}
              className="text-xs text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Return to Login Switcher"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
    </div>
  );
}
