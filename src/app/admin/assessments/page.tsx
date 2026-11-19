"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AssessmentService } from "@/lib/services/assessment-service";
import { AssessmentAttempt } from "@/types/assessment-attempt";
import {
  Plus,
  Clock,
  Users,
  CheckCircle2,
  X,
  FileText,
  ExternalLink,
  ShieldCheck,
  Award,
  AlertTriangle,
  FileCheck,
  Eye,
  Copy,
  ChevronRight,
} from "lucide-react";

interface AssessmentRow {
  id: string;
  title: string;
  type: "Module" | "Recruitment" | "Quiz" | "Exam";
  duration: string;
  participants: string;
  status: "Active" | "Scheduled" | "Completed";
}

const INITIAL_ASSESSMENTS: AssessmentRow[] = [
  {
    id: "mod-3-ds",
    title: "Module 3 - DS Test",
    type: "Module",
    duration: "60 mins",
    participants: "248",
    status: "Active",
  },
  {
    id: "cognizant-mock",
    title: "Cognizant Mock Test",
    type: "Recruitment",
    duration: "90 mins",
    participants: "512",
    status: "Scheduled",
  },
  {
    id: "tcs-nqt-practice",
    title: "TCS NQT - Practice",
    type: "Recruitment",
    duration: "120 mins",
    participants: "436",
    status: "Active",
  },
  {
    id: "arrays-quiz",
    title: "Arrays & Strings Quiz",
    type: "Quiz",
    duration: "30 mins",
    participants: "198",
    status: "Completed",
  },
  {
    id: "end-sem",
    title: "End Semester Assessment",
    type: "Exam",
    duration: "180 mins",
    participants: "1,248",
    status: "Scheduled",
  },
];

