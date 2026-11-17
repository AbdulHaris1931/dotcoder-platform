"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { Assessment, Problem, POPULAR_COLLEGES } from "@/types";
import {
  ShieldCheck,
  Plus,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Lock,
  Eye,
  Copy,
  Check,
  FileCode,
  Users,
  X,
} from "lucide-react";

export default function AssessmentCreatorPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetCollege, setTargetCollege] = useState("ALL");
  const [customCollege, setCustomCollege] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isProctored, setIsProctored] = useState(true);
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [assData, probData] = await Promise.all([
        DataService.getAssessments(),
        DataService.getProblems(),
      ]);
      setAssessments(assData);
      setProblems(probData);
      if (probData.length > 0) {
        setSelectedProblemIds(probData.slice(0, 3).map((p) => p.id));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/student/exam/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleProblem = (id: string) => {
    if (selectedProblemIds.includes(id)) {
      setSelectedProblemIds(selectedProblemIds.filter((p) => p !== id));
    } else {
      setSelectedProblemIds([...selectedProblemIds, id]);
    }
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const finalTargetCollege = targetCollege === "CUSTOM" ? customCollege : targetCollege;

    const res = await DataService.createAssessment({
      title,
      description,
      target_college: finalTargetCollege || "ALL",
      duration_minutes: durationMinutes,
      is_proctored: isProctored,
    });

    if (res.success) {
      setFeedback("Assessment published successfully!");
      // Reload assessments
      const updated = await DataService.getAssessments();
      setAssessments(updated);
      setTimeout(() => {
        setShowModal(false);
        setTitle("");
        setDescription("");
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback(`Error: ${res.error || "Failed to create assessment"}`);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-900">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-2 font-mono font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Executive Analytics</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
              Proctored Assessments Manager
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              DotExam Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Author high-stakes coding evaluations with real-time AI proctoring, lockdown browsers, and college targeting.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 flex-shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assessment</span>
        </button>
      </div>

      {/* Existing Assessments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500">
            Active Examinations ({assessments.length})
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Synchronized with Supabase & Campus Roster
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            Loading assessments database...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assessments.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-luxury p-6 rounded-2xl flex flex-col justify-between group shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {a.target_college === "ALL" ? "Global / All Colleges" : a.target_college}
                        </span>
                        {a.is_proctored && (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> AI Proctored
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {a.title}
                      </h3>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {a.description || "Comprehensive technical recruitment mock benchmark exam."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{a.duration_minutes} Mins</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <FileCode className="w-3.5 h-3.5 text-amber-600" />
                      <span>{a.problems?.length || 5} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[140px]">{a.target_college}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleCopyLink(a.id)}
                    className="flex items-center gap-1.5 text-xs font-mono text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm"
                  >
                    {copiedId === a.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Exam Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push(`/student/exam/${a.id}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>Preview Exam Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assessment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Configure Proctored Assessment
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deploy an institutional or national mock test directly to students.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAssessment} className="space-y-5">
                {feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-mono flex items-center gap-2.5 shadow-sm ${
                      feedback.startsWith("Error")
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {feedback.startsWith("Error") ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{feedback}</span>
                  </div>
                )}

                {/* Test Title */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. TCS NQT National Benchmark 2026 / Zoho Day-1 Mock"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold shadow-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                    Instructions & Syllabus Summary
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Strict anti-cheating active. Covers Data Structures, Dynamic Programming, and SQL."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none shadow-sm"
                  />
                </div>

                {/* Target College & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                      Target Audience / College
                    </label>
                    <select
                      value={targetCollege}
                      onChange={(e) => setTargetCollege(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                    >
                      <option value="ALL">ALL (Global National Mock)</option>
                      {POPULAR_COLLEGES.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                      <option value="CUSTOM">Other / Custom Institution...</option>
                    </select>

                    {targetCollege === "CUSTOM" && (
                      <input
                        type="text"
                        required
                        value={customCollege}
                        onChange={(e) => setCustomCollege(e.target.value)}
                        placeholder="Enter Exact College Name"
                        className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={300}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm"
                    />
                  </div>
                </div>

                {/* Proctoring Toggles */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Full AI Proctoring Suite</div>
                        <div className="text-[11px] text-slate-500">
                          Fullscreen enforcement, tab-switch detection & copy-paste prevention
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isProctored}
                      onChange={(e) => setIsProctored(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Select Questions from Bank */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-600 mb-2">
                    Select Questions from Question Bank ({selectedProblemIds.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-slate-200 rounded-2xl p-2.5 bg-slate-50">
                    {problems.map((prob) => {
                      const isSelected = selectedProblemIds.includes(prob.id);
                      return (
                        <div
                          key={prob.id}
                          onClick={() => handleToggleProblem(prob.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-xs shadow-sm ${
                            isSelected
                              ? "bg-white border-2 border-indigo-500 text-slate-900"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-indigo-600 cursor-pointer rounded"
                            />
                            <span className="truncate font-semibold">{prob.title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {saving ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing to Campus Network...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Publish Live Assessment</span>
                      </>
                    )}
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
