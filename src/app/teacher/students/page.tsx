"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { AssignmentService } from "@/lib/services/assignment-service";
import { UserProfile, Submission } from "@/types";
import { MentorFeedbackRecord, CohortBatch } from "@/types/assignment";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import {
  Users,
  Search,
  Filter,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  MessageSquare,
  Award,
  Star,
  ChevronRight,
  Send,
  Eye,
  AlertTriangle,
  X,
  BookOpen,
  ArrowRight,
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
    const refreshData = async () => {
      const studs = DemoStore.getStudents();
      const subs = DemoStore.getSubmissions();
      setStudents(studs);
      setSubmissions(subs);

      const fbs = await AssignmentService.getMentorFeedback();
      setMentorFeedbacks(fbs);
    };

    refreshData();
    const unsub = subscribeToDemoStore(refreshData);
    return unsub;
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        selectedDept === "ALL" ||
        (selectedDept === "BCA" && s.department === "BCA") ||
        (selectedDept === "B.Sc CS" && s.department === "B.Sc CS");

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

    const created = await AssignmentService.submitMentorFeedback({
      studentId: inspectingSubmission.student.id,
      studentName: inspectingSubmission.student.full_name,
      teacherId: "00000000-0000-0000-0000-000000000001",
      teacherName: "Dr. S. Meenakshi",
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
              Student Mentorship & Code Inspection
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Inspect student source code, runtime efficiency, failed edge cases, and dispatch personalized mentor reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/teacher/assignments")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Assignments</span>
            </button>
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1412] hover:bg-[#1a2320] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Users className="w-4 h-4 text-[#9DFF00]" />
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
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </motion.div>
        )}

        {/* Filter Bar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned Cohort Mentees</h2>
              <p className="text-xs text-slate-500">
                Click "Inspect Code" to review recent problem submissions and deliver targeted mentor advice.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mentee or roll no..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
              >
                <option value="ALL">All Assigned Cohorts</option>
                <option value="BCA">BCA (2023 - 2026)</option>
                <option value="B.Sc CS">B.Sc CS (2023 - 2026)</option>
              </select>
            </div>
          </div>

          {/* Mentorship Roster Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF8] border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Mentee</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Latest Problem</th>
                    <th className="py-3 px-4">Code Status</th>
                    <th className="py-3 px-4">Readiness</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const sub = getLatestSubmission(student.id);
                    const isReady = (student.readiness_score || 0) >= 80;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono">
                              {student.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{student.full_name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{student.roll_no}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{student.department}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">
                            {sub?.problem_title || "Optimal Two Sum Index Pairs"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              sub?.status === "Accepted" || !sub
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {sub?.status === "Accepted" || !sub ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            <span>{sub?.status || "Accepted (5/5)"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              isReady ? "bg-[#9DFF00]/20 text-[#152317]" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {student.readiness_score || 88}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedStudentForDrawer(student)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="View 6-Dimensional Skill Telemetry"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Vectors</span>
                            </button>
                            <button
                              onClick={() => handleOpenInspection(student)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-[#9DFF00] text-xs font-bold transition-all shadow-xs flex items-center gap-1"
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
            <h3 className="text-base font-bold text-slate-900">Recent Mentor Code Reviews</h3>
            <p className="text-xs text-slate-500">Historical feedback records dispatched to AVASC students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentorFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{fb.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Mentor: {fb.teacherName} &bull; {new Date(fb.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: fb.codeQualityRating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                  "{fb.feedbackText}"
                </p>

                {fb.recommendedTopic && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Recommended Topic:</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[10px]">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0F1412] text-[#9DFF00] flex items-center justify-center font-bold font-mono">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Code Inspection: {inspectingSubmission.student.full_name}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-500">
                      {inspectingSubmission.student.roll_no} &bull; {inspectingSubmission.student.department} &bull;{" "}
                      {inspectingSubmission.submission.problem_title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingSubmission(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Metric Strip */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Status</div>
                    <div className="text-xs font-bold text-emerald-600 font-mono">
                      {inspectingSubmission.submission.status}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Test Cases</div>
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {inspectingSubmission.submission.passed_cases} / {inspectingSubmission.submission.total_cases}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Runtime</div>
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {inspectingSubmission.submission.execution_time_ms} ms
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Language</div>
                    <div className="text-xs font-bold text-slate-900 font-mono uppercase">
                      {inspectingSubmission.submission.language}
                    </div>
                  </div>
                </div>

                {/* Source Code Viewer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span className="font-bold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Submitted Solution Source</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Read-Only Audit</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-[#0F1412] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{inspectingSubmission.submission.source_code}</code>
                  </pre>
                </div>

                {/* Mentor Feedback Input Form */}
                <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span>Deliver Faculty Mentor Feedback</span>
                    </h4>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">Code Quality:</span>
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
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Focus / Remedial Topic
                    </label>
                    <select
                      value={recommendedTopic}
                      onChange={(e) => setRecommendedTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                    >
                      <option value="Dynamic Programming (1D & 2D)">Dynamic Programming (1D & 2D)</option>
                      <option value="Graph Theory & Topological Sort">Graph Theory & Topological Sort</option>
                      <option value="Sliding Window Invariants">Sliding Window Invariants</option>
                      <option value="Binary Trees & BST Traversals">Binary Trees & BST Traversals</option>
                      <option value="Monotonic Stacks & Queues">Monotonic Stacks & Queues</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mentorship Advice & Code Improvements
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Give actionable guidance on algorithmic time complexity, space traps, or edge-case handling..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setInspectingSubmission(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0F1412] hover:bg-black text-[#9DFF00] font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
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
        <div className="flex-1 min-h-screen bg-[#F4F7F4] flex items-center justify-center font-mono text-xs text-slate-500">
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
