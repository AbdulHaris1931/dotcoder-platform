"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SplitPaneIDE } from "@/components/ide/split-pane-ide";
import { CurriculumStore } from "@/lib/curriculum-store";
import { CurriculumProblem, CurriculumTopic } from "@/types/curriculum";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function PracticeProblemPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = (params?.problemId as string) || "";

  const [problem, setProblem] = useState<CurriculumProblem | null>(null);
  const [topic, setTopic] = useState<CurriculumTopic | null>(null);
  const [solvedSuccess, setSolvedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!problemId) return;
    const p = CurriculumStore.getProblemById(problemId);
    if (p) {
      setProblem(p);
      const t = CurriculumStore.getTopicById(p.topic_id);
      setTopic(t);
    } else {
      // Fallback to first practice problem
      const fallback = CurriculumStore.getProblemById("optimal-two-sum-index-pairs");
      if (fallback) {
        setProblem(fallback);
        const t = CurriculumStore.getTopicById(fallback.topic_id);
        setTopic(t);
      }
    }
  }, [problemId]);

  if (!problem) {
    return (
      <div className="h-screen w-full bg-[#0B0F17] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Loading practice workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0B0F17] flex flex-col font-sans overflow-hidden">
      {/* Top Practice Navigation Bar */}
      <div className="h-11 border-b border-[#1E293B] bg-[#0E131F] px-4 flex items-center justify-between text-xs font-mono text-slate-400 select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/curriculum"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Curriculum</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-semibold truncate max-w-xs sm:max-w-md">
            {topic?.title || "Topic"}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400 font-bold truncate max-w-xs">
            {problem.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {solvedSuccess && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold animate-in fade-in">
              <CheckCircle2 className="w-3 h-3" />
              <span>All 6 Cases Accepted (+120 XP)</span>
            </div>
          )}

          <Link
            href="/student/dashboard"
            className="text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Main Resizable Split-Pane IDE */}
      <div className="flex-1 overflow-hidden">
        <SplitPaneIDE
          problem={problem}
          mode="practice"
          conceptNoteMarkdown={topic?.concept_markdown}
          onSolveSuccess={() => setSolvedSuccess(true)}
        />
      </div>
    </div>
  );
}
