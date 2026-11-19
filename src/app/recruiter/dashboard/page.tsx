"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
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
  Award,
  Search,
  Filter,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star,
  FileText,
  Building,
  Sparkles,
  ArrowUpRight,
  Lock,
  Layers,
  ArrowRight,
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
  const [consentOnly, setConsentOnly] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<"discovery" | "pipeline">("discovery");
  const [pipelineStageFilter, setPipelineStageFilter] = useState<string>("ALL");

  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<UserProfile | null>(null);
  const [shortlistNotice, setShortlistNotice] = useState<string | null>(null);

  useEffect(() => {
    const user = DemoStore.getCurrentUser();
    setCurrentUser(user);

    const refreshData = async () => {
      const studs = DemoStore.getStudents();
      const subs = DemoStore.getSubmissions();
      setStudents(studs);
      setSubmissions(subs);

      const d = await RecruiterService.getCampusDrives();
      setDrives(d);

      const sl = await RecruiterService.getShortlists();
      setShortlists(sl);
    };

    refreshData();
    const unsubscribe = subscribeToDemoStore(refreshData);
    return unsubscribe;
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
    <div className="flex-1 min-h-screen bg-[#F4F7F4] text-slate-900 pb-16 font-sans">
      {/* Top Banner / Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#9DFF00] text-black border border-[#85e000]">
                Corporate Recruiter Talent Gateway
              </span>
              <span className="text-xs text-slate-400 font-mono">Zoho Corp &bull; Verified Institutional Partner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kavitha R.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Technical Hiring Lead &bull; Campus Recruitment at Annai Vailankanni Arts and Science College, Thanjavur
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleExportShortlist}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Shortlist ({shortlists.length})</span>
            </button>
            <button
              onClick={() => router.push("/admin/drives")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1412] hover:bg-[#1a2320] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-[#9DFF00]" />
              <span>Campus Drives</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8">
        {shortlistNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shortlistNotice}</span>
            </div>
            <button
              onClick={() => setShortlistNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Live KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Evaluated Pool
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {totalCandidates}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">AVASC 2026 Batch</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Placement Ready (80%+)
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {placementReadyCount}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Verified by Skill Engine</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pipeline Shortlists
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {shortlists.length}
              </div>
              <span className="text-[11px] text-blue-600 font-medium">Active Candidates</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Star className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Campus Drive
              </span>
              <div className="text-sm font-extrabold text-slate-900 truncate max-w-[160px]">
                {activeDrive.role}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium font-mono">{activeDrive.compensation}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* View Switcher: Talent Discovery vs Hiring Pipeline */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("discovery")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === "discovery"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-black"
              }`}
            >
              <span>Verified Talent Discovery</span>
            </button>
            <button
              onClick={() => setActiveView("pipeline")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === "pipeline"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-black"
              }`}
            >
              <span>Hiring Pipeline</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#9DFF00] text-black font-bold">
                {shortlists.length}
              </span>
            </button>
          </div>

          {activeView === "discovery" && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Student Consent: Institutional Opt-In Verified</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: VERIFIED TALENT DISCOVERY                             */}
        {/* ------------------------------------------------------------- */}
        {activeView === "discovery" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Search Placement-Ready Students</h2>
                <p className="text-xs text-slate-500">
                  Showing consenting students from BCA, B.Sc Computer Science, and MCA cohorts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name or roll no..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                  />
                </div>

                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                >
                  <option value="ALL">All Departments</option>
                  <option value="BCA">BCA</option>
                  <option value="B.Sc CS">B.Sc CS</option>
                  <option value="B.Sc IT">B.Sc IT</option>
                  <option value="MCA">MCA</option>
                </select>

                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                >
                  <option value={60}>Min Readiness: 60%+</option>
                  <option value={75}>Min Readiness: 75%+</option>
                  <option value={80}>Min Readiness: 80%+ (Top Tier)</option>
                  <option value={90}>Min Readiness: 90%+ (Elite)</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF8] border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => {
                      const shortlisted = isCandidateShortlisted(s.id);
                      const isHighScorer = s.readiness_score >= 80;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedStudentForDrawer(s)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#9DFF00] group-hover:text-black text-slate-700 flex items-center justify-center font-bold text-xs font-mono transition-colors">
                                {s.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 group-hover:text-slate-950 flex items-center gap-1.5">
                                  <span>{s.full_name}</span>
                                  {isHighScorer && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#9DFF00] text-black">
                                      TOP TIER
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{s.roll_no}</td>
                          <td className="py-3 px-4 font-medium text-slate-700">{s.department}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isHighScorer ? "bg-[#9DFF00]" : "bg-amber-400"
                                  }`}
                                  style={{ width: `${s.readiness_score}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-slate-900">
                                {s.readiness_score}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {s.problems_solved || 480}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Consent Granted</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => router.push("/student/resume")}
                                title="View Verified Resume"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleShortlist(s)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 ${
                                  shortlisted
                                    ? "bg-slate-900 text-white"
                                    : "bg-[#9DFF00] hover:bg-[#8CE600] text-black"
                                }`}
                              >
                                <Star className={`w-3 h-3 ${shortlisted ? "fill-current text-amber-400" : ""}`} />
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

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: CANDIDATE HIRING PIPELINE & STAGE PROGRESSION         */}
        {/* ------------------------------------------------------------- */}
        {activeView === "pipeline" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Hiring Pipeline Stages</h2>
                <p className="text-xs text-slate-500">
                  Advance candidates through Screening &bull; Coding Round &bull; Technical Interview &bull; Offered.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["ALL", "Screening", "Coding Round", "Technical Interview", "Offered"].map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setPipelineStageFilter(stage)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      pipelineStageFilter === stage
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:text-black"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF8] border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Roll No & Dept</th>
                      <th className="py-3 px-4">Readiness</th>
                      <th className="py-3 px-4">Current Stage</th>
                      <th className="py-3 px-4">Stage Progression</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPipeline.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.studentName}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {item.rollNo} ({item.department})
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {item.readinessScore}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.stage === "Offered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : item.stage === "Technical Interview"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : item.stage === "Coding Round"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {item.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={item.stage}
                              onChange={(e) => handleAdvanceStage(item.id, e.target.value as PlacementStage)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9DFF00]"
                            >
                              <option value="Screening">1. Screening</option>
                              <option value="Coding Round">2. Coding Round</option>
                              <option value="Technical Interview">3. Technical Interview</option>
                              <option value="Offered">4. Offered</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const s = students.find((st) => st.id === item.studentId);
                              if (s) setSelectedStudentForDrawer(s);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
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
      </main>

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
