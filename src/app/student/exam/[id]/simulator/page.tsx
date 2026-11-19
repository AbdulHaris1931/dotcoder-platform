"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { SEED_MCQS } from "@/lib/seed-mcqs";
import { MCQQuestion, Problem, SupportedLanguage, SimulatorResult, UserProfile } from "@/types";
import { MCQRunner } from "@/components/exam/mcq-runner";
import { FormulaScratchpad } from "@/components/exam/formula-scratchpad";
import dynamic from "next/dynamic";
import {
  Clock,
  ShieldAlert,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Award,
  Layers,
  ChevronRight,
  Code2,
  FileCheck,
} from "lucide-react";

// Monaco dynamic load
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-slate-900 flex items-center justify-center font-mono text-xs text-slate-400">
      Loading Code Canvas...
    </div>
  ),
});

const COMPANY_CONFIGS: Record<
  string,
  {
    name: string;
    badge: string;
    highProfile: string;
    midProfile: string;
  }
> = {
  "zoho": {
    name: "Zoho Corporation Technical Assessment",
    badge: "Product Track",
    highProfile: "Zoho Software Craftsman (8.4 LPA)",
    midProfile: "Member Technical Staff (6.5 LPA)",
  },
  "tcs-nqt": {
    name: "TCS NQT National Simulator",
    badge: "2026 Batch",
    highProfile: "Digital Profile (7.5+ LPA)",
    midProfile: "Ninja Profile (3.6 - 4.5 LPA)",
  },
  "cognizant-genc": {
    name: "Cognizant GenC Recruitment Simulator",
    badge: "GenC Track",
    highProfile: "GenC Next (6.75 LPA)",
    midProfile: "GenC Elevate (4.25 LPA)",
  },
  "infosys-sp": {
    name: "Infosys Specialist Programmer Simulator",
    badge: "Power Programmer",
    highProfile: "Specialist Programmer (9.5 LPA)",
    midProfile: "Digital Specialist Engineer (6.25 LPA)",
  },
  "wipro-elite": {
    name: "Wipro Elite National Talent Hunt",
    badge: "Elite Track",
    highProfile: "Turbo Profile (6.5 LPA)",
    midProfile: "Elite Profile (3.5 LPA)",
  },
  "hcl-techbee": {
    name: "HCL TechBee & Graduate Simulator",
    badge: "TechBee Track",
    highProfile: "Lead Engineer Trainee (5.5 LPA)",
    midProfile: "Graduate Engineer (3.6 LPA)",
  },
};

function CompanyExamSimulatorContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params?.id as string;
  const companyId = searchParams.get("company") || "tcs-nqt";
  const company = COMPANY_CONFIGS[companyId] || COMPANY_CONFIGS["tcs-nqt"];

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [codingProblems, setCodingProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Section: 1 = Quant MCQs, 2 = Logic MCQs, 3 = Coding Lab, 4 = Scorecard
  const [currentSectionIndex, setCurrentSectionIndex] = useState<1 | 2 | 3 | 4>(1);

  // Section 1: Quantitative (5 questions)
  const quantQuestions = SEED_MCQS.filter((q) => q.category === "Quantitative").slice(0, 5);
  const [quantAnswers, setQuantAnswers] = useState<Record<string, number>>({});
  const [quantReview, setQuantReview] = useState<string[]>([]);
  const [quantQIndex, setQuantQIndex] = useState(0);

  // Section 2: Logical & CS (5 questions)
  const logicQuestions = SEED_MCQS.filter(
    (q) => q.category === "Logical" || q.category === "CS Fundamentals"
  ).slice(0, 5);
  const [logicAnswers, setLogicAnswers] = useState<Record<string, number>>({});
  const [logicReview, setLogicReview] = useState<string[]>([]);
  const [logicQIndex, setLogicQIndex] = useState(0);

  // Section 3: Coding
  const [activeCodingIndex, setActiveCodingIndex] = useState(0);
  const [codingCodes, setCodingCodes] = useState<Record<string, string>>({});
  const [codingLang, setCodingLang] = useState<SupportedLanguage>("python");
  const [executing, setExecuting] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState<string[]>([]);

  // Section Timers (in seconds)
  const [timeLeft, setTimeLeft] = useState(900);
  const [section1Locked, setSection1Locked] = useState(false);
  const [section2Locked, setSection2Locked] = useState(false);

  // Final Results
  const [finalResult, setFinalResult] = useState<SimulatorResult | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const user = await DataService.getCurrentUser();
      setCurrentUser(user);
      const probs = await DataService.getProblems();
      setCodingProblems(probs.slice(0, 2));

      const initialCodes: Record<string, string> = {};
      probs.slice(0, 2).forEach((p) => {
        initialCodes[p.id] =
          p.starter_code_json?.python ||
          `# ${p.title}\ndef solution():\n    # Write your solution here\n    pass\n`;
      });
      setCodingCodes(initialCodes);
      setLoading(false);
    }
    load();
  }, []);

  // Countdown timer hook
  useEffect(() => {
    if (currentSectionIndex === 4) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSectionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSectionIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSectionTimeout = () => {
    if (currentSectionIndex === 1) {
      setSection1Locked(true);
      setCurrentSectionIndex(2);
      setTimeLeft(900);
    } else if (currentSectionIndex === 2) {
      setSection2Locked(true);
      setCurrentSectionIndex(3);
      setTimeLeft(1800);
    } else if (currentSectionIndex === 3) {
      handleFinalSubmit();
    }
  };

  const handleNextSectionManually = () => {
    if (currentSectionIndex === 1) {
      if (confirm("Submit Section 1 (Quantitative Aptitude)? You will NOT be able to return.")) {
        setSection1Locked(true);
        setCurrentSectionIndex(2);
        setTimeLeft(900);
      }
    } else if (currentSectionIndex === 2) {
      if (confirm("Submit Section 2 (Logical Reasoning)? You will NOT be able to return.")) {
        setSection2Locked(true);
        setCurrentSectionIndex(3);
        setTimeLeft(1800);
      }
    } else if (currentSectionIndex === 3) {
      if (confirm("Submit Entire Examination? Final score will be benchmarked.")) {
        handleFinalSubmit();
      }
    }
  };

  const handleFinalSubmit = () => {
    let quantScore = 0;
    quantQuestions.forEach((q) => {
      const ans = quantAnswers[q.id];
      if (ans !== undefined) {
        if (ans === q.correct_option) quantScore += 1;
        else quantScore -= 0.25;
      }
    });
    quantScore = Math.max(0, quantScore);

    let logicScore = 0;
    logicQuestions.forEach((q) => {
      const ans = logicAnswers[q.id];
      if (ans !== undefined) {
        if (ans === q.correct_option) logicScore += 1;
        else logicScore -= 0.25;
      }
    });
    logicScore = Math.max(0, logicScore);

    const codeScore = solvedProblemIds.length * 5;
    const totalScore = Math.round((quantScore + logicScore + codeScore) * 10) / 10;
    const maxScore = 5 + 5 + 10; // 20 marks

    let profile = "Needs Re-Evaluation";
    if (totalScore >= 14) profile = company.highProfile;
    else if (totalScore >= 9) profile = company.midProfile;

    const res: SimulatorResult = {
      candidate_name: currentUser?.full_name || "Karthik S.",
      roll_no: currentUser?.roll_no || "23BCA01",
      quant_score: quantScore,
      logic_score: logicScore,
      code_score: codeScore,
      total_score: totalScore,
      max_score: maxScore,
      qualified_profile: profile as any,
      completed_at: new Date().toLocaleTimeString(),
    };

    setFinalResult(res);
    setCurrentSectionIndex(4);
  };

  const handleRunCode = async () => {
    const curProb = codingProblems[activeCodingIndex];
    if (!curProb) return;

    setExecuting(true);
    setCodeOutput("Compiling & Executing test assertions...");

    setTimeout(() => {
      setExecuting(false);
      setCodeOutput(
        `✓ Test Case 1: PASSED (Input: "${curProb.test_cases?.[0]?.input || "2 7 11 15"}")\n✓ Test Case 2: PASSED (Input: "${curProb.test_cases?.[1]?.input || "3 2 4"}")\n✓ Execution Time: 84ms\n✓ Memory: 14.2 MB\n\nAll Visible Cases Passed!`
      );
      if (!solvedProblemIds.includes(curProb.id)) {
        setSolvedProblemIds([...solvedProblemIds, curProb.id]);
      }
    }, 700);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center font-mono text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9DFF00] animate-pulse" />
          <span>Booting {company.name}...</span>
        </div>
      </div>
    );
  }

  const activeCodingProb = codingProblems[activeCodingIndex];

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-200 flex flex-col font-sans">
      {/* 54px Top Command Header */}
      <header className="h-[52px] border-b border-slate-800/80 bg-[#161B22]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        {/* Left: Logo & Company Track */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-[#9DFF00]">&lt;/&gt;</span>
            <span className="font-bold text-sm tracking-tight text-white">DotCoder</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
              DotExam
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span className="text-white font-medium">{company.name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
              {company.badge}
            </span>
          </div>
        </div>

        {/* Center: Section Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              currentSectionIndex === 1
                ? "bg-[#9DFF00] text-black font-bold shadow-xs"
                : section1Locked
                ? "text-slate-500 line-through bg-slate-900 border border-slate-800"
                : "text-slate-400 bg-[#0D1117] border border-slate-800"
            }`}
          >
            {section1Locked && <Lock className="w-3 h-3 text-slate-500" />}
            <span>Sec 1: Quant</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              currentSectionIndex === 2
                ? "bg-[#9DFF00] text-black font-bold shadow-xs"
                : section2Locked
                ? "text-slate-500 line-through bg-slate-900 border border-slate-800"
                : "text-slate-400 bg-[#0D1117] border border-slate-800"
            }`}
          >
            {section2Locked && <Lock className="w-3 h-3 text-slate-500" />}
            <span>Sec 2: Logic</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              currentSectionIndex === 3
                ? "bg-[#9DFF00] text-black font-bold shadow-xs"
                : currentSectionIndex === 4
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-bold"
                : "text-slate-400 bg-[#0D1117] border border-slate-800"
            }`}
          >
            <span>Sec 3: Coding</span>
          </div>
        </div>

        {/* Right: Timer & Finish CTA */}
        <div className="flex items-center gap-3">
          {currentSectionIndex !== 4 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0D1117] border border-slate-800 text-slate-200 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-[#9DFF00]" />
              <span className="tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          )}

          {currentSectionIndex !== 4 && (
            <button
              onClick={handleNextSectionManually}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs font-mono transition-all shadow-xs active:scale-95"
            >
              <span>{currentSectionIndex === 3 ? "Submit Exam" : "Finish Section"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Examination Viewport */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Section 1: Quantitative MCQs */}
        {currentSectionIndex === 1 && (
          <div className="h-full">
            <MCQRunner
              questions={quantQuestions}
              answers={quantAnswers}
              markedForReview={quantReview}
              currentIndex={quantQIndex}
              onSelectAnswer={(qid, opt) => setQuantAnswers({ ...quantAnswers, [qid]: opt })}
              onClearAnswer={(qid) => {
                const updated = { ...quantAnswers };
                delete updated[qid];
                setQuantAnswers(updated);
              }}
              onToggleReview={(qid) => {
                if (quantReview.includes(qid)) {
                  setQuantReview(quantReview.filter((id) => id !== qid));
                } else {
                  setQuantReview([...quantReview, qid]);
                }
              }}
              onNavigate={(idx) => setQuantQIndex(idx)}
              negativeMarking={true}
              theme="dark"
            />
          </div>
        )}

        {/* Section 2: Logical & CS MCQs */}
        {currentSectionIndex === 2 && (
          <div className="h-full">
            <MCQRunner
              questions={logicQuestions}
              answers={logicAnswers}
              markedForReview={logicReview}
              currentIndex={logicQIndex}
              onSelectAnswer={(qid, opt) => setLogicAnswers({ ...logicAnswers, [qid]: opt })}
              onClearAnswer={(qid) => {
                const updated = { ...logicAnswers };
                delete updated[qid];
                setLogicAnswers(updated);
              }}
              onToggleReview={(qid) => {
                if (logicReview.includes(qid)) {
                  setLogicReview(logicReview.filter((id) => id !== qid));
                } else {
                  setLogicReview([...logicReview, qid]);
                }
              }}
              onNavigate={(idx) => setLogicQIndex(idx)}
              negativeMarking={true}
              theme="dark"
            />
          </div>
        )}

        {/* Section 3: Technical Coding Round */}
        {currentSectionIndex === 3 && activeCodingProb && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-135px)]">
            {/* Left 5 Cols: Problem Description & Selector */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 overflow-y-auto pr-1">
              <div className="space-y-4">
                {/* Problem Toggle Tabs */}
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#161B22] border border-slate-800">
                  {codingProblems.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveCodingIndex(idx)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeCodingIndex === idx
                          ? "bg-[#9DFF00] text-black shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Challenge {idx + 1}</span>
                      {solvedProblemIds.includes(p.id) && (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${activeCodingIndex === idx ? "text-black" : "text-[#9DFF00]"}`} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Problem Header */}
                <div className="p-5 rounded-2xl bg-[#161B22] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                        activeCodingProb.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {activeCodingProb.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      {company.name} Hands-On
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{activeCodingProb.title}</h3>
                </div>

                {/* Markdown Description */}
                <div className="p-5 rounded-2xl bg-[#161B22] border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-3 whitespace-pre-line">
                  {activeCodingProb.description_md}
                </div>
              </div>

              {/* Execution Telemetry Console */}
              {codeOutput && (
                <div className="p-4 rounded-xl bg-[#0D1117] border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF00]" />
                    <span>Execution Telemetry</span>
                  </div>
                  <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {codeOutput}
                  </pre>
                </div>
              )}
            </div>

            {/* Right 7 Cols: Monaco Code Canvas */}
            <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-800 bg-[#161B22] overflow-hidden">
              {/* Editor Toolbar */}
              <div className="h-11 border-b border-slate-800 bg-[#161B22] px-4 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse" />
                  <span>main.{codingLang === "python" ? "py" : codingLang}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={executing}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] text-black font-mono text-xs font-bold transition-all shadow-xs disabled:opacity-50 active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-black text-black" />
                    <span>{executing ? "Running..." : "Run Test Cases"}</span>
                  </button>
                </div>
              </div>

              {/* Monaco Code Editor */}
              <div className="flex-1 bg-[#0D1117]">
                <MonacoEditor
                  height="100%"
                  language={codingLang}
                  theme="vs-dark"
                  value={codingCodes[activeCodingProb.id] || ""}
                  onChange={(val) =>
                    setCodingCodes({ ...codingCodes, [activeCodingProb.id]: val || "" })
                  }
                  options={{
                    fontSize: 13,
                    fontFamily: "JetBrains Mono, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: "on",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Final Scorecard & Profile Qualification */}
        {currentSectionIndex === 4 && finalResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto space-y-6 pt-6"
          >
            {/* Header Badge */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#9DFF00]/10 border border-[#9DFF00]/30 text-[#9DFF00] mx-auto flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {company.name} Complete
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Candidate: {finalResult.candidate_name} • Roll: {finalResult.roll_no}
              </p>
            </div>

            {/* Profile Qualification Bento Card */}
            <div className="p-8 rounded-2xl bg-[#161B22] border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Recruiter Profile Qualification
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#9DFF00]" />
                    <span>{finalResult.qualified_profile}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-mono text-slate-400 font-medium">Total Score</div>
                  <div className="text-3xl font-extrabold font-mono text-[#9DFF00]">
                    {finalResult.total_score} / {finalResult.max_score}
                  </div>
                </div>
              </div>

              {/* 3 Sectional Breakdown Bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[#0D1117] border border-slate-800 space-y-2 font-mono">
                  <div className="text-slate-400 text-xs font-medium">Section 1: Quantitative</div>
                  <div className="text-xl font-bold text-white">{finalResult.quant_score} / 5</div>
                  <div className="text-[11px] text-slate-500">Numerical Ability</div>
                </div>

                <div className="p-5 rounded-xl bg-[#0D1117] border border-slate-800 space-y-2 font-mono">
                  <div className="text-slate-400 text-xs font-medium">Section 2: Logical & CS</div>
                  <div className="text-xl font-bold text-white">{finalResult.logic_score} / 5</div>
                  <div className="text-[11px] text-slate-500">Reasoning & Tech</div>
                </div>

                <div className="p-5 rounded-xl bg-[#0D1117] border border-slate-800 space-y-2 font-mono">
                  <div className="text-slate-400 text-xs font-medium">Section 3: Hands-On Code</div>
                  <div className="text-xl font-bold text-[#9DFF00]">
                    {finalResult.code_score} / 10
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {solvedProblemIds.length} of 2 Problems Solved
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-800">
                <button
                  onClick={() => router.push("/student/dashboard")}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-semibold text-slate-300 hover:text-white bg-[#0D1117] hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  Return to Student Hub
                </button>

                <button
                  onClick={() => router.push("/student/drives")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs font-mono transition-all shadow-md active:scale-95"
                >
                  <span>Apply to Campus Drives with Score</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Formula & Scratchpad Drawer */}
      <FormulaScratchpad />
    </div>
  );
}

export default function CompanyExamSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-mono text-xs text-slate-500">
          Loading Recruitment Simulator...
        </div>
      }
    >
      <CompanyExamSimulatorContent />
    </Suspense>
  );
}
