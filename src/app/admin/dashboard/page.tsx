"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { DemoStore } from "@/lib/demo-store";
import { generatePlacementCsv, downloadFile } from "@/lib/utils";
import { UserProfile, Submission, DepartmentStat } from "@/types";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Download,
  Search,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  Clock,
  Layers,
  Filter,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [colleges, setColleges] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("ALL");

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Table Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Drawer
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadCollegesAndUser() {
      const user = await DataService.getCurrentUser();
      setCurrentUser(user);

      const clgs = await DataService.getColleges();
      setColleges(clgs);
    }
    loadCollegesAndUser();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const studs = await DataService.getStudents(selectedCollege);
      const subs = await DataService.getSubmissions(selectedCollege);
      setStudents(studs);
      setSubmissions(subs);
      setLoading(false);
    }
    loadData();
  }, [selectedCollege]);

  // Derived KPIs
  const totalStudents = students.length;
  const placedReady = students.filter((s) => s.readiness_score >= 75).length;
  const avgReadiness =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, s) => acc + Number(s.readiness_score), 0) / totalStudents
        )
      : 0;

  const totalViolations = submissions.reduce(
    (acc, sub) => acc + (sub.tab_switches || 0),
    0
  );

  // Distinct active colleges count
  const distinctCollegesCount = new Set(students.map((s) => s.college_name)).size;

  // Department Stats
  const departments = ["CSE", "IT", "ECE", "EEE", "Mech"];
  const departmentStats = departments.map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept);
    const total = deptStudents.length;
    const ready = deptStudents.filter((s) => s.readiness_score >= 75).length;
    const avg =
      total > 0
        ? Math.round(
            deptStudents.reduce((acc, s) => acc + Number(s.readiness_score), 0) / total
          )
        : 0;
    return {
      department: dept,
      totalStudents: total,
      placedReady: ready,
      avgReadiness: avg,
    };
  });

  const handleExportCsv = () => {
    const csvContent = generatePlacementCsv(students, submissions);
    const dateStr = new Date().toISOString().split("T")[0];
    const collegeTag = selectedCollege === "ALL" ? "All_Colleges_Global" : selectedCollege.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Placement_Audit_${collegeTag}_${dateStr}.csv`;
    downloadFile(filename, csvContent, "text/csv");

    setExportNotice(`Exported ${filename} conforming to NAAC Criterion 5.2.1 / NBA placement audit specifications.`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.college_name && s.college_name.toLowerCase().includes(searchQuery.toLowerCase()));

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
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans text-slate-100">
      {/* Top Header: Title & Global College Filter Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Command Center
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Open Self-Serve Placement Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Institutional Command & Placement Analytics
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cross-campus candidate benchmarks, real-time proctoring telemetry, and automated NAAC audit reporting.
          </p>
        </div>

        {/* Global / College Switcher & Navigation CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* College Filter Dropdown */}
          <div className="flex items-center gap-2 bg-[#141418] border border-white/[0.08] rounded-xl px-3 py-1.5 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="bg-transparent text-xs font-mono font-medium text-white focus:outline-none cursor-pointer max-w-[200px] sm:max-w-xs truncate"
            >
              <option value="ALL" className="bg-[#111114]">All Colleges (Global View)</option>
              {colleges.map((c) => (
                <option key={c} value={c} className="bg-[#111114]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => router.push("/admin/problems")}
            className="px-3.5 py-2 text-xs font-semibold bg-[#141418] hover:bg-[#18181C] border border-white/[0.08] text-indigo-300 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Question Bank</span>
          </button>

          <button
            onClick={() => router.push("/admin/assessments")}
            className="px-3.5 py-2 text-xs font-semibold bg-[#141418] hover:bg-[#18181C] border border-white/[0.08] text-amber-300 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Test</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export NAAC CSV</span>
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
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-Card Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Registered Students */}
        <div className="card-obsidian rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Candidates</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] text-slate-300 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {totalStudents}
            </span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              {distinctCollegesCount} Institutions
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {selectedCollege === "ALL" ? "Across all registered campuses" : selectedCollege}
          </div>
        </div>

        {/* KPI 2: Placement Ready */}
        <div className="card-obsidian rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Placement Ready</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {placedReady}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              &ge; 75% Score
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {totalStudents > 0 ? `${Math.round((placedReady / totalStudents) * 100)}% Conversion Ratio` : "No candidates"}
          </div>
        </div>

        {/* KPI 3: Average Campus Readiness */}
        <div className="card-obsidian rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Average Readiness</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {avgReadiness}%
            </span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              State Index
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            TCS & Zoho Benchmark
          </div>
        </div>

        {/* KPI 4: Integrity Violations */}
        <div className="card-obsidian rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Integrity Violations</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${totalViolations > 0 ? "text-rose-400" : "text-white"}`}>
              {totalViolations}
            </span>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              Defocus / Tabs
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Logged during live proctored sessions
          </div>
        </div>
      </div>

      {/* Department Readiness Telemetry */}
      <div className="card-obsidian rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">
              Branch Placement Readiness Telemetry
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Ready vs Total candidates across CSE, IT, ECE, EEE, and Mech.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {selectedCollege === "ALL" ? "All Campuses Combined" : selectedCollege}
          </span>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {departmentStats.map((dept) => {
            const ratio = dept.totalStudents > 0 ? Math.round((dept.placedReady / dept.totalStudents) * 100) : 0;
            return (
              <div
                key={dept.department}
                className="p-4 rounded-xl bg-[#0C0C0E] border border-white/[0.06] space-y-3 font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{dept.department}</span>
                  <span className="text-[10px] text-slate-400">
                    {dept.placedReady}/{dept.totalStudents} Ready
                  </span>
                </div>

                <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Avg: {dept.avgReadiness}%</span>
                  <span className="text-emerald-400">{ratio}% Ratio</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Leaderboard & Performance Table */}
      <div className="card-obsidian rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Candidate Placement Leaderboard ({filteredStudents.length})
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Click any candidate row to slide-over inspect their complete assessment audit log.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidate, roll, college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#141418] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1.5 px-3 text-xs bg-[#141418] border border-white/[0.08] rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mech">Mech</option>
            </select>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="py-1.5 px-3 text-xs bg-[#141418] border border-white/[0.08] rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">All Readiness Tiers</option>
              <option value="Ready">Placement Ready (&ge;75%)</option>
              <option value="Needs Practice">Needs Practice (60-74%)</option>
              <option value="At-Risk">At-Risk (&lt;60%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono uppercase text-slate-500 border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-3">Roll No</th>
                <th className="py-3 px-3">Candidate Name</th>
                <th className="py-3 px-3">College / University</th>
                <th className="py-3 px-3">Dept</th>
                <th className="py-3 px-3">Readiness</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Integrity Flags</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
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
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-3 font-mono font-semibold text-white">
                      {s.roll_no}
                    </td>

                    <td className="py-3.5 px-3 font-medium text-white group-hover:text-indigo-400 transition-colors">
                      {s.full_name}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 font-mono truncate max-w-[200px]">
                      {s.college_name}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        {s.department}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2 font-mono">
                        <div className="w-14 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.readiness_score >= 75
                                ? "bg-emerald-400"
                                : s.readiness_score >= 60
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                            style={{ width: `${s.readiness_score}%` }}
                          />
                        </div>
                        <span className="text-white tabular-nums font-semibold">
                          {s.readiness_score}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          tier === "Ready"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : tier === "Needs Practice"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {tier}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      {stats.violations > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          {stats.violations} Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="text-[11px] font-mono text-slate-500 group-hover:text-white transition-colors flex items-center justify-end gap-1">
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
