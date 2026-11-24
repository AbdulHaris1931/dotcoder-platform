"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToDemoStore } from "@/lib/demo-store";
import { DataService } from "@/lib/supabase/db";
import { UserProfile, Submission } from "@/types";
import { SkillIntelligenceService } from "@/lib/services/skill-intelligence";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import { EmptyStatePanel } from "@/components/ui/obsidian-primitives";
import {
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Send,
  Sparkles,
  Layers,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Download,
  X,
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
    let isMounted = true;

    const refreshData = async () => {
      const [user, studs, subs] = await Promise.all([
        DataService.getCurrentUser(),
        DataService.getStudents(),
        DataService.getSubmissions(),
      ]);
      if (!isMounted) return;
      setCurrentUser(user);
      setStudents(studs);
      setSubmissions(subs);
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

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const dept = s.department || "";
      const matchesBatch =
        selectedBatch === "ALL" ||
        (selectedBatch === "BCA" && dept.includes("BCA")) ||
        (selectedBatch === "CS" && dept.includes("CS")) ||
        (selectedBatch === "IT" && dept.includes("IT")) ||
        (selectedBatch === "MCA" && dept.includes("MCA"));

      return matchesSearch && matchesBatch;
    });
  }, [students, searchQuery, selectedBatch]);

  const studentAssessmentRecords = useMemo(() => {
    return filteredStudents.map((student) => {
      const studentSubs = submissions.filter((sub) => sub.user_id === student.id);
      const skillProfile = SkillIntelligenceService.calculateSkillProfile(student, submissions);
      const latestSub = studentSubs[0] || null;

      const accuracyScore = skillProfile.breakdown.accuracyScore;
      const totalCases = studentSubs.reduce((acc, sub) => acc + (sub.total_cases || 5), 0);
      const passedCases = studentSubs.reduce((acc, sub) => acc + (sub.passed_cases || 0), 0);
      const testCasesRatio = totalCases > 0 ? `${passedCases}/${totalCases}` : "0/0";
      const testCasesPct = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;

      const knowledgeLevel =
        skillProfile.breakdown.placementReadinessScore >= 80
          ? "Level 3: Placement Ready"
          : skillProfile.breakdown.placementReadinessScore >= 65
          ? "Level 2: Proficient"
          : studentSubs.length === 0
          ? "Level 0: Not Started"
          : "Level 1: Developing";

      const assessmentScore = latestSub
        ? latestSub.score
        : student.readiness_score !== undefined
        ? Math.round(student.readiness_score)
        : 0;
      const assessmentTitle = latestSub?.problem_title
        ? `Campus Placement Mock: ${latestSub.problem_title}`
        : studentSubs.length === 0
        ? "No Assessments Attempted"
        : "Campus Placement Screening Mock 2026";

      const tabViolations = studentSubs.reduce((acc, sub) => acc + (sub.tab_switches || 0), 0);

      return {
        student,
        skillProfile,
        latestSub,
        accuracyScore,
        testCasesRatio,
        testCasesPct,
        knowledgeLevel,
        assessmentScore,
        assessmentTitle,
        tabViolations,
        totalSubmissionsCount: studentSubs.length,
      };
    });
  }, [filteredStudents, submissions]);

  const batchAvgAccuracy = useMemo(() => {
    if (studentAssessmentRecords.length === 0) return 0;
    return Math.round(
      studentAssessmentRecords.reduce((acc, r) => acc + r.accuracyScore, 0) /
        studentAssessmentRecords.length
    );
  }, [studentAssessmentRecords]);

  const batchAvgTestCasePass = useMemo(() => {
    if (studentAssessmentRecords.length === 0) return 0;
    return Math.round(
      studentAssessmentRecords.reduce((acc, r) => acc + r.testCasesPct, 0) /
        studentAssessmentRecords.length
    );
  }, [studentAssessmentRecords]);

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

  const handleExportGradeSheet = () => {
    const headers = [
      "Register_No",
      "Candidate_Name",
      "Department",
      "Assessment_Attempted",
      "Assessment_Score",
      "Passing_Status",
      "Coding_Accuracy_Pct",
      "Test_Cases_Passed",
      "Knowledge_Mastery_Level",
      "Proctor_Audit",
    ];

    const rows = studentAssessmentRecords.map((item) => [
      `"${item.student.roll_no || ""}"`,
      `"${item.student.full_name || ""}"`,
      `"${item.student.department || ""}"`,
      `"${item.assessmentTitle}"`,
      `"${item.assessmentScore}/100"`,
      `"${item.assessmentScore >= 75 ? "Passed" : "Needs Retake"}"`,
      `"${item.accuracyScore}%"`,
      `"${item.testCasesRatio} (${item.testCasesPct}%)"`,
      `"${item.knowledgeLevel}"`,
      `"${item.tabViolations > 0 ? `Flagged (${item.tabViolations} Tab Switches)` : "Clean Session"}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `AVASC_Grade_Sheet_${selectedBatch}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setAssignmentNotice(
      `Institutional Grade Sheet (${studentAssessmentRecords.length} candidates) downloaded successfully.`
    );
    setTimeout(() => setAssignmentNotice(null), 4000);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#070B09] text-[#F4F7F5] pb-16 font-sans">
      {/* Top Banner / Header */}
      <div className="bg-[#0A0F0C] border-b border-[#1E2C24] px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#9DFF00] text-[#070B09]">
                Faculty &amp; Mentor Portal
              </span>
              <span className="text-xs text-[#99A9A0] font-mono">
                {currentUser?.roll_no || "AVASC-TNJ"}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7F5] tracking-tight">
              {currentUser?.full_name || "Faculty Mentor"}
            </h1>
            <p className="text-xs sm:text-sm text-[#99A9A0] mt-0.5">
              {currentUser?.college_name || "Annai Vailankanni Arts and Science College, Thanjavur"} &bull; Department of{" "}
              {currentUser?.department || "BCA & Computer Science"}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/teacher/assessments")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#070B09]" />
              <span>AI Assessments &amp; Tests</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/teacher/assignments")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#1E2C24] bg-[#0C120F] hover:bg-[#121B16] text-xs font-semibold text-[#F4F7F5] transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#9DFF00]" />
              <span>Assignment Bundles</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/teacher/students")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#1E2C24] bg-[#0C120F] hover:bg-[#121B16] text-xs font-semibold text-[#F4F7F5] transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#99A9A0]" />
              <span>Mentorship</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/curriculum")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#1E2C24] bg-[#0C120F] hover:bg-[#121B16] text-xs font-semibold text-[#F4F7F5] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#99A9A0]" />
              <span>Curriculum</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/problems")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#2C4034] bg-[#121B16] hover:bg-[#18241D] text-[#F4F7F5] text-xs font-semibold transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-[#9DFF00]" />
              <span>Problem Bank</span>
            </button>
            <button
              type="button"
              onClick={handleExportGradeSheet}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
              title="Download official semester grade sheet for college internal marks"
            >
              <Download className="w-4 h-4" />
              <span>Grade Sheet (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {assignmentNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{assignmentNotice}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setAssignmentNotice(null)}
              className="text-emerald-300 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Live KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Assigned Students
              </span>
              <div className="font-display text-2xl font-bold text-[#F4F7F5] tabular-nums">
                {totalStudents}
              </div>
              <span className="text-[11px] text-[#9DFF00] font-medium">
                {currentUser?.department || "BCA & B.Sc CS"}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center text-[#99A9A0]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Average Readiness
              </span>
              <div className="font-display text-2xl font-bold text-[#F4F7F5] tabular-nums">
                {avgReadiness}%
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Live cohort telemetry</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Placement Ready (80%+)
              </span>
              <div className="font-display text-2xl font-bold text-[#9DFF00] tabular-nums">
                {placementReadyCount}
              </div>
              <span className="text-[11px] text-[#99A9A0] font-medium">Top Tier Coders</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Active Batches
              </span>
              <div className="font-display text-2xl font-bold text-[#F4F7F5] tabular-nums">2</div>
              <span className="text-[11px] text-[#99A9A0] font-medium">2023 - 2026 Cohorts</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Assigned Batches Cards */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#F4F7F5]">
              Assigned Cohorts &amp; Syllabus Health
            </h2>
            <p className="text-xs text-[#99A9A0]">Live progress across assigned department batches</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="surface-card p-6 rounded-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
                    BCA &bull; Section A
                  </div>
                  <h3 className="font-display text-base font-bold text-[#F4F7F5] mt-2">
                    BCA (2023 - 2026)
                  </h3>
                  <p className="text-xs text-[#99A9A0]">
                    Semester VI &bull; Data Structures &amp; Full-Stack Lab
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold text-[#9DFF00] tabular-nums">88.0%</div>
                  <div className="text-[10px] text-[#85998D] uppercase font-mono font-semibold">
                    Cohort Readiness
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-[#99A9A0]">
                  <span>Curriculum Completion (Module 3 / 5)</span>
                  <span className="font-mono font-bold text-[#F4F7F5]">60%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#121B16] overflow-hidden">
                  <div className="h-full bg-[#9DFF00] rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1E2C24] text-center">
                <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                  <div className="text-xs font-bold text-[#F4F7F5] font-mono tabular-nums">68</div>
                  <div className="text-[10px] text-[#85998D]">Students</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                  <div className="text-xs font-bold text-[#F4F7F5] font-mono tabular-nums">1,420</div>
                  <div className="text-[10px] text-[#85998D]">Problems Solved</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                  <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">92%</div>
                  <div className="text-[10px] text-[#85998D]">Lab Attendance</div>
                </div>
              </div>
            </div>

            <div className="surface-card p-6 rounded-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    B.Sc CS &bull; Section A
                  </div>
                  <h3 className="font-display text-base font-bold text-[#F4F7F5] mt-2">
                    B.Sc Computer Science (2023 - 2026)
                  </h3>
                  <p className="text-xs text-[#99A9A0]">
                    Semester VI &bull; Algorithms &amp; Problem Solving
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold text-sky-400 tabular-nums">84.5%</div>
                  <div className="text-[10px] text-[#85998D] uppercase font-mono font-semibold">
                    Cohort Readiness
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-[#99A9A0]">
                  <span>Curriculum Completion (Module 3 / 5)</span>
                  <span className="font-mono font-bold text-[#F4F7F5]">55%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#121B16] overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: "55%" }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1E2C24] text-center">
                <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                  <div className="text-xs font-bold text-[#F4F7F5] font-mono tabular-nums">56</div>
                  <div className="text-[10px] text-[#85998D]">Students</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                  <div className="text-xs font-bold text-[#F4F7F5] font-mono tabular-nums">1,180</div>
                  <div className="text-[10px] text-[#85998D]">Problems Solved</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                  <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">89%</div>
                  <div className="text-[10px] text-[#85998D]">Lab Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostic Weak Concept Matrix & Remedial Action */}
        <section className="surface-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#F4F7F5]">
                Diagnostic Weak Concept Matrix &amp; Targeted Interventions
              </h3>
              <p className="text-xs text-[#99A9A0]">
                Algorithmic topics where batch accuracy is below 65%. Dispatch remedial practice drills in one click.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#F4F7F5]">Dynamic Programming &amp; Memoization</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 shrink-0">
                  42%
                </span>
              </div>
              <p className="text-[11px] text-[#99A9A0] leading-relaxed">
                68% of BCA students failed recursion base cases and memo table state transitions.
              </p>
              <button
                type="button"
                onClick={() => handleDispatchRemedial("Dynamic Programming Warmups")}
                className="w-full py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Remedial Drill</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#F4F7F5]">Tree &amp; Graph Traversals (BFS/DFS)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 shrink-0">
                  58%
                </span>
              </div>
              <p className="text-[11px] text-[#99A9A0] leading-relaxed">
                Students confuse adjacency list traversal termination with cycle detection.
              </p>
              <button
                type="button"
                onClick={() => handleDispatchRemedial("Graph & BFS Mastery")}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Remedial Drill</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-sky-500/25 bg-sky-500/5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#F4F7F5]">Two Pointer &amp; Sliding Window</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 shrink-0">
                  64%
                </span>
              </div>
              <p className="text-[11px] text-[#99A9A0] leading-relaxed">
                Off-by-one errors on variable-length subarray window expansion.
              </p>
              <button
                type="button"
                onClick={() => handleDispatchRemedial("Two Pointer Practice Set")}
                className="w-full py-2 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Remedial Drill</span>
              </button>
            </div>
          </div>
        </section>

        {/* STUDENT ASSESSMENT OUTCOMES & CODING ACCURACY MATRIX */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
                  Live Assessment Telemetry
                </span>
                <span className="text-xs text-[#85998D] font-mono">Real-Time Mentor Feed</span>
              </div>
              <h2 className="font-display text-lg font-bold text-[#F4F7F5]">
                All Students Assessment Results &amp; Coding Accuracy
              </h2>
              <p className="text-xs text-[#99A9A0]">
                Direct view of student test case pass rates, evaluated coding accuracy, and verified knowledge levels.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#85998D] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  aria-label="Search student or roll no"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or roll no..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[#1E2C24] bg-[#0C120F] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]/60"
                />
              </div>

              <ObsidianSelect ariaLabel="Filter students by cohort" value={String(selectedBatch)} onChange={(val) => setSelectedBatch(val)} options={[{ value: "ALL", label: `All Cohorts ( ${students.length} )` }, { value: "BCA", label: "BCA (2023 - 2026)" }, { value: "CS", label: "B.Sc CS (2023 - 2026)" }, { value: "IT", label: "B.Sc IT (2023 - 2026)" }, { value: "MCA", label: "MCA (2024 - 2026)" }]} buttonClassName="px-3 py-1.5 rounded-xl border border-[#1E2C24] bg-[#0C120F] text-xs text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]/60 font-mono" />
            </div>
          </div>

          {/* Quick Metrics Bar for Mentor */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="surface-card p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-mono text-[#99A9A0] uppercase font-semibold">
                Candidates Assessed
              </div>
              <div className="font-display text-xl font-bold text-[#F4F7F5] tabular-nums">
                {studentAssessmentRecords.length} Students
              </div>
              <div className="text-[10px] text-[#85998D]">Filtered cohort count</div>
            </div>
            <div className="surface-card p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-mono text-[#99A9A0] uppercase font-semibold">
                Cohort Coding Accuracy
              </div>
              <div className="font-display text-xl font-bold text-[#9DFF00] tabular-nums">
                {batchAvgAccuracy}%
              </div>
              <div className="text-[10px] text-[#85998D]">Automated test accuracy</div>
            </div>
            <div className="surface-card p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-mono text-[#99A9A0] uppercase font-semibold">
                Test Case Pass Rate
              </div>
              <div className="font-display text-xl font-bold text-sky-400 tabular-nums">
                {batchAvgTestCasePass}%
              </div>
              <div className="text-[10px] text-[#85998D]">Hidden assertion pass ratio</div>
            </div>
            <div className="surface-card p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-mono text-[#99A9A0] uppercase font-semibold">
                Placement Ready Ratio
              </div>
              <div className="font-display text-xl font-bold text-[#F4F7F5] tabular-nums">
                {
                  studentAssessmentRecords.filter(
                    (r) => r.skillProfile.breakdown.placementReadinessScore >= 80
                  ).length
                }{" "}
                / {studentAssessmentRecords.length}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">&ge; 80% Readiness index</div>
            </div>
          </div>

          {/* Detailed Assessment Outcomes Table */}
          {studentAssessmentRecords.length === 0 ? (
            <EmptyStatePanel
              icon={Users}
              title="No Student Telemetry Records Yet"
              description="Once students are provisioned by Super Admin and attempt assessments or coding challenges, their real-time accuracy and code inspections appear here."
            />
          ) : (
            <div className="surface-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0F0C] border-b border-[#1E2C24] text-[10px] font-mono font-semibold text-[#85998D] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Assessment / Challenge</th>
                      <th className="py-3 px-4">Assessment Score</th>
                      <th className="py-3 px-4">Coding Accuracy</th>
                      <th className="py-3 px-4">Test Cases Passed</th>
                      <th className="py-3 px-4">Knowledge Level</th>
                      <th className="py-3 px-4">Proctor Audit</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2C24]">
                    {studentAssessmentRecords.map((record) => {
                      const s = record.student;
                      const isPassed = record.assessmentScore >= 75;
                      const isClean = record.tabViolations === 0;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedStudentForDrawer(s)}
                          className="hover:bg-[#121B16]/70 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#121B16] border border-[#1E2C24] group-hover:bg-[#9DFF00] group-hover:text-[#070B09] text-[#F4F7F5] flex items-center justify-center font-bold text-xs font-mono transition-colors shrink-0">
                                {s.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                              <div>
                                <div className="font-bold text-[#F4F7F5] group-hover:text-[#9DFF00] transition-colors">
                                  {s.full_name}
                                </div>
                                <div className="text-[10px] text-[#99A9A0] font-mono">
                                  {s.roll_no} &bull; {s.department}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#F4F7F5] line-clamp-1 max-w-[210px]">
                              {record.assessmentTitle}
                            </div>
                            <div className="text-[10px] text-[#85998D] font-mono">
                              {record.latestSub ? `Language: ${record.latestSub.language}` : "Standard Mock"}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] tabular-nums ${
                                isPassed
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : record.assessmentScore > 0
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {record.assessmentScore}/100 pts
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#F4F7F5] text-xs tabular-nums">
                                  {record.accuracyScore}%
                                </span>
                                <span className="text-[10px] text-[#85998D]">accuracy</span>
                              </div>
                              <div className="w-20 h-1.5 rounded-full bg-[#070B09] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    record.accuracyScore >= 80
                                      ? "bg-[#9DFF00]"
                                      : record.accuracyScore >= 65
                                      ? "bg-sky-400"
                                      : "bg-amber-400"
                                  }`}
                                  style={{ width: `${record.accuracyScore}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                              <span className="font-bold text-[#F4F7F5]">{record.testCasesRatio}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  record.testCasesPct >= 80
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : record.testCasesPct > 0
                                    ? "bg-amber-500/15 text-amber-300"
                                    : "bg-rose-500/15 text-rose-300"
                                }`}
                              >
                                {record.testCasesPct}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                record.knowledgeLevel.includes("Level 3")
                                  ? "bg-[#9DFF00]/15 text-[#9DFF00]"
                                  : record.knowledgeLevel.includes("Level 2")
                                  ? "bg-sky-500/15 text-sky-300"
                                  : "bg-amber-500/15 text-amber-300"
                              }`}
                            >
                              <GraduationCap className="w-3 h-3" />
                              <span>{record.knowledgeLevel}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {isClean ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Clean</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                <span>{record.tabViolations} Flagged</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudentForDrawer(s);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#99A9A0] hover:text-[#9DFF00] hover:bg-[#18241D] transition-colors cursor-pointer"
                            >
                              <span>Inspect Code</span>
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
          )}
        </section>
      </div>

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
