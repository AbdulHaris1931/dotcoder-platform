"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile, Submission, DepartmentStat } from "@/types";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import {
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  Calendar,
  Send,
  Sparkles,
  BarChart3,
  Clock,
  Layers,
  FileCode,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<UserProfile | null>(null);
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);

  useEffect(() => {
    const user = DemoStore.getCurrentUser();
    setCurrentUser(user);

    const refreshData = () => {
      const studs = DemoStore.getStudents();
      const subs = DemoStore.getSubmissions();
      setStudents(studs);
      setSubmissions(subs);
    };

    refreshData();
    const unsubscribe = subscribeToDemoStore(refreshData);
    return unsubscribe;
  }, []);

  // Filter students by search and batch
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBatch =
      selectedBatch === "ALL" ||
      (selectedBatch === "BCA" && s.department === "BCA") ||
      (selectedBatch === "CS" && s.department === "B.Sc CS");

    return matchesSearch && matchesBatch;
  });

  // Calculate live stats
  const totalStudents = students.length;
  const placementReadyCount = students.filter((s) => s.readiness_score >= 80).length;
  const avgReadiness =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.readiness_score, 0) / students.length)
      : 0;

  const handleDispatchRemedial = (topic: string) => {
    setAssignmentNotice(`Remedial assignment for "${topic}" dispatched to all BCA & CS students.`);
    setTimeout(() => setAssignmentNotice(null), 4000);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F4F7F4] text-slate-900 pb-16 font-sans">
      {/* Top Banner / Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#9DFF00] text-black border border-[#85e000]">
                Faculty & Mentor Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">AVASC-TNJ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dr. S. Meenakshi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Annai Vailankanni Arts and Science College, Thanjavur &bull; Department of BCA & Computer Science
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/curriculum")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Curriculum Explorer</span>
            </button>
            <button
              onClick={() => router.push("/admin/problems")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1412] hover:bg-[#1a2320] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <FileCode className="w-4 h-4 text-[#9DFF00]" />
              <span>Problem Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {assignmentNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{assignmentNotice}</span>
            </div>
            <button
              onClick={() => setAssignmentNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Live KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Assigned Students
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {totalStudents}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">BCA & B.Sc CS</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Average Readiness
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {avgReadiness}%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">+4.2% this month</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Placement Ready (80%+)
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {placementReadyCount}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Top Tier Coders</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Batches
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">2</div>
              <span className="text-[11px] text-slate-500 font-medium">2023 - 2026 Cohorts</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Assigned Batches Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned Cohorts & Syllabus Health</h2>
              <p className="text-xs text-slate-500">Live progress across assigned department batches</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    BCA &bull; Section A
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">BCA (2023 - 2026)</h3>
                  <p className="text-xs text-slate-500">Semester VI &bull; Data Structures & Full-Stack Lab</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-slate-900">88.0%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Readiness</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Curriculum Completion (Module 3 / 5)</span>
                  <span className="font-mono font-bold">60%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#9DFF00] rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 font-mono">68</div>
                  <div className="text-[10px] text-slate-400">Students</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 font-mono">1,420</div>
                  <div className="text-[10px] text-slate-400">Problems Solved</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-emerald-600 font-mono">92%</div>
                  <div className="text-[10px] text-slate-400">Lab Attendance</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    B.Sc CS &bull; Section A
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">B.Sc Computer Science (2023 - 2026)</h3>
                  <p className="text-xs text-slate-500">Semester VI &bull; Algorithms & Problem Solving</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-slate-900">84.5%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Readiness</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Curriculum Completion (Module 3 / 5)</span>
                  <span className="font-mono font-bold">55%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "55%" }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 font-mono">56</div>
                  <div className="text-[10px] text-slate-400">Students</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800 font-mono">1,180</div>
                  <div className="text-[10px] text-slate-400">Problems Solved</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-emerald-600 font-mono">89%</div>
                  <div className="text-[10px] text-slate-400">Lab Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostic Weak Concept Matrix & Remedial Action */}
        <section className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Diagnostic Weak Concept Matrix & Targeted Interventions
                </h3>
                <p className="text-xs text-slate-500">
                  Algorithmic topics where batch accuracy is below 65%. Click Dispatch to push remedial practice.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Dynamic Programming & Memoization</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">42% Accuracy</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                68% of BCA students failed recursion base cases and memo table state transitions.
              </p>
              <button
                onClick={() => handleDispatchRemedial("Dynamic Programming Warmups")}
                className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Remedial Drill</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Tree & Graph Traversals (BFS/DFS)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">58% Accuracy</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Students confuse adjacency list traversal termination with cycle detection.
              </p>
              <button
                onClick={() => handleDispatchRemedial("Graph & BFS Mastery")}
                className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Remedial Drill</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Two Pointer & Sliding Window</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">64% Accuracy</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Off-by-one errors on variable-length subarray window expansion.
              </p>
              <button
                onClick={() => handleDispatchRemedial("Two Pointer Practice Set")}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Remedial Drill</span>
              </button>
            </div>
          </div>
        </section>

        {/* Student Performance Table & Inspection */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Mentorship Roster</h2>
              <p className="text-xs text-slate-500">
                Click any student row to inspect their 6-dimensional skill radar, submissions, and code quality.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or roll no..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                />
              </div>

              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
              >
                <option value="ALL">All Cohorts</option>
                <option value="BCA">BCA (2023 - 2026)</option>
                <option value="CS">B.Sc CS (2023 - 2026)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF8] border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Solved Problems</th>
                    <th className="py-3 px-4">Readiness</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const isReady = s.readiness_score >= 80;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedStudentForDrawer(s)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#9DFF00] group-hover:text-black text-slate-700 flex items-center justify-center font-bold text-xs font-mono transition-colors">
                              {s.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-slate-950">
                                {s.full_name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{s.roll_no}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{s.department}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {s.problems_solved || 480}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isReady ? "bg-[#9DFF00]" : "bg-amber-400"
                                }`}
                                style={{ width: `${s.readiness_score}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              {s.readiness_score}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isReady
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {isReady ? "Placement Ready" : "In Progress"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentForDrawer(s);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Slide-Over Drawer for Selected Student Profile */}
      <AnimatePresence>
        {selectedStudentForDrawer && (
          <StudentDrawer
            student={selectedStudentForDrawer}
            submissions={submissions}
            onClose={() => setSelectedStudentForDrawer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
