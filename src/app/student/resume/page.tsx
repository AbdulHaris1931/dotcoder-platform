"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataService } from "@/lib/supabase/db";
import { UserProfile } from "@/types";
import {
  Download,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  QrCode,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function StudentResumePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function load() {
      const user = await DataService.getCurrentUser();
      setCurrentUser(user);
    }
    load();
  }, []);

  const handleDownload = () => {
    window.print();
  };

  const name = currentUser?.full_name || "Karthik S.";
  const department = currentUser?.department || "BCA";
  const college = currentUser?.college_name || "Annai Vailankanni Arts and Science College, Thanjavur";
  const email = currentUser?.email || "karthik.bca@avc.edu.in";
  const readiness = currentUser?.readiness_score ? Math.round(currentUser.readiness_score) : 78;

  return (
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header matching Screen 06 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Placement Resume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A verified, ATS-friendly resume with your EQLV CODE credentials.
          </p>
        </div>

        {/* Lime Green Download PDF CTA button matching Screen 06 */}
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs transition-all shadow-xs active:scale-[0.98]"
        >
          <Download className="w-4 h-4 text-black" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Main White Resume Document Card matching Screen 06 */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Top Header Row: Avatar, Student Info, QR Code, Verified Credential Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Left: Avatar & Candidate Info */}
          <div className="flex items-center gap-5">
            {/* Student Avatar Photo */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name, Title, Contact */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {name}
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                {department} Student
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-sans">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91 98765 43210</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thanjavur, TN</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: QR Code & Verified Credential Box linking to /verify/[credentialId] */}
          <div className="flex items-center gap-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Clickable QR Code Container */}
            <a
              href="/verify/AVASC-2026-BCA-23BCA01-92-A1K7"
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0 hover:border-slate-400 hover:shadow-xs transition-all group"
              title="Click to open verification portal"
            >
              <QrCode className="w-14 h-14 text-slate-800 group-hover:text-black transition-colors" />
            </a>

            {/* Verified Credential Text */}
            <div className="space-y-1 max-w-[210px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                <span>Verified Credential</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Authenticity cryptographically verified by EQLV CODE.
              </p>
              <a
                href="/verify/AVASC-2026-BCA-23BCA01-92-A1K7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-800 hover:text-black hover:underline font-mono"
              >
                <span>AVASC-2026-BCA-92-A1K7</span>
                <span className="text-[#84cc16]">&bull; Verify &rarr;</span>
              </a>
            </div>
          </div>
        </div>

        {/* Middle Body Grid: Left Information (Education, Skills, Achievements) & Right Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns */}
          <div className="lg:col-span-8 space-y-7">
            {/* Education Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Education
              </h3>
              <div className="text-sm font-semibold text-slate-800">
                {department} — {college} <span className="text-xs font-normal text-slate-500 font-mono">(2023 - 2026)</span>
              </div>
            </div>

            {/* Technical Skills Section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Python", "Java", "C++", "SQL", "DSA", "Web Dev"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-medium shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Achievements
              </h3>
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Solved 500+ coding problems on EQLV CODE</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Completed Data Structures & Algorithms (80%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Placement Readiness Radial Gauge matching Screen 06 */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/60 rounded-3xl border border-slate-100 space-y-4">
            <span className="text-xs font-bold text-slate-700 font-sans">
              Placement Readiness
            </span>

            {/* Circular Gauge Graphic matching Screen 06 */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#9DFF00"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - readiness / 100)}
                  strokeLinecap="round"
                />
              </svg>

              {/* Inside Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {readiness}%
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
