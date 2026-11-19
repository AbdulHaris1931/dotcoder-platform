"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { DataService } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
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
  BookOpen,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const user = await DataService.getCurrentUser();
      setCurrentUser(user);
    }
    fetchUser();
    const unsub = subscribeToDemoStore(() => {
      fetchUser();
    });
    return unsub;
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

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

  // Standalone / fullscreen / lockdown routes:
  const isPlainLayout =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/curriculum" ||
    pathname.startsWith("/practice/") ||
    pathname.startsWith("/assessment/") ||
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
    if (pathname.startsWith("/student/dashboard")) return "Dashboard";
    if (pathname.startsWith("/student/drives")) return "Campus Drives";
    if (pathname.startsWith("/student/resume")) return "Resume";
    if (pathname.startsWith("/student/exam")) return "Exam Suite";
    if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/tpo/dashboard")) return "Analytics";
    if (pathname.startsWith("/admin/drives")) return "Drives";
    if (pathname.startsWith("/admin/problems")) return "Question Bank";
    if (pathname.startsWith("/admin/assessments")) return "Assessments";
    if (pathname.startsWith("/tpo/students")) return "Students";
    if (pathname === "/") return "Overview";
    return "Workspace";
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
                <div className="text-[11px] text-slate-500 font-medium truncate" title={currentUser?.college_name || "Annai Vailankanni Arts and Science College, Thanjavur"}>
                  {currentUser?.college_name || "Annai Vailankanni Arts and Science College, Thanjavur"}
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Nav Items */}
          <div className="px-3 space-y-6">
            {/* Student Section */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Student
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
                <span>Coding Lab</span>
              </button>

              <button
                onClick={() => router.push("/curriculum")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  pathname.startsWith("/curriculum") || pathname.startsWith("/practice")
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {(pathname.startsWith("/curriculum") || pathname.startsWith("/practice")) && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r" />
                )}
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Curriculum</span>
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
                <span>Resume</span>
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
                <span>Simulator</span>
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
                <span>Exam Suite</span>
              </button>
            </div>

            {/* Placement Administration Section */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Admin
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
                <span>Analytics</span>
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
                <span>Drives</span>
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
                <span>Assessments</span>
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
                <span>Students</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Role Profile */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60">
          {currentUser && (
            <div className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  {currentUser.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="truncate flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-900 truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {currentUser.role.toUpperCase()} • {currentUser.roll_no}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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

            {/* System Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Live</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="text-xs text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Sign out"
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
