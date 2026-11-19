"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { subscribeToDemoStore } from "@/lib/demo-store";
import { DataService } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types";
import { CommandPalette } from "./command-palette";
import { DotCoderLogo } from "./dotcoder-logo";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  ShieldCheck,
  Briefcase,
  FileText,
  TrendingUp,
  Users,
  BarChart3,
  FileSpreadsheet,
  Building2,
  Settings,
  Headphones,
  LogOut,
  Search,
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

  // Only standalone auth screens (login & signup) render without the sidebar
  const isAuthOrLanding = pathname === "/login" || pathname === "/signup";

  if (isAuthOrLanding) {
    return (
      <div className="min-h-screen bg-[#F4F7F4] text-slate-900 flex flex-col font-sans">
        {children}
        <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
      </div>
    );
  }

  const isTPO =
    currentUser?.role === "tpo" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "super_admin" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tpo");

  // Determine active item based on current route
  const getActiveItem = () => {
    if (isTPO) {
      if (pathname.startsWith("/tpo/students")) return "students";
      if (pathname.startsWith("/admin/problems") || pathname.startsWith("/admin/assessments")) return "assessments";
      if (pathname.startsWith("/admin/drives")) return "recruitment";
      if (pathname.includes("analytics")) return "analytics";
      if (pathname.startsWith("/tpo/dashboard")) return "reports";
      if (pathname.includes("institution")) return "institution";
      if (pathname.includes("settings")) return "settings";
      return "dashboard";
    }

    if (pathname.startsWith("/curriculum")) return "learn";
    if (pathname.startsWith("/practice") || pathname.startsWith("/student/lab")) return "practice";
    if (pathname.startsWith("/assessment") || (pathname.startsWith("/student/exam") && !pathname.includes("/simulator"))) return "assessments";
    if (pathname.startsWith("/student/drives") || pathname.includes("/simulator")) return "recruitment";
    if (pathname.startsWith("/student/resume")) return "resume";
    if (pathname.includes("progress")) return "progress";
    return "dashboard";
  };

  const activeItem = getActiveItem();

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-slate-900 flex font-sans">
      {/* Dark Obsidian Sidebar exactly matching design image */}
      <aside className="w-60 bg-[#0F1412] text-white flex flex-col justify-between z-30 flex-shrink-0 hidden md:flex border-r border-[#1B241F]">
        {/* Top: Logo & Nav Items */}
        <div className="p-4 space-y-6">
          {/* Logo */}
          <div className="px-2 pt-2 pb-1">
            <DotCoderLogo size="md" theme="dark" href={isTPO ? "/admin/dashboard" : "/student/dashboard"} />
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {!isTPO ? (
              // Student Navigation Links
              <>
                <button
                  onClick={() => router.push("/student/dashboard")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "dashboard"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeItem === "dashboard" ? "text-black" : "text-slate-400"}`} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => router.push("/curriculum")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "learn"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${activeItem === "learn" ? "text-black" : "text-slate-400"}`} />
                  <span>Learn</span>
                </button>

                <button
                  onClick={() => router.push("/practice/two-sum")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "practice"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Code2 className={`w-4 h-4 ${activeItem === "practice" ? "text-black" : "text-slate-400"}`} />
                  <span>Practice</span>
                </button>

                <button
                  onClick={() => router.push("/assessment/module-1")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "assessments"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${activeItem === "assessments" ? "text-black" : "text-slate-400"}`} />
                  <span>Assessments</span>
                </button>

                <button
                  onClick={() => router.push("/student/drives")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "recruitment"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Briefcase className={`w-4 h-4 ${activeItem === "recruitment" ? "text-black" : "text-slate-400"}`} />
                  <span>Recruitment</span>
                </button>

                <button
                  onClick={() => router.push("/student/resume")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "resume"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeItem === "resume" ? "text-black" : "text-slate-400"}`} />
                  <span>Resume</span>
                </button>

                <button
                  onClick={() => router.push("/student/dashboard#progress")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "progress"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TrendingUp className={`w-4 h-4 ${activeItem === "progress" ? "text-black" : "text-slate-400"}`} />
                  <span>Progress</span>
                </button>
              </>
            ) : (
              // Admin / TPO Navigation Links
              <>
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "dashboard"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeItem === "dashboard" ? "text-black" : "text-slate-400"}`} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => router.push("/tpo/students")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "students"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Users className={`w-4 h-4 ${activeItem === "students" ? "text-black" : "text-slate-400"}`} />
                  <span>Students</span>
                </button>

                <button
                  onClick={() => router.push("/admin/assessments")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "assessments"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${activeItem === "assessments" ? "text-black" : "text-slate-400"}`} />
                  <span>Assessments</span>
                </button>

                <button
                  onClick={() => router.push("/admin/drives")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "recruitment"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Briefcase className={`w-4 h-4 ${activeItem === "recruitment" ? "text-black" : "text-slate-400"}`} />
                  <span>Recruitment</span>
                </button>

                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "analytics"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <BarChart3 className={`w-4 h-4 ${activeItem === "analytics" ? "text-black" : "text-slate-400"}`} />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => router.push("/tpo/dashboard")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "reports"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FileSpreadsheet className={`w-4 h-4 ${activeItem === "reports" ? "text-black" : "text-slate-400"}`} />
                  <span>Reports & Audit</span>
                </button>

                <button
                  onClick={() => router.push("/admin/dashboard#institution")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "institution"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${activeItem === "institution" ? "text-black" : "text-slate-400"}`} />
                  <span>Institution</span>
                </button>

                <button
                  onClick={() => router.push("/admin/dashboard#settings")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeItem === "settings"
                      ? "bg-[#C4F82A] text-black shadow-sm font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Settings className={`w-4 h-4 ${activeItem === "settings" ? "text-black" : "text-slate-400"}`} />
                  <span>Settings</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom: Help & Support & User Profile */}
        <div className="p-4 border-t border-[#1B241F] space-y-3">
          {/* Help & Support Button (Matching image) */}
          <button
            onClick={() => setIsCmdKOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Headphones className="w-4 h-4 text-slate-400" />
            <span>Help & Support</span>
          </button>

          {/* User Profile Card */}
          {currentUser && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#161D19] border border-[#222C26]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#C4F82A] text-black flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  {currentUser.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="truncate flex-1 min-w-0">
                  <div className="font-semibold text-xs text-white truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {currentUser.role.toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/5 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewport Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F4F7F4]">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
    </div>
  );
}
