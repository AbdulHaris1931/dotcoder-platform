"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataService } from "@/lib/supabase/db";
import { CampusDrive, UserProfile } from "@/types";
import { ArrowRight, Building2, CheckCircle2, MapPin } from "lucide-react";

export default function StudentDrivesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");
  const [appliedDrives, setAppliedDrives] = useState<Set<string>>(new Set());
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [, setLoading] = useState(true);

  const fetchDrives = async () => {
    try {
      const list = await DataService.getCampusDrives();
      setDrives(list);
    } catch (err) {
      console.warn("Failed to fetch campus drives:", err);
    } finally {
      setLoading(false);
    }
  };

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
      fetchDrives();
    }
    load();

    const handleDrivesUpdate = async () => {
      fetchDrives();
      const user = await DataService.getCurrentUser();
      if (user) {
        const apps = await DataService.getDriveApplications();
        const myAppliedDriveIds = new Set(
          apps.filter((a) => a.student_id === user.id).map((a) => a.drive_id)
        );
        setAppliedDrives(myAppliedDriveIds);
      }
    };

    window.addEventListener("eqlv_drives_updated", handleDrivesUpdate);
    window.addEventListener("eqlv_applications_updated", handleDrivesUpdate);
    window.addEventListener("storage", handleDrivesUpdate);
    return () => {
      window.removeEventListener("eqlv_drives_updated", handleDrivesUpdate);
      window.removeEventListener("eqlv_applications_updated", handleDrivesUpdate);
      window.removeEventListener("storage", handleDrivesUpdate);
    };
  }, []);

  const filteredDrives = drives.filter((d) => {
    const st = (d.status || "Upcoming").toLowerCase();
    if (activeTab === "upcoming") return st === "upcoming";
    if (activeTab === "ongoing") return st === "ongoing" || st === "active";
    if (activeTab === "completed") return st === "completed";
    return true;
  });

  const handleApply = async (driveId: string, companyName: string) => {
    let studentId = currentUser?.id;
    if (!studentId) {
      const u = await DataService.getCurrentUser();
      if (u?.id) {
        studentId = u.id;
        setCurrentUser(u);
      }
    }
    if (!studentId) {
      setApplyMessage("Please log in as a student to register for drives.");
      setTimeout(() => setApplyMessage(null), 3500);
      return;
    }
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
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              Institutional Placement Cell
            </span>
            <span className="text-xs text-[#85998D] font-mono">&bull; Live Opportunities</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5]">
            Campus Drives &amp; Recruitment
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Upcoming and active recruitment drives posted by the Training &amp; Placement Office.
          </p>
        </div>

        {/* Link to Recruitment Simulator */}
        <Link
          href="/student/simulator"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4F7F5] hover:text-[#9DFF00] transition-colors bg-[#0C120F] border border-[#1E2C24] hover:border-[#2C4034] px-4 py-2 rounded-xl self-start sm:self-auto"
        >
          <span>Recruitment Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: `All Drives (${drives.length})` },
          { id: "upcoming", label: "Upcoming" },
          { id: "ongoing", label: "Ongoing" },
          { id: "completed", label: "Completed" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "all" | "upcoming" | "ongoing" | "completed")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#9DFF00] text-[#070B09]"
                  : "bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] hover:border-[#2C4034] hover:text-[#F4F7F5]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toast Notification */}
      {applyMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{applyMessage}</span>
        </div>
      )}

      {/* Main Content Split (65% Drive List / 35% Hero Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drive List */}
        <div className="lg:col-span-8 space-y-4">
          {filteredDrives.length === 0 ? (
            <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] p-12 text-center space-y-2">
              <Building2 className="w-8 h-8 text-[#85998D] mx-auto" />
              <div className="text-sm font-bold text-[#F4F7F5]">No campus drives in this category</div>
              <p className="text-xs text-[#99A9A0]">Check back soon or explore the recruitment simulator.</p>
            </div>
          ) : (
            filteredDrives.map((drive) => {
              const isApplied = appliedDrives.has(drive.id);
              const allowedDepts = drive.allowed_departments?.join(", ") || "All Departments";

              return (
                <div
                  key={drive.id}
                  className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] hover:border-[#2C4034] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  {/* Left: Brand & Details */}
                  <div className="flex items-start gap-4">
                    {/* Logo Container */}
                    <div className="w-14 h-14 rounded-2xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono font-bold text-[#9DFF00] uppercase">
                        {drive.company_name.slice(0, 4)}
                      </span>
                    </div>

                    {/* Title, Role, Specs */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-sm sm:text-base font-bold text-[#F4F7F5]">
                          {drive.company_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#121B16] text-[#D5E0D9] border border-[#1E2C24]">
                          {drive.status || "Upcoming"}
                        </span>
                      </div>
                      <p className="text-xs text-[#D5E0D9] font-semibold">
                        {drive.role_title}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#99A9A0] flex-wrap">
                        <span className="font-mono font-semibold text-emerald-300 tabular-nums">{drive.ctc_range || "Competitive CTC"}</span>
                        <span className="text-[#2C4034]">&bull;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#85998D]" />
                          {drive.location || "Chennai / On-Site"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#85998D] font-sans">
                        Eligible: {allowedDepts}
                      </p>
                    </div>
                  </div>

                  {/* Right: Date & Action CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1E2C24]">
                    <div className="text-right">
                      <div className="text-[10px] text-[#85998D] font-mono uppercase">Drive Date</div>
                      <span className="text-xs font-mono font-bold text-[#D5E0D9] whitespace-nowrap tabular-nums">
                        {drive.drive_date || "TBA"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(drive.id, drive.company_name)}
                      disabled={isApplied}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        isApplied
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 cursor-default"
                          : "bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] active:scale-95 cursor-pointer"
                      }`}
                    >
                      <span>{isApplied ? "Applied" : "Apply Now →"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Hero Card "Placement Drive 2026" */}
        <div className="lg:col-span-4">
          <div className="relative rounded-3xl overflow-hidden bg-[#0C120F] text-[#F4F7F5] shadow-xl min-h-[380px] flex flex-col justify-end p-7 border border-[#1E2C24]">
            {/* Background Graphic */}
            <div
              className="absolute inset-0 opacity-35 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80')",
              }}
            />
            {/* Glowing Lime Wave Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B09] via-[#0C120F]/80 to-transparent" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#9DFF00]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 space-y-4">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-[#F4F7F5] leading-tight">
                  Placement
                  <br />
                  <span className="text-[#9DFF00]">Drive 2026</span>
                </h2>
                <p className="text-xs text-[#D5E0D9] mt-2 leading-relaxed max-w-xs">
                  Direct recruitment opportunities from college placement cell partnerships.
                </p>
              </div>

              {/* Bottom Lime Green Circular Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/student/resume")}
                  aria-label="View placement credentials"
                  className="w-12 h-12 rounded-full bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95 group cursor-pointer"
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