export default function AdminAssessmentManagementPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentRow[]>(INITIAL_ASSESSMENTS);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "scheduled" | "completed">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [selectedAttemptForAudit, setSelectedAttemptForAudit] = useState<AssessmentAttempt | null>(null);
  const [deptFilter, setDeptFilter] = useState("ALL");

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Module" | "Recruitment" | "Quiz" | "Exam">("Module");
  const [newDuration, setNewDuration] = useState("60 mins");

  useEffect(() => {
    async function loadAttempts() {
      const data = await AssessmentService.getInstitutionalAttempts(deptFilter);
      setAttempts(data);
    }
    loadAttempts();
  }, [deptFilter]);

  const filteredAssessments = assessments.filter((a) => {
    if (activeTab === "active" && a.status !== "Active") return false;
    if (activeTab === "scheduled" && a.status !== "Scheduled") return false;
    if (activeTab === "completed" && a.status !== "Completed") return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const added: AssessmentRow = {
      id: `ass-${Date.now()}`,
      title: newTitle,
      type: newType,
      duration: newDuration,
      participants: "0",
      status: "Active",
    };
    setAssessments([added, ...assessments]);
    setShowCreateModal(false);
    setNewTitle("");
  };

  return (
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-7 font-sans">
      {/* Top Header matching Screen 09 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Assessment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create and manage tests, quizzes and exams.
          </p>
        </div>

        {/* Top Actions: Problems/Assessments Switcher & Create Assessment Button */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => router.push("/admin/problems")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Problems
            </button>
            <button
              onClick={() => router.push("/admin/assessments")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-2xs"
            >
              Assessments
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs transition-all shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs matching Screen 09 */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Assessments (24)" },
          { id: "active", label: "Active (6)" },
          { id: "scheduled", label: "Scheduled (5)" },
          { id: "completed", label: "Completed (13)" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                isSelected
                  ? "bg-[#9DFF00] text-black"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Assessments Table matching Screen 09 */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Participants</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredAssessments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => router.push(`/student/exam/assessment-1`)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-semibold text-slate-900">
                    {a.title}
                  </td>
                  <td className="p-4 font-medium text-slate-600 font-mono">
                    {a.type}
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {a.duration}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {a.participants}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-sans font-semibold text-[11px] ${
                        a.status === "Active"
                          ? "bg-[#9DFF00]/20 text-[#2D5A12] border border-[#9DFF00]/40 font-bold"
                          : a.status === "Scheduled"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accreditation Compliance & Exam Attempts Audit Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#9DFF00] text-black">
                NAAC Criterion 5.2.1
              </span>
              <span className="text-xs font-mono text-slate-400">AVASC-TNJ</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
              Accredited Examination Attempts & Proctoring Audit
            </h2>
            <p className="text-xs text-slate-500">
              Immutable student test attempts, server-verified scores, anti-cheating logs, and cryptographic verification hashes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
            >
              <option value="ALL">All Cohorts</option>
              <option value="BCA">BCA (2023 - 2026)</option>
              <option value="B.Sc CS">B.Sc CS (2023 - 2026)</option>
              <option value="MCA">MCA (2024 - 2026)</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF8] border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Student & Roll No</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Assessment Title</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Anti-Cheat Integrity</th>
                  <th className="p-4">Accreditation Hash</th>
                  <th className="p-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {attempts.map((att) => {
                  const isPassing = att.passed;
                  return (
                    <tr
                      key={att.id}
                      onClick={() => setSelectedAttemptForAudit(att)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 group-hover:text-black">
                          {att.studentName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {att.rollNo}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-600">
                        {att.department}
                      </td>
                      <td className="p-4 text-slate-800 max-w-[180px] truncate">
                        {att.assessmentTitle}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-black text-slate-900 text-xs">
                          {att.score}%
                        </span>
                        <span className={`ml-2 text-[10px] font-bold ${isPassing ? "text-emerald-600" : "text-amber-600"}`}>
                          {isPassing ? "PASS" : "FAIL"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-slate-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{att.antiCheatScore}%</span>
                        </span>
                        {att.tabSwitchCount > 0 && (
                          <span className="text-[10px] text-rose-600 font-mono ml-1.5">
                            ({att.tabSwitchCount} tab switch)
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-700">
                          {att.accreditationHash}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAttemptForAudit(att);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal for Selected Attempt */}
      {selectedAttemptForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#121824] text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#1E293B] space-y-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#9DFF00] text-black">
                    NAAC Audit Snapshot
                  </span>
                  <span className="text-xs font-mono text-slate-400">AVASC-TNJ</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedAttemptForAudit.studentName} ({selectedAttemptForAudit.rollNo})
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedAttemptForAudit.department} &bull; {selectedAttemptForAudit.assessmentTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttemptForAudit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#161F30] border border-[#22314E]">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Final Score</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {selectedAttemptForAudit.score}%
                </div>
                <div className="text-[10px] text-[#9DFF00] font-bold">
                  {selectedAttemptForAudit.passed ? "Accredited Pass" : "Did Not Pass"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161F30] border border-[#22314E]">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Proctoring Index</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {selectedAttemptForAudit.antiCheatScore}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedAttemptForAudit.tabSwitchCount} Violations Logged
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161F30] border border-[#22314E]">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Spent</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {Math.floor(selectedAttemptForAudit.durationSpentSeconds / 60)}m {selectedAttemptForAudit.durationSpentSeconds % 60}s
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  Hash: {selectedAttemptForAudit.accreditationHash}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question Grading Breakdown
              </h4>
              <div className="space-y-2">
                {selectedAttemptForAudit.gradingDetails.map((gd, idx) => (
                  <div
                    key={gd.questionId || idx}
                    className="p-3.5 rounded-xl bg-[#161F30] border border-[#22314E] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{gd.questionTitle}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{gd.feedback}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#1A2338] text-white">
                        {gd.awardedScore} / {gd.maxScore} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAttemptForAudit(null)}
                className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Assessment</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms Exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#9DFF00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#9DFF00]"
                >
                  <option value="Module">Module Assessment</option>
                  <option value="Recruitment">Recruitment Mock Test</option>
                  <option value="Quiz">Quick Quiz</option>
                  <option value="Exam">End Semester Exam</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#9DFF00]"
                >
                  <option value="30 mins">30 mins</option>
                  <option value="60 mins">60 mins</option>
                  <option value="90 mins">90 mins</option>
                  <option value="120 mins">120 mins</option>
                  <option value="180 mins">180 mins</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold shadow-xs"
                >
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
