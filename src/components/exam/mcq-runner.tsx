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
  theme = "dark",
}: MCQRunnerProps) {
  const isDark = theme === "dark";
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentAnswer = answers[currentQ.id];
  const isMarked = markedForReview.includes(currentQ.id);

  const answeredCount = Object.keys(answers).length;
  const reviewCount = markedForReview.length;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 h-full font-sans ${isDark ? "text-slate-200" : "text-slate-900"}`}>
      {/* Left 3 Columns: Active Question Card */}
      <div className="lg:col-span-3 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Question Header & Category */}
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                isDark 
                  ? "bg-[#9DFF00]/10 text-[#9DFF00] border-[#9DFF00]/30" 
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className={`text-xs font-mono font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {currentQ.category} • {currentQ.sub_topic}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              {negativeMarking && (
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                  isDark
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                  +1.00 / -0.25 Mark
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  currentQ.difficulty === "Easy"
                    ? isDark
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isDark
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className={`text-sm md:text-base font-semibold leading-relaxed whitespace-pre-line p-6 rounded-2xl border ${
            isDark
              ? "bg-[#161B22] border-slate-800 text-slate-100 shadow-md"
              : "bg-white border-slate-200/90 text-slate-900 shadow-luxury"
          }`}>
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
                      ? isDark
                        ? "bg-[#9DFF00]/10 border-[#9DFF00] text-white ring-1 ring-[#9DFF00]/40 shadow-sm"
                        : "bg-indigo-50/90 border-indigo-500 text-indigo-950 font-semibold shadow-sm"
                      : isDark
                        ? "bg-[#161B22] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#1C2128]"
                        : "bg-white border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-colors ${
                        isSelected
                          ? isDark
                            ? "bg-[#9DFF00] text-black"
                            : "bg-indigo-600 text-white shadow-xs"
                          : isDark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-xs md:text-sm font-medium">{opt}</span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-[#9DFF00]" : "text-indigo-600"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleReview(currentQ.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono transition-colors border ${
                isMarked
                  ? isDark
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                    : "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                  : isDark
                    ? "bg-[#161B22] text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                    : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
            </button>

            {currentAnswer !== undefined && (
              <button
                type="button"
                onClick={() => onClearAnswer(currentQ.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
                  isDark
                    ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                }`}
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
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-mono font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all border ${
                isDark
                  ? "bg-[#161B22] hover:bg-slate-800 text-slate-200 border-slate-800"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => onNavigate(currentIndex + 1)}
              className={`flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-mono font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all ${
                isDark
                  ? "bg-[#9DFF00] hover:bg-[#8CE600] text-black"
                  : "btn-luxury-primary text-white shadow-md"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Question Navigation Palette */}
      <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-5 ${
        isDark
          ? "bg-[#161B22] border-slate-800 shadow-md"
          : "bg-white border-slate-200/90 shadow-luxury"
      }`}>
        <div className="space-y-4">
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-900"}`}>
              Question Palette
            </span>
            <span className={`text-xs font-mono font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Legend */}
          <div className={`grid grid-cols-2 gap-2 text-[10px] font-mono pb-3 border-b ${
            isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
          }`}>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Review ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ring-2 ${isDark ? "ring-[#9DFF00] bg-[#161B22]" : "ring-indigo-500 bg-white"}`} />
              <span>Current</span>
            </div>
          </div>

          {/* Palette Grid Buttons */}
          <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isMarkedReview = markedForReview.includes(q.id);
              const isCurrent = currentIndex === idx;

              let btnStyle = isDark
                ? "bg-slate-900 text-slate-400 border border-slate-800"
                : "bg-slate-50 text-slate-600 border border-slate-200/80";

              if (isAnswered && isMarkedReview) {
                btnStyle = isDark
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold"
                  : "bg-purple-50 text-purple-700 border border-purple-200 font-bold";
              } else if (isAnswered) {
                btnStyle = isDark
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold";
              } else if (isMarkedReview) {
                btnStyle = isDark
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  : "bg-amber-50 text-amber-700 border border-amber-200 font-bold";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => onNavigate(idx)}
                  className={`h-9 rounded-xl font-mono text-xs font-semibold flex items-center justify-center transition-all ${btnStyle} ${
                    isCurrent 
                      ? isDark
                        ? "ring-2 ring-[#9DFF00] font-bold scale-105 bg-[#9DFF00]/20 text-[#9DFF00]"
                        : "ring-2 ring-indigo-500 font-bold scale-105 bg-indigo-50 text-indigo-700" 
                      : isDark
                        ? "hover:bg-slate-800"
                        : "hover:bg-slate-100"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Info Card */}
        <div className={`p-4 rounded-xl border text-[11px] font-mono space-y-1 ${
          isDark
            ? "bg-[#0D1117] border-slate-800 text-slate-400"
            : "bg-indigo-50/60 border-indigo-100 text-slate-600"
        }`}>
          <div className={`font-bold flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-indigo-900"}`}>
            <AlertCircle className={`w-3.5 h-3.5 ${isDark ? "text-[#9DFF00]" : "text-indigo-600"}`} />
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
