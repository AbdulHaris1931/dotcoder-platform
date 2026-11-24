"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { CurriculumStore } from "@/lib/curriculum-store";
import { BranchTag } from "@/types/curriculum";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
  Box,
  ShieldCheck,
  Search,
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
    <div className="min-h-full bg-[#070B09] text-[#F4F7F5] p-6 sm:p-10 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <div className="text-xs text-[#99A9A0] font-medium mb-1.5 flex items-center gap-2 flex-wrap">
            <span>Learn</span>
            <span className="text-[#85998D]">/</span>
            <span className="text-[#F4F7F5] font-semibold">Curriculum</span>
            <span className="text-[#2C4034]">&bull;</span>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              AVASC Institutional Track
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5]">
            Learning Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            A structured, placement-focused learning path for Annai Vailankanni Arts and Science College.
          </p>
        </div>

        {/* Circular Progress Gauge (56% Complete) */}
        <div className="flex items-center gap-3 bg-[#0C120F] p-3.5 px-5 rounded-2xl border border-[#1E2C24]">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#121B16]"
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
            <span className="absolute font-mono font-bold text-xs text-[#F4F7F5] tabular-nums">
              56%
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#F4F7F5] tabular-nums">56% Complete</div>
            <div className="text-[11px] text-[#99A9A0] font-mono tabular-nums">28/50 Topics Solved</div>
          </div>
        </div>
      </div>

      {/* MNC 300 Interview Master Curriculum Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0C120F] text-[#F4F7F5] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1E2C24]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#9DFF00] text-[#070B09]">
              MNC 300 Interview Bank
            </span>
            <span className="text-xs text-[#99A9A0] font-mono">10 Sequential Units &bull; 100 Coding &bull; 200 MCQs</span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
              Pass &ge; 75% to Unlock
            </span>
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-[#F4F7F5]">
            TCS, Zoho, Infosys &amp; Cognizant Technical Screening Units
          </h3>
          <p className="text-xs text-[#99A9A0] max-w-2xl leading-relaxed">
            Practice 100 verified coding problems and test your knowledge against 200 technical MCQs in 45-minute timed proctored exams with instant score tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/student/mnc-prep")}
          className="px-5 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-xs transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <span>Explore 10 MNC Units</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(["Word Class", "Modules", "Topics", "Problems"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#9DFF00] text-[#070B09]"
                  : "bg-[#0C120F] text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] border border-[#1E2C24]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Department Track Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-[#85998D] font-mono px-1 text-[11px]">Track:</span>
          {[
            { id: "ALL", label: "All Tracks" },
            { id: "BCA", label: "BCA" },
            { id: "B.Sc CS", label: "B.Sc CS" },
            { id: "B.Sc IT", label: "B.Sc IT" },
            { id: "MCA", label: "MCA" },
          ].map((b) => (
            <button
              type="button"
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedBranch === b.id
                  ? "bg-[#9DFF00] text-[#070B09] font-bold"
                  : "bg-[#0C120F] text-[#99A9A0] hover:bg-[#121B16] hover:text-[#F4F7F5] border border-[#1E2C24]"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: WORD CLASS */}
      {activeTab === "Word Class" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Modules List (5 Modules) */}
          <div className="lg:col-span-6 space-y-3">
            {filteredFlagshipModules.map((mod) => {
              const isSelected = selectedModuleNumber === mod.number;
              return (
                <button
                  type="button"
                  key={mod.number}
                  onClick={() => setSelectedModuleNumber(mod.number)}
                  className={`w-full text-left p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#121B16] border-[#9DFF00] ring-1 ring-[#9DFF00]/30"
                      : "bg-[#0C120F] border-[#1E2C24] hover:border-[#2C4034]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-[#85998D]">
                        {mod.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#9DFF00] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#9DFF00]" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-[#2C4034]" />
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-[#85998D] font-medium">
                          Module {mod.number}
                        </div>
                        <div className="text-sm font-bold text-[#F4F7F5]">
                          {mod.title}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#99A9A0] font-mono tabular-nums">
                      {mod.completed ? "10/10" : mod.number === 3 ? "6/10" : "0/10"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Featured Obsidian Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#0C120F] text-[#F4F7F5] p-7 sm:p-8 rounded-3xl border border-[#1E2C24] relative overflow-hidden space-y-6">
              {/* Top row with 3D Cube Icon */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#9DFF00]/10 text-[#9DFF00] text-xs font-mono font-bold border border-[#9DFF00]/25">
                    Module {currentModule.number}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5] mt-3">
                    {currentModule.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#99A9A0] mt-2 max-w-sm leading-relaxed">
                    {currentModule.description}
                  </p>
                </div>

                {/* 3D Isometric Lime Green Cube graphic */}
                <div className="w-20 h-20 rounded-2xl bg-[#121B16] border border-[#2C4034] flex items-center justify-center text-[#9DFF00] shrink-0">
                  <Box className="w-10 h-10 stroke-[1.5]" />
                </div>
              </div>

              {/* Progress Info */}
              <div className="space-y-2 pt-2 border-t border-[#1E2C24]">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-[#9DFF00] font-bold">
                    {currentModule.number === 3 ? "60% Complete" : currentModule.completed ? "100% Complete" : "0% Complete"}
                  </span>
                  <span className="text-[#99A9A0]">
                    {currentModule.number === 3 ? "6/10 Topics" : currentModule.completed ? "10/10 Topics" : "0/10 Topics"}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121B16] rounded-full overflow-hidden">
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
                  type="button"
                  onClick={() => router.push("/practice/two-sum")}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/student/exam/module-${currentModule.number}`)}
                  className="py-3 px-4 rounded-xl bg-[#121B16] hover:bg-[#18241D] text-[#F4F7F5] font-bold text-xs sm:text-sm border border-[#2C4034] transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#9DFF00]" />
                  <span>Take Module Assessment</span>
                </button>
              </div>
            </div>

            {/* Quick Problem List below the featured card */}
            <div className="mt-6 bg-[#0C120F] rounded-2xl border border-[#1E2C24] p-5 space-y-3">
              <div className="text-xs font-bold text-[#F4F7F5] uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Module {currentModule.number} Problem Pool (10)</span>
                <span className="text-[11px] text-[#99A9A0] font-normal">Click to launch DotLab</span>
              </div>
              <div className="divide-y divide-[#1E2C24]">
                {topicsForCurrentModule.slice(0, 6).map((t, idx) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => router.push(`/practice/${t.problemId}`)}
                    className="w-full text-left py-2.5 flex items-center justify-between hover:bg-[#121B16] px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-[#85998D] tabular-nums">0{idx + 1}</span>
                      <span className="text-xs font-semibold text-[#F4F7F5]">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#99A9A0] font-medium">
                        {t.company}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          t.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                            : t.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                            : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                        }`}
                      >
                        {t.difficulty}
                      </span>
                      {t.solved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#85998D]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL MODULES HIERARCHY */}
      {activeTab === "Modules" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] hover:border-[#2C4034] p-5 space-y-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#121B16] text-[#D5E0D9] border border-[#1E2C24]">
                      Lesson {lesson.lesson_number}
                    </span>
                    <h3 className="font-display text-sm font-bold text-[#F4F7F5] mt-2 line-clamp-1">
                      {lesson.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      lesson.track_type === "shared_core"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                        : "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                    }`}
                  >
                    {lesson.track_type === "shared_core" ? "Core" : "Specialization"}
                  </span>
                </div>

                <p className="text-xs text-[#99A9A0] line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>

                {/* Sub-modules */}
                <div className="space-y-2 pt-2 border-t border-[#1E2C24]">
                  {(lesson.modules || []).map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        setSelectedModuleNumber(lesson.lesson_number);
                        setActiveTab("Word Class");
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-[#9DFF00]" />
                        <span className="font-semibold text-[#F4F7F5] line-clamp-1">
                          {m.title}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#85998D] shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#85998D] pt-1">
                  <span>Branches: {lesson.branch_tags.slice(0, 3).join(", ")}</span>
                  <button
                    type="button"
                    onClick={() => router.push("/practice/two-sum")}
                    className="text-[#9DFF00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
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

      {/* TAB 3: TOPICS SYLLABUS */}
      {activeTab === "Topics" && (
        <div className="space-y-6">
          <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-[#F4F7F5]">
                  Placement Readiness Topics Syllabus
                </h3>
                <p className="text-xs text-[#99A9A0] mt-0.5">
                  Click any topic to read its 3-minute concept guide or jump directly to its practice challenges.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#D5E0D9] bg-[#121B16] border border-[#1E2C24] px-3 py-1 rounded-full">
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
                  className="p-3.5 rounded-xl border border-[#1E2C24] hover:border-[#2C4034] bg-[#121B16] flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-[#85998D] font-bold shrink-0 tabular-nums">
                      {topic.order}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-[#F4F7F5] group-hover:text-[#9DFF00] transition-colors truncate">
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#99A9A0] font-mono">
                        <span>Read: {topic.time}</span>
                        <span>&bull;</span>
                        <span className={topic.diff === "Easy" ? "text-emerald-300 font-bold" : topic.diff === "Medium" ? "text-amber-300 font-bold" : "text-rose-300 font-bold"}>
                          {topic.diff}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {topic.solved && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => router.push(`/practice/${topic.code}`)}
                      className="px-2.5 py-1 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-mono font-bold transition-colors cursor-pointer"
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

      {/* TAB 4: COMPLETE PROBLEM BANK */}
      {activeTab === "Problems" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-[#0C120F] p-4 rounded-2xl border border-[#1E2C24] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                aria-label="Search problem title, topic, company"
                placeholder="Search problem title, topic, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <ObsidianSelect value={String(selectedDifficulty)} onChange={(val) => setSelectedDifficulty(val)} options={[{ value: "ALL", label: "All Difficulties" }, { value: "Easy", label: "Easy" }, { value: "Medium", label: "Medium" }, { value: "Hard", label: "Hard" }]} buttonClassName="px-3 py-2 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs font-semibold text-[#F4F7F5] cursor-pointer focus:outline-none focus:border-[#9DFF00]" />

              <ObsidianSelect value={String(selectedCompany)} onChange={(val) => setSelectedCompany(val)} options={[{ value: "ALL", label: "All Companies" }, { value: "Zoho", label: "Zoho" }, { value: "TCS", label: "TCS / TCS Digital" }, { value: "Infosys", label: "Infosys" }, { value: "Cognizant", label: "Cognizant" }, { value: "Amazon", label: "Amazon" }]} buttonClassName="px-3 py-2 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs font-semibold text-[#F4F7F5] cursor-pointer focus:outline-none focus:border-[#9DFF00]" />
            </div>
          </div>

          {/* Problem Table */}
          <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2C24] bg-[#121B16] text-[11px] font-mono text-[#99A9A0] uppercase tracking-wider">
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Problem Title</th>
                    <th className="py-3 px-5">Topic</th>
                    <th className="py-3 px-5">Difficulty</th>
                    <th className="py-3 px-5">Target Company</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2C24] text-xs">
                  {problemBank.map((prob) => (
                    <tr
                      key={prob.id}
                      className="hover:bg-[#121B16]/70 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        {prob.solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#2C4034]" />
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-[#F4F7F5] hover:text-[#9DFF00] cursor-pointer">
                          {prob.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[#99A9A0]">
                        {prob.topic}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            prob.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                              : prob.difficulty === "Medium"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                              : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 bg-[#121B16] border border-[#1E2C24] rounded-md font-mono text-[10px] text-[#D5E0D9] font-semibold">
                          {prob.company}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/practice/${prob.slug}`)}
                          className="px-3 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
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
        <div className="p-8 text-xs text-[#99A9A0] font-mono">
          Loading Curriculum Explorer...
        </div>
      }
    >
      <CurriculumPageContent />
    </Suspense>
  );
}
