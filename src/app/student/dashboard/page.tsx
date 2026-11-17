"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile, Problem, Assessment, Submission } from "@/types";
import {
  Terminal,
  ShieldCheck,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  Code2,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      const user = await DataService.getCurrentUser();
      setCurrentUser(user);

      const probs = await DataService.getProblems();
      setProblems(probs);

      const assessments = await DataService.getAssessments(user.college_name);
      if (assessments && assessments.length > 0) {
        setAssessment(assessments[0]);
      }

      const subs = await DataService.getSubmissions(user.college_name);
      setSubmissions(subs);
    }

    loadData();

    const unsub = subscribeToDemoStore(() => {
      loadData();
    });
    return unsub;
  }, []);

  const studentSubmissions = submissions.filter((s) => s.user_id === currentUser?.id);
  const solvedProblemIds = new Set(
    studentSubmissions.filter((s) => s.status === "Accepted").map((s) => s.problem_id)
  );

  // Difficulty counts
  const easyProblems = problems.filter((p) => p.difficulty === "Easy");
  const mediumProblems = problems.filter((p) => p.difficulty === "Medium");
  const hardProblems = problems.filter((p) => p.difficulty === "Hard");

  const solvedEasy = easyProblems.filter((p) => solvedProblemIds.has(p.id)).length;
  const solvedMedium = mediumProblems.filter((p) => solvedProblemIds.has(p.id)).length;
  const solvedHard = hardProblems.filter((p) => solvedProblemIds.has(p.id)).length;

  // Filtered problems by company track and query
  const filteredProblems = problems.filter((p) => {
    const matchesTrack =
      selectedTrack === "All" || p.company_tags.includes(selectedTrack);
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company_tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrack && matchesSearch;
  });

  const readinessScore = currentUser?.readiness_score || 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title & Institution Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Student Lab Workspace
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentUser?.college_name || "Cauvery Institute of Technology, Thanjavur"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Welcome back, {currentUser?.full_name || "Candidate"}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Roll No: {currentUser?.roll_no} • {currentUser?.department} Department (Batch 2026)
          </p>
        </div>

        {/* Quick Proctored Exam Trigger Button */}
        {assessment && (
          <button
            onClick={() => router.push(`/student/exam/${assessment.id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_24px_-4px_rgba(16,185,129,0.4)] transition-all flex-shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Live Mock Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento 1: Placement Readiness Radial / Score */}
        <div className="card-obsidian rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Placement Readiness
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                readinessScore >= 75
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : readinessScore >= 60
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {readinessScore >= 75
                ? "Tier 1 Ready"
                : readinessScore >= 60
                ? "Needs Practice"
                : "At-Risk"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/[0.06]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    readinessScore >= 75
                      ? "text-emerald-400"
                      : readinessScore >= 60
                      ? "text-amber-400"
                      : "text-rose-400"
                  }
                  strokeDasharray={`${readinessScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-extrabold text-sm text-white tabular-nums">
                {readinessScore}%
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Benchmark Hit
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {solvedProblemIds.size} of {problems.length} challenges solved
              </div>
            </div>
          </div>
        </div>

        {/* Bento 2: Coding Streak & Weekly Dots */}
        <div className="card-obsidian rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Active Practice Streak
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                5 Days
              </span>
              <span className="text-[11px] text-amber-400 font-mono font-semibold">
                Consecutive
              </span>
            </div>

            {/* Weekly punch-card dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-full h-2 rounded-full ${
                      idx < 5 ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "bg-white/[0.06]"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-500">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bento 3: Solved Problems Breakdown by Difficulty */}
        <div className="card-obsidian rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Difficulty Mastery
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {solvedProblemIds.size}/{problems.length}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-emerald-400 font-semibold">Easy</span>
                <span>{solvedEasy}/{easyProblems.length}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${(solvedEasy / Math.max(1, easyProblems.length)) * 100}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-amber-400 font-semibold">Medium</span>
                <span>{solvedMedium}/{mediumProblems.length}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${(solvedMedium / Math.max(1, mediumProblems.length)) * 100}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-rose-400 font-semibold">Hard</span>
                <span>{solvedHard}/{hardProblems.length}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full"
                  style={{ width: `${(solvedHard / Math.max(1, hardProblems.length)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bento 4: Upcoming Scheduled Assessment */}
        <div className="card-obsidian rounded-2xl p-5 flex flex-col justify-between space-y-3 border-indigo-500/20 bg-gradient-to-br from-[#111114] via-[#111114] to-indigo-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Live Mock Drive
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-xs text-white line-clamp-1">
              {assessment?.title || "Campus Placement Screening"}
            </h3>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Mandatory proctored assessment with MCQs and live coding rounds.
            </p>
          </div>

          <button
            onClick={() => router.push(`/student/exam/${assessment?.id}`)}
            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Enter Assessment Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Company Tracks & Coding Repository Section */}
      <div className="card-obsidian rounded-2xl p-6 space-y-6">
        {/* Controls: Company Filter Pills + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          {/* Track Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "TCS NQT", "Zoho", "Infosys", "Cognizant"].map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTrack === track
                    ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.04]"
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by challenge title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#141418] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 w-56 sm:w-64"
            />
          </div>
        </div>

        {/* High-Density Problem Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono uppercase text-slate-500 border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Problem Title</th>
                <th className="py-3 px-3">Company Tags</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredProblems.map((p) => {
                const isSolved = solvedProblemIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/student/lab/${p.slug}`)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      {isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20" />
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                        <span>{p.title}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.company_tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          p.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : p.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
                        <span>Solve</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
