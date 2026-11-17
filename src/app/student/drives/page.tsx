"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { CampusDrive, DriveApplication, UserProfile } from "@/types";
import { DriveCard } from "@/components/drives/drive-card";
import { BlurFade } from "@/components/magicui/blur-fade";
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
  ShieldCheck,
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
      <BlurFade delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Campus Placement Recruitment
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {currentUser?.college_name || "Cauvery Institute of Technology"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Active Campus Placement Drives
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Apply to visiting corporate hiring partners with 1-click verified campus readiness credentials.
            </p>
          </div>

          <button
            onClick={() => router.push("/student/resume")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.1] hover:border-white/[0.18] text-xs font-mono font-semibold text-zinc-200 hover:text-white transition-all shadow-card group"
          >
            <Award className="w-4 h-4 text-indigo-400" />
            <span>View Verified Placement Resume</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </BlurFade>

      {/* Success Notification */}
      <AnimatePresence>
        {applySuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-300 flex items-center gap-3 shadow-glow-emerald"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{applySuccessNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Bento Row */}
      <BlurFade delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] shadow-card space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Total Active Drives
            </div>
            <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {drives.length}
            </div>
            <div className="text-[11px] font-mono text-zinc-500">
              Zoho, TCS, Cognizant, Infosys
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] shadow-card space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Eligible For Your Profile
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
              {eligibleDrives.length} <span className="text-sm font-normal text-zinc-500">/ {drives.length}</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500">
              Based on {readiness}% readiness & {userDept}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] shadow-card space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Highest Package On Campus
            </div>
            <div className="text-3xl font-extrabold font-mono text-indigo-400 tabular-nums">
              ₹11.0 LPA
            </div>
            <div className="text-[11px] font-mono text-zinc-500">
              Infosys Specialist Programmer
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Filter Tabs */}
      <BlurFade delay={0.15}>
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 text-xs font-mono">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterTab === "all"
                ? "bg-indigo-600 text-white font-bold shadow-glow"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            All Drives ({drives.length})
          </button>

          <button
            onClick={() => setFilterTab("eligible")}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterTab === "eligible"
                ? "bg-indigo-600 text-white font-bold shadow-glow"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            Eligible For Me ({eligibleDrives.length})
          </button>

          <button
            onClick={() => setFilterTab("applied")}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterTab === "applied"
                ? "bg-indigo-600 text-white font-bold shadow-glow"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            My Applications ({appliedDriveIds.size})
          </button>
        </div>
      </BlurFade>

      {/* Drives Grid */}
      <BlurFade delay={0.2}>
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-zinc-500">
            Loading campus placement opportunities from Supabase PostgreSQL...
          </div>
        ) : displayedDrives.length === 0 ? (
          <div className="p-16 text-center text-xs font-mono text-zinc-500 border border-white/[0.08] rounded-2xl bg-obsidian-900 shadow-card">
            No recruitment drives found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </BlurFade>
    </div>
  );
}
