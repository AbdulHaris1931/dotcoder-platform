"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

interface CompanySimulator {
  id: string;
  name: string;
  role: string;
  sections: string;
  duration: string;
  category: "Aptitude" | "Technical" | "Mixed";
  logoBg: string;
  logoText: string;
  logoColor: string;
}

const SIMULATORS: CompanySimulator[] = [
  {
    id: "zoho",
    name: "Zoho Corporation",
    role: "Technical + Aptitude",
    sections: "3 Sections",
    duration: "90 mins",
    category: "Mixed",
    logoBg: "bg-rose-500/10 border-rose-500/25",
    logoText: "zoho",
    logoColor: "text-rose-400 font-extrabold tracking-tight",
  },
  {
    id: "tcs-nqt",
    name: "TCS NQT",
    role: "National Qualifier Test",
    sections: "4 Sections",
    duration: "120 mins",
    category: "Mixed",
    logoBg: "bg-rose-500/10 border-rose-500/25",
    logoText: "tcs",
    logoColor: "text-rose-300 font-bold",
  },
  {
    id: "cognizant-genc",
    name: "Cognizant GenC",
    role: "Entry Level Hiring",
    sections: "3 Sections",
    duration: "90 mins",
    category: "Technical",
    logoBg: "bg-sky-500/10 border-sky-500/25",
    logoText: "Cognizant",
    logoColor: "text-sky-300 font-bold",
  },
  {
    id: "infosys-sp",
    name: "Infosys SP",
    role: "Specialist Programmer",
    sections: "3 Sections",
    duration: "120 mins",
    category: "Technical",
    logoBg: "bg-sky-500/10 border-sky-500/25",
    logoText: "Infosys",
    logoColor: "text-sky-400 font-bold italic",
  },
  {
    id: "wipro-elite",
    name: "Wipro Elite",
    role: "WILP / Elite Hiring",
    sections: "3 Sections",
    duration: "90 mins",
    category: "Aptitude",
    logoBg: "bg-emerald-500/10 border-emerald-500/25",
    logoText: "wipro",
    logoColor: "text-emerald-400 font-bold",
  },
  {
    id: "hcl-techbee",
    name: "HCL TechBee",
    role: "Entry Level Hiring",
    sections: "3 Sections",
    duration: "90 mins",
    category: "Technical",
    logoBg: "bg-cyan-500/10 border-cyan-500/25",
    logoText: "HCL",
    logoColor: "text-cyan-300 font-black tracking-wider",
  },
];

export default function SimulatorPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<"All" | "Aptitude" | "Technical" | "Mixed">("All");

  const filteredSimulators = SIMULATORS.filter(
    (sim) => activeCategory === "All" || sim.category === activeCategory
  );

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5]">
            Corporate Recruitment Simulator
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Practice real company test patterns and improve your chances.
          </p>
        </div>

        {/* View Campus Drives Shortcut */}
        <Link
          href="/student/drives"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9DFF00] hover:underline transition-colors"
        >
          <span>View Campus Drives</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {(["All", "Aptitude", "Technical", "Mixed"] as const).map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#9DFF00] text-[#070B09]"
                  : "bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034] hover:text-[#F4F7F5]"
              }`}
            >
              {cat === "All" ? "All Companies" : cat}
            </button>
          );
        })}
      </div>

      {/* 6 Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSimulators.map((company) => (
          <div
            key={company.id}
            className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] hover:border-[#2C4034] p-6 flex flex-col justify-between space-y-6 transition-colors"
          >
            {/* Top Logo & Company Info */}
            <div className="space-y-4">
              {/* Brand Logo Container */}
              <div className={`inline-flex items-center px-3 py-1.5 rounded-xl border ${company.logoBg}`}>
                <span className={`text-xl font-display ${company.logoColor}`}>
                  {company.logoText}
                </span>
              </div>

              {/* Title & Role */}
              <div>
                <h3 className="font-display text-base font-bold text-[#F4F7F5]">
                  {company.name}
                </h3>
                <p className="text-xs text-[#99A9A0] mt-0.5">
                  {company.role}
                </p>
              </div>

              {/* Meta Pill: 3 Sections • 90 mins */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#D5E0D9] bg-[#121B16] px-2.5 py-1 rounded-md border border-[#1E2C24] tabular-nums">
                <Clock className="w-3 h-3 text-[#9DFF00]" />
                <span>
                  {company.sections} &bull; {company.duration}
                </span>
              </div>
            </div>

            {/* Bottom Lime Green Start Test CTA button */}
            <button
              type="button"
              onClick={() => router.push(`/student/exam/assessment-1/simulator?company=${company.id}`)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>Start Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
