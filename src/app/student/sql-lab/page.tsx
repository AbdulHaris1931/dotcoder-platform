"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Database,
  Play,
  CheckCircle2,
  RotateCcw,
  Table2,
  Lightbulb,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  CAMPUS_SCHEMA_DOCS,
  SQL_CHALLENGES,
  runSqlQuery,
  verifySqlChallenge,
  type SqlChallenge,
  type SqlQueryResult,
} from "@/lib/sql-runner";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[260px] flex items-center justify-center bg-[#070B09] text-xs font-mono text-[#99A9A0]">
      Initializing SQL Editor...
    </div>
  ),
});

export default function StudentSqlLabPage() {
  const [activeChallenge, setActiveChallenge] = useState<SqlChallenge>(
    SQL_CHALLENGES[0]
  );
  const [sql, setSql] = useState<string>(SQL_CHALLENGES[0].starterSql);
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solvedIds, setSolvedIds] = useState<Record<string, boolean>>({});
  const [checkFeedback, setCheckFeedback] = useState<{
    status: "pass" | "fail";
    message: string;
  } | null>(null);

  const handleSelectChallenge = (challenge: SqlChallenge) => {
    setActiveChallenge(challenge);
    setSql(challenge.starterSql);
    setResult(null);
    setShowHint(false);
    setCheckFeedback(null);
  };

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setCheckFeedback(null);
    const res = await runSqlQuery(sql);
    setResult(res);
    setIsRunning(false);
  }, [sql]);

  const handleVerify = useCallback(async () => {
    setIsRunning(true);
    const { passed, userResult, expectedResult } = await verifySqlChallenge(
      sql,
      activeChallenge.solutionSql
    );
    setResult(userResult);
    if (passed) {
      setSolvedIds((prev) => ({ ...prev, [activeChallenge.id]: true }));
      setCheckFeedback({
        status: "pass",
        message: `All ${expectedResult.rowCount} output rows matched expected MNC benchmark.`,
      });
    } else if (userResult.error) {
      setCheckFeedback({
        status: "fail",
        message: userResult.error,
      });
    } else {
      setCheckFeedback({
        status: "fail",
        message: `Output mismatch: got ${userResult.rowCount} rows (${userResult.columns.length} cols), expected ${expectedResult.rowCount} rows (${expectedResult.columns.length} cols).`,
      });
    }
    setIsRunning(false);
  }, [sql, activeChallenge]);

  const solvedCount = Object.keys(solvedIds).length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-[#F4F7F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E2C24]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
              <Database className="w-3 h-3" />
              SQLite WebAssembly
            </span>
            <span className="text-[11px] font-mono text-[#99A9A0]">
              100% In-Browser &bull; Zero Latency
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5] mt-1.5">
            MNC Placement SQL Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Practice real campus placement SQL rounds (TCS, Infosys, Zoho, Freshworks) against a live relational database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#0C120F] border border-[#1E2C24] text-xs font-mono">
            <span className="text-[#99A9A0]">Solved: </span>
            <span className="font-bold text-[#9DFF00] tabular-nums">
              {solvedCount} / {SQL_CHALLENGES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Challenges & Schema */}
        <div className="lg:col-span-4 space-y-5">
          {/* Challenges List */}
          <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-4 space-y-2.5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#99A9A0] px-1">
              Placement SQL Challenges
            </h2>
            <div className="space-y-2">
              {SQL_CHALLENGES.map((ch) => {
                const isActive = ch.id === activeChallenge.id;
                const isSolved = Boolean(solvedIds[ch.id]);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectChallenge(ch)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#121B16] border-[#9DFF00]/60 text-[#F4F7F5]"
                        : "bg-[#070B09] border-[#1E2C24] text-[#D5E0D9] hover:bg-[#121B16]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold truncate">
                        {ch.title}
                      </span>
                      {isSolved && (
                        <CheckCircle2 className="w-4 h-4 text-[#9DFF00] shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-[#18241D] text-[#D5E0D9]">
                        {ch.company}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          ch.difficulty === "Easy"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : ch.difficulty === "Medium"
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relational Schema Explorer */}
          <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#99A9A0]">
              <Table2 className="w-3.5 h-3.5 text-[#9DFF00]" />
              <span>Campus DB Schema</span>
            </div>
            <div className="space-y-2.5">
              {CAMPUS_SCHEMA_DOCS.map((t) => (
                <div
                  key={t.table}
                  className="p-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24]"
                >
                  <div className="text-xs font-mono font-bold text-[#9DFF00]">
                    {t.table}
                  </div>
                  <div className="text-[11px] font-mono text-[#99A9A0] mt-1 leading-relaxed">
                    {t.columns.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt + Monaco SQL Editor + Result Table */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Prompt */}
          <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-[#F4F7F5]">
                {activeChallenge.title}
              </h2>
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="inline-flex items-center gap-1.5 min-h-[28px] px-2.5 py-1 rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] text-[11px] font-mono text-amber-300 transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? "Hide Hint" : "Show Hint"}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#D5E0D9] leading-relaxed">
              {activeChallenge.prompt}
            </p>
            {showHint && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 font-mono">
                Hint: {activeChallenge.hint}
              </div>
            )}
          </div>

          {/* SQL Editor Card */}
          <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#1E2C24] bg-[#121B16] flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-semibold text-[#D5E0D9]">
                query.sql
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSql(activeChallenge.starterSql);
                    setCheckFeedback(null);
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[28px] px-2.5 py-1 rounded-lg bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] text-xs font-mono text-[#99A9A0] hover:text-[#F4F7F5] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 min-h-[28px] px-3 py-1 rounded-lg bg-[#18241D] hover:bg-[#1E2C24] border border-[#2C4034] text-xs font-mono font-bold text-[#F4F7F5] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-[#9DFF00]" />
                  <span>{isRunning ? "Running..." : "Run Query"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 min-h-[28px] px-3.5 py-1 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-xs font-mono font-bold text-[#070B09] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Check Solution</span>
                </button>
              </div>
            </div>

            <div className="h-[240px]">
              <Editor
                height="240px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={sql}
                onChange={(val) => setSql(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>

          {/* Verification Banner */}
          {checkFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                checkFeedback.status === "pass"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {checkFeedback.status === "pass" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{checkFeedback.message}</span>
            </div>
          )}

          {/* Result Table */}
          <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#1E2C24] bg-[#121B16] flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-[#D5E0D9]">Query Output</span>
              {result && !result.error && (
                <div className="flex items-center gap-3 text-[11px] text-[#99A9A0] tabular-nums">
                  <span>{result.rowCount} rows</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#9DFF00]" />
                    {result.executionMs} ms
                  </span>
                </div>
              )}
            </div>

            {!result ? (
              <div className="p-8 text-center text-xs font-mono text-[#99A9A0]">
                Click Run Query or Check Solution to execute SQLite WebAssembly in your browser.
              </div>
            ) : result.error ? (
              <div className="p-4 text-xs font-mono text-rose-300 bg-rose-500/5">
                SQLite Error: {result.error}
              </div>
            ) : result.columns.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-emerald-300">
                Statement executed cleanly (0 rows returned).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E2C24] bg-[#070B09] text-[#9DFF00]">
                      {result.columns.map((col) => (
                        <th key={col} className="px-4 py-2.5 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2C24] text-[#D5E0D9]">
                    {result.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#18241D]/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2 tabular-nums">
                            {cell === null ? "NULL" : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
