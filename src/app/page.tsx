"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import {
  ArrowRight,
  Terminal,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Play,
  Users,
  GraduationCap,
  Briefcase,
  Lock,
  Sparkles,
  Activity,
  FileCheck2,
  Menu,
  X,
  ChevronRight,
  Layers,
  Clock,
  Award,
} from "lucide-react";

type RoleTab = "student" | "faculty" | "tpo" | "admin";
type PreviewTab = "code" | "proctor" | "telemetry";

const ROLE_SHOWCASE: Record<
  RoleTab,
  {
    label: string;
    eyebrow: string;
    headline: string;
    summary: string;
    capabilities: string[];
    metrics: Array<{ label: string; value: string }>;
  }
> = {
  student: {
    label: "Students",
    eyebrow: "01 / CANDIDATE WORKSPACE",
    headline: "From syntax drills to MNC technical interview readiness.",
    summary:
      "Students write, debug, and benchmark solutions inside a distraction-free obsidian IDE powered by client-side Python WASM and a Socratic AI coach that guides reasoning without leaking full answers.",
    capabilities: [
      "Zero-latency Pyodide WebAssembly Python execution plus C, C++, and Java sandboxes",
      "10-unit MNC placement tracks calibrated for Zoho, TCS Digital, Infosys, and Cognizant",
      "EQ AI Socratic mentor that detects algorithmic bottlenecks without giving away solutions",
      "Verified 1-page ATS resume with live QR credential hash backed by actual code passes",
    ],
    metrics: [
      { label: "Python Cold-Run", value: "12ms" },
      { label: "Hidden Test Cases", value: "6 / prob" },
      { label: "ATS Credential", value: "QR Verified" },
    ],
  },
  faculty: {
    label: "Faculty & Mentors",
    eyebrow: "02 / ACADEMIC EVALUATION",
    headline: "Synthesize proctored assessments in seconds, grade every line with clarity.",
    summary:
      "Upload syllabus notes or question banks to generate structured MCQ + coding assessments with hidden edge-case suites, assign cohorts, and inspect student submissions side-by-side.",
    capabilities: [
      "AI-assisted assessment composer generating MCQs, starter templates, and hidden test cases",
      "Cross-device cloud publishing so every assigned student receives timed tests instantly",
      "Cohort skill vectors tracking accuracy, efficiency, DSA mastery, and consistency",
      "Direct line-level mentor feedback with remedial topic assignments",
    ],
    metrics: [
      { label: "Exam Authoring", value: "< 30 sec" },
      { label: "Auto-Grading", value: "Instant" },
      { label: "Isolation", value: "Zero-Leak" },
    ],
  },
  tpo: {
    label: "Placement Cell (TPO)",
    eyebrow: "03 / CAMPUS PLACEMENT COMMAND",
    headline: "Real-time readiness visibility across every department and batch.",
    summary:
      "Replace scattered spreadsheets with a unified command center. Filter eligible students by verified readiness score, monitor campus drives, and export NAAC/NBA-ready accreditation audits.",
    capabilities: [
      "Live department readiness matrix across BCA, B.Sc CS, IT, CSE, and MCA cohorts",
      "Campus drive management with eligibility cutoffs and shortlist pipeline tracking",
      "Anti-cheat trust score auditing for every proctored placement benchmark",
      "One-click CSV placement audit export for recruiters and academic boards",
    ],
    metrics: [
      { label: "Campus Concurrency", value: "300+ live" },
      { label: "Audit Exports", value: "1-Click CSV" },
      { label: "Integrity Score", value: "Tracked" },
    ],
  },
  admin: {
    label: "Super Admin",
    eyebrow: "04 / INSTITUTIONAL GOVERNANCE",
    headline: "Sovereign control over accounts, security, and bulk onboarding.",
    summary:
      "Provision an entire 300-student graduating batch from any messy college spreadsheet in under a minute. Enforce role locks, suspend compromised accounts, and inspect append-only audit trails.",
    capabilities: [
      "Gemini AI bulk CSV schema normalizer with automatic duplicate protection",
      "Cryptographically unique temporary password generation with downloadable credential sheets",
      "Server-enforced RBAC backed by PostgreSQL Row Level Security across all 31 tables",
      "Instant global session revocation, account suspension, and clean-slate resets",
    ],
    metrics: [
      { label: "RLS Coverage", value: "31 / 31" },
      { label: "Batch Onboard", value: "500 / upload" },
      { label: "Auth Model", value: "Zero-Trust" },
    ],
  },
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<PreviewTab>("code");
  const [activeRole, setActiveRole] = useState<RoleTab>("student");
  const [runState, setRunState] = useState<"idle" | "running" | "passed">("passed");

  const triggerDemoRun = () => {
    setRunState("running");
    setTimeout(() => setRunState("passed"), 520);
  };

  const roleData = ROLE_SHOWCASE[activeRole];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#070B09] text-[#F4F7F5] font-sans overflow-x-hidden">
      {/* =================================================================== */}
      {/* 1. OBSIDIAN NAVIGATION HEADER (SINGLE PORTAL LOGIN CTA)             */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-50 w-full bg-[#070B09]/85 backdrop-blur-xl border-b border-[#1E2C24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <DotCoderLogo size="md" theme="dark" href="/" />

          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            <a
              href="#architecture"
              className="px-3.5 py-2.5 min-h-[36px] inline-flex items-center rounded-lg text-xs font-semibold text-[#A3B4AA] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors"
            >
              Architecture
            </a>
            <a
              href="#workspaces"
              className="px-3.5 py-2.5 min-h-[36px] inline-flex items-center rounded-lg text-xs font-semibold text-[#A3B4AA] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors"
            >
              Role Portals
            </a>
            <a
              href="#security"
              className="px-3.5 py-2.5 min-h-[36px] inline-flex items-center rounded-lg text-xs font-semibold text-[#A3B4AA] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors"
            >
              Proctoring &amp; Security
            </a>
            <a
              href="#concurrency"
              className="px-3.5 py-2.5 min-h-[36px] inline-flex items-center rounded-lg text-xs font-semibold text-[#A3B4AA] hover:text-[#F4F7F5] hover:bg-[#121B16] transition-colors"
            >
              Campus Scale
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs sm:text-sm font-extrabold shadow-[0_1px_0_0_rgba(255,255,255,0.45)_inset,0_8px_22px_-8px_rgba(157,255,0,0.55)] transition-all active:scale-[0.98]"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-[#A3B4AA] hover:text-white hover:bg-[#121B16] border border-[#1E2C24] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer (Strictly Portal Login Only) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1E2C24] bg-[#0A0F0C] px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#99A9A0] hover:text-white hover:bg-[#121B16]"
            >
              Architecture
            </a>
            <a
              href="#workspaces"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#99A9A0] hover:text-white hover:bg-[#121B16]"
            >
              Role Portals
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[#99A9A0] hover:text-white hover:bg-[#121B16]"
            >
              Proctoring &amp; Security
            </a>
            <div className="pt-3 border-t border-[#1E2C24]">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-sm font-extrabold flex items-center justify-center gap-2 transition-all"
              >
                <span>Portal Login</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =================================================================== */}
      {/* 2. ASYMMETRIC PRECISION HERO (60 / 40 SPLIT)                        */}
      {/* =================================================================== */}
      <section className="relative bg-obsidian-grid bg-obsidian-radial border-b border-[#1E2C24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Editorial Statement (7 cols - immediately visible on SSR for instant LCP) */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0C120F]/90 border border-[#1E2C24] text-[11px] font-mono font-semibold text-[#A3B4AA] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
                <span className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse shrink-0" />
                <span>CAMPUS CODING &amp; PLACEMENT OS</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-[64px] tracking-[-0.04em] leading-[1.03] text-[#F4F7F5]">
                Train engineers.
                <br />
                Verify mastery.
                <br />
                <span className="text-[#9DFF00]">Place entire cohorts.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#A3B4AA] leading-relaxed max-w-[54ch]">
                One institutional platform uniting browser-native coding labs, zero-trust proctored exams, Socratic AI coaching, and live recruiter shortlisting - engineered to hold 300+ lab students simultaneously.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-sm font-extrabold shadow-[0_1px_0_0_rgba(255,255,255,0.45)_inset,0_10px_28px_-10px_rgba(157,255,0,0.55)] transition-all active:scale-[0.98]"
                >
                  <span>Portal Login</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href="#architecture"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] hover:border-[#2C4034] text-[#F4F7F5] text-sm font-semibold transition-all shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]"
                >
                  <span>Inspect Platform Architecture</span>
                  <ChevronRight className="w-4 h-4 text-[#A3B4AA]" />
                </a>
              </div>

              {/* Technical Telemetry Rail */}
              <div className="pt-5 grid grid-cols-3 gap-4 max-w-lg border-t border-[#1E2C24]">
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-[#F4F7F5] tabular-nums">
                    300+
                  </div>
                  <div className="text-xs text-[#85998D] font-medium">
                    Concurrent lab seats
                  </div>
                </div>
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-[#9DFF00] tabular-nums">
                    12ms
                  </div>
                  <div className="text-xs text-[#85998D] font-medium">
                    Pyodide WASM execution
                  </div>
                </div>
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-[#F4F7F5] tabular-nums">
                    100%
                  </div>
                  <div className="text-xs text-[#85998D] font-medium">
                    PostgreSQL RLS enforced
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Live IDE & Proctoring Specimen (5 cols - SSR visible) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0C120F] border border-[#24352B] shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_32px_72px_-20px_rgba(0,0,0,0.95)] overflow-hidden">
                {/* Window Chrome & File Tabs */}
                <div className="px-3.5 sm:px-4 py-2.5 bg-[#0A0F0C] border-b border-[#1E2C24] flex items-center justify-between gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C4034]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C4034]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9DFF00]" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono overflow-x-auto w-full sm:w-auto justify-between sm:justify-end">
                    {(
                      [
                        { id: "code", label: "two_sum.py" },
                        { id: "proctor", label: "proctor.log" },
                        { id: "telemetry", label: "readiness.json" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePreview(tab.id)}
                        className={`px-2.5 py-1.5 min-h-[36px] rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          activePreview === tab.id
                            ? "bg-[#18241D] text-[#9DFF00] border border-[#2C4034] font-semibold"
                            : "text-[#85998D] hover:text-[#F4F7F5]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terminal / Code Viewport */}
                <div className="p-5 font-mono text-xs leading-relaxed min-h-[240px] bg-[#070B09]/80">
                  {activePreview === "code" && (
                    <pre className="text-[#CBD5CE] overflow-x-auto">
                      <code>
                        <span className="text-[#85998D] select-none mr-4">01</span>
                        <span className="text-emerald-400">def</span>{" "}
                        <span className="text-[#9DFF00]">two_sum</span>(nums: list[int], target: int):
                        {"\n"}
                        <span className="text-[#85998D] select-none mr-4">02</span>
                        {"    "}seen: dict[int, int] = {"{}"}
                        {"\n"}
                        <span className="text-[#85998D] select-none mr-4">03</span>
                        {"    "}
                        <span className="text-emerald-400">for</span> idx, val{" "}
                        <span className="text-emerald-400">in</span> enumerate(nums):
                        {"\n"}
                        <span className="text-[#85998D] select-none mr-4">04</span>
                        {"        "}need = target - val
                        {"\n"}
                        <span className="text-[#85998D] select-none mr-4">05</span>
                        {"        "}
                        <span className="text-emerald-400">if</span> need{" "}
                        <span className="text-emerald-400">in</span> seen:
                        {"\n"}
                        <span className="text-[#85998D] select-none mr-4">06</span>
                        {"            "}
                        <span className="text-emerald-400">return</span> [seen[need], idx]
                        {"\n"}
                        <span className="text-[#85998D] select-none mr-4">07</span>
                        {"        "}seen[val] = idx
                        {"\n"}
                        <span className="text-[#85998D] select-none mr-4">08</span>
                        {"    "}
                        <span className="text-emerald-400">return</span> []
                      </code>
                    </pre>
                  )}

                  {activePreview === "proctor" && (
                    <div className="space-y-2.5 text-[11px]">
                      <div className="flex items-center justify-between text-[#A3B4AA] border-b border-[#1E2C24] pb-2">
                        <span>SESSION: PROCTOR-2026-EXAM-04</span>
                        <span className="text-[#9DFF00] font-bold">TRUST 100/100</span>
                      </div>
                      <div className="text-emerald-400">
                        [10:00:01] Fullscreen lock verified (1440x900)
                      </div>
                      <div className="text-[#A3B4AA]">
                        [10:08:14] Auto-save checkpoint written (encrypted key)
                      </div>
                      <div className="text-[#A3B4AA]">
                        [10:14:52] Hidden test cases sanitized server-side (6/6)
                      </div>
                      <div className="text-emerald-400">
                        [10:21:09] Tab switches: 0 &bull; Blur violations: 0
                      </div>
                      <div className="text-[#9DFF00]">
                        [10:21:10] Accreditation Hash Issued: EQLV-2026-VERIFIED
                      </div>
                    </div>
                  )}

                  {activePreview === "telemetry" && (
                    <pre className="text-[#CBD5CE] text-[11px] overflow-x-auto">
                      <code>{`{
  "cohort": "Batch 2026 - Computer Science",
  "readiness_index": 91.4,
  "vectors": {
    "accuracy": 94,
    "dsa_mastery": 89,
    "efficiency": 92,
    "consistency": 90
  },
  "placement_tier": "Tier-1 Product Ready",
  "rls_verified": true
}`}</code>
                    </pre>
                  )}
                </div>

                {/* Live Execution Console Output Strip */}
                <div className="px-5 py-3.5 bg-[#090E0B] border-t border-[#1E2C24] font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-[#85998D]">
                    <span>PYODIDE WASM SANDBOX &bull; WORKER #04</span>
                    <span className="text-emerald-400 font-semibold">O(N) TIME</span>
                  </div>
                  <div className="flex items-center justify-between text-[#CBD5CE]">
                    <span>Hidden suite [6/6]</span>
                    <span className="text-[#9DFF00] tabular-nums">11.4ms &bull; 14.2 MB</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[#121B16] overflow-hidden">
                    <div
                      className={`h-full bg-[#9DFF00] transition-all duration-500 ${
                        runState === "running" ? "w-1/2 animate-pulse" : "w-full"
                      }`}
                    />
                  </div>
                </div>

                {/* Live Execution Footer Bar */}
                <div className="px-4 py-3 bg-[#0A0F0C] border-t border-[#1E2C24] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    {runState === "running" ? (
                      <span className="text-amber-300">Executing Pyodide WASM worker...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9DFF00]" />
                        <span className="text-[#F4F7F5] font-semibold">6 / 6 Passed</span>
                        <span className="text-[#85998D] tabular-nums">&bull; 11.4ms</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerDemoRun}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[36px] rounded-lg bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] hover:border-[#9DFF00]/50 text-[#9DFF00] text-[11px] font-mono font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-[#9DFF00]" />
                    <span>Run Tests</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. ASYMMETRIC ARCHITECTURE STRIPS (NO GENERIC 3-CARD CLICHÉ)        */}
      {/* =================================================================== */}
      <section id="architecture" className="py-20 lg:py-28 border-b border-[#1E2C24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="max-w-2xl space-y-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#9DFF00]">
              Engineered For Real Computer Labs
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-[-0.03em] text-[#F4F7F5]">
              Built to survive 300 students hitting Run at the exact same second.
            </h2>
            <p className="text-sm sm:text-base text-[#99A9A0] leading-relaxed">
              Ordinary coding platforms collapse when an entire college lab shares one Wi-Fi gateway. EQLV CODE offloads Python execution into client WebAssembly and isolates rate limits per verified student identity.
            </p>
          </div>

          {/* Strip 1: 7 / 5 Asymmetric Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 surface-card rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#121B16] border border-[#1E2C24] text-xs font-mono text-[#9DFF00]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>HYBRID EXECUTION ENGINE</span>
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#F4F7F5]">
                  Zero-latency browser Python + multi-language server sandboxes
                </h3>
                <p className="text-sm text-[#A3B4AA] leading-relaxed max-w-[58ch]">
                  Python runs directly inside each student&apos;s browser via an isolated Pyodide WebAssembly worker with a 5-second infinite-loop watchdog. C, C++, and Java route through rate-limited server workers with strict hidden test-case sanitization.
                </p>
              </div>

              {/* Execution Latency Telemetry Comparison */}
              <div className="rounded-xl bg-[#070B09] border border-[#1E2C24] p-4 space-y-2.5 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#F4F7F5] font-semibold">Pyodide Browser WASM (Python 3)</span>
                    <span className="text-[#9DFF00] font-bold tabular-nums">12ms &bull; $0 server load</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#121B16] overflow-hidden">
                    <div className="h-full w-[14%] rounded-full bg-[#9DFF00]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[#85998D]">
                    <span>Isolated Server Sandbox (C / C++ / Java)</span>
                    <span className="tabular-nums">180ms &bull; Per-user rate limit</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#121B16] overflow-hidden">
                    <div className="h-full w-[62%] rounded-full bg-[#2C4034]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#1E2C24] font-mono text-xs">
                {["Python 3 (WASM)", "Java 17", "C++ 20", "C (GCC)"].map((lang) => (
                  <div
                    key={lang}
                    className="px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-center font-semibold"
                  >
                    {lang}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 surface-card rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#121B16] border border-[#1E2C24] text-xs font-mono text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EQ AI SOCRATIC TUTOR</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#F4F7F5]">
                  Teaches reasoning. Refuses to leak solutions.
                </h3>
                <p className="text-sm text-[#A3B4AA] leading-relaxed">
                  Students get instant line-level complexity coaching and edge-case hints without copy-paste cheating.
                </p>
              </div>
              <div className="rounded-xl bg-[#070B09] border border-[#1E2C24] p-4 space-y-2.5 text-xs">
                <div className="text-[#85998D] font-mono">STUDENT &gt; &quot;Give me the full Python answer.&quot;</div>
                <div className="text-[#F4F7F5] leading-relaxed border-l-2 border-[#9DFF00] pl-3">
                  <span className="text-[#9DFF00] font-mono font-bold block mb-1">EQ AI COACH</span>
                  Your current nested loop runs in <span className="font-mono text-[#9DFF00]">O(N²)</span>. What structure lets you check whether <span className="font-mono">target - nums[i]</span> was already visited in <span className="font-mono text-emerald-400">O(1)</span>?
                </div>
              </div>
            </div>
          </div>

          {/* Strip 2: Reversed 5 / 7 Asymmetric Split - Proctoring & Security */}
          <div id="security" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 surface-card rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#121B16] border border-[#1E2C24] text-xs font-mono text-[#9DFF00]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ZERO-TRUST SECURITY</span>
                </div>
                <h3 className="font-display font-bold text-2xl tracking-tight text-[#F4F7F5]">
                  Server-verified RBAC &amp; Row Level Security
                </h3>
                <p className="text-sm text-[#A3B4AA] leading-relaxed">
                  Every API route and database table validates verified JWT sessions against server-controlled roles. Students can never tamper with grades, view hidden tests, or access faculty portals.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#CBD5CE] pt-3 border-t border-[#1E2C24]">
                <li className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#9DFF00] shrink-0" />
                  <span>All 31 PostgreSQL tables guarded by strict RLS policies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Distributed Redis-ready rate limits (3,000 req/min campus NAT)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Cryptographic accreditation hash on every proctored submission</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 surface-card rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#121B16] border border-[#1E2C24] text-xs font-mono text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>PROCTORED EXAM ENGINE</span>
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#F4F7F5]">
                  Live anti-cheat telemetry with automatic disconnection recovery
                </h3>
                <p className="text-sm text-[#A3B4AA] leading-relaxed max-w-[58ch]">
                  Fullscreen enforcement, tab-switch tracking, and continuous trust-score grading run alongside per-user auto-save backups - so even if campus power blinks, no student loses a single line of code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1E2C24]">
                <div className="p-4 rounded-xl bg-[#070B09] border border-[#1E2C24]">
                  <div className="text-[10px] font-mono uppercase text-[#85998D]">Trust Scoring</div>
                  <div className="font-mono text-xl font-bold text-[#9DFF00] mt-1 tabular-nums">0 - 100</div>
                  <div className="text-[11px] text-[#A3B4AA] mt-1">Auto-flags high-risk attempts</div>
                </div>
                <div className="p-4 rounded-xl bg-[#070B09] border border-[#1E2C24]">
                  <div className="text-[10px] font-mono uppercase text-[#85998D]">Auto-Save Cadence</div>
                  <div className="font-mono text-xl font-bold text-[#F4F7F5] mt-1 tabular-nums">600ms</div>
                  <div className="text-[11px] text-[#A3B4AA] mt-1">Isolated per student ID</div>
                </div>
                <div className="p-4 rounded-xl bg-[#070B09] border border-[#1E2C24]">
                  <div className="text-[10px] font-mono uppercase text-[#85998D]">Hidden Test Leaks</div>
                  <div className="font-mono text-xl font-bold text-emerald-400 mt-1 tabular-nums">Zero</div>
                  <div className="text-[11px] text-[#A3B4AA] mt-1">Stripped before HTTP response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. INTERACTIVE STAKEHOLDER PORTAL SHOWCASE                          */}
      {/* =================================================================== */}
      <section id="workspaces" className="py-20 lg:py-28 bg-[#0A0F0C] border-b border-[#1E2C24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#9DFF00]">
                Four Dedicated Enclaves
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-[-0.03em] text-[#F4F7F5]">
                Purpose-built workspaces for every campus stakeholder.
              </h2>
            </div>

            {/* Segmented Role Tabs */}
            <div
              role="tablist"
              aria-label="Platform role workspaces"
              className="inline-flex flex-wrap p-1.5 rounded-2xl bg-[#070B09] border border-[#1E2C24] gap-1"
            >
              {(
                [
                  { id: "student", label: "Student", icon: Terminal },
                  { id: "faculty", label: "Faculty", icon: GraduationCap },
                  { id: "tpo", label: "TPO Cell", icon: Briefcase },
                  { id: "admin", label: "Super Admin", icon: Users },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeRole === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveRole(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-[#9DFF00] text-[#070B09] shadow-xs"
                        : "text-[#A3B4AA] hover:text-[#F4F7F5] hover:bg-[#121B16]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Panel */}
          <div className="rounded-3xl bg-[#0C120F] border border-[#1E2C24] p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-obsidian">
            <div className="lg:col-span-7 space-y-5">
              <div className="text-[11px] font-mono font-bold tracking-widest text-[#9DFF00]">
                {roleData.eyebrow}
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#F4F7F5]">
                {roleData.headline}
              </h3>
              <p className="text-sm text-[#99A9A0] leading-relaxed max-w-[60ch]">
                {roleData.summary}
              </p>
              <ul className="space-y-3 pt-2">
                {roleData.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#DCE4DF]">
                    <CheckCircle2 className="w-4 h-4 text-[#9DFF00] shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {roleData.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="p-4 rounded-2xl bg-[#070B09] border border-[#1E2C24] flex items-center justify-between"
                  >
                    <span className="text-xs font-mono text-[#99A9A0] uppercase tracking-wider">
                      {m.label}
                    </span>
                    <span className="font-display font-bold text-xl text-[#9DFF00] tabular-nums">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/login"
                className="w-full py-3.5 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] hover:border-[#9DFF00]/50 text-[#F4F7F5] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <span>Sign in to {roleData.label} Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#9DFF00]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. CONCURRENCY BENCHMARKS & FINAL CONVERSION BAND                   */}
      {/* =================================================================== */}
      <section id="concurrency" className="py-20 lg:py-24 bg-[#070B09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Layers, value: "49", label: "Compiled App Routes" },
              { icon: Users, value: "300+", label: "Simultaneous Exam Seats" },
              { icon: ShieldCheck, value: "0", label: "Known npm CVEs (Next 15)" },
              { icon: Award, value: "100%", label: "WCAG AA Static Audit" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-3"
                >
                  <Icon className="w-5 h-5 text-[#9DFF00]" />
                  <div className="font-display font-bold text-3xl sm:text-4xl text-[#F4F7F5] tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#99A9A0] font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* High-Contrast Conversion Card */}
          <div className="rounded-3xl bg-[#0C120F] border border-[#2C4034] p-8 sm:p-12 lg:p-14 relative overflow-hidden">
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#9DFF00]/10 blur-[120px] pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#9DFF00]">
                  Institutional Access
                </div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-[-0.03em] text-[#F4F7F5]">
                  Ready to enter your campus workspace?
                </h2>
                <p className="text-sm text-[#99A9A0] leading-relaxed">
                  Accounts are provisioned directly by your institution&apos;s Super Admin enclave. Sign in with your institutional email and password to access your dedicated portal.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-sm font-extrabold shadow-[0_0_32px_-4px_rgba(157,255,0,0.5)] transition-all active:scale-[0.98] shrink-0"
              >
                <span>Portal Login</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. CLEAN ARCHITECTURAL FOOTER (NO LINK FARMS)                       */}
      {/* =================================================================== */}
      <footer className="border-t border-[#1E2C24] bg-[#0A0F0C] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 space-y-3">
            <DotCoderLogo size="md" theme="dark" href="/" />
            <p className="text-xs text-[#85998D] max-w-sm leading-relaxed">
              Enterprise campus coding lab, AI-proctored assessment engine, and placement readiness intelligence built for modern engineering colleges.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F4F7F5]">
              Platform
            </div>
            <ul className="space-y-2 text-xs text-[#99A9A0]">
              <li>
                <a href="#architecture" className="hover:text-[#9DFF00] transition-colors">
                  Execution Engine
                </a>
              </li>
              <li>
                <a href="#workspaces" className="hover:text-[#9DFF00] transition-colors">
                  Role Portals
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#9DFF00] transition-colors">
                  Proctoring &amp; RLS Security
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#9DFF00] transition-colors">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F4F7F5]">
              Governance &amp; Legal
            </div>
            <ul className="space-y-2 text-xs text-[#99A9A0]">
              <li>
                <Link href="/privacy" className="hover:text-[#9DFF00] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#9DFF00] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="hover:text-[#9DFF00] transition-colors">
                  Password Recovery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E2C24]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#85998D]">
            <div>&copy; 2026 EQLV CODE. All rights reserved.</div>
            <div>Obsidian Precision &bull; Enterprise Campus SaaS</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
