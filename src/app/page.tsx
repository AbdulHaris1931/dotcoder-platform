"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import { DemoStore } from "@/lib/demo-store";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Marquee } from "@/components/magicui/marquee";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  Code2,
  Terminal,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Play,
  Users,
  Cpu,
  Layers,
  ChevronDown,
  Building2,
  GraduationCap,
  Award,
  Zap,
  Check,
  Star,
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
  const [activeCodeTab, setActiveCodeTab] = useState<"code" | "ai" | "tests">("code");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const handleLaunchStudent = () => {
    DemoStore.switchRole("student");
    router.push("/student/dashboard");
  };

  const handleLaunchTpo = () => {
    DemoStore.switchRole("tpo");
    router.push("/admin/dashboard");
  };

  const handleSimulateRun = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeOutput("✓ Test 1: longest_streak([1,1,0,1,1,1]) -> 3 [PASSED]\n✓ Test 2: longest_streak([]) -> 0 [PASSED]\n✓ Test 3: longest_streak([1,1,1,1]) -> 4 [PASSED]\nRuntime: 12ms (Client Pyodide WASM)");
    }, 450);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Navbar matching Figma Make */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-8">
            <DotCoderLogo size="md" />

            {/* Nav Menu */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-slate-900 transition-colors">
                <span>Products</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-56 p-2 bg-white rounded-2xl shadow-xl border border-slate-100 hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                  <button onClick={handleLaunchStudent} className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="text-xs font-bold text-slate-900">DotLab Editor</div>
                    <div className="text-[11px] text-slate-500">Client-side WASM IDE</div>
                  </button>
                  <Link href="/student/exam/22222222-0000-0000-0000-000000000001" className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="text-xs font-bold text-slate-900">DotExam Proctor</div>
                    <div className="text-[11px] text-slate-500">Secured placement test</div>
                  </Link>
                  <button onClick={handleLaunchTpo} className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="text-xs font-bold text-slate-900">DotCampus TPO</div>
                    <div className="text-[11px] text-slate-500">Cohort placement analytics</div>
                  </button>
                </div>
              </div>

              <a href="#features" className="hover:text-slate-900 transition-colors">
                Features
              </a>

              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-slate-900 transition-colors">
                <span>Solutions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                <div className="absolute top-full left-0 mt-2 w-52 p-2 bg-white rounded-2xl shadow-xl border border-slate-100 hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                  <div className="p-2 text-xs font-semibold text-slate-800">For Engineering Colleges</div>
                  <div className="p-2 text-xs font-semibold text-slate-800">For Training & Placement (TPO)</div>
                  <div className="p-2 text-xs font-semibold text-slate-800">For Tier-1 Tech Recruiters</div>
                </div>
              </div>

              <a href="#pricing" className="hover:text-slate-900 transition-colors">
                Pricing
              </a>

              <a href="#company" className="hover:text-slate-900 transition-colors">
                Company
              </a>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Start free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        {/* Subtle Background Grid Pattern & Radial Gradients */}
        <GridPattern
          width={40}
          height={40}
          strokeDasharray="2 2"
          className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-40"
        />

        {/* Ambient Top Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          {/* Eyebrow Pill */}
          <BlurFade delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-200/70 text-indigo-700 text-xs font-mono font-bold tracking-widest uppercase shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span>The Intelligent Coding Platform</span>
            </div>
          </BlurFade>

          {/* Headline */}
          <BlurFade delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
              Where coders are{" "}
              <span className="relative inline-block text-[#4F46E5]">
                made, not measured.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#22C55E]/40"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C60 3 180 3 297 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </BlurFade>

          {/* Subtitle */}
          <BlurFade delay={0.15}>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              One adaptive platform to learn, build, and prove real-world coding skills—with an AI mentor that understands every line.
            </p>
          </BlurFade>

          {/* CTAs */}
          <BlurFade delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
              >
                <span>Start learning free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleLaunchStudent}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 text-slate-800 text-sm font-semibold shadow-2xs hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Book a walkthrough</span>
              </button>
            </div>
          </BlurFade>

          {/* Social Proof */}
          <BlurFade delay={0.25}>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500">
              {/* Learner Avatars Stack */}
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  alt="Learner"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                  alt="Learner"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                  alt="Learner"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                  alt="Learner"
                />
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  +40k
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-medium">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-slate-700">Loved by 40,000+ learners</span>
                <span>across 850+ colleges & tech clubs</span>
              </div>
            </div>
          </BlurFade>
        </div>

        {/* Big Code Showcase Window matching Figma Make design */}
        <div className="max-w-6xl mx-auto mt-14 relative">
          <div className="relative rounded-2xl border border-slate-800 bg-[#0B0F19] shadow-2xl overflow-hidden text-white">
            <BorderBeam size={250} duration={12} delay={9} colorFrom="#3B82F6" colorTo="#8B5CF6" />

            {/* Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111728] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                  DotCoder Studio — challenge.py
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("code")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeCodeTab === "code"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  &lt;/&gt; Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab("ai")}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    activeCodeTab === "ai"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Dot AI</span>
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                <span className="hidden sm:inline text-slate-300">Pyodide WASM Ready</span>
              </div>
            </div>

            {/* Window Content: 3-Column Studio Layout */}
            <div className="grid grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[380px]">
              {/* Col 1: Explorer (3 cols) */}
              <div className="col-span-12 lg:col-span-3 bg-[#0C101D] p-4 flex flex-col justify-between text-xs font-mono text-slate-400">
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    INTERVIEW-PREP / ARRAYS
                  </div>
                  <div className="space-y-1.5 pl-2">
                    <div className="text-slate-400">⌄ src</div>
                    <div className="pl-3 space-y-1">
                      <div className="flex items-center gap-2 text-indigo-300 bg-indigo-500/15 px-2 py-1 rounded-lg border border-indigo-500/30 font-medium">
                        <span className="text-indigo-400">#</span>
                        <span>challenge.py</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 px-2 py-1 hover:text-slate-300 cursor-pointer">
                        <span>◇</span>
                        <span>test_streak.py</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 px-2 py-1 hover:text-slate-300 cursor-pointer">
                        <span>▱</span>
                        <span>README.md</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Live Session
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>3 campus peers live</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Code Editor Pane (6 cols) */}
              <div className="col-span-12 lg:col-span-6 bg-[#0B0F19] p-5 font-mono text-xs leading-relaxed flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 pb-2 border-b border-slate-800">
                    <span>src › challenge.py › longest_streak</span>
                    <span className="text-slate-400">Python 3.12</span>
                  </div>

                  <pre className="text-slate-300 overflow-x-auto text-xs leading-6">
                    <code>
                      <span className="text-indigo-400 font-semibold">def</span>{" "}
                      <span className="text-amber-300 font-semibold">longest_streak</span>
                      <span className="text-slate-400">(events: list[int]) -&gt; int:</span>
                      {"\n"}    <span className="text-slate-500 italic"># Return the maximum consecutive days active</span>
                      {"\n"}    streak = best = <span className="text-emerald-400 font-semibold">0</span>
                      {"\n"}    <span className="text-indigo-400 font-semibold">for</span> day{" "}
                      <span className="text-indigo-400 font-semibold">in</span> events:
                      {"\n"}        streak = streak + <span className="text-emerald-400 font-semibold">1</span>{" "}
                      <span className="text-indigo-400 font-semibold">if</span> day{" "}
                      <span className="text-indigo-400 font-semibold">else</span>{" "}
                      <span className="text-emerald-400 font-semibold">0</span>
                      {"\n"}        best = <span className="text-blue-400">max</span>(best, streak)
                      {"\n"}    <span className="text-indigo-400 font-semibold">return</span> best
                    </code>
                  </pre>

                  {codeOutput && (
                    <div className="mt-4 p-3 rounded-xl bg-[#141B2D] border border-emerald-500/30 text-emerald-300 text-[11px] font-mono whitespace-pre-line animate-in fade-in">
                      {codeOutput}
                    </div>
                  )}
                </div>

                {/* Editor Action Buttons */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Ln 8, Col 16</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateRun}
                      disabled={isRunningCode}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 text-emerald-400 fill-current" />
                      <span>{isRunningCode ? "Running WASM..." : "Run (0ms)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLaunchStudent}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Submit Solution</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Col 3: Dot AI Mentor & Diagnostics (3 cols) */}
              <div className="col-span-12 lg:col-span-3 bg-[#0F1424] p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-xs text-white">Dot AI Intelligence</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>

                  {/* Quality Score Card */}
                  <div className="p-3.5 rounded-xl bg-[#141B30] border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Code Quality Score
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-400 font-mono">92</span>
                      <span className="text-xs text-slate-500">/ 100</span>
                      <span className="ml-auto text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Top 5%
                      </span>
                    </div>
                  </div>

                  {/* AI Feedback Points */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-300 space-y-1">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>O(n) Linear Time</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Single pass scan optimal for large campus benchmark tests.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-300 space-y-1">
                      <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>O(1) Auxiliary Space</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Constant auxiliary memory without duplicate allocations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-center">
                  <button
                    onClick={handleLaunchStudent}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Open in Full Sandbox →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hiring Partners Marquee */}
      <section className="py-12 bg-slate-50/70 border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4 mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
            Trusted by placement cells & hiring teams across top recruiters
          </p>
        </div>

        <Marquee pauseOnHover className="[--duration:28s]">
          {HIRING_PARTNERS.map((partner, idx) => (
            <div
              key={idx}
              className="mx-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow cursor-default"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-white text-xs font-bold shadow-xs`}>
                {partner.name[0]}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{partner.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                    {partner.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{partner.role}</div>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Value Pillars (01 to 04 from Figma Make Prototype) */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
            Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Engineered for student outcomes, built for scale.
          </h2>
          <p className="text-base text-slate-600">
            Four integrated pillars connecting practice, evaluation, and campus hiring without clunky disjointed software.
          </p>
        </div>

        {/* 4 Pillars Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 01: Editor */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-indigo-600">01</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Terminal className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Editor</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cloud sandbox with AI that mentors, not solves. Zero cloud billing waste powered by client-side Pyodide WASM.
              </p>
            </div>
            <button
              onClick={handleLaunchStudent}
              className="pt-4 border-t border-slate-100 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Explore DotLab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 02: Learn */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-emerald-600">02</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Learn</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adaptive, project-led pathways. 1,000+ curated problems mapped directly to Tier-1 campus placement patterns.
              </p>
            </div>
            <button
              onClick={handleLaunchStudent}
              className="pt-4 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View Pathways</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 03: Assess */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-amber-600">03</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Assess</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure, skills-first evaluation. Anti-cheating proctoring, dual-screen QR sync, and automated grading reports.
              </p>
            </div>
            <Link
              href="/student/exam/22222222-0000-0000-0000-000000000001"
              className="pt-4 border-t border-slate-100 text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Test Proctoring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 04: Campus */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-purple-600">04</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Campus</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                One unified system for learner outcomes. Placement officers manage drives, export verified ATS resumes, and filter top talent.
              </p>
            </div>
            <button
              onClick={handleLaunchTpo}
              className="pt-4 border-t border-slate-100 text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>TPO Command</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Evaluator Demo Bar */}
      <section className="py-12 bg-indigo-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>INSTANT EVALUATION ENVIRONMENT</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Experience DotCoder Live</h3>
            <p className="text-xs text-indigo-200">
              Switch roles with one click to test candidate coding labs or placement officer analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLaunchStudent}
              className="px-5 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Launch Student Demo</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchTpo}
              className="px-5 py-3 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white font-semibold text-xs transition-all border border-indigo-700 active:scale-95 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Launch TPO Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer matching Figma Make */}
      <footer id="company" className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <DotCoderLogo theme="dark" size="md" />
            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              Where coders are made, not measured. The premier campus placement assessment and self-serve coding sandbox infrastructure.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All Systems Operational • Supabase PostgreSQL 17</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Products</div>
            <ul className="space-y-2">
              <li><button onClick={handleLaunchStudent} className="hover:text-white transition-colors">DotLab Editor</button></li>
              <li><Link href="/student/exam/22222222-0000-0000-0000-000000000001" className="hover:text-white transition-colors">DotExam Proctor</Link></li>
              <li><button onClick={handleLaunchTpo} className="hover:text-white transition-colors">DotCampus TPO</button></li>
              <li><Link href="/student/resume" className="hover:text-white transition-colors">Verified ATS Resume</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Resources</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Placement Question Bank</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Company</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 py-6 text-center text-slate-500 text-xs">
          © 2026 DotCoder, Inc. Crafted for campus engineering excellence.
        </div>
      </footer>
    </div>
  );
}
