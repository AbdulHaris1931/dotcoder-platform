"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SplitPaneIDE } from "@/components/ide/split-pane-ide";
import { CurriculumStore } from "@/lib/curriculum-store";
import { CurriculumProblem, CurriculumTopic } from "@/types/curriculum";

export default function PracticeProblemPage() {
  const params = useParams();
  const problemId = (params?.problemId as string) || "";

  const [problem, setProblem] = useState<CurriculumProblem | null>(null);
  const [topic, setTopic] = useState<CurriculumTopic | null>(null);
  const [, setSolvedSuccess] = useState<boolean>(false);

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
      <div className="h-screen w-full bg-[#070B09] text-[#F4F7F5] flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse" />
          <span>Loading practice workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#070B09] flex flex-col font-sans overflow-hidden">
      <SplitPaneIDE
        problem={problem}
        mode="practice"
        topicTitle={topic?.title}
        conceptNoteMarkdown={topic?.concept_markdown}
        onSolveSuccess={() => setSolvedSuccess(true)}
      />
    </div>
  );
}
