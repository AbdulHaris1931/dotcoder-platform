"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  CurriculumProblem,
  SupportedLanguage,
  ProblemSubmissionResult,
  TestCaseExecutionResult,
} from "@/types/curriculum";
import { CurriculumStore } from "@/lib/curriculum-store";
import { DataService } from "@/lib/supabase/db";
import { runPythonCode } from "@/lib/pyodide-runner";
import { useSidebar } from "@/components/shared/app-shell";
import { usePageLoading } from "@/components/shared/global-loading-screen";
import { EqAiDrawer } from "@/components/ai/eq-ai-drawer";
import {
  Play,
  CheckCircle2,
  Cpu,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  History,
  ArrowLeft,
  Maximize2,
  Minimize2,
  MessageSquare,
  Settings,
  TrendingUp,
  Target,
  Bookmark,
  Command,
  FileEdit,
  X,
  Code2,
  MoreHorizontal,
} from "lucide-react";

// Dynamically load Monaco Editor without SSR
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#070B09] text-[#85998D] font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse" />
        <span>Loading Monaco Code Engine...</span>
      </div>
    </div>
  ),
});

interface SplitPaneIDEProps {
  problem: CurriculumProblem;
  mode?: "practice" | "assessment";
  onSolveSuccess?: () => void;
  onCodeChange?: (code: string, language: SupportedLanguage) => void;
  conceptNoteMarkdown?: string;
  initialLanguage?: SupportedLanguage;
  topicTitle?: string;
}

interface ServerCaseResultItem {
  caseNumber?: number;
  isHidden?: boolean;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  executionTimeMs?: number;
  failureCategory?: string;
}

