"use client";

import { useRouter } from "next/navigation";
import { DemoStore } from "@/lib/demo-store";
import {
  Code2,
  Terminal,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  GraduationCap,
  Award,
  Layers,
  Cpu,
  Flame,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleLaunchStudent = () => {
    DemoStore.switchRole("student");
    router.push("/student/dashboard");
  };

  const handleLaunchTpo = () => {
    DemoStore.switchRole("tpo");
    router.push("/tpo/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#09090B] text-slate-100 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        {/* Subtle background grid & ambient indigo glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Amypo DotCoder / DotLab / DotExam Enterprise Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            High-Concurrency Coding Lab & Proctored Campus Assessments
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Architected for engineering colleges and state universities. Features zero-cost client-side Pyodide WASM execution, Monaco IDE, anti-cheat proctored examination rooms, and NAAC/NBA placement audit analytics.
          </p>

          {/* Quick Persona Launch Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunchStudent}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 transition-all group"
            >
              <GraduationCap className="w-4 h-4 text-indigo-200" />
              <span>Launch Student Lab Demo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleLaunchTpo}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141418] hover:bg-[#18181C] text-white font-semibold text-xs border border-white/[0.08] hover:border-white/[0.16] flex items-center justify-center gap-2 transition-all group"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Launch Placement Officer Demo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Verification Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cauvery Institute of Technology
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero .env Setup Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pyodide WASM + Piston API Compilers
            </span>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Modular Placement Architecture
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Three synchronized core modules tailored for college placement departments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* DotLab */}
            <div className="card-obsidian rounded-2xl p-6 space-y-4 hover:border-white/[0.16] transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">1. Split-Screen DotLab</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Full-bleed Monaco IDE with language switcher (Python, Java, C, C++), Pyodide WebAssembly for zero-latency client-side test execution, and whitespace-normalized diff inspection.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleLaunchStudent}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Explore Coding Lab &rarr;
                </button>
              </div>
            </div>

            {/* DotExam */}
            <div className="card-obsidian rounded-2xl p-6 space-y-4 hover:border-white/[0.16] transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2. Proctored DotExam</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Lockdown exam room combining quantitative MCQs and live coding problems with real-time countdown timer, clipboard blocking, and tab-switch telemetry tracking.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push("/student/exam/22222222-0000-0000-0000-000000000001")}
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  Inspect Exam Room &rarr;
                </button>
              </div>
            </div>

            {/* TPO Analytics */}
            <div className="card-obsidian rounded-2xl p-6 space-y-4 hover:border-white/[0.16] transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3. TPO Officer Dashboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Stripe-tier executive KPI cards, department-wise readiness comparison telemetry across 5 engineering branches, and 1-click NAAC/NBA placement CSV report export.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleLaunchTpo}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  View TPO Analytics &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
