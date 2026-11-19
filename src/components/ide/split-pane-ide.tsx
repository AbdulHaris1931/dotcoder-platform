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

  // Left Pane Active Tab: 'problem' | 'solution' | 'discussion'
  const [activeLeftTab, setActiveLeftTab] = useState<"problem" | "solution" | "discussion">("problem");

  // Right Bottom Pane Tab: 'cases' | 'sample' | 'hidden'
  const [activeBottomTab, setActiveBottomTab] = useState<"cases" | "sample" | "hidden">("cases");

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
    setActiveBottomTab("cases");

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
    setActiveBottomTab("cases");

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
      {/* Top IDE Toolbar matching Screen 02 */}
      <div className="h-12 border-b border-[#1E293B] bg-[#0E131F]/90 px-5 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
        {/* Left: Breadcrumbs matching Screen 02 */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <a href="/curriculum" className="hover:text-white transition-colors flex items-center gap-1">
            <span>&larr; Practice</span>
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{problem.practice_stage_name || "Arrays"}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold">{problem.title}</span>
        </div>

        {/* Right: Language Selector & Run / Submit Controls matching Screen 02 */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-[#141B2D] border border-[#1E293B] text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C4F82A] cursor-pointer"
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
            className="p-1.5 rounded-lg border border-[#1E293B] hover:bg-[#1A2338] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Run Code Button matching Screen 02 (Lime Green Pill) */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C4F82A] hover:bg-[#B5EA20] text-black text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0F1412] hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="Shortcut: Ctrl+Shift+Enter"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C4F82A]" />
            <span>{isSubmitting ? "Grading..." : "Submit"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body: Split Left (Tabs) & Right (Editor + Test Console) */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT PANE: Problem Title, Tabs, Problem, Solution, Discussion */}
        {/* ========================================================= */}
        <div className="col-span-12 lg:col-span-5 border-r border-[#1E293B] bg-[#0E131F]/90 flex flex-col overflow-hidden">
          {/* Problem Title & Difficulty Badge matching Screen 02 */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {problem.title}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#C4F82A]/20 text-[#C4F82A] border border-[#C4F82A]/40">
                {problem.difficulty}
              </span>
            </div>
          </div>
          {/* Left Tabs Bar */}
          <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1E293B] bg-[#0B0F17] text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveLeftTab("problem")}
              className={`flex items-center gap-1.5 px-3 py-2 font-semibold transition-colors border-b-2 ${
                activeLeftTab === "problem"
                  ? "text-[#C4F82A] border-[#C4F82A]"
                  : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              <span>Problem</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab("solution")}
              className={`flex items-center gap-1.5 px-3 py-2 font-semibold transition-colors border-b-2 ${
                activeLeftTab === "solution"
                  ? "text-[#C4F82A] border-[#C4F82A]"
                  : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              <span>Solution</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab("discussion")}
              className={`flex items-center gap-1.5 px-3 py-2 font-semibold transition-colors border-b-2 ${
                activeLeftTab === "discussion"
                  ? "text-[#C4F82A] border-[#C4F82A]"
                  : "text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              <span>Discussion</span>
            </button>
          </div>

          {/* Left Tab Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-300">
            {/* Problem Tab */}
            {activeLeftTab === "problem" && (
              <div className="space-y-6">
                {/* Description Text */}
                <div className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                  {problem.description_markdown || "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target."}
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
                      <span className="text-[#C4F82A]">{testCases[0]?.expected_output || "[0, 1]"}</span>
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
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-[#1A2338]/60"
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
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-[#1A2338]/60"
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
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:bg-[#1A2338]/60"
                    >
                      <span className="font-semibold text-slate-200">&gt; Output Format</span>
                      {openSections.outputFormat ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSections.outputFormat && (
                      <div className="px-4 pb-3 text-xs font-mono text-slate-400 border-t border-[#1E293B]/60 pt-2">
                        Return a list or array of two integers [index1, index2].
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

            {/* Solution Tab */}
            {activeLeftTab === "solution" && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C4F82A]/10 border border-[#C4F82A]/30 text-[#C4F82A] text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimal Hash Map Approach</span>
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

            {/* Discussion Tab */}
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

          {/* Bottom Test Cases Dock matching Screen 02 */}
          <div className="flex-[38] bg-[#0E131F] flex flex-col overflow-hidden">
            {/* Dock Tabs: Test Cases (3), Sample (2), Hidden (4) */}
            <div className="flex items-center justify-between px-4 pt-2.5 border-b border-[#1E293B] bg-[#0B0F17] text-xs font-mono">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("cases")}
                  className={`px-3.5 py-1.5 rounded-t-lg transition-colors font-semibold ${
                    activeBottomTab === "cases"
                      ? "bg-[#0E131F] text-[#C4F82A] border-t-2 border-[#C4F82A]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Test Cases (3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("sample")}
                  className={`px-3.5 py-1.5 rounded-t-lg transition-colors font-semibold ${
                    activeBottomTab === "sample"
                      ? "bg-[#0E131F] text-[#C4F82A] border-t-2 border-[#C4F82A]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sample (2)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("hidden")}
                  className={`px-3.5 py-1.5 rounded-t-lg transition-colors font-semibold ${
                    activeBottomTab === "hidden"
                      ? "bg-[#0E131F] text-[#C4F82A] border-t-2 border-[#C4F82A]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Hidden (4)
                </button>
              </div>

              {/* Status Message */}
              <div className="text-[11px] font-mono text-slate-400">
                {lastResult ? (
                  <span className="text-[#C4F82A] font-semibold">
                    {lastResult.status} ({lastResult.passed_cases}/{lastResult.total_cases})
                  </span>
                ) : (
                  <span className="text-slate-500">Ready</span>
                )}
              </div>
            </div>

            {/* Test Cases Table matching Screen 02 */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {[
                { name: "Test Case 1", status: "Passed", time: "4 ms", input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
                { name: "Test Case 2", status: "Passed", time: "5 ms", input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
                { name: "Test Case 3", status: "Passed", time: "6 ms", input: "nums = [3,3], target = 6", expected: "[0,1]" },
              ].map((tc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#141B2D]/60 border border-[#1E293B] text-xs font-mono hover:bg-[#141B2D] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C4F82A]" />
                    <span className="font-semibold text-slate-200">{tc.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#C4F82A]/20 text-[#C4F82A] border border-[#C4F82A]/40 font-bold text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-[#C4F82A]" />
                      <span>{tc.status}</span>
                    </span>
                    <span className="text-slate-400 text-[11px] min-w-[36px] text-right font-mono">{tc.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
