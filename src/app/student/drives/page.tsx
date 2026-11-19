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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80">
                Campus Placement Recruitment
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {currentUser?.college_name || "Annai Vailankanni Arts and Science College, Thanjavur"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Active Campus Placement Drives
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Apply to visiting corporate hiring partners with 1-click verified campus readiness credentials.
            </p>
          </div>

          <button
            onClick={() => router.push("/student/resume")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-800 transition-all shadow-sm hover:shadow group"
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>View Verified Placement Resume</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
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
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-3 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{applySuccessNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Bento Row */}
      <BlurFade delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-luxury space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Total Active Drives
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {drives.length}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Zoho, TCS, Cognizant, Infosys
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-luxury space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Eligible For Your Profile
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 tabular-nums">
              {eligibleDrives.length} <span className="text-sm font-normal text-slate-400">/ {drives.length}</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Based on {readiness}% readiness & {userDept}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-luxury space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Highest Package On Campus
            </div>
            <div className="text-3xl font-extrabold font-mono text-indigo-600 tabular-nums">
              ₹11.0 LPA
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Infosys Specialist Programmer
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Filter Tabs */}
      <BlurFade delay={0.15}>
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4 text-xs font-mono">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterTab === "all"
                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs"
            }`}
          >
            All Drives ({drives.length})
          </button>

          <button
            onClick={() => setFilterTab("eligible")}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterTab === "eligible"
                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs"
            }`}
          >
            Eligible For Me ({eligibleDrives.length})
          </button>

          <button
            onClick={() => setFilterTab("applied")}
            className={`px-4 py-2 rounded-xl transition-all ${
              filterTab === "applied"
                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs"
            }`}
          >
            My Applications ({appliedDriveIds.size})
          </button>
        </div>
      </BlurFade>

      {/* Drives Grid */}
      <BlurFade delay={0.2}>
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-slate-500">
            Loading campus placement opportunities from Supabase PostgreSQL...
          </div>
        ) : displayedDrives.length === 0 ? (
          <div className="p-16 text-center text-xs font-mono text-slate-500 border border-slate-200/80 rounded-3xl bg-white shadow-luxury">
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
