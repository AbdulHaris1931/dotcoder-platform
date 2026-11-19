"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile, Submission } from "@/types";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import { downloadFile } from "@/lib/utils";
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
} from "lucide-react";

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [minScore, setMinScore] = useState<number>(75);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<UserProfile | null>(null);
  const [shortlistNotice, setShortlistNotice] = useState<string | null>(null);

  useEffect(() => {
    const user = DemoStore.getCurrentUser();
    setCurrentUser(user);

    const refreshData = () => {
      const studs = DemoStore.getStudents();
      const subs = DemoStore.getSubmissions();
      setStudents(studs);
      setSubmissions(subs);
    };

    refreshData();
    const unsubscribe = subscribeToDemoStore(refreshData);
    return unsubscribe;
  }, []);

  const toggleShortlist = (id: string, name: string) => {
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setShortlistNotice(`Removed ${name} from shortlist.`);
      } else {
        next.add(id);
        setShortlistNotice(`Shortlisted ${name} for Zoho Developer Intern 2025.`);
      }
      return next;
    });
    setTimeout(() => setShortlistNotice(null), 3000);
  };

  const handleExportShortlist = () => {
    const shortlistedStudents = students.filter((s) => shortlistedIds.has(s.id));
    if (shortlistedStudents.length === 0) {
      alert("Please shortlist at least one candidate before exporting.");
      return;
    }

    const headers = "Name,Roll No,Department,Email,Readiness Score,Status\n";
    const rows = shortlistedStudents
      .map(
        (s) =>
          `"${s.full_name}","${s.roll_no}","${s.department}","${s.email}",${s.readiness_score}%,"Shortlisted"`
      )
      .join("\n");

    downloadFile(
      `Zoho_AVASC_Shortlisted_Candidates_${new Date().toISOString().slice(0, 10)}.csv`,
      headers + rows,
      "text/csv;charset=utf-8;"
    );
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === "ALL" || s.department === selectedDept;
    const matchesScore = s.readiness_score >= minScore;

    return matchesSearch && matchesDept && matchesScore;
  });

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
              <span className="text-xs text-slate-400 font-mono">Zoho Corp &bull; Verified Partner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kavitha R.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Technical Hiring Lead &bull; Campus Recruitment at Annai Vailankanni Arts and Science College, Thanjavur
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportShortlist}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Shortlist ({shortlistedIds.size})</span>
            </button>
            <button
              onClick={() => router.push("/admin/drives")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1412] hover:bg-[#1a2320] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-[#9DFF00]" />
              <span>Manage Campus Drives</span>
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
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between"
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
              <span className="text-[11px] text-emerald-600 font-medium">Verified by DotCoder Engine</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Shortlisted for Interview
              </span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {shortlistedIds.size}
              </div>
              <span className="text-[11px] text-blue-600 font-medium">Zoho Dev Intern</span>
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
                Zoho Dev Intern 2025
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Status: Active Screening</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Talent Discovery Filters & Candidates Table */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified Talent Discovery</h2>
              <p className="text-xs text-slate-500">
                Filter verified students by algorithmic proficiency, department, and authenticated credentials.
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
                    <th className="py-3 px-4">Verified Readiness</th>
                    <th className="py-3 px-4">Solved Problems</th>
                    <th className="py-3 px-4">Credential</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const isShortlisted = shortlistedIds.has(s.id);
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
                            <span>Verified</span>
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
                              onClick={() => toggleShortlist(s.id, s.full_name)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 ${
                                isShortlisted
                                  ? "bg-slate-900 text-white"
                                  : "bg-[#9DFF00] hover:bg-[#8CE600] text-black"
                              }`}
                            >
                              <Star className={`w-3 h-3 ${isShortlisted ? "fill-current text-amber-400" : ""}`} />
                              <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
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
