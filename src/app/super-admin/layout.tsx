"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import { DataService } from "@/lib/supabase/db";
import { performSignOut } from "@/lib/auth/sign-out";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { name: "All Users", href: "/super-admin/users", icon: Users },
  { name: "Add User", href: "/super-admin/users/add", icon: UserPlus },
  { name: "AI Bulk Import", href: "/super-admin/users/import", icon: Sparkles, badge: "AI" },
  { name: "Activity Logs", href: "/super-admin/activity", icon: ShieldCheck },
  { name: "Security & Settings", href: "/super-admin/settings", icon: Settings },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isVerifyingOwner, setIsVerifyingOwner] = useState(true);

  useEffect(() => {
    async function verifyOwnerAccess() {
      const user = await DataService.getCurrentUser();
      const isOwner =
        user?.email?.toLowerCase() === "mmam92005@gmail.com" ||
        user?.id === "c8d50800-aae2-42b6-84a7-f10241621c5a" ||
        user?.role === "super_admin";

      if (!isOwner) {
        if (user?.role === "teacher") {
          router.replace("/teacher/dashboard?error=access_denied");
        } else if (user?.role === "tpo" || user?.role === "admin") {
          router.replace("/tpo/dashboard?error=access_denied");
        } else if (user?.role === "student") {
          router.replace("/student/dashboard?error=access_denied");
        } else {
          router.replace("/login?unauthorized=true");
        }
        return;
      }
      setIsVerifyingOwner(false);
    }
    verifyOwnerAccess();
  }, [router]);

  const handleSignOut = async () => {
    await performSignOut((url) => router.push(url));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/super-admin/users?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  if (isVerifyingOwner) {
    return (
      <div className="min-h-screen bg-[#070B09] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/30 flex items-center justify-center text-[#9DFF00] animate-pulse">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs font-mono text-[#99A9A0]">Verifying Super Admin Authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] flex flex-col font-sans selection:bg-[#9DFF00] selection:text-[#070B09]">
      {/* Top Owner Header */}
      <header className="h-16 bg-[#0A0F0C]/90 backdrop-blur-xl border-b border-[#1E2C24] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] md:hidden cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <DotCoderLogo size="sm" theme="dark" href="/super-admin/dashboard" />
            <div className="hidden sm:flex items-center gap-1.5 pl-2.5 border-l border-[#1E2C24]">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
                SUPER ADMIN
              </span>
              <span className="text-[11px] text-[#99A9A0] font-mono">OWNER ENCLAVE</span>
            </div>
          </div>
        </div>

        {/* Center Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-sm w-full mx-6 relative">
          <Search className="w-4 h-4 text-[#85998D] absolute left-3" />
          <input
            id="super-admin-global-search"
            name="super-admin-global-search"
            aria-label="Search users by name, email, roll number"
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search users by name, email, roll number..."
            className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#F4F7F5] placeholder-[#85998D] focus:outline-none focus:border-[#9DFF00]/60 transition-colors"
          />
        </form>

        {/* Right Owner Menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/activity"
            className="p-2 rounded-xl text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] relative"
            title="Activity notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#9DFF00] absolute top-1.5 right-1.5" />
          </Link>

          <div className="flex items-center gap-2 pl-2.5 border-l border-[#1E2C24]">
            <div className="w-8 h-8 rounded-lg bg-[#9DFF00]/15 border border-[#9DFF00]/30 flex items-center justify-center font-bold text-xs font-mono text-[#9DFF00]">
              AH
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-[#F4F7F5] leading-tight">Abdul Haris M</div>
              <div className="text-[10px] font-mono text-[#99A9A0]">mmam92005@gmail.com</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 rounded-xl text-[#99A9A0] hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1 cursor-pointer"
            title="Exit Super Admin Enclave"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-[#0A0F0C] border-r border-[#1E2C24] hidden md:flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            <div className="px-3">
              <div className="text-[10px] font-mono uppercase font-bold text-[#85998D] tracking-wider">
                User Management
              </div>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/super-admin/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#9DFF00] text-[#070B09] font-bold"
                        : "text-[#99A9A0] hover:bg-[#121B16] hover:text-[#F4F7F5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#070B09]" : "text-[#85998D]"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#070B09]" />}
                  </Link>
                );
              })}
            </nav>

            {/* Normal Role Filter Shortcuts */}
            <div className="pt-4 border-t border-[#1E2C24] px-3 space-y-2">
              <div className="text-[10px] font-mono uppercase font-bold text-[#85998D] tracking-wider">
                Normal Roles Filter
              </div>
              <div className="space-y-1 text-xs">
                <Link
                  href="/super-admin/users?role=MENTOR"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16]"
                >
                  <span>Mentors (Faculty)</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#121B16] border border-[#1E2C24] text-[#99A9A0]">Role</span>
                </Link>
                <Link
                  href="/super-admin/users?role=STUDENT"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16]"
                >
                  <span>Students</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#121B16] border border-[#1E2C24] text-[#99A9A0]">Role</span>
                </Link>
                <Link
                  href="/super-admin/users?role=TPO"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16]"
                >
                  <span>TPOs (Placement)</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#121B16] border border-[#1E2C24] text-[#99A9A0]">Role</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Security Capsule */}
          <div className="p-3.5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-2">
            <div className="flex items-center gap-2 text-[#F4F7F5] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
              <span>Private Owner Session</span>
            </div>
            <p className="text-[10px] text-[#99A9A0] leading-relaxed font-mono">
              Server-enforced access with append-only audit trail and zero public signup leaks.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="fixed inset-y-16 left-0 z-50 w-72 bg-[#0A0F0C] border-r border-[#1E2C24] p-4 flex flex-col justify-between md:hidden shadow-obsidian"
            >
              <div className="space-y-4">
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/super-admin/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-[#9DFF00] text-[#070B09] font-bold"
                            : "text-[#99A9A0] hover:bg-[#121B16] hover:text-[#F4F7F5]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/30 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Enclave</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Viewport */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-[#070B09] obsidian-workspace p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
