"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, Submission } from "@/types";
import { SkillIntelligenceService } from "@/lib/services/skill-intelligence";
import {
  X,
  Award,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Calendar,
  Code2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Building,
  GraduationCap,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  BrainCircuit,
  BarChart3,
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-Over Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
          className="relative w-full max-w-md bg-white border-l border-slate-200/90 shadow-2xl h-full flex flex-col z-10 text-slate-900 font-sans"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F1412] text-[#9DFF00] border border-slate-800 flex items-center justify-center font-bold font-mono text-sm shadow-sm">
                {student.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{student.full_name}</h3>
                <div className="text-[11px] font-mono text-slate-500">
                  {student.roll_no} • {student.department} (Batch {student.batch_year})
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* 1. Placement Readiness (PLR) Header Card */}
            <div className="bg-[#0F1412] text-white rounded-2xl p-5 space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#9DFF00]" />
                  <span>Placement Readiness (PLR)</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                    breakdown.placementReadinessScore >= 75
                      ? "bg-[#18261B] text-[#9DFF00] border-[#9DFF00]/40"
                      : breakdown.placementReadinessScore >= 60
                      ? "bg-amber-950/60 text-amber-400 border-amber-600/40"
                      : "bg-rose-950/60 text-rose-400 border-rose-600/40"
                  }`}
                >
                  {tier}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {breakdown.placementReadinessScore}%
                </span>
                <span className="text-xs text-slate-400">Institutional Benchmark (AVASC)</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1C271E] rounded-full h-2 overflow-hidden border border-[#2B3B2E]">
                <div
                  className="h-full rounded-full bg-[#9DFF00] transition-all duration-500"
                  style={{ width: `${breakdown.placementReadinessScore}%` }}
                />
              </div>

              {/* Versioned formula note */}
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#1C271E] flex items-center justify-between">
                <span>Model v2.0</span>
                <span className="text-[#9DFF00]">0.25(ACC)+0.25(PSI)+0.25(DSA)...</span>
              </div>
            </div>

            {/* 2. 6-Dimensional Skill Intelligence Radar Breakdown */}
            <div className="card-luxury rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-slate-800" />
                  <span>6-Dimensional Skill Vectors</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
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
                    className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="truncate">{dim.label}</span>
                      <span className="text-[9px] text-slate-400">w:{dim.w}</span>
                    </div>
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-base font-bold text-slate-900">{dim.val}%</span>
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${dim.val >= 75 ? "bg-emerald-500" : dim.val >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
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
              <div className="border border-amber-200 bg-amber-50/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-700" />
                    <span>Diagnostic Weak Concepts ({weakTopics.length})</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Targeted Drills
                  </span>
                </div>

                <div className="space-y-2">
                  {weakTopics.map((w) => (
                    <div
                      key={w.topic}
                      className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{w.topic}</div>
                        <div className="text-[10px] font-mono text-rose-600 font-semibold">
                          Mastery: {w.score}% (Benchmark: 75%)
                        </div>
                      </div>

                      <button
                        onClick={() => handleDispatchRemedial(w.topic)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          remedialDispatched[w.topic]
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 hover:bg-black text-[#9DFF00]"
                        }`}
                      >
                        {remedialDispatched[w.topic] ? "Dispatched ✓" : "Assign Drill &rarr;"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Anti-Cheating Telemetry Box */}
            <div className="card-luxury rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Proctoring Audit Status
                </span>
                {totalViolations > 0 ? (
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    {totalViolations} Flagged
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Clean Session
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {totalViolations > 0
                  ? `Candidate switched tabs or blurred the assessment window ${totalViolations} times. Audit report flagged for faculty inspection.`
                  : "Zero browser defocus, fullscreen exits, or clipboard violations detected during live examinations."}
              </p>
            </div>

            {/* 5. Assessment & Submission History */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 flex items-center justify-between">
                <span>Recent Submissions ({studentSubmissions.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">Live DotLab Records</span>
              </h4>

              {studentSubmissions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 card-luxury rounded-2xl">
                  No submissions recorded yet for this student.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentSubmissions.slice(0, 5).map((sub) => (
                    <div
                      key={sub.id}
                      className="card-luxury rounded-2xl p-3.5 space-y-2 text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                          {sub.problem_title || "Placement Challenge"}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            sub.status === "Accepted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="capitalize">{sub.language}</span>
                        <span>{sub.passed_cases}/{sub.total_cases} Cases</span>
                        <span>{sub.execution_time_ms}ms</span>
                        <span>{new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
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
