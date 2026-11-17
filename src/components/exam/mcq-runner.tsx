"use client";

import { motion } from "framer-motion";
import { MCQQuestion } from "@/types";
import { CheckCircle2, Bookmark, AlertCircle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface MCQRunnerProps {
  questions: MCQQuestion[];
  answers: Record<string, number>;
  markedForReview: string[];
  currentIndex: number;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
  onClearAnswer: (questionId: string) => void;
  onToggleReview: (questionId: string) => void;
  onNavigate: (index: number) => void;
  negativeMarking?: boolean;
}

export function MCQRunner({
  questions,
  answers,
  markedForReview,
  currentIndex,
  onSelectAnswer,
  onClearAnswer,
  onToggleReview,
  onNavigate,
  negativeMarking = true,
}: MCQRunnerProps) {
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentAnswer = answers[currentQ.id];
  const isMarked = markedForReview.includes(currentQ.id);

  const answeredCount = Object.keys(answers).length;
  const reviewCount = markedForReview.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full font-sans">
      {/* Left 3 Columns: Active Question Card */}
      <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Question Header & Category */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {currentQ.category} • {currentQ.sub_topic}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              {negativeMarking && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px]">
                  +1.00 / -0.25 Mark
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  currentQ.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-sm md:text-base font-medium text-zinc-100 leading-relaxed whitespace-pre-line p-5 rounded-xl bg-obsidian-900 border border-white/[0.08] shadow-card">
            {currentQ.question_text}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentAnswer === idx;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.004 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => onSelectAnswer(currentQ.id, idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500 text-white shadow-glow"
                      : "bg-obsidian-900 border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16] hover:bg-obsidian-850"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-white/[0.04] text-zinc-400 border border-white/[0.08]"
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-xs md:text-sm font-medium">{opt}</span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleReview(currentQ.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                isMarked
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
            </button>

            {currentAnswer !== undefined && (
              <button
                type="button"
                onClick={() => onClearAnswer(currentQ.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-rose-400 hover:bg-white/[0.04] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Selection</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => onNavigate(currentIndex - 1)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-mono text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => onNavigate(currentIndex + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-glow hover:shadow-indigo-500/50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Question Navigation Palette */}
      <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] flex flex-col justify-between space-y-4 shadow-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Question Palette
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Review ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-white/[0.1]" />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded ring-1 ring-indigo-500" />
              <span>Current</span>
            </div>
          </div>

          {/* Palette Grid Buttons */}
          <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isMarkedReview = markedForReview.includes(q.id);
              const isCurrent = currentIndex === idx;

              let btnStyle = "bg-white/[0.04] text-zinc-400 border border-white/[0.06]";
              if (isAnswered && isMarkedReview) {
                btnStyle = "bg-purple-600/30 text-purple-300 border border-purple-500/40";
              } else if (isAnswered) {
                btnStyle = "bg-emerald-600/25 text-emerald-300 border border-emerald-500/40";
              } else if (isMarkedReview) {
                btnStyle = "bg-amber-600/25 text-amber-300 border border-amber-500/40";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => onNavigate(idx)}
                  className={`h-9 rounded-lg font-mono text-xs font-semibold flex items-center justify-center transition-all ${btnStyle} ${
                    isCurrent ? "ring-2 ring-indigo-400 font-bold scale-105" : "hover:bg-white/[0.08]"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Info Card */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-zinc-400 space-y-1">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Section Lock Warning</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Answers are auto-committed when section timer ends. You cannot return once submitted.
          </p>
        </div>
      </div>
    </div>
  );
}
