"use client";

import { motion } from "framer-motion";
import { CampusDrive, UserProfile } from "@/types";
import {
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Briefcase,
  ChevronRight,
} from "lucide-react";

interface DriveCardProps {
  drive: CampusDrive;
  userProfile?: UserProfile | null;
  hasApplied?: boolean;
  applicationStage?: string;
  onApply: (driveId: string) => void;
  applying?: boolean;
}

export function DriveCard({
  drive,
  userProfile,
  hasApplied = false,
  applicationStage,
  onApply,
  applying = false,
}: DriveCardProps) {
  const readiness = Number(userProfile?.readiness_score) || 0;
  const isScoreEligible = readiness >= drive.min_readiness_score;
  const userDept = userProfile?.department || "CSE";
  const isDeptEligible = drive.allowed_departments.includes(userDept);
  const isEligible = isScoreEligible && isDeptEligible;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="p-6 rounded-2xl bg-obsidian-900 border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between group shadow-card hover:shadow-card-elevated space-y-5 relative overflow-hidden"
    >
      {/* Top Edge Sub-Pixel Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent pointer-events-none" />

      <div className="space-y-4">
        {/* Top Header: Company & CTC */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.1] text-indigo-400 flex items-center justify-center font-bold text-sm font-mono flex-shrink-0 shadow-inner">
              {drive.company_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                <span className="font-medium text-zinc-300">{drive.company_name}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span className="text-emerald-400 font-semibold">{drive.status}</span>
              </div>
              <h3 className="font-bold text-zinc-100 text-base group-hover:text-indigo-300 transition-colors mt-0.5">
                {drive.role_title}
              </h3>
            </div>
          </div>

          <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold whitespace-nowrap shadow-sm">
            {drive.ctc_range}
          </div>
        </div>

        {/* Location & Schedule */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>{drive.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Drive Date: {drive.drive_date}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
          {drive.description}
        </p>

        {/* Eligibility Verification Badge */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Eligibility Status:</span>
            {isEligible ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Eligible Candidate
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Criteria Gap
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span>Min Score:</span>
              <span className={`font-semibold ${isScoreEligible ? "text-emerald-400" : "text-rose-400"}`}>
                {drive.min_readiness_score}% (Yours: {readiness}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Branches:</span>
              <span className={`font-semibold ${isDeptEligible ? "text-emerald-400" : "text-amber-400"}`}>
                {drive.allowed_departments.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        {hasApplied ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-300 font-semibold">
                Application Submitted
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
              {applicationStage || "Applied"}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onApply(drive.id)}
            disabled={!isEligible || applying}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isEligible
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow hover:shadow-indigo-500/50 active:scale-[0.98] btn-shiny"
                : "bg-white/[0.04] text-zinc-500 border border-white/[0.06] cursor-not-allowed"
            }`}
          >
            {applying ? (
              <span>Submitting Application...</span>
            ) : isEligible ? (
              <>
                <span>1-Click Apply to Drive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <span>Ineligible (Readiness Criteria Not Met)</span>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
