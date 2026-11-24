"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AssessmentService } from "@/lib/services/assessment-service";
import { AssessmentAttempt } from "@/types/assessment-attempt";
import {
  Plus,
  X,
  ShieldCheck,
  Eye,
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
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-7 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F5]">
            Assessment Management
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Create and manage tests, quizzes and exams.
          </p>
        </div>

        {/* Top Actions: Problems/Assessments Switcher & Create Assessment Button */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center bg-[#121B16] p-1 rounded-xl border border-[#1E2C24]">
            <button
              onClick={() => router.push("/admin/problems")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
            >
              Problems
            </button>
            <button
              onClick={() => router.push("/admin/assessments")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#9DFF00] text-[#070B09] cursor-pointer"
            >
              Assessments
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs transition-all shadow-md shadow-[#9DFF00]/20 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#070B09] stroke-[3]" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
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
              onClick={() => setActiveTab(tab.id as "all" | "active" | "scheduled" | "completed")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#9DFF00] text-[#070B09]"
                  : "bg-[#0C120F] border border-[#1E2C24] text-[#D5E0D9] hover:border-[#2C4034] hover:bg-[#18241D]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Assessments Table */}
      <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121B16] border-b border-[#1E2C24] text-[#99A9A0] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Participants</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C24] text-[#D5E0D9]">
              {filteredAssessments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => router.push(`/student/exam/${a.id || "assessment-1"}`)}
                  className="hover:bg-[#18241D] transition-colors cursor-pointer"
                >
                  <td className="p-4 font-semibold text-[#F4F7F5]">
                    {a.title}
                  </td>
                  <td className="p-4 font-medium text-[#99A9A0] font-mono">
                    {a.type}
                  </td>
                  <td className="p-4 font-mono tabular-nums text-[#99A9A0]">
                    {a.duration}
                  </td>
                  <td className="p-4 font-mono tabular-nums font-bold text-[#F4F7F5]">
                    {a.participants}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-sans font-semibold text-[11px] ${
                        a.status === "Active"
                          ? "bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 font-bold"
                          : a.status === "Scheduled"
                          ? "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                          : "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]"
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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#9DFF00] text-[#070B09]">
                NAAC Criterion 5.2.1
              </span>
              <span className="text-xs font-mono text-[#85998D]">AVASC-TNJ</span>
            </div>
            <h2 className="font-display text-lg font-extrabold text-[#F4F7F5] tracking-tight mt-1">
              Accredited Examination Attempts & Proctoring Audit
            </h2>
            <p className="text-xs text-[#99A9A0]">
              Immutable student test attempts, server-verified scores, anti-cheating logs, and cryptographic verification hashes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ObsidianSelect value={String(deptFilter)} onChange={(val) => setDeptFilter(val)} options={[{ value: "ALL", label: "All Cohorts" }, { value: "BCA", label: "BCA (2023 - 2026)" }, { value: "B.Sc CS", label: "B.Sc CS (2023 - 2026)" }, { value: "MCA", label: "MCA (2024 - 2026)" }]} buttonClassName="px-3 py-1.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs font-semibold text-[#F4F7F5] focus:border-[#9DFF00] focus:outline-none cursor-pointer" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#121B16] border-b border-[#1E2C24] text-[#99A9A0] font-mono text-[11px] uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#1E2C24] text-[#D5E0D9]">
                {attempts.map((att) => {
                  const isPassing = att.passed;
                  return (
                    <tr
                      key={att.id}
                      onClick={() => setSelectedAttemptForAudit(att)}
                      className="hover:bg-[#18241D] transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="font-bold text-[#F4F7F5] group-hover:text-[#9DFF00] transition-colors">
                          {att.studentName}
                        </div>
                        <div className="text-[10px] font-mono tabular-nums text-[#85998D]">
                          {att.rollNo}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium text-[#99A9A0]">
                        {att.department}
                      </td>
                      <td className="p-4 text-[#D5E0D9] max-w-[180px] truncate">
                        {att.assessmentTitle}
                      </td>
                      <td className="p-4">
                        <span className="font-mono tabular-nums font-black text-[#F4F7F5] text-xs">
                          {att.score}%
                        </span>
                        <span className={`ml-2 text-[10px] font-bold ${isPassing ? "text-emerald-300" : "text-amber-300"}`}>
                          {isPassing ? "PASS" : "FAIL"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums font-bold text-xs text-[#F4F7F5]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{att.antiCheatScore}%</span>
                        </span>
                        {att.tabSwitchCount > 0 && (
                          <span className="text-[10px] text-rose-300 font-mono tabular-nums ml-1.5">
                            ({att.tabSwitchCount} tab switch)
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[10px] bg-[#121B16] border border-[#1E2C24] px-2 py-1 rounded text-[#D5E0D9]">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#D5E0D9] hover:text-[#9DFF00] hover:bg-[#121B16] transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0C120F] text-[#F4F7F5] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#1E2C24] space-y-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#1E2C24] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#9DFF00] text-[#070B09]">
                    NAAC Audit Snapshot
                  </span>
                  <span className="text-xs font-mono text-[#85998D]">AVASC-TNJ</span>
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-[#F4F7F5]">
                  {selectedAttemptForAudit.studentName} ({selectedAttemptForAudit.rollNo})
                </h3>
                <p className="text-xs text-[#99A9A0]">
                  {selectedAttemptForAudit.department} &bull; {selectedAttemptForAudit.assessmentTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttemptForAudit(null)}
                className="p-1 rounded-lg text-[#85998D] hover:text-[#F4F7F5] hover:bg-[#18241D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                <div className="text-[10px] text-[#99A9A0] uppercase font-semibold">Final Score</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#F4F7F5] mt-0.5">
                  {selectedAttemptForAudit.score}%
                </div>
                <div className="text-[10px] text-[#9DFF00] font-bold">
                  {selectedAttemptForAudit.passed ? "Accredited Pass" : "Did Not Pass"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                <div className="text-[10px] text-[#99A9A0] uppercase font-semibold">Proctoring Index</div>
                <div className="text-xl font-bold font-mono tabular-nums text-emerald-300 mt-0.5">
                  {selectedAttemptForAudit.antiCheatScore}%
                </div>
                <div className="text-[10px] text-[#99A9A0] tabular-nums">
                  {selectedAttemptForAudit.tabSwitchCount} Violations Logged
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121B16] border border-[#1E2C24]">
                <div className="text-[10px] text-[#99A9A0] uppercase font-semibold">Time Spent</div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#F4F7F5] mt-0.5">
                  {Math.floor(selectedAttemptForAudit.durationSpentSeconds / 60)}m {selectedAttemptForAudit.durationSpentSeconds % 60}s
                </div>
                <div className="text-[10px] text-[#85998D] font-mono truncate">
                  Hash: {selectedAttemptForAudit.accreditationHash}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#99A9A0]">
                Question Grading Breakdown
              </h4>
              <div className="space-y-2">
                {selectedAttemptForAudit.gradingDetails.map((gd, idx) => (
                  <div
                    key={gd.questionId || idx}
                    className="p-3.5 rounded-xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#F4F7F5]">{gd.questionTitle}</div>
                      <div className="text-[11px] text-[#99A9A0] mt-0.5">{gd.feedback}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono tabular-nums font-bold text-xs px-2 py-0.5 rounded bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5]">
                        {gd.awardedScore} / {gd.maxScore} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2C24] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAttemptForAudit(null)}
                className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0C120F] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#1E2C24] space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
              <h3 className="font-display text-base font-bold tracking-tight text-[#F4F7F5]">Create New Assessment</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#85998D] hover:text-[#F4F7F5] hover:bg-[#18241D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Assessment Title</label>
                <input
                  type="text"
                  name="title"
                  aria-label="Assessment Title"
                  required
                  placeholder="e.g. Data Structures & Algorithms Exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] text-xs focus:border-[#9DFF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Assessment Type</label>
                <ObsidianSelect value={String(newType)} onChange={(val) => setNewType(val as "Module" | "Recruitment" | "Quiz" | "Exam")} options={[{ value: "Module", label: "Module Assessment" }, { value: "Recruitment", label: "Recruitment Mock Test" }, { value: "Quiz", label: "Quick Quiz" }, { value: "Exam", label: "End Semester Exam" }]} buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-xs focus:border-[#9DFF00] focus:outline-none" />
              </div>

              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Duration</label>
                <ObsidianSelect value={String(newDuration)} onChange={(val) => setNewDuration(val)} options={[{ value: "30 mins", label: "30 mins" }, { value: "60 mins", label: "60 mins" }, { value: "90 mins", label: "90 mins" }, { value: "120 mins", label: "120 mins" }, { value: "180 mins", label: "180 mins" }]} buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-xs focus:border-[#9DFF00] focus:outline-none" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#D5E0D9] hover:bg-[#18241D] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold shadow-md shadow-[#9DFF00]/20 cursor-pointer"
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
