"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataService } from "@/lib/supabase/db";
import { CampusDrive, UserProfile } from "@/types";
import { ArrowRight, ArrowUpRight, Calendar, Building2, CheckCircle2 } from "lucide-react";

export default function StudentDrivesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");
  const [appliedDrives, setAppliedDrives] = useState<Set<string>>(new Set());
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const user = await DataService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const apps = await DataService.getDriveApplications();
        const myAppliedDriveIds = new Set(
          apps.filter((a) => a.student_id === user.id).map((a) => a.drive_id)
        );
        setAppliedDrives(myAppliedDriveIds);
      }
    }
    load();
  }, []);

  const drivesList = [
    {
      id: "33333333-0000-0000-0000-000000000001",
      name: "Zoho Corporation",
      role: "Software Developer Intern",
      eligibility: "Eligible: BCA, B.Sc CS, B.Sc IT, MCA",
      date: "Mar 25, 2025",
      status: "ongoing",
      actionText: "Apply Now",
      logoColor: "text-red-600 font-extrabold",
      logoText: "zoho",
    },
    {
      id: "33333333-0000-0000-0000-000000000002",
      name: "TCS - NQT Hiring",
      role: "Entry Level - Multiple Roles",
      eligibility: "Eligible: All Departments",
      date: "Apr 02, 2025",
      status: "upcoming",
      actionText: "Register",
      logoColor: "text-red-700 font-bold",
      logoText: "tcs",
    },
    {
      id: "33333333-0000-0000-0000-000000000003",
      name: "Cognizant GenC",
      role: "Graduate Engineer Trainee",
      eligibility: "Eligible: BCA, B.Sc CS, MCA",
      date: "Apr 10, 2025",
      status: "upcoming",
      actionText: "Register",
      logoColor: "text-blue-700 font-bold",
      logoText: "Cognizant",
    },
  ];

  const filteredDrives = drivesList.filter((d) => {
    if (activeTab === "upcoming") return d.status === "upcoming";
    if (activeTab === "ongoing") return d.status === "ongoing";
    if (activeTab === "completed") return d.status === "completed";
    return true;
  });

  const handleApply = async (driveId: string, companyName: string) => {
    const studentId = currentUser?.id || "a0000000-0000-0000-0000-000000000002";
    await DataService.applyToCampusDrive(driveId, studentId);
    setAppliedDrives((prev) => {
      const next = new Set(prev);
      next.add(driveId);
      return next;
    });
    setApplyMessage(`Successfully registered for ${companyName}!`);
    setTimeout(() => setApplyMessage(null), 3500);
  };

  return (
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header matching Screen 05 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Campus Drives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upcoming and ongoing recruitment drives for your college.
          </p>
        </div>

        {/* Link to Recruitment Simulator (Screen 04) */}
        <Link
          href="/student/simulator"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-black transition-colors bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs"
        >
          <span>Recruitment Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Pills matching Screen 05 */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Drives" },
          { id: "upcoming", label: "Upcoming" },
          { id: "ongoing", label: "Ongoing" },
          { id: "completed", label: "Completed" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                isSelected
                  ? "bg-[#C4F82A] text-black"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toast Notification */}
      {applyMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{applyMessage}</span>
        </div>
      )}

      {/* Main Content Split (65% Drive List / 35% Hero Card) matching Screen 05 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drive List (approx 65% / col-span-7 or 8) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredDrives.map((drive) => {
            const isApplied = appliedDrives.has(drive.id);
            return (
              <div
                key={drive.id}
                className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                {/* Left: Brand Logo & Details */}
                <div className="flex items-center gap-4">
                  {/* Logo Container */}
                  <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className={`text-base ${drive.logoColor}`}>
                      {drive.logoText}
                    </span>
                  </div>

                  {/* Title, Role, Eligibility */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {drive.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {drive.role}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                      {drive.eligibility}
                    </p>
                  </div>
                </div>

                {/* Right: Date & Action CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-[11px] font-mono font-medium text-slate-500 whitespace-nowrap">
                    {drive.date}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleApply(drive.id, drive.name)}
                    disabled={isApplied}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap ${
                      isApplied
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                        : "bg-[#C4F82A] hover:bg-[#B5EA20] text-black active:scale-95"
                    }`}
                  >
                    <span>{isApplied ? "Applied ✓" : `${drive.actionText} →`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Hero Card "Placement Drive 2025" matching Screen 05 */}
        <div className="lg:col-span-4">
          <div className="relative rounded-3xl overflow-hidden bg-[#0F1412] text-white shadow-xl min-h-[380px] flex flex-col justify-end p-7 border border-[#1B241F]">
            {/* Background Graphic with Campus/Building silhouette */}
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80')",
              }}
            />
            {/* Glowing Lime Wave Gradient Overlay matching Screen 05 */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E0C] via-[#0F1412]/80 to-transparent" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#C4F82A]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Content matching Screen 05 */}
            <div className="relative z-10 space-y-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Placement
                  <br />
                  <span className="text-[#C4F82A]">Drive 2025</span>
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-xs">
                  Get hired by top companies on campus.
                </p>
              </div>

              {/* Bottom Lime Green Circular Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/student/resume")}
                  aria-label="View placement credentials"
                  className="w-12 h-12 rounded-full bg-[#C4F82A] hover:bg-[#B5EA20] text-black flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95 group"
                >
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