export function SplitPaneIDE({
  problem,
  mode = "practice",
  onSolveSuccess,
  onCodeChange,
  conceptNoteMarkdown,
  initialLanguage = "python",
  topicTitle,
}: SplitPaneIDEProps) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { setIsPageLoading } = usePageLoading();

  // All problems for pagination (e.g. Problem 1 of 10)
  const allProblems = useMemo(() => CurriculumStore.getAllProblems(), []);
  const currentIndex = useMemo(() => {
    const idx = allProblems.findIndex(
      (p) => p.id === problem.id || p.slug === problem.slug
    );
    return idx >= 0 ? idx : 0;
  }, [allProblems, problem]);

  const totalProblems = allProblems.length || 10;

  // Selected Language
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  // Active Code buffer
  const [sourceCode, setSourceCode] = useState<string>(
    problem.boilerplate_code[initialLanguage] ||
      problem.boilerplate_code.python ||
      ""
  );

  // Left Pane Active Tab: 'problem' | 'submissions' | 'discussion' | 'hints'
  const [activeLeftTab, setActiveLeftTab] = useState<
    "problem" | "submissions" | "discussion" | "hints"
  >("problem");

  // Right Bottom Pane Tab: 'cases' | 'results' | 'console'
  const [activeBottomTab, setActiveBottomTab] = useState<
    "cases" | "results" | "console"
  >("cases");

  // Bottom pane collapse state
  const [isBottomCollapsed, setIsBottomCollapsed] = useState<boolean>(false);

  // Fullscreen / maximize editor state
  const [isEditorMaximized, setIsEditorMaximized] = useState<boolean>(false);
  const [isDotAiOpen, setIsDotAiOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Click-outside listener for More Options menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMoreMenuOpen]);

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

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Modals & Drawers
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [notesContent, setNotesContent] = useState<string>("");

  // Editor settings state
  const [fontSize, setFontSize] = useState<number>(13);
  const [tabSize, setTabSize] = useState<number>(4);

  // Selected Test Case Pill (1 to 6)
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<number>(1);

  // Progressive Hints Disclosure (Hints 1, 2, 3)
  const [unlockedHints, setUnlockedHints] = useState<{
    hint1: boolean;
    hint2: boolean;
    hint3: boolean;
  }>({
    hint1: false,
    hint2: false,
    hint3: false,
  });

  // Constraints accordion
  const [isConstraintsOpen, setIsConstraintsOpen] = useState<boolean>(true);

  // Execution & Submission State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ProblemSubmissionResult | null>(
    null
  );
  const [executionConsoleLog, setExecutionConsoleLog] = useState<string>("");

  // Submissions History
  const [submissionHistory, setSubmissionHistory] = useState<
    ProblemSubmissionResult[]
  >([]);

  // Load history on mount
  useEffect(() => {
    setSubmissionHistory(CurriculumStore.getSubmissions(problem.id));
    const savedNotes = localStorage.getItem(`dotcoder_notes_${problem.id}`);
    if (savedNotes) setNotesContent(savedNotes);
  }, [problem.id]);

  // Handle problem navigation (Previous / Next)
  const handlePrevProblem = () => {
    if (currentIndex > 0) {
      setIsPageLoading(true);
      const prev = allProblems[currentIndex - 1];
      router.push(`/practice/${prev.slug || prev.id}`);
    }
  };

  const handleNextProblem = () => {
    if (currentIndex < allProblems.length - 1) {
      setIsPageLoading(true);
      const next = allProblems[currentIndex + 1];
      router.push(`/practice/${next.slug || next.id}`);
    }
  };

  // When language changes, update code buffer to boilerplate
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const boilerplate = problem.boilerplate_code[newLang] || "";
    setSourceCode(boilerplate);
    if (onCodeChange) onCodeChange(boilerplate, newLang);
  };

  const handleEditorChange = (val: string | undefined) => {
    const code = val || "";
    setSourceCode(code);
    if (onCodeChange) onCodeChange(code, language);
  };

  const handleResetCode = () => {
    setShowResetConfirm(true);
  };

  const confirmResetCode = () => {
    const boilerplate = problem.boilerplate_code[language] || "";
    setSourceCode(boilerplate);
    if (onCodeChange) onCodeChange(boilerplate, language);
    setShowResetConfirm(false);
  };

  const handleSaveNotes = (val: string) => {
    setNotesContent(val);
    localStorage.setItem(`dotcoder_notes_${problem.id}`, val);
  };

  // Run Code against test cases (Case 1 & Case 2 or visible cases)
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setActiveBottomTab("cases");
    setIsBottomCollapsed(false);

    if (language === "python") {
      // Client-side Pyodide WebAssembly
      const testCases = (problem.test_cases || []).filter(
        (tc) => !tc.is_hidden || tc.case_number <= 2
      );
      const executionResults: TestCaseExecutionResult[] = [];
      let passedCount = 0;
      let logsBuffer = `[Pyodide WASM Engine v0.26.2 Initialized]\nRunning ${testCases.length} assertions...\n\n`;

      for (const tc of testCases) {
        const pyRes = await runPythonCode(sourceCode, tc.input_data, 5000);
        const actualOutput = pyRes.stdout.trim();
        const expected = tc.expected_output.trim();
        const passed = !pyRes.isTLE && !pyRes.stderr && actualOutput === expected;

        if (passed) passedCount++;

        logsBuffer += `[Case ${tc.case_number}] Input: ${tc.input_data.replace(/\n/g, " ")} | Expected: ${expected} | Output: ${actualOutput || "<empty>"} | ${passed ? "PASS" : "FAIL"}\n`;

        executionResults.push({
          case_number: tc.case_number,
          is_hidden: tc.is_hidden,
          passed,
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          actual_output: pyRes.isTLE
            ? pyRes.stderr
            : pyRes.stderr
            ? `Error: ${pyRes.stderr}`
            : actualOutput,
          execution_time_ms: pyRes.executionTimeMs,
          failure_category: tc.failure_category,
        });
      }

      setExecutionConsoleLog(logsBuffer);

      const runRes: ProblemSubmissionResult = {
        submission_id: `run-${Date.now()}`,
        problem_id: problem.id,
        status: passedCount === testCases.length ? "Accepted" : "Wrong Answer",
        passed_cases: passedCount,
        total_cases: testCases.length,
        runtime_ms: executionResults.reduce(
          (acc, r) => Math.max(acc, r.execution_time_ms),
          0
        ),
        memory_kb: 42100,
        results: executionResults,
        submitted_at: new Date().toISOString(),
        submitted_code: sourceCode,
        language,
      };

      setLastResult(runRes);
      setIsRunning(false);
      setSelectedCaseNumber(1);
    } else {
      // Server-side /api/execute for compiled languages
      try {
        const res = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId: problem.id,
            language,
            sourceCode,
            intent: "run",
            testCases: problem.test_cases,
          }),
        });
        const data = await res.json();
        if (res.status === 429) {
          setExecutionConsoleLog(`Warning: RATE LIMIT EXCEEDED:\n${data.message || "Too many code executions. Please wait a few seconds before trying again."}`);
          setActiveBottomTab("console");
          setIsRunning(false);
          return;
        }
        if (data.success) {
          const runRes: ProblemSubmissionResult = {
            submission_id: `run-${Date.now()}`,
            problem_id: problem.id,
            status: data.status,
            passed_cases: data.passedCases,
            total_cases: data.totalCases,
            runtime_ms: data.executionTimeMs,
            memory_kb: 42100,
            results: (data.results || []).map((r: ServerCaseResultItem) => ({
              case_number: r.caseNumber || 1,
              is_hidden: r.isHidden || false,
              passed: r.passed,
              input_data: r.input,
              expected_output: r.expectedOutput,
              actual_output: r.actualOutput,
              execution_time_ms: r.executionTimeMs || 25,
              failure_category: r.failureCategory || "Sample Case",
            })),
            submitted_at: new Date().toISOString(),
            submitted_code: sourceCode,
            language,
          };
          setLastResult(runRes);
          setExecutionConsoleLog(
            `Compiler Execution:\nStatus: ${data.status}\nPassed: ${data.passedCases}/${data.totalCases}\nExecution Time: ${data.executionTimeMs}ms\nStdout: ${data.stdout || ""}`
          );
        }
      } catch {
        const fallback = CurriculumStore.evaluateSubmission(
          problem,
          language,
          sourceCode,
          false
        );
        setLastResult(fallback);
      }
      setIsRunning(false);
      setSelectedCaseNumber(1);
    }
  }, [problem, language, sourceCode]);

  // Submit Code against all test cases
  const handleSubmitCode = useCallback(async () => {
    setIsSubmitting(true);
    setActiveBottomTab("cases");
    setIsBottomCollapsed(false);

    try {
      const user = await DataService.getCurrentUser();
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          sourceCode,
          intent: "submit",
          userId: user?.id,
          testCases: problem.test_cases,
        }),
      });

      const data = await res.json();
      if (res.status === 429) {
        setExecutionConsoleLog(`Warning: RATE LIMIT EXCEEDED:\n${data.message || "Too many submissions. Please wait a few seconds before trying again."}`);
        setActiveBottomTab("console");
        setIsSubmitting(false);
        return;
      }
      if (data.success) {
        const submissionResult: ProblemSubmissionResult = {
          submission_id: `sub-${Date.now()}`,
          problem_id: problem.id,
          status: data.status,
          passed_cases: data.passedCases,
          total_cases: data.totalCases,
          runtime_ms: data.executionTimeMs,
          memory_kb: 42100,
          results: (data.results || []).map((r: ServerCaseResultItem) => ({
            case_number: r.caseNumber || 1,
            is_hidden: r.isHidden || false,
            passed: r.passed,
            input_data: r.input,
            expected_output: r.expectedOutput,
            actual_output: r.actualOutput,
            execution_time_ms: r.executionTimeMs || 25,
            failure_category: r.failureCategory || "Edge Case",
          })),
          submitted_at: new Date().toISOString(),
          submitted_code: sourceCode,
          language,
        };

        CurriculumStore.recordSubmission(submissionResult);
        setLastResult(submissionResult);
        setSubmissionHistory(CurriculumStore.getSubmissions(problem.id));

        if (submissionResult.status === "Accepted" && onSolveSuccess) {
          onSolveSuccess();
        }
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch {
      const res = CurriculumStore.evaluateSubmission(
        problem,
        language,
        sourceCode,
        true
      );
      setLastResult(res);
      setSubmissionHistory(CurriculumStore.getSubmissions(problem.id));

      if (res.status === "Accepted" && onSolveSuccess) {
        onSolveSuccess();
      }
    } finally {
      setIsSubmitting(false);
      setSelectedCaseNumber(1);
    }
  }, [problem, language, sourceCode, onSolveSuccess]);

  // Keyboard Shortcuts: Ctrl+Enter / Cmd+Enter to Run, Ctrl+Shift+Enter / Cmd+Shift+Enter to Submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitCode();
        } else {
          handleRunCode();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleSubmitCode, toggleSidebar]);

  const testCases = problem.test_cases || [];
  const selectedTestCase =
    testCases.find((tc) => tc.case_number === selectedCaseNumber) ||
    testCases[0] || {
      case_number: 1,
      input_data: "2 7 11 15\n9",
      expected_output: "0 1",
      is_hidden: false,
    };

  const selectedCaseResult = lastResult?.results?.find(
    (r) => r.case_number === selectedCaseNumber
  );

  // Format parameter preview for Case 1 (e.g. nums = [2, 7, 11, 15], target = 9)
  const formatInputPreview = (inputStr: string) => {
    const parts = (inputStr || "").split("\n").filter(Boolean);
    if (parts.length >= 2) {
      return `nums = [${parts[0].split(" ").join(", ")}], target = ${parts[1]}`;
    }
    return inputStr.replace(/\n/g, " ");
  };

  return (
    <div className="h-screen w-full bg-[#070B09] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* ================================================================= */}
      {/* 1. TOP GLOBAL NAVBAR (Spacious, Aligned, Mandatory Only)          */}
      {/* ================================================================= */}
      <header className="h-16 border-b border-[#1E2C24] bg-[#070B09] px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-xs">
        {/* Left: Brand Logo & Back to Problem Set */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setIsPageLoading(true);
              router.push("/curriculum");
            }}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
            title="EQLV CODE Platform"
          >
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
          </button>

          <div className="h-5 w-px bg-slate-800" />

          <button
            type="button"
            onClick={() => {
              setIsPageLoading(true);
              router.push("/curriculum");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Return to Problem Set"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Problem Set</span>
          </button>
        </div>

        {/* Center: Problem Navigation Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#121B16] border border-[#20293D] rounded-xl px-2 py-1 shadow-2xs">
          <button
            type="button"
            onClick={handlePrevProblem}
            disabled={currentIndex === 0}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Previous Problem"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-2.5 text-xs font-mono font-bold text-slate-200">
            Problem <span className="text-[#9DFF00]">{currentIndex + 1}</span> of {totalProblems}
          </div>

          <button
            type="button"
            onClick={handleNextProblem}
            disabled={currentIndex >= totalProblems - 1}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Next Problem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Dashboard Link & User Avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsPageLoading(true);
              router.push("/student/dashboard");
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Return to Student Dashboard"
          >
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-full bg-[#9DFF00] hover:bg-[#8CE600] text-black font-extrabold text-xs flex items-center justify-center font-mono shadow-sm cursor-pointer transition-transform active:scale-95"
            title="Account & Main Menu (⌘B)"
          >
            K
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. MAIN BODY (Split Workspace Panes)                               */}
      {/* ================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Panes Container with Adjustable Splitter */}
        <div
          ref={splitContainerRef}
          className={`flex-1 flex overflow-hidden ${
            isDraggingSplitter ? "select-none cursor-col-resize" : ""
          }`}
        >
          {/* =============================================================== */}
          {/* 2A. LEFT WORKSPACE PANE (Problem Description, Examples & Meta)   */}
          {/* =============================================================== */}
          <div
            style={{ width: isEditorMaximized ? "0%" : `${leftWidthPercent}%` }}
            className={`${
              isEditorMaximized ? "hidden" : "flex"
            } flex-col border-r border-[#1E2C24] bg-[#070B09] overflow-hidden shrink-0`}
          >
          {/* Problem Header Section */}
          <div className="p-6 pt-5 pb-3 space-y-3.5 border-b border-[#1E2C24]/80 flex-shrink-0">

            {/* Problem Title */}
            <h1 className="text-xl font-bold text-white tracking-tight leading-snug">
              {problem.title}
            </h1>

            {/* Badges: Difficulty, Acceptance, Solved, Company Tag */}
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  problem.difficulty === "Easy"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                    : problem.difficulty === "Medium"
                    ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                    : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                }`}
              >
                {problem.difficulty}
              </span>

              <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                <span>73.4% Acceptance</span>
              </span>

              <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-slate-400" />
                <span>302K Solved</span>
              </span>

              {problem.company_tags?.[0] && (
                <span className="px-2 py-0.5 rounded bg-[#161D2E] text-slate-300 border border-slate-700/50 text-xs font-mono">
                  {problem.company_tags[0]}
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsBookmarked((b) => !b)}
                className="ml-auto text-slate-400 hover:text-amber-400 p-1 rounded transition-colors cursor-pointer"
                title="Bookmark problem"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isBookmarked ? "fill-amber-400 text-amber-400" : ""
                  }`}
                />
              </button>
            </div>

            {/* Left Sub-Tabs: Problem, Submissions, Discussion, Hints */}
            <div className="flex items-center gap-6 pt-2 border-t border-[#1E2C24]/60 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveLeftTab("problem")}
                className={`pb-2.5 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeLeftTab === "problem"
                    ? "text-[#9DFF00] border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Problem</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTab("submissions")}
                className={`pb-2.5 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeLeftTab === "submissions"
                    ? "text-[#9DFF00] border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Submissions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTab("discussion")}
                className={`pb-2.5 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeLeftTab === "discussion"
                    ? "text-[#9DFF00] border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussion</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTab("hints")}
                className={`pb-2.5 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeLeftTab === "hints"
                    ? "text-[#9DFF00] border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Hints</span>
              </button>
            </div>
          </div>

          {/* Left Tab Body (Scrollable) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-300">
            {/* 1. Problem Tab Content */}
            {activeLeftTab === "problem" && (
              <div className="space-y-6">
                {/* Description Text */}
                <div className="space-y-3 text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                  <p>
                    Given an array of integers{" "}
                    <code className="px-1.5 py-0.5 rounded bg-[#161D2E] text-slate-200 font-mono text-xs border border-white/5">
                      nums
                    </code>{" "}
                    and an integer{" "}
                    <code className="px-1.5 py-0.5 rounded bg-[#161D2E] text-slate-200 font-mono text-xs border border-white/5">
                      target
                    </code>
                    , find the{" "}
                    <strong className="text-white font-semibold">
                      0-based indices
                    </strong>{" "}
                    of the two numbers such that they add up to{" "}
                    <code className="px-1.5 py-0.5 rounded bg-[#161D2E] text-slate-200 font-mono text-xs border border-white/5">
                      target
                    </code>
                    .
                  </p>
                  <p>
                    You may assume that each input has{" "}
                    <strong className="text-white font-semibold">
                      exactly one solution
                    </strong>
                    , and you may not use the same element twice. Return the
                    indices sorted in ascending order.
                  </p>
                </div>

                {/* Input Format Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Input Format
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#9DFF00] mt-1">&bull;</span>
                      <span>
                        <strong className="text-white">Line 1:</strong>{" "}
                        Space-separated integers representing the array{" "}
                        <code className="px-1.5 py-0.5 rounded bg-[#161D2E] text-slate-200 font-mono text-xs">
                          nums
                        </code>
                        .
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#9DFF00] mt-1">&bull;</span>
                      <span>
                        <strong className="text-white">Line 2:</strong> An
                        integer{" "}
                        <code className="px-1.5 py-0.5 rounded bg-[#161D2E] text-slate-200 font-mono text-xs">
                          target
                        </code>
                        .
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Output Format Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Output Format
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#9DFF00] mt-1">&bull;</span>
                      <span>
                        Print two space-separated indices{" "}
                        <code className="px-1.5 py-0.5 rounded bg-[#161D2E] text-slate-200 font-mono text-xs">
                          i j
                        </code>{" "}
                        (
                        <code className="px-1.5 py-0.5 rounded bg-[#161D2E] text-slate-200 font-mono text-xs">
                          i &lt; j
                        </code>
                        ).
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Example 1 Card */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Example 1
                  </h3>
                  <div className="p-4 rounded-xl bg-[#121B16]/80 border border-[#1E2C24] font-mono text-xs space-y-1.5 text-slate-300">
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-slate-200">
                        nums = [2, 7, 11, 15], target = 9
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Output: </span>
                      <span className="text-[#9DFF00]">[0, 1]</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Explanation: </span>
                      <span className="text-slate-300">
                        nums[0] + nums[1] == 2 + 7 = 9
                      </span>
                    </div>
                  </div>
                </div>

                {/* Example 2 Card */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Example 2
                  </h3>
                  <div className="p-4 rounded-xl bg-[#121B16]/80 border border-[#1E2C24] font-mono text-xs space-y-1.5 text-slate-300">
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-slate-200">
                        nums = [3, 2, 4], target = 6
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Output: </span>
                      <span className="text-[#9DFF00]">[1, 2]</span>
                    </div>
                  </div>
                </div>

                {/* Constraints Accordion */}
                <div className="border border-[#1E2C24] rounded-xl overflow-hidden bg-[#121B16]/50">
                  <button
                    type="button"
                    onClick={() => setIsConstraintsOpen((s) => !s)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-[#1A2338]/60 cursor-pointer"
                  >
                    <span className="font-semibold text-slate-200">
                      &gt; Constraints
                    </span>
                    {isConstraintsOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {isConstraintsOpen && (
                    <div className="px-4 pb-3 text-xs font-mono text-slate-400 whitespace-pre-line border-t border-[#1E2C24]/60 pt-2 space-y-1">
                      <div>&bull; 2 &lt;= nums.length &lt;= 10^5</div>
                      <div>&bull; -10^9 &lt;= nums[i] &lt;= 10^9</div>
                      <div>&bull; -10^9 &lt;= target &lt;= 10^9</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Submissions Tab Content */}
            {activeLeftTab === "submissions" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    Submission History ({submissionHistory.length})
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Auto-recorded
                  </span>
                </div>
                {submissionHistory.length === 0 ? (
                  <div className="p-8 text-center text-[#85998D] rounded-xl border border-dashed border-[#1E2C24]">
                    No submissions recorded yet for this problem.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissionHistory.map((sub, sIdx) => (
                      <div
                        key={sub.submission_id || sIdx}
                        className="p-3.5 rounded-xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-between"
                      >
                        <div>
                          <div
                            className={`font-bold ${
                              sub.status === "Accepted"
                                ? "text-[#9DFF00]"
                                : "text-rose-400"
                            }`}
                          >
                            {sub.status}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Passed {sub.passed_cases}/{sub.total_cases} test
                            cases &bull; {sub.runtime_ms}ms
                          </div>
                        </div>
                        <div className="text-[11px] text-[#85998D]">
                          {new Date(sub.submitted_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Discussion Tab Content */}
            {activeLeftTab === "discussion" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#121B16] border border-[#1E2C24] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Top Community Solution: Single-Pass Hash Map
                    </span>
                    <span className="text-[#9DFF00] font-mono font-bold">
                      O(n) Time
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    Store seen numbers in a dictionary mapping `value -&gt;
                    index`. At each step `i`, compute `diff = target - num`. If
                    `diff` exists in seen, return `[seen[diff], i]`.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Progressive Hints Tab */}
            {activeLeftTab === "hints" && (
              <div className="space-y-4">
                <div className="border border-[#1E2C24] rounded-xl bg-[#121B16]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Hint 1: Algorithmic Pattern</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setUnlockedHints((h) => ({ ...h, hint1: !h.hint1 }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 cursor-pointer"
                    >
                      {unlockedHints.hint1 ? "Hide" : "Reveal Hint"}
                    </button>
                  </div>
                  {unlockedHints.hint1 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1E2C24]">
                      {problem.hints?.intuition ||
                        "Instead of nested loops O(N^2), ask: for each number x, what partner value y makes x + y = target?"}
                    </div>
                  )}
                </div>

                <div className="border border-[#1E2C24] rounded-xl bg-[#121B16]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-400" />
                      <span>Hint 2: Data Structure Choice</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setUnlockedHints((h) => ({ ...h, hint2: !h.hint2 }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 cursor-pointer"
                    >
                      {unlockedHints.hint2 ? "Hide" : "Reveal Hint"}
                    </button>
                  </div>
                  {unlockedHints.hint2 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1E2C24]">
                      {problem.hints?.data_structure ||
                        "Use a Hash Table to look up complementary target-num pairs in O(1) time."}
                    </div>
                  )}
                </div>

                {/* Hint 3: Code Scaffold & Implementation Template */}
                <div className="border border-[#1E2C24] rounded-xl bg-[#121B16]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#9DFF00]" />
                      <span>Hint 3: Algorithm Scaffold</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setUnlockedHints((h) => ({ ...h, hint3: !h.hint3 }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 cursor-pointer"
                    >
                      {unlockedHints.hint3 ? "Hide" : "Reveal Hint"}
                    </button>
                  </div>
                  {unlockedHints.hint3 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1E2C24] space-y-2">
                      <p className="text-slate-400">Edge-case traps &amp; boundary considerations:</p>
                      <div className="p-2.5 rounded-lg bg-[#070B09] border border-slate-800 text-[11px] text-emerald-300 whitespace-pre-wrap">
                        {problem.hints?.edge_case_warning ||
                          problem.boilerplate_code?.[language] ||
                          "Watch out for empty inputs, duplicate numbers, and integer overflow with large constraints."}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Left Bottom Pagination Status Bar: <- Previous | Problem X of Y | Next Problem -> */}
          <div className="h-10 border-t border-[#1E2C24] bg-[#0C120F] px-4 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
            <button
              type="button"
              onClick={handlePrevProblem}
              disabled={currentIndex === 0}
              className="hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>&larr; Previous</span>
            </button>
            <span className="text-[#85998D]">
              Problem {currentIndex + 1} of {totalProblems}
            </span>
            <button
              type="button"
              onClick={handleNextProblem}
              disabled={currentIndex >= totalProblems - 1}
              className="hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Next Problem &rarr;</span>
            </button>
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
        {/* 2C. RIGHT WORKSPACE PANE (Editor & Testcases)                   */}
        {/* =============================================================== */}
        <div
          className={`${
            isEditorMaximized ? "w-full" : "flex-1"
          } flex flex-col bg-[#070B09] overflow-hidden min-w-0`}
        >
          {/* Top Editor Toolbar (Language, File Tab, Tools, Run & Submit) */}
          <div className="h-12 border-b border-[#1E2C24] bg-[#0C120F] px-4 flex items-center justify-between flex-shrink-0">
            {/* Left: Language Selector & File Tab */}
            <div className="flex items-center gap-3">
              <ObsidianSelect value={String(language)} onChange={(val) => handleLanguageChange(val as SupportedLanguage)} options={[{ value: "python", label: "Python 3.11" }, { value: "cpp", label: "C++ 17" }, { value: "java", label: "Java 21" }, { value: "c", label: "C (GCC)" }, { value: "sql", label: "SQL (PostgreSQL)" }]} buttonClassName="bg-[#161D2E] border border-[#232F48] text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#9DFF00] cursor-pointer" />

              {/* File Tab with Auto-saved Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161D2E] border border-[#232F48] text-white text-xs font-mono">
                <span className="font-bold">solution.py</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-saved
                </span>
              </div>
            </div>

            {/* Right: Essential Action Buttons (EQ AI, Overflow Menu, Run, Submit) */}
            <div className="flex items-center gap-2">
              {/* EQ AI Socratic Assistant Trigger */}
              <button
                type="button"
                onClick={() => setIsDotAiOpen(!isDotAiOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                  isDotAiOpen
                    ? "bg-[#9DFF00] text-black border-[#9DFF00] shadow-[0_0_12px_rgba(157,255,0,0.35)]"
                    : "bg-[#161D2E] hover:bg-[#1f283e] border-[#9DFF00]/40 text-[#9DFF00] hover:border-[#9DFF00]"
                }`}
                title="Ask EQ AI Socratic Mentor for hints, complexity analysis & edge cases"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>EQ AI</span>
              </button>

              {/* Clean '⋯' Overflow Menu (Reset, Fullscreen, Settings, Shortcuts) */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen((v) => !v)}
                  className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    isMoreMenuOpen
                      ? "bg-white/15 text-white border-slate-500"
                      : "bg-[#121B16] border-[#20293D] text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                  title="More editor tools (Reset, Fullscreen, Shortcuts, Settings)"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#0C120F] border border-[#1E2C24] shadow-2xl p-1.5 z-50 text-xs font-sans space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleResetCode();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reset to Template</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditorMaximized((m) => !m);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                    >
                      {isEditorMaximized ? (
                        <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{isEditorMaximized ? "Restore Split View" : "Maximize Editor"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsModal(true);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Editor Preferences</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowShortcutsModal(true);
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                    >
                      <Command className="w-3.5 h-3.5 text-slate-400" />
                      <span>Shortcuts (⌘K)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-5 bg-[#1E2C24]" />

              {/* Highlighted Primary Run Code Button */}
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950/70 to-[#152033] hover:from-emerald-900/80 hover:to-[#1c2c47] text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 hover:border-emerald-400 text-xs font-bold shadow-[0_0_14px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Shortcut: Ctrl+Enter / ⌘Enter"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#9DFF00]" />
                <span>{isRunning ? "Running..." : "Run"}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-mono font-semibold">⌘↵</span>
              </button>

              {/* Highlighted Signature Lime Submit Button */}
              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-[#111111] text-xs font-extrabold shadow-[0_0_18px_rgba(157,255,0,0.35)] hover:shadow-[0_0_25px_rgba(157,255,0,0.55)] border border-[#B8FF33] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Shortcut: Ctrl+Shift+Enter / ⌘Shift+Enter"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                <span>{isSubmitting ? "Grading..." : "Submit"}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-black/15 text-black font-mono font-bold">⇧⌘↵</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Component */}
          <div className="flex-1 relative overflow-hidden bg-[#070B09]">
            <MonacoEditor
              height="100%"
              language={language === "cpp" ? "cpp" : language === "sql" ? "sql" : language}
              theme="vs-dark"
              value={sourceCode}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize,
                tabSize,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
                fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
              }}
            />
          </div>

          {/* Bottom Test Cases & Console Execution Panel */}
          <div
            className={`border-t border-[#1E2C24] bg-[#0C120F] flex flex-col transition-all duration-200 ${
              isBottomCollapsed ? "h-10" : "h-64"
            } flex-shrink-0`}
          >
            {/* Bottom Pane Header Bar */}
            <div className="h-10 border-b border-[#1E2C24] px-4 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("cases");
                    setIsBottomCollapsed(false);
                  }}
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    activeBottomTab === "cases"
                      ? "text-[#9DFF00]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Test Cases ({testCases.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("results");
                    setIsBottomCollapsed(false);
                  }}
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    activeBottomTab === "results"
                      ? "text-[#9DFF00]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Results</span>
                  {lastResult && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        lastResult.status === "Accepted"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {lastResult.passed_cases}/{lastResult.total_cases}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("console");
                    setIsBottomCollapsed(false);
                  }}
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    activeBottomTab === "console"
                      ? "text-[#9DFF00]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Console &gt;_</span>
                </button>
              </div>

              {/* Collapse/Expand Toggle */}
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

            {/* Bottom Pane Body */}
            {!isBottomCollapsed && (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 space-y-3">
                {/* 1. Test Cases View */}
                {activeBottomTab === "cases" && (
                  <div className="space-y-3">
                    {/* Case Pills Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {testCases.map((tc) => {
                        const isSelected = selectedCaseNumber === tc.case_number;
                        const caseResult = lastResult?.results?.find(
                          (r) => r.case_number === tc.case_number
                        );

                        if (isSelected) {
                          return (
                            <div
                              key={tc.case_number}
                              className="px-3 py-1.5 rounded-lg bg-[#1A2338] border border-[#2B3954] text-white flex items-center gap-2.5 font-mono text-xs shadow-xs"
                            >
                              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Case {tc.case_number}</span>
                              </span>
                              <span className="text-slate-400 text-[11px] font-sans">
                                {formatInputPreview(tc.input_data)}
                              </span>
                              <span className="text-[#85998D] font-sans">
                                Expected:{" "}
                                <span className="text-[#9DFF00]">
                                  {tc.expected_output}
                                </span>
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={tc.case_number}
                            type="button"
                            onClick={() => setSelectedCaseNumber(tc.case_number)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                              caseResult
                                ? caseResult.passed
                                  ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                                  : "bg-rose-950/30 border-rose-800/40 text-rose-300"
                                : "bg-[#121B16] border-[#1E2C24] text-slate-400 hover:text-white"
                            }`}
                          >
                            Case {tc.case_number}
                          </button>
                        );
                      })}
                    </div>

                    {/* Assertion Status Message */}
                    <div className="pt-2 text-xs text-slate-400 font-sans">
                      {lastResult ? (
                        <div className="space-y-2">
                          <div
                            className={`font-mono text-xs font-semibold ${
                              selectedCaseResult?.passed
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {selectedCaseResult?.passed
                              ? `PASS Passed in ${selectedCaseResult.execution_time_ms}ms`
                              : `FAIL Assertion Failed: Expected '${selectedTestCase.expected_output}' but got '${selectedCaseResult?.actual_output}'`}
                          </div>
                          {selectedCaseResult?.actual_output && (
                            <div className="p-3 rounded-lg bg-[#070B09] border border-[#1E2C24] font-mono text-xs text-slate-300">
                              <span className="text-[#85998D]">Output: </span>
                              <span>{selectedCaseResult.actual_output}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>
                          Ready to run. Click &lsquo;Run Code&rsquo; to execute
                          assertions.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Full Results View */}
                {activeBottomTab === "results" && (
                  <div className="space-y-3 font-mono text-xs">
                    {lastResult ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-[#121B16] border border-[#1E2C24] gap-2">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                                lastResult.status === "Accepted"
                                  ? "bg-emerald-500/20 text-[#9DFF00] border border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {lastResult.status}
                            </span>
                            <span className="text-white font-semibold">
                              Passed {lastResult.passed_cases} / {lastResult.total_cases} Cases
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                            <span>Runtime: <strong className="text-white">{lastResult.runtime_ms} ms</strong></span>
                            <span>Memory: <strong className="text-white">{lastResult.memory_kb ? `${Math.round(lastResult.memory_kb / 102.4) / 10} MB` : "14.2 MB"}</strong></span>
                          </div>
                        </div>

                        {/* Visual Pass Rate Progress Bar */}
                        <div className="space-y-1 bg-[#101624] p-3 rounded-xl border border-[#1E2C24]">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Test Suite Completion</span>
                            <span className="text-white font-bold">
                              {Math.round((lastResult.passed_cases / Math.max(lastResult.total_cases, 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                lastResult.status === "Accepted"
                                  ? "bg-gradient-to-r from-emerald-500 to-[#9DFF00]"
                                  : "bg-gradient-to-r from-rose-500 to-amber-500"
                              }`}
                              style={{
                                width: `${Math.round(
                                  (lastResult.passed_cases / Math.max(lastResult.total_cases, 1)) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Interactive Case Results Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                          {lastResult.results.map((r) => (
                            <button
                              key={r.case_number}
                              type="button"
                              onClick={() => {
                                setSelectedCaseNumber(r.case_number);
                                setActiveBottomTab("cases");
                              }}
                              className={`p-2.5 rounded-lg border text-[11px] text-left transition-transform active:scale-95 cursor-pointer ${
                                r.passed
                                  ? "bg-emerald-950/25 border-emerald-800/40 text-emerald-300 hover:border-emerald-500"
                                  : "bg-rose-950/25 border-rose-800/40 text-rose-300 hover:border-rose-500"
                              }`}
                              title="Click to view full input and output assertion details"
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span>Case {r.case_number}</span>
                                <span>{r.passed ? "PASS PASS" : "FAIL FAIL"}</span>
                              </div>
                              <div className="text-[10px] opacity-75 mt-0.5 flex items-center justify-between">
                                <span>{r.execution_time_ms}ms</span>
                                <span className="underline opacity-60">inspect</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#85998D]">
                        No execution results yet. Click &lsquo;Run Code&rsquo; or
                        &lsquo;Submit&rsquo;.
                      </span>
                    )}
                  </div>
                )}

                {/* 3. Console Output View */}
                {activeBottomTab === "console" && (
                  <div className="p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] font-mono text-xs text-slate-300 whitespace-pre-wrap">
                    {executionConsoleLog ||
                      "[Console Ready] Standard output from sys.stdout or print() statements will appear here."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Right Footer: Notes, Solution, AI Star */}
          <footer className="h-10 border-t border-[#1E2C24] bg-[#070B09] px-4 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
            <div className="text-[11px] font-mono text-[#85998D]">
              EQLV Engine &bull; Zero-Latency Execution
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowNotesDrawer(true)}
                className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTab("discussion")}
                className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Solution</span>
              </button>

              {/* Four-Pointed AI Assistant Sparkle Icon */}
              <button
                type="button"
                onClick={() => setIsDotAiOpen(!isDotAiOpen)}
                className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-[#9DFF00] hover:text-white border border-[#9DFF00]/30 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="Open EQ AI Socratic Assistant & Hints"
              >
                <Sparkles className="w-4 h-4 fill-current" />
              </button>
            </div>
          </footer>
        </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. MODALS & DRAWERS (Reset Confirm, Settings, Shortcuts, Notes)     */}
      {/* ================================================================= */}

      {/* Styled Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#121B16] border border-[#1E2C24] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Reset Editor Code?</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Restore default {language.toUpperCase()} boilerplate. All current
                  modifications will be lost.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetCode}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#121B16] border border-[#1E2C24] rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Settings className="w-4 h-4 text-[#9DFF00]" />
                <span>Editor Preferences</span>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Font Size</div>
                  <div className="text-[11px] text-slate-400">
                    Adjust code font scale
                  </div>
                </div>
                <ObsidianSelect value={String(fontSize)} onChange={(val) => setFontSize(Number(val))} options={[{ value: String(12), label: "12px" }, { value: String(13), label: "13px (Default)" }, { value: String(14), label: "14px" }, { value: String(16), label: "16px" }]} buttonClassName="bg-[#070B09] border border-[#1E2C24] text-white px-2.5 py-1 rounded-lg" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Tab Spacing</div>
                  <div className="text-[11px] text-slate-400">
                    Indent character width
                  </div>
                </div>
                <ObsidianSelect value={String(tabSize)} onChange={(val) => setTabSize(Number(val))} options={[{ value: String(2), label: "2 Spaces" }, { value: String(4), label: "4 Spaces (Standard)" }]} buttonClassName="bg-[#070B09] border border-[#1E2C24] text-white px-2.5 py-1 rounded-lg" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#9DFF00] text-black font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#121B16] border border-[#1E2C24] rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Command className="w-4 h-4 text-[#9DFF00]" />
                <span>Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B09]">
                <span className="text-slate-300">Run Assertions</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                  Ctrl / ⌘ + Enter
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B09]">
                <span className="text-slate-300">Submit Code</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                  Ctrl / ⌘ + Shift + Enter
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B09]">
                <span className="text-slate-300">Toggle Main Menu</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                  Ctrl / ⌘ + B
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B09]">
                <span className="text-slate-300">Command Palette</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                  Ctrl / ⌘ + K
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#9DFF00] text-black font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Notes Drawer */}
      {showNotesDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-[#0C120F] border-l border-[#1E2C24] shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <FileEdit className="w-4 h-4 text-[#9DFF00]" />
                <span>Scratchpad Notes</span>
              </div>
              <button
                onClick={() => setShowNotesDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={notesContent}
              onChange={(e) => handleSaveNotes(e.target.value)}
              placeholder="Jot down time complexity observations, edge case ideas, or pseudocode..."
              className="w-full h-80 p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs font-mono text-slate-200 placeholder:text-[#85998D] focus:outline-none focus:ring-1 focus:ring-[#9DFF00] resize-none"
            />
          </div>

          <div className="text-[11px] text-[#85998D] font-mono flex items-center justify-between pt-3 border-t border-[#1E2C24]">
            <span>Auto-saved to local browser storage</span>
            <button
              onClick={() => setShowNotesDrawer(false)}
              className="text-[#9DFF00] font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* EQ AI Socratic Assistant Drawer */}
      <EqAiDrawer
        isOpen={isDotAiOpen}
        onClose={() => setIsDotAiOpen(false)}
        activeCode={sourceCode}
        language={language}
        problemTitle={problem.title}
        problemDescription={problem.description_markdown}
        isExamMode={mode === "assessment"}
      />
    </div>
  );
}
