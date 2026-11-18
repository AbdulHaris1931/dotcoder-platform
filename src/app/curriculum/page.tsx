"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CurriculumSidebar } from "@/components/curriculum/curriculum-sidebar";
import { CurriculumStore } from "@/lib/curriculum-store";
import {
  CurriculumLesson,
  CurriculumModule,
  CurriculumTopic,
  CurriculumProblem,
  BranchTag,
} from "@/types/curriculum";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import {
  BookOpen,
  Code2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  Play,
  Terminal,
} from "lucide-react";

function CurriculumContent() {
  const router = useRouter();

  // Branch Filter State
  const [branchFilter, setBranchFilter] = useState<BranchTag | "ALL">("ALL");

  // Lessons list
  const [lessons, setLessons] = useState<CurriculumLesson[]>([]);

  // Selection Hierarchy
  const [activeLessonId, setActiveLessonId] = useState<string>("lesson-1");
  const [activeModuleId, setActiveModuleId] = useState<string>("mod-1-1");
  const [activeTopicId, setActiveTopicId] = useState<string>("topic-1-1-1");

  // Selected Topic Data
  const [activeTopic, setActiveTopic] = useState<CurriculumTopic | null>(null);

  // Active View Tab inside Topic Overview: 'concept' | 'problems'
  const [topicTab, setTopicTab] = useState<"problems" | "concept">("problems");

  // Load Lessons & Default Topic
  useEffect(() => {
    const list = CurriculumStore.getLessons(branchFilter);
    setLessons(list);

    const initialLesson = list[0];
    const initialModules = initialLesson ? CurriculumStore.getModulesForLesson(initialLesson.id) : [];
    const initialMod = initialModules[0];
    const initialTopics = initialMod ? CurriculumStore.getTopicsForModule(initialMod.id) : [];
    const initialTop = initialTopics[0];

    if (initialLesson) setActiveLessonId(initialLesson.id);
    if (initialMod) setActiveModuleId(initialMod.id);
    if (initialTop) {
      setActiveTopicId(initialTop.id);
      setActiveTopic(initialTop);
    }
  }, [branchFilter]);

  // When selection changes
  const handleSelectTopic = (lessonId: string, moduleId: string, topicId: string) => {
    setActiveLessonId(lessonId);
    setActiveModuleId(moduleId);
    setActiveTopicId(topicId);
    const top = CurriculumStore.getTopicById(topicId);
    setActiveTopic(top);
  };

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];
  const activeModule = (activeLesson?.modules || []).find((m) => m.id === activeModuleId) || activeLesson?.modules?.[0];

  return (
    <div className="h-screen w-full bg-[#0B0F17] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Global Bar */}
      <header className="h-14 border-b border-[#1E293B] bg-[#0E131F]/90 px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <DotCoderLogo theme="dark" size="sm" href="/" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>/</span>
            <span className="text-white font-semibold">Campus Placement Curriculum</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400">Coursera-Style Progressive Mastery</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            ← Student Dashboard
          </Link>
          <Link
            href={`/assessment/${activeModuleId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Launch Module Assessment</span>
          </Link>
        </div>
      </header>

      {/* Main Workspace: Collapsible Sidebar (Left) + Topic Overview & Problems (Center/Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Curriculum Accordion Sidebar */}
        <CurriculumSidebar
          lessons={lessons}
          activeLessonId={activeLessonId}
          activeModuleId={activeModuleId}
          activeTopicId={activeTopicId}
          onSelectTopic={handleSelectTopic}
          branchFilter={branchFilter}
          onBranchFilterChange={setBranchFilter}
        />

        {/* Center / Right Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F17] p-6 lg:p-8 space-y-8">
          {/* Header Banner: Lesson & Module Context */}
          <div className="space-y-2 pb-6 border-b border-[#1E293B]">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                Lesson {activeLesson?.lesson_number || 1} • {activeLesson?.track_type === "shared_core" ? "Shared Core" : "Branch Track"}
              </span>
              <span className="text-slate-600">›</span>
              <span className="text-slate-400 font-semibold">
                Module {activeModule?.module_number || 1}: {activeModule?.title || "Foundations"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {activeTopic?.title || "Time & Space Big-O Analysis"}
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Step through 5 progressive practice stages (Guided Warmup → Pattern Application → Edge-Case Trap → Combined Concept → Company Hard Challenge) before attempting the 90-minute Module Assessment.
            </p>

            {/* View Switcher Tabs: Problems vs 3-min Concept Guide */}
            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setTopicTab("problems")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  topicTab === "problems"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-[#141B2D] text-slate-400 hover:text-white border border-[#1E293B]"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Practice Problems (5 Stages)</span>
              </button>

              <button
                type="button"
                onClick={() => setTopicTab("concept")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  topicTab === "concept"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-[#141B2D] text-slate-400 hover:text-white border border-[#1E293B]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>3-Minute Concept Guide & Big-O Cheat Sheet</span>
              </button>
            </div>
          </div>

          {/* TAB 1: 5 Sequential Practice Problems */}
          {topicTab === "problems" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Sequential Practice Curriculum
                </span>
                <span className="text-xs font-mono text-indigo-400">
                  {activeTopic?.problems?.filter((p) => p.is_solved).length || 0} of {activeTopic?.problems?.length || 5} Completed
                </span>
              </div>

              {/* 5 Problem Cards Deck */}
              <div className="space-y-3">
                {(activeTopic?.problems || []).map((prob) => {
                  return (
                    <div
                      key={prob.id}
                      className="p-5 rounded-2xl bg-[#0E131F]/90 border border-[#1E293B] hover:border-indigo-500/50 hover:bg-[#121929] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      {/* Left: Stage Number, Title, Difficulty, Tags */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase">
                            Stage {prob.order_index}: {prob.practice_stage_name}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {prob.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {prob.company_tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182035] text-slate-300 border border-[#273352]"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="text-[11px] font-mono text-slate-500 pl-1">
                            • 6 Test Cases (2 Public, 4 Hidden)
                          </span>
                        </div>
                      </div>

                      {/* Right: Solved Checkmark & Solve in IDE Button */}
                      <div className="flex items-center gap-3 shrink-0">
                        {prob.is_solved ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Solved</span>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => router.push(`/practice/${prob.slug || prob.id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 group-hover:shadow-indigo-500/25"
                        >
                          <span>Solve in IDE</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: 3-Minute Quick Study Guide & Big-O Cheat Sheet */}
          {topicTab === "concept" && (
            <div className="p-6 rounded-2xl bg-[#0E131F]/90 border border-[#1E293B] space-y-6">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">EDITORIAL CONCEPT GUIDE & TIME/SPACE TARGETS</span>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line text-xs font-sans leading-relaxed">
                {activeTopic?.concept_markdown || "Review the algorithmic invariants and complexity targets."}
              </div>
            </div>
          )}

          {/* Bottom Module Assessment Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-[#0E131F] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm text-white">Module Proctored Assessment Ready</span>
              </div>
              <p className="text-xs text-slate-400">
                Test your mastery across all 5 topics under timed exam conditions (90 minutes, 10 MCQs + 5 Coding Challenges).
              </p>
            </div>

            <Link
              href={`/assessment/${activeModuleId}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all shrink-0 active:scale-95"
            >
              <span>Enter Assessment Mode (90m)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-[#0B0F17] text-white flex items-center justify-center font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Loading Curriculum Engine...</span>
          </div>
        </div>
      }
    >
      <CurriculumContent />
    </Suspense>
  );
}
