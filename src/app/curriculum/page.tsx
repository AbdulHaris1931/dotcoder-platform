"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CurriculumStore } from "@/lib/curriculum-store";
import {
  CurriculumLesson,
  CurriculumModule,
  CurriculumTopic,
  CurriculumProblem,
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
} from "lucide-react";

function CurriculumPageContent() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"Word Class" | "Modules" | "Topics" | "Problems">("Word Class");
  const [selectedModuleNumber, setSelectedModuleNumber] = useState<number>(3);

  // Default modules matching Screen 01
  const modulesList = [
    {
      number: 1,
      title: "Programming Foundations",
      completed: true,
      topicsCount: 10,
      solvedCount: 10,
      description: "Syntax, loops, conditionals, complexity analysis and memory basics.",
      slug: "programming-foundations",
    },
    {
      number: 2,
      title: "Data Structures Basics",
      completed: true,
      topicsCount: 10,
      solvedCount: 10,
      description: "Single and double pointers, static & dynamic arrays, basic strings.",
      slug: "data-structures-basics",
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
    },
    {
      number: 4,
      title: "Algorithms",
      completed: false,
      topicsCount: 10,
      solvedCount: 0,
      description: "Searching, sorting, recursion, backtracking, and divide-and-conquer.",
      slug: "algorithms",
    },
    {
      number: 5,
      title: "Problem Solving",
      completed: false,
      topicsCount: 10,
      solvedCount: 0,
      description: "Dynamic programming, graph theory, trees, and greedy strategies.",
      slug: "problem-solving",
    },
  ];

  const currentModule = modulesList.find((m) => m.number === selectedModuleNumber) || modulesList[2];

  // Topics for the active module
  const topicsForCurrentModule = [
    { id: "t1", title: "Two Sum & Hash Maps", difficulty: "Easy", solved: true, problemId: "two-sum" },
    { id: "t2", title: "Valid Parentheses (Stack)", difficulty: "Easy", solved: true, problemId: "valid-parentheses" },
    { id: "t3", title: "Longest Subarray (Sliding Window)", difficulty: "Medium", solved: true, problemId: "longest-subarray" },
    { id: "t4", title: "Reverse Linked List", difficulty: "Easy", solved: true, problemId: "reverse-linked-list" },
    { id: "t5", title: "Binary Search Tree Validation", difficulty: "Medium", solved: true, problemId: "validate-bst" },
    { id: "t6", title: "LRU Cache Design", difficulty: "Hard", solved: true, problemId: "lru-cache" },
    { id: "t7", title: "Merge K Sorted Lists", difficulty: "Hard", solved: false, problemId: "merge-k-sorted-lists" },
    { id: "t8", title: "Queue via Two Stacks", difficulty: "Medium", solved: false, problemId: "queue-using-stacks" },
    { id: "t9", title: "Min Stack Implementation", difficulty: "Medium", solved: false, problemId: "min-stack" },
    { id: "t10", title: "Sliding Window Maximum", difficulty: "Hard", solved: false, problemId: "sliding-window-max" },
  ];

  return (
    <div className="min-h-full bg-[#F4F7F4] text-slate-900 p-6 sm:p-10 space-y-8 font-sans">
      {/* Top Header matching Screen 01 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">
            Learn / Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Learning Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A structured, placement-focused learning path.
          </p>
        </div>

        {/* Circular Progress Gauge (56% Complete) matching Screen 01 */}
        <div className="flex items-center gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#C4F82A]"
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

      {/* Pill Tabs matching Screen 01 */}
      <div className="flex flex-wrap items-center gap-2">
        {(["Word Class", "Modules", "Topics", "Problems"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-[#0F1412] text-white shadow-xs font-bold"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid matching Screen 01 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modules List (5 Modules) */}
        <div className="lg:col-span-6 space-y-3">
          {modulesList.map((mod) => {
            const isSelected = selectedModuleNumber === mod.number;
            return (
              <div
                key={mod.number}
                onClick={() => setSelectedModuleNumber(mod.number)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-white border-[#C4F82A] ring-2 ring-[#C4F82A]/30 shadow-sm"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">
                      {mod.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : isSelected ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[#C4F82A] flex items-center justify-center">
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
                <span className="inline-block px-3 py-1 rounded-full bg-[#1A231C] text-[#C4F82A] text-xs font-mono font-bold border border-[#2B3B2E]">
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
              <div className="w-20 h-20 rounded-2xl bg-[#162016] border border-[#2B3B2E] flex items-center justify-center text-[#C4F82A] shadow-inner shrink-0">
                <Box className="w-10 h-10 stroke-[1.5]" />
              </div>
            </div>

            {/* Progress Info */}
            <div className="space-y-2 pt-2 border-t border-[#1C271E]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#C4F82A] font-bold">
                  {currentModule.number === 3 ? "60% Complete" : currentModule.completed ? "100% Complete" : "0% Complete"}
                </span>
                <span className="text-slate-400">
                  {currentModule.number === 3 ? "6/10 Topics" : currentModule.completed ? "10/10 Topics" : "0/10 Topics"}
                </span>
              </div>
              <div className="w-full h-2 bg-[#1C271E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C4F82A] rounded-full transition-all duration-500"
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
                className="flex-1 py-3 px-4 rounded-xl bg-[#C4F82A] hover:bg-[#B5EA20] text-black font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/student/exam/assessment-1")}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4 text-[#C4F82A]" />
                <span>Take Module Assessment</span>
              </button>
            </div>
          </div>

          {/* Quick Problem List below the featured card */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Module {currentModule.number} Problem Pool (10)
            </div>
            <div className="divide-y divide-slate-100">
              {topicsForCurrentModule.slice(0, 5).map((t, idx) => (
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
    </div>
  );
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading Curriculum Explorer...</div>}>
      <CurriculumPageContent />
    </Suspense>
  );
}
