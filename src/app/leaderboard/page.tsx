"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ObsidianSelect } from "@/components/ui/obsidian-select";
import type {
  DepartmentChampionshipEntry,
  RankedLeaderboardEntry,
  StudentStandingSummary,
} from "@/lib/leaderboard-engine";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Search,
  RefreshCw,
  Download,
  Users,
  ShieldCheck,
  Code2,
  Award,
} from "lucide-react";

interface LeaderboardApiResponse {
  success: boolean;
  mode?: string;
  visibleEntries: RankedLeaderboardEntry[];
  totalCandidates: number;
  isPrivacyCapped: boolean;
  privacyCapLimit: number;
  departments: string[];
  batchYears: number[];
  departmentStandings: DepartmentChampionshipEntry[];
  myStanding: StudentStandingSummary | null;
  canViewFullCohort: boolean;
}

export default function CampusLeaderboardPage() {
  const [data, setData] = useState<LeaderboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLeaderboard = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (departmentFilter !== "ALL") params.set("department", departmentFilter);
        if (batchFilter !== "ALL") params.set("batch", batchFilter);

        const res = await fetch(`/api/leaderboard?${params.toString()}`, {
          cache: "no-store",
          signal,
        });
        if (res.ok) {
          const json = (await res.json()) as LeaderboardApiResponse;
          if (json.success && !signal?.aborted) {
            setData(json);
          }
        }
      } catch {
        // Ignore aborted or transient network errors
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [departmentFilter, batchFilter]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchLeaderboard(controller.signal);
    return () => controller.abort();
  }, [fetchLeaderboard]);

  const entries = useMemo(() => {
    const list = data?.visibleEntries || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.fullName.toLowerCase().includes(q) ||
        item.rollNo.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const podium = useMemo(() => {
    return (data?.visibleEntries || []).slice(0, 3);
  }, [data]);

  const handleExportCsv = () => {
    if (!entries.length) return;
    const headers = [
      "Rank",
      "Roll No",
      "Candidate Name",
      "Department",
      "Batch",
      "Composite XP",
      "Readiness (%)",
      "Problems Solved",
      "Exam Avg (%)",
      "Tier",
    ];
    const esc = (v: string | number) => {
      const raw = String(v);
      const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows = entries.map((e) =>
      [
        e.rank,
        e.rollNo,
        e.fullName,
        e.department,
        e.batchYear,
        e.compositeScore,
        e.readinessScore,
        e.problemsSolved,
        e.examAvgScore,
        e.tier,
      ]
        .map(esc)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eqlv-campus-leaderboard-${departmentFilter.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deptOptions = useMemo(() => {
    const list = data?.departments || ["BCA", "B.Sc CS", "B.Sc IT", "MCA"];
    return [
      { value: "ALL", label: "All Departments" },
      ...list.map((d) => ({ value: d, label: d })),
    ];
  }, [data]);

  const batchOptions = useMemo(() => {
    const years = data?.batchYears || [2026];
    return [
      { value: "ALL", label: "All Batches" },
      ...years.map((y) => ({ value: String(y), label: `Batch ${y}` })),
    ];
  }, [data]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1E2C24]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
              <Trophy className="w-3 h-3" />
              Composite Placement Rankings
            </span>
            <span className="text-[11px] font-mono text-[#99A9A0]">
              XP = Readiness x6 + Solved x12 + Exam Avg x2
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5] mt-1.5">
            Campus &amp; Department Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Live placement readiness, coding problem mastery, and proctored benchmark rankings across cohorts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void fetchLeaderboard()}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-2 rounded-xl bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] text-xs font-mono font-semibold text-[#D5E0D9] hover:text-[#F4F7F5] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span>Refresh</span>
          </button>

          {data?.canViewFullCohort && entries.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-4 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-mono font-extrabold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Leaderboard CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Logged-In Student Personal Standing Banner */}
      {data?.myStanding && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0C120F] border border-[#9DFF00]/40 shadow-[0_0_30px_-12px_rgba(157,255,0,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#9DFF00] text-[#070B09] flex flex-col items-center justify-center font-mono font-black shrink-0">
              <span className="text-[10px] leading-none uppercase">Rank</span>
              <span className="text-base leading-tight tabular-nums">
                #{data.myStanding.entry.rank}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-display font-bold text-[#F4F7F5]">
                  Your Current Standing: {data.myStanding.entry.fullName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#121B16] border border-[#2C4034] text-[#9DFF00]">
                  Top {data.myStanding.entry.percentile}%
                </span>
              </div>
              <p className="text-xs text-[#99A9A0] font-mono mt-0.5">
                {data.myStanding.pointsToNextRank > 0 &&
                data.myStanding.nextRankHolder ? (
                  <>
                    Earn{" "}
                    <span className="text-[#9DFF00] font-bold">
                      +{data.myStanding.pointsToNextRank} XP
                    </span>{" "}
                    (1 solved problem = +12 XP) to overtake{" "}
                    <span className="text-[#F4F7F5]">
                      {data.myStanding.nextRankHolder}
                    </span>
                    .
                  </>
                ) : (
                  "You hold the #1 rank in this leaderboard scope. Keep pushing!"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right font-mono shrink-0">
            <div>
              <div className="text-[10px] uppercase text-[#99A9A0]">Composite XP</div>
              <div className="text-lg font-black text-[#9DFF00] tabular-nums">
                {data.myStanding.entry.compositeScore.toLocaleString()}
              </div>
            </div>
            <Link
              href="/practice/two-sum"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-xs font-bold text-[#F4F7F5] hover:text-[#9DFF00] transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-[#9DFF00]" />
              <span>Solve &amp; Climb</span>
            </Link>
          </div>
        </div>
      )}

      {/* Department Championship Strip */}
      {data && data.departmentStandings.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#99A9A0]">
              Department Championship (Average Cohort XP)
            </h2>
            {departmentFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setDepartmentFilter("ALL")}
                className="min-h-[24px] px-2 text-xs font-mono text-[#9DFF00] hover:underline cursor-pointer"
              >
                Show All Departments
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {data.departmentStandings.slice(0, 4).map((dept) => {
              const isSelected = departmentFilter === dept.department;
              return (
                <button
                  key={dept.department}
                  type="button"
                  onClick={() =>
                    setDepartmentFilter(isSelected ? "ALL" : dept.department)
                  }
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#121B16] border-[#9DFF00] shadow-xs"
                      : "bg-[#0C120F] border-[#1E2C24] hover:bg-[#121B16]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-[#99A9A0]">
                      #{dept.rank} DEPARTMENT
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#18241D] text-[#D5E0D9]">
                      {dept.studentCount} students
                    </span>
                  </div>
                  <div className="font-display text-lg font-bold text-[#F4F7F5] mt-1">
                    {dept.department}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E2C24] text-xs font-mono tabular-nums">
                    <span className="text-[#9DFF00] font-bold">
                      {dept.avgCompositeScore} Avg XP
                    </span>
                    <span className="text-[#99A9A0]">
                      {dept.avgReadinessScore}% Ready
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {!isLoading && podium.length > 0 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {podium.map((leader) => {
            const isFirst = leader.rank === 1;
            const isSecond = leader.rank === 2;
            return (
              <div
                key={leader.id}
                className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between gap-4 ${
                  isFirst
                    ? "bg-[#0C120F] border-[#9DFF00]/60 shadow-[0_0_28px_-12px_rgba(157,255,0,0.3)]"
                    : isSecond
                    ? "bg-[#0C120F] border-sky-400/35"
                    : "bg-[#0C120F] border-amber-400/35"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                        isFirst
                          ? "bg-[#9DFF00] text-[#070B09]"
                          : isSecond
                          ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {isFirst ? (
                        <Crown className="w-5 h-5" />
                      ) : (
                        <Medal className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-base text-[#F4F7F5] truncate">
                        {leader.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-[#99A9A0] truncate">
                        {leader.rollNo} &bull; {leader.department}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black tabular-nums shrink-0 ${
                      isFirst
                        ? "bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/35"
                        : "bg-[#121B16] text-[#F4F7F5] border border-[#2C4034]"
                    }`}
                  >
                    #{leader.rank}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1E2C24] text-center font-mono">
                  <div className="p-2 rounded-xl bg-[#070B09] border border-[#1E2C24]">
                    <div className="text-[10px] text-[#99A9A0]">XP</div>
                    <div className="text-sm font-black text-[#9DFF00] tabular-nums">
                      {leader.compositeScore}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#070B09] border border-[#1E2C24]">
                    <div className="text-[10px] text-[#99A9A0]">READY</div>
                    <div className="text-sm font-bold text-[#F4F7F5] tabular-nums">
                      {leader.readinessScore}%
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#070B09] border border-[#1E2C24]">
                    <div className="text-[10px] text-[#99A9A0]">SOLVED</div>
                    <div className="text-sm font-bold text-[#F4F7F5] tabular-nums">
                      {leader.problemsSolved}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search & Scope Filters */}
      <div className="p-4 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="leaderboardSearch"
            aria-label="Search leaderboard by student name, roll number, or department"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, roll no, or department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-[#070B09] border border-[#1E2C24] px-3 py-1.5 rounded-xl">
            <span className="text-[#85998D] font-mono">Department:</span>
            <ObsidianSelect
              value={departmentFilter}
              onChange={(val) => setDepartmentFilter(val)}
              options={deptOptions}
              buttonClassName="bg-[#070B09] font-semibold text-[#F4F7F5] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#070B09] border border-[#1E2C24] px-3 py-1.5 rounded-xl">
            <span className="text-[#85998D] font-mono">Cohort:</span>
            <ObsidianSelect
              value={batchFilter}
              onChange={(val) => setBatchFilter(val)}
              options={batchOptions}
              buttonClassName="bg-[#070B09] font-semibold text-[#F4F7F5] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-[#99A9A0]">
            Computing campus composite rankings...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center mx-auto text-[#9DFF00]">
              <Users className="w-5 h-5" />
            </div>
            <div className="font-display text-base font-bold text-[#F4F7F5]">
              No Ranked Students in This Filter Yet
            </div>
            <p className="text-xs text-[#99A9A0] max-w-md mx-auto">
              As students onboard and complete coding problems or proctored assessments, live rankings appear here automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#070B09] border-b border-[#1E2C24] text-[10px] font-mono uppercase tracking-wider text-[#99A9A0]">
                    <th className="py-3.5 px-4 font-semibold w-20">Rank</th>
                    <th className="py-3.5 px-4 font-semibold">Candidate</th>
                    <th className="py-3.5 px-3 font-semibold">Department</th>
                    <th className="py-3.5 px-3 font-semibold">Tier</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Solved</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Readiness</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Composite XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2C24]/80">
                  {entries.map((row) => {
                    const isMe = data?.myStanding?.entry.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isMe
                            ? "bg-[#9DFF00]/10 hover:bg-[#9DFF00]/15"
                            : "hover:bg-[#18241D]/60"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-black tabular-nums">
                          <span
                            className={`inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-md text-xs ${
                              row.rank === 1
                                ? "bg-[#9DFF00] text-[#070B09]"
                                : row.rank === 2
                                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                : row.rank === 3
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-[#121B16] text-[#D5E0D9] border border-[#1E2C24]"
                            }`}
                          >
                            #{row.rank}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#121B16] border border-[#2C4034] flex items-center justify-center font-mono font-bold text-xs text-[#9DFF00] shrink-0">
                              {row.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#F4F7F5] flex items-center gap-1.5">
                                <span>{row.fullName}</span>
                                {isMe && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-[#99A9A0]">
                                {row.rollNo} &bull; Batch {row.batchYear}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-[#D5E0D9]">
                          {row.department}
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              row.tier === "Elite"
                                ? "bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30"
                                : row.tier === "Placement Ready"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : row.tier === "Rising"
                                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                : "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]"
                            }`}
                          >
                            <Award className="w-3 h-3" />
                            <span>{row.tier}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-[#F4F7F5] tabular-nums">
                          {row.problemsSolved}
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                          <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                            <TrendingUp className="w-3 h-3" />
                            {row.readinessScore}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#9DFF00] tabular-nums">
                          {row.compositeScore.toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Privacy / Cohort Count Bar */}
            <div className="px-4 py-3 border-t border-[#1E2C24] bg-[#070B09] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#99A9A0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9DFF00] shrink-0" />
                <span>
                  {data?.isPrivacyCapped
                    ? `Showing Top ${data.privacyCapLimit} of ${data.totalCandidates} active students (beginner privacy mode active).`
                    : `Showing ${entries.length} of ${data?.totalCandidates || entries.length} active student(s) in selected scope.`}
                </span>
              </div>
              <span>Updated live from verified submissions &amp; assessments</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
