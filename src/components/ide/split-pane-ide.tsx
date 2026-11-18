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
import {
  Play,
  CheckCircle2,
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
}

export function SplitPaneIDE({
  problem,
  mode = "practice",
  onSolveSuccess,
  onCodeChange,
  conceptNoteMarkdown,
  initialLanguage = "python",
}: SplitPaneIDEProps) {
  // Selected Language
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  // Active Code buffer
  const [sourceCode, setSourceCode] = useState<string>(
    problem.boilerplate_code[initialLanguage] || problem.boilerplate_code.python || ""
  );

  // Left Pane Active Tab: 'description' | 'concept' | 'hints' | 'submissions'
  const [activeLeftTab, setActiveLeftTab] = useState<"description" | "concept" | "hints" | "submissions">("description");

  // Right Bottom Pane Tab: 'testcase' | 'results'
  const [activeBottomTab, setActiveBottomTab] = useState<"testcase" | "results">("testcase");

  // Selected Test Case Pill (1 to 6)
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<number>(1);

  // Custom Input State
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false);
  const [customInputValue, setCustomInputValue] = useState<string>("");

  // Unlocked Accordion Hints
  const [unlockedHints, setUnlockedHints] = useState<{
    intuition: boolean;
    data_structure: boolean;
    edge_case_warning: boolean;
  }>({
    intuition: false,
    data_structure: false,
    edge_case_warning: false,
  });

  // Execution & Submission State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ProblemSubmissionResult | null>(null);

  // Submissions History
  const [submissionHistory, setSubmissionHistory] = useState<ProblemSubmissionResult[]>([]);

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
    if (confirm("Reset editor to default function boilerplate? Your current changes will be cleared.")) {
      const boilerplate = problem.boilerplate_code[language] || "";
      setSourceCode(boilerplate);
      if (onCodeChange) onCodeChange(boilerplate, language);
    }
  };

  // Run Code against visible test cases (TC 1 & TC 2)
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setActiveBottomTab("results");

    setTimeout(() => {
      const res = CurriculumStore.evaluateSubmission(problem, language, sourceCode, false);
      setLastResult(res);
      setIsRunning(false);
      setSelectedCaseNumber(1);
    }, 450);
  }, [problem, language, sourceCode]);

  // Submit Code against all 6 test cases
  const handleSubmitCode = useCallback(async () => {
    setIsSubmitting(true);
    setActiveBottomTab("results");

    setTimeout(() => {
      const res = CurriculumStore.evaluateSubmission(problem, language, sourceCode, true);
      setLastResult(res);
      setSubmissionHistory(CurriculumStore.getSubmissions(problem.id));
      setIsSubmitting(false);
      setSelectedCaseNumber(1);

      if (res.status === "Accepted" && onSolveSuccess) {
        onSolveSuccess();
      }
    }, 600);
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
      {/* Top IDE Toolbar */}
      <div className="h-12 border-b border-[#1E293B] bg-[#0E131F]/90 px-4 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
        {/* Left: Problem Title & Difficulty Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-400">
            {problem.practice_stage_name || "Problem"}
          </span>
          <span className="text-slate-600">/</span>
          <h2 className="text-sm font-semibold text-white tracking-tight truncate max-w-xs sm:max-w-md">
            {problem.title}
          </h2>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              problem.difficulty === "Easy"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : problem.difficulty === "Medium"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Right: Language Selector & Run / Submit Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-[#141B2D] border border-[#1E293B] text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="python">Python 3.12</option>
              <option value="cpp">C++ (GCC 11)</option>
              <option value="java">Java 17</option>
              <option value="c">C (GCC 10)</option>
              <option value="sql">PostgreSQL / SQL</option>
            </select>
          </div>

          {/* Reset Code */}
          <button
            type="button"
            onClick={handleResetCode}
            title="Reset to boilerplate code"
            className="p-1.5 rounded-lg border border-[#1E293B] hover:bg-[#1A2338] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182035] hover:bg-[#202B47] border border-[#273352] text-xs font-medium text-slate-200 transition-all active:scale-95 disabled:opacity-50"
            title="Shortcut: Ctrl+Enter"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-current" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Submit Code Button */}
          <button
            type="button"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            title="Shortcut: Ctrl+Shift+Enter"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Grading..." : "Submit"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body: Split Left (Tabs) & Right (Editor + Test Console) */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT PANE: Description, Concept Note, Hints, Submissions */}
        {/* ========================================================= */}
        <div className="col-span-12 lg:col-span-5 border-r border-[#1E293B] bg-[#0E131F]/70 flex flex-col overflow-hidden">
          {/* Left Tabs Bar */}
          <div className="flex items-center gap-1 px-3 pt-2 border-b border-[#1E293B] bg-[#0B0F17] text-xs font-mono overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveLeftTab("description")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors border-t border-x ${
                activeLeftTab === "description"
                  ? "bg-[#0E131F] text-indigo-400 font-semibold border-[#1E293B]"
                  : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            {mode === "practice" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveLeftTab("concept")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors border-t border-x ${
                    activeLeftTab === "concept"
                      ? "bg-[#0E131F] text-indigo-400 font-semibold border-[#1E293B]"
                      : "text-slate-400 hover:text-slate-200 border-transparent"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Concept Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLeftTab("hints")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors border-t border-x ${
                    activeLeftTab === "hints"
                      ? "bg-[#0E131F] text-indigo-400 font-semibold border-[#1E293B]"
                      : "text-slate-400 hover:text-slate-200 border-transparent"
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hints</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveLeftTab("submissions")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors border-t border-x ${
                activeLeftTab === "submissions"
                  ? "bg-[#0E131F] text-indigo-400 font-semibold border-[#1E293B]"
                  : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Submissions ({submissionHistory.length})</span>
            </button>
          </div>

          {/* Left Tab Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-300">
            {/* Description Tab */}
            {activeLeftTab === "description" && (
              <div className="space-y-6">
                {/* Description Markdown */}
                <div className="prose prose-invert prose-sm max-w-none space-y-4">
                  <div className="whitespace-pre-line text-xs font-sans leading-relaxed text-slate-300">
                    {problem.description_markdown}
                  </div>
                </div>

                {/* Constraints Card */}
                <div className="p-3.5 rounded-xl bg-[#141B2D]/80 border border-[#1E293B] space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Constraints
                  </div>
                  <pre className="text-xs font-mono text-emerald-300 whitespace-pre-line">
                    {problem.constraints_text}
                  </pre>
                </div>

                {/* Sample Testcases (TC 1 & TC 2) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Sample Cases
                  </div>
                  {testCases.slice(0, 2).map((tc) => (
                    <div key={tc.id} className="p-3.5 rounded-xl bg-[#141B2D]/60 border border-[#1E293B] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span>Case {tc.case_number}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Sample</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-mono">Input:</div>
                        <pre className="p-2 rounded-lg bg-[#0B0F17] font-mono text-xs text-slate-200 overflow-x-auto">
                          {tc.input_data}
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-mono">Expected:</div>
                        <pre className="p-2 rounded-lg bg-[#0B0F17] font-mono text-xs text-emerald-400 overflow-x-auto">
                          {tc.expected_output}
                        </pre>
                      </div>
                    </div>
                  ))}
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

            {/* Concept Note Tab (3-min Study Guide & Big-O Cheat Sheet) */}
            {activeLeftTab === "concept" && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Concept & Big-O</span>
                </div>
                <div className="whitespace-pre-line text-xs font-sans leading-relaxed text-slate-300 space-y-3">
                  {conceptNoteMarkdown || "Refer to the topic concept note for algorithmic invariants."}
                </div>
              </div>
            )}

            {/* Step-by-Step Progressive Accordion Hints (Practice Mode Only) */}
            {activeLeftTab === "hints" && (
              <div className="space-y-3">
                {/* Hint 1: Intuition */}
                <div className="rounded-xl border border-[#1E293B] bg-[#141B2D]/70 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setUnlockedHints((prev) => ({ ...prev, intuition: !prev.intuition }))}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-200 hover:bg-[#1A2338]"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Hint 1: Intuition</span>
                    </div>
                    {unlockedHints.intuition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {unlockedHints.intuition && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-[#1E293B] bg-[#0E131F]/60">
                      {problem.hints.intuition}
                    </div>
                  )}
                </div>

                {/* Hint 2: Data Structure */}
                <div className="rounded-xl border border-[#1E293B] bg-[#141B2D]/70 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setUnlockedHints((prev) => ({ ...prev, data_structure: !prev.data_structure }))}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-200 hover:bg-[#1A2338]"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold">Hint 2: Data Structure</span>
                    </div>
                    {unlockedHints.data_structure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {unlockedHints.data_structure && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-[#1E293B] bg-[#0E131F]/60">
                      {problem.hints.data_structure}
                    </div>
                  )}
                </div>

                {/* Hint 3: Edge Case Warning */}
                <div className="rounded-xl border border-[#1E293B] bg-[#141B2D]/70 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setUnlockedHints((prev) => ({ ...prev, edge_case_warning: !prev.edge_case_warning }))}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-200 hover:bg-[#1A2338]"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="font-bold">Hint 3: Edge Cases</span>
                    </div>
                    {unlockedHints.edge_case_warning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {unlockedHints.edge_case_warning && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-[#1E293B] bg-[#0E131F]/60">
                      {problem.hints.edge_case_warning}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submissions Tab */}
            {activeLeftTab === "submissions" && (
              <div className="space-y-3">
                {submissionHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-mono">
                    No submissions yet.
                  </div>
                ) : (
                  submissionHistory.map((sub, idx) => (
                    <div
                      key={sub.submission_id || idx}
                      className="p-3.5 rounded-xl bg-[#141B2D]/70 border border-[#1E293B] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            sub.status === "Accepted"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(sub.submitted_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                        <span>Language: {sub.language.toUpperCase()}</span>
                        <span>Passed: {sub.passed_cases}/{sub.total_cases}</span>
                        <span>Runtime: {sub.runtime_ms}ms</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE: Monaco Editor + 6-Pill Status Testcase Console */}
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

          {/* Bottom Testcase & 6-Pill Status Visualizer Console (35% height) */}
          <div className="flex-[35] bg-[#0E131F] flex flex-col overflow-hidden">
            {/* Console Tabs */}
            <div className="flex items-center justify-between px-4 pt-2 border-b border-[#1E293B] bg-[#0B0F17] text-xs font-mono">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("testcase")}
                  className={`px-3 py-1.5 rounded-t-md transition-colors ${
                    activeBottomTab === "testcase"
                      ? "bg-[#0E131F] text-indigo-400 font-bold border-t border-x border-[#1E293B]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Cases
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("results")}
                  className={`px-3 py-1.5 rounded-t-md transition-colors flex items-center gap-1.5 ${
                    activeBottomTab === "results"
                      ? "bg-[#0E131F] text-indigo-400 font-bold border-t border-x border-[#1E293B]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>Result</span>
                  {lastResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        lastResult.status === "Accepted" ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Status Message */}
              <div className="text-[11px] font-mono text-slate-400">
                {lastResult ? (
                  <span
                    className={
                      lastResult.status === "Accepted" ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"
                    }
                  >
                    {lastResult.status} ({lastResult.passed_cases}/{lastResult.total_cases})
                  </span>
                ) : (
                  <span>Ready</span>
                )}
              </div>
            </div>

            {/* Console Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {/* TESTCASES TAB */}
              {activeBottomTab === "testcase" && (
                <div className="space-y-3">
                  {/* Case Switcher Tabs */}
                  <div className="flex items-center gap-2">
                    {testCases.slice(0, 2).map((tc) => (
                      <button
                        key={tc.case_number}
                        type="button"
                        onClick={() => {
                          setSelectedCaseNumber(tc.case_number);
                          setIsCustomInput(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          selectedCaseNumber === tc.case_number && !isCustomInput
                            ? "bg-[#1E293B] text-white border border-indigo-500/50"
                            : "bg-[#141B2D] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Case {tc.case_number}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsCustomInput(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                        isCustomInput
                          ? "bg-[#1E293B] text-white border border-indigo-500/50"
                          : "bg-[#141B2D] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      + Custom
                    </button>
                  </div>

                  {/* Case Content */}
                  {isCustomInput ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-400 font-mono">Custom Input:</div>
                      <textarea
                        rows={3}
                        value={customInputValue}
                        onChange={(e) => setCustomInputValue(e.target.value)}
                        placeholder="Enter sample input..."
                        className="w-full p-2.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] font-mono text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400">Input:</div>
                        <pre className="p-2.5 rounded-lg bg-[#0B0F17] text-slate-300 border border-[#1E293B] overflow-x-auto">
                          {selectedTestCase?.input_data}
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400">Expected:</div>
                        <pre className="p-2.5 rounded-lg bg-[#0B0F17] text-emerald-400 border border-[#1E293B] overflow-x-auto">
                          {selectedTestCase?.expected_output}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TEST RESULTS TAB: 6-PILL STATUS VISUALIZER */}
              {activeBottomTab === "results" && (
                <div className="space-y-3">
                  {!lastResult ? (
                    <div className="p-6 text-center text-xs text-slate-500 font-mono">
                      Run code or submit to view test results.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* 6-PILL STATUS VISUALIZER: TC 1 to TC 6 */}
                      <div className="flex flex-wrap items-center gap-2">
                        {lastResult.results.map((r) => {
                          const isSelected = selectedCaseNumber === r.case_number;
                          return (
                            <button
                              key={r.case_number}
                              type="button"
                              onClick={() => setSelectedCaseNumber(r.case_number)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
                                r.passed
                                  ? isSelected
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm shadow-emerald-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15"
                                  : isSelected
                                  ? "bg-rose-500/20 text-rose-300 border-rose-400 shadow-sm shadow-rose-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/15"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  r.passed ? "bg-emerald-400" : "bg-rose-400"
                                }`}
                              />
                              <span>TC {r.case_number}</span>
                              {r.is_hidden && (
                                <span className="text-[9px] uppercase tracking-wider opacity-60">
                                  Hidden
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Case Inspection Card */}
                      {selectedCaseResult && (
                        <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1E293B] space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-bold">
                              Case {selectedCaseResult.case_number} · {selectedCaseResult.is_hidden ? "Hidden" : "Public"}
                            </span>
                            <span
                              className={`font-semibold ${
                                selectedCaseResult.passed ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {selectedCaseResult.passed ? "Passed" : "Failed"}
                            </span>
                          </div>

                          {/* Failure Category Diagnostic Warning */}
                          <div className="p-2 rounded-lg bg-[#141B2D] border border-[#1E293B] text-[11px] flex items-center justify-between">
                            <span className="text-slate-400">Category:</span>
                            <span className="text-amber-300 font-semibold">
                              {selectedCaseResult.failure_category}
                            </span>
                          </div>

                          {/* Data Display: For public cases show data; for hidden cases show diagnostic without leaking */}
                          {selectedCaseResult.is_hidden ? (
                            <div className="p-3 rounded-lg bg-[#141B2D]/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Hidden Test Case</span>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Redacted for test integrity. {selectedCaseResult.passed ? "Passed all assertions." : `Failed: ${selectedCaseResult.failure_category}.`}
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <span className="text-[10px] text-slate-500">Input:</span>
                                <pre className="p-2 rounded bg-[#141B2D] text-slate-200 overflow-x-auto text-[11px]">
                                  {selectedCaseResult.input_data}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500">Actual Output:</span>
                                <pre
                                  className={`p-2 rounded overflow-x-auto text-[11px] ${
                                    selectedCaseResult.passed
                                      ? "bg-[#141B2D] text-emerald-400"
                                      : "bg-rose-950/40 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {selectedCaseResult.actual_output}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
