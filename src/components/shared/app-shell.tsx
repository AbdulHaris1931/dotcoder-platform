"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { subscribeToDemoStore } from "@/lib/demo-store";
import { DataService } from "@/lib/supabase/db";
import { canRoleAccessPath, getRoleHomePath, normalizeRole } from "@/lib/auth/rbac-routes";
import { performSignOut } from "@/lib/auth/sign-out";
import { UserProfile } from "@/types";
import { CommandPalette } from "./command-palette";
import { DotCoderLogo } from "./dotcoder-logo";
import { usePageLoading } from "./global-loading-screen";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  FileText,
  TrendingUp,
  Users,
  FileSpreadsheet,
  Settings,
  Headphones,
  LogOut,
  Search,
  Sidebar,
  X,
  ChevronLeft,
  GraduationCap,
  Terminal,
  Layers,
  Database,
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
  const { setIsPageLoading } = usePageLoading();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [accessDeniedNotice, setAccessDeniedNotice] = useState(false);
  const [idleMinutes, setIdleMinutes] = useState<number>(30);
  const [broadcast, setBroadcast] = useState<{
    enabled: boolean;
    message: string;
    target: "all" | "student" | "teacher" | "tpo";
    severity: "info" | "warning" | "urgent";
  } | null>(null);
  const [broadcastDismissed, setBroadcastDismissed] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.id === "guest") return;
    fetch("/api/platform/governance", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.config) {
          if (typeof data.config.idle_timeout_minutes === "number") {
            setIdleMinutes(data.config.idle_timeout_minutes);
          }
          if (data.config.broadcast_enabled && data.config.broadcast_message) {
            setBroadcast({
              enabled: true,
              message: data.config.broadcast_message,
              target: data.config.broadcast_target || "all",
              severity: data.config.broadcast_severity || "info",
            });
          } else {
            setBroadcast(null);
          }
        }
      })
      .catch(() => {});
  }, [currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "access_denied") {
        setAccessDeniedNotice(true);
        const timer = setTimeout(() => setAccessDeniedNotice(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  // Client-side RBAC Guard (Single Source of Truth: rbac-routes.ts)
  useEffect(() => {
    if (!currentUser) return;
    const isOwnerAccount =
      currentUser.email?.toLowerCase() === "mmam92005@gmail.com" ||
      currentUser.id === "c8d50800-aae2-42b6-84a7-f10241621c5a" ||
      currentUser.role?.toLowerCase() === "super_admin";

    const resolvedRole = isOwnerAccount ? "super_admin" : normalizeRole(currentUser.role);
    if (!canRoleAccessPath(resolvedRole, pathname)) {
      router.replace(`${getRoleHomePath(resolvedRole)}?error=access_denied`);
    }
  }, [currentUser, pathname, router]);

  // Shared-Lab Inactivity Auto-Sign-Out (configurable via Super Admin Governance)
  useEffect(() => {
    if (!currentUser || typeof window === "undefined") return;

    const IDLE_TIMEOUT_MS = idleMinutes * 60 * 1000;
    const ACTIVITY_KEY = "eqlv_last_activity_at";

    const markActive = () => {
      try {
        window.localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      } catch {
        // Ignore storage quota / private mode errors
      }
    };

    markActive();
    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((ev) => window.addEventListener(ev, markActive, { passive: true }));

    const interval = window.setInterval(() => {
      try {
        const lastRaw = window.localStorage.getItem(ACTIVITY_KEY);
        const lastActive = lastRaw ? Number(lastRaw) : Date.now();
        if (Date.now() - lastActive >= IDLE_TIMEOUT_MS) {
          window.clearInterval(interval);
          void performSignOut((url) => router.replace(url));
        }
      } catch {
        // Ignore storage read errors
      }
    }, 60 * 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, markActive));
      window.clearInterval(interval);
    };
  }, [currentUser, router, idleMinutes]);

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
    await performSignOut((url) => router.push(url));
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

  // Determine if current route is a dedicated coding workspace, open compiler, or proctored exam
  const isCodingWorkspace =
    pathname.startsWith("/practice") ||
    pathname.startsWith("/student/lab") ||
    pathname.startsWith("/student/exam") ||
    pathname.startsWith("/student/compiler") ||
    pathname.startsWith("/playground") ||
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

  // Standalone public pages & private Super Admin enclave render without the standard sidebar
  const isAuthOrLanding =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/super-admin");

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
        <div className="min-h-screen flex flex-col font-sans bg-[#070B09] text-[#F4F7F5] overflow-x-hidden w-full max-w-full">
          {children}
          <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />
        </div>
      </SidebarContext.Provider>
    );
  }

  const userRole = currentUser?.role?.toLowerCase() || "student";
  const isOwner =
    currentUser?.email?.toLowerCase() === "mmam92005@gmail.com" ||
    currentUser?.id === "c8d50800-aae2-42b6-84a7-f10241621c5a" ||
    userRole === "super_admin";

  const isTeacher = userRole === "teacher" || userRole === "mentor" || (isOwner && pathname.startsWith("/teacher"));
  const isTPO = userRole === "tpo" || userRole === "admin" || (isOwner && (pathname.startsWith("/admin") || pathname.startsWith("/tpo")));

  const homeUrl = isTeacher
    ? "/teacher/dashboard"
    : isTPO
    ? "/tpo/dashboard"
    : "/student/dashboard";

  // Determine active item based on current route
  const getActiveItem = () => {
    if (isTeacher) {
      if (pathname.startsWith("/teacher/assessments")) return "assessments";
      if (pathname.startsWith("/teacher/assignments")) return "assignments";
      if (pathname.startsWith("/teacher/students")) return "students";
      if (pathname.startsWith("/student/mnc-prep")) return "mnc-prep";
      if (pathname.startsWith("/curriculum")) return "learn";
      if (pathname.startsWith("/admin/problems")) return "problems";
      if (pathname.startsWith("/admin/assessments")) return "assessments";
      return "dashboard";
    }

    if (isTPO) {
      if (pathname.startsWith("/tpo/students")) return "students";
      if (pathname.startsWith("/tpo/teachers")) return "teachers";
      if (pathname.startsWith("/tpo/drives") || pathname.startsWith("/admin/drives")) return "drives";
      if (pathname.startsWith("/tpo/dashboard")) return "dashboard";
      return "dashboard";
    }

    if (pathname.startsWith("/student/mnc-prep")) return "mnc-prep";
    if (pathname.startsWith("/student/sql-lab")) return "sql-lab";
    if (pathname.startsWith("/curriculum")) return "learn";
    if (pathname.startsWith("/student/compiler") || pathname.startsWith("/playground")) return "compiler";
    if (pathname.startsWith("/practice") || pathname.startsWith("/student/lab")) return "practice";
    if (pathname.startsWith("/student/assessments") || pathname.startsWith("/assessment") || (pathname.startsWith("/student/exam") && !pathname.includes("/simulator"))) return "assessments";
    if (pathname.startsWith("/student/drives") || pathname.includes("/simulator")) return "recruitment";
    if (pathname.startsWith("/student/resume")) return "resume";
    if (pathname.includes("progress")) return "progress";
    return "dashboard";
  };

  const activeItem = getActiveItem();

  const navigateTo = (path: string) => {
    if (path !== pathname) {
      setIsPageLoading(true);
    }
    router.push(path);
    if (isCodingWorkspace) {
      setIsSidebarOpen(false);
    }
  };

  const handleProgressClick = () => {
    if (pathname === "/student/dashboard") {
      document.getElementById("progress")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setIsPageLoading(true);
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
                onClick={() => navigateTo("/teacher/assessments")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "assessments"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText className={`w-4 h-4 ${activeItem === "assessments" ? "text-black" : "text-slate-400"}`} />
                <span>Assessments &amp; Tests</span>
              </button>

              <button
                onClick={() => navigateTo("/teacher/assignments")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "assignments"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileSpreadsheet className={`w-4 h-4 ${activeItem === "assignments" ? "text-black" : "text-slate-400"}`} />
                <span>Assignments</span>
              </button>

              <button
                onClick={() => navigateTo("/teacher/students")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "students"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${activeItem === "students" ? "text-black" : "text-slate-400"}`} />
                <span>Students & Mentorship</span>
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
                onClick={() => navigateTo("/student/mnc-prep")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "mnc-prep"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className={`w-4 h-4 ${activeItem === "mnc-prep" ? "text-black" : "text-slate-400"}`} />
                <div className="flex items-center justify-between flex-1">
                  <span>MNC 300 Units</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    activeItem === "mnc-prep" ? "bg-black/15 text-black" : "bg-[#9DFF00]/20 text-[#9DFF00]"
                  }`}>
                    10 Units
                  </span>
                </div>
              </button>

              <button
                type="button"
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
            </>
          ) : isTPO ? (
            // Dedicated TPO Navigation Links (Placement & Progress Tracking Only)
            <>
              <button
                onClick={() => navigateTo("/tpo/dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeItem === "students"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className={`w-4 h-4 ${activeItem === "students" ? "text-black" : "text-slate-400"}`} />
                <span>Students Progress</span>
              </button>

              <button
                onClick={() => navigateTo("/tpo/teachers")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeItem === "teachers"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${activeItem === "teachers" ? "text-black" : "text-slate-400"}`} />
                <span>Faculty &amp; Mentors</span>
              </button>

              <button
                onClick={() => navigateTo("/tpo/drives")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeItem === "drives"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Briefcase className={`w-4 h-4 ${activeItem === "drives" ? "text-black" : "text-slate-400"}`} />
                <span>Campus Drives</span>
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

              {/* MNC 300 Master Interview Preparation Units */}
              <button
                onClick={() => navigateTo("/student/mnc-prep")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "mnc-prep"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className={`w-4 h-4 ${activeItem === "mnc-prep" ? "text-black" : "text-slate-400"}`} />
                <div className="flex items-center justify-between flex-1">
                  <span>MNC 300 Prep</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    activeItem === "mnc-prep" ? "bg-black/15 text-black" : "bg-[#9DFF00]/20 text-[#9DFF00]"
                  }`}>
                    10 Units
                  </span>
                </div>
              </button>

              {/* Freeform Open Compiler (Rule-Free Sandbox) */}
              <button
                onClick={() => navigateTo("/student/compiler")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "compiler"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Terminal className={`w-4 h-4 ${activeItem === "compiler" ? "text-black" : "text-slate-400"}`} />
                <div className="flex items-center justify-between flex-1">
                  <span>Open Sandbox</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    activeItem === "compiler" ? "bg-black/15 text-black" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    No Rules
                  </span>
                </div>
              </button>

              {/* In-Browser SQL Lab (WASM) */}
              <button
                onClick={() => navigateTo("/student/sql-lab")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === "sql-lab"
                    ? "bg-[#9DFF00] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Database className={`w-4 h-4 ${activeItem === "sql-lab" ? "text-black" : "text-slate-400"}`} />
                <div className="flex items-center justify-between flex-1">
                  <span>SQL Lab</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    activeItem === "sql-lab" ? "bg-black/15 text-black" : "bg-sky-500/20 text-sky-300"
                  }`}>
                    WASM
                  </span>
                </div>
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
                onClick={() => navigateTo("/student/assessments")}
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

      {/* Bottom: Security, Help & Support & User Profile */}
      <div className="p-4 border-t border-[#1B241F] space-y-2">
        {/* Account Security / Change Password */}
        <button
          type="button"
          onClick={() => navigateTo("/settings/security")}
          className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium transition-colors rounded-xl ${
            pathname === "/settings/security"
              ? "bg-[#9DFF00] text-black font-bold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings className={`w-4 h-4 ${pathname === "/settings/security" ? "text-black" : "text-slate-400"}`} />
          <span>Change Password</span>
        </button>

        {/* Help & Support Button */}
        <button
          type="button"
          onClick={() => setIsCmdKOpen(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        >
          <Headphones className="w-4 h-4 text-slate-400" />
          <span>Help & Support</span>
        </button>

        {/* User Profile Card (Strict Role - No Demo Role Switcher) */}
        {currentUser && (
          <div className="relative">
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#161D19] border border-[#222C26]">
              <div className="flex items-center gap-2.5 min-w-0 text-left flex-1">
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
                  <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="capitalize">{currentUser.role.toLowerCase()}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
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
      <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] flex font-sans overflow-x-hidden">
        {/* ========================================================= */}
        {/* 1. CODING WORKSPACE MODE: Overlay Drawer when opened      */}
        {/* ========================================================= */}
        {isCodingWorkspace ? (
          <>
            {isSidebarOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close navigation sidebar"
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in cursor-default"
                />
                <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0F0C] text-[#F4F7F5] flex flex-col justify-between shadow-2xl border-r border-[#1E2C24] transition-transform duration-300 ease-out translate-x-0 animate-in slide-in-from-left">
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
            {isSidebarOpen && (
              <aside className="w-64 bg-[#0A0F0C] text-[#F4F7F5] hidden md:flex flex-col justify-between z-30 flex-shrink-0 border-r border-[#1E2C24] transition-all duration-300">
                {renderSidebarContent(false)}
              </aside>
            )}

            {/* Mobile Drawer */}
            <div className="md:hidden">
              {isSidebarOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close navigation sidebar"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity cursor-default"
                  />
                  <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0F0C] text-[#F4F7F5] flex flex-col justify-between shadow-2xl border-r border-[#1E2C24]">
                    {renderSidebarContent(true)}
                  </aside>
                </>
              )}
            </div>
          </>
        )}

        {/* Main Viewport Content Canvas */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070B09]">
          {!isCodingWorkspace && (
            <header className="h-14 sticky top-0 z-20 px-4 sm:px-6 bg-[#0A0F0C]/85 backdrop-blur-xl border-b border-[#1E2C24] flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] border border-transparent hover:border-[#1E2C24] transition-all cursor-pointer"
                  aria-label="Toggle navigation sidebar"
                  title="Toggle Sidebar (⌘B)"
                >
                  <Sidebar className="w-4 h-4" />
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#85998D] truncate">
                  <span className="text-[#99A9A0] uppercase tracking-wider font-semibold">
                    {isTeacher ? "Faculty" : isTPO ? "Placement Cell" : "Student"}
                  </span>
                  <span>/</span>
                  <span className="text-[#F4F7F5] capitalize font-semibold">
                    {activeItem.replace("-", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCmdKOpen(true)}
                  className="hidden sm:inline-flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] hover:border-[#2C4034] text-xs text-[#99A9A0] transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#85998D]" />
                  <span>Quick command...</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#121B16] border border-[#2C4034] text-[#9DFF00]">
                    ⌘K
                  </kbd>
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0C120F] border border-[#1E2C24] text-[10px] font-mono font-semibold text-[#99A9A0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF00] animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>
            </header>
          )}
          {broadcast &&
            broadcast.enabled &&
            !broadcastDismissed &&
            (broadcast.target === "all" ||
              (broadcast.target === "student" && !isTeacher && !isTPO) ||
              (broadcast.target === "teacher" && isTeacher) ||
              (broadcast.target === "tpo" && isTPO)) && (
              <div
                role="status"
                className={`px-4 py-2 text-xs font-mono flex items-center justify-between gap-3 border-b ${
                  broadcast.severity === "urgent"
                    ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                    : broadcast.severity === "warning"
                    ? "bg-amber-950/90 border-amber-500/40 text-amber-200"
                    : "bg-[#121B16] border-[#9DFF00]/30 text-[#9DFF00]"
                }`}
              >
                <span className="truncate">{broadcast.message}</span>
                <button
                  type="button"
                  onClick={() => setBroadcastDismissed(true)}
                  aria-label="Dismiss campus announcement"
                  className="min-w-[24px] min-h-[24px] inline-flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          <main id="main-content" className="flex-1 overflow-y-auto obsidian-workspace">{children}</main>
        </div>

        {/* Floating Super Admin Oversight Return Pill */}
        {isOwner && (
          <button
            type="button"
            onClick={() => router.push("/super-admin/dashboard")}
            className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 min-h-[36px] px-4 py-2 rounded-full bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-mono font-extrabold shadow-xl shadow-[#9DFF00]/25 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Return to Super Admin</span>
          </button>
        )}

        {/* Global Access Restriction Notice */}
        {accessDeniedNotice && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-[#161B22]/95 border border-rose-500/50 text-white rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xs pr-2">
              <p className="font-bold text-rose-200">Access Restricted</p>
              <p className="text-slate-400 text-[11px]">Your account role does not have authorization to access that enclave.</p>
            </div>
            <button
              type="button"
              onClick={() => setAccessDeniedNotice(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Command Palette (Role-Filtered) */}
        <CommandPalette
          isOpen={isCmdKOpen}
          onClose={() => setIsCmdKOpen(false)}
          userRole={isOwner ? "super_admin" : normalizeRole(currentUser?.role)}
        />
      </div>
    </SidebarContext.Provider>
  );
}
