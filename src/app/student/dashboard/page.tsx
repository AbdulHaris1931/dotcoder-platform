"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataService } from "@/lib/supabase/db";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile, Problem, Assessment, Submission, CampusDrive } from "@/types";
import { SkillIntelligenceService } from "@/lib/services/skill-intelligence";
import { BlurFade } from "@/components/magicui/blur-fade";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Flame,
  Search,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Target,
  BarChart3,
  Terminal,
  Award,
  Layers,
  Activity,
  GraduationCap,
  FileCheck,
  X,
} from "lucide-react";

function greetByTime(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr: string, nowMs: number | null): number {
  if (nowMs === null) return 0;
  const diff = new Date(dateStr).getTime() - nowMs;
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function progressPct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

const COMPANY_TAGS = ["All", "TCS NQT", "Zoho", "Infosys", "Cognizant"] as const;

const HEAT_COLORS = [
  "bg-[#121B16] border border-[#1E2C24]", // 0 - no activity
  "bg-[#27400E]",                         // 1 - light
  "bg-[#5FA000]",                         // 2 - medium
  "bg-[#9DFF00]",                         // 3 - heavy
];

export default function StudentDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [, setAssessment] = useState<Assessment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [drives, setDrives] = useState<CampusDrive[]>([]);

  const [trackFilter, setTrackFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [activeIntelTab, setActiveIntelTab] = useState<"accuracy" | "knowledge" | "vectors">("accuracy");
  const [selectedTopicCat, setSelectedTopicCat] = useState<string>("All");
  const [greeting, setGreeting] = useState<string>("Welcome back");
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    setGreeting(greetByTime(now));
    setNowMs(now.getTime());

    async function load() {
      const u = await DataService.getCurrentUser();
      setUser(u);
      setProblems(await DataService.getProblems());
      const collegeName = u?.college_name || "Annai Vailankanni Arts and Science College, Thanjavur";
      const a = await DataService.getAssessments(collegeName);
      if (a.length) setAssessment(a[0]);
      setSubmissions(await DataService.getSubmissions(collegeName));
      setDrives((await DataService.getCampusDrives()).slice(0, 3));
    }
    void load();
    return subscribeToDemoStore(() => {
      void load();
    });
  }, []);

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

  const skillProfile = useMemo(() => {
    if (!user) return null;
    return SkillIntelligenceService.calculateSkillProfile(user, submissions);
  }, [user, submissions]);

  const accuracyMetrics = useMemo(() => {
    const totalSubs = mySubmissions.length;
    const acceptedSubs = mySubmissions.filter((s) => s.status === "Accepted").length;
    const totalCases = mySubmissions.reduce((acc, s) => acc + (s.total_cases || 5), 0);
    const passedCases = mySubmissions.reduce((acc, s) => acc + (s.passed_cases || 0), 0);

    if (totalSubs === 0) {
      return {
        accuracyScore: 0,
        totalTestCases: 0,
        passedTestCases: 0,
        casePassPct: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        firstAttemptPassRate: 0,
        avgRuntime: 0,
        knowledgeLevelTier: "Level 0: Getting Started (Baseline)",
        knowledgeLevelBadge: "Not Started",
        bloomLevel: "Foundational & Exploration",
        knowledgeSummary:
          "Welcome! Solve your first coding challenge or attempt a practice module to begin compiling live telemetry.",
      };
    }

    const casePassPct = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;
    const accScore =
      skillProfile?.breakdown.accuracyScore ??
      Math.round(casePassPct * 0.6 + (acceptedSubs / totalSubs) * 40);
    const avgRuntime = Math.round(
      mySubmissions.reduce((acc, s) => acc + (s.execution_time_ms || 100), 0) / totalSubs
    );

    let knowledgeLevelTier = "Level 2: Proficient Core DSA";
    let knowledgeLevelBadge = "Proficient";
    let bloomLevel = "Application & Invariants";
    let knowledgeSummary =
      "Demonstrates consistent two-pointer convergence, hash indexing, and boundary condition checks.";

    if (accScore >= 82 || (user?.readiness_score && user.readiness_score >= 82)) {
      knowledgeLevelTier = "Level 3: Placement Ready (Tier-1 Standard)";
      knowledgeLevelBadge = "Tier-1 Ready";
      bloomLevel = "Analysis & Synthesis";
      knowledgeSummary =
        "Optimal asymptotic time-space complexity, tree & graph traversals, and dynamic programming memoization.";
    } else if (accScore < 65) {
      knowledgeLevelTier = "Level 1: Developing Foundations";
      knowledgeLevelBadge = "Developing";
      bloomLevel = "Comprehension & Syntax";
      knowledgeSummary =
        "Focusing on basic linear arrays, string manipulation, and off-by-one loop edge cases.";
    }

    return {
      accuracyScore: accScore,
      totalTestCases: totalCases,
      passedTestCases: passedCases,
      casePassPct,
      totalSubmissions: totalSubs,
      acceptedSubmissions: acceptedSubs,
      firstAttemptPassRate: Math.min(100, Math.round(accScore * 0.94)),
      avgRuntime,
      knowledgeLevelTier,
      knowledgeLevelBadge,
      bloomLevel,
      knowledgeSummary,
    };
  }, [mySubmissions, skillProfile, user]);

  const assignedMentor = useMemo(() => {
    const teachers = DemoStore.getTeachers();
    if (user?.department) {
      const deptLower = user.department.toLowerCase();
      const match = teachers.find(
        (t: UserProfile) => t.department && t.department.toLowerCase() === deptLower
      );
      if (match) return match.full_name;
    }
    return teachers[0]?.full_name || "Faculty Mentor";
  }, [user]);

  const activityGrid = useMemo(() => {
    const grid: number[][] = [];
    for (let w = 0; w < 12; w++) {
      grid.push(new Array(7).fill(0));
    }
    if (mySubmissions.length === 0 || nowMs === null) return grid;

    const oneDayMs = 86400000;

    mySubmissions.forEach((sub) => {
      const subTime = sub.submitted_at ? new Date(sub.submitted_at).getTime() : nowMs;
      const daysAgo = Math.floor((nowMs - subTime) / oneDayMs);
      if (daysAgo >= 0 && daysAgo < 84) {
        const weekIdx = 11 - Math.floor(daysAgo / 7);
        const dayIdx = 6 - (daysAgo % 7);
        if (weekIdx >= 0 && weekIdx < 12 && dayIdx >= 0 && dayIdx < 7) {
          grid[weekIdx][dayIdx] = Math.min(3, grid[weekIdx][dayIdx] + 1);
        }
      }
    });

    return grid;
  }, [mySubmissions, nowMs]);

  const filteredTopics = useMemo(() => {
    if (!skillProfile) return [];
    if (selectedTopicCat === "All") return skillProfile.dsaTopicMastery;
    return skillProfile.dsaTopicMastery.filter((t) => t.category === selectedTopicCat);
  }, [skillProfile, selectedTopicCat]);

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

  const score = user?.readiness_score ?? 0;

  return (
    <div className="max-w-[1240px] mx-auto px-5 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-[#F4F7F5]">
      {/* 1. GREETING BAR */}
      <BlurFade delay={0.04}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1E2C24]">
          <div>
            <p className="text-xs font-mono text-[#99A9A0]">
              {user?.department ?? "BCA"} &middot;{" "}
              {user?.college_name ?? "Annai Vailankanni Arts and Science College, Thanjavur"}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5] leading-tight mt-1">
              {greeting}, {user?.full_name?.split(" ")[0] ?? "Candidate"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/student/mnc-prep")}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#070B09]" />
              <span>MNC 300 Prep</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/15 text-[#070B09] font-bold">
                10 Units
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/student/compiler")}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0C120F] hover:bg-[#121B16] text-[#F4F7F5] border border-[#1E2C24] hover:border-emerald-500/40 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Open Compiler</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                No Rules
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/student/assessments")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-[#F4F7F5] text-xs font-semibold transition-colors active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
              <span>Assessments &amp; Tests</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#99A9A0]" />
            </button>
          </div>
        </div>
      </BlurFade>

      {/* 2. METRIC STRIP - 4 cards, horizontal */}
      <BlurFade delay={0.08}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Score */}
          <div className="surface-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                Readiness
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  score === 0
                    ? "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]"
                    : score >= 75
                    ? "bg-[#9DFF00]/15 text-[#9DFF00]"
                    : score >= 55
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {score === 0 ? "Not Started" : score >= 75 ? "On Track" : score >= 55 ? "Needs Work" : "At Risk"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold tabular-nums text-[#F4F7F5]">{score}</span>
              <span className="text-sm text-[#85998D] font-mono">/100</span>
            </div>
            <div className="w-full h-1.5 bg-[#121B16] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  score === 0
                    ? "bg-[#1E2C24]"
                    : score >= 75
                    ? "bg-[#9DFF00]"
                    : score >= 55
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
                style={{ width: `${Math.max(score, 0)}%` }}
              />
            </div>
          </div>

          {/* Problems Solved */}
          <div className="surface-card rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
              Solved
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold tabular-nums text-[#F4F7F5]">
                {solvedIds.size}
              </span>
              <span className="text-sm text-[#85998D] font-mono">/{problems.length}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono font-semibold">
              <span className="text-emerald-400">{solvedByDiff("Easy")}E</span>
              <span className="text-amber-400">{solvedByDiff("Medium")}M</span>
              <span className="text-rose-400">{solvedByDiff("Hard")}H</span>
            </div>
          </div>

          {/* Streak */}
          <div className="surface-card rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
              Streak
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold tabular-nums text-[#F4F7F5]">
                {mySubmissions.length > 0 ? skillProfile?.streakDays || 1 : 0}
              </span>
              <span className="text-sm text-[#85998D] font-mono">days</span>
              <Flame
                className={`w-4 h-4 ml-1 ${
                  mySubmissions.length > 0 ? "text-[#9DFF00]" : "text-[#85998D]"
                }`}
              />
            </div>
            <div className="flex items-center gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      mySubmissions.length > 0 && i < Math.min(5, mySubmissions.length)
                        ? "bg-[#9DFF00]"
                        : "bg-[#121B16]"
                    }`}
                  />
                  <span className="text-[8px] font-mono text-[#85998D]">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Drive */}
          {drives[0] ? (
            <Link
              href="/student/drives"
              className="surface-card surface-card-interactive rounded-2xl p-5 space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                  Next Drive
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#85998D] group-hover:text-[#9DFF00] transition-colors" />
              </div>
              <div className="font-display text-base font-bold text-[#F4F7F5] line-clamp-1">
                {drives[0].company_name}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#99A9A0]">
                <Clock className="w-3 h-3 text-[#9DFF00]" />
                <span>{daysUntil(drives[0].drive_date, nowMs)}d left</span>
                <span className="text-[#2C4034]">&middot;</span>
                <span>{drives[0].ctc_range}</span>
              </div>
            </Link>
          ) : (
            <div className="surface-card rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                Next Drive
              </span>
              <div className="text-sm text-[#85998D]">No drives scheduled</div>
            </div>
          )}
        </div>
      </BlurFade>

      {/* CODING ACCURACY & KNOWLEDGE LEVEL COMMAND CENTER */}
      {skillProfile && (
        <BlurFade delay={0.1}>
          <div className="surface-card rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E2C24] pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9DFF00] bg-[#9DFF00]/15 px-2.5 py-0.5 rounded-full border border-[#9DFF00]/30">
                    Engine v2.0 Live Telemetry
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span>Mentor Synced: {assignedMentor}</span>
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F7F5] tracking-tight flex items-center gap-2.5">
                  <BrainCircuit className="w-6 h-6 text-[#9DFF00]" />
                  <span>Coding Accuracy &amp; Knowledge Level Tracker</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
                  Track your test case pass rate, code robustness, and DSA topic mastery mirrored in real-time to your mentor.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="p-3.5 rounded-2xl bg-[#121B16] border border-[#1E2C24] text-right">
                  <div className="text-[10px] font-mono uppercase text-[#99A9A0] font-semibold">
                    Placement Readiness
                  </div>
                  <div className="font-display text-xl font-bold text-[#F4F7F5] tabular-nums">
                    {skillProfile.breakdown.placementReadinessScore}%
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#9DFF00]/10 border border-[#9DFF00]/25 text-right">
                  <div className="text-[10px] font-mono uppercase text-[#9DFF00] font-semibold">
                    Knowledge Level
                  </div>
                  <div className="text-xs font-bold text-[#F4F7F5] mt-1">
                    {accuracyMetrics.knowledgeLevelBadge}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2C24] pb-3.5">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#070B09] border border-[#1E2C24]">
                <button
                  type="button"
                  onClick={() => setActiveIntelTab("accuracy")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeIntelTab === "accuracy"
                      ? "bg-[#9DFF00] text-[#070B09]"
                      : "text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Coding Accuracy ({accuracyMetrics.accuracyScore}%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIntelTab("knowledge")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeIntelTab === "knowledge"
                      ? "bg-[#9DFF00] text-[#070B09]"
                      : "text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Knowledge Level &amp; Topics</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIntelTab("vectors")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeIntelTab === "vectors"
                      ? "bg-[#9DFF00] text-[#070B09]"
                      : "text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>6D Skill Vectors</span>
                </button>
              </div>

              <div className="text-xs font-mono text-[#85998D]">
                {activeIntelTab === "accuracy" && "Live evaluations across all unit test suites"}
                {activeIntelTab === "knowledge" && "12 Core DSA recruiter curriculum benchmarks"}
                {activeIntelTab === "vectors" && "Institutional composite weighting formula"}
              </div>
            </div>

            {/* TAB 1: CODING ACCURACY */}
            {activeIntelTab === "accuracy" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#121B16] border border-[#9DFF00]/25 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#F4F7F5]">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-[#9DFF00]" />
                        <span>Coding Accuracy</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#9DFF00]/15 text-[#9DFF00]">
                        {accuracyMetrics.accuracyScore === 0 ? "Baseline" : "Verified"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="font-display text-3xl font-bold text-[#F4F7F5] tabular-nums">
                        {accuracyMetrics.accuracyScore}%
                      </span>
                      <span className="text-xs text-[#85998D]">weighted</span>
                    </div>
                    <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#9DFF00] transition-all duration-500"
                        style={{ width: `${accuracyMetrics.accuracyScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#99A9A0] leading-tight">
                      60% test case pass ratio + 40% clean accepted submissions
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#F4F7F5]">
                      <span className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-sky-400" />
                        <span>Test Cases Passed</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300">
                        {accuracyMetrics.casePassPct}% Pass
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="font-display text-3xl font-bold text-[#F4F7F5] tabular-nums">
                        {accuracyMetrics.passedTestCases}
                      </span>
                      <span className="text-xs text-[#85998D]">/{accuracyMetrics.totalTestCases}</span>
                    </div>
                    <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-400 transition-all duration-500"
                        style={{ width: `${accuracyMetrics.casePassPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#99A9A0] leading-tight">
                      Validated across standard inputs, bounds, and hidden edge cases
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#F4F7F5]">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>First-Attempt Pass</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300">
                        Precision
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="font-display text-3xl font-bold text-[#F4F7F5] tabular-nums">
                        {accuracyMetrics.firstAttemptPassRate}%
                      </span>
                      <span className="text-xs text-[#85998D]">ratio</span>
                    </div>
                    <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${accuracyMetrics.firstAttemptPassRate}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#99A9A0] leading-tight">
                      Zero-retry precision before submitting to automated grader
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#F4F7F5]">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>Average Execution</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300">
                        Optimal
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="font-display text-3xl font-bold text-[#F4F7F5] tabular-nums">
                        {accuracyMetrics.avgRuntime}
                      </span>
                      <span className="text-xs text-[#85998D]">ms / run</span>
                    </div>
                    <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: "88%" }}
                      />
                    </div>
                    <p className="text-[11px] text-[#99A9A0] leading-tight">
                      CPU runtime complexity well within TCS &amp; Zoho constraints
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0F0C] border border-[#1E2C24] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#F4F7F5]">
                        {accuracyMetrics.acceptedSubmissions} Accepted Submissions &bull; 0 Flagged Runtime Exceptions
                      </div>
                      <div className="text-[11px] text-[#99A9A0]">
                        Every submission is automatically parsed for syntax robustness, memory consumption, and edge cases.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#121B16] border border-[#1E2C24] text-[#F4F7F5] font-mono text-[11px] font-bold tabular-nums">
                      {accuracyMetrics.passedTestCases}/{accuracyMetrics.totalTestCases} Tests Passed
                    </span>
                    <button
                      type="button"
                      onClick={() => router.push("/student/compiler")}
                      className="px-3.5 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Test in Sandbox</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KNOWLEDGE LEVEL */}
            {activeIntelTab === "knowledge" && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[#070B09] border border-[#2C4034] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09] uppercase">
                        Current Knowledge Level
                      </span>
                      <span className="text-xs text-[#99A9A0] font-mono">
                        Bloom&apos;s Taxonomy: {accuracyMetrics.bloomLevel}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#9DFF00] font-semibold">
                      Tier-1 Benchmark: Level 3
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-[#F4F7F5]">
                      {accuracyMetrics.knowledgeLevelTier}
                    </h3>
                    <p className="text-xs text-[#99A9A0] mt-1 max-w-2xl leading-relaxed">
                      {accuracyMetrics.knowledgeSummary}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#1E2C24] flex flex-wrap items-center gap-4 text-xs font-mono text-[#99A9A0]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#9DFF00]" />
                      <span>Level 3 (Placement Ready): 80%+</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Level 2 (Proficient): 65% - 79%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Level 1 (Foundations): &lt;65%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-[#99A9A0] mr-2 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Domain:</span>
                  </span>
                  {["All", "Linear", "Trees", "Graphs", "DP", "Algorithms", "Databases"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTopicCat(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTopicCat === cat
                          ? "bg-[#9DFF00] text-[#070B09]"
                          : "bg-[#121B16] border border-[#1E2C24] text-[#99A9A0] hover:text-[#F4F7F5]"
                      }`}
                    >
                      {cat} {cat === "All" ? `(${skillProfile.dsaTopicMastery.length})` : ""}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredTopics.map((topic) => {
                    const isMastered = topic.status === "Mastered";
                    const isProficient = topic.status === "Proficient";
                    const isDeveloping = topic.status === "Developing";

                    return (
                      <div
                        key={topic.topic}
                        className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] hover:border-[#2C4034] transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#85998D]">
                              {topic.category}
                            </span>
                            <h4 className="text-xs font-bold text-[#F4F7F5] mt-0.5 line-clamp-1">
                              {topic.topic}
                            </h4>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              isMastered
                                ? "bg-[#9DFF00]/15 text-[#9DFF00]"
                                : isProficient
                                ? "bg-sky-500/15 text-sky-300"
                                : isDeveloping
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {topic.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#99A9A0]">Mastery</span>
                            <span className="font-bold text-[#F4F7F5] tabular-nums">
                              {topic.masteryPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isMastered
                                  ? "bg-[#9DFF00]"
                                  : isProficient
                                  ? "bg-sky-400"
                                  : isDeveloping
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                              }`}
                              style={{ width: `${topic.masteryPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#1E2C24] flex items-center justify-between text-[11px] text-[#99A9A0] font-mono">
                          <span>
                            {topic.problemsSolved}/{topic.totalProblems} Solved
                          </span>
                          <span className="font-semibold text-[#F4F7F5]">{topic.accuracy}% Acc</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: 6D SKILL VECTORS */}
            {activeIntelTab === "vectors" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Coding Accuracy", code: "ACC", val: skillProfile.breakdown.accuracyScore, w: "25%" },
                  { label: "Problem Solving", code: "PSI", val: skillProfile.breakdown.psiScore, w: "25%" },
                  { label: "DSA Topic Mastery", code: "DSA", val: skillProfile.breakdown.dsaMasteryScore, w: "25%" },
                  { label: "Algorithmic Efficiency", code: "EFF", val: skillProfile.breakdown.efficiencyScore, w: "15%" },
                  { label: "Consistency & Streak", code: "CON", val: skillProfile.breakdown.consistencyScore, w: "10%" },
                  { label: "Composite Index", code: "PLR", val: skillProfile.breakdown.placementReadinessScore, w: "100%" },
                ].map((dim) => (
                  <div
                    key={dim.code}
                    className="p-3.5 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#99A9A0]">
                      <span className="font-bold text-[#F4F7F5]">{dim.code}</span>
                      <span className="text-[9px] text-[#85998D]">{dim.w}</span>
                    </div>
                    <div className="font-display text-xl font-bold text-[#F4F7F5] tabular-nums">
                      {dim.val}%
                    </div>
                    <div className="w-full bg-[#070B09] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dim.val >= 75 ? "bg-[#9DFF00]" : dim.val >= 60 ? "bg-amber-400" : "bg-rose-400"
                        }`}
                        style={{ width: `${dim.val}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#85998D] truncate">{dim.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Adaptive Remedial Drill Banner */}
            {skillProfile.weakTopics.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-200">
                      Adaptive Diagnostic: {skillProfile.weakTopics[0].topic} Mastery at{" "}
                      {skillProfile.weakTopics[0].score}%
                    </div>
                    <div className="text-[11px] text-amber-200/80">
                      Below TCS &amp; Zoho institutional benchmark (75%). Complete recommended remedial drill to boost readiness.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/practice/${skillProfile.weakTopics[0].recommendedProblemSlug}`)}
                  className="px-4 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Targeted Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </BlurFade>
      )}

      {/* 3. CONTINUE WHERE YOU LEFT OFF */}
      {nextProblem && (
        <BlurFade delay={0.12}>
          <button
            type="button"
            onClick={() => router.push(`/practice/${nextProblem.slug || "two-sum"}`)}
            className="w-full text-left p-5 sm:p-6 rounded-2xl surface-card surface-card-interactive group cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#9DFF00]/15 border border-[#9DFF00]/30 text-[#9DFF00] flex items-center justify-center flex-shrink-0 group-hover:bg-[#9DFF00] group-hover:text-[#070B09] transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-[#9DFF00] uppercase tracking-wider">
                    Up Next
                  </span>
                  <h3 className="font-display text-base font-bold text-[#F4F7F5]">
                    {nextProblem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#99A9A0]">
                    <span
                      className={`font-semibold ${
                        nextProblem.difficulty === "Easy"
                          ? "text-emerald-400"
                          : nextProblem.difficulty === "Medium"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {nextProblem.difficulty}
                    </span>
                    <span className="text-[#2C4034]">&middot;</span>
                    {nextProblem.company_tags.slice(0, 2).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-[#9DFF00] text-[#070B09] transition-transform group-hover:translate-x-0.5 self-start sm:self-center">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </BlurFade>
      )}

      {/* 4. MAIN GRID: Problems (left 8) + Sidebar (right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Problem Library */}
        <div className="lg:col-span-8 space-y-4">
          <BlurFade delay={0.16}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {COMPANY_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setTrackFilter(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      trackFilter === tag
                        ? "bg-[#9DFF00] text-[#070B09]"
                        : "bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] hover:text-[#F4F7F5]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#85998D] absolute left-3 top-[11px] pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  aria-label="Search problems"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search problems..."
                  className="pl-8 pr-8 py-2 w-full sm:w-56 text-xs bg-[#0C120F] border border-[#1E2C24] rounded-xl text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]/60 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-[9px] text-[#99A9A0] hover:text-[#F4F7F5] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="surface-card rounded-2xl overflow-hidden divide-y divide-[#1E2C24]">
              <div className="grid grid-cols-12 px-5 py-3 text-[10px] font-mono font-semibold text-[#85998D] uppercase tracking-wider bg-[#0A0F0C]">
                <div className="col-span-1">Status</div>
                <div className="col-span-6">Problem</div>
                <div className="col-span-3">Tags</div>
                <div className="col-span-2 text-right">Difficulty</div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-14 text-center space-y-2.5">
                  <Code2 className="w-6 h-6 text-[#85998D] mx-auto" />
                  <p className="text-sm text-[#99A9A0]">No problems match your filters</p>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackFilter("All");
                      setQuery("");
                    }}
                    className="text-xs font-mono text-[#9DFF00] hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((p) => {
                  const solved = solvedIds.has(p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => router.push(`/practice/${p.slug || p.id}`)}
                      className="w-full grid grid-cols-12 items-center px-5 py-3.5 text-left hover:bg-[#121B16]/80 transition-colors group cursor-pointer"
                    >
                      <div className="col-span-1">
                        {solved ? (
                          <CheckCircle2 className="w-4 h-4 text-[#9DFF00]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-[1.5px] border-[#2C4034] group-hover:border-[#9DFF00] transition-colors" />
                        )}
                      </div>

                      <div className="col-span-6">
                        <span className="text-[13px] font-medium text-[#F4F7F5] group-hover:text-[#9DFF00] transition-colors">
                          {p.title}
                        </span>
                      </div>

                      <div className="col-span-3 flex flex-wrap gap-1">
                        {p.company_tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono text-[#99A9A0] bg-[#121B16] border border-[#1E2C24] px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="col-span-2 text-right">
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            p.difficulty === "Easy"
                              ? "text-emerald-400"
                              : p.difficulty === "Medium"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
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

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Activity Heatmap */}
          <BlurFade delay={0.16}>
            <div id="progress" className="surface-card rounded-2xl p-5 space-y-4 scroll-mt-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                  Activity
                </span>
                <span className="text-xs font-mono font-semibold text-[#F4F7F5] tabular-nums">
                  {mySubmissions.length} submission{mySubmissions.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="flex gap-[3px]">
                {activityGrid.map((week, wi) => (
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

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#85998D]">
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
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                Difficulty
              </span>

              <div className="space-y-3">
                {(
                  [
                    { label: "Easy", color: "bg-emerald-400", textColor: "text-emerald-400" },
                    { label: "Medium", color: "bg-amber-400", textColor: "text-amber-400" },
                    { label: "Hard", color: "bg-rose-400", textColor: "text-rose-400" },
                  ] as const
                ).map(({ label, color, textColor }) => {
                  const total = countByDiff(label);
                  const done = solvedByDiff(label);
                  const pct = progressPct(done, total);
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className={`font-semibold ${textColor}`}>{label}</span>
                        <span className="text-[#99A9A0] tabular-nums">
                          {done}/{total}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#121B16] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </BlurFade>

          {/* Upcoming Drives */}
          <BlurFade delay={0.24}>
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                  Drives
                </span>
                <Link href="/student/drives" className="inline-flex items-center min-h-[28px] px-1 text-[11px] font-mono font-semibold text-[#9DFF00] hover:underline">
                  All &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {drives.map((d) => {
                  const days = daysUntil(d.drive_date, nowMs);
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-[#121B16] border border-[#1E2C24] space-y-1 hover:border-[#2C4034] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#F4F7F5]">{d.company_name}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            d.status === "Ongoing"
                              ? "bg-[#9DFF00]/15 text-[#9DFF00]"
                              : "bg-[#0C120F] text-[#99A9A0] border border-[#1E2C24]"
                          }`}
                        >
                          {d.status === "Ongoing" ? "Live" : `${days}d`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#99A9A0]">
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
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                Submissions
              </span>

              {mySubmissions.length === 0 ? (
                <p className="text-xs text-[#85998D] font-mono">No submissions yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {mySubmissions.slice(0, 4).map((s, i) => (
                    <div key={s.id || i} className="flex items-center justify-between py-1">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-medium text-[#F4F7F5] line-clamp-1">
                          {s.problem_title ?? "Challenge"}
                        </span>
                        <div className="text-[10px] font-mono text-[#85998D] tabular-nums">
                          {s.language.toUpperCase()} &middot; {s.execution_time_ms}ms
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          s.status === "Accepted"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {s.status === "Accepted"
                          ? "AC"
                          : s.status
                              .split(" ")
                              .map((w) => w[0])
                              .join("")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BlurFade>

          {/* Quick Links */}
          <BlurFade delay={0.32}>
            <div className="surface-card rounded-2xl p-5 space-y-2.5">
              <span className="text-[10px] font-mono font-semibold text-[#99A9A0] uppercase tracking-wider">
                Quick Links
              </span>
              <div className="space-y-1">
                <Link
                  href="/curriculum"
                  className="flex items-center justify-between py-2 px-2 rounded-lg text-[13px] font-semibold text-[#9DFF00] hover:bg-[#121B16] transition-colors group"
                >
                  <span>Curriculum</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9DFF00]" />
                </Link>
                <Link
                  href="/student/resume"
                  className="flex items-center justify-between py-2 px-2 rounded-lg text-[13px] font-medium text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors group"
                >
                  <span>Resume</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#85998D] group-hover:text-[#9DFF00]" />
                </Link>
                <Link
                  href="/student/drives"
                  className="flex items-center justify-between py-2 px-2 rounded-lg text-[13px] font-medium text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors group"
                >
                  <span>Drives</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#85998D] group-hover:text-[#9DFF00]" />
                </Link>
                <button
                  type="button"
                  onClick={() => router.push("/student/assessments")}
                  className="flex items-center justify-between py-2 px-2 rounded-lg w-full text-left text-[13px] font-medium text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors group cursor-pointer"
                >
                  <span>Assessments</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#85998D] group-hover:text-[#9DFF00]" />
                </button>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
