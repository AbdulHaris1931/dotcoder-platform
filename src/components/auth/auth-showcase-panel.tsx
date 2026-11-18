"use client";

import React from "react";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";
import { Check, Sparkles, Users, FileCode, Terminal } from "lucide-react";

export function AuthShowcasePanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 bg-[#0B0F19] text-white flex-col justify-between p-12 overflow-hidden border-r border-slate-800/80">
      {/* Background ambient radial glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Logo */}
      <div className="relative z-10 flex items-center justify-between">
        <DotCoderLogo theme="dark" size="md" />
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>v2.6 Enterprise</span>
        </div>
      </div>

      {/* Middle Showcase Content */}
      <div className="relative z-10 space-y-8 my-auto max-w-xl">
        {/* Eyebrow Badge */}
        <div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
            Learn by building
          </span>
        </div>

        {/* Display Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-white leading-[1.12]">
          The editor is where{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            potential becomes proof.
          </span>
        </h2>

        {/* Mock macOS Code Editor Window */}
        <div className="relative rounded-2xl border border-slate-800/90 bg-[#0F1424]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Window Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#141A2E]/80 border-b border-slate-800/80">
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>

            {/* Active Tab */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-t-md bg-[#0F1424] border-t border-x border-slate-700/60 text-xs font-mono text-slate-200">
              <span className="text-indigo-400">&lt;/&gt;</span>
              <span>challenge.py</span>
              <span className="text-slate-500 text-[10px]">✕</span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
              <span className="text-slate-300">Workspace live</span>
            </div>
          </div>

          {/* Window Body: Explorer + Editor */}
          <div className="grid grid-cols-12 min-h-[220px]">
            {/* Mini Explorer Sidebar */}
            <div className="col-span-4 border-r border-slate-800/60 bg-[#0C101D]/70 p-3 flex flex-col justify-between text-[11px] font-mono text-slate-400">
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  ▾ INTERVIEW-PREP
                </div>
                <div className="pl-2 space-y-1.5">
                  <div className="text-slate-400">⌄ src</div>
                  <div className="pl-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-medium">
                      <span>#</span>
                      <span className="truncate">challenge.py</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 px-1.5 py-0.5">
                      <span>◇</span>
                      <span className="truncate">tests.py</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 px-1.5 py-0.5">
                      <span>▱</span>
                      <span className="truncate">README.md</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaborators counter */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-500">
                <Users className="w-3 h-3 text-slate-400" />
                <span>3 collaborators</span>
              </div>
            </div>

            {/* Code Editor Pane */}
            <div className="col-span-8 p-4 font-mono text-xs leading-relaxed bg-[#0F1424]">
              {/* Breadcrumb */}
              <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-1 font-mono">
                <span>src</span>
                <span>›</span>
                <span className="text-slate-400">challenge.py</span>
                <span>›</span>
                <span className="text-indigo-400 font-semibold">longest_streak</span>
              </div>

              {/* Syntax code snippet */}
              <pre className="text-slate-300 overflow-x-auto text-[11px] leading-5">
                <code>
                  <span className="text-indigo-400 font-semibold">def</span>{" "}
                  <span className="text-amber-300 font-semibold">longest_streak</span>
                  <span className="text-slate-400">(events):</span>
                  {"\n"}  <span className="text-slate-500 italic"># Find the longest learning streak</span>
                  {"\n"}  streak = best = <span className="text-emerald-400 font-semibold">0</span>
                  {"\n"}  <span className="text-indigo-400 font-semibold">for</span> day{" "}
                  <span className="text-indigo-400 font-semibold">in</span> events:
                  {"\n"}      streak = streak + <span className="text-emerald-400 font-semibold">1</span>{" "}
                  <span className="text-indigo-400 font-semibold">if</span> day{" "}
                  <span className="text-indigo-400 font-semibold">else</span>{" "}
                  <span className="text-emerald-400 font-semibold">0</span>
                  {"\n"}      best = <span className="text-blue-400">max</span>(best, streak)
                  {"\n"}  <span className="text-indigo-400 font-semibold">return</span> best
                </code>
              </pre>
            </div>
          </div>

          {/* Floating Completion Pill Card (bottom right) */}
          <div className="absolute bottom-3 right-3 bg-white text-slate-900 shadow-xl rounded-xl p-2.5 sm:p-3 border border-slate-100 flex items-center gap-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">Challenge complete!</div>
              <div className="text-[11px] font-semibold text-emerald-600 leading-tight">+120 XP earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-xs text-slate-500 font-mono">
        © 2026 DotCoder, Inc. All rights reserved.
      </div>
    </div>
  );
}
