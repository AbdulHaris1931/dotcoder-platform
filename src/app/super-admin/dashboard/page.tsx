"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SuperAdminService,
  DashboardMetrics,
  ManagedUser,
  AdminAuditLog,
} from "@/lib/services/super-admin-service";
import { EmptyStatePanel } from "@/components/ui/obsidian-primitives";
import {
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  UserX,
  Clock,
  ShieldAlert,
  UserPlus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<ManagedUser[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AdminAuditLog[]>([]);
  const [dataMode, setDataMode] = useState<"live" | "local">("local");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const localLogs = SuperAdminService.getAuditLogs({ limit: 6 });

      try {
        const res = await fetch("/api/super-admin/users");
        if (res.ok) {
          const data = (await res.json()) as {
            success?: boolean;
            users?: ManagedUser[];
            mode?: string;
          };
          if (isMounted && data.success && Array.isArray(data.users)) {
            const users = data.users.filter((u) => u.role !== "super_admin");
            const now = Date.now();
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            const totalMentors = users.filter((u) => u.role === "teacher").length;
            const totalStudents = users.filter((u) => u.role === "student").length;
            const totalTpos = users.filter((u) => u.role === "tpo" || u.role === "admin").length;
            const computed: DashboardMetrics = {
              totalUsers: users.length,
              totalMentors,
              totalStudents,
              totalTpos,
              activeUsers: users.filter((u) => (u.account_status || "active") === "active").length,
              inactiveUsers: users.filter((u) => u.account_status === "inactive").length,
              suspendedUsers: users.filter((u) => u.account_status === "suspended").length,
              recentlyCreated: users.filter(
                (u) => u.created_at && now - new Date(u.created_at).getTime() <= sevenDaysMs
              ).length,
              roleDistribution: {
                students: totalStudents,
                mentors: totalMentors,
                tpos: totalTpos,
              },
            };
            const sorted = [...users].sort((a, b) => {
              const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return timeB - timeA;
            });
            setMetrics(computed);
            setRecentUsers(sorted.slice(0, 5));
            setRecentAuditLogs(localLogs);
            setDataMode(data.mode === "live_supabase" ? "live" : "local");
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to local service cleanly
      }

      if (!isMounted) return;
      const liveMetrics = SuperAdminService.getDashboardMetrics();
      const allUsers = SuperAdminService.getAllUsers();
      const sorted = [...allUsers].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
      setMetrics(liveMetrics);
      setRecentUsers(sorted.slice(0, 5));
      setRecentAuditLogs(localLogs);
      setDataMode("local");
      setIsLoading(false);
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2.5 text-xs text-[#99A9A0] font-mono">
          <Sparkles className="w-4 h-4 text-[#9DFF00] animate-spin" />
          <span>Loading live database telemetry...</span>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Users",
      value: metrics.totalUsers,
      subtext: "Across all cohorts",
      icon: Users,
      color: "text-[#F4F7F5]",
      badgeColor: "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]",
      href: "/super-admin/users",
    },
    {
      title: "Mentors (Faculty)",
      value: metrics.totalMentors,
      subtext: "Academic instructors",
      icon: GraduationCap,
      color: "text-sky-400",
      badgeColor: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
      href: "/super-admin/users?role=MENTOR",
    },
    {
      title: "Students",
      value: metrics.totalStudents,
      subtext: "Active candidates",
      icon: Users,
      color: "text-[#9DFF00]",
      badgeColor: "bg-[#9DFF00]/10 text-[#9DFF00] border border-[#9DFF00]/25",
      href: "/super-admin/users?role=STUDENT",
    },
    {
      title: "TPOs (Placement)",
      value: metrics.totalTpos,
      subtext: "Placement officers",
      icon: Briefcase,
      color: "text-amber-400",
      badgeColor: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      href: "/super-admin/users?role=TPO",
    },
    {
      title: "Active Accounts",
      value: metrics.activeUsers,
      subtext: `${((metrics.activeUsers / (metrics.totalUsers || 1)) * 100).toFixed(0)}% of total userbase`,
      icon: UserCheck,
      color: "text-emerald-400",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      href: "/super-admin/users?status=active",
    },
    {
      title: "Inactive Accounts",
      value: metrics.inactiveUsers,
      subtext: "Dormant / archived",
      icon: UserX,
      color: "text-[#99A9A0]",
      badgeColor: "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]",
      href: "/super-admin/users?status=inactive",
    },
    {
      title: "Recently Created",
      value: metrics.recentlyCreated,
      subtext: "Past 7 days onboarding",
      icon: Clock,
      color: "text-teal-300",
      badgeColor: "bg-teal-500/10 text-teal-300 border border-teal-500/25",
      href: "/super-admin/users?sort=recent",
    },
    {
      title: "Suspended Accounts",
      value: metrics.suspendedUsers,
      subtext: "Access revoked by admin",
      icon: ShieldAlert,
      color: "text-rose-400",
      badgeColor: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      href: "/super-admin/users?status=suspended",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1E2C24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7F5] tracking-tight">
              Platform Master Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
              {dataMode === "live" ? "LIVE SUPABASE" : "ENCLAVE READY"}
            </span>
          </div>
          <p className="text-xs text-[#99A9A0] mt-1">
            Centralized private management of user accounts across Mentors, Students, and TPOs.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/super-admin/users/import"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] hover:border-[#9DFF00]/40 text-[#9DFF00] transition-all flex items-center gap-1.5 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span>AI Bulk Import</span>
          </Link>
          <Link
            href="/super-admin/users/add?role=MENTOR"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] text-sky-400 hover:text-[#F4F7F5] transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Mentor</span>
          </Link>
          <Link
            href="/super-admin/users/add?role=STUDENT"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] transition-all flex items-center gap-1.5 font-mono"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </Link>
          <Link
            href="/super-admin/users/add?role=TPO"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] text-amber-400 hover:text-[#F4F7F5] transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add TPO</span>
          </Link>
        </div>
      </div>

      {/* 8 Database Metrics KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="surface-card surface-card-interactive p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#99A9A0]">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.badgeColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className={`font-display text-2xl sm:text-3xl font-bold ${card.color} tracking-tight tabular-nums`}>
                  {card.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#85998D] mt-0.5 truncate">{card.subtext}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two-Column Midsection: Role Distribution & Recently Added */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution Card */}
        <div className="lg:col-span-1 surface-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-sm text-[#F4F7F5] flex items-center gap-2">
              <span>Role Distribution</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121B16] border border-[#1E2C24] text-[#99A9A0]">
                3 Allowed Roles
              </span>
            </h2>
          </div>

          <div className="space-y-3.5 font-mono text-xs">
            {/* Students */}
            <div>
              <div className="flex items-center justify-between text-[#99A9A0] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#9DFF00]" />
                  Students
                </span>
                <span className="font-bold text-[#F4F7F5] tabular-nums">
                  {metrics.totalStudents} ({((metrics.totalStudents / (metrics.totalUsers || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#121B16] overflow-hidden">
                <div
                  className="h-full bg-[#9DFF00]"
                  style={{ width: `${(metrics.totalStudents / (metrics.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Mentors */}
            <div>
              <div className="flex items-center justify-between text-[#99A9A0] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Mentors (Faculty)
                </span>
                <span className="font-bold text-[#F4F7F5] tabular-nums">
                  {metrics.totalMentors} ({((metrics.totalMentors / (metrics.totalUsers || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#121B16] overflow-hidden">
                <div
                  className="h-full bg-sky-400"
                  style={{ width: `${(metrics.totalMentors / (metrics.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* TPOs */}
            <div>
              <div className="flex items-center justify-between text-[#99A9A0] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  TPOs (Placement)
                </span>
                <span className="font-bold text-[#F4F7F5] tabular-nums">
                  {metrics.totalTpos} ({((metrics.totalTpos / (metrics.totalUsers || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#121B16] overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${(metrics.totalTpos / (metrics.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E2C24] flex items-center justify-between text-[11px] text-[#99A9A0]">
            <span>Active vs Inactive:</span>
            <span className="text-emerald-400 font-mono font-bold tabular-nums">
              {metrics.activeUsers} Active &bull; {metrics.inactiveUsers + metrics.suspendedUsers} Inactive
            </span>
          </div>
        </div>

        {/* Recently Added Users */}
        <div className="lg:col-span-2 surface-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-sm text-[#F4F7F5]">Recently Added Users</h2>
            <Link
              href="/super-admin/users"
              className="inline-flex items-center gap-1 min-h-[28px] px-1 text-xs text-[#9DFF00] hover:underline font-mono"
            >
              <span>View All Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <EmptyStatePanel
              icon={Users}
              title="Clean Slate - No Provisioned Accounts Yet"
              description="Onboard your first student batch via AI CSV Bulk Import or provision individual Faculty, Student, and TPO credentials."
              action={
                <Link
                  href="/super-admin/users/import"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold font-mono transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start AI Bulk Import</span>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2C24] text-[10px] font-mono uppercase text-[#85998D]">
                    <th className="pb-2.5 font-semibold">User</th>
                    <th className="pb-2.5 font-semibold">Role</th>
                    <th className="pb-2.5 font-semibold">Department</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2C24]">
                  {recentUsers.map((u) => {
                    const isMentor = u.role === "teacher";
                    const isTpo = u.role === "tpo" || u.role === "admin";
                    const status = u.account_status || "active";

                    return (
                      <tr key={u.id} className="hover:bg-[#121B16]/70 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-bold text-[#F4F7F5] leading-tight">{u.full_name}</div>
                          <div className="text-[10px] font-mono text-[#99A9A0]">{u.email}</div>
                        </td>
                        <td className="py-3 pr-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              isMentor
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                                : isTpo
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-[#9DFF00]/10 text-[#9DFF00] border border-[#9DFF00]/30"
                            }`}
                          >
                            {isMentor ? "MENTOR" : isTpo ? "TPO" : "STUDENT"}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-[#99A9A0] font-mono text-[11px]">
                          {u.department || "General"}
                        </td>
                        <td className="py-3 pr-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono ${
                              status === "active"
                                ? "text-emerald-300 bg-emerald-500/10"
                                : status === "suspended"
                                ? "text-rose-300 bg-rose-500/10"
                                : "text-[#99A9A0] bg-[#121B16]"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                            {status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/super-admin/users/${u.id}`}
                            className="inline-flex items-center justify-center min-h-[28px] px-2.5 py-1 rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-[10px] font-mono text-[#F4F7F5] transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Administrative Activity */}
      <div className="surface-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
            <h2 className="font-display font-bold text-sm text-[#F4F7F5]">Recent Administrative Activity</h2>
          </div>
          <Link
            href="/super-admin/activity"
            className="inline-flex items-center min-h-[28px] px-1 text-xs text-[#9DFF00] hover:underline font-mono"
          >
            View Full Audit Log &rarr;
          </Link>
        </div>

        {recentAuditLogs.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-[#85998D] bg-[#070B09] border border-[#1E2C24] rounded-xl">
            No administrative mutations logged yet. All provisioning actions are recorded in append-only format.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#070B09] border border-[#1E2C24] space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F4F7F5] text-[11px] truncate max-w-[160px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-[#85998D] tabular-nums">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[11px] text-[#99A9A0] font-sans line-clamp-2 leading-relaxed">
                  {log.reason || "Administrative user operation executed."}
                </p>
                {log.target_user_email && (
                  <div className="text-[10px] text-[#85998D] truncate pt-1 border-t border-[#1E2C24]">
                    Target: {log.target_user_email}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
