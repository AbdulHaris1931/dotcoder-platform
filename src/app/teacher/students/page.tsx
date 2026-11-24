"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { DataService } from "@/lib/supabase/db";
import { AssignmentService } from "@/lib/services/assignment-service";
import { UserProfile, Submission } from "@/types";
import { MentorFeedbackRecord } from "@/types/assignment";
import { SkillIntelligenceService } from "@/lib/services/skill-intelligence";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import {
  Users,
  Search,
  Code2,
  CheckCircle2,
  MessageSquare,
  Star,
  Send,
  Eye,
  X,
  BookOpen,
  GraduationCap,
} from "lucide-react";

function TeacherStudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDept = searchParams.get("department") || "ALL";

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mentorFeedbacks, setMentorFeedbacks] = useState<MentorFeedbackRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>(initialDept);

  // Inspection Drawer & Modal States
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<UserProfile | null>(null);
  const [inspectingSubmission, setInspectingSubmission] = useState<{
    student: UserProfile;
    submission: Submission;
  } | null>(null);

  // Mentor Feedback Form State
  const [feedbackText, setFeedbackText] = useState("");
  const [qualityRating, setQualityRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [recommendedTopic, setRecommendedTopic] = useState("Dynamic Programming (1D & 2D)");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const refreshData = async () => {
      const [studs, subs, fbs] = await Promise.all([
        DataService.getStudents(),
        DataService.getSubmissions(),
        AssignmentService.getMentorFeedback(),
      ]);
      if (!isMounted) return;
      setStudents(studs);
      setSubmissions(subs);
      setMentorFeedbacks(fbs);
    };

    refreshData();
    const unsub = subscribeToDemoStore(() => {
      void refreshData();
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const dept = s.department || "";
      const matchesDept =
        selectedDept === "ALL" ||
        (selectedDept === "BCA" && dept.includes("BCA")) ||
        (selectedDept === "B.Sc CS" && dept.includes("CS")) ||
        (selectedDept === "B.Sc IT" && dept.includes("IT")) ||
        (selectedDept === "MCA" && dept.includes("MCA")) ||
        dept.toLowerCase().includes(selectedDept.toLowerCase());

      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, selectedDept]);

  // Find latest submission for a student
  const getLatestSubmission = (studentId: string): Submission | undefined => {
    return submissions.find((s) => s.user_id === studentId);
  };

  const handleOpenInspection = (student: UserProfile) => {
    const sub = getLatestSubmission(student.id) || {
      id: `sub-demo-${student.id}`,
      assessment_id: "demo",
      user_id: student.id,
      problem_id: "11111111-0000-0000-0000-000000000001",
      language: "python" as const,
      source_code: `import sys\n\ndef two_sum(nums, target):\n    # Optimized hash map approach\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n\nif __name__ == '__main__':\n    lines = [l.strip() for l in sys.stdin.read().split('\\n') if l.strip()]\n    if len(lines) >= 2:\n        nums = list(map(int, lines[0].split()))\n        target = int(lines[1])\n        res = two_sum(nums, target)\n        print(f"{res[0]} {res[1]}")`,
      status: "Accepted" as const,
      passed_cases: 5,
      total_cases: 5,
      score: 100,
      execution_time_ms: 124,
      tab_switches: 0,
      submitted_at: new Date().toISOString(),
      problem_title: "Optimal Two Sum Index Pairs",
    };

    setInspectingSubmission({ student, submission: sub });
    setFeedbackText("");
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingSubmission || !feedbackText.trim()) return;

    const activeMentor = DemoStore.getCurrentUser();
    const created = await AssignmentService.submitMentorFeedback({
      studentId: inspectingSubmission.student.id,
      studentName: inspectingSubmission.student.full_name,
      teacherId: activeMentor?.id || "00000000-0000-0000-0000-000000000001",
      teacherName: activeMentor?.full_name || "Faculty Mentor",
      feedbackText,
      codeQualityRating: qualityRating,
      recommendedTopic,
    });

    setMentorFeedbacks((prev) => [created, ...prev]);
    setNotice(`Mentor feedback dispatched to ${inspectingSubmission.student.full_name}!`);
    setInspectingSubmission(null);
    setTimeout(() => setNotice(null), 4000);
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
              Student Mentorship &amp; Code Inspection
            </h1>
            <p className="text-xs sm:text-sm text-[#99A9A0] mt-0.5">
              Inspect student source code, runtime efficiency, failed edge cases, and dispatch personalized mentor reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/teacher/assignments")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E2C24] bg-[#121B16] hover:bg-[#18241D] text-xs font-semibold text-[#D5E0D9] hover:text-[#F4F7F5] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#99A9A0]" />
              <span>Assignments</span>
            </button>
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-all active:scale-[0.98]"
            >
              <Users className="w-4 h-4 text-[#070B09]" />
              <span>Cohort Health</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-emerald-300 hover:text-[#F4F7F5] font-bold">
              Close
            </button>
          </motion.div>
        )}

        {/* Filter Bar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-bold tracking-tight text-[#F4F7F5]">Assigned Cohort Mentees</h2>
              <p className="text-xs text-[#99A9A0]">
                Click &quot;Inspect Code&quot; to review recent problem submissions and deliver targeted mentor advice.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#85998D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="search"
                  aria-label="Search mentee or roll no"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mentee or roll no..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[#1E2C24] bg-[#070B09] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
                />
              </div>

              <ObsidianSelect value={String(selectedDept)} onChange={(val) => setSelectedDept(val)} options={[{ value: "ALL", label: `All Assigned Cohorts ( ${students.length} )` }, { value: "BCA", label: "BCA (2023 - 2026)" }, { value: "B.Sc CS", label: "B.Sc CS (2023 - 2026)" }, { value: "B.Sc IT", label: "B.Sc IT (2023 - 2026)" }, { value: "MCA", label: "MCA (2024 - 2026)" }]} buttonClassName="px-3 py-1.5 rounded-xl border border-[#1E2C24] bg-[#070B09] text-xs text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]" />
            </div>
          </div>

          {/* Mentorship Roster Table */}
          <div className="rounded-2xl border border-[#1E2C24] bg-[#0C120F] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121B16] border-b border-[#1E2C24] text-[11px] font-semibold text-[#85998D] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Mentee</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Assessment / Problem</th>
                    <th className="py-3 px-4">Coding Accuracy</th>
                    <th className="py-3 px-4">Test Cases Passed</th>
                    <th className="py-3 px-4">Knowledge Level</th>
                    <th className="py-3 px-4">Readiness</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2C24]">
                  {filteredStudents.map((student) => {
                    const sub = getLatestSubmission(student.id);
                    const isReady = (student.readiness_score || 0) >= 80;
                    const skillProfile = SkillIntelligenceService.calculateSkillProfile(student, submissions);
                    const accScore = skillProfile.breakdown.accuracyScore;
                    const studentSubs = submissions.filter((s) => s.user_id === student.id);
                    const totalCases = studentSubs.reduce((acc, s) => acc + (s.total_cases || 5), 0);
                    const passedCases = studentSubs.reduce((acc, s) => acc + (s.passed_cases || 0), 0);
                    const caseRatio = totalCases > 0 ? `${passedCases}/${totalCases}` : "0/0";
                    const casePct = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;

                    const knowledgeLevel =
                      skillProfile.breakdown.placementReadinessScore >= 80
                        ? "Level 3: Ready"
                        : skillProfile.breakdown.placementReadinessScore >= 65
                        ? "Level 2: Proficient"
                        : studentSubs.length === 0
                        ? "Level 0: Not Started"
                        : "Level 1: Developing";

                    return (
                      <tr key={student.id} className="hover:bg-[#18241D]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#121B16] border border-[#2C4034] text-[#9DFF00] flex items-center justify-center font-bold text-xs font-mono">
                              {student.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <div className="font-bold text-[#F4F7F5]">{student.full_name}</div>
                              <div className="text-[10px] text-[#85998D] font-mono">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-[#99A9A0]">{student.roll_no}</td>
                        <td className="py-3.5 px-4 font-medium text-[#D5E0D9]">{student.department}</td>
                        <td className="py-3.5 px-4">
                          <span className={`font-semibold line-clamp-1 max-w-[180px] ${sub ? "text-[#F4F7F5]" : "text-[#85998D] italic"}`}>
                            {sub?.problem_title || "No submissions yet"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              !sub
                                ? "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]"
                                : sub.status === "Accepted"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                            }`}
                          >
                            {sub?.status || "Not Started"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs">
                              <span className="font-bold text-[#F4F7F5]">{accScore}%</span>
                            </div>
                            <div className="w-16 h-1.5 rounded-full bg-[#121B16] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  accScore >= 80 ? "bg-emerald-400" : accScore >= 65 ? "bg-sky-400" : "bg-amber-400"
                                }`}
                                style={{ width: `${accScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs">
                            <span className="font-bold text-[#F4F7F5]">{caseRatio}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                casePct >= 80
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                  : "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                              }`}
                            >
                              {casePct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              knowledgeLevel.includes("Level 3")
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                : knowledgeLevel.includes("Level 2")
                                ? "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                            }`}
                          >
                            <GraduationCap className="w-3 h-3" />
                            <span>{knowledgeLevel}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              isReady
                                ? "bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                            }`}
                          >
                            {student.readiness_score !== undefined ? student.readiness_score : 0}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedStudentForDrawer(student)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#1E2C24] bg-[#121B16] text-[#D5E0D9] hover:bg-[#18241D] hover:text-[#F4F7F5] text-xs font-semibold transition-colors flex items-center gap-1"
                              title="View 6-Dimensional Skill Telemetry"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Vectors</span>
                            </button>
                            <button
                              onClick={() => handleOpenInspection(student)}
                              className="px-3 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              <span>Inspect Code</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Recent Mentor Feedback Dispatches */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-display font-bold tracking-tight text-[#F4F7F5]">Recent Mentor Code Reviews</h2>
            <p className="text-xs text-[#99A9A0]">Historical feedback records dispatched to AVASC students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentorFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-[#F4F7F5]">{fb.studentName}</div>
                    <div className="text-[10px] text-[#85998D] font-mono tabular-nums">
                      Mentor: {fb.teacherName} &bull; {new Date(fb.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: fb.codeQualityRating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#D5E0D9] bg-[#121B16] p-3 rounded-xl border border-[#1E2C24] leading-relaxed italic">
                  &ldquo;{fb.feedbackText}&rdquo;
                </p>

                {fb.recommendedTopic && (
                  <div className="text-[11px] text-[#99A9A0] flex items-center gap-1.5 font-medium">
                    <span className="text-[10px] uppercase font-bold text-[#85998D] font-mono">Recommended Topic:</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25 font-semibold text-[10px]">
                      {fb.recommendedTopic}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Code Inspection & Mentor Review Modal */}
      <AnimatePresence>
        {inspectingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0C120F] rounded-3xl max-w-3xl w-full shadow-2xl border border-[#2C4034] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#1E2C24] flex items-center justify-between bg-[#121B16]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#9DFF00]/15 border border-[#9DFF00]/30 text-[#9DFF00] flex items-center justify-center font-bold font-mono">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold tracking-tight text-sm text-[#F4F7F5]">
                      Code Inspection: {inspectingSubmission.student.full_name}
                    </h2>
                    <div className="text-[11px] font-mono text-[#99A9A0]">
                      {inspectingSubmission.student.roll_no} &bull; {inspectingSubmission.student.department} &bull;{" "}
                      {inspectingSubmission.submission.problem_title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingSubmission(null)}
                  className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Metric Strip */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                    <div className="text-[10px] uppercase font-bold text-[#85998D] font-mono">Status</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {inspectingSubmission.submission.status}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                    <div className="text-[10px] uppercase font-bold text-[#85998D] font-mono">Test Cases</div>
                    <div className="text-xs font-bold text-[#F4F7F5] font-mono tabular-nums">
                      {inspectingSubmission.submission.passed_cases} / {inspectingSubmission.submission.total_cases}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                    <div className="text-[10px] uppercase font-bold text-[#85998D] font-mono">Runtime</div>
                    <div className="text-xs font-bold text-[#F4F7F5] font-mono tabular-nums">
                      {inspectingSubmission.submission.execution_time_ms} ms
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                    <div className="text-[10px] uppercase font-bold text-[#85998D] font-mono">Language</div>
                    <div className="text-xs font-bold text-[#F4F7F5] font-mono uppercase">
                      {inspectingSubmission.submission.language}
                    </div>
                  </div>
                </div>

                {/* Source Code Viewer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-[#D5E0D9]">
                    <span className="font-bold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#99A9A0]" />
                      <span>Submitted Solution Source</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#85998D]">Read-Only Audit</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-[#070B09] text-[#D5E0D9] text-xs font-mono overflow-x-auto leading-relaxed border border-[#1E2C24]">
                    <code>{inspectingSubmission.submission.source_code}</code>
                  </pre>
                </div>

                {/* Mentor Feedback Input Form */}
                <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-3 border-t border-[#1E2C24]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#F4F7F5] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#99A9A0]" />
                      <span>Deliver Faculty Mentor Feedback</span>
                    </h4>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#85998D] font-medium mr-1">Code Quality:</span>
                      {([1, 2, 3, 4, 5] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setQualityRating(r)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              r <= qualityRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-[#2C4034]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#D5E0D9] mb-1">
                      Target Focus / Remedial Topic
                    </label>
                    <ObsidianSelect value={String(recommendedTopic)} onChange={(val) => setRecommendedTopic(val)} options={[{ value: "Dynamic Programming (1D & 2D)", label: "Dynamic Programming (1D &amp; 2D)" }, { value: "Graph Theory & Topological Sort", label: "Graph Theory &amp; Topological Sort" }, { value: "Sliding Window Invariants", label: "Sliding Window Invariants" }, { value: "Binary Trees & BST Traversals", label: "Binary Trees &amp; BST Traversals" }, { value: "Monotonic Stacks & Queues", label: "Monotonic Stacks &amp; Queues" }]} buttonClassName="w-full px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#D5E0D9] mb-1">
                      Mentorship Advice &amp; Code Improvements
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Give actionable guidance on algorithmic time complexity, space traps, or edge-case handling..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setInspectingSubmission(null)}
                      className="px-4 py-2 rounded-xl border border-[#1E2C24] bg-[#121B16] text-[#D5E0D9] hover:bg-[#18241D] font-semibold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Review to Student</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6-Dimensional Skill Telemetry Slide-Over Drawer */}
      <StudentDrawer
        student={selectedStudentForDrawer}
        submissions={submissions}
        onClose={() => setSelectedStudentForDrawer(null)}
      />
    </div>
  );
}

export default function TeacherStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen bg-[#070B09] flex items-center justify-center font-mono text-xs text-[#99A9A0]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse" />
            <span>Loading Student Cohort Data...</span>
          </div>
        </div>
      }
    >
      <TeacherStudentsContent />
    </Suspense>
  );
}
