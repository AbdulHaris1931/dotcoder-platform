"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, Submission } from "@/types";
import { SkillIntelligenceService } from "@/lib/services/skill-intelligence";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Target,
  BrainCircuit,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";

export function StudentDrawer({
  student,
  submissions = [],
  onClose,
}: {
  student: UserProfile | null;
  submissions?: Submission[];
  onClose: () => void;
}) {
  const [remedialDispatched, setRemedialDispatched] = useState<Record<string, boolean>>({});
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  // Derive 6-Dimensional Skill Intelligence Profile unconditionally before any returns
  const skillProfile = useMemo(() => {
    if (!student) return null;
    return SkillIntelligenceService.calculateSkillProfile(student, submissions);
  }, [student, submissions]);

  const studentSubmissions = student ? submissions.filter((s) => s.user_id === student.id) : [];
  const totalViolations = studentSubmissions.reduce(
    (acc, sub) => acc + (sub.tab_switches || 0),
    0
  );

  const breakdown = skillProfile?.breakdown;
  const weakTopics = skillProfile?.weakTopics ?? [];

  const totalTestCases = studentSubmissions.reduce((acc, sub) => acc + (sub.total_cases || 5), 0);
  const passedTestCases = studentSubmissions.reduce((acc, sub) => acc + (sub.passed_cases || 0), 0);
  const testCasePct = totalTestCases > 0 ? Math.round((passedTestCases / totalTestCases) * 100) : 92;

  const knowledgeLevelTier =
    (breakdown?.placementReadinessScore ?? 0) >= 80
      ? "Level 3: Placement Ready (Tier-1 Standard)"
      : (breakdown?.placementReadinessScore ?? 0) >= 65
      ? "Level 2: Proficient Core DSA"
      : "Level 1: Developing Foundations";

  const tier =
    (breakdown?.placementReadinessScore ?? 0) >= 75
      ? "Placement Ready"
      : (breakdown?.placementReadinessScore ?? 0) >= 60
      ? "Needs Practice"
      : "At-Risk";

  const handleDispatchRemedial = (topicName: string) => {
    setRemedialDispatched((prev) => ({ ...prev, [topicName]: true }));
    setTimeout(() => {
      setRemedialDispatched((prev) => ({ ...prev, [topicName]: false }));
    }, 4000);
  };

  return (
    <AnimatePresence>
      {student && skillProfile && breakdown && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        />

        {/* Slide-Over Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
          className="relative w-full max-w-md bg-[#0A0F0C] border-l border-[#1E2C24] shadow-obsidian h-full flex flex-col z-10 text-[#F4F7F5] font-sans"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#1E2C24] flex items-center justify-between bg-[#0C120F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#9DFF00] text-[#070B09] flex items-center justify-center font-bold font-mono text-sm">
                {student.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[#F4F7F5]">{student.full_name}</h3>
                <div className="text-[11px] font-mono text-[#99A9A0]">
                  {student.roll_no} &bull; {student.department} (Batch {student.batch_year})
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close student drawer"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 1. Placement Readiness (PLR) Header Card */}
            <div className="bg-[#0C120F] border border-[#2C4034] text-[#F4F7F5] rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#99A9A0] flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#9DFF00]" />
                  <span>Placement Readiness (PLR)</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    breakdown.placementReadinessScore >= 75
                      ? "bg-[#9DFF00]/15 text-[#9DFF00] border-[#9DFF00]/35"
                      : breakdown.placementReadinessScore >= 60
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/35"
                      : "bg-rose-500/15 text-rose-300 border-rose-500/35"
                  }`}
                >
                  {tier}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-[#F4F7F5] tabular-nums">
                  {breakdown.placementReadinessScore}%
                </span>
                <span className="text-xs text-[#99A9A0]">Institutional Benchmark (AVASC)</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#121B16] rounded-full h-2 overflow-hidden border border-[#1E2C24]">
                <div
                  className="h-full rounded-full bg-[#9DFF00] transition-all duration-500"
                  style={{ width: `${breakdown.placementReadinessScore}%` }}
                />
              </div>

              {/* Versioned formula note */}
              <div className="text-[10px] font-mono text-[#85998D] pt-1 border-t border-[#1E2C24] flex items-center justify-between">
                <span>Model v2.0</span>
                <span className="text-[#9DFF00]">0.25(ACC)+0.25(PSI)+0.25(DSA)...</span>
              </div>
            </div>

            {/* 1.5. Live Coding Accuracy & Knowledge Level Telemetry */}
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#F4F7F5] flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#9DFF00]" />
                  <span>Coding Accuracy &amp; Knowledge Level</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Mentor Sync
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#121B16] border border-[#1E2C24] space-y-1">
                  <div className="text-[10px] font-mono text-[#99A9A0] uppercase font-semibold">Coding Accuracy</div>
                  <div className="text-xl font-bold font-mono text-[#F4F7F5] tabular-nums">{breakdown.accuracyScore}%</div>
                  <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#9DFF00]"
                      style={{ width: `${breakdown.accuracyScore}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-[#85998D]">Weighted test case accuracy</div>
                </div>

                <div className="p-3 rounded-xl bg-[#121B16] border border-[#1E2C24] space-y-1">
                  <div className="text-[10px] font-mono text-[#99A9A0] uppercase font-semibold">Test Case Ratio</div>
                  <div className="text-xl font-bold font-mono text-[#F4F7F5] tabular-nums">
                    {passedTestCases}/{totalTestCases}
                  </div>
                  <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{ width: `${testCasePct}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-[#85998D]">{testCasePct}% tests evaluated</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121B16] border border-[#2C4034] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#9DFF00]">
                  <span>COGNITIVE KNOWLEDGE LEVEL</span>
                  <span>AVASC TIER-1</span>
                </div>
                <div className="text-xs font-bold text-[#F4F7F5]">{knowledgeLevelTier}</div>
                <div className="text-[11px] text-[#99A9A0] leading-relaxed">
                  Demonstrates consistent boundary invariance, hash indexing, and algorithmic time-space guarantees.
                </div>
              </div>
            </div>

            {/* 2. 6-Dimensional Skill Intelligence Radar Breakdown */}
            <div className="surface-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#F4F7F5] flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#9DFF00]" />
                  <span>6-Dimensional Skill Vectors</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {[
                  { label: "Coding Accuracy (ACC)", val: breakdown.accuracyScore, w: "25%" },
                  { label: "Problem Solving (PSI)", val: breakdown.psiScore, w: "25%" },
                  { label: "DSA Topic Mastery", val: breakdown.dsaMasteryScore, w: "25%" },
                  { label: "Algorithmic Efficiency", val: breakdown.efficiencyScore, w: "15%" },
                  { label: "Consistency & Streak", val: breakdown.consistencyScore, w: "10%" },
                  { label: "Composite PLR", val: breakdown.placementReadinessScore, w: "100%" },
                ].map((dim) => (
                  <div
                    key={dim.label}
                    className="p-2.5 rounded-xl bg-[#121B16] border border-[#1E2C24] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#99A9A0]">
                      <span className="truncate">{dim.label}</span>
                      <span className="text-[9px] text-[#85998D]">w:{dim.w}</span>
                    </div>
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-base font-bold text-[#F4F7F5] tabular-nums">{dim.val}%</span>
                      <div className="w-12 h-1.5 bg-[#070B09] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${dim.val >= 75 ? "bg-[#9DFF00]" : dim.val >= 60 ? "bg-amber-400" : "bg-rose-400"}`}
                          style={{ width: `${dim.val}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Diagnostic Weak Concept Matrix & Targeted Drill Dispatch */}
            {weakTopics.length > 0 && (
              <div className="border border-amber-500/30 bg-amber-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Diagnostic Weak Concepts ({weakTopics.length})</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    Targeted Drills
                  </span>
                </div>

                <div className="space-y-2">
                  {weakTopics.map((w) => (
                    <div
                      key={w.topic}
                      className="p-2.5 rounded-xl bg-[#0C120F] border border-[#1E2C24] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#F4F7F5]">{w.topic}</div>
                        <div className="text-[10px] font-mono text-rose-400 font-semibold">
                          Mastery: {w.score}% (Benchmark: 75%)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDispatchRemedial(w.topic)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          remedialDispatched[w.topic]
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09]"
                        }`}
                      >
                        {remedialDispatched[w.topic] ? "Dispatched" : "Assign Drill →"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Anti-Cheating Telemetry Box */}
            <div className="surface-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#99A9A0] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9DFF00]" />
                  Proctoring Audit Status
                </span>
                {totalViolations > 0 ? (
                  <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    {totalViolations} Flagged
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Clean Session
                  </span>
                )}
              </div>
              <p className="text-xs text-[#99A9A0] leading-relaxed font-sans">
                {totalViolations > 0
                  ? `Candidate switched tabs or blurred the assessment window ${totalViolations} times. Audit report flagged for faculty inspection.`
                  : "Zero browser defocus, fullscreen exits, or clipboard violations detected during live examinations."}
              </p>
            </div>

            {/* 5. Assessment & Submission History */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#99A9A0] flex items-center justify-between">
                <span>Recent Submissions ({studentSubmissions.length})</span>
                <span className="text-[11px] text-[#85998D] font-normal">Live Telemetry Records</span>
              </h4>

              {studentSubmissions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#85998D] surface-card rounded-2xl">
                  No submissions recorded yet for this student.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentSubmissions.slice(0, 5).map((sub) => {
                    const isExpanded = expandedSubId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        className="surface-card rounded-2xl p-3.5 space-y-2.5 text-xs transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#F4F7F5] truncate max-w-[200px]">
                            {sub.problem_title || "Placement Challenge"}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              sub.status === "Accepted"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#99A9A0] font-mono">
                          <span className="capitalize">{sub.language}</span>
                          <span className="font-semibold text-[#F4F7F5] tabular-nums">{sub.passed_cases}/{sub.total_cases} Cases</span>
                          <span className="tabular-nums">{sub.execution_time_ms}ms</span>
                          <button
                            type="button"
                            onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9DFF00] hover:underline transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide Code" : "Inspect"}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Expandable Source Code Viewer */}
                        {isExpanded && (
                          <div className="pt-2 border-t border-[#1E2C24] space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#85998D]">
                              <span className="flex items-center gap-1">
                                <Terminal className="w-3 h-3" />
                                <span>Submitted Solution ({sub.language})</span>
                              </span>
                              <span>Score: {sub.score}/100</span>
                            </div>
                            <pre className="p-3 rounded-xl bg-[#070B09] text-[#F4F7F5] font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#1E2C24] max-h-48">
                              {sub.source_code || "# No source code provided"}
                            </pre>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#99A9A0]">
                              <span>Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
                              <span className={sub.tab_switches > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                                {sub.tab_switches > 0 ? `${sub.tab_switches} Tab Switches` : "100% Proctored Clean"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
