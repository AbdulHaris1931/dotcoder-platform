"use client";

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
  theme?: "light" | "dark";
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full font-sans text-[#F4F7F5]">
      {/* Left 3 Columns: Active Question Card */}
      <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Question Header & Category */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2C24] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full border bg-[#9DFF00]/10 text-[#9DFF00] border-[#9DFF00]/30 tabular-nums">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-mono font-medium text-[#99A9A0]">
                {currentQ.category} &bull; {currentQ.sub_topic}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              {negativeMarking && (
                <span className="px-2.5 py-0.5 rounded-full border text-[11px] font-bold bg-rose-500/10 text-rose-300 border-rose-500/30 tabular-nums">
                  +1.00 / -0.25 Mark
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  currentQ.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-sm md:text-base font-semibold leading-relaxed whitespace-pre-line p-6 rounded-2xl border bg-[#0C120F] border-[#1E2C24] text-[#F4F7F5]">
            {currentQ.question_text}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentAnswer === idx;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => onSelectAnswer(currentQ.id, idx)}
                  className={`w-full p-4 rounded-xl border cursor-pointer text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-[#9DFF00]/10 border-[#9DFF00] text-[#F4F7F5] ring-1 ring-[#9DFF00]/35"
                      : "bg-[#0C120F] border-[#1E2C24] text-[#D5E0D9] hover:border-[#2C4034] hover:bg-[#121B16]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#9DFF00] text-[#070B09]"
                          : "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]"
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-xs md:text-sm font-medium">{opt}</span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#9DFF00]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1E2C24]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleReview(currentQ.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-colors border cursor-pointer ${
                isMarked
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/35 font-bold"
                  : "bg-[#0C120F] text-[#D5E0D9] hover:text-[#F4F7F5] border-[#1E2C24] hover:border-[#2C4034]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
            </button>

            {currentAnswer !== undefined && (
              <button
                type="button"
                onClick={() => onClearAnswer(currentQ.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors text-[#99A9A0] hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => onNavigate(currentIndex - 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-mono font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all border bg-[#0C120F] hover:bg-[#121B16] text-[#F4F7F5] border-[#1E2C24] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => onNavigate(currentIndex + 1)}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-mono font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Question Navigation Palette */}
      <div className="p-6 rounded-2xl border flex flex-col justify-between space-y-5 bg-[#0C120F] border-[#1E2C24]">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F7F5]">
              Question Palette
            </span>
            <span className="text-xs font-mono font-medium text-[#99A9A0] tabular-nums">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pb-3 border-b border-[#1E2C24] text-[#99A9A0]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Review ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2C4034]" />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full ring-2 ring-[#9DFF00] bg-[#0C120F]" />
              <span>Current</span>
            </div>
          </div>

          {/* Palette Grid Buttons */}
          <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isMarkedReview = markedForReview.includes(q.id);
              const isCurrent = currentIndex === idx;

              let btnStyle = "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]";

              if (isAnswered && isMarkedReview) {
                btnStyle = "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold";
              } else if (isAnswered) {
                btnStyle = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold";
              } else if (isMarkedReview) {
                btnStyle = "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold";
              }

              return (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => onNavigate(idx)}
                  className={`h-9 rounded-xl font-mono text-xs font-semibold flex items-center justify-center transition-all cursor-pointer tabular-nums ${btnStyle} ${
                    isCurrent
                      ? "ring-2 ring-[#9DFF00] font-bold scale-105 bg-[#9DFF00]/20 text-[#9DFF00]"
                      : "hover:bg-[#18241D]"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Info Card */}
        <div className="p-4 rounded-xl border text-[11px] font-mono space-y-1 bg-[#070B09] border-[#1E2C24] text-[#99A9A0]">
          <div className="font-bold flex items-center gap-1.5 text-[#F4F7F5]">
            <AlertCircle className="w-3.5 h-3.5 text-[#9DFF00]" />
            <span>Section Lock Warning</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Answers are auto-committed when the section timer ends. You cannot return once submitted.
          </p>
        </div>
      </div>
    </div>
  );
}
