"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DemoStore } from "@/lib/demo-store";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Marquee } from "@/components/magicui/marquee";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ShinyButton } from "@/components/magicui/shiny-button";
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
  FileText,
  Clock,
  Compass,
  Zap,
  Lock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const HIRING_PARTNERS = [
  { name: "Zoho Corporation", role: "SDE (₹6.5 - ₹8.5 LPA)", badge: "Product" },
  { name: "Tata Consultancy Services", role: "Digital & Ninja (₹7.5 LPA)", badge: "Tier-1" },
  { name: "Cognizant GenC", role: "GenC Next (₹6.75 LPA)", badge: "Core Tech" },
  { name: "Infosys Specialty", role: "Specialist Programmer (₹9.5 LPA)", badge: "R&D" },
  { name: "Amazon AWS", role: "Cloud Support / SDE", badge: "MNC" },
  { name: "Microsoft", role: "Software Engineer", badge: "Cloud" },
  { name: "LTIMindtree", role: "Digital Specialist (₹6.5 LPA)", badge: "Enterprise" },
];

export default function HomePage() {
  const router = useRouter();

  const handleLaunchStudent = () => {
    DemoStore.switchRole("student");
    router.push("/student/dashboard");
  };

  const handleLaunchTpo = () => {
    DemoStore.switchRole("tpo");
    router.push("/admin/drives");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#08080A] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Ambient Beacon */}
      <div className="relative border-b border-white/[0.08] bg-obsidian-950/80 backdrop-blur-md px-4 py-2 text-center text-xs text-zinc-400">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-zinc-300">
              DotCoder Enterprise 2.0 • Online & Scaled on Supabase PostgreSQL 17
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-300 border border-white/[0.1]">⌘K</kbd> for Command Palette</span>
            <span className="text-zinc-600">|</span>
            <span className="text-indigo-400">0ms Client Pyodide WASM Engine</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        {/* Magic UI Grid Pattern & Ambient Glow */}
        <GridPattern
          width={40}
          height={40}
          strokeDasharray="2 2"
          className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-40"
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/[0.08] rounded-full blur-[160px] pointer-events-none" />

        <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6">
          <BlurFade delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-zinc-300 text-xs font-mono backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Placement Assessment & Coding Lab Infrastructure</span>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
              Engineered for Campus Placements.{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-300 bg-clip-text text-transparent">
                Zero Cloud Waste.
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.15}>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans">
              Run simultaneous 2,000-candidate coding assessments with zero server lag using client-side Pyodide WebAssembly, TCS NQT & Zoho multi-section timed simulators, and 1-click candidate pipelines.
            </p>
          </BlurFade>

          {/* Persona Launch CTAs */}
          <BlurFade delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <ShinyButton onClick={handleLaunchStudent} className="w-full sm:w-auto">
                <GraduationCap className="w-4 h-4 text-indigo-100" />
                <span>Launch Student Assessment Hub</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </ShinyButton>

              <button
                onClick={handleLaunchTpo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-zinc-200 font-semibold text-xs border border-white/[0.1] hover:border-white/[0.2] flex items-center justify-center gap-2.5 transition-all shadow-card group"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>TPO Recruitment Manager</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </BlurFade>

          {/* Verification Badges */}
          <BlurFade delay={0.25}>
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PostgreSQL 17 via Supabase
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> $0 Runtime Execution
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> TCS / Zoho Test Patterns
              </span>
            </div>
          </BlurFade>
        </div>

        {/* Live Platform Visual Teaser with Border Beam */}
        <div className="container mx-auto max-w-5xl mt-16 relative">
          <BlurFade delay={0.3}>
            <div className="relative rounded-2xl border border-white/[0.1] bg-obsidian-900/90 shadow-card-elevated backdrop-blur-xl overflow-hidden">
              <BorderBeam size={250} duration={12} delay={9} colorFrom="#6366f1" colorTo="#a855f7" />
              
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-obsidian-950/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-zinc-400">dotcoder-simulator: TCS NQT Full-Pattern Simulation</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">Sec 3: Coding (24:18 left)</span>
                </div>
              </div>

              {/* Mock Multi-Section Interface Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
                {/* Left: Section Navigator */}
                <div className="md:col-span-4 p-5 space-y-4 bg-obsidian-950/40">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Simulated Test</div>
                    <div className="text-sm font-semibold text-zinc-200">TCS National Qualifier Test 2025</div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <span className="font-medium text-emerald-300">1. Quantitative Aptitude</span>
                      <span className="font-mono text-[11px] text-emerald-400">Completed (18/20)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <span className="font-medium text-emerald-300">2. Logical Reasoning</span>
                      <span className="font-mono text-[11px] text-emerald-400">Completed (19/20)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs shadow-glow">
                      <span className="font-semibold text-indigo-200 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> 3. Monaco Hands-on Coding
                      </span>
                      <span className="font-mono text-[11px] text-indigo-300">In Progress</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400 font-mono text-[11px]">
                      <span>Cutoff Benchmark:</span>
                      <span className="text-indigo-400 font-semibold">TCS Digital (₹7.5 LPA)</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: "86%" }} />
                    </div>
                  </div>
                </div>

                {/* Right: Code Editor Mock */}
                <div className="md:col-span-8 p-5 bg-[#0A0A0E] flex flex-col justify-between font-mono text-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-zinc-400 border-b border-white/[0.06] pb-2 text-[11px]">
                      <span className="text-zinc-300 font-semibold">solution.py — Pyodide WASM (0ms Sandbox)</span>
                      <span className="text-emerald-400 font-mono">● All 6/6 Hidden Test Cases Passed</span>
                    </div>

                    <pre className="text-zinc-300 leading-relaxed overflow-x-auto text-[12px]">
                      <code>{`def longest_palindromic_subsequence(s: str) -> int:
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`}</code>
                    </pre>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Memory: <strong className="text-zinc-200">14.2 MB</strong></span>
                    <span>Execution: <strong className="text-emerald-400">18ms (Zero Cloud Bill)</strong></span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">100 / 100 Score</span>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Hiring Partners Marquee */}
      <section className="py-12 border-b border-white/[0.08] bg-obsidian-950/60 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 mb-6 text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Simulating Drive Formats for Premier Campus Recruiters
          </p>
        </div>
        <Marquee pauseOnHover className="[--duration:35s]">
          {HIRING_PARTNERS.map((partner, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <div className="text-left">
                <div className="text-xs font-semibold text-zinc-200">{partner.name}</div>
                <div className="text-[10px] font-mono text-zinc-500">{partner.role}</div>
              </div>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                {partner.badge}
              </span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Bento Grid Architecture */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#08080A]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
              <Layers className="w-3.5 h-3.5" /> High-Performance Enterprise Grid
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Crafted for Institutional Reliability
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto font-sans">
              Every system is decoupled for high availability, zero server crashes, and complete NAAC compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tile 1: Multi-Section Placement Simulator (Span 2) */}
            <div className="md:col-span-2 rounded-2xl p-6 bg-obsidian-900 border border-white/[0.08] hover:border-white/[0.16] transition-all card-interactive flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300">TCS NQT & Zoho Tested</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Company Placement Simulator</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Locked sectional timers prevent jumping ahead, replicating authentic corporate test conditions with Aptitude MCQs (+1 / -0.25 negative marking), in-exam Formula Scratchpad, and automated Digital vs. Ninja cutoffs.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  href="/student/exam/mock-nqt-2025/simulator"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
                >
                  <span>Experience Placement Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-mono text-zinc-500">3 Sections • 60 Mins</span>
              </div>
            </div>

            {/* Tile 2: Lateral QR Mobile Proctoring */}
            <div className="rounded-2xl p-6 bg-obsidian-900 border border-white/[0.08] hover:border-white/[0.16] transition-all card-interactive flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">Anti-Cheat Engine</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Dual-Camera Phone Sync</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Zero-install WebRTC companion syncs any smartphone via dynamic QR code to monitor keyboard, desk, and room boundaries simultaneously.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  href="/student/exam/mock-nqt-2025/companion"
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
                >
                  <span>Preview Companion Mode</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-mono text-zinc-500">WebRTC Peer</span>
              </div>
            </div>

            {/* Tile 3: ATS Placement Resume */}
            <div className="rounded-2xl p-6 bg-obsidian-900 border border-white/[0.08] hover:border-white/[0.16] transition-all card-interactive flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">QR Verifiable</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">ATS Placement Resume</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    One-page recruiter-ready resume automatically embedded with verified DotCoder skill percentiles, problem highlights, and verification stamps.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  href="/student/resume"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
                >
                  <span>View Student Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-mono text-zinc-500">Print Ready</span>
              </div>
            </div>

            {/* Tile 4: Superset-Killer Campus Placement Drives (Span 2) */}
            <div className="md:col-span-2 rounded-2xl p-6 bg-obsidian-900 border border-white/[0.08] hover:border-white/[0.16] transition-all card-interactive flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">TPO Kanban</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Campus Drives & 1-Click Apply</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Replaces clunky placement tools. Students match eligibility (CGPA, backlogs, branch) and apply in 1-click. TPOs monitor candidate progression through Shortlist $\rightarrow$ Technical $\rightarrow$ Offer stages with 1-click HR CSV exports.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/student/drives"
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
                  >
                    <span>Student Drive Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/admin/drives"
                    className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                  >
                    <span>TPO Pipeline Manager</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">Live PostgreSQL Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Impact Metric Rail */}
      <section className="py-16 border-t border-b border-white/[0.08] bg-obsidian-950/80">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">0 ms</div>
            <div className="text-xs text-zinc-400 mt-1">Python WASM Cloud Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono tabular-nums">100%</div>
            <div className="text-xs text-zinc-400 mt-1">Free Tier Compatible ($0)</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">94.8%</div>
            <div className="text-xs text-zinc-400 mt-1">TCS Digital / Ninja Clearance</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">1-Click</div>
            <div className="text-xs text-zinc-400 mt-1">Recruiter HR Export</div>
          </div>
        </div>
      </section>

      {/* World-Class Obsidian Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#08080A] text-zinc-400 text-xs">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs">
              D
            </div>
            <span className="font-semibold text-zinc-200">DotCoder Enterprise Platform</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">Developed for University Placements & Labs</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/student/dashboard" className="hover:text-zinc-200 transition-colors">Student Hub</Link>
            <Link href="/admin/drives" className="hover:text-zinc-200 transition-colors">TPO Pipeline</Link>
            <Link href="/student/exam/mock-nqt-2025/simulator" className="hover:text-zinc-200 transition-colors">TCS Simulator</Link>
            <Link href="/student/resume" className="hover:text-zinc-200 transition-colors">ATS Resume</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
