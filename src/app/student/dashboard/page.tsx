"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataService } from "@/lib/supabase/db";
import { subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile, Problem, Assessment, Submission, CampusDrive } from "@/types";
import { BlurFade } from "@/components/magicui/blur-fade";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Flame,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────
function greetByTime(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function progressPct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

// ─── Constants ──────────────────────────────────────────────────────
const COMPANY_TAGS = ["All", "TCS NQT", "Zoho", "Infosys", "Cognizant"] as const;

const ACTIVITY_GRID = (() => {
  // Generate 12 weeks × 7 days of simulated activity for the heatmap
  const grid: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      // Later weeks have higher chance of activity to show "improvement"
      const r = Math.random();
      const bias = w / 14;
      week.push(r < 0.2 - bias ? 0 : r < 0.45 ? 1 : r < 0.7 + bias ? 2 : 3);
    }
    grid.push(week);
  }
  return grid;
})();

const HEAT_COLORS = [
  "bg-slate-100",         // 0 — no activity
  "bg-emerald-200",       // 1 — light
  "bg-emerald-400",       // 2 — medium
  "bg-emerald-600",       // 3 — heavy
];

// ─── Component ──────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [drives, setDrives] = useState<CampusDrive[]>([]);

  const [trackFilter, setTrackFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      const u = await DataService.getCurrentUser();
      setUser(u);
      setProblems(await DataService.getProblems());
      const a = await DataService.getAssessments(u.college_name);
      if (a.length) setAssessment(a[0]);
      setSubmissions(await DataService.getSubmissions(u.college_name));
      setDrives((await DataService.getCampusDrives()).slice(0, 3));
    }
    load();
    return subscribeToDemoStore(() => { load(); });
  }, []);

  // ─── Derived data ───────────────────────────────────────────────
  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.user_id === user?.id),
    [submissions, user]
  );
  const solvedIds = useMemo(
    () => new Set(mySubmissions.filter((s) => s.status === "Accepted").map((s) => s.problem_id)),
    [mySubmissions]
  );

  const countByDiff = (diff: string) => problems.filter((p) => p.difficulty === diff).length;
  const solvedByDiff = (diff: string) =>
    problems.filter((p) => p.difficulty === diff && solvedIds.has(p.id)).length;

  const nextProblem = problems.find((p) => !solvedIds.has(p.id)) || problems[0];

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const tag = trackFilter === "All" || p.company_tags.includes(trackFilter);
      const q =
        !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.company_tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return tag && q;
    });
  }, [problems, trackFilter, query]);

  const score = user?.readiness_score ?? 75;

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">

      {/* ━━━ 1. GREETING BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <BlurFade delay={0.04}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              {user?.department ?? "BCA"} · {user?.college_name ?? "Annai Vailankanni Arts and Science College, Thanjavur"}
            </p>
            <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-slate-900 leading-tight">
              {greetByTime()}, {user?.full_name?.split(" ")[0] ?? "Candidate"}
            </h1>
          </div>

          {assessment && (
            <button
              onClick={() => router.push(`/student/exam/${assessment.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium transition-colors active:scale-[0.98] shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mock Exam</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}
        </div>
      </BlurFade>

      {/* ━━━ 2. METRIC STRIP — 4 cards, horizontal ━━━━━━━━━━━━━━━ */}
      <BlurFade delay={0.08}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Score */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Readiness</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                score >= 75
                  ? "bg-emerald-50 text-emerald-700"
                  : score >= 55
                  ? "bg-amber-50 text-amber-700"
                  : "bg-rose-50 text-rose-700"
              }`}>
                {score >= 75 ? "On Track" : score >= 55 ? "Needs Work" : "At Risk"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tabular-nums text-slate-900">{score}</span>
              <span className="text-sm text-slate-400 font-medium">/100</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  score >= 75 ? "bg-emerald-500" : score >= 55 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Problems Solved */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Solved</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tabular-nums text-slate-900">{solvedIds.size}</span>
              <span className="text-sm text-slate-400 font-medium">/{problems.length}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="text-emerald-600">{solvedByDiff("Easy")}E</span>
              <span className="text-amber-600">{solvedByDiff("Medium")}M</span>
              <span className="text-rose-600">{solvedByDiff("Hard")}H</span>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tabular-nums text-slate-900">5</span>
              <span className="text-sm text-slate-400 font-medium">days</span>
              <Flame className="w-4 h-4 text-amber-500 ml-1" />
            </div>
            {/* Mini 7-day dots */}
            <div className="flex items-center gap-1">
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                  <div className={`h-1.5 w-full rounded-full ${i < 5 ? "bg-amber-400" : "bg-slate-100"}`} />
                  <span className="text-[8px] text-slate-400">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Drive */}
          {drives[0] ? (
            <Link
              href="/student/drives"
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-indigo-300 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Next Drive</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-slate-900 line-clamp-1">{drives[0].company_name}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3 h-3" />
                <span>{daysUntil(drives[0].drive_date)}d left</span>
                <span className="text-slate-300">·</span>
                <span>{drives[0].ctc_range}</span>
              </div>
            </Link>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Next Drive</span>
              <div className="text-sm text-slate-400">No drives scheduled</div>
            </div>
          )}
        </div>
      </BlurFade>

      {/* ━━━ 3. CONTINUE WHERE YOU LEFT OFF ━━━━━━━━━━━━━━━━━━━━━━ */}
      {nextProblem && (
        <BlurFade delay={0.12}>
          <button
            onClick={() => router.push(`/practice/two-sum`)}
            className="w-full text-left p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-[#C4F82A] hover:shadow-md transition-all group shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C4F82A]/20 text-[#2D5A12] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C4F82A] group-hover:text-black transition-colors">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#2D5A12] uppercase tracking-wide">Up Next</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-black transition-colors">
                    {nextProblem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className={`font-semibold ${
                      nextProblem.difficulty === "Easy" ? "text-emerald-600"
                      : nextProblem.difficulty === "Medium" ? "text-amber-600"
                      : "text-rose-600"
                    }`}>{nextProblem.difficulty}</span>
                    <span className="text-slate-300">·</span>
                    {nextProblem.company_tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-slate-500 font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-[#C4F82A] hover:bg-[#B5EA20] text-black transition-all shadow-2xs group-hover:scale-105">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        </BlurFade>
      )}

      {/* ━━━ 4. MAIN GRID: Problems (left 8) + Sidebar (right 4) ━ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── LEFT: Problem Library ──────────────────────────── */}
        <div className="lg:col-span-8 space-y-5">
          <BlurFade delay={0.16}>
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Company tag pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {COMPANY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTrackFilter(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      trackFilter === tag
                        ? "bg-[#C4F82A] text-black shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:text-black"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-[11px] pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 pr-3 py-2 w-full sm:w-56 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
          </BlurFade>

          {/* Problem list */}
          <BlurFade delay={0.2}>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
              {/* Table header */}
              <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wide bg-slate-50/60">
                <div className="col-span-1">Status</div>
                <div className="col-span-6">Problem</div>
                <div className="col-span-3">Tags</div>
                <div className="col-span-2 text-right">Difficulty</div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-16 text-center space-y-2">
                  <Code2 className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500">No problems match your filters</p>
                  <button
                    onClick={() => { setTrackFilter("All"); setQuery(""); }}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((p) => {
                  const solved = solvedIds.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/practice/${p.slug || p.id}`)}
                      className="w-full grid grid-cols-12 items-center px-5 py-3.5 text-left hover:bg-slate-50 transition-colors group"
                    >
                      {/* Status */}
                      <div className="col-span-1">
                        {solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-[1.5px] border-slate-300 group-hover:border-indigo-400 transition-colors" />
                        )}
                      </div>

                      {/* Title */}
                      <div className="col-span-6">
                        <span className="text-[13px] font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">
                          {p.title}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="col-span-3 flex flex-wrap gap-1">
                        {p.company_tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-2 text-right">
                        <span className={`text-[11px] font-semibold ${
                          p.difficulty === "Easy" ? "text-emerald-600"
                          : p.difficulty === "Medium" ? "text-amber-600"
                          : "text-rose-600"
                        }`}>
                          {p.difficulty}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </BlurFade>
        </div>

        {/* ─── RIGHT: Sidebar ─────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Activity Heatmap (GitHub-style) */}
          <BlurFade delay={0.16}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Activity
                </span>
                <span className="text-xs font-medium text-slate-700">
                  84 submissions
                </span>
              </div>

              {/* Grid */}
              <div className="flex gap-[3px]">
                {ACTIVITY_GRID.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((level, di) => (
                      <div
                        key={di}
                        className={`w-[11px] h-[11px] rounded-[2px] ${HEAT_COLORS[level]}`}
                        title={`Week ${wi + 1}, Day ${di + 1}: ${level === 0 ? "No" : level} submissions`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>Less</span>
                {HEAT_COLORS.map((c, i) => (
                  <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${c}`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </BlurFade>

          {/* Difficulty Breakdown */}
          <BlurFade delay={0.2}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Difficulty
              </span>

              <div className="space-y-3">
                {([
                  { label: "Easy", color: "bg-emerald-500", textColor: "text-emerald-600" },
                  { label: "Medium", color: "bg-amber-500", textColor: "text-amber-600" },
                  { label: "Hard", color: "bg-rose-500", textColor: "text-rose-600" },
                ] as const).map(({ label, color, textColor }) => {
                  const total = countByDiff(label);
                  const done = solvedByDiff(label);
                  const pct = progressPct(done, total);
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className={`font-semibold ${textColor}`}>{label}</span>
                        <span className="text-slate-500 tabular-nums">{done}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </BlurFade>

          {/* Upcoming Drives */}
          <BlurFade delay={0.24}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Drives
                </span>
                <Link href="/student/drives" className="text-[11px] font-medium text-indigo-600 hover:underline">
                  All
                </Link>
              </div>

              <div className="space-y-2.5">
                {drives.map((d) => {
                  const days = daysUntil(d.drive_date);
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 hover:bg-white hover:border-slate-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-slate-800">{d.company_name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          d.status === "Ongoing"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {d.status === "Ongoing" ? "Live" : `${days}d`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {d.role_title} &middot; {d.ctc_range}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </BlurFade>

          {/* Recent Submissions */}
          <BlurFade delay={0.28}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Submissions
              </span>

              {mySubmissions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No submissions yet.</p>
              ) : (
                <div className="space-y-2">
                  {mySubmissions.slice(0, 4).map((s, i) => (
                    <div key={s.id || i} className="flex items-center justify-between py-1.5">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-medium text-slate-800 line-clamp-1">
                          {s.problem_title ?? "Challenge"}
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {s.language.toUpperCase()} &middot; {s.execution_time_ms}ms
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.status === "Accepted"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-600"
                      }`}>
                        {s.status === "Accepted" ? "AC" : s.status.split(" ").map(w => w[0]).join("")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BlurFade>

          {/* Quick Links */}
          <BlurFade delay={0.32}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Actions</span>
              <div className="space-y-1">
                <Link
                  href="/curriculum"
                  className="flex items-center justify-between py-2 px-1 text-[13px] font-medium text-indigo-700 hover:text-indigo-900 transition-colors group"
                >
                  <span className="font-semibold">Curriculum</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-700 transition-colors" />
                </Link>
                <Link
                  href="/student/resume"
                  className="flex items-center justify-between py-2 px-1 text-[13px] font-medium text-slate-700 hover:text-indigo-700 transition-colors group"
                >
                  <span>Resume</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </Link>
                <Link
                  href="/student/drives"
                  className="flex items-center justify-between py-2 px-1 text-[13px] font-medium text-slate-700 hover:text-indigo-700 transition-colors group"
                >
                  <span>Drives</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </Link>
                {assessment && (
                  <button
                    onClick={() => router.push(`/student/exam/${assessment.id}`)}
                    className="flex items-center justify-between py-2 px-1 w-full text-left text-[13px] font-medium text-slate-700 hover:text-indigo-700 transition-colors group"
                  >
                    <span>Assessment</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
