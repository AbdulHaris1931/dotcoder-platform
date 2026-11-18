"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CurriculumStore } from "@/lib/curriculum-store";
import {
  ModuleAssessment,
  AssessmentMCQ,
  CurriculumProblem,
  ProblemSubmissionResult,
  AssessmentAttemptResult,
} from "@/types/curriculum";
import { SplitPaneIDE } from "@/components/ide/split-pane-ide";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  BarChart2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function ModuleAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = (params?.moduleId as string) || "mod-1-1";

  // Assessment Data
  const [assessment, setAssessment] = useState<ModuleAssessment | null>(null);

  // Live 90-minute Timer (in seconds)
  const [timeLeft, setTimeLeft] = useState<number>(90 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Question Navigation State: 'mcq' (0-9) or 'code' (0-4)
  const [activeSection, setActiveSection] = useState<"mcq" | "code">("mcq");
  const [currentMCQIndex, setCurrentMCQIndex] = useState<number>(0);
  const [currentCodeIndex, setCurrentCodeIndex] = useState<number>(0);

  // Student Responses
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [codingSubmissions, setCodingSubmissions] = useState<Record<string, ProblemSubmissionResult>>({});

  // Submission & Post-Assessment Analytics Modal State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [analyticsResult, setAnalyticsResult] = useState<AssessmentAttemptResult | null>(null);

  // Load assessment data
  useEffect(() => {
    const data = CurriculumStore.getAssessmentForModule(moduleId);
    if (data) {
      setAssessment(data);
    }
  }, [moduleId]);

  // Live Timer Countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          handleFinalSubmit(true); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const mcqs = assessment?.mcqs || [];
  const codingProblems = assessment?.coding_problems || [];
  const currentMCQ = mcqs[currentMCQIndex];
  const currentCodingProblem = codingProblems[currentCodeIndex];

  // Handle MCQ selection
  const handleSelectMCQOption = (optionIndex: number) => {
    if (!currentMCQ) return;
    setMcqAnswers((prev) => ({ ...prev, [currentMCQ.id]: optionIndex }));
  };

  // Toggle mark for review
  const handleToggleReview = (id: string) => {
    setMarkedForReview((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Final Assessment Submission
  const handleFinalSubmit = useCallback(
    (autoSubmit: boolean = false) => {
      if (!autoSubmit && !confirm("Are you sure you want to finalize and submit your assessment?")) {
        return;
      }

      setIsSubmitting(true);
      setShowConfirmModal(false);
      setIsTimerRunning(false);

      setTimeout(() => {
        const attempt = CurriculumStore.gradeAssessment(
          moduleId,
          assessment?.id || `assess-${moduleId}`,
          "student-candidate-1",
          mcqAnswers,
          codingSubmissions
        );

        setAnalyticsResult(attempt);
        setIsSubmitting(false);
      }, 700);
    },
    [moduleId, assessment, mcqAnswers, codingSubmissions]
  );

  // Find weakest topic for CTA
  const weakestTopicEntry = useMemo(() => {
    if (!analyticsResult) return null;
    const entries = Object.entries(analyticsResult.topic_mastery);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => a[1].accuracy_percentage - b[1].accuracy_percentage)[0];
  }, [analyticsResult]);

  if (!assessment) {
    return (
      <div className="h-screen w-full bg-[#0B0F17] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span>Provisioning Module Assessment Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0B0F17] text-slate-200 flex flex-col font-sans overflow-hidden select-none">
      {/* 1. TOP EXAM BAR */}
      <header className="h-14 border-b border-[#1E293B] bg-[#0E131F] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        {/* Module Title & Exam Status */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Module Assessment</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PROCTORED
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              Passing: 80% • 10 MCQs + 5 Coding Challenges
            </div>
          </div>
        </div>

        {/* Center: Live 90:00 Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all ${
            timeLeft < 600
              ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse"
              : "bg-[#141B2D] text-slate-200 border-[#1E293B]"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formatTime(timeLeft)}</span>
          <span className="text-[10px] text-slate-500 font-normal">Remaining</span>
        </div>

        {/* Right: Submit Assessment Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95"
          >
            Submit Assessment
          </button>
        </div>
      </header>

      {/* 2. UNIFIED QUESTION PILL SWITCHER BAR (MCQ 1–10 | Code 1–5) */}
      <div className="h-12 border-b border-[#1E293B] bg-[#0B0F17] px-4 flex items-center justify-between overflow-x-auto gap-4 flex-shrink-0">
        {/* MCQ Question Pills (1 to 10) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold pr-1">
            MCQs:
          </span>
          {mcqs.map((m, idx) => {
            const isAnswered = mcqAnswers[m.id] !== undefined;
            const isReview = markedForReview[m.id];
            const isActive = activeSection === "mcq" && currentMCQIndex === idx;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setActiveSection("mcq");
                  setCurrentMCQIndex(idx);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all relative flex items-center justify-center border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-600/30"
                    : isReview
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : isAnswered
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-[#141B2D] text-slate-400 border-[#1E293B] hover:text-white"
                }`}
              >
                <span>{idx + 1}</span>
                {isReview && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0B0F17]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-800" />

        {/* Coding Question Pills (1 to 5) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold pr-1">
            Coding:
          </span>
          {codingProblems.map((p, idx) => {
            const hasSubmitted = codingSubmissions[p.id] !== undefined;
            const isReview = markedForReview[p.id];
            const isActive = activeSection === "code" && currentCodeIndex === idx;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActiveSection("code");
                  setCurrentCodeIndex(idx);
                }}
                className={`px-2.5 h-7 rounded-lg text-xs font-mono font-bold transition-all relative flex items-center justify-center gap-1 border ${
                  isActive
                    ? "bg-purple-600 text-white border-purple-400 shadow-sm shadow-purple-600/30"
                    : isReview
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : hasSubmitted
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-[#141B2D] text-slate-400 border-[#1E293B] hover:text-white"
                }`}
              >
                <span>Q{11 + idx}</span>
                {isReview && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN EXAM BODY: Split MCQ View or Split Coding IDE */}
      <div className="flex-1 overflow-hidden relative">
        {/* A. MCQ SPLIT VIEW (Q1–Q10) */}
        {activeSection === "mcq" && currentMCQ && (
          <div className="h-full grid grid-cols-12 overflow-hidden">
            {/* Left Question Pane (6 cols) */}
            <div className="col-span-12 lg:col-span-7 border-r border-[#1E293B] p-6 lg:p-8 overflow-y-auto space-y-6 bg-[#0E131F]/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Question {currentMCQIndex + 1} of 10
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase">
                    {currentMCQ.question_category}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {currentMCQ.topic_title}
                </span>
              </div>

              {/* Question Statement */}
              <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                {currentMCQ.question_markdown}
              </div>

              {/* Code Snippet if applicable */}
              {currentMCQ.code_snippet && (
                <div className="rounded-xl border border-[#1E293B] bg-[#0B0F17] p-4 overflow-x-auto">
                  <pre className="font-mono text-xs text-emerald-300 leading-relaxed">
                    <code>{currentMCQ.code_snippet}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Right Radio Options Pane (5 cols) */}
            <div className="col-span-12 lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto bg-[#0B0F17]">
              {/* Radio Options List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    Select Single Answer
                  </span>

                  {/* Mark for Review Toggle */}
                  <label className="flex items-center gap-2 text-xs font-mono text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!markedForReview[currentMCQ.id]}
                      onChange={() => handleToggleReview(currentMCQ.id)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                    />
                    <span>Mark for Review</span>
                  </label>
                </div>

                <div className="space-y-2.5">
                  {currentMCQ.options.map((opt, optIdx) => {
                    const isSelected = mcqAnswers[currentMCQ.id] === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectMCQOption(optIdx)}
                        className={`p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-400 text-white shadow-sm shadow-indigo-600/20"
                            : "bg-[#141B2D]/70 border-[#1E293B] text-slate-300 hover:bg-[#182035] hover:border-slate-700"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-[#0E131F] text-slate-400 border border-[#1E293B]"
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-[#1E293B] flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentMCQIndex === 0}
                  onClick={() => setCurrentMCQIndex((prev) => prev - 1)}
                  className="px-3.5 py-2 rounded-xl border border-[#1E293B] hover:bg-[#141B2D] text-xs font-mono text-slate-300 disabled:opacity-30 transition-all flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentMCQIndex < mcqs.length - 1) {
                      setCurrentMCQIndex((prev) => prev + 1);
                    } else {
                      // Move to coding section
                      setActiveSection("code");
                      setCurrentCodeIndex(0);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-mono font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>{currentMCQIndex === mcqs.length - 1 ? "Next: Coding Section →" : "Next Question"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* B. CODING VIEW (Q11–Q15) — Reuses SplitPaneIDE with Hints & Concept Notes Disabled */}
        {activeSection === "code" && currentCodingProblem && (
          <div className="h-full flex flex-col">
            <div className="bg-[#0E131F] px-4 py-1.5 border-b border-[#1E293B] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-400">
                  Coding Challenge {currentCodeIndex + 1} of 5 (Q{11 + currentCodeIndex})
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{currentCodingProblem.title}</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!markedForReview[currentCodingProblem.id]}
                    onChange={() => handleToggleReview(currentCodingProblem.id)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  <span>Mark for Review</span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentCodeIndex === 0}
                    onClick={() => setCurrentCodeIndex((prev) => prev - 1)}
                    className="p-1 rounded bg-[#141B2D] text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentCodeIndex === codingProblems.length - 1}
                    onClick={() => setCurrentCodeIndex((prev) => prev + 1)}
                    className="p-1 rounded bg-[#141B2D] text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <SplitPaneIDE
                key={currentCodingProblem.id}
                problem={currentCodingProblem}
                mode="assessment" // Disables hints and concept tabs
                onSolveSuccess={() => {
                  setCodingSubmissions((prev) => ({
                    ...prev,
                    [currentCodingProblem.id]: CurriculumStore.evaluateSubmission(
                      currentCodingProblem,
                      "python",
                      "",
                      true
                    ),
                  }));
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. CONFIRMATION SUBMIT DIALOG MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0E131F] border border-[#1E293B] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Finalize Module Assessment?</h3>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="p-3 rounded-xl bg-[#141B2D] border border-[#1E293B] space-y-1.5">
                <div className="flex justify-between">
                  <span>MCQs Answered:</span>
                  <span className="text-white font-bold">{Object.keys(mcqAnswers).length} / 10</span>
                </div>
                <div className="flex justify-between">
                  <span>Coding Challenges Submitted:</span>
                  <span className="text-white font-bold">{Object.keys(codingSubmissions).length} / 5</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Marked for Review:</span>
                  <span>{Object.values(markedForReview).filter(Boolean).length}</span>
                </div>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                Once submitted, your responses will be evaluated against all 6 test cases per problem and your topic-wise mastery report will be recorded.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-[#1E293B] hover:bg-[#141B2D] text-xs font-mono text-slate-300 transition-colors"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95"
              >
                Confirm & Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. POST-ASSESSMENT ANALYTICS MODAL (Score, Mastery Bars, Weak Topic CTA) */}
      {analyticsResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0E131F] border border-[#1E293B] p-7 sm:p-8 space-y-6 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            {/* Header: Pass / Fail Verdict */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
                  <Award className="w-3.5 h-3.5" />
                  <span>Official Assessment Performance Report</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {analyticsResult.passed ? "Assessment Passed! 🎉" : "Assessment Completed — Needs Practice"}
                </h2>
              </div>

              {/* Total Score Badge */}
              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Total Score</div>
                <div className="text-3xl font-extrabold font-mono text-white">
                  <span className={analyticsResult.passed ? "text-emerald-400" : "text-amber-400"}>
                    {analyticsResult.total_score}
                  </span>
                  <span className="text-sm text-slate-500"> / 100</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown: MCQs vs Coding */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#141B2D] border border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  MCQ Theory Score (50%)
                </div>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {analyticsResult.mcq_score}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141B2D] border border-[#1E293B] space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Coding Testcase Score (50%)
                </div>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {analyticsResult.coding_score}%
                </div>
              </div>
            </div>

            {/* Topic Mastery Bars across all 5 Module Topics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 uppercase">Topic-Wise Competency Analysis</span>
                <span className="text-slate-500">80% Passing Threshold</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(analyticsResult.topic_mastery).map(([tId, stat]) => (
                  <div key={tId} className="p-3 rounded-xl bg-[#141B2D]/70 border border-[#1E293B] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{stat.topic_title}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span
                          className={`font-bold ${
                            stat.accuracy_percentage >= 80
                              ? "text-emerald-400"
                              : stat.accuracy_percentage >= 60
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {stat.accuracy_percentage}%
                        </span>
                        {stat.is_weak && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold uppercase">
                            Weak Area
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-[#0B0F17] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.accuracy_percentage >= 80
                            ? "bg-emerald-500"
                            : stat.accuracy_percentage >= 60
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${stat.accuracy_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct "Practice Weak Topic" CTA & Return Button */}
            <div className="pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center gap-3">
              {weakestTopicEntry && (
                <button
                  type="button"
                  onClick={() => router.push(`/curriculum`)}
                  className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Practice Weak Topic: {weakestTopicEntry[1].topic_title.slice(0, 28)}...</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => router.push("/curriculum")}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-[#1E293B] hover:bg-[#141B2D] text-slate-300 font-semibold text-xs transition-colors"
              >
                Back to Curriculum Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
