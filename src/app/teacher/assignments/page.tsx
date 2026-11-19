"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AssignmentService } from "@/lib/services/assignment-service";
import { TeacherAssignment, CohortBatch, ProblemBundleItem } from "@/types/assignment";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Filter,
  GraduationCap,
  Layers,
  Plus,
  Send,
  Sparkles,
  Target,
  Users,
  X,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const AVAILABLE_PROBLEMS: ProblemBundleItem[] = [
  {
    problemId: "11111111-0000-0000-0000-000000000001",
    problemTitle: "Optimal Two Sum Index Pairs",
    difficulty: "Easy",
    category: "Warmup",
    targetSlug: "optimal-two-sum-index-pairs",
  },
  {
    problemId: "11111111-0000-0000-0000-000000000002",
    problemTitle: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Algorithmic Pattern",
    targetSlug: "longest-substring",
  },
  {
    problemId: "11111111-0000-0000-0000-000000000003",
    problemTitle: "Valid Parentheses Monotonic Stack",
    difficulty: "Easy",
    category: "Warmup",
    targetSlug: "valid-parentheses",
  },
  {
    problemId: "11111111-0000-0000-0000-000000000004",
    problemTitle: "Container With Most Water (Two Pointers)",
    difficulty: "Medium",
    category: "Algorithmic Pattern",
    targetSlug: "container-with-most-water",
  },
  {
    problemId: "11111111-0000-0000-0000-000000000005",
    problemTitle: "LRU Cache Hash & Doubly Linked List",
    difficulty: "Hard",
    category: "Edge Case Trap",
    targetSlug: "lru-cache",
  },
];

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<CohortBatch>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Assignment Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<CohortBatch>("BCA");
  const [cohortYear, setCohortYear] = useState("2023 - 2026");
  const [dueDays, setDueDays] = useState(7);
  const [passingPercent, setPassingPercent] = useState(80);
  const [selectedProblemSlugs, setSelectedProblemSlugs] = useState<string[]>([
    "optimal-two-sum-index-pairs",
  ]);

  useEffect(() => {
    async function fetchAssignments() {
      const data = await AssignmentService.getAssignments();
      setAssignments(data);
    }
    fetchAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    if (selectedCohort === "ALL") return assignments;
    return assignments.filter((a) => a.targetDepartment === selectedCohort);
  }, [assignments, selectedCohort]);

  // Aggregate Stats
  const totalAssignments = assignments.length;
  const totalEnrolled = assignments.reduce((acc, a) => acc + a.totalEnrolled, 0);
  const totalSubmitted = assignments.reduce((acc, a) => acc + a.submittedCount, 0);
  const avgCompletionRate =
    totalEnrolled > 0 ? Math.round((totalSubmitted / totalEnrolled) * 100) : 0;

  const handleDispatch = (assignmentTitle: string, dept: string) => {
    setNotification(`Assignment "${assignmentTitle}" broadcasted to ${dept} cohort students.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenProblems = AVAILABLE_PROBLEMS.filter((p) =>
      selectedProblemSlugs.includes(p.targetSlug)
    );

    const enrolled = department === "BCA" ? 68 : department === "B.Sc CS" ? 56 : 42;

    const created = await AssignmentService.createAssignment({
      title,
      description,
      teacherId: "00000000-0000-0000-0000-000000000001",
      teacherName: "Dr. S. Meenakshi",
      institutionId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      targetDepartment: department,
      cohortYear,
      problems: chosenProblems,
      dueDate: new Date(Date.now() + dueDays * 86400000).toISOString(),
      passingCasePercent: passingPercent,
      totalEnrolled: enrolled,
      status: "Active",
    });

    setAssignments((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setNotification(`New assignment bundle "${created.title}" successfully dispatched!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleProblemSelection = (slug: string) => {
    setSelectedProblemSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
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
              Assignments & Problem Bundles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Curate structured problem bundles, assign practice by degree track, and track completion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Cohort Health</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1412] hover:bg-[#1a2320] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#9DFF00]" />
              <span>Create Assignment Bundle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </motion.div>
        )}

        {/* Aggregate KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Bundles
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {totalAssignments}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">BCA & B.Sc CS</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Submissions
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {totalSubmitted}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Live Code Records</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Code2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Cohort Submission Rate
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {avgCompletionRate}%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">+6.4% this week</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Avg Code Score
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                87.6%
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Test Case Pass Ratio</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Cohort Tabs & Filter */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dispatched Assignments</h2>
              <p className="text-xs text-slate-500">Filter problem bundles by target department cohort</p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              {(["ALL", "BCA", "B.Sc CS", "MCA"] as const).map((cohort) => (
                <button
                  key={cohort}
                  onClick={() => setSelectedCohort(cohort)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCohort === cohort
                      ? "bg-[#0F1412] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {cohort === "ALL" ? "All Cohorts" : cohort}
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssignments.map((assignment) => {
              const completionPct = Math.round(
                (assignment.submittedCount / assignment.totalEnrolled) * 100
              );
              const daysLeft = Math.max(
                0,
                Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / 86400000)
              );

              return (
                <div
                  key={assignment.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {assignment.targetDepartment} ({assignment.cohortYear})
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {assignment.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{daysLeft}d left</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>

                    {/* Problem Bundle Tags */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                        Curated Problems ({assignment.problems.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.problems.map((prob) => (
                          <span
                            key={prob.problemId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prob.difficulty === "Easy"
                                  ? "bg-emerald-500"
                                  : prob.difficulty === "Medium"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            <span>{prob.problemTitle}</span>
                            <span className="text-[9px] text-slate-400 font-mono uppercase">
                              [{prob.category}]
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Bottom Actions */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>
                          Submissions:{" "}
                          <strong className="text-slate-900 font-mono">
                            {assignment.submittedCount} / {assignment.totalEnrolled}
                          </strong>
                        </span>
                        <span className="font-mono font-bold text-slate-900">{completionPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#9DFF00] rounded-full transition-all duration-500"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleDispatch(assignment.title, assignment.targetDepartment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-slate-500" />
                        <span>Re-Broadcast Drill</span>
                      </button>

                      <button
                        onClick={() => router.push(`/teacher/students?department=${assignment.targetDepartment}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-[#9DFF00] text-xs font-bold transition-colors shadow-xs"
                      >
                        <span>Inspect Code Submissions</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F1412] text-[#9DFF00] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create Problem Bundle Assignment</h3>
                    <p className="text-xs text-slate-400">Dispatch targeted problem sets to AVASC department cohorts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sprint 05: Sliding Window & Hash Map Optimization"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description & Objective</label>
                  <textarea
                    rows={2}
                    placeholder="Explain the algorithmic concepts and testcase traps emphasized..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as CohortBatch)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                    >
                      <option value="BCA">BCA (2023 - 2026)</option>
                      <option value="B.Sc CS">B.Sc CS (2023 - 2026)</option>
                      <option value="B.Sc IT">B.Sc IT (2023 - 2026)</option>
                      <option value="MCA">MCA (2024 - 2026)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Due In (Days)</label>
                    <select
                      value={dueDays}
                      onChange={(e) => setDueDays(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                    >
                      <option value={3}>3 Days (Urgent Sprint)</option>
                      <option value={7}>7 Days (Standard Week)</option>
                      <option value={14}>14 Days (Extended Lab)</option>
                    </select>
                  </div>
                </div>

                {/* Problem Selection Selector */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Select Problems for Bundle</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                    {AVAILABLE_PROBLEMS.map((prob) => {
                      const isSelected = selectedProblemSlugs.includes(prob.targetSlug);
                      return (
                        <div
                          key={prob.problemId}
                          onClick={() => toggleProblemSelection(prob.targetSlug)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            isSelected
                              ? "bg-white border-[#9DFF00] shadow-2xs font-semibold"
                              : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-[#9DFF00] rounded"
                            />
                            <span>{prob.problemTitle}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-100 text-emerald-700"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F1412] hover:bg-black text-[#9DFF00] font-bold shadow-xs transition-colors"
                  >
                    Dispatch Assignment to Cohort
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
