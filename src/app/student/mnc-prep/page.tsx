"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MNC_CURRICULUM_UNITS,
  MNC_CODING_PROBLEMS,
  MNC_MCQS,
  MncUnit,
  MncMCQ,
} from "@/lib/mnc-curriculum-data";
import { MncStore, subscribeToMncStore, MncProgressState, MncMcqPracticeRecord } from "@/lib/mnc-store";
import {
  BookOpen,
  Code2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Terminal,
  ChevronRight,
  Search,
  X,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";

export default function MncPrepPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<MncProgressState>({
    unlockedUnitIds: ["unit-1"],
    assessmentRecords: {},
  });
  const [selectedUnit, setSelectedUnit] = useState<MncUnit | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"problems" | "mcqs" | "assessment">("problems");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [notification, setNotification] = useState<string | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, MncMcqPracticeRecord>>({});

  useEffect(() => {
    if (selectedUnit) {
      setMcqAnswers(MncStore.getMcqPracticeAnswers(selectedUnit.id));
    }
  }, [selectedUnit]);

  useEffect(() => {
    const update = () => {
      setProgress(MncStore.getProgress());
      if (selectedUnit) {
        setMcqAnswers(MncStore.getMcqPracticeAnswers(selectedUnit.id));
      }
    };
    update();
    const unsub = subscribeToMncStore(update);
    return unsub;
  }, [selectedUnit]);

  const totalUnits = MNC_CURRICULUM_UNITS.length;
  const unlockedCount = progress.unlockedUnitIds.length;
  const passedUnitsCount = Object.values(progress.assessmentRecords).filter((r) => r.isPassed).length;

  const filteredUnits = useMemo(() => {
    return MNC_CURRICULUM_UNITS.filter((unit) => {
      const matchesSearch =
        unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.domain_tag.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "ALL" ||
        (selectedFilter === "UNLOCKED" && progress.unlockedUnitIds.includes(unit.id)) ||
        (selectedFilter === "PASSED" && progress.assessmentRecords[unit.id]?.isPassed) ||
        (selectedFilter === "LOCKED" && !progress.unlockedUnitIds.includes(unit.id));

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter, progress]);

  // Selected Unit's coding problems and MCQs
  const unitCodingProblems = useMemo(() => {
    if (!selectedUnit) return [];
    return MNC_CODING_PROBLEMS.filter((p) => selectedUnit.coding_problem_ids.includes(p.id));
  }, [selectedUnit]);

  const unitMCQs = useMemo(() => {
    if (!selectedUnit) return [];
    return MNC_MCQS.filter((m) => selectedUnit.mcq_ids.includes(m.id));
  }, [selectedUnit]);

  // Unit MCQ practice telemetry
  const unitMcqAnsweredCount = Object.keys(mcqAnswers).length;
  const unitMcqCorrectCount = Object.values(mcqAnswers).filter((a) => a.isCorrect).length;
  const unitMcqAccuracy =
    unitMcqAnsweredCount > 0
      ? Math.round((unitMcqCorrectCount / unitMcqAnsweredCount) * 100)
      : 0;

  const handleSelectOption = (mcq: MncMCQ, selectedOptIndex: number) => {
    if (!selectedUnit) return;
    // Single-attempt answer locking: once submitted, cannot swap until reset
    if (mcqAnswers[mcq.id]) return;

    const optLetters: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    const letter = optLetters[selectedOptIndex];
    const selectedText = mcq.options[selectedOptIndex];
    const isCorrect = letter === mcq.correct_letter;

    MncStore.saveMcqAnswer(selectedUnit.id, mcq.id, letter, selectedText, isCorrect);
    setMcqAnswers((prev) => ({
      ...prev,
      [mcq.id]: {
        mcqId: mcq.id,
        unitId: selectedUnit.id,
        selectedLetter: letter,
        selectedOption: selectedText,
        isCorrect,
        answeredAt: new Date().toISOString(),
      },
    }));
  };

  const handleResetUnitPractice = () => {
    if (!selectedUnit) return;
    MncStore.resetUnitMcqPractice(selectedUnit.id);
    setMcqAnswers({});
    setNotification(`Practice responses for Unit ${selectedUnit.unit_number} have been reset.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLaunchAssessment = (unit: MncUnit) => {
    const isUnlocked = progress.unlockedUnitIds.includes(unit.id);
    if (!isUnlocked) {
      setNotification(`Unit ${unit.unit_number} is locked. Score 75%+ on Unit ${unit.unit_number - 1} to unlock.`);
      setTimeout(() => setNotification(null), 3500);
      return;
    }
    router.push(`/student/exam/${unit.assessment_id}`);
  };

  const handleReset = () => {
    MncStore.resetProgress();
    setNotification("Progress reset to default (Unit 1 unlocked).");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#070B09] text-[#F4F7F5] pb-20 font-sans">
      {/* Top Banner / Header */}
      <div className="bg-[#0C120F] border-b border-[#1E2C24] px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#9DFF00] text-[#070B09]">
                MNC 300 Master Curriculum
              </span>
              <span className="text-xs text-[#99A9A0] font-mono">100 Coding &bull; 200 MCQs</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>Mentor Synced: Dr. S. Meenakshi</span>
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7F5] tracking-tight">
              MNC Technical Interview Preparation Modules
            </h1>
            <p className="text-xs sm:text-sm text-[#99A9A0] mt-1 max-w-2xl leading-relaxed">
              10 sequential units curated from Tier-1 MNC placement screenings (TCS, Zoho, Infosys, Cognizant).
              Score 75% or higher on each unit assessment to unlock the next challenge.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => router.push("/student/compiler")}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#1E2C24] bg-[#121B16] hover:bg-[#18241D] hover:border-[#2C4034] text-[#F4F7F5] text-xs font-bold transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[#9DFF00]" />
              <span>Free Sandbox</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset progress to Unit 1"
              className="p-2.5 rounded-xl border border-[#1E2C24] bg-[#121B16] hover:bg-[#18241D] text-[#99A9A0] hover:text-[#F4F7F5] transition-colors cursor-pointer"
              title="Reset progress to Unit 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-2xl bg-[#121B16] text-[#9DFF00] text-xs font-bold flex items-center justify-between border border-[#9DFF00]/30"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#9DFF00]" />
              <span>{notification}</span>
            </div>
            <button type="button" onClick={() => setNotification(null)} className="text-[#F4F7F5] hover:text-[#9DFF00] cursor-pointer">
              Close
            </button>
          </motion.div>
        )}

        {/* 4 Progression Metrics Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#85998D]">
              Curriculum Progression
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-3xl font-extrabold text-[#F4F7F5]">{unlockedCount}</span>
              <span className="text-xs text-[#99A9A0]">/ 10 Units</span>
            </div>
            <div className="w-full bg-[#121B16] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#9DFF00] transition-all duration-500"
                style={{ width: `${(unlockedCount / 10) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-[#85998D]">Sequential gating active</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#85998D]">
              Units Mastered
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-3xl font-extrabold text-emerald-400">{passedUnitsCount}</span>
              <span className="text-xs text-[#99A9A0]">Passed (&ge; 75%)</span>
            </div>
            <div className="w-full bg-[#121B16] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${(passedUnitsCount / 10) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-300 font-semibold">Tier-1 threshold verified</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#85998D]">
              Total Coding Challenges
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-3xl font-extrabold text-[#F4F7F5]">100</span>
              <span className="text-xs text-[#99A9A0]">Problems</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
              <span className="text-emerald-300 font-bold">25 Easy</span>
              <span className="text-amber-300 font-bold">65 Med</span>
              <span className="text-rose-300 font-bold">10 Hard</span>
            </div>
            <span className="text-[10px] text-[#85998D]">Across 9 DSA domains</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#85998D]">
              Technical MCQ Bank
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-3xl font-extrabold text-sky-400">200</span>
              <span className="text-xs text-[#99A9A0]">Questions</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D5E0D9]">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Full Part III Answer Key</span>
            </div>
            <span className="text-[10px] text-[#85998D]">10 Subject categories (20 each)</span>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0C120F] border border-[#1E2C24] w-fit">
            {[
              { id: "ALL", label: `All Units (${totalUnits})` },
              { id: "UNLOCKED", label: `Unlocked (${unlockedCount})` },
              { id: "PASSED", label: `Passed (${passedUnitsCount})` },
              { id: "LOCKED", label: `Locked (${totalUnits - unlockedCount})` },
            ].map((f) => (
              <button
                type="button"
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === f.id
                    ? "bg-[#9DFF00] text-[#070B09]"
                    : "text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#85998D] absolute left-3 top-2.5" />
            <input
              id="mnc-prep-search-input"
              name="mnc-prep-search"
              aria-label="Search unit by topic, algorithm, or domain"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unit by topic, algorithm, or domain..."
              className="pl-8 pr-3 py-2 rounded-xl border border-[#1E2C24] bg-[#070B09] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] w-full sm:w-72"
            />
          </div>
        </div>

        {/* 10 Modular Units Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredUnits.map((unit) => {
            const isUnlocked = progress.unlockedUnitIds.includes(unit.id);
            const record = progress.assessmentRecords[unit.id];
            const isPassed = record?.isPassed;

            return (
              <div
                key={unit.id}
                className={`p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  isUnlocked
                    ? "bg-[#0C120F] border-[#1E2C24] hover:border-[#2C4034]"
                    : "bg-[#0A0F0D] border-[#1E2C24]/70 opacity-85"
                }`}
              >
                {/* Top Badge & Unlock Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#121B16] border border-[#2C4034] text-[#9DFF00] font-mono text-xs font-extrabold tabular-nums">
                        UNIT {unit.unit_number.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D5E0D9] bg-[#121B16] border border-[#1E2C24] px-2 py-0.5 rounded-md">
                        {unit.domain_tag}
                      </span>
                    </div>

                    <div>
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Passed ({record.bestScore}%)</span>
                        </span>
                      ) : isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/35">
                          <Unlock className="w-3 h-3 text-[#9DFF00]" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]">
                          <Lock className="w-3 h-3 text-[#85998D]" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-[#F4F7F5] leading-snug">{unit.title}</h3>
                    <p className="text-xs font-medium text-emerald-300 mt-0.5">{unit.subtitle}</p>
                    <p className="text-xs text-[#99A9A0] mt-2 leading-relaxed line-clamp-2">
                      {unit.description}
                    </p>
                  </div>

                  {/* Contents pill counts */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#1E2C24] text-xs font-mono text-[#D5E0D9] tabular-nums">
                    <div className="flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-[#9DFF00]" />
                      <span>{unit.coding_problem_ids.length} Coding Problems</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>{unit.mcq_ids.length} MCQs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>45 Min Exam</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-5 mt-4 border-t border-[#1E2C24] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setActiveDrawerTab("problems");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#D5E0D9] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors cursor-pointer"
                  >
                    <span>Browse Unit</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchAssessment(unit)}
                    disabled={!isUnlocked}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isUnlocked
                        ? "bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09]"
                        : "bg-[#121B16] text-[#85998D] border border-[#1E2C24] cursor-not-allowed"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isPassed ? "Retake Assessment" : "Take Assessment (45m)"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Slide-over Unit Detail Inspection Drawer */}
      <AnimatePresence>
        {selectedUnit && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUnit(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="relative w-full max-w-xl bg-[#0C120F] border-l border-[#1E2C24] shadow-2xl h-full flex flex-col z-10 text-[#F4F7F5] font-sans"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#1E2C24] flex items-center justify-between bg-[#070B09]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
                      UNIT {selectedUnit.unit_number.toString().padStart(2, "0")}
                    </span>
                    <span className="text-xs font-mono text-[#99A9A0] font-bold uppercase">
                      {selectedUnit.domain_tag}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#F4F7F5]">{selectedUnit.title}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUnit(null)}
                  className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex items-center gap-1.5 px-5 pt-3 border-b border-[#1E2C24] bg-[#0C120F]">
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab("problems")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeDrawerTab === "problems"
                      ? "border-[#9DFF00] text-[#9DFF00]"
                      : "border-transparent text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  10 Coding Challenges
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab("mcqs")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDrawerTab === "mcqs"
                      ? "border-[#9DFF00] text-[#9DFF00]"
                      : "border-transparent text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  <span>20 Practice MCQs</span>
                  {unitMcqAnsweredCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
                      {unitMcqAnsweredCount}/20
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawerTab("assessment")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeDrawerTab === "assessment"
                      ? "border-[#9DFF00] text-[#9DFF00]"
                      : "border-transparent text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  Unit Assessment (45m)
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeDrawerTab === "problems" && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#99A9A0]">
                      10 verified MNC problems for this unit. Click &quot;Solve&quot; to practice in Python, Java, C++, or C without rules.
                    </p>

                    {unitCodingProblems.map((prob) => (
                      <div
                        key={prob.id}
                        className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-2 hover:border-[#2C4034] transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#85998D]">
                              Problem #{prob.number} &bull; {prob.category}
                            </span>
                            <h4 className="font-bold text-xs text-[#F4F7F5] mt-0.5">{prob.title}</h4>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                                : "bg-rose-500/15 text-rose-300 border border-rose-500/25"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#99A9A0] leading-relaxed font-sans">
                          {prob.description}
                        </p>

                        <div className="pt-2 border-t border-[#1E2C24] flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[#85998D] text-[10px] truncate max-w-[240px]">
                            {prob.constraints}
                          </span>
                          <button
                            type="button"
                            onClick={() => router.push(`/student/compiler?problem=${prob.slug}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#9DFF00] hover:underline cursor-pointer"
                          >
                            <Terminal className="w-3 h-3" />
                            <span>Solve &rarr;</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDrawerTab === "mcqs" && (
                  <div className="space-y-4">
                    {/* Live Practice Telemetry & Action Bar */}
                    <div className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] text-[#F4F7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9DFF00] bg-[#9DFF00]/10 px-2 py-0.5 rounded-full border border-[#9DFF00]/25">
                            Interactive Practice Mode
                          </span>
                          <span className="text-[11px] text-[#99A9A0] font-mono">
                            Zero-Spoiler Evaluation
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#D5E0D9] tabular-nums">
                          <span>
                            Answered: <strong className="text-[#F4F7F5]">{unitMcqAnsweredCount}</strong>/20
                          </span>
                          <span>&bull;</span>
                          <span>
                            Correct: <strong className="text-emerald-400">{unitMcqCorrectCount}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Accuracy:{" "}
                            <strong
                              className={
                                unitMcqAccuracy >= 75
                                  ? "text-emerald-400"
                                  : unitMcqAnsweredCount > 0
                                  ? "text-amber-300"
                                  : "text-[#99A9A0]"
                              }
                            >
                              {unitMcqAccuracy}%
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetUnitPractice}
                          disabled={unitMcqAnsweredCount === 0}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            unitMcqAnsweredCount > 0
                              ? "bg-[#18241D] hover:bg-[#1E2C24] text-[#F4F7F5] border border-[#2C4034]"
                              : "bg-[#0C120F] text-[#85998D] border border-[#1E2C24] cursor-not-allowed opacity-60"
                          }`}
                          title="Reset this unit's practice answers to attempt them fresh"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset &amp; Retry</span>
                        </button>
                      </div>
                    </div>

                    {/* Guidance Note */}
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-200 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Answers &amp; Part III explanations remain hidden until you select an option.</span>
                      </span>
                      <span className="font-mono font-bold text-[#9DFF00] shrink-0">Pass Gate: 75%</span>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                      {unitMCQs.map((mcq) => {
                        const record = mcqAnswers[mcq.id];
                        const isAnswered = !!record;

                        return (
                          <div
                            key={mcq.id}
                            className={`p-4 rounded-2xl bg-[#121B16] border transition-all space-y-3 ${
                              isAnswered
                                ? record.isCorrect
                                  ? "border-emerald-500/40"
                                  : "border-rose-500/40"
                                : "border-[#1E2C24] hover:border-[#2C4034]"
                            }`}
                          >
                            {/* Question Header: No answer leaked */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold text-[#99A9A0] uppercase tracking-wide">
                                Question {mcq.number} &bull; {mcq.category}
                              </span>

                              {isAnswered ? (
                                record.isCorrect ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Correct</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-rose-400" />
                                    <span>Incorrect</span>
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0C120F] text-[#99A9A0] border border-[#1E2C24]">
                                  Unattempted
                                </span>
                              )}
                            </div>

                            {/* Question Text */}
                            <h4 className="font-bold text-xs sm:text-sm text-[#F4F7F5] leading-snug">
                              {mcq.question}
                            </h4>

                            {/* Options Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {mcq.options.map((opt, oIdx) => {
                                const optLetter = ["A", "B", "C", "D"][oIdx] as "A" | "B" | "C" | "D";
                                const isSelected = record?.selectedLetter === optLetter;
                                const isTrueCorrect = optLetter === mcq.correct_letter;

                                let btnStyle = "bg-[#0C120F] border-[#1E2C24] text-[#D5E0D9] hover:border-[#9DFF00]/45 hover:bg-[#18241D] cursor-pointer";
                                let badgeStyle = "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]";

                                if (isAnswered) {
                                  if (isSelected && record.isCorrect) {
                                    btnStyle = "bg-emerald-500/15 border-2 border-emerald-400 text-[#F4F7F5] font-bold cursor-default";
                                    badgeStyle = "bg-emerald-400 text-[#070B09] font-extrabold";
                                  } else if (isSelected && !record.isCorrect) {
                                    btnStyle = "bg-rose-500/15 border-2 border-rose-400 text-[#F4F7F5] font-bold cursor-default";
                                    badgeStyle = "bg-rose-400 text-[#070B09] font-extrabold";
                                  } else if (!isSelected && isTrueCorrect) {
                                    btnStyle = "bg-emerald-500/10 border-2 border-dashed border-emerald-400 text-emerald-200 font-semibold cursor-default";
                                    badgeStyle = "bg-emerald-500/20 text-emerald-300 font-bold";
                                  } else {
                                    btnStyle = "bg-[#0A0F0D] border-[#1E2C24] text-[#85998D] opacity-65 cursor-default";
                                    badgeStyle = "bg-[#0C120F] text-[#85998D]";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleSelectOption(mcq, oIdx)}
                                    disabled={isAnswered}
                                    className={`p-2.5 rounded-xl text-left text-xs font-medium border flex items-center justify-between gap-2 transition-all ${btnStyle}`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] shrink-0 ${badgeStyle}`}>
                                        {optLetter}
                                      </span>
                                      <span className="truncate">{opt}</span>
                                    </div>

                                    {isAnswered && (
                                      <div className="shrink-0">
                                        {isSelected && record.isCorrect && (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        )}
                                        {isSelected && !record.isCorrect && (
                                          <XCircle className="w-4 h-4 text-rose-400" />
                                        )}
                                        {!isSelected && isTrueCorrect && (
                                          <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                                            Correct
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation Reveal */}
                            {isAnswered ? (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl border text-xs space-y-1.5 pt-2 ${
                                  record.isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-[#F4F7F5]"
                                    : "bg-[#0C120F] border-[#1E2C24] text-[#F4F7F5]"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                                  <span className="flex items-center gap-1.5 text-[#F4F7F5]">
                                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Part III Official Technical Explanation</span>
                                  </span>
                                  <span className="text-[#9DFF00] bg-[#121B16] px-2 py-0.5 rounded border border-[#1E2C24]">
                                    Correct: Option {mcq.correct_letter}
                                  </span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-[#D5E0D9] font-sans">
                                  {mcq.explanation}
                                </p>
                              </motion.div>
                            ) : (
                              <div className="text-[11px] text-[#85998D] italic flex items-center gap-1.5 pt-1 border-t border-[#1E2C24]">
                                <span>Select an option above to check your answer and reveal the explanation.</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeDrawerTab === "assessment" && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-[#121B16] border border-[#1E2C24] text-[#F4F7F5] space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-[#9DFF00]">
                        <span>45-MINUTE PROCTORED EXAM</span>
                        <span>PASSING: 75%</span>
                      </div>
                      <h4 className="font-display text-base font-bold text-[#F4F7F5]">
                        Unit {selectedUnit.unit_number}: {selectedUnit.title} Assessment
                      </h4>
                      <p className="text-xs text-[#D5E0D9] leading-relaxed">
                        Contains {unitMCQs.length} domain multiple-choice questions plus 2 live coding problems.
                        Evaluates algorithmic accuracy, time complexity invariants, and proctoring integrity.
                      </p>
                      <div className="pt-2 border-t border-[#1E2C24] flex items-center justify-between text-xs font-mono text-[#99A9A0]">
                        <span>Timer: 45:00 min</span>
                        <span>Attempts: Unlimited (Best Score Tracked)</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Sequential Gate Requirement</span>
                      </div>
                      <p className="text-[11px] text-amber-200 leading-relaxed">
                        You must achieve a score of 75% or higher on this assessment to unlock Unit{" "}
                        {Math.min(10, selectedUnit.unit_number + 1)}. Your score and submission code are mirrored to your faculty mentor.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchAssessment(selectedUnit)}
                      className="w-full py-3 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Start 45-Minute Assessment Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
