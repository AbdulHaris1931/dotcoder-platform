"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, Submission } from "@/types";
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
} from "lucide-react";

export function StudentDrawer({
  student,
  submissions,
  onClose,
}: {
  student: UserProfile | null;
  submissions: Submission[];
  onClose: () => void;
}) {
  if (!student) return null;

  const studentSubmissions = submissions.filter((s) => s.user_id === student.id);
  const totalViolations = studentSubmissions.reduce(
    (acc, sub) => acc + (sub.tab_switches || 0),
    0
  );

  const tier =
    student.readiness_score >= 75
      ? "Placement Ready"
      : student.readiness_score >= 60
      ? "Needs Practice"
      : "At-Risk";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Slide-Over Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
          className="relative w-full max-w-md bg-[#111114] border-l border-white/[0.08] shadow-2xl h-full flex flex-col z-10 text-slate-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#141418]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold font-mono text-sm shadow-inner">
                {student.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{student.full_name}</h3>
                <div className="text-[11px] font-mono text-slate-400">
                  {student.roll_no} • {student.department} (Batch {student.batch_year})
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Readiness Gauge & Status Strip */}
            <div className="card-obsidian rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Placement Readiness
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    student.readiness_score >= 75
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : student.readiness_score >= 60
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {tier}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {student.readiness_score}%
                </span>
                <span className="text-xs text-slate-400">TCS & Zoho Benchmark</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    student.readiness_score >= 75
                      ? "bg-emerald-500"
                      : student.readiness_score >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${student.readiness_score}%` }}
                />
              </div>
            </div>

            {/* Anti-Cheating Telemetry Box */}
            <div className="card-obsidian rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Proctoring Audit Status
                </span>
                {totalViolations > 0 ? (
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    {totalViolations} Flagged
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Clean Session
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {totalViolations > 0
                  ? `Candidate switched tabs or blurred the assessment window ${totalViolations} times. Audit report flagged for faculty inspection.`
                  : "Zero browser defocus, fullscreen exits, or clipboard violations detected during live examinations."}
              </p>
            </div>

            {/* Assessment & Submission History */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Recent Submissions ({studentSubmissions.length})</span>
                <span className="text-[10px] text-slate-500">Live DotLab Records</span>
              </h4>

              {studentSubmissions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 card-obsidian rounded-xl">
                  No submissions recorded yet for this student.
                </div>
              ) : (
                <div className="space-y-2">
                  {studentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="card-obsidian rounded-xl p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[200px]">
                          {sub.problem_title || "Placement Challenge"}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            sub.status === "Accepted"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
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
    </AnimatePresence>
  );
}
