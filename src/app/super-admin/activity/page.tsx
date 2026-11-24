"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useEffect, useMemo } from "react";
import { SuperAdminService, AdminAuditLog } from "@/lib/services/super-admin-service";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const loadLogs = () => {
    const list = SuperAdminService.getAuditLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        (log.target_user_email && log.target_user_email.toLowerCase().includes(q)) ||
        (log.reason && log.reason.toLowerCase().includes(q)) ||
        log.id.toLowerCase().includes(q);

      const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  const uniqueActions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set);
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F4F7F5] tracking-tight flex items-center gap-2">
            <span>Administrative Audit Trail</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#0C120F] border border-[#1E2C24] text-[#9DFF00]">
              APPEND-ONLY
            </span>
          </h1>
          <p className="text-xs text-[#99A9A0] mt-1">
            Immutable, real-time log of every user provisioning, role change, password reset, and status update.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="p-2 rounded-xl bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] text-[#D5E0D9] hover:text-[#F4F7F5] transition-colors self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24] grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-[#99A9A0] absolute left-3 top-2.5" />
          <input
            id="super-admin-activity-search"
            name="super-admin-activity-search"
            aria-label="Search activity logs by action, user email, or reason"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by action, user email, or reason..."
            className="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00]"
          />
        </div>

        <div>
          <ObsidianSelect value={String(actionFilter)} onChange={(val) => {
              setActionFilter(val);
              setCurrentPage(1);
            }} options={[{ value: "ALL", label: "All Administrative Actions" }, ...uniqueActions.map((act) => ({ value: String(act), label: String(act) }))]} buttonClassName="w-full bg-[#070B09] border border-[#1E2C24] rounded-xl px-3 py-2 text-xs text-[#F4F7F5] focus:outline-hidden focus:border-[#9DFF00]" />
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#070B09] border-b border-[#1E2C24] text-[10px] font-mono uppercase text-[#99A9A0]">
                <th className="py-3 px-4 font-semibold">Action & Result</th>
                <th className="py-3 px-3 font-semibold">Target User</th>
                <th className="py-3 px-3 font-semibold">Reason & Audit Details</th>
                <th className="py-3 px-3 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C24]/70 font-mono text-xs">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#85998D]">
                    No activity logs recorded matching this filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isRoleChange = log.action.includes("ROLE");
                  const isDelete = log.action.includes("DELETE") || log.action.includes("SUSPEND");

                  return (
                    <tr key={log.id} className="hover:bg-[#18241D]/50 transition-colors">
                      {/* Action */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isDelete
                                ? "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                                : isRoleChange
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                                : "bg-[#9DFF00]/10 text-[#9DFF00] border border-[#9DFF00]/30"
                            }`}
                          >
                            {log.action}
                          </span>
                        </div>
                      </td>

                      {/* Target User */}
                      <td className="py-3 px-3">
                        <div className="text-[#F4F7F5] font-bold">{log.target_user_email || "-"}</div>
                        {log.target_user_role && (
                          <div className="text-[10px] text-[#99A9A0]">
                            Role: {log.target_user_role.toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3 font-sans text-[#D5E0D9] max-w-sm">
                        <div className="line-clamp-2 leading-relaxed">{log.reason || "Operation executed successfully."}</div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-3 text-[#99A9A0] text-[11px]">
                        <div>{log.actor_email}</div>
                        <div className="text-[9px] text-[#9DFF00]">OWNER</div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-right text-[10px] text-[#85998D] tabular-nums whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#070B09] border-t border-[#1E2C24] flex items-center justify-between text-xs font-mono tabular-nums">
          <div className="text-[#99A9A0] text-[11px]">
            Showing {paginatedLogs.length} of {filteredLogs.length} audit entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous audit log page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] disabled:opacity-40 text-[#D5E0D9] hover:text-[#F4F7F5] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-[#99A9A0] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next audit log page"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] disabled:opacity-40 text-[#D5E0D9] hover:text-[#F4F7F5] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
