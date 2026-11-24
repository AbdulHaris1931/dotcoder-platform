"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToDemoStore } from "@/lib/demo-store";
import { DataService } from "@/lib/supabase/db";
import { generatePlacementCsv, downloadFile } from "@/lib/utils";
import { UserProfile, Submission, DepartmentStat } from "@/types";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import { EmptyStatePanel } from "@/components/ui/obsidian-primitives";
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Download,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";

export default function TPODashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    placedReady: 0,
    avgScore: 0,
    totalViolations: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refreshData = async () => {
      const [, studs, subs] = await Promise.all([
        DataService.getCurrentUser(),
        DataService.getStudents(),
        DataService.getSubmissions(),
      ]);
      if (!isMounted) return;

      setStudents(studs);
      setSubmissions(subs);

      const ready = studs.filter((s) => s.readiness_score >= 75).length;
      const avg =
        studs.length > 0
          ? Math.round(studs.reduce((acc, s) => acc + Number(s.readiness_score), 0) / studs.length)
          : 0;
      const violations = subs.reduce((acc, sub) => acc + (sub.tab_switches || 0), 0);

      setKpis({
        totalStudents: studs.length,
        placedReady: ready,
        avgScore: avg,
        totalViolations: violations,
      });

      const discoveredDepts = Array.from(
        new Set(studs.map((s) => s.department).filter((d): d is string => Boolean(d)))
      );
      const depts = discoveredDepts.length > 0 ? discoveredDepts : ["BCA", "B.Sc CS", "B.Sc IT", "MCA"];
      const stats: DepartmentStat[] = depts.map((d) => {
        const branchStudents = studs.filter((s) => s.department === d);
        const branchReady = branchStudents.filter((s) => s.readiness_score >= 75).length;
        const branchAvg =
          branchStudents.length > 0
            ? Math.round(
                branchStudents.reduce((acc, s) => acc + Number(s.readiness_score), 0) /
                  branchStudents.length
              )
            : 0;
        return {
          department: d,
          totalStudents: branchStudents.length,
          placedReady: branchReady,
          avgReadiness: branchAvg,
          avgScore: branchAvg,
        };
      });
      setDepartmentStats(stats);
    };

    void refreshData();
    const unsubscribe = subscribeToDemoStore(() => {
      void refreshData();
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleExportCsv = () => {
    const csvContent = generatePlacementCsv(students, submissions);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `AVASC_Thanjavur_Placement_Audit_${dateStr}.csv`;
    downloadFile(filename, csvContent, "text/csv");

    setExportNotice(
      `Exported ${filename} conforming to NAAC Criterion 5.2.1 / NBA placement audit specifications.`
    );
    setTimeout(() => setExportNotice(null), 5000);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === "ALL" || s.department === selectedDept;

    const tier =
      s.readiness_score >= 75
        ? "Ready"
        : s.readiness_score >= 60
        ? "Needs Practice"
        : "At-Risk";

    const matchesTier = selectedTier === "ALL" || tier === selectedTier;

    return matchesSearch && matchesDept && matchesTier;
  });

  const getStudentStats = (studentId: string) => {
    const studentSubs = submissions.filter((s) => s.user_id === studentId);
    const completed = studentSubs.length;
    const violations = studentSubs.reduce((acc, sub) => acc + (sub.tab_switches || 0), 0);
    return { completed, violations };
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 font-bold">
              TPO Executive Intelligence
            </span>
            <span className="text-[11px] text-[#99A9A0] font-mono">
              Annai Vailankanni Arts and Science College, Thanjavur
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5] mt-1.5">
            Placement Cell Operations &amp; Analytics
          </h1>
          <p className="text-xs text-[#99A9A0] mt-1">
            Real-time candidate telemetry, department benchmarks, and one-click NAAC/NBA placement audit exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/tpo/students")}
            className="px-3.5 py-2.5 text-xs font-semibold bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] hover:border-[#2C4034] text-[#F4F7F5] rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span>Upload Student CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 text-xs font-bold bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] rounded-xl transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export NAAC Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation Banner */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-Card Metric Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Total Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#99A9A0] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#F4F7F5] tabular-nums">
              {kpis.totalStudents}
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
              100% active
            </span>
          </div>
          <div className="text-[11px] text-[#85998D] font-mono">
            Across Institutional Cohorts
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Placement Ready</span>
            <div className="w-8 h-8 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/25 text-[#9DFF00] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#9DFF00] tabular-nums">
              {kpis.placedReady}
            </span>
            <span className="text-[10px] font-mono font-semibold text-[#9DFF00] bg-[#9DFF00]/10 px-2 py-0.5 rounded-full border border-[#9DFF00]/25">
              &ge; 75% Score
            </span>
          </div>
          <div className="text-[11px] text-[#85998D] font-mono">
            Eligible for Day-1 Enterprise Drives
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Campus Avg Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#F4F7F5] tabular-nums">
              {kpis.avgScore}%
            </span>
            <span className="text-[10px] font-mono font-semibold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/25">
              Live Index
            </span>
          </div>
          <div className="text-[11px] text-[#85998D] font-mono">
            Institutional Benchmark
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Integrity Violations</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`font-display text-3xl font-bold tabular-nums ${
                kpis.totalViolations > 0 ? "text-rose-400" : "text-[#F4F7F5]"
              }`}
            >
              {kpis.totalViolations}
            </span>
            <span className="text-[10px] font-mono font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25">
              Defocus / Tabs
            </span>
          </div>
          <div className="text-[11px] text-[#85998D] font-mono">
            Flagged for Placement Cell Review
          </div>
        </div>
      </div>

      {/* Department Readiness Breakdown */}
      <div className="surface-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3.5">
          <div>
            <h2 className="font-display text-sm font-bold text-[#F4F7F5]">
              Department Placement Readiness Telemetry
            </h2>
            <p className="text-xs text-[#99A9A0] mt-0.5">
              Comparative benchmark showing Ready / Total candidates across all branches.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
            Batch 2026 Live
          </span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {departmentStats.map((dept) => {
            const readyPercent =
              dept.totalStudents > 0 ? Math.round((dept.placedReady / dept.totalStudents) * 100) : 0;
            return (
              <div
                key={dept.department}
                className="p-4 rounded-xl bg-[#121B16] border border-[#1E2C24] space-y-3 font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#F4F7F5]">{dept.department}</span>
                  <span className="text-[11px] text-[#99A9A0] tabular-nums">
                    {dept.placedReady}/{dept.totalStudents} Ready
                  </span>
                </div>

                <div className="w-full bg-[#070B09] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#9DFF00] h-full rounded-full transition-all duration-500"
                    style={{ width: `${readyPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[#99A9A0] tabular-nums">
                  <span>Avg: {dept.avgReadiness}%</span>
                  <span className="text-[#9DFF00] font-bold">{readyPercent}% Ratio</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Density Student Performance & Integrity Table */}
      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2C24] pb-4">
          <div>
            <h2 className="font-display text-sm font-bold text-[#F4F7F5] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9DFF00]" />
              <span>Student Performance &amp; Integrity Roster ({filteredStudents.length})</span>
            </h2>
            <p className="text-xs text-[#99A9A0] mt-0.5">
              Click any candidate row to slide-over inspect their complete assessment audit log.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#85998D] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                name="search"
                aria-label="Search by name or roll no"
                placeholder="Search by name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#070B09] border border-[#1E2C24] rounded-xl text-[#F4F7F5] placeholder-[#85998D] focus:outline-none focus:border-[#9DFF00]/60 w-48 sm:w-56"
              />
            </div>

            <ObsidianSelect ariaLabel="Filter by department" value={String(selectedDept)} onChange={(val) => setSelectedDept(val)} options={[{ value: "ALL", label: "All Departments" }, ...departmentStats.map((d) => ({ value: String(d.department), label: String(d.department) }))]} buttonClassName="py-1.5 px-3 text-xs bg-[#070B09] border border-[#1E2C24] rounded-xl text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]/60 font-mono" />

            <ObsidianSelect ariaLabel="Filter by readiness tier" value={String(selectedTier)} onChange={(val) => setSelectedTier(val)} options={[{ value: "ALL", label: "All Readiness Tiers" }, { value: "Ready", label: "Placement Ready (&ge;75%)" }, { value: "Needs Practice", label: "Needs Practice (60-74%)" }, { value: "At-Risk", label: "At-Risk (&lt;60%)" }]} buttonClassName="py-1.5 px-3 text-xs bg-[#070B09] border border-[#1E2C24] rounded-xl text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]/60 font-mono" />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyStatePanel
            icon={Users}
            title="No Candidates Match Current Filters"
            description="Provision students via Super Admin bulk import or clear your search/department filters to view active student telemetry."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDept("ALL");
                  setSelectedTier("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-xs font-mono font-bold text-[#9DFF00] cursor-pointer"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] font-mono uppercase text-[#85998D] bg-[#070B09] border-b border-[#1E2C24]">
                <tr>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Candidate Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assessments</th>
                  <th className="py-3 px-3">Readiness</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Integrity Telemetry</th>
                  <th className="py-3 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2C24]">
                {filteredStudents.map((s) => {
                  const stats = getStudentStats(s.id);
                  const tier =
                    s.readiness_score >= 75
                      ? "Ready"
                      : s.readiness_score >= 60
                      ? "Needs Practice"
                      : "At-Risk";

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudentForDrawer(s)}
                      className="hover:bg-[#121B16]/70 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-mono font-semibold text-[#F4F7F5] tabular-nums">
                        {s.roll_no}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-[#F4F7F5] group-hover:text-[#9DFF00] transition-colors">
                        {s.full_name}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]">
                          {s.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-[#99A9A0] font-mono tabular-nums">
                        {stats.completed} Completed
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 font-mono">
                          <div className="w-16 bg-[#070B09] rounded-full h-2 overflow-hidden border border-[#1E2C24]">
                            <div
                              className={`h-full rounded-full ${
                                s.readiness_score >= 75
                                  ? "bg-[#9DFF00]"
                                  : s.readiness_score >= 60
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                              }`}
                              style={{ width: `${s.readiness_score}%` }}
                            />
                          </div>
                          <span className="text-[#F4F7F5] tabular-nums font-bold">
                            {s.readiness_score}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            tier === "Ready"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : tier === "Needs Practice"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {tier}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        {stats.violations > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            {stats.violations} Flagged
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className="text-[11px] font-mono text-[#85998D] group-hover:text-[#9DFF00] transition-colors flex items-center justify-end gap-1 font-medium">
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-Over Profile Drawer */}
      <StudentDrawer
        student={selectedStudentForDrawer}
        submissions={submissions}
        onClose={() => setSelectedStudentForDrawer(null)}
      />
    </div>
  );
}
