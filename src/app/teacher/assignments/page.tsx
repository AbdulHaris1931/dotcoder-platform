"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AssignmentService } from "@/lib/services/assignment-service";
import { DemoStore } from "@/lib/demo-store";
import { UserProfile } from "@/types";
import { TeacherAssignment, CohortBatch, ProblemBundleItem } from "@/types/assignment";
import { MNC_CURRICULUM_UNITS, MncUnit } from "@/lib/mnc-curriculum-data";
import {
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  Plus,
  Send,
  Target,
  Users,
  X,
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
  const [cohortYear] = useState("2023 - 2026");
  const [dueDays, setDueDays] = useState(7);
  const [passingPercent] = useState(80);
  const [selectedProblemSlugs, setSelectedProblemSlugs] = useState<string[]>([
    "optimal-two-sum-index-pairs",
  ]);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    setCurrentUser(DemoStore.getCurrentUser());
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

  const handleDispatchMncUnit = async (unit: MncUnit, dept: CohortBatch = "BCA") => {
    const enrolled = dept === "BCA" ? 68 : dept === "B.Sc CS" ? 56 : 42;
    const created = await AssignmentService.createAssignment({
      title: `Unit ${unit.unit_number}: ${unit.title}`,
      description: `${unit.subtitle}. Curated from MNC 300 question bank: includes 10 coding challenges, 20 domain MCQs, and 45-min proctored exam.`,
      teacherId: currentUser?.id || "00000000-0000-0000-0000-000000000001",
      teacherName: currentUser?.full_name || "Faculty Mentor",
      institutionId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      targetDepartment: dept,
      cohortYear: "2023 - 2026",
      problems: [
        {
          problemId: unit.coding_problem_ids[0],
          problemTitle: `Unit ${unit.unit_number} Coding: ${unit.title}`,
          difficulty: "Medium",
          category: "Algorithmic Pattern",
          targetSlug: `mnc-${unit.id}`,
        },
      ],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      passingCasePercent: 75,
      totalEnrolled: enrolled,
      status: "Active",
    });

    setAssignments((prev) => [created, ...prev]);
    setNotification(`Dispatched "Unit ${unit.unit_number}: ${unit.title}" to ${dept} cohort!`);
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
      teacherId: currentUser?.id || "00000000-0000-0000-0000-000000000001",
      teacherName: currentUser?.full_name || "Faculty Mentor",
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
    <div className="flex-1 min-h-screen bg-[#070B09] text-[#F4F7F5] pb-16 font-sans">
      {/* Top Banner / Header */}
      <div className="bg-[#0C120F] border-b border-[#1E2C24] px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
                Faculty &amp; Mentor Portal
              </span>
              <span className="text-xs text-[#85998D] font-mono">AVASC-TNJ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#F4F7F5] tracking-tight">
              Assignments &amp; Problem Bundles
            </h1>
            <p className="text-xs sm:text-sm text-[#99A9A0] mt-0.5">
              Curate structured problem bundles, assign practice by degree track, and track completion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E2C24] bg-[#121B16] hover:bg-[#18241D] text-xs font-semibold text-[#D5E0D9] hover:text-[#F4F7F5] transition-colors"
            >
              <Users className="w-4 h-4 text-[#99A9A0]" />
              <span>Cohort Health</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-[#070B09]" />
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
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-300 hover:text-[#F4F7F5] font-bold">
              Close
            </button>
          </motion.div>
        )}

        {/* Aggregate KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85998D]">
                Active Bundles
              </span>
              <div className="text-2xl font-bold text-[#F4F7F5] font-mono tabular-nums">
                {totalAssignments}
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">BCA &amp; B.Sc CS</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center text-[#D5E0D9]">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85998D]">
                Total Submissions
              </span>
              <div className="text-2xl font-bold text-[#F4F7F5] font-mono tabular-nums">
                {totalSubmitted}
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Live Code Records</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Code2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85998D]">
                Cohort Submission Rate
              </span>
              <div className="text-2xl font-bold text-[#F4F7F5] font-mono tabular-nums">
                {avgCompletionRate}%
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">+6.4% this week</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85998D]">
                Avg Code Score
              </span>
              <div className="text-2xl font-bold text-[#F4F7F5] font-mono tabular-nums">
                87.6%
              </div>
              <span className="text-[11px] text-[#99A9A0] font-medium">Test Case Pass Ratio</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* ━━━ MNC 300 INTERVIEW UNITS QUICK DISPATCH ━━━━━━━━━ */}
        <section className="p-6 rounded-3xl bg-[#0C120F] border border-[#1E2C24] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
                  MNC 300 Question Bank
                </span>
                <span className="text-xs text-[#85998D] font-mono">10 Units &bull; 100 Coding &bull; 200 MCQs</span>
              </div>
              <h2 className="text-base font-display font-bold tracking-tight text-[#F4F7F5]">
                MNC 300 Interview Modules - Quick Cohort Dispatch
              </h2>
              <p className="text-xs text-[#99A9A0]">
                1-click broadcast of complete 10-unit curriculum bundles to BCA, B.Sc CS, or MCA cohorts with 45-min proctored exam.
              </p>
            </div>

            <button
              onClick={() => router.push("/student/mnc-prep")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1E2C24] bg-[#121B16] hover:bg-[#18241D] text-[#D5E0D9] hover:text-[#F4F7F5] text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <span>Preview Student Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {MNC_CURRICULUM_UNITS.map((unit) => (
              <div
                key={unit.id}
                className="p-3.5 rounded-2xl bg-[#121B16] border border-[#1E2C24] hover:border-[#2C4034] transition-all flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
                      UNIT {unit.unit_number.toString().padStart(2, "0")}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#85998D] uppercase truncate max-w-[80px]">
                      {unit.domain_tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#F4F7F5] mt-2 line-clamp-1">{unit.title}</h4>
                  <p className="text-[10px] text-[#99A9A0] mt-0.5 line-clamp-2">{unit.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-[#1E2C24] space-y-1.5">
                  <div className="text-[10px] font-mono text-[#85998D] flex justify-between">
                    <span>10 Code &bull; 20 MCQs</span>
                    <span className="text-emerald-400 font-bold">45 Min</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleDispatchMncUnit(unit, "BCA")}
                      className="py-1 px-1.5 rounded-lg bg-[#070B09] border border-[#1E2C24] hover:border-[#9DFF00]/40 hover:bg-[#18241D] text-[10px] font-bold text-[#D5E0D9] hover:text-[#9DFF00] transition-colors cursor-pointer text-center"
                    >
                      + BCA
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDispatchMncUnit(unit, "B.Sc CS")}
                      className="py-1 px-1.5 rounded-lg bg-[#070B09] border border-[#1E2C24] hover:border-[#9DFF00]/40 hover:bg-[#18241D] text-[10px] font-bold text-[#D5E0D9] hover:text-[#9DFF00] transition-colors cursor-pointer text-center"
                    >
                      + CS
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cohort Tabs & Filter */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-bold tracking-tight text-[#F4F7F5]">Dispatched Assignments</h2>
              <p className="text-xs text-[#99A9A0]">Filter problem bundles by target department cohort</p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#0C120F] rounded-xl border border-[#1E2C24]">
              {(["ALL", "BCA", "B.Sc CS", "MCA"] as const).map((cohort) => (
                <button
                  key={cohort}
                  onClick={() => setSelectedCohort(cohort)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCohort === cohort
                      ? "bg-[#9DFF00] text-[#070B09]"
                      : "text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D]"
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
              const daysLeft =
                nowMs === null
                  ? 0
                  : Math.max(
                      0,
                      Math.ceil((new Date(assignment.dueDate).getTime() - nowMs) / 86400000)
                    );

              return (
                <div
                  key={assignment.id}
                  className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-4 hover:border-[#2C4034] transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/25">
                          {assignment.targetDepartment} ({assignment.cohortYear})
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                          {assignment.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono tabular-nums font-bold text-[#99A9A0] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#85998D]" />
                          <span>{daysLeft}d left</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#F4F7F5] leading-snug">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-[#99A9A0] mt-1 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>

                    {/* Problem Bundle Tags */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] uppercase font-bold text-[#85998D] font-mono tracking-wider">
                        Curated Problems ({assignment.problems.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.problems.map((prob) => (
                          <span
                            key={prob.problemId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#121B16] text-[#D5E0D9] border border-[#1E2C24]"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prob.difficulty === "Easy"
                                  ? "bg-emerald-400"
                                  : prob.difficulty === "Medium"
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                              }`}
                            />
                            <span>{prob.problemTitle}</span>
                            <span className="text-[9px] text-[#85998D] font-mono uppercase">
                              [{prob.category}]
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Bottom Actions */}
                  <div className="space-y-3 pt-3 border-t border-[#1E2C24]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-[#99A9A0]">
                        <span>
                          Submissions:{" "}
                          <strong className="text-[#F4F7F5] font-mono tabular-nums">
                            {assignment.submittedCount} / {assignment.totalEnrolled}
                          </strong>
                        </span>
                        <span className="font-mono tabular-nums font-bold text-[#F4F7F5]">{completionPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#121B16] overflow-hidden">
                        <div
                          className="h-full bg-[#9DFF00] rounded-full transition-all duration-500"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleDispatch(assignment.title, assignment.targetDepartment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-[#D5E0D9] hover:text-[#F4F7F5] text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-[#99A9A0]" />
                        <span>Re-Broadcast Drill</span>
                      </button>

                      <button
                        onClick={() => router.push(`/teacher/students?department=${assignment.targetDepartment}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0C120F] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-[#2C4034] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#9DFF00]/15 border border-[#9DFF00]/30 text-[#9DFF00] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-bold tracking-tight text-[#F4F7F5]">
                      Create Problem Bundle Assignment
                    </h2>
                    <p className="text-xs text-[#99A9A0]">Dispatch targeted problem sets to AVASC department cohorts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-semibold text-[#D5E0D9] mb-1">Assignment Title</label>
                  <input
                    type="text"
                    name="title"
                    aria-label="Assignment Title"
                    required
                    placeholder="e.g. Sprint 05: Sliding Window & Hash Map Optimization"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#D5E0D9] mb-1">Description &amp; Objective</label>
                  <textarea
                    rows={2}
                    placeholder="Explain the algorithmic concepts and testcase traps emphasized..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#D5E0D9] mb-1">Target Department</label>
                    <ObsidianSelect value={String(department)} onChange={(val) => setDepartment(val as CohortBatch)} options={[{ value: "BCA", label: "BCA (2023 - 2026)" }, { value: "B.Sc CS", label: "B.Sc CS (2023 - 2026)" }, { value: "B.Sc IT", label: "B.Sc IT (2023 - 2026)" }, { value: "MCA", label: "MCA (2024 - 2026)" }]} buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]" />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#D5E0D9] mb-1">Due In (Days)</label>
                    <ObsidianSelect value={String(dueDays)} onChange={(val) => setDueDays(Number(val))} options={[{ value: String(3), label: "3 Days (Urgent Sprint)" }, { value: String(7), label: "7 Days (Standard Week)" }, { value: String(14), label: "14 Days (Extended Lab)" }]} buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]" />
                  </div>
                </div>

                {/* Problem Selection Selector */}
                <div className="space-y-2">
                  <label className="block font-semibold text-[#D5E0D9]">Select Problems for Bundle</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-[#1E2C24] rounded-xl bg-[#070B09]">
                    {AVAILABLE_PROBLEMS.map((prob) => {
                      const isSelected = selectedProblemSlugs.includes(prob.targetSlug);
                      return (
                        <button
                          type="button"
                          key={prob.problemId}
                          onClick={() => toggleProblemSelection(prob.targetSlug)}
                          className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            isSelected
                              ? "bg-[#121B16] border-[#9DFF00] text-[#F4F7F5] font-semibold"
                              : "bg-[#0C120F] border-[#1E2C24] text-[#99A9A0] hover:bg-[#18241D] hover:text-[#F4F7F5]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name={`problem-${prob.problemId}`}
                              aria-label={`Select problem ${prob.problemTitle}`}
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-[#9DFF00] rounded"
                            />
                            <span>{prob.problemTitle}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                                : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#1E2C24]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#1E2C24] bg-[#121B16] text-[#D5E0D9] hover:bg-[#18241D] font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold transition-colors"
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
