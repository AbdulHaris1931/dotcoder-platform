"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, Building2, CheckCircle2 } from "lucide-react";

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
    logoBg: "bg-red-50",
    logoText: "zoho",
    logoColor: "text-red-600 font-extrabold tracking-tight",
  },
  {
    id: "tcs-nqt",
    name: "TCS NQT",
    role: "National Qualifier Test",
    sections: "4 Sections",
    duration: "120 mins",
    category: "Mixed",
    logoBg: "bg-red-50",
    logoText: "tcs",
    logoColor: "text-red-700 font-bold",
  },
  {
    id: "cognizant-genc",
    name: "Cognizant GenC",
    role: "Entry Level Hiring",
    sections: "3 Sections",
    duration: "90 mins",
    category: "Technical",
    logoBg: "bg-blue-50",
    logoText: "Cognizant",
    logoColor: "text-blue-700 font-bold",
  },
  {
    id: "infosys-sp",
    name: "Infosys SP",
    role: "Specialist Programmer",
    sections: "3 Sections",
    duration: "120 mins",
    category: "Technical",
    logoBg: "bg-blue-50",
    logoText: "Infosys",
    logoColor: "text-blue-600 font-bold italic",
  },
  {
    id: "wipro-elite",
    name: "Wipro Elite",
    role: "WILP / Elite Hiring",
    sections: "3 Sections",
    duration: "90 mins",
    category: "Aptitude",
    logoBg: "bg-emerald-50",
    logoText: "wipro",
    logoColor: "text-emerald-700 font-bold",
  },
  {
    id: "hcl-techbee",
    name: "HCL TechBee",
    role: "Entry Level Hiring",
    sections: "3 Sections",
    duration: "90 mins",
    category: "Technical",
    logoBg: "bg-blue-50",
    logoText: "HCL",
    logoColor: "text-blue-800 font-black tracking-wider",
  },
];

export default function SimulatorPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<"All" | "Aptitude" | "Technical" | "Mixed">("All");

  const filteredSimulators = SIMULATORS.filter(
    (sim) => activeCategory === "All" || sim.category === activeCategory
  );

  return (
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header matching Screen 04 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Corporate Recruitment Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Practice real company test patterns and improve your chances.
          </p>
        </div>

        {/* View Campus Drives Shortcut */}
        <Link
          href="/student/drives"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span>View Campus Drives</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Pills matching Screen 04 */}
      <div className="flex flex-wrap items-center gap-2">
        {(["All", "Aptitude", "Technical", "Mixed"] as const).map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                isSelected
                  ? "bg-[#C4F82A] text-black"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-black"
              }`}
            >
              {cat === "All" ? "All Companies" : cat}
            </button>
          );
        })}
      </div>

      {/* 6 Grid Cards matching Screen 04 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSimulators.map((company) => (
          <div
            key={company.id}
            className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
          >
            {/* Top Logo & Company Info */}
            <div className="space-y-4">
              {/* Brand Logo Container */}
              <div className="h-10 flex items-center">
                <span className={`text-xl ${company.logoColor}`}>
                  {company.logoText}
                </span>
              </div>

              {/* Title & Role */}
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {company.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {company.role}
                </p>
              </div>

              {/* Meta Pill: 3 Sections • 90 mins */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  {company.sections} • {company.duration}
                </span>
              </div>
            </div>

            {/* Bottom Lime Green Start Test CTA button matching Screen 04 */}
            <button
              type="button"
              onClick={() => router.push(`/student/exam/assessment-1/simulator`)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C4F82A] hover:bg-[#B5EA20] text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98]"
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
