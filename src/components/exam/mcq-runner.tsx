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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-mono text-slate-500 font-medium">
                {currentQ.category} • {currentQ.sub_topic}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              {negativeMarking && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                  +1.00 / -0.25 Mark
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  currentQ.difficulty === "Easy"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-sm md:text-base font-semibold text-slate-900 leading-relaxed whitespace-pre-line p-6 rounded-3xl bg-white border border-slate-200/90 shadow-luxury">
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
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-xs ${
                    isSelected
                      ? "bg-indigo-50/90 border-indigo-500 text-indigo-950 font-semibold shadow-sm"
                      : "bg-white border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-xs md:text-sm font-medium">{opt}</span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleReview(currentQ.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-colors ${
                isMarked
                  ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
            </button>

            {currentAnswer !== undefined && (
              <button
                type="button"
                onClick={() => onClearAnswer(currentQ.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-mono font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => onNavigate(currentIndex + 1)}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-mono font-bold text-white btn-luxury-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Question Navigation Palette */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-luxury flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Question Palette
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Review ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full ring-2 ring-indigo-500 bg-white" />
              <span>Current</span>
            </div>
          </div>

          {/* Palette Grid Buttons */}
          <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isMarkedReview = markedForReview.includes(q.id);
              const isCurrent = currentIndex === idx;

              let btnStyle = "bg-slate-50 text-slate-600 border border-slate-200/80";
              if (isAnswered && isMarkedReview) {
                btnStyle = "bg-purple-50 text-purple-700 border border-purple-200 font-bold";
              } else if (isAnswered) {
                btnStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold";
              } else if (isMarkedReview) {
                btnStyle = "bg-amber-50 text-amber-700 border border-amber-200 font-bold";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => onNavigate(idx)}
                  className={`h-9 rounded-xl font-mono text-xs font-semibold flex items-center justify-center transition-all ${btnStyle} ${
                    isCurrent ? "ring-2 ring-indigo-500 font-bold scale-105 bg-indigo-50 text-indigo-700" : "hover:bg-slate-100"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Info Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-[11px] font-mono text-slate-600 space-y-1">
          <div className="text-indigo-900 font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
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
