"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore } from "@/lib/demo-store";
import { AssessmentRegistry } from "@/lib/assessment-registry";
import { runPythonCode } from "@/lib/pyodide-runner";
import { compareOutputs } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
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
  ArrowRight,
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
  Home,
  BarChart3,
  Trophy,
  BookOpen,
  Settings,
  Flame,
  Bell,
  Check,
  Search,
  SlidersHorizontal,
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

  // Palette Filter: All, MCQ, Coding
  const [paletteFilter, setPaletteFilter] = useState<"ALL" | "MCQ" | "CODING">("ALL");
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(true);
  const [questionSearchQuery, setQuestionSearchQuery] = useState<string>("");

  // 1. Initialize Exam & User State
  useEffect(() => {
    const user = DemoStore.getCurrentUser();
    setCurrentUser(user);

    const exam = AssessmentRegistry.getAssessment(examId || "assessment-1");
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
      setCurrentIndex(0);
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

  const allProblems = assessment.problems || [];
  const mcqCount = allProblems.filter((p) => p.type === "mcq").length;
  const codingCount = allProblems.filter((p) => p.type === "coding").length;
  const totalCount = allProblems.length;

  const filteredProblems = allProblems.filter((p, idx) => {
    if (paletteFilter === "MCQ" && p.type !== "mcq") return false;
    if (paletteFilter === "CODING" && p.type !== "coding") return false;
    if (questionSearchQuery.trim()) {
      const q = questionSearchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        `q${idx + 1}`.includes(q) ||
        (p.company_tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      ref={examContainerRef}
      onCopy={handleSecurityBlock}
      onCut={handleSecurityBlock}
      onPaste={handleSecurityBlock}
      onContextMenu={handleSecurityBlock}
      className="h-screen w-screen select-none bg-[#0C1017] text-slate-100 overflow-hidden font-sans flex flex-col"
    >
      {/* Red Alert Modal for Proctoring Violations */}
      <AnimatePresence>
        {showViolationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#121824] border-2 border-rose-500 rounded-3xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-rose-400">
                    Proctoring Violation Flagged!
                  </h3>
                  <div className="text-[11px] text-rose-300 font-mono">
                    Violation {tabSwitches} logged to Placement Cell
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-200 leading-relaxed font-mono">
                {currentViolationMsg}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                All tab switching, fullscreen escapes, and clipboard attempts are permanently timestamped and attached to your placement audit score.
              </p>

              <button
                onClick={() => {
                  setShowViolationModal(false);
                  triggerFullscreen();
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Return to Fullscreen Exam
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP GLOBAL NAVIGATION BAR (Exact Match to Figma & UI Reference)       */}
      {/* ========================================================================= */}
      <header className="h-14 border-b border-[#1A2332] bg-[#0E131F] px-4 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Brand & DotExam Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#9DFF00] text-black flex items-center justify-center font-mono font-black text-sm">
              &lt;/&gt;
            </div>
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              DotCoder
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#132B1A] text-[#9DFF00] border border-[#1F4526] shadow-xs">
            DotExam Proctored
          </span>
        </div>

        {/* Center: Exam Title & Accreditation Target */}
        <div className="hidden md:flex items-center gap-2 text-xs font-sans">
          <span className="font-bold text-white truncate max-w-md">
            {assessment.title || "Campus Placement Screening Mock 2026"}
          </span>
          <span className="text-slate-500 font-mono">&bull;</span>
          <span className="text-slate-400 font-mono text-[11px]">
            AVASC-TNJ (NAAC 5.2.1 Verified)
          </span>
        </div>

        {/* Right: Anti-Cheat Score, Timer & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Anti-Cheat Score Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141A26] border border-[#1F293D] text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span className="font-mono">Anti-Cheat: 100%</span>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161D27] border border-[#212C3D] font-mono font-bold text-xs text-white">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums">{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* User Avatar Circle */}
          <div
            className="w-8 h-8 rounded-full bg-[#B5F500] text-black font-extrabold font-mono text-xs flex items-center justify-center shadow-md"
            title={`${currentUser?.full_name || "Student"} (${currentUser?.roll_no || "23BCA01"})`}
          >
            K
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CANVAS (Slim Rail + Palette Drawer + Question Body)     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ----------------------------------------------------------------------- */}
        {/* 2.1 SLIM FAR-LEFT ICON RAIL (56px)                                     */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="w-14 bg-[#0B0F17] border-r border-[#1A2332] flex flex-col justify-between items-center py-4 flex-shrink-0 z-20">
          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => router.push("/student/dashboard")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Dashboard"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* Active Code / Exam Icon */}
            <div
              className="p-2 rounded-xl bg-[#B5F500] text-black shadow-md shadow-[#9DFF00]/10"
              title="Proctored Exam"
            >
              <Code2 className="w-5 h-5 text-black" />
            </div>

            <button
              type="button"
              onClick={() => router.push("/student/dashboard#progress")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Progress & Skills"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/student/drives")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Placement Drives"
            >
              <Trophy className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/curriculum")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Curriculum"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard#settings")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* 2.2 COLLAPSIBLE QUESTION DRAWER (300px matching Reference Image)        */}
        {/* ----------------------------------------------------------------------- */}
        {isPaletteOpen && (
          <aside className="w-[300px] bg-[#0E131E] border-r border-[#1A2332] flex flex-col justify-between flex-shrink-0 animate-in slide-in-from-left duration-200 z-10">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header: < Question Palette */}
              <div className="p-3.5 border-b border-[#1A2332] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#9DFF00] transition-colors"
                  title="Collapse Palette"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  <span>Question Palette</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500">
                  {totalCount} Questions
                </span>
              </div>

              {/* Search & Filter Controls */}
              <div className="p-3 space-y-2.5 border-b border-[#1A2332]">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={questionSearchQuery}
                      onChange={(e) => setQuestionSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#141A26] border border-[#1F293D] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#9DFF00] transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaletteFilter("ALL")}
                    className="p-1.5 rounded-xl border border-[#1F293D] bg-[#141A26] text-slate-400 hover:text-white"
                    title="Reset Filter"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Filter Pills: All, MCQ, Coding */}
                <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                  {(["ALL", "MCQ", "CODING"] as const).map((filter) => {
                    const count =
                      filter === "ALL" ? totalCount : filter === "MCQ" ? mcqCount : codingCount;
                    const isSelected = paletteFilter === filter;

                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setPaletteFilter(filter)}
                        className={`py-1 rounded-lg font-bold text-center transition-all ${
                          isSelected
                            ? "bg-[#B5F500] text-black shadow-xs"
                            : "bg-[#141A26] text-slate-400 hover:text-white border border-[#1F293D]"
                        }`}
                      >
                        {filter === "ALL" ? `All (${count})` : filter === "MCQ" ? `MCQ (${count})` : `Coding (${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Questions List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {allProblems.map((prob, idx) => {
                  if (paletteFilter === "MCQ" && prob.type !== "mcq") return null;
                  if (paletteFilter === "CODING" && prob.type !== "coding") return null;
                  if (
                    questionSearchQuery.trim() &&
                    !prob.title.toLowerCase().includes(questionSearchQuery.toLowerCase()) &&
                    !String(idx + 1).includes(questionSearchQuery)
                  ) {
                    return null;
                  }

                  const isCurrent = idx === currentIndex;
                  const ans = answers[prob.id];
                  const isAnswered =
                    prob.type === "mcq"
                      ? !!ans?.selectedOption
                      : !!(ans?.code && ans.code.trim().length > 20 && ans.code !== prob.starter_code_json?.python);
                  const isMarked = !!ans?.isMarkedReview;

                  if (isCurrent) {
                    return (
                      <div
                        key={prob.id || idx}
                        className="bg-[#B5F500] text-black rounded-2xl p-3 shadow-md flex items-start justify-between cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                            <h4 className="font-bold text-xs font-sans truncate text-black">
                              Q{idx + 1}. {prob.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded-full bg-black/10 text-black font-semibold uppercase">
                              {prob.type}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/10 text-black">
                              {prob.difficulty}
                            </span>
                          </div>
                        </div>

                        {isMarked && (
                          <span className="p-1 text-black font-bold" title="Marked for Review">
                            <Bookmark className="w-3.5 h-3.5 fill-black" />
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={prob.id || idx}
                      onClick={() => navigateTo(idx)}
                      className="bg-[#121824]/60 hover:bg-[#161F2E] border border-transparent hover:border-[#212C3D] rounded-2xl p-3 transition-all cursor-pointer flex items-start justify-between group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Check
                            className={`w-3.5 h-3.5 ${
                              isAnswered ? "text-[#9DFF00] stroke-[2.5]" : "text-slate-600"
                            }`}
                          />
                          <h4 className="font-semibold text-xs text-white truncate group-hover:text-[#9DFF00] transition-colors">
                            Q{idx + 1}. {prob.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold uppercase ${
                              prob.type === "coding"
                                ? "bg-[#132B1D] text-[#4ADE80]"
                                : "bg-[#182030] text-sky-400"
                            }`}
                          >
                            {prob.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#182030] text-slate-400">
                            {prob.difficulty}
                          </span>
                        </div>
                      </div>

                      {isMarked && (
                        <span className="p-1 text-purple-400" title="Marked for Review">
                          <Bookmark className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Drawer Bar: < > Question X of Y */}
            <div className="p-3 border-t border-[#1A2332] flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo(Math.min(totalCount - 1, currentIndex + 1))}
                  disabled={currentIndex === totalCount - 1}
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <span>
                Question {currentIndex + 1} of {totalCount}
              </span>
            </div>
          </aside>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 2.3 QUESTION WORKSPACE CORE (MCQ vs Coding Split)                      */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col bg-[#0B0F17] overflow-hidden">
          {/* Subheader Toolbar */}
          <div className="h-10 border-b border-[#1A2332] bg-[#0E131E] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 text-xs font-sans">
            <div className="flex items-center gap-3">
              {!isPaletteOpen && (
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(true)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 mr-1"
                  title="Expand Question Palette"
                >
                  <ChevronRight className="w-4 h-4 text-[#9DFF00]" />
                </button>
              )}

              <span className="font-bold text-white text-sm">
                Q. {currentIndex + 1} of {totalCount} ({currentProblem.type === "mcq" ? "MCQ" : "Coding"})
              </span>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#141A26] border border-[#1F293D] text-slate-400">
                {currentProblem.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMarkReview}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  answers[currentProblem.id]?.isMarkedReview
                    ? "bg-purple-950/40 text-purple-300 border-purple-500/50"
                    : "text-slate-400 hover:text-white border-[#1F293D] bg-[#141A26]"
                }`}
                title="Mark for Review"
              >
                <Bookmark className={`w-3.5 h-3.5 ${answers[currentProblem.id]?.isMarkedReview ? "fill-purple-400 text-purple-400" : ""}`} />
                <span>{answers[currentProblem.id]?.isMarkedReview ? "Marked" : "Mark Review"}</span>
              </button>
            </div>
          </div>

          {/* Core Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {currentProblem.type === "coding" ? (
              /* Coding Question Layout (Split between Specs & Monaco Editor) */
              <div className="flex-1 flex overflow-hidden">
                {/* Left Specs Pane */}
                <div className="w-[380px] lg:w-[440px] border-r border-[#1A2332] bg-[#0E131E] p-5 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-300">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {currentProblem.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-xs font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#132B1D] text-[#4ADE80] border border-[#1D4A2B] font-bold">
                        {currentProblem.difficulty}
                      </span>
                      <span className="text-slate-400 font-sans">Algorithmic Problem</span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                    <MarkdownRenderer
                      content={
                        currentProblem.description_md ||
                        "Given an array of integers nums and an integer target, write an optimal function in Python to return indices of the two numbers such that they add up to target."
                      }
                    />
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="font-bold text-white font-sans text-xs">Sample Input:</span>
                    <div className="p-3 rounded-xl bg-[#141A26] border border-[#1F293D] text-emerald-300">
                      2 7 11 15\n9
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="font-bold text-white font-sans text-xs">Sample Output:</span>
                    <div className="p-3 rounded-xl bg-[#141A26] border border-[#1F293D] text-[#9DFF00]">
                      0 1
                    </div>
                  </div>
                </div>

                {/* Right Editor & Sandbox */}
                <div className="flex-1 flex flex-col bg-[#0B0F17] overflow-hidden">
                  <div className="h-10 border-b border-[#1A2332] bg-[#0E131E] px-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <Code2 className="w-4 h-4 text-[#9DFF00]" />
                      <span className="font-bold text-white">solution.py</span>
                      <span className="text-slate-500 text-[10px]">&bull; Python 3.10 Sandbox</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCodeChange(
                            currentProblem.starter_code_json?.python ||
                              "def solve(nums, target):\n    # Write optimal logic here\n    pass\n"
                          )
                        }
                        className="p-1 text-slate-400 hover:text-white text-xs flex items-center gap-1"
                        title="Reset code"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono">Reset</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestExamCode}
                        disabled={isTestingCode}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#141A26] hover:bg-[#1A2338] border border-[#212C3D] text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
                      >
                        <Play className="w-3 h-3 text-[#9DFF00] fill-current" />
                        <span>{isTestingCode ? "Running..." : "Run Sample Case"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 overflow-hidden">
                    <Editor
                      height="100%"
                      language="python"
                      theme="vs-dark"
                      value={
                        answers[currentProblem.id]?.code ||
                        currentProblem.starter_code_json?.python ||
                        "def solve(nums, target):\n    # Write optimal logic here\n    pass\n"
                      }
                      onChange={(val) => handleCodeChange(val || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "JetBrains Mono, Menlo, monospace",
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        tabSize: 4,
                        automaticLayout: true,
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  </div>

                  {/* Test output banner */}
                  {testOutput && (
                    <div className="p-3 border-t border-[#1A2332] bg-[#0E131E] font-mono text-xs flex items-center justify-between">
                      <span className={testOutput.startsWith("PASS") ? "text-emerald-400" : "text-rose-400"}>
                        {testOutput}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* MCQ Question Layout */
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-8 overflow-y-auto space-y-6 max-w-3xl">
                  {/* Prompt */}
                  <div className="text-base font-semibold text-white leading-relaxed">
                    {currentProblem.description_md ||
                      "Which of the following algorithmic properties or data structures correctly satisfies this condition?"}
                  </div>

                  {/* 4 Option Cards in Dark Theme */}
                  <div className="space-y-3 pt-2">
                    {(currentProblem.mcq_options_json || [
                      "Option A: Constant amortized runtime",
                      "Option B: Linear space complexity",
                      "Option C: Logarithmic search tree",
                      "Option D: Directed acyclic graph",
                    ]).map((optText, optIdx) => {
                      const label = String.fromCharCode(65 + optIdx);
                      const isSelected = answers[currentProblem.id]?.selectedOption === optText;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optText)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
                            isSelected
                              ? "bg-[#B5F500]/10 border-2 border-[#8BB310] text-white font-semibold"
                              : "bg-[#141A26] border-[#1F293D] text-slate-200 hover:border-slate-500 hover:bg-[#1A2338]"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all ${
                                isSelected
                                  ? "bg-[#B5F500] text-black shadow-xs font-extrabold"
                                  : "bg-[#1F293D] text-slate-300"
                              }`}
                            >
                              {label}
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
                </div>

                {/* Right Help / Institutional Compliance Pane */}
                <div className="w-80 border-l border-[#1A2332] bg-[#0E131E] p-6 space-y-4 hidden lg:block text-xs font-sans">
                  <div className="p-4 rounded-2xl bg-[#141A26] border border-[#1F293D] space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
                      <span>Proctored Session</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Your selected options are auto-saved to local memory and cryptographically verified upon submission.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141A26]/50 border border-[#1F293D] space-y-2">
                    <span className="font-bold text-slate-300">Examination Instructions:</span>
                    <ul className="text-slate-400 space-y-1 list-disc ml-4 text-[11px]">
                      <li>1 mark per correct MCQ.</li>
                      <li>Coding problems evaluate execution time, memory, and hidden edge cases.</li>
                      <li>Do not exit fullscreen or switch browser tabs.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 3. BOTTOM ACTION BAR (Exact Match to Figma & UI Reference)                */}
          {/* ========================================================================= */}
          <footer className="h-12 border-t border-[#1A2332] bg-[#0A0D14] px-4 sm:px-6 flex items-center justify-between text-xs flex-shrink-0 z-30 font-sans">
            {/* Left: < > Question X of Y */}
            <div className="flex items-center gap-3 font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
                  title="Previous Question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo(Math.min(totalCount - 1, currentIndex + 1))}
                  disabled={currentIndex === totalCount - 1}
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
                  title="Next Question"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs">
                Question {currentIndex + 1} of {totalCount}
              </span>
            </div>

            {/* Right: Previous, Next Question -> or Submit Exam */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-1.5 rounded-xl border border-[#1F293D] bg-[#141A26] text-slate-300 font-semibold hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>

              {currentIndex >= totalCount - 1 ? (
                <button
                  type="button"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full bg-[#B5F500] hover:bg-[#A3E635] text-black font-extrabold text-xs shadow-md active:scale-95 transition-all"
                >
                  <span>{isSubmitting ? "Submitting..." : "Submit Exam"}</span>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo(currentIndex + 1)}
                  className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#B5F500] hover:bg-[#A3E635] text-black font-extrabold text-xs shadow-md active:scale-95 transition-all"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
