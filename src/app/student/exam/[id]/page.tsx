"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#070B09] text-slate-400 p-8 space-y-3 font-mono text-xs min-h-[300px]">
      <div className="w-8 h-8 rounded-full border-2 border-[#9DFF00] border-t-transparent animate-spin" />
      <span>Initializing Monaco Code Editor...</span>
    </div>
  ),
});
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { MncStore } from "@/lib/mnc-store";
import { AssessmentRegistry } from "@/lib/assessment-registry";
import { runPythonCode } from "@/lib/pyodide-runner";
import { compareOutputs } from "@/lib/utils";
import { AssessmentService } from "@/lib/services/assessment-service";
import {
  AssessmentAttempt,
  ProctorIntegrityEvent,
  QuestionSubmissionAnswer,
} from "@/types/assessment-attempt";
import { Assessment, UserProfile, SupportedLanguage, ProctorViolationLog } from "@/types";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { usePageLoading } from "@/components/shared/global-loading-screen";
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
  Play,
  RotateCcw,
  Award,
  FileCheck,
  Copy,
  LayoutGrid,
  X,
  ChevronDown,
  ChevronUp,
  Terminal,
  XCircle,
  AlertCircle,
} from "lucide-react";


export interface ExamCaseResult {
  caseNumber: number;
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTimeMs: number;
  errorMessage?: string;
  isHidden: boolean;
}

export interface ExamConsoleLog {
  rawStdout: string;
  rawStderr: string;
  executionTimeMs: number;
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}

