"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
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
  Sidebar,
  X,
  ChevronLeft,
  GraduationCap,
  Star,
  UserCheck,
} from "lucide-react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isCodingWorkspace: boolean;
}

export const SidebarContext = createContext<SidebarContextType>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  toggleSidebar: () => {},
  isCodingWorkspace: false,
});

export const useSidebar = () => useContext(SidebarContext);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isPersonaSwitcherOpen, setIsPersonaSwitcherOpen] = useState(false);

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
    DemoStore.setCurrentUser(null as any);
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

  // Determine if current route is a dedicated coding workspace or proctored exam
  const isCodingWorkspace =
    pathname.startsWith("/practice") ||
    pathname.startsWith("/student/lab") ||
    pathname.startsWith("/student/exam") ||
    pathname.startsWith("/assessment");

  // In coding workspace, the sidebar defaults to collapsed (0px width) so it does NOT disturb the coding workspace.
  // In normal dashboards, it defaults to expanded.
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isCodingWorkspace);

  // Sync state whenever navigating into or out of a coding workspace
  useEffect(() => {
    if (isCodingWorkspace) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [pathname, isCodingWorkspace]);

  // Global Cmd+B / Ctrl+B shortcut listener for toggling the sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isSidebarOpen && isCodingWorkspace) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, isCodingWorkspace]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Standalone public pages (landing / home page, login & signup) render without the sidebar
  const isAuthOrLanding = pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (isAuthOrLanding) {
    return (
      <SidebarContext.Provider
        value={{
          isSidebarOpen: false,
          setIsSidebarOpen,
          toggleSidebar,
          isCodingWorkspace: false,
        }}
      >
        <div className="min-h-screen text-slate-900 flex flex-col font-sans">
          {children}
          <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
        </div>
      </SidebarContext.Provider>
    );
  }

  const effectiveRole =
    (pathname.startsWith("/teacher")
      ? "teacher"
      : pathname.startsWith("/recruiter")
      ? "recruiter"
      : pathname.startsWith("/admin") || pathname.startsWith("/tpo")
      ? "tpo"
      : currentUser?.role || "student");

  const isTeacher = effectiveRole === "teacher" || pathname.startsWith("/teacher");
  const isRecruiter = effectiveRole === "recruiter" || pathname.startsWith("/recruiter");
  const isTPO =
    effectiveRole === "tpo" ||
    effectiveRole === "admin" ||
    effectiveRole === "super_admin" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tpo");
  const isStudent = !isTeacher && !isRecruiter && !isTPO;

  const homeUrl = isTeacher
    ? "/teacher/dashboard"
    : isRecruiter
    ? "/recruiter/dashboard"
    : isTPO
    ? "/admin/dashboard"
    : "/student/dashboard";

  // Determine active item based on current route
  const getActiveItem = () => {
    if (isTeacher) {
      if (pathname.startsWith("/curriculum")) return "learn";
      if (pathname.startsWith("/admin/problems")) return "problems";
      if (pathname.startsWith("/admin/assessments")) return "assessments";
      return "dashboard";
    }

    if (isRecruiter) {
      if (pathname.startsWith("/admin/drives")) return "recruitment";
      if (pathname.startsWith("/student/resume")) return "resume";
      return "dashboard";
    }

    if (isTPO) {
      if (pathname.startsWith("/tpo/students")) return "students";
      if (pathname.startsWith("/admin/problems")) return "problems";
      if (pathname.startsWith("/admin/assessments")) return "assessments";
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

  const navigateTo = (path: string) => {
    router.push(path);
    if (isCodingWorkspace) {
      setIsSidebarOpen(false);
    }
  };

  const handleSwitchPersona = (role: any, redirectPath: string) => {
    DemoStore.switchRole(role);
    setIsPersonaSwitcherOpen(false);
    router.push(redirectPath);
  };

  const handleProgressClick = () => {
    if (pathname === "/student/dashboard") {
      document.getElementById("progress")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/student/dashboard#progress");
      setTimeout(() => {
        document.getElementById("progress")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
    if (isCodingWorkspace) {
      setIsSidebarOpen(false);
    }
  };

  // Reusable Sidebar Inner Content
  const renderSidebarContent = (isDrawer: boolean = false) => (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Top: Logo & Nav Items */}
      <div className="p-4 space-y-6">
        {/* Logo & Collapse Button */}
        <div className="px-2 pt-2 pb-1 flex items-center justify-between">
          <DotCoderLogo size="md" theme="dark" href={homeUrl} />
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Collapse sidebar (⌘B)"
          >
            {isDrawer ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1">
          {isTeacher ? (
            // Teacher Navigation Links
            <>
              <button
                onClick={() => navigateTo("/teacher/dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "dashboard"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeItem === "dashboard" ? "text-black" : "text-slate-400"}`} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigateTo("/curriculum")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "learn"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeItem === "learn" ? "text-black" : "text-slate-400"}`} />
                <span>Curriculum</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/problems")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "problems"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Code2 className={`w-4 h-4 ${activeItem === "problems" ? "text-black" : "text-slate-400"}`} />
                <span>Problem Bank</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/assessments")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "assessments"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeItem === "assessments" ? "text-black" : "text-slate-400"}`} />
                <span>Assessments</span>
              </button>
            </>
          ) : isRecruiter ? (
            // Recruiter Navigation Links
            <>
              <button
                onClick={() => navigateTo("/recruiter/dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "dashboard"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className={`w-4 h-4 ${activeItem === "dashboard" ? "text-black" : "text-slate-400"}`} />
                <span>Talent Discovery</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/drives")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "recruitment"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Briefcase className={`w-4 h-4 ${activeItem === "recruitment" ? "text-black" : "text-slate-400"}`} />
                <span>Campus Drives</span>
              </button>

              <button
                onClick={() => navigateTo("/student/resume")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "resume"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText className={`w-4 h-4 ${activeItem === "resume" ? "text-black" : "text-slate-400"}`} />
                <span>Verified Resumes</span>
              </button>
            </>
          ) : isTPO ? (
            // Admin / TPO Navigation Links
            <>
              <button
                onClick={() => navigateTo("/admin/dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "dashboard"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeItem === "dashboard" ? "text-black" : "text-slate-400"}`} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigateTo("/tpo/students")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "students"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className={`w-4 h-4 ${activeItem === "students" ? "text-black" : "text-slate-400"}`} />
                <span>Students</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/problems")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "problems"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Code2 className={`w-4 h-4 ${activeItem === "problems" ? "text-black" : "text-slate-400"}`} />
                <span>Problems</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/assessments")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "assessments"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeItem === "assessments" ? "text-black" : "text-slate-400"}`} />
                <span>Assessments</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/drives")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "recruitment"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Briefcase className={`w-4 h-4 ${activeItem === "recruitment" ? "text-black" : "text-slate-400"}`} />
                <span>Recruitment</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "analytics"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeItem === "analytics" ? "text-black" : "text-slate-400"}`} />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => navigateTo("/tpo/dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "reports"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileSpreadsheet className={`w-4 h-4 ${activeItem === "reports" ? "text-black" : "text-slate-400"}`} />
                <span>Reports & Audit</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/dashboard#institution")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "institution"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeItem === "institution" ? "text-black" : "text-slate-400"}`} />
                <span>Institution</span>
              </button>

              <button
                onClick={() => navigateTo("/admin/dashboard#settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "settings"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Settings className={`w-4 h-4 ${activeItem === "settings" ? "text-black" : "text-slate-400"}`} />
                <span>Settings</span>
              </button>
            </>
          ) : (
            // Student Navigation Links
            <>
              <button
                onClick={() => navigateTo("/student/dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "dashboard"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeItem === "dashboard" ? "text-black" : "text-slate-400"}`} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigateTo("/curriculum")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "learn"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeItem === "learn" ? "text-black" : "text-slate-400"}`} />
                <span>Learn</span>
              </button>

              <button
                onClick={() => navigateTo("/practice/two-sum")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "practice"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Code2 className={`w-4 h-4 ${activeItem === "practice" ? "text-black" : "text-slate-400"}`} />
                <span>Practice</span>
              </button>

              <button
                onClick={() => navigateTo("/student/exam/assessment-1")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "assessments"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeItem === "assessments" ? "text-black" : "text-slate-400"}`} />
                <span>Assessments</span>
              </button>

              <button
                onClick={() => navigateTo("/student/drives")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "recruitment"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Briefcase className={`w-4 h-4 ${activeItem === "recruitment" ? "text-black" : "text-slate-400"}`} />
                <span>Recruitment</span>
              </button>

              <button
                onClick={() => navigateTo("/student/resume")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "resume"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText className={`w-4 h-4 ${activeItem === "resume" ? "text-black" : "text-slate-400"}`} />
                <span>Resume</span>
              </button>

              <button
                onClick={handleProgressClick}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "progress"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${activeItem === "progress" ? "text-black" : "text-slate-400"}`} />
                <span>Progress</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Bottom: Help & Support & User Profile */}
      <div className="p-4 border-t border-[#1B241F] space-y-3">
        {/* Help & Support Button */}
        <button
          onClick={() => setIsCmdKOpen(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        >
          <Headphones className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>

        {/* User Profile Card & Persona Switcher */}
        {currentUser && (
          <div className="relative">
            {isPersonaSwitcherOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-[#161D19] border border-[#222C26] rounded-2xl shadow-2xl space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Switch Role</span>
                  <span className="font-mono text-[#9DFF00]">AVASC</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchPersona("student", "/student/dashboard")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    effectiveRole === "student"
                      ? "bg-[#9DFF00] text-black font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">Karthik S.</span>
                  <span className="text-[10px] opacity-75 font-mono">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPersona("teacher", "/teacher/dashboard")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    effectiveRole === "teacher"
                      ? "bg-[#9DFF00] text-black font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">Dr. S. Meenakshi</span>
                  <span className="text-[10px] opacity-75 font-mono">Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPersona("tpo", "/tpo/dashboard")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    effectiveRole === "tpo"
                      ? "bg-[#9DFF00] text-black font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">Prof. R. Anandhan</span>
                  <span className="text-[10px] opacity-75 font-mono">TPO</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPersona("admin", "/admin/dashboard")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    effectiveRole === "admin" || effectiveRole === "super_admin"
                      ? "bg-[#9DFF00] text-black font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">Dr. V. Rajesh</span>
                  <span className="text-[10px] opacity-75 font-mono">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPersona("recruiter", "/recruiter/dashboard")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    effectiveRole === "recruiter"
                      ? "bg-[#9DFF00] text-black font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">Kavitha R.</span>
                  <span className="text-[10px] opacity-75 font-mono">Recruiter</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#161D19] border border-[#222C26]">
              <button
                type="button"
                onClick={() => setIsPersonaSwitcherOpen((prev) => !prev)}
                className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity flex-1"
                title="Click to switch test persona"
              >
                <div className="w-7 h-7 rounded-lg bg-[#9DFF00] text-black flex items-center justify-center font-bold text-xs font-mono shrink-0">
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
                  <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                    <span>{currentUser.role.toUpperCase()}</span>
                    <span className="text-[#9DFF00] text-[9px]">• switch</span>
                  </div>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/5 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isCodingWorkspace,
      }}
    >
      <div className="min-h-screen bg-[#F4F7F4] text-slate-900 flex font-sans overflow-x-hidden">
        {/* ========================================================= */}
        {/* 1. CODING WORKSPACE MODE: Overlay Drawer when opened      */}
        {/* ========================================================= */}
        {isCodingWorkspace ? (
          <>
            {/* Slide-Over Overlay Drawer when isSidebarOpen is true */}
            {isSidebarOpen && (
              <>
                <div
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
                />
                <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1412] text-white flex flex-col justify-between shadow-2xl border-r border-[#1B241F] transition-transform duration-300 ease-out translate-x-0 animate-in slide-in-from-left">
                  {renderSidebarContent(true)}
                </aside>
              </>
            )}
          </>
        ) : (
          /* ========================================================= */
          /* 2. REGULAR DASHBOARD MODE: In-flow Collapsible Sidebar    */
          /* ========================================================= */
          <>
            {isSidebarOpen ? (
              <aside className="w-60 bg-[#0F1412] text-white flex flex-col justify-between z-30 flex-shrink-0 hidden md:flex border-r border-[#1B241F] transition-all duration-300">
                {renderSidebarContent(false)}
              </aside>
            ) : (
              /* Expand Button when sidebar is collapsed on dashboard */
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="fixed top-3 left-3 z-30 p-2 rounded-xl bg-[#0F1412] hover:bg-[#1A231C] text-[#9DFF00] border border-[#1E293B] shadow-lg transition-all active:scale-95 group hidden md:flex items-center gap-2"
                title="Expand Navigation Sidebar (⌘B)"
              >
                <Sidebar className="w-4 h-4 text-[#9DFF00]" />
                <span className="text-xs font-bold text-white pr-1">Menu</span>
              </button>
            )}

            {/* Mobile Drawer */}
            <div className="md:hidden">
              {isSidebarOpen && (
                <>
                  <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity"
                  />
                  <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1412] text-white flex flex-col justify-between shadow-2xl border-r border-[#1B241F]">
                    {renderSidebarContent(true)}
                  </aside>
                </>
              )}
            </div>
          </>
        )}

        {/* Main Viewport Content Canvas */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F4F7F4]">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Global Command Palette */}
        <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
      </div>
    </SidebarContext.Provider>
  );
}
