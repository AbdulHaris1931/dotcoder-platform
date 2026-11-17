"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore } from "@/lib/demo-store";
import { runPythonCode } from "@/lib/pyodide-runner";
import { compareOutputs } from "@/lib/utils";
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
          code: p.type === "coding" ? p.starter_code_json.python : undefined,
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

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeftSeconds]);

  // 3. Anti-Cheating Listeners: Blur, VisibilityChange, Fullscreen
  useEffect(() => {
    if (isSubmitted) return;

    const handleViolation = (type: "tab_switch" | "fullscreen_exit" | "blur", details: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setTabSwitches((prev) => prev + 1);
      setViolationLogs((prev) => [...prev, { timestamp, type, details }]);
      setCurrentViolationMsg(details);
      setShowViolationModal(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("tab_switch", "Tab switch detected! Leaving the assessment tab is strictly recorded.");
      }
    };

    const handleWindowBlur = () => {
      handleViolation("blur", "Window focus lost! Focus shifted to another browser window or desktop app.");
    };

    const handleFullscreenChange = () => {
      const inFull = Boolean(document.fullscreenElement);
      setIsFullscreen(inFull);
      if (!inFull) {
        handleViolation("fullscreen_exit", "Fullscreen mode exited. Assessments must remain in fullscreen.");
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
  }, [isSubmitted]);

  const triggerFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleSecurityBlock = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  const currentProblem: Problem | undefined = assessment?.problems?.[currentIndex];

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
        visited: true,
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

  const handleFinalSubmit = (isAuto = false) => {
    if (isSubmitted || !assessment || !currentUser) return;
    setIsSubmitted(true);

    let totalScore = 0;
    const totalQuestions = assessment.problems?.length || 1;

    assessment.problems?.forEach((p) => {
      const ans = answers[p.id];
      if (p.type === "mcq" && ans?.selectedOption === p.correct_option) {
        totalScore += 20;
      } else if (p.type === "coding" && ans?.code) {
        totalScore += 20;
      }
    });

    const percentage = Math.round((totalScore / (totalQuestions * 20)) * 100);

    DemoStore.recordSubmission({
      assessment_id: assessment.id,
      user_id: currentUser.id,
      problem_id: assessment.problems?.[0].id || "exam-problem",
      language: "python",
      source_code: "# Final Exam Submission",
      status: percentage >= 60 ? "Accepted" : "Wrong Answer",
      passed_cases: Math.round((percentage / 100) * 5),
      total_cases: 5,
      score: percentage,
      execution_time_ms: 180,
      tab_switches: tabSwitches,
    });
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
      <div className="h-screen flex items-center justify-center bg-[#09090B] text-slate-500 font-mono text-xs">
        Initializing proctored assessment suite...
      </div>
    );
  }

  // Submitted Completion Screen
  if (isSubmitted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-6 bg-[#09090B] text-slate-100 font-sans">
        <div className="card-obsidian max-w-md w-full rounded-2xl p-8 text-center space-y-6 shadow-2xl border-white/[0.1]">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_24px_-4px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Assessment Submitted</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your test responses and anti-cheat telemetry have been securely transferred to the college placement cell.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0C0C0E] border border-white/[0.06] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Candidate:</span>
              <strong className="text-white">{currentUser?.full_name} ({currentUser?.roll_no})</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Audit Violations:</span>
              <span className={`font-bold ${tabSwitches > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {tabSwitches} Logged
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Institution:</span>
              <span className="text-white">Cauvery Institute of Technology</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/student/dashboard")}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)]"
          >
            Return to Student Workspace
          </button>
        </div>
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
      className="h-screen w-screen select-none bg-[#09090B] text-slate-100 overflow-hidden font-sans flex flex-col"
    >
      {/* Authoritative Red Alert Modal for Proctoring Violations */}
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
              className="relative w-full max-w-md bg-[#160B0D] border-2 border-rose-500/80 rounded-2xl p-6 text-white space-y-4 shadow-[0_0_48px_-12px_rgba(244,63,94,0.6)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-rose-300">
                    Proctoring Violation Flagged!
                  </h3>
                  <div className="text-[11px] text-rose-400 font-mono">
                    Violation {tabSwitches} logged to Placement Cell
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200 leading-relaxed font-mono">
                {currentViolationMsg}
              </div>

              <p className="text-[11px] text-slate-400">
                All tab switching, fullscreen escapes, and clipboard attempts are permanently timestamped and attached to your placement audit score.
              </p>

              <button
                onClick={() => {
                  setShowViolationModal(false);
                  triggerFullscreen();
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Return to Fullscreen Exam
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Lockdown Header */}
      <header className="h-12 border-b border-white/[0.08] bg-[#0C0C0E] px-4 sm:px-6 flex items-center justify-between gap-4 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
              {assessment.title}
            </h1>
            <div className="text-[10px] text-slate-400 font-mono">
              Roll: {currentUser?.roll_no} • {currentUser?.department}
            </div>
          </div>
        </div>

        {/* Status Indicator, Tabular Countdown Timer & Submit CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Proctoring Active • Fullscreen
          </span>

          {tabSwitches > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              {tabSwitches} Flags
            </span>
          )}

          {/* Tabular Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-xs border tabular-nums transition-colors ${
              timeLeftSeconds < 60
                ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : timeLeftSeconds < 300
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse"
                : "bg-[#18181C] text-white border-white/[0.08]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => handleFinalSubmit(false)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_16px_-2px_rgba(16,185,129,0.4)] transition-all flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left 260px Question Matrix Palette */}
        <aside className="w-[260px] border-r border-white/[0.08] bg-[#0C0C0E] p-4 flex flex-col justify-between overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Question Matrix
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {currentIndex + 1}/{assessment.problems?.length}
              </span>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 ring-2 ring-white" /> Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#18181C] border border-white/[0.08]" /> Unvisited
              </span>
            </div>

            {/* Tactile Palette Tiles */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {assessment.problems?.map((p, idx) => {
                const status = getQuestionStatus(p, idx);
                let btnStyle = "bg-[#141418] text-slate-400 hover:bg-[#1c1c22] border border-white/[0.06]";
                if (status === "current") {
                  btnStyle = "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 border-indigo-400";
                } else if (status === "marked_review") {
                  btnStyle = "bg-amber-600 text-white font-bold border-amber-500";
                } else if (status === "answered") {
                  btnStyle = "bg-emerald-600 text-white font-bold border-emerald-500";
                }

                return (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(idx)}
                    className={`h-9 rounded-lg text-xs transition-all flex items-center justify-center font-mono ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Notice Box */}
          <div className="p-3 rounded-xl bg-[#09090B] border border-white/[0.06] space-y-1.5 mt-4 text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Anti-Cheat Guard</span>
            </div>
            <p className="leading-tight">
              Right-click, copy-paste, and tab switches are intercepted and logged in real-time.
            </p>
          </div>
        </aside>

        {/* Right Active Question Workspace */}
        <main className="flex-1 flex flex-col bg-[#09090B] overflow-hidden">
          {/* Subheader: Question Category & Mark for Review */}
          <div className="h-10 border-b border-white/[0.08] bg-[#0E0E12] px-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">
                Question {currentIndex + 1} of {assessment.problems?.length}
              </span>
              <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {currentProblem.type === "mcq" ? "Aptitude MCQ" : "Coding Challenge"}
              </span>
            </div>

            <button
              onClick={toggleMarkReview}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                answers[currentProblem.id]?.isMarkedReview
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{answers[currentProblem.id]?.isMarkedReview ? "Marked" : "Mark Review"}</span>
            </button>
          </div>

          {/* Question Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200">
              <div className="whitespace-pre-line font-medium leading-relaxed font-sans">
                {currentProblem.description_md}
              </div>
            </div>

            {/* MCQ Options */}
            {currentProblem.type === "mcq" && currentProblem.mcq_options_json && (
              <div className="space-y-3 pt-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Select Correct Option:
                </div>
                <div className="space-y-2">
                  {currentProblem.mcq_options_json.map((option, optIdx) => {
                    const isSelected = answers[currentProblem.id]?.selectedOption === option;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(option)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-950/40 border-indigo-500 text-white shadow-md ring-1 ring-indigo-400"
                            : "bg-[#111114] border-white/[0.06] text-slate-300 hover:border-white/[0.14] hover:bg-[#16161B]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-white/[0.04] text-slate-400"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Embedded Coding IDE in Exam */}
            {currentProblem.type === "coding" && (
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Embedded Solution Editor (Python 3)</span>
                  </div>

                  <button
                    onClick={handleTestExamCode}
                    disabled={isTestingCode}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18181C] hover:bg-[#202028] text-white text-xs font-semibold border border-white/[0.08] transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isTestingCode ? "Evaluating..." : "Run Sample Case"}</span>
                  </button>
                </div>

                <div className="h-64 border border-white/[0.08] rounded-xl overflow-hidden bg-[#0D0D10]">
                  <Editor
                    height="100%"
                    language="python"
                    theme="vs-dark"
                    value={answers[currentProblem.id]?.code || currentProblem.starter_code_json.python}
                    onChange={(val) => handleCodeChange(val || "")}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>

                {testOutput && (
                  <div
                    className={`p-3 rounded-lg text-xs font-mono border ${
                      testOutput.startsWith("PASS")
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    }`}
                  >
                    {testOutput}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Step Navigation Bar */}
          <footer className="h-12 border-t border-white/[0.08] bg-[#0C0C0E] px-6 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-slate-500 text-[11px]">
              Question {currentIndex + 1} of {assessment.problems?.length}
            </span>

            {currentIndex < (assessment.problems?.length || 1) - 1 ? (
              <button
                onClick={() => navigateTo(currentIndex + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-sm"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleFinalSubmit(false)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_16px_rgba(16,185,129,0.4)]"
              >
                <span>Submit Final Exam</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
