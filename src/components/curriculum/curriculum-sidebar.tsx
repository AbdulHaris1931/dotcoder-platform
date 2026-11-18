"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CurriculumLesson,
  CurriculumModule,
  CurriculumTopic,
  BranchTag,
} from "@/types/curriculum";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Lock,
  Unlock,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  Code2,
} from "lucide-react";

interface CurriculumSidebarProps {
  lessons: CurriculumLesson[];
  activeLessonId: string;
  activeModuleId: string;
  activeTopicId: string;
  onSelectTopic: (lessonId: string, moduleId: string, topicId: string) => void;
  branchFilter: BranchTag | "ALL";
  onBranchFilterChange: (branch: BranchTag | "ALL") => void;
}

export function CurriculumSidebar({
  lessons,
  activeLessonId,
  activeModuleId,
  activeTopicId,
  onSelectTopic,
  branchFilter,
  onBranchFilterChange,
}: CurriculumSidebarProps) {
  // Expanded Lesson IDs
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({
    [activeLessonId || "lesson-1"]: true,
  });

  // Expanded Module IDs
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [activeModuleId || "mod-1-1"]: true,
  });

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <aside className="w-80 h-full bg-[#0E131F] border-r border-[#1E293B] flex flex-col overflow-hidden text-slate-300 font-sans select-none flex-shrink-0">
      {/* Top Header: Curriculum Title & Branch Pill Switcher */}
      <div className="p-4 border-b border-[#1E293B] bg-[#0B0F17] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              Curriculum
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
            10 Lessons
          </span>
        </div>

        {/* Branch Specific Filter Switcher */}
        <div className="grid grid-cols-4 p-1 bg-[#141B2D] border border-[#1E293B] rounded-xl text-[10px] font-mono font-semibold">
          {(["ALL", "CSE", "IT", "AIDS"] as const).map((branch) => (
            <button
              key={branch}
              type="button"
              onClick={() => onBranchFilterChange(branch)}
              className={`py-1 rounded-lg transition-all text-center ${
                branchFilter === branch
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {branch}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Tree: Lessons -> Modules -> Topics + Assessment Card */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {lessons.map((lesson) => {
          const isLessonExpanded = expandedLessons[lesson.id];
          const isLessonActive = activeLessonId === lesson.id;
          const isBranchSpecific = lesson.track_type === "branch_specific";

          return (
            <div
              key={lesson.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isLessonActive
                  ? "bg-[#141B2D]/80 border-indigo-500/40"
                  : "bg-[#111728]/50 border-[#1E293B] hover:border-slate-700"
              }`}
            >
              {/* Lesson Accordion Header */}
              <button
                type="button"
                onClick={() => toggleLesson(lesson.id)}
                className="w-full p-3 text-left flex items-start justify-between gap-2 hover:bg-[#1A2338]/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                      Lesson {lesson.lesson_number}
                    </span>
                    {isBranchSpecific && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                        {lesson.branch_tags.join("/")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1 leading-snug">
                    {lesson.title}
                  </div>
                </div>

                <div className="mt-1 text-slate-500">
                  {isLessonExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Lesson Child Modules */}
              {isLessonExpanded && (
                <div className="p-2 space-y-2.5 border-t border-[#1E293B] bg-[#0E131F]/90">
                  {(lesson.modules || []).map((mod) => {
                    const isModExpanded = expandedModules[mod.id];
                    const isModActive = activeModuleId === mod.id;

                    // Compute solved problems in module
                    const totalProblems = (mod.topics || []).reduce(
                      (acc, t) => acc + (t.problems?.length || 5),
                      0
                    );
                    const solvedProblems = (mod.topics || []).reduce(
                      (acc, t) => acc + (t.solved_count || 0),
                      0
                    );
                    const isUnlocked = solvedProblems >= (mod.unlock_threshold || 15) || true; // Demo unlocked

                    return (
                      <div
                        key={mod.id}
                        className={`rounded-xl border p-2.5 space-y-2 transition-all ${
                          isModActive
                            ? "bg-[#161F36] border-indigo-500/50"
                            : "bg-[#111728] border-[#1E293B]"
                        }`}
                      >
                        {/* Module Header */}
                        <div
                          onClick={() => toggleModule(mod.id)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <div className="text-[10px] font-mono font-bold text-slate-400">
                              Module {mod.module_number}
                            </div>
                            <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                              {mod.title}
                            </div>
                          </div>
                          {isModExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>

                        {/* Progress Bar (X / 25) */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>{solvedProblems}/{totalProblems}</span>
                            <span className="text-indigo-400">{Math.round((solvedProblems / Math.max(1, totalProblems)) * 100)}%</span>
                          </div>
                          <div className="h-1 bg-[#1A2338] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${(solvedProblems / Math.max(1, totalProblems)) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* 5 Topics List & Module Assessment Card */}
                        {isModExpanded && (
                          <div className="pt-2 border-t border-[#1E293B] space-y-1">
                            {(mod.topics || []).map((topic) => {
                              const isTopicActive = activeTopicId === topic.id;
                              const isSolved = (topic.solved_count || 0) >= 3;

                              return (
                                <button
                                  key={topic.id}
                                  type="button"
                                  onClick={() => onSelectTopic(lesson.id, mod.id, topic.id)}
                                  className={`w-full text-left p-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                                    isTopicActive
                                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                                      : "text-slate-400 hover:text-slate-200 hover:bg-[#1A2338]/60"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-[10px] opacity-60">T{topic.topic_order}</span>
                                    <span className="truncate">{topic.title}</span>
                                  </div>

                                  {isSolved && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}

                            {/* Module Assessment Trigger Card */}
                            <div className="pt-2">
                              <Link
                                href={`/assessment/${mod.id}`}
                                className="block p-2 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 hover:border-purple-400 text-xs text-purple-200 font-mono transition-all group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-bold text-white">
                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Assessment</span>
                                  </div>
                                  <span className="text-[10px] text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform">
                                    90m ↗
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  10 MCQ · 5 Code · 80% pass
                                </div>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
