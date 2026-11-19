"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore } from "@/lib/demo-store";
import { AssessmentRegistry } from "@/lib/assessment-registry";
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
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
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
  Minimize2,
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
  Menu,
  LayoutGrid,
  X,
  ChevronDown,
  ChevronUp,
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
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState<boolean>(false);
  // Split pane resizing state: question area width percentage (reduced default to 36% for spacious editor)
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(36);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      // Allow resizing between 20% and 50%
      const clamped = Math.min(Math.max(rawPercent, 20), 50);
      setLeftWidthPercent(clamped);
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSplitter]);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"cases" | "results" | "console">("cases");

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

  return (
    <div
      ref={examContainerRef}
      onCopy={handleSecurityBlock}
      onCut={handleSecurityBlock}
      onPaste={handleSecurityBlock}
      onContextMenu={handleSecurityBlock}
      className="h-screen w-screen select-none bg-[#0D1117] text-slate-200 overflow-hidden font-sans flex flex-col"
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
              className="relative w-full max-w-md bg-[#161D2E] border-2 border-rose-500 rounded-3xl p-6 text-white space-y-4 shadow-2xl z-10"
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
                    Violation {tabSwitches} logged to Institutional Audit Log
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 leading-relaxed font-mono">
                {currentViolationMsg}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                All tab switching, browser escapes, and window blurs are cryptographically recorded and attached to your verified accreditation record.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowViolationModal(false);
                  triggerFullscreen();
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Return to Fullscreen Exam
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* 1. TOP GLOBAL NAVBAR (Matching DotLab Workspace Aesthetic)        */}
      {/* ================================================================= */}
      <header className="h-13 border-b border-[#1E293B] bg-[#0D1117] px-4 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Brand & Exam Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="EQLV CODE"
              className="w-7 h-7 object-contain rounded-lg flex-shrink-0"
            />
            <span className="text-base font-black tracking-tight text-white">
              EQLV CODE
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 tracking-wide">
            Exam
          </span>
          <div className="hidden sm:block text-slate-500 text-xs font-mono">&bull;</div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-300 truncate max-w-xs">
            {assessment.title}
          </span>
        </div>

        {/* Center: Live Timer & Anti-Cheat Integrity Badges */}
        <div className="flex items-center gap-3">
          {/* Live Countdown Timer Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141B2D] border border-[#1E293B] font-mono font-bold text-xs text-white shadow-xs">
            <Clock className={`w-3.5 h-3.5 ${timeLeftSeconds < 300 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Anti-Cheat Integrity Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{Math.max(0, 100 - tabSwitches * 10)}% Integrity</span>
          </div>
        </div>

        {/* Right: Fullscreen Toggle & Submit Exam Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={triggerFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-black text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Exam</span>
            )}
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. MAIN BODY (Slim Icon Rail + Split Workspace Panes)              */}
      {/* ================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* =============================================================== */}
        {/* 2A. SLIM FAR-LEFT ACTIVITY RAIL (Width ~48px)                   */}
        {/* =============================================================== */}
        <aside className="w-12 border-r border-[#1E293B] bg-[#0B0F17] flex flex-col justify-between py-3 items-center shrink-0 z-20">
          <div className="space-y-3 flex flex-col items-center">
            {/* Question Palette Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen((p) => !p)}
              className="p-2 rounded-lg text-slate-400 hover:text-[#9DFF00] hover:bg-white/5 transition-colors cursor-pointer"
              title="Open Question Palette"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Question Number Indicator Pill (e.g. Q. 1/7) */}
            <div
              onClick={() => setIsPaletteOpen((p) => !p)}
              className="px-1 py-0.5 rounded bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 font-mono text-[9px] font-bold text-center tracking-tighter cursor-pointer"
              title="Click to toggle Question Palette"
            >
              Q.{currentIndex + 1}
            </div>

            <div className="w-6 h-px bg-[#1E293B]" />

            {/* Bookmark Question Icon Button */}
            <button
              type="button"
              onClick={toggleMarkReview}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                answers[currentProblem.id]?.isMarkedReview
                  ? "text-purple-400 bg-purple-500/10"
                  : "text-slate-400 hover:text-purple-400 hover:bg-white/5"
              }`}
              title="Mark for Review"
            >
              <Bookmark className={`w-4 h-4 ${answers[currentProblem.id]?.isMarkedReview ? "fill-purple-400" : ""}`} />
            </button>

            {/* Proctor Security Status */}
            <div
              className={`p-2 rounded-lg cursor-default ${
                tabSwitches > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
              title={`${tabSwitches} security violations logged`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom Fullscreen Icon */}
          <button
            type="button"
            onClick={triggerFullscreen}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </aside>

        {/* Slide-over Question Palette Drawer when isPaletteOpen is true */}
        {isPaletteOpen && (
          <>
            <div
              onClick={() => setIsPaletteOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            />
            <aside className="fixed inset-y-0 left-12 z-50 w-72 bg-[#121824] border-r border-[#1E293B] shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <LayoutGrid className="w-4 h-4 text-[#9DFF00]" />
                    <span>Question Palette</span>
                  </div>
                  <button
                    onClick={() => setIsPaletteOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter Pills: Dynamic All, MCQ, Coding */}
                {(() => {
                  const allProblems = assessment.problems || [];
                  const mcqCount = allProblems.filter((p) => p.type === "mcq").length;
                  const codingCount = allProblems.filter((p) => p.type === "coding").length;
                  const totalCount = allProblems.length;

                  return (
                    <div className="flex items-center gap-1.5 p-1 bg-[#0B0F17] rounded-xl text-xs font-mono border border-[#1E293B]">
                      <button
                        type="button"
                        onClick={() => setPaletteFilter("ALL")}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          paletteFilter === "ALL"
                            ? "bg-[#9DFF00] text-black shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        All {totalCount}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter("MCQ")}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          paletteFilter === "MCQ"
                            ? "bg-[#9DFF00] text-black shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        MCQ {mcqCount}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter("CODING")}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          paletteFilter === "CODING"
                            ? "bg-[#9DFF00] text-black shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Coding {codingCount}
                      </button>
                    </div>
                  );
                })()}

                {/* Tactile Question Circular Pills */}
                <div className="grid grid-cols-5 gap-2.5 pt-1">
                  {(assessment.problems || []).map((prob, idx) => {
                    if (paletteFilter === "MCQ" && prob.type !== "mcq") return null;
                    if (paletteFilter === "CODING" && prob.type !== "coding") return null;

                    const isCurrent = idx === currentIndex;
                    const ans = answers[prob.id];
                    const isAnswered =
                      prob.type === "mcq"
                        ? !!ans?.selectedOption
                        : !!(ans?.code && ans.code.trim().length > 20 && ans.code !== prob.starter_code_json?.python);
                    const isMarked = !!ans?.isMarkedReview;

                    return (
                      <button
                        key={prob.id || idx}
                        onClick={() => {
                          navigateTo(idx);
                          setIsPaletteOpen(false);
                        }}
                        className={`w-10 h-10 rounded-full text-xs font-mono font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                          isCurrent
                            ? "bg-slate-900 text-white ring-2 ring-[#9DFF00] ring-offset-2 ring-offset-[#121824]"
                            : isAnswered
                            ? "bg-emerald-950/40 text-emerald-400 border-2 border-emerald-500 font-extrabold"
                            : isMarked
                            ? "bg-purple-950/40 text-purple-400 border-2 border-purple-400 font-bold"
                            : "bg-[#141B2D] text-slate-400 border border-[#1E293B] hover:text-white hover:bg-white/5"
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

                {/* Status Legend */}
                <div className="pt-4 border-t border-[#1E293B] space-y-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Marked for Review</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E293B] text-[11px] text-slate-500 font-mono">
                Proctored Room &bull; AVASC Academic
              </div>
            </aside>
          </>
        )}

        {/* Workspace Panes Container with Adjustable Splitter */}
        <div
          ref={splitContainerRef}
          className={`flex-1 flex overflow-hidden ${
            isDraggingSplitter ? "select-none cursor-col-resize" : ""
          }`}
        >
          {/* =============================================================== */}
          {/* 2B. LEFT WORKSPACE PANE (Question Statement & Formatting)       */}
          {/* =============================================================== */}
          <div
            style={{ width: isEditorMaximized ? "0%" : `${leftWidthPercent}%` }}
            className={`${
              isEditorMaximized ? "hidden" : "flex"
            } flex-col border-r border-[#1E293B] bg-[#0B0F17] overflow-hidden shrink-0`}
          >
          {/* Subheader: Q. X of Y, Badges & Bookmark */}
          <div className="h-12 border-b border-[#1E293B] bg-[#0E131F] px-6 flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-white text-sm">
                Q. {currentIndex + 1} of {assessment.problems?.length || 0}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentProblem.type === "coding"
                    ? "bg-sky-950/50 text-sky-400 border border-sky-800/40"
                    : "bg-purple-950/50 text-purple-400 border border-purple-800/40"
                }`}
              >
                {currentProblem.type === "coding" ? "Coding Problem" : "Multiple Choice"}
              </span>
              <span className="text-slate-500 text-[11px] font-mono">20 pts</span>
            </div>

            <button
              type="button"
              onClick={toggleMarkReview}
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
                answers[currentProblem.id]?.isMarkedReview
                  ? "bg-purple-950/40 text-purple-300 border-purple-400"
                  : "text-slate-400 hover:text-white border-[#1E293B] hover:bg-white/5"
              }`}
              title="Bookmark for Review"
            >
              <Bookmark className={`w-3.5 h-3.5 ${answers[currentProblem.id]?.isMarkedReview ? "fill-purple-400 text-purple-400" : ""}`} />
              <span className="hidden sm:inline">
                {answers[currentProblem.id]?.isMarkedReview ? "Marked" : "Review"}
              </span>
            </button>
          </div>

          {/* Question Statement & Formatted Markdown */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-300">
            {/* Question Title if distinct */}
            <h2 className="text-lg font-bold text-white tracking-tight">
              {currentProblem.title}
            </h2>

            {/* Description rendered cleanly without raw markdown symbols */}
            <div className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300 space-y-3">
              <MarkdownRenderer
                content={
                  currentProblem.description_md ||
                  (currentProblem.type === "coding"
                    ? "Given an array of integers nums and an integer target, write an optimal function in Python to return indices of the two numbers such that they add up to target."
                    : "Which of the following algorithmic properties or data structures follows the specified discipline?")
                }
              />
            </div>

            {/* Coding Problem Formatted Sections */}
            {currentProblem.type === "coding" && (
              <div className="space-y-4 pt-2">
                {/* Example 1 Card */}
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold text-slate-400">
                    Example 1
                  </div>
                  <div className="p-4 rounded-xl bg-[#141B2D]/80 border border-[#1E293B] font-mono text-xs space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-slate-200">
                        {(currentProblem.test_cases?.[0]?.input || (currentProblem.test_cases?.[0] as any)?.input_data || "nums = [2, 7, 11, 15], target = 9").replace(/\n/g, ", ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Output: </span>
                      <span className="text-[#9DFF00]">
                        {currentProblem.test_cases?.[0]?.expected_output || "[0, 1]"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Constraints Card */}
                <div className="p-3.5 rounded-xl bg-[#141B2D]/50 border border-[#1E293B] font-mono text-xs text-slate-400 space-y-1">
                  <div className="text-slate-300 font-bold">&gt; Constraints</div>
                  <div>&bull; Linear or near-linear time complexity expected.</div>
                  <div>&bull; Standard memory boundaries apply.</div>
                </div>
              </div>
            )}
          </div>

          {/* Left Bottom Pagination Status Bar */}
          <div className="h-10 border-t border-[#1E293B] bg-[#0E131F] px-4 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>&larr; Previous</span>
            </button>
            <span className="text-slate-500">
              Question {currentIndex + 1} of {assessment.problems?.length || 0}
            </span>
            <button
              type="button"
              onClick={() => navigateTo(Math.min((assessment.problems?.length || 1) - 1, currentIndex + 1))}
              disabled={currentIndex >= (assessment.problems?.length || 1) - 1}
              className="hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next &rarr;</span>
            </button>
          </div>
        </div>

        {/* Draggable Resizer Bar */}
        {!isEditorMaximized && (
          <div
            onMouseDown={handleSplitterMouseDown}
            onDoubleClick={() => setLeftWidthPercent(36)}
            className="w-1.5 hover:w-2 bg-[#1E293B] hover:bg-[#9DFF00] cursor-col-resize transition-all z-10 relative group shrink-0"
            title="Drag to resize question area (Double click to reset to 36%)"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3.5 h-10 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="w-0.5 h-4 bg-slate-400 rounded-full" />
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* 2C. RIGHT WORKSPACE PANE (Coding IDE or MCQ Cards)               */}
        {/* =============================================================== */}
        <div
          className={`${
            isEditorMaximized ? "w-full" : "flex-1"
          } flex flex-col bg-[#0D1117] overflow-hidden min-w-0`}
        >
          {currentProblem.type === "coding" ? (
            /* Coding Problem IDE */
            <div className="h-full flex flex-col">
              {/* Top Editor Toolbar */}
              <div className="h-12 border-b border-[#1E293B] bg-[#0E131F] px-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <select
                    value={answers[currentProblem.id]?.language || "python"}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentProblem.id]: {
                          ...prev[currentProblem.id],
                          language: e.target.value as any,
                        },
                      }))
                    }
                    className="bg-[#161D2E] border border-[#232F48] text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#9DFF00] cursor-pointer"
                  >
                    <option value="python">Python 3.11</option>
                  </select>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161D2E] border border-[#232F48] text-white text-xs font-mono">
                    <span className="font-bold">solution.py</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Auto-saved
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center bg-[#131926] border border-[#20293D] rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() =>
                        handleCodeChange(
                          currentProblem.starter_code_json?.python ||
                            "def solve(nums, target):\n    # Write optimal logic here\n    pass\n"
                        )
                      }
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Reset Boilerplate Code"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditorMaximized((m) => !m)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title={isEditorMaximized ? "Restore Split View" : "Maximize Editor"}
                    >
                      {isEditorMaximized ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="w-px h-5 bg-[#1E293B]" />

                  {/* Run Sample Case Button */}
                  <button
                    type="button"
                    onClick={handleTestExamCode}
                    disabled={isTestingCode}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1A2234] hover:bg-[#242F48] text-white border border-[#2B3954] text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current text-[#9DFF00]" />
                    <span>{isTestingCode ? "Evaluating..." : "Run Test"}</span>
                  </button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 relative overflow-hidden bg-[#0B0F17]">
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
                    tabSize: 4,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12 },
                    fontFamily: "JetBrains Mono, Menlo, Monaco, monospace",
                  }}
                />
              </div>

              {/* Bottom Test Execution Panel */}
              <div
                className={`border-t border-[#1E293B] bg-[#0E131F] flex flex-col transition-all duration-200 ${
                  isBottomCollapsed ? "h-10" : "h-52"
                } flex-shrink-0`}
              >
                <div className="h-10 border-b border-[#1E293B] px-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab("cases");
                        setIsBottomCollapsed(false);
                      }}
                      className={`font-bold transition-colors cursor-pointer ${
                        activeBottomTab === "cases"
                          ? "text-[#9DFF00]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>Test Cases ({currentProblem.test_cases?.length || 1})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab("console");
                        setIsBottomCollapsed(false);
                      }}
                      className={`font-bold transition-colors cursor-pointer ${
                        activeBottomTab === "console"
                          ? "text-[#9DFF00]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>Console &gt;_</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBottomCollapsed((c) => !c)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span>{isBottomCollapsed ? "Expand" : "Collapse"}</span>
                    {isBottomCollapsed ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {!isBottomCollapsed && (
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-3">
                    {testOutput ? (
                      <div
                        className={`p-3 rounded-xl border text-xs font-mono font-semibold ${
                          testOutput.startsWith("PASS")
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                            : "bg-rose-950/40 text-rose-300 border-rose-800/40"
                        }`}
                      >
                        {testOutput}
                      </div>
                    ) : (
                      <div className="text-slate-500 font-sans">
                        Click &lsquo;Run Sample Case&rsquo; to verify code against
                        sample assertions in Pyodide WASM.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* MCQ Option Cards matching Dark Workspace Design */
            <div className="flex-1 p-8 overflow-y-auto space-y-4 max-w-2xl mx-auto w-full flex flex-col justify-center">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Select one correct option:
              </div>

              {(currentProblem.mcq_options_json || ["Option A", "Option B", "Option C", "Option D"]).map((optText, optIdx) => {
                const label = String.fromCharCode(65 + optIdx);
                const isSelected = answers[currentProblem.id]?.selectedOption === optText;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optText)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between shadow-xs cursor-pointer ${
                      isSelected
                        ? "bg-[#9DFF00]/10 border-2 border-[#9DFF00] text-white font-semibold"
                        : "bg-[#141B2D] border-[#1E293B] text-slate-300 hover:border-[#334155] hover:bg-[#1A2338]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all ${
                          isSelected
                            ? "bg-[#9DFF00] text-black shadow-xs font-extrabold"
                            : "bg-[#1A2234] text-slate-300 border border-[#232F48]"
                        }`}
                      >
                        {label}
                      </span>
                      <span className="text-sm font-sans">{optText}</span>
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

          {/* Bottom Action Bar */}
          <footer className="h-14 border-t border-[#1E293B] bg-[#0E131F] px-8 flex items-center justify-between text-xs flex-shrink-0">
            <button
              type="button"
              onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-xl border border-[#1E293B] bg-[#141B2D] text-slate-300 font-semibold hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex >= (assessment.problems?.length || 1) - 1 ? (
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>{isSubmitting ? "Submitting..." : "Submit Exam"}</span>
                <CheckCircle2 className="w-4 h-4 text-black" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo(currentIndex + 1)}
                className="flex items-center gap-2 px-7 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </footer>
        </div>
        </div>
      </div>
    </div>
  );
}

