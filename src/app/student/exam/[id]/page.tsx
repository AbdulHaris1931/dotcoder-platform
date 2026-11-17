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
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500 font-mono text-xs">
        Initializing proctored assessment suite...
      </div>
    );
  }

  // Submitted Completion Screen
  if (isSubmitted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-6 bg-[#F8FAFC] text-slate-900 font-sans">
        <div className="card-luxury max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl border border-slate-200/90 bg-white">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Assessment Submitted</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your test responses and anti-cheat telemetry have been securely transferred to the college placement cell.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Candidate:</span>
              <strong className="text-slate-900">{currentUser?.full_name} ({currentUser?.roll_no})</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Audit Violations:</span>
              <span className={`font-bold ${tabSwitches > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {tabSwitches} Logged
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Institution:</span>
              <span className="text-slate-900">Cauvery Institute of Technology</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/student/dashboard")}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
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

      {/* Top Lockdown Header */}
      <header className="h-14 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between gap-4 z-20 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
              {assessment.title}
            </h1>
            <div className="text-[10px] text-slate-500 font-mono">
              Roll: {currentUser?.roll_no} • {currentUser?.department}
            </div>
          </div>
        </div>

        {/* Status Indicator, Tabular Countdown Timer & Submit CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Proctoring Active • Locked
          </span>

          {tabSwitches > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              {tabSwitches} Flags
            </span>
          )}

          {/* Tabular Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs border tabular-nums shadow-sm transition-colors ${
              timeLeftSeconds < 60
                ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse shadow-rose-500/20"
                : timeLeftSeconds < 300
                ? "bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                : "bg-slate-50 text-slate-800 border-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => handleFinalSubmit(false)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Send className="w-3 h-3" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left 270px Question Matrix Palette */}
        <aside className="w-[270px] border-r border-slate-200/90 bg-white p-5 flex flex-col justify-between overflow-y-auto flex-shrink-0 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">
                Question Matrix
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {currentIndex + 1}/{assessment.problems?.length}
              </span>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 ring-2 ring-indigo-200" /> Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" /> Unvisited
              </span>
            </div>

            {/* Tactile Palette Tiles */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {assessment.problems?.map((p, idx) => {
                const status = getQuestionStatus(p, idx);
                let btnStyle = "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200";
                if (status === "current") {
                  btnStyle = "bg-indigo-600 text-white font-bold ring-2 ring-indigo-200 border-indigo-600 shadow-sm";
                } else if (status === "marked_review") {
                  btnStyle = "bg-amber-500 text-white font-bold border-amber-500 shadow-sm";
                } else if (status === "answered") {
                  btnStyle = "bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm";
                }

                return (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(idx)}
                    className={`h-9 rounded-xl text-xs transition-all flex items-center justify-center font-mono font-semibold ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Notice Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1 mt-4 text-[11px] text-indigo-900 font-sans">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Anti-Cheat Active</span>
            </div>
            <p className="text-indigo-700/80 leading-relaxed text-[10px]">
              Right-click, copy-paste, and tab switches are intercepted and logged in real-time.
            </p>
          </div>
        </aside>

        {/* Right Active Question Workspace */}
        <main className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
          {/* Subheader: Question Category & Mark for Review */}
          <div className="h-11 border-b border-slate-200 bg-white px-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-900 text-xs">
                Question {currentIndex + 1} of {assessment.problems?.length}
              </span>
              <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentProblem.type === "mcq" ? "Aptitude MCQ" : "Coding Challenge"}
              </span>
            </div>

            <button
              onClick={toggleMarkReview}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                answers[currentProblem.id]?.isMarkedReview
                  ? "bg-amber-50 text-amber-700 border border-amber-300"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{answers[currentProblem.id]?.isMarkedReview ? "Marked for Review" : "Mark Review"}</span>
            </button>
          </div>

          {/* Question Body */}
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="card-luxury rounded-2xl p-6 bg-white border border-slate-200/90 shadow-sm leading-relaxed text-slate-800 text-sm">
              <div className="whitespace-pre-line font-medium leading-relaxed font-sans">
                {currentProblem.description_md}
              </div>
            </div>

            {/* MCQ Options */}
            {currentProblem.type === "mcq" && currentProblem.mcq_options_json && (
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500">
                  Select Correct Option:
                </div>
                <div className="space-y-2.5">
                  {currentProblem.mcq_options_json.map((option, optIdx) => {
                    const isSelected = answers[currentProblem.id]?.selectedOption === option;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(option)}
                        className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between shadow-sm ${
                          isSelected
                            ? "bg-indigo-50/80 border-indigo-500 text-indigo-950 font-semibold ring-1 ring-indigo-500"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs font-mono transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Embedded Coding IDE in Exam */}
            {currentProblem.type === "coding" && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Embedded Solution Editor (Python 3)</span>
                  </div>

                  <button
                    onClick={handleTestExamCode}
                    disabled={isTestingCode}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isTestingCode ? "Evaluating..." : "Run Sample Case"}</span>
                  </button>
                </div>

                <div className="h-64 border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
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
                    className={`p-3.5 rounded-xl text-xs font-mono border shadow-sm ${
                      testOutput.startsWith("PASS")
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    {testOutput}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Step Navigation Bar */}
          <footer className="h-14 border-t border-slate-200/90 bg-white px-6 flex items-center justify-between text-xs font-mono shadow-sm">
            <button
              onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-slate-500 text-xs font-semibold">
              Question {currentIndex + 1} of {assessment.problems?.length}
            </span>

            {currentIndex < (assessment.problems?.length || 1) - 1 ? (
              <button
                onClick={() => navigateTo(currentIndex + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleFinalSubmit(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]"
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
