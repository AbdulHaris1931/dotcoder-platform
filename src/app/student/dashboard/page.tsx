"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataService } from "@/lib/supabase/db";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile, Problem, Assessment, Submission, CampusDrive } from "@/types";
import { BlurFade } from "@/components/magicui/blur-fade";
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
  Check,
  Briefcase,
  Play,
  Filter,
  BarChart2,
  Bookmark,
  Calendar,
  ExternalLink,
  Target,
} from "lucide-react";

interface TrackInfo {
  id: string;
  name: string;
  role: string;
  ctc: string;
  tag: string;
  color: string;
  badgeColor: string;
}

const PREPARATION_TRACKS: TrackInfo[] = [
  {
    id: "all",
    name: "All Challenges",
    role: "Comprehensive Syllabus",
    ctc: "Full Stack & DSA",
    tag: "All",
    color: "from-indigo-600 to-violet-600",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "zoho",
    name: "Zoho Corporation",
    role: "SDE - Round 1 & 2 Coding",
    ctc: "₹6.5 - ₹8.5 LPA",
    tag: "Zoho",
    color: "from-blue-600 to-indigo-600",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "tcs",
    name: "TCS Digital / Ninja",
    role: "NQT Advanced Coding",
    ctc: "₹7.5 LPA",
    tag: "TCS NQT",
    color: "from-purple-600 to-pink-600",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "infosys",
    name: "Infosys Specialist",
    role: "Specialist Programmer (SP)",
    ctc: "₹9.5 LPA",
    tag: "Infosys",
    color: "from-sky-600 to-blue-600",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "cognizant",
    name: "Cognizant GenC",
    role: "GenC Next Developer",
    ctc: "₹6.75 LPA",
    tag: "Cognizant",
    color: "from-emerald-600 to-teal-600",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export default function StudentDashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [drives, setDrives] = useState<CampusDrive[]>([]);

  // Filtering states
  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Unsolved" | "Solved">("All");
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

      const campusDrives = await DataService.getCampusDrives();
      setDrives(campusDrives.slice(0, 3));
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

  // Filtered problems
  const filteredProblems = problems.filter((p) => {
    const matchesTrack =
      selectedTrack === "All" || p.company_tags.includes(selectedTrack);

    const matchesDifficulty =
      difficultyFilter === "All" || p.difficulty === difficultyFilter;

    const isSolved = solvedProblemIds.has(p.id);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Solved" && isSolved) ||
      (statusFilter === "Unsolved" && !isSolved);

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company_tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTrack && matchesDifficulty && matchesStatus && matchesSearch;
  });

  // Pick the recommended "Hero Challenge" (first unsolved problem or fallback)
  const heroProblem = problems.find((p) => !solvedProblemIds.has(p.id)) || problems[0];

  const readinessScore = currentUser?.readiness_score || 75;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* 1. Header: Student Identity & Live Mode Status */}
      <BlurFade delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80">
                Candidate Workspace
              </span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {currentUser?.college_name || "Cauvery Institute of Technology, Thanjavur"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {currentUser?.full_name?.split(" ")[0] || "Candidate"}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Roll No: {currentUser?.roll_no || "22CS001"} • {currentUser?.department || "CSE"} Department (Batch {currentUser?.batch_year || 2026})
            </p>
          </div>

          {/* Right Header Badges & Fast Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/student/resume"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified ATS Resume</span>
            </Link>

            {assessment && (
              <button
                type="button"
                onClick={() => router.push(`/student/exam/${assessment.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Enter Proctored Exam</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </BlurFade>

      {/* 2. Main 12-Column Layout: 8 Cols Core Curriculum + 4 Cols Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: 8 Columns Main Workspace Feed               */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-8">
          {/* A. Hero Recommended Problem Card ("Continue Coding") */}
          {heroProblem && (
            <BlurFade delay={0.1}>
              <div className="relative rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#101526] to-[#0A0D17] text-white p-6 sm:p-7 border border-slate-800 shadow-xl overflow-hidden group">
                {/* Background subtle ambient glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-lg">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold tracking-wider uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                      Today&apos;s Recommended Challenge
                    </div>

                    {/* Problem Title */}
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                      {heroProblem.title}
                    </h2>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                          heroProblem.difficulty === "Easy"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : heroProblem.difficulty === "Medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {heroProblem.difficulty}
                      </span>

                      {heroProblem.company_tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                        >
                          {tag}
                        </span>
                      ))}

                      <span className="text-slate-400 text-xs font-mono">
                        • +120 XP Reward
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      Optimize algorithmic time and space complexity with 0ms client-side Pyodide WASM execution and real-time test case assertions.
                    </p>
                  </div>

                  {/* Primary Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => router.push(`/student/lab/${heroProblem.slug}`)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Solving Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </BlurFade>
          )}

          {/* B. Company Preparation Tracks Deck */}
          <BlurFade delay={0.15}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Campus Preparation Pathways
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select a target company track to filter problem difficulty and placement patterns.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-600 font-semibold">
                  {PREPARATION_TRACKS.length - 1} Company Tracks
                </span>
              </div>

              {/* Horizontal Scrollable Track Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {PREPARATION_TRACKS.map((track) => {
                  const isSelected = selectedTrack === track.tag;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrack(track.tag)}
                      className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-28 relative ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          {track.tag === "All" ? "All Tracks" : "Placement"}
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {track.name}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500 truncate max-w-[80px]">
                          {track.ctc}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </BlurFade>

          {/* C. Problem Library & Curriculum */}
          <BlurFade delay={0.2}>
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              {/* Header & Search / Filter Controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Coding Challenge Repository
                    </h3>
                    <p className="text-xs text-slate-500">
                      Showing {filteredProblems.length} curated problems for {selectedTrack === "All" ? "all tracks" : selectedTrack}
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search title or tag..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F9FAF8] border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>

                {/* Filter Badges & Tabs Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    {(["All", "Unsolved", "Solved"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          statusFilter === status
                            ? "bg-white text-indigo-700 shadow-xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Difficulty Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all ${
                          difficultyFilter === diff
                            ? "bg-slate-900 text-white border-slate-900 font-bold"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Problem Rows List (Clean, modern cards) */}
              <div className="space-y-2.5">
                {filteredProblems.length === 0 ? (
                  <div className="p-12 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-sm font-semibold text-slate-700">
                      No problems match this filter criteria
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrack("All");
                        setDifficultyFilter("All");
                        setStatusFilter("All");
                        setSearchQuery("");
                      }}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  filteredProblems.map((p) => {
                    const isSolved = solvedProblemIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/student/lab/${p.slug}`)}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-400/80 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        {/* Left: Status + Title + Company Tags */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="mt-0.5 sm:mt-0 flex-shrink-0">
                            {isSolved ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 transition-colors" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {p.title}
                              </span>
                              {isSolved && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                  Solved
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {p.company_tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Difficulty + Action CTA */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                              p.difficulty === "Easy"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : p.difficulty === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {p.difficulty}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                            <span>Solve</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </BlurFade>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 4 Columns Telemetry, Streaks & Drives       */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Placement Readiness Gauge */}
          <BlurFade delay={0.1}>
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Placement Readiness
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    readinessScore >= 75
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : readinessScore >= 60
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {readinessScore >= 75
                    ? "Tier-1 Qualified"
                    : readinessScore >= 60
                    ? "Needs Practice"
                    : "At-Risk"}
                </span>
              </div>

              {/* Score Circular Gauge */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        readinessScore >= 75
                          ? "text-emerald-500"
                          : readinessScore >= 60
                          ? "text-amber-500"
                          : "text-rose-500"
                      }
                      strokeDasharray={`${readinessScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-mono font-extrabold text-base text-slate-900 tabular-nums">
                    {readinessScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Top 8% in Batch</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {solvedProblemIds.size} of {problems.length} problems solved
                  </p>
                </div>
              </div>

              {/* Competency Skill Bars */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>Data Structures & Algorithmic Logic</span>
                    <span className="font-mono font-bold text-slate-900">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>Code Execution Speed & Memory</span>
                    <span className="font-mono font-bold text-slate-900">78%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>Mock Screening Test Accuracy</span>
                    <span className="font-mono font-bold text-slate-900">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* 2. Consistency Habit & Weekly Streak */}
          <BlurFade delay={0.15}>
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Practice Consistency
                </span>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold">
                  <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>5 Days Streak</span>
                </div>
              </div>

              {/* Weekly Punch Card */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`w-full h-2.5 rounded-full transition-all ${
                        idx < 5
                          ? "bg-amber-500 shadow-xs"
                          : "bg-slate-100 border border-slate-200/60"
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-400">{day}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Weekly XP</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">1,420 XP</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">College Rank</div>
                  <div className="font-mono font-bold text-indigo-600 text-sm">#14 of 420</div>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* 3. Upcoming Campus Drives & Deadlines */}
          <BlurFade delay={0.2}>
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upcoming Campus Drives</span>
                </span>
                <Link
                  href="/student/drives"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {drives.length === 0 ? (
                  <div className="text-xs text-slate-500">No active drives scheduled today.</div>
                ) : (
                  drives.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{d.company_name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          {d.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{d.role_title} • {d.ctc_range}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </BlurFade>

          {/* 4. Recent Verified Verdicts */}
          <BlurFade delay={0.25}>
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Recent Submissions
                </span>
                <span className="text-xs font-mono text-emerald-600 font-semibold">
                  ● Pyodide Live
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {studentSubmissions.slice(0, 3).map((sub, i) => (
                  <div
                    key={sub.id || i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {sub.problem_title || "Array Challenge"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sub.language.toUpperCase()} • {sub.execution_time_ms}ms
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {sub.status}
                    </span>
                  </div>
                ))}

                {studentSubmissions.length === 0 && (
                  <div className="text-xs text-slate-400 italic">
                    No submissions recorded yet. Run code to earn XP!
                  </div>
                )}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
