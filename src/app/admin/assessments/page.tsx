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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Executive Analytics</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              Proctored Assessments Manager
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              DotExam Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Author high-stakes coding evaluations with real-time AI proctoring, lockdown browsers, and college targeting.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assessment</span>
        </button>
      </div>

      {/* Existing Assessments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono text-[11px] text-slate-400">
            Active Examinations ({assessments.length})
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Synchronized with Supabase & Campus Roster
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Loading assessments database...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-[#111114] border border-white/[0.08] hover:border-white/[0.14] transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {a.target_college === "ALL" ? "Global / All Colleges" : a.target_college}
                        </span>
                        {a.is_proctored && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> AI Proctored
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">
                        {a.title}
                      </h3>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 mt-1" />
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {a.description || "Comprehensive technical recruitment mock benchmark exam."}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{a.duration_minutes} Mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>{a.problems?.length || 5} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[140px]">{a.target_college}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleCopyLink(a.id)}
                    className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors"
                  >
                    {copiedId === a.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Exam Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push(`/student/exam/${a.id}`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#111114] border border-white/[0.1] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Configure Proctored Assessment
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deploy an institutional or national mock test directly to students.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/[0.04]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAssessment} className="space-y-5">
                {feedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      feedback.startsWith("Error")
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    }`}
                  >
                    {feedback.startsWith("Error") ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{feedback}</span>
                  </div>
                )}

                {/* Test Title */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Assessment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. TCS NQT National Benchmark 2026 / Zoho Day-1 Mock"
                    className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Instructions & Syllabus Summary
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Strict anti-cheating active. Covers Data Structures, Dynamic Programming, and SQL."
                    className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Target College & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Target Audience / College
                    </label>
                    <select
                      value={targetCollege}
                      onChange={(e) => setTargetCollege(e.target.value)}
                      className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                        className="mt-2 w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={300}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Proctoring Toggles */}
                <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Full AI Proctoring Suite</div>
                        <div className="text-[11px] text-slate-400">
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
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Select Questions from Question Bank ({selectedProblemIds.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 border border-white/[0.06] rounded-xl p-2 bg-[#0C0C0E]">
                    {problems.map((prob) => {
                      const isSelected = selectedProblemIds.includes(prob.id);
                      return (
                        <div
                          key={prob.id}
                          onClick={() => handleToggleProblem(prob.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? "bg-indigo-600/15 border border-indigo-500/30 text-white"
                              : "bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-indigo-600 cursor-pointer"
                            />
                            <span className="truncate font-medium">{prob.title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
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
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] disabled:opacity-50"
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
