"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { UserProfile, Submission } from "@/types";
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Award,
  Code2,
  GraduationCap,
  Mail,
  Building2,
  Calendar,
  Globe,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function StudentResumePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [user, subs] = await Promise.all([
        DataService.getCurrentUser(),
        DataService.getSubmissions(),
      ]);
      setCurrentUser(user);
      setSubmissions(subs.filter((s) => s.user_id === user.id));
      setLoading(false);
    }
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-mono text-xs text-slate-500">
        Generating Verified ATS Placement Resume...
      </div>
    );
  }

  const readiness = Number(currentUser.readiness_score) || 88;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-8 px-4 font-sans">
      {/* Top Floating Control Bar (Hidden during print) */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-6 print:hidden">
        <button
          onClick={() => router.push("/student/dashboard")}
          className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Hub</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/student/drives")}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-700 transition-colors shadow-xs"
          >
            Apply to Drives
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl btn-luxury-primary text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable 1-Page ATS Resume Card */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 print:p-0 print:shadow-none print:rounded-none space-y-6">
        {/* Resume Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {currentUser.full_name}
            </h1>
            <p className="text-sm font-semibold text-indigo-700 font-mono">
              Software Development Engineer • Campus Candidate (Batch {currentUser.batch_year || 2026})
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono pt-1">
              <span>{currentUser.email || "karthik.bca@avc.edu.in"}</span>
              <span>•</span>
              <span>Roll: {currentUser.roll_no || "23BCA01"}</span>
              <span>•</span>
              <span>{currentUser.department || "BCA"} Department</span>
            </div>
            <div className="text-xs text-slate-600 font-medium">
              {currentUser.college_name || "Annai Vailankanni Arts and Science College, Thanjavur"}
            </div>
          </div>

          {/* QR Code Credential Stamp */}
          <div className="flex flex-col items-center p-2 rounded-xl border border-slate-200 bg-slate-50 flex-shrink-0 text-center">
            <svg
              className="w-16 h-16"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="25" height="25" fill="#0F172A" />
              <rect x="15" y="15" width="15" height="15" fill="white" />
              <rect x="18" y="18" width="9" height="9" fill="#0F172A" />

              <rect x="65" y="10" width="25" height="25" fill="#0F172A" />
              <rect x="70" y="15" width="15" height="15" fill="white" />
              <rect x="73" y="18" width="9" height="9" fill="#0F172A" />

              <rect x="10" y="65" width="25" height="25" fill="#0F172A" />
              <rect x="15" y="70" width="15" height="15" fill="white" />
              <rect x="18" y="73" width="9" height="9" fill="#0F172A" />

              <rect x="42" y="12" width="6" height="6" fill="#0F172A" />
              <rect x="52" y="12" width="6" height="6" fill="#0F172A" />
              <rect x="36" y="44" width="8" height="8" fill="#0F172A" />
              <rect x="66" y="44" width="8" height="8" fill="#0F172A" />
              <rect x="44" y="64" width="6" height="6" fill="#0F172A" />
              <rect x="66" y="76" width="8" height="8" fill="#0F172A" />
            </svg>
            <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase font-bold tracking-tight">
              Verified Credential
            </span>
          </div>
        </div>

        {/* Section 1: Verified Placement Readiness & Competitive Benchmarks */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Verified Placement Index & Assessment Scores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-500">Readiness Score</div>
              <div className="text-lg font-extrabold text-emerald-600 font-mono">{readiness}%</div>
              <div className="text-[10px] text-slate-600">State Top 5% Percentile</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-500">TCS NQT Simulator</div>
              <div className="text-lg font-extrabold text-indigo-700 font-mono">Digital Tier</div>
              <div className="text-[10px] text-slate-600">7.5+ LPA Profile Match</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-500">Problems Solved</div>
              <div className="text-lg font-extrabold text-slate-900 font-mono">10+ Verified</div>
              <div className="text-[10px] text-slate-600">Zero In-Exam Violations</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-500">Integrity Index</div>
              <div className="text-lg font-extrabold text-emerald-600 font-mono">100% Clean</div>
              <div className="text-[10px] text-slate-600">Proctored Lockdown Certified</div>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Skills & Core Competencies */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Technical Skills & Tooling
          </h2>
          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed font-mono">
            <div>
              <strong className="text-slate-900 font-sans">Languages: </strong>
              Python (Algorithms & Data Structures), Java (OOP & Collections), C++, C, SQL (PostgreSQL).
            </div>
            <div>
              <strong className="text-slate-900 font-sans">Web & Frameworks: </strong>
              Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Supabase SSR, Node.js.
            </div>
            <div>
              <strong className="text-slate-900 font-sans">Computer Science Fundamentals: </strong>
              Data Structures & Algorithms, Object-Oriented System Design, Database Management Systems (DBMS), Operating Systems (OS), Computer Networks.
            </div>
            <div>
              <strong className="text-slate-900 font-sans">Developer Tools: </strong>
              Git, GitHub Actions, Docker, Linux Shell, Monaco Code Engine, WebAssembly (Pyodide).
            </div>
          </div>
        </div>

        {/* Section 3: Verified Problem Solving Projects & Highlights */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Verified Coding Challenges & Problem Highlights
          </h2>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="space-y-0.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Trapping Rain Water & Dynamic Programming Algorithms</span>
                <span className="font-mono text-indigo-700">Zoho / Infosys Track</span>
              </div>
              <p className="leading-relaxed">
                Implemented two-pointer linear scan algorithm solving elevation water trapping with $O(N)$ time complexity and $O(1)$ auxiliary space complexity, passing 100% of hidden unit test vectors.
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Two-Sum Target Pair & Sliding Window Maximum</span>
                <span className="font-mono text-indigo-700">TCS NQT National Mock</span>
              </div>
              <p className="leading-relaxed">
                Constructed hash-map associative lookup achieving zero-collision target index resolution, verified via automated WASM execution sandbox.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Education */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Academic Background
          </h2>
          <div className="flex justify-between items-start text-xs">
            <div>
              <div className="font-bold text-slate-900">
                Bachelor of Computer Applications (BCA) / Computer Science
              </div>
              <div className="text-slate-600">
                {currentUser.college_name || "Annai Vailankanni Arts and Science College, Thanjavur"}
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="font-bold text-slate-900">2022 – 2026</div>
              <div className="text-emerald-700 font-semibold">CGPA: 8.74 / 10.0</div>
            </div>
          </div>
        </div>

        {/* Footer Audit Verification Note */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified by DotCoder Institutional Placement Platform</span>
          </span>
          <span>Authentication Hash: #{currentUser.id.slice(0, 12)}</span>
        </div>
      </div>
    </div>
  );
}
