"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { DataService } from "@/lib/supabase/db";
import { DemoStore } from "@/lib/demo-store";
import { runPythonCode } from "@/lib/pyodide-runner";
import { compareOutputs, normalizeOutput } from "@/lib/utils";
import {
  Problem,
  SupportedLanguage,
  TestCaseResult,
  ExecuteCodeResponse,
  UserProfile,
} from "@/types";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Terminal,
  Code2,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Cpu,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function CodingLabPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [code, setCode] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(13);

  // Split-Pane sizing (Left: 42%, Right: 58%)
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(42);

  // Console Tabs: 'cases' | 'custom' | 'trace'
  const [activeConsoleTab, setActiveConsoleTab] = useState<"cases" | "custom" | "trace">("cases");
  const [customStdin, setCustomStdin] = useState<string>("");
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionResults, setExecutionResults] = useState<TestCaseResult[]>([]);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    status: string;
    score: number;
    passed: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    async function init() {
      const user = await DataService.getCurrentUser();
      setCurrentUser(user);

      const probs = await DataService.getProblems();
      setAllProblems(probs);

      const prob = probs.find((p) => p.slug === slug);
      if (prob) {
        setProblem(prob);
        setCode(prob.starter_code_json[language] || "");
      }
    }
    init();
  }, [slug]);

  // Keyboard Shortcuts (⌘+Enter = Run, ⌘+Shift+Enter = Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          executeSolution(true);
        } else {
          executeSolution(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, language, problem, currentUser]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (problem) {
      setCode(problem.starter_code_json[newLang] || "");
    }
  };

  const handleResetCode = () => {
    if (problem) {
      setCode(problem.starter_code_json[language] || "");
    }
  };

  const copyInput = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  // Execution Runner
  const executeSolution = async (isSubmission: boolean) => {
    if (!problem) return;

    if (isSubmission) {
      setIsSubmitting(true);
    } else {
      setIsRunning(true);
    }

    setActiveConsoleTab("trace");
    setSubmissionFeedback(null);

    const testCasesToRun = isSubmission
      ? problem.test_cases || []
      : (problem.test_cases || []).filter((tc) => !tc.is_hidden);

    try {
      // 1. Python runs client-side zero-latency Pyodide WASM
      if (language === "python") {
        const results: TestCaseResult[] = [];
        let passedCount = 0;

        for (const tc of testCasesToRun) {
          const expected = tc.expected_output || tc.expectedOutput || "";
          const res = await runPythonCode(code, tc.input);
          const passed = compareOutputs(res.stdout, expected);
          if (passed) passedCount++;

          results.push({
            testCaseId: tc.id,
            isHidden: tc.is_hidden,
            passed,
            input: tc.input,
            expectedOutput: expected,
            actualOutput: res.stdout || res.stderr,
            executionTimeMs: res.executionTimeMs,
            errorMessage: res.stderr ? res.stderr : undefined,
          });
        }

        setExecutionResults(results);

        if (isSubmission && currentUser) {
          const total = testCasesToRun.length;
          const score = total > 0 ? Math.round((passedCount / total) * 100) : 0;
          const status = passedCount === total ? "Accepted" : "Wrong Answer";

          setSubmissionFeedback({
            status,
            score,
            passed: passedCount,
            total,
          });

          await DataService.recordSubmission({
            user_id: currentUser.id,
            problem_id: problem.id,
            language,
            source_code: code,
            status,
            passed_cases: passedCount,
            total_cases: total,
            score,
            execution_time_ms: results.reduce((acc, r) => acc + r.executionTimeMs, 0),
            tab_switches: 0,
          });
        }
      } else {
        // 2. Compiled Languages (Java, C, C++) route through /api/execute
        const payloadCases = testCasesToRun.map((tc) => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expected_output || tc.expectedOutput || "",
          isHidden: tc.is_hidden,
          weight: tc.weight,
        }));

        const response = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            sourceCode: code,
            problemId: problem.id,
            isSubmission,
            testCases: payloadCases,
          }),
        });

        const data: ExecuteCodeResponse = await response.json();
        setExecutionResults(data.results || []);

        if (isSubmission && currentUser) {
          setSubmissionFeedback({
            status: data.status,
            score: data.scorePercentage,
            passed: data.passedCases,
            total: data.totalCases,
          });

          await DataService.recordSubmission({
            user_id: currentUser.id,
            problem_id: problem.id,
            language,
            source_code: code,
            status: data.status,
            passed_cases: data.passedCases,
            total_cases: data.totalCases,
            score: data.scorePercentage,
            execution_time_ms: data.executionTimeMs,
            tab_switches: 0,
          });
        }
      }
    } catch (err: any) {
      console.error("Execution error:", err);
    } finally {
      setIsRunning(false);
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090B] text-slate-500 font-mono text-xs">
        Loading problem specifications...
      </div>
    );
  }

  const sampleTestCases = (problem.test_cases || []).filter((tc) => !tc.is_hidden);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#09090B] text-slate-100 select-none font-sans">
      {/* 48px Pro-Grade Top IDE Toolbar */}
      <header className="h-12 border-b border-white/[0.08] bg-[#0C0C0E] px-4 flex items-center justify-between gap-4 z-20 flex-shrink-0">
        {/* Left: Back Nav & Problem Selector Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/student/dashboard")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-white/[0.06] transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lab Hub</span>
          </button>

          <span className="text-white/20">|</span>

          {/* Problem Selector Dropdown */}
          <div className="relative">
            <select
              value={problem.slug}
              onChange={(e) => router.push(`/student/lab/${e.target.value}`)}
              className="appearance-none bg-[#141418] hover:bg-[#18181C] text-xs font-semibold text-white pl-2.5 pr-7 py-1 rounded-lg border border-white/[0.08] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {allProblems.map((p) => (
                <option key={p.id} value={p.slug} className="bg-[#111114]">
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>

          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
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

        {/* Center: Quick Action Buttons with Shortcut Badges */}
        <div className="flex items-center gap-2">
          {/* Run Sample Tests */}
          <button
            onClick={() => executeSolution(false)}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181C] hover:bg-[#202028] text-slate-200 text-xs font-semibold border border-white/[0.08] hover:border-white/[0.16] transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>{isRunning ? "Testing..." : "Run"}</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] border border-white/[0.1] text-slate-400">
              ⌘↵
            </kbd>
          </button>

          {/* Submit Solution */}
          <button
            onClick={() => executeSolution(true)}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Grading..." : "Submit"}</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-700/60 border border-indigo-400/30 text-indigo-200">
              ⌘⇧↵
            </kbd>
          </button>
        </div>

        {/* Right: Engine Indicator & Language Pill */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {language === "python" ? "Pyodide WASM (Local)" : "Compiler API"}
          </span>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="appearance-none bg-[#141418] hover:bg-[#18181C] text-xs font-mono font-semibold text-white pl-2.5 pr-7 py-1 rounded-lg border border-white/[0.08] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="python">Python 3.10</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ 20</option>
              <option value="c">C (GCC)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Main Split-Screen Workspace (Full Bleed, 0 Margin) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem Brief & Constraints */}
        <div
          style={{ width: `${leftWidthPercent}%` }}
          className="border-r border-white/[0.08] bg-[#09090B] flex flex-col overflow-y-auto p-6 space-y-6 flex-shrink-0"
        >
          {/* Header Title & Tags */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {problem.company_tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{problem.title}</h1>
          </div>

          {/* Problem Statement Markdown */}
          <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3 font-sans">
            <div className="whitespace-pre-line">{problem.description_md}</div>
          </div>

          {/* Sample Test Cases (Copyable Cards) */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Sample Test Cases
            </h3>
            {sampleTestCases.map((tc, idx) => (
              <div
                key={tc.id}
                className="card-obsidian rounded-xl p-3.5 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-white">Sample #{idx + 1}</span>
                  <button
                    onClick={() => copyInput(tc.input, idx)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Input:</div>
                  <pre className="p-2 rounded bg-[#0C0C0E] text-slate-300 text-[11px] overflow-x-auto mt-0.5 border border-white/[0.04]">
                    {tc.input}
                  </pre>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Expected Output:</div>
                  <pre className="p-2 rounded bg-[#0C0C0E] text-emerald-400 text-[11px] overflow-x-auto mt-0.5 border border-white/[0.04]">
                    {tc.expected_output || tc.expectedOutput}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Tabbed Console */}
        <div className="flex-1 flex flex-col bg-[#0D0D10] overflow-hidden">
          {/* Subheader: Editor Controls */}
          <div className="h-8 border-b border-white/[0.06] bg-[#0E0E12] px-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>solution.{language === "python" ? "py" : language === "java" ? "java" : language === "cpp" ? "cpp" : "c"}</span>
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                title="Reset to starter code"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-transparent text-slate-400 hover:text-white focus:outline-none cursor-pointer"
              >
                <option value={12} className="bg-[#111114]">12px</option>
                <option value={13} className="bg-[#111114]">13px</option>
                <option value={14} className="bg-[#111114]">14px</option>
              </select>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              language={language === "cpp" || language === "c" ? "cpp" : language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
                lineNumbers: "on",
                automaticLayout: true,
                tabSize: 4,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Execution Console (Bottom Pane) */}
          <div className="h-64 border-t border-white/[0.08] bg-[#0C0C0E] flex flex-col overflow-hidden">
            {/* Console Tab Strip */}
            <div className="h-9 border-b border-white/[0.06] bg-[#0E0E12] px-4 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsoleTab("cases")}
                  className={`px-3 py-1 font-semibold transition-colors ${
                    activeConsoleTab === "cases"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Test Cases ({sampleTestCases.length})
                </button>

                <button
                  onClick={() => setActiveConsoleTab("custom")}
                  className={`px-3 py-1 font-semibold transition-colors ${
                    activeConsoleTab === "custom"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Custom Stdin
                </button>

                <button
                  onClick={() => setActiveConsoleTab("trace")}
                  className={`px-3 py-1 font-semibold transition-colors flex items-center gap-1.5 ${
                    activeConsoleTab === "trace"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Execution Trace</span>
                  {executionResults.length > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        executionResults.every((r) => r.passed) ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Submission Score Badge */}
              {submissionFeedback && (
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                      submissionFeedback.status === "Accepted"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {submissionFeedback.status}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Score: {submissionFeedback.score}% ({submissionFeedback.passed}/{submissionFeedback.total} Passed)
                  </span>
                </div>
              )}
            </div>

            {/* Console Body */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
              {/* Tab 1: Test Cases Picker */}
              {activeConsoleTab === "cases" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    {sampleTestCases.map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          selectedCaseIdx === idx
                            ? "bg-indigo-600 text-white font-bold"
                            : "bg-white/[0.04] text-slate-400 hover:text-white"
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {sampleTestCases[selectedCaseIdx] && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase mb-1">Standard Input:</div>
                        <pre className="p-2 rounded bg-[#09090B] text-slate-300 border border-white/[0.04]">
                          {sampleTestCases[selectedCaseIdx].input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase mb-1">Expected Output:</div>
                        <pre className="p-2 rounded bg-[#09090B] text-emerald-400 border border-white/[0.04]">
                          {sampleTestCases[selectedCaseIdx].expected_output || sampleTestCases[selectedCaseIdx].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Custom Stdin */}
              {activeConsoleTab === "custom" && (
                <div className="h-full flex flex-col space-y-1">
                  <label className="text-[10px] uppercase text-slate-500">
                    Input stream to inject into program standard input:
                  </label>
                  <textarea
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    placeholder="Enter custom input lines here..."
                    className="flex-1 w-full bg-[#09090B] border border-white/[0.06] rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Tab 3: Execution Trace & Side-by-Side Diff */}
              {activeConsoleTab === "trace" && (
                <div className="space-y-3">
                  {executionResults.length === 0 ? (
                    <div className="text-slate-500 py-6 text-center text-xs">
                      No execution output yet. Press <strong>⌘ + Enter</strong> to run sample test cases.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {executionResults.map((res, idx) => (
                        <div
                          key={res.testCaseId || idx}
                          className={`rounded-xl p-3 border text-xs ${
                            res.passed
                              ? "bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-200"
                              : "bg-rose-500/[0.03] border-rose-500/20 text-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold">
                              {res.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-400" />
                              )}
                              <span>
                                {res.isHidden ? `Hidden Test Case #${idx + 1}` : `Visible Test Case #${idx + 1}`}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {res.executionTimeMs}ms
                            </span>
                          </div>

                          {!res.isHidden && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-1">
                              <div>
                                <span className="text-slate-500 text-[10px] block">Expected:</span>
                                <div className="p-1.5 rounded bg-[#09090B] text-emerald-400 mt-0.5 border border-white/[0.04]">
                                  {res.expectedOutput}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Actual Output:</span>
                                <div
                                  className={`p-1.5 rounded bg-[#09090B] mt-0.5 border border-white/[0.04] ${
                                    res.passed ? "text-emerald-400" : "text-rose-400 font-bold"
                                  }`}
                                >
                                  {res.actualOutput || "<Empty output>"}
                                </div>
                              </div>
                            </div>
                          )}

                          {res.errorMessage && (
                            <div className="mt-2 p-2 rounded bg-rose-950/40 text-rose-300 font-mono text-[11px] border border-rose-500/20">
                              {res.errorMessage}
                            </div>
                          )}
                        </div>
                      ))}
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
