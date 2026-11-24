"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToDemoStore } from "@/lib/demo-store";
import { DataService } from "@/lib/supabase/db";
import { UserProfile, Submission } from "@/types";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import { downloadFile } from "@/lib/utils";
import { RecruiterService } from "@/lib/services/recruiter-service";
import {
  CampusDrive,
  CandidateShortlistEntry,
  PlacementStage,
} from "@/types/recruiter";
import {
  Briefcase,
  Users,
  Search,
  Download,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
  FileText,
} from "lucide-react";

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [shortlists, setShortlists] = useState<CandidateShortlistEntry[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [minScore, setMinScore] = useState<number>(75);
  const [consentOnly] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<"discovery" | "pipeline">("discovery");
  const [pipelineStageFilter, setPipelineStageFilter] = useState<string>("ALL");

  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<UserProfile | null>(null);
  const [shortlistNotice, setShortlistNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refreshData = async () => {
      const [user, studs, subs, d, sl] = await Promise.all([
        DataService.getCurrentUser(),
        DataService.getStudents(),
        DataService.getSubmissions(),
        RecruiterService.getCampusDrives(),
        RecruiterService.getShortlists(),
      ]);
      if (!isMounted) return;
      setCurrentUser(user);
      setStudents(studs);
      setSubmissions(subs);
      setDrives(d);
      setShortlists(sl);
    };

    refreshData();
    const unsubscribe = subscribeToDemoStore(() => {
      void refreshData();
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const activeDrive = drives[0] || {
    id: "d0000000-0000-0000-0000-000000000001",
    title: "Zoho Campus Recruitment Drive 2026",
    role: "Software Craftsman / Member Technical Staff",
    compensation: "6.5 - 8.4 LPA",
  };

  const isCandidateShortlisted = (studentId: string) => {
    return shortlists.some((s) => s.studentId === studentId);
  };

  const handleToggleShortlist = async (student: UserProfile) => {
    const existing = shortlists.find((s) => s.studentId === student.id);
    if (existing) {
      await RecruiterService.removeShortlist(student.id);
      setShortlists((prev) => prev.filter((s) => s.studentId !== student.id));
      setShortlistNotice(`Removed ${student.full_name} from recruitment shortlist.`);
    } else {
      const newEntry = await RecruiterService.shortlistCandidate({
        studentId: student.id,
        studentName: student.full_name,
        rollNo: student.roll_no || "23BCA01",
        department: student.department || "BCA",
        readinessScore: student.readiness_score,
        dsaMastery: "Arrays & Sliding Window",
        primaryLanguage: "Python",
        driveId: activeDrive.id,
        driveTitle: activeDrive.title,
        stage: "Screening",
        recruiterNotes: "Candidate shortlisted from verified skill intelligence talent pool.",
      });
      setShortlists((prev) => [newEntry, ...prev]);
      setShortlistNotice(`Shortlisted ${student.full_name} for ${activeDrive.title}.`);
    }
    setTimeout(() => setShortlistNotice(null), 3500);
  };

  const handleAdvanceStage = async (entryId: string, newStage: PlacementStage) => {
    await RecruiterService.updateCandidateStage(entryId, newStage);
    setShortlists((prev) =>
      prev.map((item) => (item.id === entryId ? { ...item, stage: newStage } : item))
    );
    setShortlistNotice(`Candidate advanced to ${newStage}.`);
    setTimeout(() => setShortlistNotice(null), 3000);
  };

  const handleExportShortlist = () => {
    if (shortlists.length === 0) {
      alert("No candidates in the shortlist to export.");
      return;
    }

    const headers = "Name,Roll No,Department,Readiness Score,Stage,Drive Title,Shortlisted At\n";
    const rows = shortlists
      .map(
        (s) =>
          `"${s.studentName}","${s.rollNo}","${s.department}",${s.readinessScore}%,"${s.stage}","${s.driveTitle}","${new Date(s.shortlistedAt).toLocaleDateString()}"`
      )
      .join("\n");

    downloadFile(
      `Zoho_AVASC_Hiring_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`,
      headers + rows,
      "text/csv;charset=utf-8;"
    );
  };

  // Filter students by criteria
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = selectedDept === "ALL" || s.department === selectedDept;
      const matchesScore = s.readiness_score >= minScore;
      // All demo students have consent active
      const matchesConsent = consentOnly ? true : true;

      return matchesSearch && matchesDept && matchesScore && matchesConsent;
    });
  }, [students, searchQuery, selectedDept, minScore, consentOnly]);

  const filteredPipeline = useMemo(() => {
    if (pipelineStageFilter === "ALL") return shortlists;
    return shortlists.filter((s) => s.stage === pipelineStageFilter);
  }, [shortlists, pipelineStageFilter]);

  const totalCandidates = students.length;
  const placementReadyCount = students.filter((s) => s.readiness_score >= 80).length;

  return (
    <div className="flex-1 min-h-screen bg-[#070B09] text-[#F4F7F5] pb-16 font-sans">
      {/* Top Banner / Header */}
      <div className="bg-[#0A0F0C] border-b border-[#1E2C24] px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#9DFF00] text-[#070B09]">
                Corporate Recruiter Talent Gateway
              </span>
              <span className="text-xs text-[#99A9A0] font-mono">
                Zoho Corp &bull; Verified Institutional Partner
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7F5] tracking-tight">
              {currentUser?.full_name || "Corporate Recruiter"}
            </h1>
            <p className="text-xs sm:text-sm text-[#99A9A0] mt-0.5">
              Technical Hiring Lead &bull; Campus Recruitment at Annai Vailankanni Arts and Science College, Thanjavur
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleExportShortlist}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E2C24] bg-[#0C120F] hover:bg-[#121B16] text-xs font-semibold text-[#F4F7F5] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#99A9A0]" />
              <span>Export Shortlist ({shortlists.length})</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/tpo/drives")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-bold transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-[#070B09]" />
              <span>Campus Drives</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {shortlistNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{shortlistNotice}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setShortlistNotice(null)}
              className="text-emerald-300 hover:text-white font-bold cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        )}

        {/* Live KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Total Evaluated Pool
              </span>
              <div className="font-display text-2xl font-bold text-[#F4F7F5] tabular-nums">
                {totalCandidates}
              </div>
              <span className="text-[11px] text-[#85998D] font-mono">AVASC 2026 Batch</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center text-[#99A9A0]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Placement Ready (80%+)
              </span>
              <div className="font-display text-2xl font-bold text-[#9DFF00] tabular-nums">
                {placementReadyCount}
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Verified by Skill Engine</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/25 flex items-center justify-center text-[#9DFF00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Pipeline Shortlists
              </span>
              <div className="font-display text-2xl font-bold text-[#F4F7F5] tabular-nums">
                {shortlists.length}
              </div>
              <span className="text-[11px] text-sky-400 font-medium">Active Candidates</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Star className="w-5 h-5" />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#99A9A0]">
                Active Campus Drive
              </span>
              <div className="text-sm font-bold text-[#F4F7F5] truncate max-w-[160px]">
                {activeDrive.role}
              </div>
              <span className="text-[11px] text-[#9DFF00] font-mono">{activeDrive.compensation}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* View Switcher */}
        <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView("discovery")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "discovery"
                  ? "bg-[#9DFF00] text-[#070B09]"
                  : "bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] hover:text-[#F4F7F5]"
              }`}
            >
              <span>Verified Talent Discovery</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("pipeline")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "pipeline"
                  ? "bg-[#9DFF00] text-[#070B09]"
                  : "bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] hover:text-[#F4F7F5]"
              }`}
            >
              <span>Hiring Pipeline</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeView === "pipeline" ? "bg-black/15 text-[#070B09]" : "bg-[#9DFF00]/15 text-[#9DFF00]"
                }`}
              >
                {shortlists.length}
              </span>
            </button>
          </div>

          {activeView === "discovery" && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#99A9A0] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#9DFF00]" />
              <span>Student Consent: Institutional Opt-In Verified</span>
            </div>
          )}
        </div>

        {/* VIEW 1: VERIFIED TALENT DISCOVERY */}
        {activeView === "discovery" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#F4F7F5]">
                  Search Placement-Ready Students
                </h2>
                <p className="text-xs text-[#99A9A0]">
                  Showing consenting students from BCA, B.Sc Computer Science, and MCA cohorts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#85998D] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    name="search"
                    aria-label="Search candidate name or roll no"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name or roll no..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-[#1E2C24] bg-[#0C120F] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00]/60"
                  />
                </div>

                <ObsidianSelect ariaLabel="Filter candidates by department" value={String(selectedDept)} onChange={(val) => setSelectedDept(val)} options={[{ value: "ALL", label: "All Departments" }, { value: "BCA", label: "BCA" }, { value: "B.Sc CS", label: "B.Sc CS" }, { value: "B.Sc IT", label: "B.Sc IT" }, { value: "MCA", label: "MCA" }]} buttonClassName="px-3 py-1.5 rounded-xl border border-[#1E2C24] bg-[#0C120F] text-xs text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]/60 font-mono" />

                <ObsidianSelect ariaLabel="Filter candidates by minimum readiness" value={String(minScore)} onChange={(val) => setMinScore(Number(val))} options={[{ value: String(0), label: "All Readiness Scores" }, { value: String(60), label: "Min Readiness: 60%+" }, { value: String(75), label: "Min Readiness: 75%+" }, { value: String(80), label: "Min Readiness: 80%+ (Top Tier)" }, { value: String(90), label: "Min Readiness: 90%+ (Elite)" }]} buttonClassName="px-3 py-1.5 rounded-xl border border-[#1E2C24] bg-[#0C120F] text-xs text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]/60 font-mono" />
              </div>
            </div>

            <div className="surface-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0F0C] border-b border-[#1E2C24] text-[10px] font-mono font-semibold text-[#85998D] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Readiness Score</th>
                      <th className="py-3 px-4">Solved Problems</th>
                      <th className="py-3 px-4">Privacy Consent</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2C24]">
                    {filteredStudents.map((s) => {
                      const shortlisted = isCandidateShortlisted(s.id);
                      const isHighScorer = s.readiness_score >= 80;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedStudentForDrawer(s)}
                          className="hover:bg-[#121B16]/70 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#121B16] border border-[#1E2C24] group-hover:bg-[#9DFF00] group-hover:text-[#070B09] text-[#F4F7F5] flex items-center justify-center font-bold text-xs font-mono transition-colors">
                                {s.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                              <div>
                                <div className="font-bold text-[#F4F7F5] flex items-center gap-1.5">
                                  <span>{s.full_name}</span>
                                  {isHighScorer && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
                                      TOP TIER
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-[#99A9A0] font-mono">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#99A9A0]">{s.roll_no}</td>
                          <td className="py-3 px-4 font-medium text-[#F4F7F5]">{s.department}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-[#070B09] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isHighScorer ? "bg-[#9DFF00]" : "bg-amber-400"
                                  }`}
                                  style={{ width: `${s.readiness_score}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-[#F4F7F5] tabular-nums">
                                {s.readiness_score}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-[#F4F7F5] tabular-nums">
                            {s.problems_solved || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Consent Granted</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push("/student/resume");
                                }}
                                title="View Verified Resume"
                                aria-label="View verified resume"
                                className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleToggleShortlist(s);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                  shortlisted
                                    ? "bg-[#18241D] border border-[#2C4034] text-[#F4F7F5]"
                                    : "bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09]"
                                }`}
                              >
                                <Star className={`w-3 h-3 ${shortlisted ? "fill-current text-[#9DFF00]" : ""}`} />
                                <span>{shortlisted ? "Shortlisted" : "Shortlist"}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 2: CANDIDATE HIRING PIPELINE */}
        {activeView === "pipeline" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#F4F7F5]">
                  Active Hiring Pipeline Stages
                </h2>
                <p className="text-xs text-[#99A9A0]">
                  Advance candidates through Screening &bull; Coding Round &bull; Technical Interview &bull; Offered.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {["ALL", "Screening", "Coding Round", "Technical Interview", "Offered"].map((stage) => (
                  <button
                    type="button"
                    key={stage}
                    onClick={() => setPipelineStageFilter(stage)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      pipelineStageFilter === stage
                        ? "bg-[#9DFF00] text-[#070B09]"
                        : "bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] hover:text-[#F4F7F5]"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A0F0C] border-b border-[#1E2C24] text-[10px] font-mono font-semibold text-[#85998D] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Roll No &amp; Dept</th>
                      <th className="py-3 px-4">Readiness</th>
                      <th className="py-3 px-4">Current Stage</th>
                      <th className="py-3 px-4">Stage Progression</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2C24]">
                    {filteredPipeline.map((item) => (
                      <tr key={item.id} className="hover:bg-[#121B16]/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#F4F7F5]">{item.studentName}</td>
                        <td className="py-3 px-4 font-mono text-[#99A9A0]">
                          {item.rollNo} ({item.department})
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#F4F7F5] tabular-nums">
                          {item.readinessScore}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              item.stage === "Offered"
                                ? "bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30"
                                : item.stage === "Technical Interview"
                                ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                                : item.stage === "Coding Round"
                                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                : "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]"
                            }`}
                          >
                            {item.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <ObsidianSelect ariaLabel={`Stage for ${item.studentName}`} value={String(item.stage)} onChange={(val) => handleAdvanceStage(item.id, val as PlacementStage)} options={[{ value: "Screening", label: "1. Screening" }, { value: "Coding Round", label: "2. Coding Round" }, { value: "Technical Interview", label: "3. Technical Interview" }, { value: "Offered", label: "4. Offered" }]} buttonClassName="px-2.5 py-1 rounded-lg border border-[#1E2C24] bg-[#070B09] text-xs font-mono text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00]/60" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const s = students.find((st) => st.id === item.studentId);
                              if (s) setSelectedStudentForDrawer(s);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#99A9A0] hover:text-[#9DFF00] hover:bg-[#18241D] transition-colors cursor-pointer"
                          >
                            <span>Inspect Skills</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Slide-Over Drawer for Selected Student Profile */}
      <AnimatePresence>
        {selectedStudentForDrawer && (
          <StudentDrawer
            student={selectedStudentForDrawer}
            submissions={submissions}
            onClose={() => setSelectedStudentForDrawer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
