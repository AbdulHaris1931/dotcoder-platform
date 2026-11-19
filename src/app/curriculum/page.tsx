"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CurriculumStore } from "@/lib/curriculum-store";
import { DataService } from "@/lib/supabase/db";
import {
  CurriculumLesson,
  CurriculumModule,
  CurriculumTopic,
  CurriculumProblem,
  BranchTag,
} from "@/types/curriculum";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
  Code2,
  BookOpen,
  Box,
  Layers,
  Sparkles,
  Lock,
  ShieldCheck,
  Search,
  Filter,
  GraduationCap,
  Building,
  Terminal,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

type TabType = "Word Class" | "Modules" | "Topics" | "Problems";

function CurriculumPageContent() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("Word Class");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedModuleNumber, setSelectedModuleNumber] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL");
  const [activeConceptTopic, setActiveConceptTopic] = useState<CurriculumTopic | null>(null);

  // 5 Core Modules matching Screen 01
  const flagshipModules = useMemo(() => [
    {
      number: 1,
      title: "Programming Foundations",
      completed: true,
      topicsCount: 10,
      solvedCount: 10,
      description: "Syntax, loops, conditionals, complexity analysis and memory basics.",
      slug: "programming-foundations",
      recommendedTracks: ["BCA", "B.Sc CS", "B.Sc IT", "MCA"],
    },
    {
      number: 2,
      title: "Data Structures Basics",
      completed: true,
      topicsCount: 10,
      solvedCount: 10,
      description: "Single and double pointers, static & dynamic arrays, basic strings.",
      slug: "data-structures-basics",
      recommendedTracks: ["BCA", "B.Sc CS", "B.Sc IT", "MCA"],
    },
    {
      number: 3,
      title: "Data Structures (In-depth)",
      completed: false,
      active: true,
      topicsCount: 10,
      solvedCount: 6,
      progress: 60,
      description: "Master arrays, strings, linked lists, stacks, queues and more.",
      slug: "data-structures-in-depth",
      recommendedTracks: ["BCA", "B.Sc CS", "B.Sc IT", "MCA"],
    },
    {
      number: 4,
      title: "Algorithms",
      completed: false,
      topicsCount: 10,
      solvedCount: 0,
      description: "Searching, sorting, recursion, backtracking, and divide-and-conquer.",
      slug: "algorithms",
      recommendedTracks: ["B.Sc CS", "MCA"],
    },
    {
      number: 5,
      title: "Problem Solving",
      completed: false,
      topicsCount: 10,
      solvedCount: 0,
      description: "Dynamic programming, graph theory, trees, and greedy strategies.",
      slug: "problem-solving",
      recommendedTracks: ["B.Sc CS", "B.Sc IT", "MCA"],
    },
  ], []);

  // Filter flagship modules based on selected branch
  const filteredFlagshipModules = useMemo(() => {
    if (selectedBranch === "ALL") return flagshipModules;
    return flagshipModules.filter((m) =>
      m.recommendedTracks.includes(selectedBranch)
    );
  }, [flagshipModules, selectedBranch]);

  const currentModule =
    flagshipModules.find((m) => m.number === selectedModuleNumber) ||
    flagshipModules[2];

  // Topics for the active module
  const topicsForCurrentModule = useMemo(() => [
    { id: "t1", title: "Two Sum & Hash Maps", difficulty: "Easy", solved: true, problemId: "two-sum", company: "Zoho" },
    { id: "t2", title: "Valid Parentheses (Stack)", difficulty: "Easy", solved: true, problemId: "valid-parentheses", company: "TCS" },
    { id: "t3", title: "Longest Subarray (Sliding Window)", difficulty: "Medium", solved: true, problemId: "longest-subarray", company: "Infosys" },
    { id: "t4", title: "Reverse Linked List", difficulty: "Easy", solved: true, problemId: "reverse-linked-list", company: "Cognizant" },
    { id: "t5", title: "Binary Search Tree Validation", difficulty: "Medium", solved: true, problemId: "validate-bst", company: "Amazon" },
    { id: "t6", title: "LRU Cache Design", difficulty: "Hard", solved: true, problemId: "lru-cache", company: "Zoho" },
    { id: "t7", title: "Merge K Sorted Lists", difficulty: "Hard", solved: false, problemId: "two-sum", company: "Amazon" },
    { id: "t8", title: "Queue via Two Stacks", difficulty: "Medium", solved: false, problemId: "two-sum", company: "TCS" },
    { id: "t9", title: "Min Stack Implementation", difficulty: "Medium", solved: false, problemId: "two-sum", company: "Wipro" },
    { id: "t10", title: "Sliding Window Maximum", difficulty: "Hard", solved: false, problemId: "two-sum", company: "Zoho" },
  ], []);

  // Full 10 Lessons from CurriculumStore
  const allLessons = useMemo(() => {
    return CurriculumStore.getLessons(
      selectedBranch === "ALL" ? undefined : (selectedBranch as BranchTag)
    );
  }, [selectedBranch]);

  // Master Problem Bank for "Problems" tab
  const problemBank = useMemo(() => {
    const baseProblems = [
      { id: "p1", title: "Optimal Two Sum Index Pairs", slug: "two-sum", difficulty: "Easy", topic: "Arrays & Hash Maps", company: "Zoho", solved: true },
      { id: "p2", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", topic: "Two Pointers", company: "TCS Digital", solved: true },
      { id: "p3", title: "Longest Substring Without Repeating", slug: "longest-substring", difficulty: "Medium", topic: "Sliding Window", company: "Amazon", solved: true },
      { id: "p4", title: "Subarray Sum Equals K", slug: "longest-subarray", difficulty: "Medium", topic: "Prefix Sum & Hash", company: "Infosys", solved: true },
      { id: "p5", title: "First Missing Positive Integer", slug: "first-missing-positive", difficulty: "Hard", topic: "Cyclic Sort", company: "Zoho", solved: false },
      { id: "p6", title: "Trapping Rain Water Capacity", slug: "trapping-rain-water", difficulty: "Hard", topic: "Two Pointers & Stack", company: "Amazon", solved: true },
      { id: "p7", title: "Maximum Subarray (Kadane's)", slug: "max-subarray", difficulty: "Medium", topic: "Dynamic Programming", company: "Cognizant", solved: true },
      { id: "p8", title: "Valid Parentheses Depth", slug: "valid-parentheses", difficulty: "Easy", topic: "Monotonic Stack", company: "TCS", solved: true },
      { id: "p9", title: "Reverse Linked List In-Place", slug: "reverse-linked-list", difficulty: "Easy", topic: "Linked Lists", company: "Wipro", solved: true },
      { id: "p10", title: "Validate Binary Search Tree", slug: "validate-bst", difficulty: "Medium", topic: "Tree Traversals", company: "Infosys", solved: true },
      { id: "p11", title: "LRU Cache Design & Eviction", slug: "lru-cache", difficulty: "Hard", topic: "Hash + Doubly Linked", company: "Zoho", solved: false },
      { id: "p12", title: "Climbing Stairs Fibonacci Optimization", slug: "two-sum", difficulty: "Easy", topic: "1D Dynamic Programming", company: "TCS", solved: false },
    ];

    return baseProblems.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiff =
        selectedDifficulty === "ALL" || p.difficulty === selectedDifficulty;

      const matchesCompany =
        selectedCompany === "ALL" || p.company === selectedCompany;

      return matchesSearch && matchesDiff && matchesCompany;
    });
  }, [searchQuery, selectedDifficulty, selectedCompany]);

  return (
    <div className="min-h-full bg-[#F4F7F4] text-slate-900 p-6 sm:p-10 space-y-8 font-sans">
      {/* Top Header matching Screen 01 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
            <span>Learn</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700 font-semibold">Curriculum</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
              AVASC Institutional Track
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Learning Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A structured, placement-focused learning path for Annai Vailankanni Arts and Science College.
          </p>
        </div>

        {/* Circular Progress Gauge (56% Complete) matching Screen 01 */}
        <div className="flex items-center gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#9DFF00]"
                strokeDasharray="56, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-bold text-xs text-slate-900">
              56%
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">56% Complete</div>
            <div className="text-[11px] text-slate-500">28/50 Topics Solved</div>
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar matching Screen 01 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pill Tabs matching Screen 01 */}
        <div className="flex flex-wrap items-center gap-2">
          {(["Word Class", "Modules", "Topics", "Problems"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#0F1412] text-white shadow-xs font-bold"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Department Track Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 font-medium px-1 text-[11px]">Track:</span>
          {[
            { id: "ALL", label: "All Tracks" },
            { id: "BCA", label: "BCA" },
            { id: "B.Sc CS", label: "B.Sc CS" },
            { id: "B.Sc IT", label: "B.Sc IT" },
            { id: "MCA", label: "MCA" },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-colors shrink-0 ${
                selectedBranch === b.id
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: WORD CLASS (Exact Screen 01 Mockup)                          */}
      {/* =================================================================== */}
      {activeTab === "Word Class" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Modules List (5 Modules) */}
          <div className="lg:col-span-6 space-y-3">
            {filteredFlagshipModules.map((mod) => {
              const isSelected = selectedModuleNumber === mod.number;
              return (
                <div
                  key={mod.number}
                  onClick={() => setSelectedModuleNumber(mod.number)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white border-[#9DFF00] ring-2 ring-[#9DFF00]/40 shadow-sm"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400">
                        {mod.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                        ) : isSelected ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#9DFF00] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#0F1412]" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-slate-400 font-medium">
                          Module {mod.number}
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {mod.title}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      {mod.completed ? "10/10" : mod.number === 3 ? "6/10" : "0/10"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Featured Dark Card matching Screen 01 */}
          <div className="lg:col-span-6">
            <div className="bg-[#0F1412] text-white p-7 sm:p-8 rounded-3xl border border-[#1B241F] shadow-lg relative overflow-hidden space-y-6">
              {/* Top row with 3D Cube Icon */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#1A231C] text-[#9DFF00] text-xs font-mono font-bold border border-[#2B3B2E]">
                    Module {currentModule.number}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3">
                    {currentModule.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm">
                    {currentModule.description}
                  </p>
                </div>

                {/* 3D Isometric Lime Green Cube graphic */}
                <div className="w-20 h-20 rounded-2xl bg-[#162016] border border-[#2B3B2E] flex items-center justify-center text-[#9DFF00] shadow-inner shrink-0">
                  <Box className="w-10 h-10 stroke-[1.5]" />
                </div>
              </div>

              {/* Progress Info */}
              <div className="space-y-2 pt-2 border-t border-[#1C271E]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9DFF00] font-bold">
                    {currentModule.number === 3 ? "60% Complete" : currentModule.completed ? "100% Complete" : "0% Complete"}
                  </span>
                  <span className="text-slate-400">
                    {currentModule.number === 3 ? "6/10 Topics" : currentModule.completed ? "10/10 Topics" : "0/10 Topics"}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#1C271E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9DFF00] rounded-full transition-all duration-500"
                    style={{
                      width: currentModule.number === 3 ? "60%" : currentModule.completed ? "100%" : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Lime & Secondary CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => router.push("/practice/two-sum")}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push(`/student/exam/module-${currentModule.number}`)}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
                  <span>Take Module Assessment</span>
                </button>
              </div>
            </div>

            {/* Quick Problem List below the featured card */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Module {currentModule.number} Problem Pool (10)</span>
                <span className="text-[11px] text-slate-500 font-normal">Click to launch DotLab</span>
              </div>
              <div className="divide-y divide-slate-100">
                {topicsForCurrentModule.slice(0, 6).map((t, idx) => (
                  <div
                    key={t.id}
                    onClick={() => router.push(`/practice/${t.problemId}`)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-slate-400">0{idx + 1}</span>
                      <span className="text-xs font-semibold text-slate-800">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-medium">
                        {t.company}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          t.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700"
                            : t.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {t.difficulty}
                      </span>
                      {t.solved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: FULL MODULES HIERARCHY (10 Lessons, 20 Modules)             */}
      {/* =================================================================== */}
      {activeTab === "Modules" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Lesson {lesson.lesson_number}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                      {lesson.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      lesson.track_type === "shared_core"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {lesson.track_type === "shared_core" ? "Core" : "Specialization"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>

                {/* Sub-modules */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {(lesson.modules || []).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModuleNumber(lesson.lesson_number);
                        setActiveTab("Word Class");
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {m.title}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Branches: {lesson.branch_tags.slice(0, 3).join(", ")}</span>
                  <button
                    onClick={() => router.push("/practice/two-sum")}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: TOPICS SYLLABUS                                              */}
      {/* =================================================================== */}
      {activeTab === "Topics" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Placement Readiness Topics Syllabus
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any topic to read its 3-minute concept guide or jump directly to its practice challenges.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                50 Placement Topics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                { order: "01", title: "Time & Space Big-O Asymptotic Analysis", diff: "Easy", solved: true, time: "3 mins", code: "optimal-two-sum-index-pairs" },
                { order: "02", title: "Two-Pointer Technique (Opposite & Same Direction)", diff: "Easy", solved: true, time: "4 mins", code: "two-sum" },
                { order: "03", title: "Sliding Window (Fixed vs. Dynamic Expansions)", diff: "Medium", solved: true, time: "5 mins", code: "longest-substring" },
                { order: "04", title: "Prefix Sum & Difference Arrays", diff: "Easy", solved: true, time: "3 mins", code: "longest-subarray" },
                { order: "05", title: "Cyclic Sort & In-Place Matrix Transformations", diff: "Hard", solved: false, time: "6 mins", code: "first-missing-positive" },
                { order: "06", title: "Hash Map Collisions & Custom Probing", diff: "Easy", solved: true, time: "4 mins", code: "two-sum" },
                { order: "07", title: "Fast/Slow Pointer Cycle Invariants", diff: "Medium", solved: true, time: "5 mins", code: "container-with-most-water" },
                { order: "08", title: "Monotonic Binary Search Predicates", diff: "Medium", solved: false, time: "6 mins", code: "trapping-rain-water" },
                { order: "09", title: "Monotonic Stack (Next Greater Element)", diff: "Medium", solved: true, time: "4 mins", code: "valid-parentheses" },
                { order: "10", title: "Sliding Window Maximum with Deques", diff: "Hard", solved: false, time: "7 mins", code: "trapping-rain-water" },
              ].map((topic) => (
                <div
                  key={topic.order}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-slate-400 font-bold shrink-0">
                      {topic.order}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        <span>Read: {topic.time}</span>
                        <span>•</span>
                        <span className={topic.diff === "Easy" ? "text-emerald-600 font-bold" : topic.diff === "Medium" ? "text-amber-600 font-bold" : "text-rose-600 font-bold"}>
                          {topic.diff}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {topic.solved && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <button
                      onClick={() => router.push(`/practice/${topic.code}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-[#9DFF00] text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      Solve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: COMPLETE PROBLEM BANK                                        */}
      {/* =================================================================== */}
      {activeTab === "Problems" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search problem title, topic, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Companies</option>
                <option value="Zoho">Zoho</option>
                <option value="TCS">TCS / TCS Digital</option>
                <option value="Infosys">Infosys</option>
                <option value="Cognizant">Cognizant</option>
                <option value="Amazon">Amazon</option>
              </select>
            </div>
          </div>

          {/* Problem Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Problem Title</th>
                    <th className="py-3 px-5">Topic</th>
                    <th className="py-3 px-5">Difficulty</th>
                    <th className="py-3 px-5">Target Company</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {problemBank.map((prob) => (
                    <tr
                      key={prob.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        {prob.solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer">
                          {prob.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">
                        {prob.topic}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            prob.difficulty === "Easy"
                              ? "bg-emerald-50 text-emerald-700"
                              : prob.difficulty === "Medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[10px] text-slate-700 font-semibold">
                          {prob.company}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => router.push(`/practice/${prob.slug}`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-[#9DFF00] font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          Solve &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CurriculumPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-xs text-slate-500 font-mono">
          Loading Curriculum Explorer...
        </div>
      }
    >
      <CurriculumPageContent />
    </Suspense>
  );
}
