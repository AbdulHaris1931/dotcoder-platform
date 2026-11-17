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
  { name: "Zoho Corporation", role: "SDE (₹6.5 - ₹8.5 LPA)", badge: "Product", color: "from-blue-500 to-indigo-600" },
  { name: "Tata Consultancy Services", role: "Digital & Ninja (₹7.5 LPA)", badge: "Tier-1", color: "from-indigo-500 to-purple-600" },
  { name: "Cognizant GenC", role: "GenC Next (₹6.75 LPA)", badge: "Core Tech", color: "from-sky-500 to-blue-600" },
  { name: "Infosys Specialty", role: "Specialist Programmer (₹9.5 LPA)", badge: "R&D", color: "from-purple-500 to-pink-600" },
  { name: "Amazon AWS", role: "Cloud Support / SDE", badge: "MNC", color: "from-amber-500 to-orange-600" },
  { name: "Microsoft", role: "Software Engineer", badge: "Cloud", color: "from-cyan-500 to-blue-600" },
  { name: "LTIMindtree", role: "Digital Specialist (₹6.5 LPA)", badge: "Enterprise", color: "from-emerald-500 to-teal-600" },
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
    <div className="flex-1 flex flex-col bg-stripe-mesh text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Ambient Announcement Beacon */}
      <div className="relative border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 py-2.5 text-center text-xs text-slate-600">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">
              DotCoder Enterprise 2.0 • Scaled on Supabase PostgreSQL 17
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-500">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">⌘K</kbd> for Command Palette</span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-600 font-semibold">0ms Client Pyodide WASM Sandbox</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        {/* Subtle Luxury Dot Grid */}
        <GridPattern
          width={40}
          height={40}
          strokeDasharray="2 2"
          className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-60"
        />

        <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6">
          <BlurFade delay={0.05}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-pill border border-slate-200/80 text-slate-700 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Campus Placement Assessment & Coding Lab Infrastructure</span>
            </div>
          </BlurFade>

          <BlurFade delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.08]">
              Engineered for Placements.{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Zero Cloud Waste.
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.15}>
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
              Conduct high-concurrency coding labs and proctored campus recruitment drives at $0 server cost with client-side Pyodide WASM, authentic TCS NQT simulators, and 1-click candidate pipelines.
            </p>
          </BlurFade>

          {/* Persona Launch CTAs */}
          <BlurFade delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <ShinyButton onClick={handleLaunchStudent} className="w-full sm:w-auto">
                <GraduationCap className="w-4 h-4 text-white" />
                <span>Launch Student Assessment Hub</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </ShinyButton>

              <button
                onClick={handleLaunchTpo}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200/90 hover:border-slate-300 flex items-center justify-center gap-2.5 transition-all shadow-luxury group"
              >
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>TPO Recruitment Manager</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </BlurFade>

          {/* Verification Badges */}
          <BlurFade delay={0.25}>
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> PostgreSQL 17 via Supabase
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> $0 Runtime Execution
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> TCS / Zoho Test Patterns
              </span>
            </div>
          </BlurFade>
        </div>

        {/* Live Platform Showcase Preview Window */}
        <div className="container mx-auto max-w-5xl mt-16 relative">
          <BlurFade delay={0.3}>
            <div className="relative rounded-3xl border border-slate-200/90 bg-white shadow-luxury overflow-hidden">
              <BorderBeam size={280} duration={14} colorFrom="#4F46E5" colorTo="#A855F7" />

              {/* Window Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono font-medium text-slate-600">
                    dotcoder-simulator: TCS National Qualifier Test 2025
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Sec 3: Coding (24:18 left)</span>
                </div>
              </div>

              {/* Multi-Section Interface Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {/* Left: Section Navigator */}
                <div className="md:col-span-4 p-6 space-y-4 bg-slate-50/40">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Simulated Test</div>
                    <div className="text-sm font-bold text-slate-900">TCS National Qualifier Test</div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs shadow-xs">
                      <span className="font-semibold text-emerald-800">1. Quantitative Aptitude</span>
                      <span className="font-mono text-[11px] text-emerald-700 font-bold">Passed (18/20)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs shadow-xs">
                      <span className="font-semibold text-emerald-800">2. Logical Reasoning</span>
                      <span className="font-mono text-[11px] text-emerald-700 font-bold">Passed (19/20)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs shadow-sm">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> 3. Hands-on Coding
                      </span>
                      <span className="font-mono text-[11px] text-indigo-700 font-bold">In Progress</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 font-mono text-[11px]">
                      <span>Cutoff Benchmark:</span>
                      <span className="text-indigo-600 font-bold">TCS Digital (₹7.5 LPA)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-2 rounded-full" style={{ width: "86%" }} />
                    </div>
                  </div>
                </div>

                {/* Right: Modern Dark Syntax Workspace */}
                <div className="md:col-span-8 p-6 bg-[#0F172A] flex flex-col justify-between font-mono text-xs text-slate-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2.5 text-[11px]">
                      <span className="text-slate-200 font-semibold">solution.py — Pyodide WASM (0ms Sandbox)</span>
                      <span className="text-emerald-400 font-mono font-bold">● All 6/6 Hidden Test Cases Passed</span>
                    </div>

                    <pre className="text-indigo-200 leading-relaxed overflow-x-auto text-[12px] font-mono">
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

                  <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Memory: <strong className="text-white">14.2 MB</strong></span>
                    <span>Execution: <strong className="text-emerald-400 font-bold">18ms (Zero Cloud Bill)</strong></span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">100 / 100 Score</span>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Hiring Partners Marquee */}
      <section className="py-14 border-b border-slate-200/80 bg-white/60 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 mb-6 text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Simulating Drive Formats for Premier Campus Recruiters
          </p>
        </div>
        <Marquee pauseOnHover className="[--duration:35s]">
          {HIRING_PARTNERS.map((partner, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 px-6 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${partner.color}`} />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">{partner.name}</div>
                <div className="text-[11px] font-mono text-slate-500">{partner.role}</div>
              </div>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {partner.badge}
              </span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Bento Grid Architecture */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" /> High-Performance Enterprise Grid
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Crafted for Institutional Reliability
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto font-sans">
              Every system is decoupled for high availability, zero server crashes, and complete NAAC compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tile 1: Multi-Section Placement Simulator (Span 2) */}
            <div className="md:col-span-2 rounded-3xl p-7 bg-white border border-slate-200/80 shadow-luxury hover:shadow-luxury-hover transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">TCS NQT & Zoho Pattern</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Company Placement Simulator</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Locked sectional timers replicate corporate test conditions with Aptitude MCQs (+1 / -0.25 negative marking), in-exam Formula Scratchpad, and automated Digital vs. Ninja cutoffs.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/student/exam/mock-nqt-2025/simulator"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
                >
                  <span>Experience Placement Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-mono text-slate-500 font-medium">3 Sections • 60 Mins</span>
              </div>
            </div>

            {/* Tile 2: Lateral QR Mobile Proctoring */}
            <div className="rounded-3xl p-7 bg-white border border-slate-200/80 shadow-luxury hover:shadow-luxury-hover transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200/80">Anti-Cheat Engine</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Dual-Camera Phone Sync</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Zero-install WebRTC companion syncs any smartphone via dynamic QR code to monitor keyboard, desk, and room boundaries simultaneously.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/student/exam/mock-nqt-2025/companion"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
                >
                  <span>Preview Companion Mode</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-mono text-slate-500 font-medium">WebRTC Peer</span>
              </div>
            </div>

            {/* Tile 3: ATS Placement Resume */}
            <div className="rounded-3xl p-7 bg-white border border-slate-200/80 shadow-luxury hover:shadow-luxury-hover transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80">QR Verifiable</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">ATS Placement Resume</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    One-page recruiter-ready resume automatically embedded with verified DotCoder skill percentiles, problem highlights, and verification stamps.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/student/resume"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                >
                  <span>View Student Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] font-mono text-slate-500 font-medium">Print Ready</span>
              </div>
            </div>

            {/* Tile 4: Campus Placement Drives (Span 2) */}
            <div className="md:col-span-2 rounded-3xl p-7 bg-white border border-slate-200/80 shadow-luxury hover:shadow-luxury-hover transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200/80">TPO Kanban</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Campus Drives & 1-Click Apply</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Replaces clunky placement tools. Students match eligibility (CGPA, backlogs, branch) and apply in 1-click. TPOs monitor candidate progression with 1-click HR CSV exports.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/student/drives"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
                  >
                    <span>Student Drive Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/admin/drives"
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>TPO Pipeline Manager</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-medium">PostgreSQL 17 Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Impact Metric Rail */}
      <section className="py-16 border-t border-b border-slate-200/80 bg-white">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">0 ms</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Python WASM Cloud Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 font-mono tabular-nums">100%</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Free Tier Compatible ($0)</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tabular-nums">94.8%</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">TCS Digital / Ninja Clearance</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">1-Click</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Recruiter HR Export</div>
          </div>
        </div>
      </section>

      {/* Luxury Clean White Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80 text-slate-500 text-xs">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm">
              D
            </div>
            <span className="font-bold text-slate-900">DotCoder Enterprise Platform</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Developed for University Placements & Labs</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-600">
            <Link href="/student/dashboard" className="hover:text-indigo-600 transition-colors">Student Hub</Link>
            <Link href="/admin/drives" className="hover:text-indigo-600 transition-colors">TPO Pipeline</Link>
            <Link href="/student/exam/mock-nqt-2025/simulator" className="hover:text-indigo-600 transition-colors">TCS Simulator</Link>
            <Link href="/student/resume" className="hover:text-indigo-600 transition-colors">ATS Resume</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
