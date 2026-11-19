"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  CurriculumProblem,
  CurriculumTestCase,
  SupportedLanguage,
  ProblemSubmissionResult,
  TestCaseExecutionResult,
} from "@/types/curriculum";
import { CurriculumStore } from "@/lib/curriculum-store";
import { runPythonCode } from "@/lib/pyodide-runner";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Cpu,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  BookOpen,
  Lightbulb,
  History,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
  Eye,
  Lock,
  Search,
  SlidersHorizontal,
  Bookmark,
  Home,
  Code2,
  BarChart3,
  Trophy,
  Settings,
  Flame,
  Bell,
  Copy,
  Check,
  StickyNote,
  X,
  MessageSquare,
  TrendingUp,
  HardDrive,
} from "lucide-react";

// Dynamically load Monaco Editor without SSR
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0B0F17] text-slate-500 font-mono text-xs">
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

  // Navigation / Drawer state
  const [isProblemSetOpen, setIsProblemSetOpen] = useState<boolean>(true);
  const [problemSearchQuery, setProblemSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "Easy" | "Medium" | "Hard">("ALL");

  // All problems catalog
  const [allProblems, setAllProblems] = useState<CurriculumProblem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(["prob-1-1-1-1"]));

  // Selected Language
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  // Active Code buffer
  const [sourceCode, setSourceCode] = useState<string>(
    problem.boilerplate_code[initialLanguage] || problem.boilerplate_code.python || ""
  );

  // Tabs
  const [activeLeftTab, setActiveLeftTab] = useState<"problem" | "submissions" | "discussion" | "hints">("problem");
  const [activeRightTab, setActiveRightTab] = useState<"output" | "testcases">("output");

  // Output execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ProblemSubmissionResult | null>(null);
  const [showConsoleDrawer, setShowConsoleDrawer] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [personalNotes, setPersonalNotes] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Progressive Hints
  const [unlockedHints, setUnlockedHints] = useState<{ hint1: boolean; hint2: boolean; hint3: boolean }>({
    hint1: false,
    hint2: false,
    hint3: false,
  });

  // Load all problems & submissions on mount
  useEffect(() => {
    const list = CurriculumStore.getAllProblems();
    setAllProblems(list);

    // Load saved bookmarks & notes
    if (typeof window !== "undefined") {
      try {
        const savedBm = localStorage.getItem("dotcoder_bookmarked_problems");
        if (savedBm) setBookmarkedIds(new Set(JSON.parse(savedBm)));

        const savedNotes = localStorage.getItem(`dotcoder_notes_${problem.id}`);
        if (savedNotes) setPersonalNotes(savedNotes);
      } catch (e) {
        console.error(e);
      }
    }
  }, [problem.id]);

  // Sync boilerplate when problem changes
  useEffect(() => {
    const boilerplate = problem.boilerplate_code[language] || problem.boilerplate_code.python || "";
    setSourceCode(boilerplate);
    setLastResult(null);
  }, [problem, language]);

  // Toggle bookmark helper
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (typeof window !== "undefined") {
        localStorage.setItem("dotcoder_bookmarked_problems", JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      if (difficultyFilter !== "ALL" && p.difficulty !== difficultyFilter) return false;
      if (problemSearchQuery.trim()) {
        const q = problemSearchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.company_tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allProblems, difficultyFilter, problemSearchQuery]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const easy = allProblems.filter((p) => p.difficulty === "Easy").length;
    const medium = allProblems.filter((p) => p.difficulty === "Medium").length;
    const hard = allProblems.filter((p) => p.difficulty === "Hard").length;
    return { all: allProblems.length || 324, easy: easy || 128, medium: medium || 142, hard: hard || 54 };
  }, [allProblems]);

  const currentProblemIndex = useMemo(() => {
    const idx = allProblems.findIndex((p) => p.id === problem.id || p.slug === problem.slug);
    return idx >= 0 ? idx : 0;
  }, [allProblems, problem]);

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

  const handleResetCode = () => setShowResetConfirm(true);

  const confirmResetCode = () => {
    const boilerplate = problem.boilerplate_code[language] || "";
    setSourceCode(boilerplate);
    if (onCodeChange) onCodeChange(boilerplate, language);
    setShowResetConfirm(false);
  };

  // Save personal notes
  const handleSaveNotes = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`dotcoder_notes_${problem.id}`, personalNotes);
    }
    setShowNotesModal(false);
  };

  // Navigate to Next Problem
  const handleNextProblem = () => {
    if (allProblems.length === 0) return;
    const nextIdx = (currentProblemIndex + 1) % allProblems.length;
    const nextProb = allProblems[nextIdx];
    if (nextProb) {
      router.push(`/practice/${nextProb.slug}`);
    }
  };

  // Navigate to Previous Problem
  const handlePrevProblem = () => {
    if (allProblems.length === 0) return;
    const prevIdx = (currentProblemIndex - 1 + allProblems.length) % allProblems.length;
    const prevProb = allProblems[prevIdx];
    if (prevProb) {
      router.push(`/practice/${prevProb.slug}`);
    }
  };

  // Run Code against visible test cases
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setActiveRightTab("output");

    const testCases = (problem.test_cases || []).filter((tc) => !tc.is_hidden || tc.case_number <= 2);
    const executionResults: TestCaseExecutionResult[] = [];
    let passedCount = 0;

    if (language === "python") {
      for (const tc of testCases) {
        const pyRes = await runPythonCode(sourceCode, tc.input_data, 5000);
        const actualOutput = pyRes.stdout.trim();
        const expected = tc.expected_output.trim();
        const passed = !pyRes.isTLE && !pyRes.stderr && actualOutput === expected;

        if (passed) passedCount++;

        executionResults.push({
          case_number: tc.case_number,
          is_hidden: tc.is_hidden,
          passed,
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          actual_output: pyRes.isTLE ? pyRes.stderr : pyRes.stderr ? `Error: ${pyRes.stderr}` : actualOutput,
          execution_time_ms: pyRes.executionTimeMs || 4,
          failure_category: tc.failure_category,
        });
      }

      const runRes: ProblemSubmissionResult = {
        submission_id: `run-${Date.now()}`,
        problem_id: problem.id,
        status: passedCount === testCases.length ? "Accepted" : "Wrong Answer",
        passed_cases: passedCount,
        total_cases: testCases.length,
        runtime_ms: executionResults.reduce((acc, r) => Math.max(acc, r.execution_time_ms), 0) || 46,
        memory_kb: 14200,
        results: executionResults,
        submitted_at: new Date().toISOString(),
        submitted_code: sourceCode,
        language,
      };

      setLastResult(runRes);
    } else {
      // Deterministic evaluation for compiled languages
      const evalRes = CurriculumStore.evaluateSubmission(problem, language, sourceCode, false);
      setLastResult(evalRes);
    }

    setIsRunning(false);
  }, [language, problem, sourceCode]);

  // Submit Code against all test cases
  const handleSubmitCode = useCallback(async () => {
    setIsSubmitting(true);
    setActiveRightTab("output");

    const testCases = problem.test_cases || [];
    const executionResults: TestCaseExecutionResult[] = [];
    let passedCount = 0;

    if (language === "python") {
      for (const tc of testCases) {
        const pyRes = await runPythonCode(sourceCode, tc.input_data, 5000);
        const actualOutput = pyRes.stdout.trim();
        const expected = tc.expected_output.trim();
        const passed = !pyRes.isTLE && !pyRes.stderr && actualOutput === expected;

        if (passed) passedCount++;

        executionResults.push({
          case_number: tc.case_number,
          is_hidden: tc.is_hidden,
          passed,
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          actual_output: pyRes.isTLE ? pyRes.stderr : pyRes.stderr ? `Error: ${pyRes.stderr}` : actualOutput,
          execution_time_ms: pyRes.executionTimeMs || 5,
          failure_category: tc.failure_category,
        });
      }

      const isAllPassed = passedCount === testCases.length;
      const subResult: ProblemSubmissionResult = {
        submission_id: `sub-${Date.now()}`,
        problem_id: problem.id,
        status: isAllPassed ? "Accepted" : "Wrong Answer",
        passed_cases: passedCount,
        total_cases: testCases.length,
        runtime_ms: 46,
        memory_kb: 14200,
        results: executionResults,
        submitted_at: new Date().toISOString(),
        submitted_code: sourceCode,
        language,
      };

      CurriculumStore.recordSubmission(subResult);
      setLastResult(subResult);

      if (isAllPassed && onSolveSuccess) {
        onSolveSuccess();
      }
    } else {
      const evalRes = CurriculumStore.evaluateSubmission(problem, language, sourceCode, true);
      CurriculumStore.recordSubmission(evalRes);
      setLastResult(evalRes);
      if (evalRes.status === "Accepted" && onSolveSuccess) {
        onSolveSuccess();
      }
    }

    setIsSubmitting(false);
  }, [language, problem, sourceCode, onSolveSuccess]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitCode();
        } else {
          handleRunCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleSubmitCode]);

  // Test cases data
  const testCases = problem.test_cases || [];

  return (
    <div className="h-screen w-screen bg-[#0C1017] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP GLOBAL NAVIGATION BAR (Exact Match to Figma & UI Reference)       */}
      {/* ========================================================================= */}
      <header className="h-14 border-b border-[#1A2332] bg-[#0E131F] px-4 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Brand & DotLab Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-[#9DFF00] text-black flex items-center justify-center font-mono font-black text-sm">
              &lt;/&gt;
            </div>
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              DotCoder
            </span>
          </button>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#132B1A] text-[#9DFF00] border border-[#1F4526] shadow-xs">
            DotLab
          </span>
        </div>

        {/* Center: Practice, Contests, Assessments, Interview Prep Tabs */}
        <nav className="hidden md:flex items-center gap-1 font-sans text-xs">
          <button
            type="button"
            className="px-3.5 py-2 font-bold text-white border-b-2 border-[#9DFF00] transition-colors"
          >
            Practice
          </button>
          <button
            type="button"
            onClick={() => router.push("/student/dashboard#contests")}
            className="px-3.5 py-2 font-medium text-slate-400 hover:text-white transition-colors"
          >
            Contests
          </button>
          <button
            type="button"
            onClick={() => router.push("/student/exam/assessment-1")}
            className="px-3.5 py-2 font-medium text-slate-400 hover:text-white transition-colors"
          >
            Assessments
          </button>
          <button
            type="button"
            onClick={() => router.push("/student/simulator")}
            className="px-3.5 py-2 font-medium text-slate-400 hover:text-white transition-colors"
          >
            Interview Prep
          </button>
        </nav>

        {/* Right: Streak, Notification Bell & User Avatar */}
        <div className="flex items-center gap-3">
          {/* 12 Day Streak Badge */}
          <div className="px-3 py-1.5 rounded-full bg-[#161D27] border border-[#212C3D] flex items-center gap-1.5 text-xs font-semibold text-white shadow-xs">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-mono">12 Day Streak</span>
          </div>

          {/* Bell Icon */}
          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#9DFF00]" />
          </button>

          {/* User Avatar Circle */}
          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="w-8 h-8 rounded-full bg-[#B5F500] text-black font-extrabold font-mono text-xs flex items-center justify-center shadow-md active:scale-95 transition-transform"
            title="Karthik S. (Student)"
          >
            K
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CANVAS (Slim Rail + Problem Drawer + IDE + Output)     */}
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

            {/* Active Code Icon */}
            <button
              type="button"
              className="p-2 rounded-xl bg-[#B5F500] text-black shadow-md shadow-[#9DFF00]/10"
              title="Coding Workspace"
            >
              <Code2 className="w-5 h-5 text-black" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/student/dashboard#progress")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Progress & Skill Vectors"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/student/drives")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Recruitment & Contests"
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
        {/* 2.2 COLLAPSIBLE PROBLEM SET DRAWER (300px)                             */}
        {/* ----------------------------------------------------------------------- */}
        {isProblemSetOpen && (
          <aside className="w-[300px] bg-[#0E131E] border-r border-[#1A2332] flex flex-col justify-between flex-shrink-0 animate-in slide-in-from-left duration-200 z-10">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header: < Problem Set */}
              <div className="p-3.5 border-b border-[#1A2332] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsProblemSetOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#9DFF00] transition-colors"
                  title="Collapse Problem Set"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  <span>Problem Set</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500">
                  {filteredProblems.length} available
                </span>
              </div>

              {/* Search & Filter Controls */}
              <div className="p-3 space-y-2.5 border-b border-[#1A2332]">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search problems..."
                      value={problemSearchQuery}
                      onChange={(e) => setProblemSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#141A26] border border-[#1F293D] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#9DFF00] transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDifficultyFilter("ALL")}
                    className="p-1.5 rounded-xl border border-[#1F293D] bg-[#141A26] text-slate-400 hover:text-white"
                    title="Reset Filter"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Difficulty Pills: All, Easy, Medium, Hard */}
                <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                  {(["ALL", "Easy", "Medium", "Hard"] as const).map((diff) => {
                    const count =
                      diff === "ALL"
                        ? counts.all
                        : diff === "Easy"
                        ? counts.easy
                        : diff === "Medium"
                        ? counts.medium
                        : counts.hard;
                    const isSelected = difficultyFilter === diff;

                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficultyFilter(diff)}
                        className={`py-1 rounded-lg font-bold text-center transition-all ${
                          isSelected
                            ? "bg-[#B5F500] text-black shadow-xs"
                            : "bg-[#141A26] text-slate-400 hover:text-white border border-[#1F293D]"
                        }`}
                      >
                        {diff === "ALL" ? `All (${count})` : `${diff} (${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Problem Items List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredProblems.map((p) => {
                  const isActive = p.id === problem.id || p.slug === problem.slug;
                  const isBookmarked = bookmarkedIds.has(p.id);

                  if (isActive) {
                    return (
                      <div
                        key={p.id}
                        className="bg-[#B5F500] text-black rounded-2xl p-3 shadow-md flex items-start justify-between cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                            <h4 className="font-bold text-xs font-sans truncate text-black">
                              {p.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded-full bg-black/10 text-black font-semibold">
                              {p.difficulty}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/10 text-black">
                              {p.company_tags[0] || "Array"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(p.id, e)}
                          className="text-black hover:opacity-75 p-1"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-black" : ""}`} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={p.id}
                      onClick={() => router.push(`/practice/${p.slug}`)}
                      className="bg-[#121824]/60 hover:bg-[#161F2E] border border-transparent hover:border-[#212C3D] rounded-2xl p-3 transition-all cursor-pointer flex items-start justify-between group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Check
                            className={`w-3.5 h-3.5 ${
                              p.is_solved ? "text-[#9DFF00] stroke-[2.5]" : "text-slate-600"
                            }`}
                          />
                          <h4 className="font-semibold text-xs text-white truncate group-hover:text-[#9DFF00] transition-colors">
                            {p.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold ${
                              p.difficulty === "Easy"
                                ? "bg-[#132B1D] text-[#4ADE80]"
                                : p.difficulty === "Medium"
                                ? "bg-[#2D2312] text-amber-400"
                                : "bg-[#2E1417] text-rose-400"
                            }`}
                          >
                            {p.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#182030] text-slate-400">
                            {p.company_tags[0] || "Data Structure"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(p.id, e)}
                        className="text-slate-500 hover:text-white p-1"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-[#9DFF00] text-[#9DFF00]" : ""}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Drawer Bar: < > Problem 1 of N */}
            <div className="p-3 border-t border-[#1A2332] flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevProblem}
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextProblem}
                  className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <span>
                Problem {currentProblemIndex + 1} of {allProblems.length}
              </span>
            </div>
          </aside>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* 2.3 PROBLEM SPECIFICATION & DESCRIPTION PANE (Middle-Left)             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex-1 min-w-[340px] max-w-[420px] lg:max-w-[460px] border-r border-[#1A2332] bg-[#0E131E] flex flex-col overflow-hidden">
          {/* Tabs: Problem, Submissions, Discussion, Hints */}
          <div className="h-10 border-b border-[#1A2332] px-4 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-4">
              {!isProblemSetOpen && (
                <button
                  type="button"
                  onClick={() => setIsProblemSetOpen(true)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 mr-1"
                  title="Expand Problem Set"
                >
                  <ChevronRight className="w-4 h-4 text-[#9DFF00]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveLeftTab("problem")}
                className={`py-2.5 font-bold transition-all relative ${
                  activeLeftTab === "problem"
                    ? "text-white border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Problem
              </button>
              <button
                type="button"
                onClick={() => setActiveLeftTab("submissions")}
                className={`py-2.5 font-medium transition-all ${
                  activeLeftTab === "submissions"
                    ? "text-white border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Submissions
              </button>
              <button
                type="button"
                onClick={() => setActiveLeftTab("discussion")}
                className={`py-2.5 font-medium transition-all ${
                  activeLeftTab === "discussion"
                    ? "text-white border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Discussion
              </button>
              <button
                type="button"
                onClick={() => setActiveLeftTab("hints")}
                className={`py-2.5 font-medium transition-all flex items-center gap-1 ${
                  activeLeftTab === "hints"
                    ? "text-white border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Hints</span>
              </button>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-300">
            {activeLeftTab === "problem" && (
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {problem.title}
                  </h1>

                  {/* Badges Row: Easy, 73.4% Acceptance, 302K Solved */}
                  <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold ${
                        problem.difficulty === "Easy"
                          ? "bg-[#132B1D] text-[#4ADE80] border border-[#1D4A2B]"
                          : problem.difficulty === "Medium"
                          ? "bg-[#2D2312] text-amber-400 border border-[#48371B]"
                          : "bg-[#2E1417] text-rose-400 border border-[#4D2126]"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>73.4% Acceptance</span>
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>302K Solved</span>
                    </span>
                  </div>
                </div>

                {/* Problem Description with Markdown rendering */}
                <div className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                  <MarkdownRenderer
                    content={
                      problem.description_markdown ||
                      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice."
                    }
                  />
                </div>

                {/* Example 1 Block */}
                <div className="space-y-1.5 font-mono text-xs">
                  <span className="font-bold text-white font-sans text-xs">Example 1:</span>
                  <div className="p-3.5 rounded-xl bg-[#141A26] border border-[#1F293D] space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-400 font-semibold">Input: </span>
                      <span className="text-emerald-300">
                        {testCases[0]?.input_data ? `nums = [${testCases[0].input_data.replace("\n", "], target = ")}` : "nums = [2, 7, 11, 15], target = 9"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Output: </span>
                      <span className="text-[#9DFF00]">
                        {testCases[0]?.expected_output ? `[${testCases[0].expected_output.replace(" ", ", ")}]` : "[0, 1]"}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] pt-1">
                      Explanation: nums[0] + nums[1] == 2 + 7 = 9
                    </div>
                  </div>
                </div>

                {/* Example 2 Block */}
                {testCases[1] && (
                  <div className="space-y-1.5 font-mono text-xs">
                    <span className="font-bold text-white font-sans text-xs">Example 2:</span>
                    <div className="p-3.5 rounded-xl bg-[#141A26] border border-[#1F293D] space-y-1 text-slate-300">
                      <div>
                        <span className="text-slate-400 font-semibold">Input: </span>
                        <span className="text-emerald-300">
                          {`nums = [${testCases[1].input_data.replace("\n", "], target = ")}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Output: </span>
                        <span className="text-[#9DFF00]">
                          {`[${testCases[1].expected_output.replace(" ", ", ")}]`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Constraints Block */}
                <div className="space-y-1.5 font-mono text-xs">
                  <span className="font-bold text-white font-sans text-xs">Constraints:</span>
                  <div className="p-3 rounded-xl bg-[#141A26]/50 border border-[#1F293D] space-y-1 text-slate-300 text-[11px]">
                    <div>&bull; 2 &le; nums.length &le; 10<sup>4</sup></div>
                    <div>&bull; -10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></div>
                    <div>&bull; -10<sup>9</sup> &le; target &le; 10<sup>9</sup></div>
                    <div>&bull; Exactly one solution exists.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submissions Tab */}
            {activeLeftTab === "submissions" && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-xs font-sans text-slate-400">
                  Past Submissions & Benchmark Records
                </div>
                {lastResult ? (
                  <div className="p-3 rounded-xl bg-[#141A26] border border-[#1F293D] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#9DFF00]" />
                        <span>Accepted</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">Just now</span>
                    </div>
                    <div className="text-slate-300 text-[11px] flex items-center gap-4">
                      <span>Runtime: {lastResult.runtime_ms} ms</span>
                      <span>Memory: {(lastResult.memory_kb / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 font-sans">
                    No submissions logged for this problem yet. Run and submit your solution!
                  </div>
                )}
              </div>
            )}

            {/* Discussion Tab */}
            {activeLeftTab === "discussion" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A2332]">
                  <span className="font-bold text-white">Community Discussions</span>
                  <span className="text-slate-500 font-mono">14 Threads</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141A26] border border-[#1F293D] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#9DFF00]">Optimal O(N) Hash Map in Python</span>
                    <span className="text-slate-400 font-mono">2 days ago</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    Instead of checking every pair with nested loops O(N^2), use a single dictionary mapping number to index. Lookups are O(1) average time!
                  </p>
                </div>
              </div>
            )}

            {/* Hints Tab */}
            {activeLeftTab === "hints" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="text-slate-400 font-mono text-[11px]">
                  Progressive hints guide your problem-solving process without revealing the full solution.
                </div>

                <div className="border border-[#1F293D] rounded-xl bg-[#141A26] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Hint 1: Algorithmic Pattern</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnlockedHints((h) => ({ ...h, hint1: !h.hint1 }))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 transition-colors flex items-center gap-1"
                    >
                      {unlockedHints.hint1 ? <Eye className="w-3 h-3 text-[#9DFF00]" /> : <Lock className="w-3 h-3 text-slate-400" />}
                      <span>{unlockedHints.hint1 ? "Hide" : "Reveal Hint"}</span>
                    </button>
                  </div>
                  {unlockedHints.hint1 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1F293D]">
                      {problem.hints?.intuition || "Instead of checking every pair with nested loops O(N^2), ask: for each number x, what partner value y would make x + y = target?"}
                    </div>
                  )}
                </div>

                <div className="border border-[#1F293D] rounded-xl bg-[#141A26] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-400" />
                      <span>Hint 2: Data Structure Choice</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnlockedHints((h) => ({ ...h, hint2: !h.hint2 }))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 transition-colors flex items-center gap-1"
                    >
                      {unlockedHints.hint2 ? <Eye className="w-3 h-3 text-[#9DFF00]" /> : <Lock className="w-3 h-3 text-slate-400" />}
                      <span>{unlockedHints.hint2 ? "Hide" : "Reveal Hint"}</span>
                    </button>
                  </div>
                  {unlockedHints.hint2 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1F293D]">
                      {problem.hints?.data_structure || "Use a Hash Map to store previously visited elements as {element_value: index}. As you iterate, check if (target - num) exists in O(1)."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 2.4 MONACO CODE EDITOR PANE (Center-Right)                             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col bg-[#0B0F17] overflow-hidden">
          {/* Editor Header Toolbar matching UI Screenshot */}
          <div className="h-10 border-b border-[#1A2332] bg-[#0E131E] px-4 flex items-center justify-between flex-shrink-0">
            {/* Left: Language Selector */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-[#141A26] border border-[#1F293D] text-white text-xs font-mono font-semibold rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#9DFF00] cursor-pointer"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
            </div>

            {/* Right: Window Controls, Reset, Run, Submit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors mr-1"
                title="Toggle Fullscreen Editor"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Reset Code Button */}
              <button
                type="button"
                onClick={handleResetCode}
                className="p-1.5 rounded-lg border border-[#1F293D] bg-[#141A26] text-slate-400 hover:text-white transition-colors"
                title="Reset boilerplate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Run Button (Outline) */}
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1 rounded-xl bg-[#141A26] hover:bg-[#1A2338] border border-[#212C3D] text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3 h-3 text-white fill-current" />
                <span>{isRunning ? "Running..." : "Run"}</span>
              </button>

              {/* Submit Button (Bright Lime Solid) */}
              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1 rounded-xl bg-[#B5F500] hover:bg-[#A3E635] text-black text-xs font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                <span>{isSubmitting ? "Grading..." : "Submit"}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 overflow-hidden relative">
            <MonacoEditor
              height="100%"
              language={language === "cpp" ? "cpp" : language === "sql" ? "sql" : "python"}
              theme="vs-dark"
              value={sourceCode}
              onChange={handleEditorChange}
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
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* 2.5 EXECUTION OUTPUT & TEST CASES PANE (Far Right)                     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-[320px] lg:w-[360px] border-l border-[#1A2332] bg-[#0E131E] flex flex-col flex-shrink-0 overflow-hidden">
          {/* Header Tabs: Output vs Test Cases (4) */}
          <div className="h-10 border-b border-[#1A2332] px-4 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveRightTab("output")}
                className={`py-2.5 font-bold transition-all ${
                  activeRightTab === "output"
                    ? "text-white border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Output
              </button>
              <button
                type="button"
                onClick={() => setActiveRightTab("testcases")}
                className={`py-2.5 font-medium transition-all ${
                  activeRightTab === "testcases"
                    ? "text-white border-b-2 border-[#9DFF00]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Test Cases ({testCases.length})
              </button>
            </div>
          </div>

          {/* Output Content Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {lastResult ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Result Status Banner: Accepted / Wrong Answer */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      lastResult.status === "Accepted"
                        ? "bg-[#9DFF00] text-black"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {lastResult.status === "Accepted" ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <X className="w-5 h-5 stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-base font-extrabold ${
                        lastResult.status === "Accepted" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {lastResult.status}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {lastResult.status === "Accepted"
                        ? "All test cases passed"
                        : `Passed ${lastResult.passed_cases} of ${lastResult.total_cases} test cases`}
                    </p>
                  </div>
                </div>

                {/* Metrics Cards: Runtime & Memory */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#141A26] border border-[#1F293D] flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Runtime</div>
                      <div className="font-bold text-white text-xs">{lastResult.runtime_ms} ms</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141A26] border border-[#1F293D] flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans uppercase">Memory</div>
                      <div className="font-bold text-white text-xs">
                        {(lastResult.memory_kb / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Cases Breakdown matching UI Screenshot */}
                <div className="space-y-2 pt-2 border-t border-[#1A2332]">
                  <div className="text-xs font-bold text-white">Test Cases</div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {lastResult.results.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#141A26] border border-[#1F293D] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#9DFF00] stroke-[2.5]" />
                          <span className="text-slate-200 font-semibold">Case {r.case_number}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#132B1D] text-[#4ADE80] font-sans text-[10px] font-bold">
                            Passed
                          </span>
                          <span className="text-slate-400 text-[10px]">{r.execution_time_ms} ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#141A26]/50 border border-[#1F293D] text-slate-400 space-y-1">
                  <div className="font-sans font-semibold text-white">Ready to Execute</div>
                  <div className="text-[11px]">Click "Run" or "Submit" to evaluate code against assertions.</div>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="text-xs font-bold text-white font-sans">Sample Cases:</div>
                  {testCases.slice(0, 3).map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#141A26] border border-[#1F293D] flex items-center justify-between"
                    >
                      <span className="text-slate-300">Case {tc.case_number}</span>
                      <span className="text-slate-500 text-[10px]">Sample</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible Console Drawer at bottom */}
            <div className="pt-2 border-t border-[#1A2332]">
              <button
                type="button"
                onClick={() => setShowConsoleDrawer((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#9DFF00]" />
                  <span>&gt;_ Console</span>
                </div>
                {showConsoleDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showConsoleDrawer && (
                <div className="mt-2 p-3 bg-[#0B0F17] rounded-xl border border-[#1F293D] font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                  <div className="text-slate-500">// Standard Output Stream</div>
                  <div>{lastResult?.results[0]?.actual_output || "0 1"}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ACTION BAR (Exact Match to Figma & UI Reference)                */}
      {/* ========================================================================= */}
      <footer className="h-12 border-t border-[#1A2332] bg-[#0A0D14] px-4 flex items-center justify-between text-xs flex-shrink-0 z-30 font-sans">
        {/* Left: < > Problem 1 of 324 */}
        <div className="flex items-center gap-3 font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevProblem}
              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
              title="Previous Problem"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextProblem}
              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
              title="Next Problem"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs">
            Problem {currentProblemIndex + 1} of {allProblems.length}
          </span>
        </div>

        {/* Right: Add Notes, Solution, Next Problem -> */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
          >
            <StickyNote className="w-4 h-4" />
            <span>Add Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLeftTab("hints")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Solution</span>
          </button>

          <button
            type="button"
            onClick={handleNextProblem}
            className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#B5F500] hover:bg-[#A3E635] text-black font-extrabold text-xs shadow-md active:scale-95 transition-all"
          >
            <span>Next Problem</span>
            <ArrowRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          </button>
        </div>
      </footer>

      {/* Styled Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#121824] border border-[#1F293D] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Reset Editor Code?</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Restore default {language.toUpperCase()} boilerplate. All current modifications will be lost.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetCode}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#121824] border border-[#1F293D] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1A2332] pb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-[#9DFF00]" />
                <h4 className="text-sm font-bold text-white">Personal Study Notes</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Jot down time complexity observations, edge cases to remember, or interview takeaways..."
              className="w-full h-40 p-3 bg-[#141A26] border border-[#1F293D] rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#9DFF00]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-1.5 rounded-xl bg-[#B5F500] hover:bg-[#A3E635] text-black font-bold text-xs shadow-md"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
