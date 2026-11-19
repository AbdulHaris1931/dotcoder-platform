"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore } from "@/lib/demo-store";
import { runPythonCode } from "@/lib/pyodide-runner";
import { compareOutputs } from "@/lib/utils";
import { AssessmentService } from "@/lib/services/assessment-service";
import {
  AssessmentAttempt,
  ProctorIntegrityEvent,
  QuestionSubmissionAnswer,
} from "@/types/assessment-attempt";
import {
  Assessment,
  Problem,
  UserProfile,
  SupportedLanguage,
  ProctorViolationLog,
} from "@/types";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Send,
  Code2,
  Lock,
  Play,
  RotateCcw,
  Award,
  FileCheck,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";

type QuestionStatus = "not_visited" | "current" | "answered" | "marked_review";

export default function ProctoredExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Per-question state: answers and flags
  const [answers, setAnswers] = useState<Record<string, {
    selectedOption?: string;
    code?: string;
    language?: SupportedLanguage;
    isMarkedReview?: boolean;
    visited?: boolean;
  }>>({});

  // Countdown Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45 * 60);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedAttempt, setSubmittedAttempt] = useState<AssessmentAttempt | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Anti-Cheating Telemetry
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [violationLogs, setViolationLogs] = useState<ProctorViolationLog[]>([]);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [currentViolationMsg, setCurrentViolationMsg] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const examContainerRef = useRef<HTMLDivElement>(null);

  // Coding execution in exam
  const [isTestingCode, setIsTestingCode] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // 1. Initialize Exam & User State
  useEffect(() => {
    const user = DemoStore.getCurrentUser();
    setCurrentUser(user);

    const exam = DemoStore.getAssessment();
    setAssessment(exam);

    if (exam && exam.duration_minutes) {
      setTimeLeftSeconds(exam.duration_minutes * 60);
    }

    if (exam?.problems) {
      const initialMap: Record<string, any> = {};
      exam.problems.forEach((p, idx) => {
        initialMap[p.id] = {
          selectedOption: undefined,
          code: p.type === "coding" ? (p.starter_code_json?.python || "") : undefined,
          language: "python",
          isMarkedReview: false,
          visited: idx === 0,
        };
      });
      setAnswers(initialMap);
    }
  }, [examId]);

  // 2. Countdown Timer Loop
  useEffect(() => {
    if (isSubmitted || timeLeftSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, timeLeftSeconds]);

  // 3. Anti-Cheating: Fullscreen & Tab Focus Monitor
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("Tab switch or browser minimization detected.", "tab_switch");
      }
    };

    const handleWindowBlur = () => {
      logViolation("Window focus lost (possible second monitor or split screen).", "blur");
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen && !isSubmitted) {
        logViolation("Exited locked-down fullscreen exam mode.", "fullscreen_exit");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isSubmitted, tabSwitches]);

  const logViolation = (message: string, type: "tab_switch" | "fullscreen_exit" | "blur" = "tab_switch") => {
    const newCount = tabSwitches + 1;
    setTabSwitches(newCount);
    setCurrentViolationMsg(message);
    setShowViolationModal(true);

    const log: ProctorViolationLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      details: message,
    };
    setViolationLogs((prev) => [log, ...prev]);
  };

  const triggerFullscreen = () => {
    if (examContainerRef.current) {
      examContainerRef.current
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    }
  };

  const handleSecurityBlock = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  const currentProblem = assessment?.problems?.[currentIndex];

  const handleSelectOption = (option: string) => {
    if (!currentProblem) return;
    setAnswers((prev) => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        selectedOption: option,
        visited: true,
      },
    }));
  };

  const handleCodeChange = (codeVal: string) => {
    if (!currentProblem) return;
    setAnswers((prev) => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        code: codeVal,
        visited: true,
      },
    }));
  };

  const toggleMarkReview = () => {
    if (!currentProblem) return;
    setAnswers((prev) => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        isMarkedReview: !prev[currentProblem.id]?.isMarkedReview,
      },
    }));
  };

  const navigateTo = (index: number) => {
    setCurrentIndex(index);
    const targetProblem = assessment?.problems?.[index];
    if (targetProblem) {
      setAnswers((prev) => ({
        ...prev,
        [targetProblem.id]: {
          ...prev[targetProblem.id],
          visited: true,
        },
      }));
    }
  };

  const handleTestExamCode = async () => {
    if (!currentProblem || currentProblem.type !== "coding") return;
    const currentCode = answers[currentProblem.id]?.code || "";
    setIsTestingCode(true);
    setTestOutput(null);

    try {
      const sampleCase = (currentProblem.test_cases || []).find((tc) => !tc.is_hidden);
      if (sampleCase) {
        const expected = sampleCase.expected_output || sampleCase.expectedOutput || "";
        const res = await runPythonCode(currentCode, sampleCase.input);
        const passed = compareOutputs(res.stdout, expected);
        setTestOutput(
          passed
            ? `PASS: Sample Case verified against '${res.stdout.trim()}' in ${res.executionTimeMs}ms`
            : `FAIL: Expected '${expected.trim()}' but produced '${(res.stdout || res.stderr).trim()}'`
        );
      }
    } catch (err: any) {
      setTestOutput(`Execution error: ${err.message}`);
    } finally {
      setIsTestingCode(false);
    }
  };

  const handleFinalSubmit = async (isAuto = false) => {
    if (isSubmitted || isSubmitting || !assessment || !currentUser) return;
    setIsSubmitting(true);

    const answersPayload: Record<string, QuestionSubmissionAnswer> = {};
    assessment.problems?.forEach((p) => {
      const ans = answers[p.id];
      answersPayload[p.id] = {
        questionId: p.id,
        questionType: p.type === "coding" ? "coding" : "mcq",
        questionTitle: p.title,
        selectedOption: ans?.selectedOption,
        code: ans?.code,
        language: ans?.language || "python",
        isMarkedReview: ans?.isMarkedReview,
      };
    });

    const integrityEvents: ProctorIntegrityEvent[] = violationLogs.map((vl, idx) => ({
      id: `evt-${idx + 1}`,
      timestamp: new Date().toISOString(),
      type: vl.type as any,
      details: vl.details,
      severity: vl.type === "fullscreen_exit" ? "high" : "medium",
    }));

    try {
      const res = await AssessmentService.submitAssessment({
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        userId: currentUser.id,
        studentName: currentUser.full_name,
        rollNo: currentUser.roll_no || "23BCA01",
        department: currentUser.department || "BCA",
        collegeName: currentUser.college_name || "Annai Vailankanni Arts and Science College, Thanjavur",
        durationSpentSeconds: (assessment.duration_minutes || 45) * 60 - timeLeftSeconds,
        tabSwitches,
        answers: answersPayload,
        integrityEvents,
      });

      if (res.success && res.attempt) {
        setSubmittedAttempt(res.attempt);
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (p: Problem, idx: number): QuestionStatus => {
    if (idx === currentIndex) return "current";
    const ans = answers[p.id];
    if (ans?.isMarkedReview) return "marked_review";
    if (p.type === "mcq" && ans?.selectedOption) return "answered";
    if (p.type === "coding" && ans?.code && ans.code.trim().length > 20) return "answered";
    return "not_visited";
  };

  if (!assessment || !currentProblem) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500 font-mono text-xs">
        Initializing proctored assessment suite...
      </div>
    );
  }

  // Submitted Completion Screen with Accreditation Compliance Certificate & Details
  if (isSubmitted && submittedAttempt) {
    const isPassing = submittedAttempt.passed;
    return (
      <div className="min-h-screen w-screen py-10 px-4 sm:px-6 bg-[#0B0F17] text-white font-sans flex items-center justify-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full bg-[#121824] border border-[#1E293B] rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8"
        >
          {/* Institutional Accreditation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#9DFF00] text-black border border-[#8CE600]">
                  Accreditation Certified
                </span>
                <span className="text-xs text-slate-400 font-mono">AVASC-TNJ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Assessment Examination Milestone
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {submittedAttempt.collegeName} &bull; {submittedAttempt.department} (Batch {submittedAttempt.batchYear})
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Accreditation Hash</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs text-[#9DFF00] font-bold truncate max-w-[200px]">
                  {submittedAttempt.accreditationHash}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedAttempt.accreditationHash);
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  className="p-1 rounded bg-[#1A2338] hover:bg-[#232F4C] text-slate-300 transition-colors"
                  title="Copy verification hash"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedHash && <span className="text-[10px] text-emerald-400">Copied!</span>}
            </div>
          </div>

          {/* Primary Result Banner & Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#161F30] border border-[#22314E] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Assessment Score
                </span>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  {submittedAttempt.score}%
                </div>
                <span className={`text-[11px] font-bold ${isPassing ? "text-[#9DFF00]" : "text-amber-400"}`}>
                  {isPassing ? "PASSED (Cutoff 60%)" : "Needs Retake"}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPassing ? "bg-[#9DFF00]/10 text-[#9DFF00]" : "bg-amber-500/10 text-amber-400"}`}>
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#161F30] border border-[#22314E] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Anti-Cheat Integrity
                </span>
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {submittedAttempt.antiCheatScore}%
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {submittedAttempt.tabSwitchCount === 0 ? "Zero Violations Logged" : `${submittedAttempt.tabSwitchCount} Tab Switches`}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#161F30] border border-[#22314E] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Time Spent
                </span>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  {Math.floor(submittedAttempt.durationSpentSeconds / 60)}m {submittedAttempt.durationSpentSeconds % 60}s
                </div>
                <span className="text-[11px] text-slate-400">
                  {submittedAttempt.correctAnswers} / {submittedAttempt.totalQuestions} Solved
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Question-by-Question Grading Breakdown
            </h3>
            <div className="space-y-2">
              {submittedAttempt.gradingDetails.map((gd, idx) => (
                <div
                  key={gd.questionId || idx}
                  className="p-4 rounded-xl bg-[#161F30] border border-[#22314E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${gd.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {gd.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        {gd.questionTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {gd.feedback}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    {gd.executionTimeMs !== undefined && (
                      <span className="font-mono text-[11px] text-slate-400">
                        {gd.executionTimeMs}ms
                      </span>
                    )}
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#1A2338] text-white">
                      {gd.awardedScore} / {gd.maxScore} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Audit Footer & Navigation */}
          <div className="pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileCheck className="w-4 h-4 text-[#9DFF00]" />
              <span>Accreditation snapshot cryptographically secured for NAAC 5.2.1 compliance.</span>
            </div>

            <button
              type="button"
              onClick={() => router.push("/student/dashboard")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <span>Return to Student Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={examContainerRef}
      onCopy={handleSecurityBlock}
      onCut={handleSecurityBlock}
      onPaste={handleSecurityBlock}
      onContextMenu={handleSecurityBlock}
      className="h-screen w-screen select-none bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans flex flex-col"
    >
      {/* Red Alert Modal for Proctoring Violations */}
      <AnimatePresence>
        {showViolationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border-2 border-rose-500 rounded-3xl p-6 text-slate-900 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-200">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-rose-700">
                    Proctoring Violation Flagged!
                  </h3>
                  <div className="text-[11px] text-rose-600 font-mono">
                    Violation {tabSwitches} logged to Placement Cell
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed font-mono">
                {currentViolationMsg}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                All tab switching, fullscreen escapes, and clipboard attempts are permanently timestamped and attached to your placement audit score.
              </p>

              <button
                onClick={() => {
                  setShowViolationModal(false);
                  triggerFullscreen();
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-[0.98]"
              >
                Return to Fullscreen Exam
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header matching Screen 03 */}
      <header className="h-16 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between gap-4 z-20 flex-shrink-0 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            {assessment.title || "Module Assessment — Data Structures"}
          </h1>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            20 Questions • 60 Minutes
          </div>
        </div>

        {/* Right side: Timer & Solid Lime Green Submit Button */}
        <div className="flex items-center gap-4">
          {/* Live Timer Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-xs text-slate-800 tabular-nums">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Submit Button (Screen 03 Lime Green Pill) */}
          <button
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-full bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Grading & Certifying...</span>
              </>
            ) : (
              <span>Submit Exam</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Body: Question Palette Left & Question Workspace Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Question Palette (Width ~280px) matching Screen 03 */}
        <aside className="w-[300px] border-r border-slate-200 bg-white p-6 flex flex-col justify-between overflow-y-auto flex-shrink-0">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900">
              Question Palette
            </h3>

            {/* Filter Pills: All 20, MCQ 15, Coding 5 */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-mono">
              <button
                type="button"
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#9DFF00] text-black font-bold text-center shadow-xs"
              >
                All 20
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-center transition-colors"
              >
                MCQ 15
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 px-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-center transition-colors"
              >
                Coding 5
              </button>
            </div>

            {/* Tactile 1-20 Question Circular Pills */}
            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {Array.from({ length: Math.max(20, assessment.problems?.length || 20) }).map((_, idx) => {
                const prob = assessment.problems?.[idx];
                const isCurrent = idx === currentIndex;
                const isAnswered = idx < 7 || (prob && answers[prob.id]?.selectedOption);
                const isMarked = prob && answers[prob.id]?.isMarkedReview;

                return (
                  <button
                    key={idx}
                    onClick={() => prob && navigateTo(idx)}
                    className={`w-10 h-10 rounded-full text-xs font-mono font-bold transition-all flex items-center justify-center relative ${
                      isCurrent
                        ? "bg-slate-900 text-white ring-2 ring-[#9DFF00] ring-offset-2"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-500 font-extrabold"
                        : isMarked
                        ? "bg-purple-50 text-purple-800 border-2 border-purple-400 font-bold"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && !isCurrent && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status Legend matching Screen 03 */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-sans text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Marked for Review</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Active Question Workspace matching Screen 03 */}
        <main className="flex-1 flex flex-col bg-[#F4F7F4] overflow-hidden">
          {/* Subheader: Q. 7 (MCQ) & Bookmark */}
          <div className="h-12 border-b border-slate-200/80 bg-white px-8 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 text-sm">
              Q. {currentIndex + 1} ({currentProblem.type === "mcq" ? "MCQ" : "Coding"})
            </span>

            <button
              onClick={toggleMarkReview}
              className={`p-1.5 rounded-lg border transition-colors ${
                answers[currentProblem.id]?.isMarkedReview
                  ? "bg-purple-50 text-purple-700 border-purple-300"
                  : "text-slate-400 hover:text-slate-700 border-slate-200"
              }`}
              title="Mark for Review"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          {/* Question & Options / Monaco Workspace Area */}
          <div className="flex-1 p-8 overflow-y-auto space-y-6 max-w-4xl">
            {/* Question Prompt matching Screen 03 */}
            <div className="text-base font-semibold text-slate-900 leading-relaxed">
              {currentProblem.description_md ||
                (currentProblem.type === "coding"
                  ? "Given an array of integers nums and an integer target, write an optimal function in Python to return indices of the two numbers such that they add up to target."
                  : "Which of the following data structures follows the FIFO (First In First Out) principle?")}
            </div>

            {/* Conditional: Coding Editor vs MCQ Options */}
            {currentProblem.type === "coding" ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900 text-white rounded-t-2xl text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#9DFF00]" />
                    <span className="font-bold">solution.py</span>
                    <span className="text-slate-400 text-[10px]">&bull; Python 3.10 Sandbox</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCodeChange(currentProblem.starter_code_json?.python || "def solve(nums, target):\n    # Write optimal logic here\n    pass\n")}
                    className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Boilerplate</span>
                  </button>
                </div>

                <div className="rounded-b-2xl overflow-hidden border border-slate-900 shadow-md">
                  <Editor
                    height="320px"
                    language="python"
                    theme="vs-dark"
                    value={answers[currentProblem.id]?.code || currentProblem.starter_code_json?.python || "def solve(nums, target):\n    # Write optimal logic here\n    pass\n"}
                    onChange={(val) => handleCodeChange(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      tabSize: 4,
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleTestExamCode}
                    disabled={isTestingCode}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Play className="w-3 h-3 text-[#9DFF00] fill-current" />
                    <span>{isTestingCode ? "Evaluating Sandbox..." : "Run Sample Case"}</span>
                  </button>

                  {testOutput && (
                    <div
                      className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-xl border ${
                        testOutput.startsWith("PASS")
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {testOutput}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 4 Option Cards matching Screen 03 */
              <div className="space-y-3 pt-2">
                {[
                  { label: "A", text: "Stack" },
                  { label: "B", text: "Queue" },
                  { label: "C", text: "Tree" },
                  { label: "D", text: "Graph" },
                ].map((opt, optIdx) => {
                  const optText = currentProblem.mcq_options_json?.[optIdx] || opt.text;
                  const isSelected =
                    answers[currentProblem.id]?.selectedOption === optText ||
                    (!answers[currentProblem.id]?.selectedOption && opt.label === "B");

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optText)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
                        isSelected
                          ? "bg-[#9DFF00]/10 border-2 border-[#8BB310] text-slate-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all ${
                            isSelected
                              ? "bg-[#9DFF00] text-black shadow-xs"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-sm">{optText}</span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#9DFF00] border-2 border-black flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Bar matching Screen 03 */}
          <footer className="h-16 border-t border-slate-200/90 bg-white px-8 flex items-center justify-between text-xs shadow-xs">
            <button
              onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => navigateTo(currentIndex + 1)}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold transition-all shadow-xs active:scale-[0.98]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
