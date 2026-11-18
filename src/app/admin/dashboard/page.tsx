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
      avgScore: avg,
    };
  });

  const handleExportCsv = () => {
    const csvContent = generatePlacementCsv(students, submissions);
    const dateStr = new Date().toISOString().split("T")[0];
    const collegeTag = selectedCollege === "ALL" ? "All_Colleges_Global" : selectedCollege.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Placement_Audit_${collegeTag}_${dateStr}.csv`;
    downloadFile(filename, csvContent, "text/csv");

    setExportNotice(`Exported ${filename}`);
    setTimeout(() => setExportNotice(null), 4000);
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
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans text-slate-900">
      {/* Top Header: Title & Global College Filter Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Placement Analytics
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Candidate benchmarks and test telemetry.
          </p>
        </div>

        {/* Global / College Switcher & Navigation CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* College Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="bg-transparent text-xs font-mono font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] sm:max-w-xs truncate"
            >
              <option value="ALL">All Campuses</option>
              {colleges.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => router.push("/admin/problems")}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-indigo-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:border-slate-300 active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Question Bank</span>
          </button>

          <button
            onClick={() => router.push("/admin/assessments")}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-amber-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:border-slate-300 active:scale-[0.98]"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Create Test</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
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
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-Card Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Registered Students */}
        <div className="card-luxury rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Total Candidates</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalStudents}
            </span>
            <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {distinctCollegesCount} Campuses
            </span>
          </div>
        </div>

        {/* KPI 2: Placement Ready */}
        <div className="card-luxury rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Placement Ready</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {placedReady}
            </span>
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ≥ 75%
            </span>
          </div>
        </div>

        {/* KPI 3: Average Campus Readiness */}
        <div className="card-luxury rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Average Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {avgReadiness}%
            </span>
          </div>
        </div>

        {/* KPI 4: Integrity Violations */}
        <div className="card-luxury rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Integrity Violations</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${totalViolations > 0 ? "text-rose-600" : "text-slate-900"}`}>
              {totalViolations}
            </span>
            <span className="text-[11px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Defocus / Tabs
            </span>
          </div>
        </div>
      </div>

      {/* Department Readiness Telemetry */}
      <div className="card-luxury rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Branch Placement Readiness Telemetry
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Ready vs Total candidates across CSE, IT, ECE, EEE, and Mech.
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {selectedCollege === "ALL" ? "All Campuses Combined" : selectedCollege}
          </span>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {departmentStats.map((dept) => {
            const ratio = dept.totalStudents > 0 ? Math.round((dept.placedReady / dept.totalStudents) * 100) : 0;
            return (
              <div
                key={dept.department}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{dept.department}</span>
                  <span className="text-[11px] text-slate-500">
                    {dept.placedReady}/{dept.totalStudents} Ready
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Avg: {dept.avgReadiness}%</span>
                  <span className="text-emerald-600 font-bold">{ratio}% Ratio</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Leaderboard & Performance Table */}
      <div className="card-luxury rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Candidate Placement Leaderboard ({filteredStudents.length})
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Click any candidate row to slide-over inspect their complete assessment audit log.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidate, roll, college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56 shadow-sm"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm"
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
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm"
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
            <thead className="text-[11px] font-mono uppercase text-slate-500 bg-slate-50/80 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
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
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-900">
                      {s.roll_no}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {s.full_name}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-sans truncate max-w-[200px]">
                      {s.college_name}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {s.department}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2 font-mono">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              s.readiness_score >= 75
                                ? "bg-emerald-500"
                                : s.readiness_score >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${s.readiness_score}%` }}
                          />
                        </div>
                        <span className="text-slate-900 tabular-nums font-bold">
                          {s.readiness_score}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                          tier === "Ready"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : tier === "Needs Practice"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {tier}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      {stats.violations > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          {stats.violations} Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="text-[11px] font-mono text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center justify-end gap-1 font-medium">
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
