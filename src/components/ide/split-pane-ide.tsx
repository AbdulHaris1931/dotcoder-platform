"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  CurriculumProblem,
  CurriculumTestCase,
  SupportedLanguage,
  ProblemSubmissionResult,
  TestCaseExecutionResult,
} from "@/types/curriculum";
import { CurriculumStore } from "@/lib/curriculum-store";
import { DataService } from "@/lib/supabase/db";
import { runPythonCode } from "@/lib/pyodide-runner";
import { useSidebar } from "@/components/shared/app-shell";
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
  FileText,
  BookOpen,
  Lightbulb,
  History,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
  Sidebar,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";

// Dynamically load Monaco Editor without SSR
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0B0F17] text-slate-500 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
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
  const { toggleSidebar, isSidebarOpen } = useSidebar();
  
  // Selected Language
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  // Active Code buffer
  const [sourceCode, setSourceCode] = useState<string>(
    problem.boilerplate_code[initialLanguage] || problem.boilerplate_code.python || ""
  );

  // Left Pane Active Tab: 'problem' | 'solution' | 'hints' | 'discussion'
  const [activeLeftTab, setActiveLeftTab] = useState<"problem" | "solution" | "hints" | "discussion">("problem");

  // Right Bottom Pane Tab: 'cases' | 'sample' | 'hidden' | 'custom'
  const [activeBottomTab, setActiveBottomTab] = useState<"cases" | "sample" | "hidden" | "custom">("cases");

  // Collapsible Accordions in Problem tab
  const [openSections, setOpenSections] = useState<{
    constraints: boolean;
    inputFormat: boolean;
    outputFormat: boolean;
  }>({
    constraints: true,
    inputFormat: false,
    outputFormat: false,
  });

  // Selected Test Case Pill (1 to 6)
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<number>(1);

  // Custom Input State
  const [customInputValue, setCustomInputValue] = useState<string>(
    (problem.test_cases && problem.test_cases[0]?.input_data) || "2 7 11 15\n9"
  );
  const [customExecutionResult, setCustomExecutionResult] = useState<{
    stdout: string;
    stderr: string;
    executionTimeMs: number;
    isTLE?: boolean;
  } | null>(null);

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

  // Execution & Submission State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ProblemSubmissionResult | null>(null);

  // Submissions History
  const [submissionHistory, setSubmissionHistory] = useState<ProblemSubmissionResult[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [expandedCaseNumber, setExpandedCaseNumber] = useState<number | null>(null);

  // Load history on mount
  useEffect(() => {
    setSubmissionHistory(CurriculumStore.getSubmissions(problem.id));
  }, [problem.id]);

  // When language changes, update code buffer to boilerplate if unmodified or notify parent
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

  // Run Code against visible test cases (TC 1 & TC 2) or Custom Input
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);

    if (activeBottomTab === "custom") {
      // Execute Custom Input with 5.0s watchdog
      if (language === "python") {
        const pyRes = await runPythonCode(sourceCode, customInputValue, 5000);
        setCustomExecutionResult(pyRes);
      } else {
        try {
          const res = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language,
              sourceCode,
              intent: "run",
              customInput: customInputValue,
            }),
          });
          const data = await res.json();
          setCustomExecutionResult({
            stdout: data.stdout || "",
            stderr: data.stderr || "",
            executionTimeMs: data.executionTimeMs || 25,
          });
        } catch (err: any) {
          setCustomExecutionResult({
            stdout: "",
            stderr: err.message || "Execution error",
            executionTimeMs: 0,
          });
        }
      }
      setIsRunning(false);
      return;
    }

    setActiveBottomTab("cases");

    if (language === "python") {
      // Client-side Pyodide WebAssembly with 5.0s Watchdog
      const testCases = (problem.test_cases || []).filter((tc) => !tc.is_hidden || tc.case_number <= 2);
      const executionResults: TestCaseExecutionResult[] = [];
      let passedCount = 0;

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
          actual_output: pyRes.isTLE
            ? pyRes.stderr
            : pyRes.stderr
            ? `Error: ${pyRes.stderr}`
            : actualOutput,
          execution_time_ms: pyRes.executionTimeMs,
          failure_category: tc.failure_category,
        });
      }

      const runRes: ProblemSubmissionResult = {
        submission_id: `run-${Date.now()}`,
        problem_id: problem.id,
        status: passedCount === testCases.length ? "Accepted" : "Wrong Answer",
        passed_cases: passedCount,
        total_cases: testCases.length,
        runtime_ms: executionResults.reduce((acc, r) => Math.max(acc, r.execution_time_ms), 0),
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
      // Server-side /api/execute for compiled languages (C, C++, Java, SQL)
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
        if (data.success) {
          const runRes: ProblemSubmissionResult = {
            submission_id: `run-${Date.now()}`,
            problem_id: problem.id,
            status: data.status,
            passed_cases: data.passedCases,
            total_cases: data.totalCases,
            runtime_ms: data.executionTimeMs,
            memory_kb: 42100,
            results: (data.results || []).map((r: any) => ({
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
        }
      } catch {
        const fallback = CurriculumStore.evaluateSubmission(problem, language, sourceCode, false);
        setLastResult(fallback);
      }
      setIsRunning(false);
      setSelectedCaseNumber(1);
    }
  }, [problem, language, sourceCode, activeBottomTab, customInputValue]);

  // Submit Code against all 6 test cases with server-side validation & hidden case sanitization
  const handleSubmitCode = useCallback(async () => {
    setIsSubmitting(true);
    setActiveBottomTab("cases");

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
      if (data.success) {
        const submissionResult: ProblemSubmissionResult = {
          submission_id: `sub-${Date.now()}`,
          problem_id: problem.id,
          status: data.status,
          passed_cases: data.passedCases,
          total_cases: data.totalCases,
          runtime_ms: data.executionTimeMs,
          memory_kb: 42100,
          results: (data.results || []).map((r: any) => ({
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

        // Record submission locally for immediate reactive stats
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
      // Fallback to local evaluation engine
      const res = CurriculumStore.evaluateSubmission(problem, language, sourceCode, true);
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleSubmitCode]);

  // Selected test case data
  const testCases = problem.test_cases || [];
  const selectedTestCase = testCases.find((tc) => tc.case_number === selectedCaseNumber) || testCases[0];
  const selectedCaseResult = lastResult?.results.find((r) => r.case_number === selectedCaseNumber);

  return (
    <div className="h-full w-full bg-[#0B0F17] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* Top IDE Toolbar matching Screen 02 */}
      <div className="h-12 border-b border-[#1E293B] bg-[#0E131F]/90 px-4 sm:px-5 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
        {/* Left: Sidebar Expand/Collapse Toggle & Breadcrumbs matching Screen 02 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141B2D] hover:bg-[#1A2338] text-slate-300 hover:text-[#9DFF00] border border-[#1E293B] text-xs font-mono font-semibold transition-all shadow-xs active:scale-95 group cursor-pointer"
            title="Expand Navigation Sidebar (⌘B)"
          >
            <Sidebar className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span className="text-[11px] font-sans font-bold text-slate-300 group-hover:text-white">
              Menu
            </span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <a href="/curriculum" className="hover:text-white transition-colors flex items-center gap-1">
              <span>&larr; Practice</span>
            </a>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{topicTitle || problem.practice_stage_name || "Arrays"}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-semibold truncate max-w-[140px] sm:max-w-xs">{problem.title}</span>
          </div>
        </div>

        {/* Right: Language Selector & Run / Submit Controls matching Screen 02 */}
        <div className="flex items-center gap-3">
          {/* Active Engine Badge & Watermark */}
          {language === "python" ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-[#17251B] text-[#9DFF00] border border-[#9DFF00]/30 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF00] animate-pulse" />
              Pyodide WASM (Client)
            </span>
          ) : language === "sql" ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-purple-950/40 text-purple-300 border border-purple-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              SQL Sandbox
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-sky-950/40 text-sky-300 border border-sky-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Compiler Sandbox
              <span className="text-[9px] opacity-75 font-mono ml-0.5">• Dev</span>
            </span>
          )}

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-[#141B2D] border border-[#1E293B] text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#9DFF00] cursor-pointer"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          {/* Reset Code */}
          <button
            type="button"
            onClick={handleResetCode}
            title="Reset to boilerplate code"
            className="p-1.5 rounded-lg border border-[#1E293B] hover:bg-[#1A2338] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Run Code Button matching Screen 02 (Lime Green Pill) */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#9DFF00] hover:bg-[#8CE600] text-black text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Shortcut: Ctrl+Enter"
          >
            <Play className="w-3 h-3 text-black fill-current" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Submit Code Button */}
          <button
            type="button"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0F1412] hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Shortcut: Ctrl+Shift+Enter"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span>{isSubmitting ? "Grading..." : "Submit"}</span>
          </button>
        </div>
      </div>

      {/* Styled Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#141B2D] border border-[#1E293B] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
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
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetCode}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body: Split Left (Tabs) & Right (Editor + Test Console) */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT PANE: Problem Title, Tabs, Problem, Solution, Hints   */}
        {/* ========================================================= */}
        <div className="col-span-12 lg:col-span-5 border-r border-[#1E293B] bg-[#0E131F]/90 flex flex-col overflow-hidden">
          {/* Problem Title & Difficulty Badge matching Screen 02 */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {problem.title}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#9DFF00]/20 text-[#9DFF00] border border-[#9DFF00]/40">
                {problem.difficulty}
              </span>
            </div>
          </div>

          {/* Left Tabs Bar */}
          <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1E293B] bg-[#0B0F17] text-xs font-mono">
            {(["problem", "solution", "hints", "discussion"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveLeftTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 font-semibold transition-colors border-b-2 capitalize cursor-pointer ${
                  activeLeftTab === tab
                    ? "text-[#9DFF00] border-[#9DFF00]"
                    : "text-slate-400 hover:text-slate-200 border-transparent"
                }`}
              >
                <span>{tab === "hints" ? "Hints (3)" : tab}</span>
              </button>
            ))}
          </div>

          {/* Left Tab Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-300">
            {/* 1. Problem Tab */}
            {activeLeftTab === "problem" && (
              <div className="space-y-6">
                {/* Description Text with Clean Formatted Markdown */}
                <div className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                  <MarkdownRenderer
                    content={
                      problem.description_markdown ||
                      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target."
                    }
                  />
                </div>

                {/* Example Block matching Screen 02 */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-400">Example:</div>
                  <div className="p-3.5 rounded-xl bg-[#141B2D]/80 border border-[#1E293B] font-mono text-xs space-y-1.5 text-slate-300">
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-emerald-300">{testCases[0]?.input_data || "nums = [2, 7, 11, 15], target = 9"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Output: </span>
                      <span className="text-[#9DFF00]">{testCases[0]?.expected_output || "[0, 1]"}</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Accordions matching Screen 02 */}
                <div className="space-y-2.5">
                  {/* Constraints Accordion */}
                  <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#141B2D]/50">
                    <button
                      type="button"
                      onClick={() => setOpenSections((s) => ({ ...s, constraints: !s.constraints }))}
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-[#1A2338]/60 cursor-pointer"
                    >
                      <span className="font-semibold text-slate-200">&gt; Constraints</span>
                      {openSections.constraints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSections.constraints && (
                      <div className="px-4 pb-3 text-xs font-mono text-slate-400 whitespace-pre-line border-t border-[#1E293B]/60 pt-2">
                        {problem.constraints_text || "• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• Only one valid answer exists."}
                      </div>
                    )}
                  </div>

                  {/* Input Format Accordion */}
                  <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#141B2D]/50">
                    <button
                      type="button"
                      onClick={() => setOpenSections((s) => ({ ...s, inputFormat: !s.inputFormat }))}
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-[#1A2338]/60 cursor-pointer"
                    >
                      <span className="font-semibold text-slate-200">&gt; Input Format</span>
                      {openSections.inputFormat ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSections.inputFormat && (
                      <div className="px-4 pb-3 text-xs font-mono text-slate-400 border-t border-[#1E293B]/60 pt-2">
                        First line contains integers representing nums array followed by target value.
                      </div>
                    )}
                  </div>

                  {/* Output Format Accordion */}
                  <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#141B2D]/50">
                    <button
                      type="button"
                      onClick={() => setOpenSections((s) => ({ ...s, outputFormat: !s.outputFormat }))}
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-[#1A2338]/60 cursor-pointer"
                    >
                      <span className="font-semibold text-slate-200">&gt; Output Format</span>
                      {openSections.outputFormat ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSections.outputFormat && (
                      <div className="px-4 pb-3 text-xs font-mono text-slate-400 border-t border-[#1E293B]/60 pt-2">
                        Return a list or array of two indices [index1, index2] separated by space.
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Tags */}
                <div className="pt-2 border-t border-[#1E293B] flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.company_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-[#182035] text-indigo-300 border border-[#273352] text-[10px] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Solution Tab */}
            {activeLeftTab === "solution" && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9DFF00]/10 border border-[#9DFF00]/30 text-[#9DFF00] text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimal Algorithmic Solution</span>
                </div>
                <div className="text-xs font-mono leading-relaxed text-slate-300 space-y-3">
                  <p>
                    By caching previously visited numbers in a hash map mapping number to index, we can check for complementary values in O(1) time.
                  </p>
                  <div className="p-3 bg-[#0B0F17] rounded-lg border border-[#1E293B] text-emerald-400">
                    Time Complexity: O(n)<br />
                    Space Complexity: O(n)
                  </div>
                </div>
              </div>
            )}

            {/* 3. Progressive Hints Tab */}
            {activeLeftTab === "hints" && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 font-mono">
                  Progressive hints guide your problem-solving process without revealing the full solution.
                </div>

                {/* Hint 1 */}
                <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#141B2D]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>Hint 1: Algorithmic Pattern</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnlockedHints((h) => ({ ...h, hint1: !h.hint1 }))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {unlockedHints.hint1 ? <Eye className="w-3 h-3 text-[#9DFF00]" /> : <Lock className="w-3 h-3 text-slate-400" />}
                      <span>{unlockedHints.hint1 ? "Hide" : "Reveal Hint"}</span>
                    </button>
                  </div>
                  {unlockedHints.hint1 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1E293B] animate-in fade-in">
                      {problem.hints?.intuition || "Instead of checking every pair with nested loops O(N^2), ask: for each number x, what partner value y would make x + y = target?"}
                    </div>
                  )}
                </div>

                {/* Hint 2 */}
                <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#141B2D]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-400" />
                      <span>Hint 2: Data Structure Choice</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnlockedHints((h) => ({ ...h, hint2: !h.hint2 }))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {unlockedHints.hint2 ? <Eye className="w-3 h-3 text-[#9DFF00]" /> : <Lock className="w-3 h-3 text-slate-400" />}
                      <span>{unlockedHints.hint2 ? "Hide" : "Reveal Hint"}</span>
                    </button>
                  </div>
                  {unlockedHints.hint2 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1E293B] animate-in fade-in">
                      {problem.hints?.data_structure || "Use a Hash Map to store previously visited elements as {value: index}. As you iterate, check if (target - num) exists in O(1)."}
                    </div>
                  )}
                </div>

                {/* Hint 3 */}
                <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#141B2D]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Hint 3: Edge Cases & Traps</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnlockedHints((h) => ({ ...h, hint3: !h.hint3 }))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono font-semibold text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {unlockedHints.hint3 ? <Eye className="w-3 h-3 text-[#9DFF00]" /> : <Lock className="w-3 h-3 text-slate-400" />}
                      <span>{unlockedHints.hint3 ? "Hide" : "Reveal Hint"}</span>
                    </button>
                  </div>
                  {unlockedHints.hint3 && (
                    <div className="pt-2 text-xs font-mono text-slate-300 border-t border-[#1E293B] animate-in fade-in">
                      {problem.hints?.edge_case_warning || "Watch out for duplicate values (e.g. [3, 3] with target 6). Ensure you don't pick the same index twice."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Discussion Tab */}
            {activeLeftTab === "discussion" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#141B2D]/70 border border-[#1E293B] space-y-1">
                  <div className="text-xs font-bold text-white">Handling Duplicate Numbers</div>
                  <div className="text-xs text-slate-400">
                    What if nums contains identical elements that sum up to target? The hash map naturally updates with the latest index or can be validated on lookup.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE: Monaco Editor + Test Cases / Custom Console   */}
        {/* ========================================================= */}
        <div className="col-span-12 lg:col-span-7 flex flex-col overflow-hidden bg-[#0B0F17]">
          {/* Top Monaco Editor Container (65% height) */}
          <div className="flex-[65] border-b border-[#1E293B] overflow-hidden relative">
            <MonacoEditor
              height="100%"
              language={language === "sql" ? "sql" : language === "cpp" || language === "c" ? "cpp" : language}
              value={sourceCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                automaticLayout: true,
                tabSize: 4,
                lineNumbers: "on",
                lineDecorationsWidth: 10,
                renderLineHighlight: "all",
              }}
            />
          </div>

          {/* Bottom Test Cases / Custom Input Dock */}
          <div className="flex-[38] bg-[#0E131F] flex flex-col overflow-hidden">
            {/* Dock Tabs: Test Cases (3), Sample (2), Hidden (4), Custom Input */}
            <div className="flex items-center justify-between px-4 pt-2.5 border-b border-[#1E293B] bg-[#0B0F17] text-xs font-mono">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("cases")}
                  className={`px-3.5 py-1.5 rounded-t-lg transition-colors font-semibold cursor-pointer ${
                    activeBottomTab === "cases"
                      ? "bg-[#0E131F] text-[#9DFF00] border-t-2 border-[#9DFF00]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Test Cases (3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("sample")}
                  className={`px-3.5 py-1.5 rounded-t-lg transition-colors font-semibold cursor-pointer ${
                    activeBottomTab === "sample"
                      ? "bg-[#0E131F] text-[#9DFF00] border-t-2 border-[#9DFF00]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sample (2)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("hidden")}
                  className={`px-3.5 py-1.5 rounded-t-lg transition-colors font-semibold cursor-pointer ${
                    activeBottomTab === "hidden"
                      ? "bg-[#0E131F] text-[#9DFF00] border-t-2 border-[#9DFF00]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Hidden (4)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("custom")}
                  className={`px-3.5 py-1.5 rounded-t-lg transition-colors font-semibold cursor-pointer ${
                    activeBottomTab === "custom"
                      ? "bg-[#0E131F] text-[#9DFF00] border-t-2 border-[#9DFF00]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Custom Input
                </button>
              </div>

              {/* Status Message */}
              <div className="text-[11px] font-mono text-slate-400">
                {activeBottomTab === "custom" ? (
                  <span className="text-slate-400">Custom Stdin Mode</span>
                ) : lastResult ? (
                  <span className="text-[#9DFF00] font-semibold">
                    {lastResult.status} ({lastResult.passed_cases}/{lastResult.total_cases})
                  </span>
                ) : (
                  <span className="text-slate-500">Ready</span>
                )}
              </div>
            </div>

            {/* Tab Body: Test Cases Table OR Custom Input Panel */}
            {activeBottomTab === "custom" ? (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Standard Input (stdin)</span>
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-3 py-1 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {isRunning ? "Running..." : "Run Custom"}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    placeholder="Enter input data (e.g. 2 7 11 15\n9)..."
                    className="w-full p-2.5 rounded-xl bg-[#141B2D] border border-[#1E293B] text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#9DFF00]"
                  />
                </div>

                {customExecutionResult && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Execution Output</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {customExecutionResult.executionTimeMs} ms
                      </span>
                    </div>
                    {customExecutionResult.stderr ? (
                      <pre className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 whitespace-pre-wrap text-[11px]">
                        {customExecutionResult.stderr}
                      </pre>
                    ) : (
                      <pre className="p-3 rounded-xl bg-[#141B2D] border border-[#1E293B] text-emerald-300 whitespace-pre-wrap text-[11px]">
                        {customExecutionResult.stdout || "[Program executed with no stdout output]"}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Dynamic Test Cases Table matching Screen 02 */
              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {(problem.test_cases || [])
                  .filter((tc) => {
                    if (activeBottomTab === "sample") return !tc.is_hidden || tc.case_number <= 2;
                    if (activeBottomTab === "hidden") return tc.is_hidden || tc.case_number > 2;
                    return tc.case_number <= 3;
                  })
                  .map((tc) => {
                    const res = lastResult?.results.find((r) => r.case_number === tc.case_number);
                    const isPassed = res ? res.passed : true;
                    const time = res ? `${res.execution_time_ms} ms` : `${3 + tc.case_number} ms`;
                    const isExpanded = expandedCaseNumber === tc.case_number;

                    return (
                      <div
                        key={tc.id || tc.case_number}
                        className="rounded-xl bg-[#141B2D]/60 border border-[#1E293B] text-xs font-mono overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedCaseNumber(isExpanded ? null : tc.case_number)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#141B2D] transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            {isPassed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#9DFF00]" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            )}
                            <span className="font-semibold text-slate-200">Test Case {tc.case_number}</span>
                            {tc.failure_category && (
                              <span className="text-[10px] text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded">
                                {tc.failure_category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-bold text-[11px] border ${
                                isPassed
                                  ? "bg-[#9DFF00]/20 text-[#9DFF00] border-[#9DFF00]/40"
                                  : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                              }`}
                            >
                              {isPassed ? (
                                <CheckCircle2 className="w-3 h-3 text-[#9DFF00]" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-400" />
                              )}
                              <span>{isPassed ? "Passed" : "Failed"}</span>
                            </span>
                            <span className="text-slate-400 text-[11px] min-w-[36px] text-right font-mono">
                              {time}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </button>

                        {/* Expandable Diagnostic Telemetry Panel */}
                        {isExpanded && (
                          <div className="px-4 py-3 border-t border-[#1E293B] bg-[#0E131F]/90 text-[11px] space-y-2">
                            {tc.is_hidden && tc.case_number > 2 ? (
                              <div className="text-slate-400 italic">
                                Hidden Stress Test Case: Input and expected output values are protected by institutional policies to prevent hardcoding.
                              </div>
                            ) : (
                              <>
                                <div>
                                  <span className="text-slate-500 font-semibold">Input: </span>
                                  <span className="text-slate-300 font-mono">{tc.input_data}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold">Expected Output: </span>
                                  <span className="text-[#9DFF00] font-mono">{tc.expected_output}</span>
                                </div>
                                {res && (
                                  <div>
                                    <span className="text-slate-500 font-semibold">Actual Output: </span>
                                    <span className={res.passed ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                                      {res.actual_output || "[No output produced]"}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
