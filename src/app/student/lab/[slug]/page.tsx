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
  BookOpen,
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

      const prob = probs.find((p) => p.slug === slug) || probs[0];
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
    if (problem && problem.starter_code_json[newLang]) {
      setCode(problem.starter_code_json[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem && problem.starter_code_json[language]) {
      setCode(problem.starter_code_json[language]);
    }
  };

  const copyInput = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const executeSolution = async (isSubmission: boolean = false) => {
    if (!problem) return;

    if (isSubmission) {
      setIsSubmitting(true);
    } else {
      setIsRunning(true);
    }
    setActiveConsoleTab("trace");

    try {
      if (language === "python") {
        const testCasesToRun = isSubmission
          ? problem.test_cases || []
          : (problem.test_cases || []).filter((tc) => !tc.is_hidden);

        const results: TestCaseResult[] = [];
        let passedCount = 0;

        for (const tc of testCasesToRun) {
          const runRes = await runPythonCode(code, tc.input);
          const expected = tc.expected_output || tc.expectedOutput || "";
          const passed = compareOutputs(runRes.stdout, expected);

          if (passed) passedCount++;

          results.push({
            testCaseId: tc.id,
            input: tc.input,
            passed,
            actualOutput: normalizeOutput(runRes.stdout),
            expectedOutput: normalizeOutput(expected),
            executionTimeMs: runRes.executionTimeMs,
            errorMessage: runRes.stderr || (passed ? undefined : "Output mismatch"),
            isHidden: tc.is_hidden,
          });
        }

        setExecutionResults(results);

        if (isSubmission && currentUser) {
          const scorePercentage = Math.round((passedCount / testCasesToRun.length) * 100);
          const status = scorePercentage === 100 ? "Accepted" : "Wrong Answer";

          setSubmissionFeedback({
            status,
            score: scorePercentage,
            passed: passedCount,
            total: testCasesToRun.length,
          });

          await DataService.recordSubmission({
            user_id: currentUser.id,
            problem_id: problem.id,
            language: "python",
            source_code: code,
            status,
            passed_cases: passedCount,
            total_cases: testCasesToRun.length,
            score: scorePercentage,
            execution_time_ms: results.reduce((acc, r) => acc + r.executionTimeMs, 0),
            tab_switches: 0,
          });
        }
      } else {
        const payloadCases = (isSubmission
          ? problem.test_cases || []
          : (problem.test_cases || []).filter((tc) => !tc.is_hidden)
        ).map((tc) => ({
          id: tc.id,
          input: tc.input,
          expected_output: tc.expected_output || tc.expectedOutput,
          is_hidden: tc.is_hidden,
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
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500 font-mono text-xs">
        Loading problem specifications...
      </div>
    );
  }

  const sampleTestCases = (problem.test_cases || []).filter((tc) => !tc.is_hidden);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F8FAFC] text-slate-900 select-none font-sans">
      {/* 56px Luxury Top IDE Toolbar */}
      <header className="h-14 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between gap-4 z-20 flex-shrink-0 shadow-sm">
        {/* Left: Back Nav & Problem Selector Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/student/dashboard")}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors font-medium border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Workspace</span>
          </button>

          <span className="text-slate-300">|</span>

          {/* Problem Selector Dropdown */}
          <div className="relative">
            <select
              value={problem.slug}
              onChange={(e) => router.push(`/student/lab/${e.target.value}`)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm transition-all"
            >
              {allProblems.map((p) => (
                <option key={p.id} value={p.slug} className="bg-white text-slate-900">
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <span
            className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border shadow-sm ${
              problem.difficulty === "Easy"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : problem.difficulty === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Center: Quick Action Buttons with Shortcut Badges */}
        <div className="flex items-center gap-2.5">
          {/* Run Sample Tests */}
          <button
            onClick={() => executeSolution(false)}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-sm hover:border-slate-300 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
            <span>{isRunning ? "Running..." : "Run"}</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500">
              ⌘↵
            </kbd>
          </button>

          {/* Submit Solution */}
          <button
            onClick={() => executeSolution(true)}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Grading..." : "Submit"}</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-800/40 border border-indigo-400/40 text-indigo-100">
              ⌘⇧↵
            </kbd>
          </button>
        </div>

        {/* Right: Engine Indicator & Language Pill */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {language === "python" ? "Pyodide WASM (Local)" : "Compiler API"}
          </span>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-xs font-mono font-semibold text-slate-800 pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm transition-all"
            >
              <option value="python">Python 3.10</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ 20</option>
              <option value="c">C (GCC)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Main Split-Screen Workspace (Full Bleed, 0 Margin) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem Brief & Constraints */}
        <div
          style={{ width: `${leftWidthPercent}%` }}
          className="border-r border-slate-200/90 bg-white flex flex-col overflow-y-auto p-6 space-y-6 flex-shrink-0 shadow-sm"
        >
          {/* Header Title & Tags */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {problem.company_tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/70"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{problem.title}</h1>
          </div>

          {/* Problem Statement Markdown */}
          <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
            <div className="whitespace-pre-line">{problem.description_md}</div>
          </div>

          {/* Sample Test Cases (Copyable Cards) */}
          <div className="space-y-3 pt-4 border-t border-slate-200/80">
            <h3 className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500">
              Sample Test Cases
            </h3>
            {sampleTestCases.map((tc, idx) => (
              <div
                key={tc.id}
                className="card-luxury rounded-2xl p-4 space-y-2.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">Sample #{idx + 1}</span>
                  <button
                    onClick={() => copyInput(tc.input, idx)}
                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 text-[10px] font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-600">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Input:</div>
                  <pre className="p-2.5 rounded-xl bg-slate-50 text-slate-800 text-[11px] overflow-x-auto mt-1 border border-slate-200/80 font-mono">
                    {tc.input}
                  </pre>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Expected Output:</div>
                  <pre className="p-2.5 rounded-xl bg-emerald-50/60 text-emerald-800 text-[11px] overflow-x-auto mt-1 border border-emerald-200/80 font-mono">
                    {tc.expected_output || tc.expectedOutput}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Tabbed Console */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* Subheader: Editor Controls */}
          <div className="h-9 border-b border-slate-800 bg-[#0F172A] px-4 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
            <span className="flex items-center gap-2 text-slate-200 font-semibold">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>solution.{language === "python" ? "py" : language === "java" ? "java" : language === "cpp" ? "cpp" : "c"}</span>
            </span>

            <div className="flex items-center gap-4">
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[11px]"
                title="Reset to starter code"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-transparent text-slate-400 hover:text-white focus:outline-none cursor-pointer text-[11px]"
              >
                <option value={12} className="bg-slate-900 text-slate-200">12px</option>
                <option value={13} className="bg-slate-900 text-slate-200">13px</option>
                <option value={14} className="bg-slate-900 text-slate-200">14px</option>
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
                padding: { top: 14, bottom: 14 },
              }}
            />
          </div>

          {/* Execution Console (Bottom Pane) */}
          <div className="h-64 border-t border-slate-200/90 bg-[#F8FAFC] flex flex-col overflow-hidden flex-shrink-0 shadow-lg">
            {/* Console Tab Strip */}
            <div className="h-10 border-b border-slate-200 bg-white px-4 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsoleTab("cases")}
                  className={`px-3 py-1.5 font-semibold transition-colors rounded-lg ${
                    activeConsoleTab === "cases"
                      ? "text-indigo-600 bg-indigo-50 border border-indigo-200/80 font-bold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Test Cases ({sampleTestCases.length})
                </button>

                <button
                  onClick={() => setActiveConsoleTab("custom")}
                  className={`px-3 py-1.5 font-semibold transition-colors rounded-lg ${
                    activeConsoleTab === "custom"
                      ? "text-indigo-600 bg-indigo-50 border border-indigo-200/80 font-bold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Custom Stdin
                </button>

                <button
                  onClick={() => setActiveConsoleTab("trace")}
                  className={`px-3 py-1.5 font-semibold transition-colors rounded-lg flex items-center gap-1.5 ${
                    activeConsoleTab === "trace"
                      ? "text-indigo-600 bg-indigo-50 border border-indigo-200/80 font-bold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Execution Trace</span>
                  {executionResults.length > 0 && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        executionResults.every((r) => r.passed) ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Submission Score Badge */}
              {submissionFeedback && (
                <div className="flex items-center gap-2.5 text-xs">
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] border shadow-sm ${
                      submissionFeedback.status === "Accepted"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {submissionFeedback.status}
                  </span>
                  <span className="text-slate-600 text-xs font-semibold">
                    Score: {submissionFeedback.score}% ({submissionFeedback.passed}/{submissionFeedback.total} Passed)
                  </span>
                </div>
              )}
            </div>

            {/* Console Body */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-800">
              {/* Tab 1: Test Cases Picker */}
              {activeConsoleTab === "cases" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {sampleTestCases.map((tc, idx) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedCaseIdx === idx
                            ? "bg-indigo-600 text-white shadow-sm font-bold"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {sampleTestCases[selectedCaseIdx] && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Standard Input:</div>
                        <pre className="p-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 shadow-sm font-mono">
                          {sampleTestCases[selectedCaseIdx].input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Expected Output:</div>
                        <pre className="p-2.5 rounded-xl bg-emerald-50/70 text-emerald-800 border border-emerald-200 shadow-sm font-mono">
                          {sampleTestCases[selectedCaseIdx].expected_output || sampleTestCases[selectedCaseIdx].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Custom Stdin */}
              {activeConsoleTab === "custom" && (
                <div className="h-full flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">
                    Input stream to inject into program standard input:
                  </label>
                  <textarea
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    placeholder="Enter custom input lines here..."
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                  />
                </div>
              )}

              {/* Tab 3: Execution Trace & Side-by-Side Diff */}
              {activeConsoleTab === "trace" && (
                <div className="space-y-3">
                  {executionResults.length === 0 ? (
                    <div className="text-slate-400 py-8 text-center text-xs font-medium">
                      No execution output yet. Press <strong className="text-slate-700">⌘ + Enter</strong> to run sample test cases.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {executionResults.map((res, idx) => (
                        <div
                          key={res.testCaseId || idx}
                          className={`rounded-xl p-4 border text-xs shadow-sm ${
                            res.passed
                              ? "bg-white border-emerald-200"
                              : "bg-white border-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold">
                              {res.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              )}
                              <span className={res.passed ? "text-emerald-800" : "text-rose-800"}>
                                {res.isHidden ? `Hidden Test Case #${idx + 1}` : `Visible Test Case #${idx + 1}`}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono font-medium">
                              {res.executionTimeMs}ms
                            </span>
                          </div>

                          {!res.isHidden && (
                            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono mt-2">
                              <div>
                                <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">Expected:</span>
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {res.expectedOutput}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">Actual Output:</span>
                                <div
                                  className={`p-2 rounded-lg border ${
                                    res.passed ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200 font-bold"
                                  }`}
                                >
                                  {res.actualOutput || "<Empty output>"}
                                </div>
                              </div>
                            </div>
                          )}

                          {res.errorMessage && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 text-rose-800 font-mono text-[11px] border border-rose-200">
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
