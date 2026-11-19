"use client";

import React from "react";
import { DotCoderLogo } from "@/components/shared/dotcoder-logo";

export function AuthShowcasePanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 bg-[#0F1412] text-white flex-col justify-between p-14 overflow-hidden border-r border-[#1B241F]">
      {/* Background ambient lime glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#C4F82A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C4F82A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10">
        <DotCoderLogo theme="dark" size="md" />
      </div>

      {/* Middle Bold Headline matching Screen 10 */}
      <div className="relative z-10 my-auto space-y-6 max-w-lg">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.08]">
            Code<br />
            Learn<br />
            Assess<br />
            <span className="text-[#C4F82A]">Get Hired.</span>
          </h1>
        </div>
        <p className="text-sm sm:text-base text-slate-400 font-medium max-w-md">
          A complete placement preparation platform for colleges.
        </p>
      </div>

      {/* Bottom Fluid Wave Illustration Accent */}
      <div className="relative z-10 w-full h-24 overflow-hidden -mb-6">
        <svg
          viewBox="0 0 500 120"
          preserveAspectRatio="none"
          className="w-full h-full opacity-40 text-[#C4F82A]"
        >
          <path
            d="M0,40 C150,120 300,0 500,60 L500,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