export default function ProctoredExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { setIsPageLoading } = usePageLoading();
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
    status?: "passed" | "failed" | "unattempted";
    allCasesPassed?: boolean;
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
  const [, setTestOutput] = useState<string | null>(null);
  const [testCaseResults, setTestCaseResults] = useState<Record<string, ExamCaseResult[]>>({});
  const [consoleOutputs, setConsoleOutputs] = useState<Record<string, ExamConsoleLog>>({});
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [navBlockedWarning, setNavBlockedWarning] = useState<string | null>(null);

  // Palette Filter: All, Answered, Review, Unattempted, MCQ, Coding
  type PaletteFilterType = "ALL" | "ANSWERED" | "REVIEW" | "UNATTEMPTED" | "MCQ" | "CODING";
  const [paletteFilter, setPaletteFilter] = useState<PaletteFilterType>("ALL");
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("just now");
  const [isRestoredFromBackup, setIsRestoredFromBackup] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOffline(!window.navigator.onLine);
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Split pane horizontal resizing: question area width percentage
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(36);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Split pane vertical resizing: output panel height in pixels
  const [outputHeight, setOutputHeight] = useState<number>(270);
  const [isDraggingOutputSplitter, setIsDraggingOutputSplitter] = useState<boolean>(false);
  const rightContainerRef = useRef<HTMLDivElement>(null);

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  const handleOutputSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingOutputSplitter(true);
  };

  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      // Allow resizing between 20% and 55%
      const clamped = Math.min(Math.max(rawPercent, 20), 55);
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

  // Output panel vertical drag listener
  useEffect(() => {
    if (!isDraggingOutputSplitter) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rightContainerRef.current) return;
      const rect = rightContainerRef.current.getBoundingClientRect();
      // Calculate height from mouse position to bottom of right container (minus 56px for bottom footer)
      const newHeight = rect.bottom - e.clientY - 56;
      const clamped = Math.min(Math.max(newHeight, 140), 550);
      setOutputHeight(clamped);
      setIsBottomCollapsed(false);
    };

    const handleMouseUp = () => {
      setIsDraggingOutputSplitter(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingOutputSplitter]);

  const [isBottomCollapsed, setIsBottomCollapsed] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"cases" | "results" | "console">("cases");

  // 1. Initialize Exam & User State (Syncing Cloud Assessments + Local Recovery Backup)
  useEffect(() => {
    let isMounted = true;

    async function initExam() {
      const [user] = await Promise.all([
        DataService.getCurrentUser(),
        AssessmentRegistry.syncFromCloud(),
      ]);
      if (!isMounted) return;
      setCurrentUser(user);

      const exam = AssessmentRegistry.getAssessment(examId || "assessment-1");
      setAssessment(exam);

      if (exam && exam.duration_minutes) {
        setTimeLeftSeconds(exam.duration_minutes * 60);
      }

      if (exam?.problems) {
        const initialMap: Record<
          string,
          {
            selectedOption?: string;
            code?: string;
            language: SupportedLanguage;
            isMarkedReview: boolean;
            visited: boolean;
          }
        > = {};
        exam.problems.forEach((p, idx) => {
          initialMap[p.id] = {
            selectedOption: undefined,
            code: p.type === "coding" ? (p.starter_code_json?.python || "") : undefined,
            language: "python",
            isMarkedReview: false,
            visited: idx === 0,
          };
        });

        // Restore session from localStorage backup if student reloaded or disconnected (strictly isolated by userId)
        try {
          const backupKey = `eqlv_exam_backup_${user?.id || "guest"}_${exam.id}`;
          const saved = localStorage.getItem(backupKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") {
              Object.keys(parsed).forEach((pid) => {
                if (initialMap[pid]) {
                  const restored = parsed[pid];
                  // If saved code contains old pre-filled solution answers from prior sessions, purge them so student starts with the template
                  const hasLegacySolution =
                    restored?.code &&
                    (restored.code.includes("seen[complement]") ||
                      restored.code.includes("max_len = max(max_len") ||
                      restored.code.includes("pairs = {')': '(',") ||
                      restored.code.includes("max_l - h[left]") ||
                      restored.code.includes("cur_sum == target") ||
                      restored.code.includes("dp[amount] != float('inf')") ||
                      restored.code.includes("merged.append(interval)") ||
                      restored.code.includes("nums[mid] > nums[mid + 1]"));

                  if (hasLegacySolution) {
                    delete restored.code;
                  }

                  initialMap[pid] = { ...initialMap[pid], ...restored };
                }
              });
              setIsRestoredFromBackup(true);
            }
          }
        } catch {
          // ignore backup parse failure
        }

        setAnswers(initialMap);
        setCurrentIndex(0);
      }
    }

    void initExam();
    return () => {
      isMounted = false;
    };
  }, [examId]);

  // Debounced auto-save to localStorage (strictly isolated per user)
  useEffect(() => {
    if (!assessment || Object.keys(answers).length === 0 || isSubmitted) return;
    const backupKey = `eqlv_exam_backup_${currentUser?.id || "guest"}_${assessment.id}`;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(backupKey, JSON.stringify(answers));
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      } catch {}
    }, 600);
    return () => clearTimeout(timer);
  }, [answers, assessment, isSubmitted, currentUser?.id]);

  // Dynamic Proctor Trust Score
  const trustScore = Math.max(
    0,
    100 - tabSwitches * 10 - violationLogs.filter((v) => v.type === "fullscreen_exit").length * 20
  );

  const submitRef = useRef<(isAuto?: boolean) => void>(() => {});
  const logViolationRef = useRef<(message: string, type?: "tab_switch" | "fullscreen_exit" | "blur") => void>(() => {});
  const timeLeftRef = useRef(timeLeftSeconds);
  timeLeftRef.current = timeLeftSeconds;

  // 2. Countdown Timer Loop
  useEffect(() => {
    if (isSubmitted || timeLeftRef.current <= 0) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted]);

  // 3. Anti-Cheating: Fullscreen & Tab Focus Monitor
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolationRef.current("Tab switch or browser minimization detected.", "tab_switch");
      }
    };

    const handleWindowBlur = () => {
      logViolationRef.current("Window focus lost (possible second monitor or split screen).", "blur");
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen && !isSubmitted) {
        logViolationRef.current("Exited locked-down fullscreen exam mode.", "fullscreen_exit");
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

  const logViolation = (message: string, type: "tab_switch" | "fullscreen_exit" | "blur" = "tab_switch") => {
    setTabSwitches((prev) => prev + 1);
    setCurrentViolationMsg(message);
    setShowViolationModal(true);

    const log: ProctorViolationLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      details: message,
    };
    setViolationLogs((prev) => [log, ...prev]);
  };
  logViolationRef.current = logViolation;

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
    setSelectedCaseIdx(0);
    setNavBlockedWarning(null);
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
    const currentCode =
      answers[currentProblem.id]?.code ||
      currentProblem.starter_code_json?.python ||
      "";
    setIsTestingCode(true);
    setTestOutput(null);
    setNavBlockedWarning(null);

    const cases = currentProblem.test_cases || [];
    const results: ExamCaseResult[] = [];
    let totalTimeMs = 0;
    let combinedStdout = "";
    let combinedStderr = "";

    try {
      for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        const expected = (tc.expected_output || tc.expectedOutput || "").trim();
        const res = await runPythonCode(currentCode, tc.input);
        totalTimeMs += res.executionTimeMs;

        if (i === 0 || !combinedStdout) {
          combinedStdout = res.stdout;
        }
        if (res.stderr) {
          combinedStderr = res.stderr;
        }

        const passed = compareOutputs(res.stdout, expected);
        results.push({
          caseNumber: i + 1,
          id: tc.id || `tc-${i + 1}`,
          input: tc.input,
          expectedOutput: expected,
          actualOutput: (res.stdout || res.stderr).trim(),
          passed,
          executionTimeMs: res.executionTimeMs,
          errorMessage: res.stderr || undefined,
          isHidden: !!(tc.is_hidden || tc.isHidden),
        });
      }

      const passedCount = results.filter((r) => r.passed).length;
      const allPassed = results.length > 0 && passedCount === results.length;

      setTestCaseResults((prev) => ({
        ...prev,
        [currentProblem.id]: results,
      }));

      setConsoleOutputs((prev) => ({
        ...prev,
        [currentProblem.id]: {
          rawStdout: combinedStdout.trim(),
          rawStderr: combinedStderr.trim(),
          executionTimeMs: totalTimeMs,
          passedCount,
          totalCount: results.length,
          allPassed,
        },
      }));

      setTestOutput(
        allPassed
          ? `PASS: All ${results.length} test cases verified in ${totalTimeMs}ms`
          : `FAIL: ${passedCount} of ${results.length} test cases passed. All test cases must pass to advance.`
      );

      setAnswers((prev) => ({
        ...prev,
        [currentProblem.id]: {
          ...prev[currentProblem.id],
          code: currentCode,
          status: allPassed ? "passed" : "failed",
          allCasesPassed: allPassed,
          visited: true,
        },
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setTestOutput(`Execution error: ${message}`);
      setConsoleOutputs((prev) => ({
        ...prev,
        [currentProblem.id]: {
          rawStdout: "",
          rawStderr: message,
          executionTimeMs: 0,
          passedCount: 0,
          totalCount: cases.length,
          allPassed: false,
        },
      }));
    } finally {
      setIsTestingCode(false);
    }
  };

  const handleAttemptNext = (targetIndex: number) => {
    if (currentProblem && currentProblem.type === "coding") {
      const ans = answers[currentProblem.id];
      if (!ans?.allCasesPassed) {
        setNavBlockedWarning(
          "All test cases (1, 2, 3, 4, 5) must pass with correct output before moving to the next question."
        );
        return;
      }
    }
    setNavBlockedWarning(null);
    navigateTo(targetIndex);
  };

  const handleMarkFailedAndSkip = (targetIndex: number) => {
    if (currentProblem) {
      setAnswers((prev) => ({
        ...prev,
        [currentProblem.id]: {
          ...prev[currentProblem.id],
          status: "failed",
          allCasesPassed: false,
          visited: true,
        },
      }));
    }
    setNavBlockedWarning(null);
    navigateTo(targetIndex);
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
      type: vl.type as ProctorIntegrityEvent["type"],
      details: vl.details,
      severity: vl.type === "fullscreen_exit" ? "high" : "medium",
    }));

    try {
      const res = await AssessmentService.submitAssessment({
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        userId: currentUser?.id || "demo-student-1",
        studentName: currentUser?.full_name || "Candidate",
        rollNo: currentUser?.roll_no || "23BCA01",
        department: currentUser?.department || "BCA",
        collegeName: currentUser?.college_name || "Annai Vailankanni Arts and Science College, Thanjavur",
        durationSpentSeconds: (assessment.duration_minutes || 45) * 60 - timeLeftSeconds,
        tabSwitches,
        answers: answersPayload,
        integrityEvents,
        questions: assessment.problems,
      });

      if (res.success && res.attempt) {
        setSubmittedAttempt(res.attempt);
        setIsSubmitted(true);
        try {
          localStorage.removeItem(`eqlv_exam_backup_${currentUser?.id || "guest"}_${assessment.id}`);
        } catch {}

        // If this is an MNC 300 modular assessment, record score & sequential progression
        try {
          const unitMatch = assessment.id.match(/unit-(\d+)/i);
          if (unitMatch) {
            MncStore.recordAttempt(
              `unit-${unitMatch[1]}`,
              res.attempt.score,
              res.attempt.score
            );
          }
        } catch (e) {
          console.error("MncStore attempt update error:", e);
        }
      } else if (!res.success && res.message) {
        setNavBlockedWarning(res.message);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  submitRef.current = handleFinalSubmit;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!assessment || !currentProblem) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#070B09] text-[#85998D] font-mono text-xs">
        Initializing proctored assessment suite...
      </div>
    );
  }

  // Submitted Completion Screen with Accreditation Compliance Certificate & Details
  if (isSubmitted && submittedAttempt) {
    const isPassing = submittedAttempt.passed;
    return (
      <div className="min-h-screen w-screen py-10 px-4 sm:px-6 bg-[#070B09] text-white font-sans flex items-center justify-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full bg-[#0C120F] border border-[#1E2C24] rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8"
        >
          {/* Institutional Accreditation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2C24]">
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
            <div className="p-5 rounded-2xl bg-[#121B16] border border-[#2C4034] flex items-center justify-between">
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

            <div className="p-5 rounded-2xl bg-[#121B16] border border-[#2C4034] flex items-center justify-between">
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

            <div className="p-5 rounded-2xl bg-[#121B16] border border-[#2C4034] flex items-center justify-between">
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
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
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
                  className="p-4 rounded-xl bg-[#121B16] border border-[#2C4034] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
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
          <div className="pt-4 border-t border-[#1E2C24] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileCheck className="w-4 h-4 text-[#9DFF00]" />
              <span>Accreditation snapshot cryptographically secured for NAAC 5.2.1 compliance.</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPageLoading(true);
                router.push("/student/dashboard");
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
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
      className="h-screen w-screen select-none bg-[#070B09] text-slate-200 overflow-hidden font-sans flex flex-col"
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
      {/* 1. TOP GLOBAL NAVBAR (Spacious, Aligned, Unified Workspace Layout) */}
      {/* ================================================================= */}
      <header className="h-16 border-b border-[#1E2C24] bg-[#070B09] px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-xs">
        {/* Left: Brand & Exam Pill */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 select-none">
            <Image
              src="/logo.png"
              alt="EQLV CODE"
              width={30}
              height={30}
              priority
              className="w-7 h-7 object-contain rounded-lg flex-shrink-0"
            />
            <span className="inline-flex items-baseline gap-1.5 text-base">
              <span className="font-sans font-black tracking-tight text-white">
                EQLV
              </span>
              <span className="font-mono font-bold tracking-wider text-xs text-[#9DFF00]">
                CODE
              </span>
            </span>
          </div>

          <div className="w-px h-5 bg-[#1E2C24]" />

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-extrabold uppercase bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 tracking-wider">
              Exam
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-slate-300 truncate max-w-sm">
              {assessment.title}
            </span>
          </div>
        </div>

        {/* Center: Live Timer, Auto-Save Status & Anti-Cheat Trust Score */}
        <div className="flex items-center gap-3">
          {/* Live Countdown Timer Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C120F] border border-[#1E2C24] font-mono font-bold text-xs text-white shadow-xs">
            <Clock className={`w-3.5 h-3.5 ${timeLeftSeconds < 300 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Real-time Local Auto-Save Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Saved ({lastSavedTime})</span>
          </div>

          {/* Dynamic Proctor Trust Score Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold shadow-xs transition-colors ${
              trustScore >= 90
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                : trustScore >= 70
                ? "bg-amber-950/40 border-amber-500/30 text-amber-400"
                : "bg-rose-950/40 border-rose-500/40 text-rose-400 animate-pulse"
            }`}
            title={`Proctor Trust Score: ${trustScore}%. Deductions apply on window unfocus or fullscreen exits.`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{trustScore}% Trust Score</span>
          </div>
        </div>

        {/* Right: Question Palette Toggle, Fullscreen Toggle & Submit Exam Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPaletteOpen((p) => !p)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              isPaletteOpen
                ? "bg-[#9DFF00] text-black border-[#9DFF00] shadow-sm"
                : "bg-[#0C120F] text-slate-300 border-[#1E2C24] hover:text-white hover:border-slate-500 hover:bg-[#18241D]"
            }`}
            title="Toggle Question Palette"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Questions ({currentIndex + 1}/{assessment.problems?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={triggerFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#111111] text-xs font-black shadow-[0_0_18px_rgba(157,255,0,0.35)] hover:shadow-[0_0_25px_rgba(157,255,0,0.55)] border border-[#B8FF33] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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

      {/* Session Restored from Local Recovery Banner */}
      {isRestoredFromBackup && (
        <div className="bg-gradient-to-r from-[#0C120F] via-[#121B16] to-[#0C120F] border-b border-[#9DFF00]/35 px-4 py-2 flex items-center justify-between text-xs text-[#9DFF00] font-mono z-30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#9DFF00]" />
            <span>Session Restored: In-progress code and answers recovered from local backup.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsRestoredFromBackup(false)}
            className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. MAIN BODY (Split Workspace Panes)                              */}
      {/* ================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Slide-over Question Palette Drawer when isPaletteOpen is true */}
        {isPaletteOpen && (
          <>
            <button
              type="button"
              aria-label="Close question palette"
              onClick={() => setIsPaletteOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in cursor-default"
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-80 bg-[#0C120F] border-r border-[#1E2C24] shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
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

                {/* Filter Pills: Dynamic All, Answered, Review, Unattempted */}
                {(() => {
                  const allProblems = assessment.problems || [];
                  const answeredCount = allProblems.filter((p) => {
                    const a = answers[p.id];
                    return p.type === "mcq" ? !!a?.selectedOption : (a?.status === "passed" || !!a?.allCasesPassed);
                  }).length;
                  const reviewCount = allProblems.filter((p) => !!answers[p.id]?.isMarkedReview).length;
                  const unattemptedCount = Math.max(0, allProblems.length - answeredCount);
                  const totalCount = allProblems.length;

                  return (
                    <div className="grid grid-cols-4 gap-1 p-1 bg-[#070B09] rounded-xl text-[11px] font-mono border border-[#1E2C24]">
                      <button
                        type="button"
                        onClick={() => setPaletteFilter("ALL")}
                        className={`py-1 px-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          paletteFilter === "ALL"
                            ? "bg-[#9DFF00] text-black shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        All ({totalCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter("ANSWERED")}
                        className={`py-1 px-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          paletteFilter === "ANSWERED"
                            ? "bg-emerald-400 text-black shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Done ({answeredCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter("REVIEW")}
                        className={`py-1 px-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          paletteFilter === "REVIEW"
                            ? "bg-teal-400 text-black shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Review ({reviewCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteFilter("UNATTEMPTED")}
                        className={`py-1 px-1 rounded-lg font-bold text-center transition-all cursor-pointer ${
                          paletteFilter === "UNATTEMPTED"
                            ? "bg-amber-400 text-black shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Pending ({unattemptedCount})
                      </button>
                    </div>
                  );
                })()}

                {/* Tactile Question Circular Pills */}
                <div className="grid grid-cols-5 gap-2.5 pt-1">
                  {(assessment.problems || []).map((prob, idx) => {
                    const isCurrent = idx === currentIndex;
                    const ans = answers[prob.id];
                    const isPassed = ans?.status === "passed" || !!ans?.allCasesPassed;
                    const isFailed = ans?.status === "failed";
                    const isAnswered =
                      prob.type === "mcq"
                        ? !!ans?.selectedOption
                        : isPassed;
                    const isMarked = !!ans?.isMarkedReview;
                    const isUnattempted = !isAnswered && !isMarked;

                    if (paletteFilter === "ANSWERED" && !isAnswered) return null;
                    if (paletteFilter === "REVIEW" && !isMarked) return null;
                    if (paletteFilter === "UNATTEMPTED" && !isUnattempted) return null;
                    if (paletteFilter === "MCQ" && prob.type !== "mcq") return null;
                    if (paletteFilter === "CODING" && prob.type !== "coding") return null;

                    return (
                      <button
                        key={prob.id || idx}
                        onClick={() => {
                          navigateTo(idx);
                          setIsPaletteOpen(false);
                        }}
                        className={`w-10 h-10 rounded-full text-xs font-mono font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                          isCurrent
                            ? "bg-slate-900 text-white ring-2 ring-[#9DFF00] ring-offset-2 ring-offset-[#0C120F]"
                            : isPassed || (prob.type === "mcq" && isAnswered)
                            ? "bg-emerald-950/40 text-emerald-400 border-2 border-emerald-500 font-extrabold"
                            : isFailed
                            ? "bg-rose-950/40 text-rose-400 border-2 border-rose-500 font-extrabold"
                            : isMarked
                            ? "bg-teal-950/40 text-teal-400 border-2 border-teal-400 font-bold"
                            : "bg-[#0C120F] text-slate-400 border border-[#1E2C24] hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {(isPassed || (prob.type === "mcq" && isAnswered)) && !isCurrent && (
                          <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                        {isFailed && !isCurrent && (
                          <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Status Legend */}
                <div className="pt-4 border-t border-[#1E2C24] space-y-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Answered / All Passed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Failed / Marked Wrong</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <span>Not Answered</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E2C24] text-[11px] text-[#85998D] font-mono">
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
            } flex-col border-r border-[#1E2C24] bg-[#070B09] overflow-hidden shrink-0`}
          >
          {/* Subheader: Q. X of Y, Badges & Bookmark */}
          <div className="h-12 border-b border-[#1E2C24] bg-[#0C120F] px-6 flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-white text-sm">
                Q. {currentIndex + 1} of {assessment.problems?.length || 0}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentProblem.type === "coding"
                    ? "bg-sky-950/50 text-sky-400 border border-sky-800/40"
                    : "bg-teal-950/50 text-teal-400 border border-teal-800/40"
                }`}
              >
                {currentProblem.type === "coding" ? "Coding Problem" : "Multiple Choice"}
              </span>
              <span className="text-[#85998D] text-[11px] font-mono">20 pts</span>
            </div>

            <button
              type="button"
              onClick={toggleMarkReview}
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer ${
                answers[currentProblem.id]?.isMarkedReview
                  ? "bg-teal-950/40 text-teal-300 border-teal-400"
                  : "text-slate-400 hover:text-white border-[#1E2C24] hover:bg-white/5"
              }`}
              title="Bookmark for Review"
            >
              <Bookmark className={`w-3.5 h-3.5 ${answers[currentProblem.id]?.isMarkedReview ? "fill-teal-400 text-teal-400" : ""}`} />
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
                  <div className="p-4 rounded-xl bg-[#0C120F]/80 border border-[#1E2C24] font-mono text-xs space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-slate-200">
                        {(currentProblem.test_cases?.[0]?.input || (currentProblem.test_cases?.[0] as unknown as { input_data?: string })?.input_data || "nums = [2, 7, 11, 15], target = 9").replace(/\n/g, ", ")}
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
                <div className="p-3.5 rounded-xl bg-[#0C120F]/60 border border-[#1E2C24] font-mono text-xs text-slate-400 space-y-1">
                  <div className="text-slate-300 font-bold">&gt; Constraints</div>
                  <div>&bull; Linear or near-linear time complexity expected.</div>
                  <div>&bull; Standard memory boundaries apply.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Draggable Resizer Bar */}
        {!isEditorMaximized && (
          <div
            onMouseDown={handleSplitterMouseDown}
            onDoubleClick={() => setLeftWidthPercent(36)}
            className="w-1.5 hover:w-2 bg-[#1E2C24] hover:bg-[#9DFF00] cursor-col-resize transition-all z-10 relative group shrink-0"
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
          ref={rightContainerRef}
          className={`${
            isEditorMaximized ? "w-full" : "flex-1"
          } flex flex-col bg-[#070B09] overflow-hidden min-w-0`}
        >
          {currentProblem.type === "coding" ? (
            /* Coding Problem IDE */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Top Editor Toolbar */}
              <div className="h-12 border-b border-[#1E2C24] bg-[#0C120F] px-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <ObsidianSelect value={String(answers[currentProblem.id]?.language || "python")} onChange={(val) => setAnswers((prev) => ({
                        ...prev,
                        [currentProblem.id]: {
                          ...prev[currentProblem.id],
                          language: val as SupportedLanguage,
                        },
                      }))} options={[{ value: "python", label: "Python 3.11" }]} buttonClassName="bg-[#161D2E] border border-[#232F48] text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#9DFF00] cursor-pointer" />

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161D2E] border border-[#232F48] text-white text-xs font-mono">
                    <span className="font-bold">solution.py</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Auto-saved
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="flex items-center bg-[#131926] border border-[#20293D] rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() =>
                        handleCodeChange(
                          currentProblem.starter_code_json?.python ||
                            "import sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n"
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

                  <div className="w-px h-5 bg-[#1E2C24]" />

                  {/* Highlighted Primary Run Test Button */}
                  <button
                    type="button"
                    onClick={handleTestExamCode}
                    disabled={isTestingCode}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950/70 to-[#152033] hover:from-emerald-900/80 hover:to-[#1c2c47] text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 hover:border-emerald-400 text-xs font-bold shadow-[0_0_14px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Run Test (Shortcut: ⌘↵ / Ctrl+Enter)"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-[#9DFF00] drop-shadow-[0_0_6px_rgba(157,255,0,0.6)]" />
                    <span>{isTestingCode ? "Evaluating..." : "Run Test"}</span>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-mono font-semibold">⌘↵</span>
                  </button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 relative overflow-hidden bg-[#070B09]">
                <Editor
                  height="100%"
                  language="python"
                  theme="vs-dark"
                  value={
                    answers[currentProblem.id]?.code ||
                    currentProblem.starter_code_json?.python ||
                    "import sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n"
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

              {/* Interactive Horizontal Splitter for Output Panel Height Resizing */}
              {!isBottomCollapsed && (
                <div
                  onMouseDown={handleOutputSplitterMouseDown}
                  onDoubleClick={() => setOutputHeight(270)}
                  className="h-2 w-full bg-[#141A28] hover:bg-[#9DFF00] cursor-row-resize transition-colors relative flex items-center justify-center group shrink-0 z-10 select-none"
                  title="Drag up/down to resize test cases height (Double-click to reset to 270px)"
                >
                  <div className="w-10 h-1 bg-slate-600 group-hover:bg-black rounded-full transition-colors" />
                </div>
              )}

              {/* Bottom Test Execution Panel */}
              <div
                style={{ height: isBottomCollapsed ? 40 : outputHeight }}
                className="border-t border-[#1E2C24] bg-[#0C120F] flex flex-col flex-shrink-0 transition-[height] duration-75 overflow-hidden"
              >
                {/* Output Panel Header Bar */}
                <div className="h-10 border-b border-[#1E2C24] px-4 flex items-center justify-between text-xs font-mono flex-shrink-0 bg-[#0C101A]">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab("cases");
                        setIsBottomCollapsed(false);
                      }}
                      className={`font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeBottomTab === "cases"
                          ? "text-[#9DFF00]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>Test Cases ({(currentProblem.test_cases || []).length || 1})</span>
                      {(() => {
                        const results = testCaseResults[currentProblem.id];
                        if (!results || results.length === 0) return null;
                        const passedCount = results.filter((r) => r.passed).length;
                        const allPassed = passedCount === results.length;
                        return (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                              allPassed
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {passedCount}/{results.length} Passed
                          </span>
                        );
                      })()}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab("console");
                        setIsBottomCollapsed(false);
                      }}
                      className={`font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeBottomTab === "console"
                          ? "text-[#9DFF00]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Console &gt;_</span>
                    </button>
                  </div>

                  {/* Panel Height Quick Presets & Collapse Controls */}
                  <div className="flex items-center gap-2.5">
                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#85998D] font-mono">
                      <span>Height:</span>
                      {[180, 270, 400].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            setOutputHeight(h);
                            setIsBottomCollapsed(false);
                          }}
                          className={`px-1.5 py-0.5 rounded transition-colors ${
                            outputHeight === h && !isBottomCollapsed
                              ? "bg-white/10 text-white font-bold"
                              : "text-[#85998D] hover:text-slate-300"
                          }`}
                        >
                          {h}px
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-3.5 bg-slate-800 hidden sm:block" />

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
                </div>

                {/* Output Panel Body */}
                {!isBottomCollapsed && (
                  <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 space-y-3 min-h-0">
                    {activeBottomTab === "cases" ? (
                      <div className="space-y-2.5 h-full flex flex-col justify-between">
                        {/* Overall Test Case Pills & Pass Summary */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2C24] pb-2 flex-shrink-0">
                          <div className="flex items-center gap-2 overflow-x-auto">
                            {(currentProblem.test_cases || []).map((tc, idx) => {
                              const results = testCaseResults[currentProblem.id];
                              const caseRes = results?.[idx];
                              const isSelected = idx === selectedCaseIdx;

                              return (
                                <button
                                  key={tc.id || idx}
                                  type="button"
                                  onClick={() => setSelectedCaseIdx(idx)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#1E2C24] text-white border border-[#9DFF00] shadow-[0_0_10px_rgba(157,255,0,0.15)]"
                                      : "bg-[#0C120F] text-slate-400 hover:text-white border border-[#1E2C24]"
                                  }`}
                                >
                                  {caseRes ? (
                                    caseRes.passed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                    )
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                                  )}
                                  <span>Case {idx + 1}</span>
                                  {tc.is_hidden && <span className="text-[10px] text-[#85998D]"></span>}
                                </button>
                              );
                            })}
                          </div>

                          {(() => {
                            const results = testCaseResults[currentProblem.id];
                            if (!results || results.length === 0) {
                              return (
                                <span className="text-[#85998D] text-[11px] font-sans">
                                  Click &lsquo;Run Test&rsquo; to evaluate all {currentProblem.test_cases?.length || 5} cases.
                                </span>
                              );
                            }
                            const passedCount = results.filter((r) => r.passed).length;
                            const allPassed = passedCount === results.length;

                            return (
                              <span
                                className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border ${
                                  allPassed
                                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                                    : "bg-rose-950/60 text-rose-300 border-rose-700/60"
                                }`}
                              >
                                {passedCount} / {results.length} Test Cases Passed
                              </span>
                            );
                          })()}
                        </div>

                        {/* Selected Case Detail Breakdown (3 Responsive Clean Cards) */}
                        {(() => {
                          const currentCases = currentProblem.test_cases || [];
                          const selectedCase = currentCases[selectedCaseIdx] || currentCases[0];
                          const results = testCaseResults[currentProblem.id];
                          const caseRes = results?.[selectedCaseIdx];

                          if (!selectedCase) {
                            return <div className="text-[#85998D]">No test cases configured.</div>;
                          }

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-0">
                              {/* Input Column Card */}
                              <div className="flex flex-col bg-[#070A10] border border-[#1E2C24] rounded-xl p-3 space-y-1.5 min-h-0">
                                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-1 flex-shrink-0">
                                  <span className="font-bold text-slate-300">Input</span>
                                  <span className="text-[10px] text-[#85998D]">Case {selectedCaseIdx + 1}</span>
                                </div>
                                <pre className="flex-1 min-h-[50px] text-slate-200 font-mono text-xs overflow-auto whitespace-pre-wrap selection:bg-[#9DFF00]/25">
                                  {selectedCase.is_hidden
                                    ? "[Hidden Placement Benchmark Case]"
                                    : selectedCase.input || " - "}
                                </pre>
                              </div>

                              {/* Expected Output Column Card */}
                              <div className="flex flex-col bg-[#070A10] border border-emerald-950/50 rounded-xl p-3 space-y-1.5 min-h-0">
                                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 border-b border-emerald-900/40 pb-1 flex-shrink-0">
                                  <span className="font-bold text-emerald-300">Expected Output</span>
                                  <span className="text-[10px] text-emerald-500">Target</span>
                                </div>
                                <pre className="flex-1 min-h-[50px] text-emerald-300 font-mono text-xs overflow-auto whitespace-pre-wrap selection:bg-emerald-500/30">
                                  {selectedCase.is_hidden
                                    ? "[Hidden Benchmark Output]"
                                    : selectedCase.expected_output || selectedCase.expectedOutput || " - "}
                                </pre>
                              </div>

                              {/* Your Output Column Card */}
                              <div
                                className={`flex flex-col bg-[#070A10] rounded-xl p-3 space-y-1.5 border min-h-0 transition-colors ${
                                  caseRes
                                    ? caseRes.passed
                                      ? "border-emerald-800/50 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                                      : "border-rose-800/50 shadow-[0_0_12px_rgba(244,63,94,0.08)]"
                                    : "border-[#1E2C24]"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800/80 pb-1 flex-shrink-0">
                                  <span className="font-bold text-slate-300">Your Output</span>
                                  {caseRes ? (
                                    <span
                                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                        caseRes.passed
                                          ? "bg-emerald-500/20 text-emerald-300"
                                          : "bg-rose-500/20 text-rose-300"
                                      }`}
                                    >
                                      {caseRes.passed ? "PASS Passed" : "FAIL Failed"}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#85998D]">Not Evaluated</span>
                                  )}
                                </div>
                                <pre
                                  className={`flex-1 min-h-[50px] font-mono text-xs overflow-auto whitespace-pre-wrap ${
                                    caseRes
                                      ? caseRes.passed
                                        ? "text-emerald-300 selection:bg-emerald-500/30"
                                        : "text-rose-300 selection:bg-rose-500/30"
                                      : "text-[#85998D] italic"
                                  }`}
                                >
                                  {caseRes
                                    ? caseRes.actualOutput || "(No stdout produced)"
                                    : "Click 'Run Test' (⌘↵) to evaluate your solution against this case."}
                                </pre>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* Console Tab */
                      <div className="space-y-2 font-mono text-xs h-full flex flex-col justify-between">
                        {(() => {
                          const consoleLog = consoleOutputs[currentProblem.id];

                          return (
                            <>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-[#1E2C24] pb-1.5 flex-shrink-0">
                                <span className="flex items-center gap-1.5">
                                  <Terminal className="w-3.5 h-3.5 text-[#9DFF00]" />
                                  <span>Program Output (stdout)</span>
                                </span>
                                {consoleLog && (
                                  <span className="text-slate-400">
                                    Executed in {consoleLog.executionTimeMs}ms • {consoleLog.passedCount}/{consoleLog.totalCount} Cases Passed
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] font-mono text-xs overflow-auto min-h-0">
                                {consoleLog?.rawStdout ? (
                                  <div className="space-y-2">
                                    <pre className="text-slate-200 whitespace-pre-wrap">{consoleLog.rawStdout}</pre>
                                    {consoleLog.rawStderr && (
                                      <pre className="text-rose-400 whitespace-pre-wrap pt-2 border-t border-rose-900/40">
                                        {consoleLog.rawStderr}
                                      </pre>
                                    )}
                                  </div>
                                ) : consoleLog?.rawStderr ? (
                                  <pre className="text-rose-400 whitespace-pre-wrap">{consoleLog.rawStderr}</pre>
                                ) : (
                                  <div className="text-[#85998D] italic py-4 text-center">
                                    &gt; No console output. Click &lsquo;Run Test&rsquo; (⌘↵) to execute your solution and inspect stdout.
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* MCQ View matching Dark Workspace Design */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#070B09]">
              {/* Top MCQ Toolbar matching Coding Toolbar height */}
              <div className="h-12 border-b border-[#1E2C24] bg-[#0C120F] px-6 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Multiple Choice Selection
                  </span>
                  <span className="text-[#85998D]">&bull;</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Single Choice (1 correct option)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-teal-950/50 text-teal-300 border border-teal-800/50">
                    +20 Points
                  </span>
                </div>
              </div>

              {/* MCQ Options matching unified workspace layout */}
              <div className="flex-1 p-8 sm:p-12 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full flex flex-col justify-center">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Select one correct option:</span>
                  <span className="text-[11px] text-[#85998D] font-mono">1 mark per correct answer</span>
                </div>

                {(currentProblem.mcq_options_json || ["Option A", "Option B", "Option C", "Option D"]).map((optText, optIdx) => {
                  const label = String.fromCharCode(65 + optIdx);
                  const isSelected = answers[currentProblem.id]?.selectedOption === optText;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optText)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group shadow-xs ${
                        isSelected
                          ? "bg-[#9DFF00]/10 border-2 border-[#9DFF00] text-white font-semibold ring-2 ring-[#9DFF00]/25 shadow-[0_0_20px_rgba(157,255,0,0.15)]"
                          : "bg-[#0C120F] border-[#1E2C24] text-slate-200 hover:border-slate-500 hover:bg-[#18241D]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono transition-all shrink-0 ${
                            isSelected
                              ? "bg-[#9DFF00] text-black shadow-sm font-black"
                              : "bg-[#18241D] text-slate-300 border border-[#232F48] group-hover:text-white group-hover:border-slate-500"
                          }`}
                        >
                          {label}
                        </span>
                        <span className="text-sm font-sans leading-relaxed text-slate-200 group-hover:text-white">
                          {optText}
                        </span>
                      </div>
                      <div className="shrink-0 ml-4">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#9DFF00] border-2 border-black flex items-center justify-center shadow-xs">
                            <div className="w-2 h-2 rounded-full bg-black" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Navigation Locked Warning Banner (Full-Width Notification above Footer) */}
    {navBlockedWarning && (
      <div className="mx-6 mb-2 p-3 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 z-30">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">{navBlockedWarning}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTestExamCode}
            disabled={isTestingCode}
            className="px-3 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs cursor-pointer"
          >
            {isTestingCode ? "Evaluating..." : "Run Test Now"}
          </button>
          <button
            type="button"
            onClick={() => handleMarkFailedAndSkip(currentIndex + 1)}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700 font-bold text-xs cursor-pointer"
          >
            Mark as Incorrect &amp; Skip &rarr;
          </button>
        </div>
      </div>
    )}

    {/* Bottom Action Bar - ALWAYS VISIBLE AT BOTTOM SPANNING 100% FULL WIDTH */}
    <footer className="h-16 border-t border-[#1E2C24] bg-[#0C120F] px-6 flex items-center justify-between text-xs flex-shrink-0 z-20">
      {/* Left: Previous Question */}
      <button
        type="button"
        onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
        disabled={currentIndex === 0}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E2C24] bg-[#0C120F] text-slate-300 font-bold hover:text-white hover:bg-[#18241D] hover:border-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>

      {/* Center: Question Progress & Points */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className="text-slate-400 font-mono text-xs">
          Question <strong className="text-white text-sm">{currentIndex + 1}</strong> of {assessment.problems?.length || 0}
        </span>
        <span className="text-[#85998D] hidden sm:inline">&bull;</span>
        <span className="text-[11px] font-mono text-slate-400 uppercase hidden sm:inline">
          {currentProblem.type === "coding" ? "Coding Problem" : "Multiple Choice"} &bull; {currentProblem.difficulty || "Easy"}
        </span>
      </div>

      {/* Right: Actions (Skip / Next Question / Submit Exam) */}
      <div className="flex items-center gap-2.5">
        {navBlockedWarning && (
          <button
            type="button"
            onClick={() => handleMarkFailedAndSkip(currentIndex + 1)}
            className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-mono font-bold transition-all active:scale-[0.98] cursor-pointer"
          >
            Skip Question &rarr;
          </button>
        )}

        {currentIndex >= (assessment.problems?.length || 1) - 1 ? (
          <button
            type="button"
            onClick={() => handleFinalSubmit(false)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-black text-xs transition-all shadow-[0_0_20px_rgba(157,255,0,0.35)] hover:shadow-[0_0_28px_rgba(157,255,0,0.55)] border border-[#B8FF33] active:scale-[0.98] cursor-pointer"
          >
            <span>{isSubmitting ? "Submitting..." : "Submit Exam"}</span>
            <CheckCircle2 className="w-4 h-4 text-black" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleAttemptNext(currentIndex + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-extrabold text-xs transition-all shadow-[0_0_18px_rgba(157,255,0,0.35)] hover:shadow-[0_0_24px_rgba(157,255,0,0.55)] border border-[#B8FF33] active:scale-[0.98] cursor-pointer"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        )}
      </div>
    </footer>

    {isOffline && (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-16 left-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-950/95 border border-amber-500/50 text-amber-200 text-xs font-mono shadow-xl"
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Offline Mode: answers are auto-saved locally ({lastSavedTime}) and will sync on reconnect.</span>
      </div>
    )}
  </div>
);
}

