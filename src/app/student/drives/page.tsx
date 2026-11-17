"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { CampusDrive, DriveApplication, UserProfile } from "@/types";
import { DriveCard } from "@/components/drives/drive-card";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  Filter,
  ArrowRight,
} from "lucide-react";

export default function StudentDrivesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [applications, setApplications] = useState<DriveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "eligible" | "applied">("all");
  const [applyingDriveId, setApplyingDriveId] = useState<string | null>(null);
  const [applySuccessNotice, setApplySuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [user, drivesData, appsData] = await Promise.all([
        DataService.getCurrentUser(),
        DataService.getCampusDrives(),
        DataService.getDriveApplications(),
      ]);
      setCurrentUser(user);
      setDrives(drivesData);
      setApplications(appsData);
      setLoading(false);
    }
    load();
  }, []);

  const handleApply = async (driveId: string) => {
    if (!currentUser) return;
    setApplyingDriveId(driveId);

    const res = await DataService.applyToCampusDrive(driveId, currentUser.id);
    if (res.success) {
      const targetDrive = drives.find((d) => d.id === driveId);
      setApplySuccessNotice(`Successfully applied to ${targetDrive?.company_name || "Campus Drive"}!`);
      // Reload applications
      const updatedApps = await DataService.getDriveApplications();
      setApplications(updatedApps);
      setTimeout(() => setApplySuccessNotice(null), 4000);
    }
    setApplyingDriveId(null);
  };

  const readiness = Number(currentUser?.readiness_score) || 0;
  const userDept = currentUser?.department || "CSE";

  const appliedDriveIds = new Set(
    applications.filter((a) => a.student_id === currentUser?.id).map((a) => a.drive_id)
  );

  const eligibleDrives = drives.filter(
    (d) => readiness >= d.min_readiness_score && d.allowed_departments.includes(userDept)
  );

  const displayedDrives = drives.filter((d) => {
    if (filterTab === "eligible") {
      return readiness >= d.min_readiness_score && d.allowed_departments.includes(userDept);
    }
    if (filterTab === "applied") {
      return appliedDriveIds.has(d.id);
    }
    return true;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Campus Placement Recruitment
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentUser?.college_name || "Cauvery Institute of Technology"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Active Campus Placement Drives
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Apply to visiting recruiting partners with 1-click verified campus readiness credentials.
          </p>
        </div>

        <button
          onClick={() => router.push("/student/resume")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141418] hover:bg-[#18181C] border border-white/[0.08] text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
        >
          <Award className="w-4 h-4 text-indigo-400" />
          <span>View Verified Placement Resume</span>
        </button>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {applySuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{applySuccessNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-obsidian rounded-2xl p-5 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Total Active Drives
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {drives.length}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Zoho, TCS, Cognizant, Infosys
          </div>
        </div>

        <div className="card-obsidian rounded-2xl p-5 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Eligible For Your Profile
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {eligibleDrives.length} of {drives.length}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Based on {readiness}% readiness & {userDept}
          </div>
        </div>

        <div className="card-obsidian rounded-2xl p-5 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Highest Package On Campus
          </div>
          <div className="text-3xl font-extrabold font-mono text-indigo-400">
            ₹11.0 LPA
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Infosys Specialist Programmer
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 text-xs font-mono">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterTab === "all"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All Drives ({drives.length})
        </button>

        <button
          onClick={() => setFilterTab("eligible")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterTab === "eligible"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Eligible For Me ({eligibleDrives.length})
        </button>

        <button
          onClick={() => setFilterTab("applied")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filterTab === "applied"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          My Applications ({appliedDriveIds.size})
        </button>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-slate-500">
          Loading campus placement opportunities...
        </div>
      ) : displayedDrives.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-slate-500 border border-white/[0.06] rounded-2xl bg-[#0C0C0E]">
          No recruitment drives found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedDrives.map((d) => {
            const userApp = applications.find(
              (a) => a.drive_id === d.id && a.student_id === currentUser?.id
            );
            return (
              <DriveCard
                key={d.id}
                drive={d}
                userProfile={currentUser}
                hasApplied={Boolean(userApp)}
                applicationStage={userApp?.stage}
                onApply={handleApply}
                applying={applyingDriveId === d.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
