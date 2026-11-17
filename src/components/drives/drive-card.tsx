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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 md:p-6 rounded-2xl bg-[#111114] border border-white/[0.08] hover:border-white/[0.14] transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] space-y-4"
    >
      <div className="space-y-4">
        {/* Top Header: Company & CTC */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm font-mono flex-shrink-0">
              {drive.company_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span>{drive.company_name}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-emerald-400 font-semibold">{drive.status}</span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                {drive.role_title}
              </h3>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold whitespace-nowrap">
            {drive.ctc_range}
          </div>
        </div>

        {/* Location & Schedule */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>{drive.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Drive: {drive.drive_date}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
          {drive.description}
        </p>

        {/* Eligibility Verification Badge */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Eligibility Criteria:</span>
            {isEligible ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                Eligible Candidate
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                <AlertTriangle className="w-3 h-3" />
                Criteria Gap
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span
              className={`px-2 py-0.5 rounded border ${
                isScoreEligible
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              Min {drive.min_readiness_score}% Readiness (Yours: {readiness}%)
            </span>
            <span
              className={`px-2 py-0.5 rounded border ${
                isDeptEligible
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              Branches: {drive.allowed_departments.join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{drive.applicant_count || 30} Applicants</span>
        </div>

        {hasApplied ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{applicationStage || "Applied"}</span>
            </span>
          </div>
        ) : (
          <button
            onClick={() => onApply(drive.id)}
            disabled={applying}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
              isEligible
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]"
                : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            {applying ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <span>{isEligible ? "1-Click Apply" : "Apply with Waiver"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
