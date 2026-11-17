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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-luxury hover:shadow-luxury-hover hover:border-indigo-200 transition-all flex flex-col justify-between group space-y-5"
    >
      <div className="space-y-4">
        {/* Top Header: Company & CTC */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm font-mono flex-shrink-0 shadow-xs">
              {drive.company_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 font-medium">
                <span className="font-bold text-slate-800">{drive.company_name}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-emerald-600 font-bold">{drive.status}</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors mt-0.5">
                {drive.role_title}
              </h3>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold whitespace-nowrap shadow-xs">
            {drive.ctc_range}
          </div>
        </div>

        {/* Location & Schedule */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>{drive.location}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Drive: {drive.drive_date}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
          {drive.description}
        </p>

        {/* Eligibility Verification Badge */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-medium">Eligibility Status:</span>
            {isEligible ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Eligible Candidate
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Criteria Gap
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <span>Min Score:</span>
              <span className={`font-bold ${isScoreEligible ? "text-emerald-600" : "text-rose-600"}`}>
                {drive.min_readiness_score}% (Yours: {readiness}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Branches:</span>
              <span className={`font-bold ${isDeptEligible ? "text-emerald-600" : "text-amber-600"}`}>
                {drive.allowed_departments.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        {hasApplied ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-emerald-800 font-bold">
                Application Submitted
              </span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white text-slate-700 font-semibold border border-slate-200">
              {applicationStage || "Applied"}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onApply(drive.id)}
            disabled={!isEligible || applying}
            className={`w-full py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isEligible
                ? "btn-luxury-primary active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
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
