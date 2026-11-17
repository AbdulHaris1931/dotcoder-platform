"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { CampusDrive, DriveApplication, UserProfile } from "@/types";
import { downloadFile } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  Users,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AdminDrivesManagerPage() {
  const router = useRouter();
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>("ALL");
  const [applications, setApplications] = useState<DriveApplication[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // New Drive Modal State
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [ctcRange, setCtcRange] = useState("₹6.0 - ₹8.0 LPA");
  const [location, setLocation] = useState("Chennai / Hybrid");
  const [minReadiness, setMinReadiness] = useState(70);
  const [driveDate, setDriveDate] = useState("2026-12-15");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [drivesData, appsData, studsData] = await Promise.all([
        DataService.getCampusDrives(),
        DataService.getDriveApplications(),
        DataService.getStudents(),
      ]);
      setDrives(drivesData);
      if (drivesData.length > 0) setSelectedDriveId(drivesData[0].id);
      setApplications(appsData);
      setStudents(studsData);
      setLoading(false);
    }
    load();
  }, []);

  const activeDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];

  // Filter applications for current selected drive
  const driveApps = applications.filter((a) => {
    if (selectedDriveId === "ALL") return true;
    return a.drive_id === selectedDriveId;
  });

  // Stage advance handler
  const handleAdvanceStage = async (appId: string, currentStage: DriveApplication["stage"]) => {
    const STAGES: DriveApplication["stage"][] = [
      "Applied",
      "Shortlisted for Test",
      "Technical Interview",
      "HR Interview",
      "Offer Extended",
    ];
    const curIdx = STAGES.indexOf(currentStage);
    if (curIdx < STAGES.length - 1) {
      const nextStage = STAGES[curIdx + 1];
      // Optimistic instant UI update
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: nextStage } : a))
      );
      await DataService.updateApplicationStage(appId, nextStage);
      const updated = await DataService.getDriveApplications();
      setApplications([...updated]);
    }
  };

  // 1-Click Export HR Candidate Shortlist CSV
  const handleExportHrCsv = () => {
    const rows = [
      [
        "Candidate Name",
        "Roll No",
        "Department",
        "Batch Year",
        "Campus Email",
        "Readiness Score",
        "Company Name",
        "Applied Role",
        "Recruitment Stage",
        "Application Date",
      ],
    ];

    driveApps.forEach((app) => {
      const stud = students.find((s) => s.id === app.student_id);
      const drv = drives.find((d) => d.id === app.drive_id);
      rows.push([
        stud?.full_name || "Adithya K. Sundaram",
        stud?.roll_no || "22CS001",
        stud?.department || "CSE",
        String(stud?.batch_year || 2026),
        stud?.email || "candidate@cauvery.edu.in",
        `${stud?.readiness_score || 88}%`,
        drv?.company_name || "Zoho Corporation",
        drv?.role_title || "SDE",
        app.stage,
        app.applied_at.slice(0, 10),
      ]);
    });

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const filename = `HR_Shortlist_${activeDrive?.company_name.replace(/\s+/g, "_") || "Campus"}_${Date.now()}.csv`;
    downloadFile(filename, csvContent, "text/csv");

    setExportNotice(`Exported ${filename} successfully formatted for visiting HR team!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await DataService.createCampusDrive({
      company_name: companyName,
      role_title: roleTitle,
      ctc_range: ctcRange,
      location,
      min_readiness_score: minReadiness,
      allowed_departments: ["CSE", "IT", "ECE"],
      max_backlogs: 0,
      drive_date: driveDate,
      application_deadline: `${driveDate}T23:59:59Z`,
      status: "Upcoming",
      description,
    });

    if (res.success) {
      const updated = await DataService.getCampusDrives();
      setDrives(updated);
      setShowModal(false);
      setCompanyName("");
      setRoleTitle("");
      setDescription("");
    }
    setSaving(false);
  };

  const STAGES: DriveApplication["stage"][] = [
    "Applied",
    "Shortlisted for Test",
    "Technical Interview",
    "HR Interview",
    "Offer Extended",
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Placement Cell Command
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Recruitment Drives & Shortlisting Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Campus Placement Drives & Pipeline Manager
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Manage visiting recruitment drives, candidate stage progression, and export HR shortlists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Drive</span>
          </button>

          <button
            onClick={handleExportHrCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)]"
          >
            <Download className="w-4 h-4" />
            <span>Export HR Shortlist CSV</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drive Selector Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
        <button
          onClick={() => setSelectedDriveId("ALL")}
          className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
            selectedDriveId === "ALL"
              ? "bg-indigo-600 text-white font-bold"
              : "bg-[#141418] text-slate-400 hover:text-white border border-white/[0.06]"
          }`}
        >
          All Companies ({drives.length})
        </button>

        {drives.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDriveId(d.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedDriveId === d.id
                ? "bg-indigo-600 text-white font-bold"
                : "bg-[#141418] text-slate-400 hover:text-white border border-white/[0.06]"
            }`}
          >
            <span>{d.company_name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.1]">
              {d.ctc_range}
            </span>
          </button>
        ))}
      </div>

      {/* Candidate Shortlist & Pipeline Table */}
      <div className="card-obsidian rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>
                Applicant Roster ({driveApps.length} Candidates)
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Advance candidates through recruitment rounds with 1 click.
            </p>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {activeDrive?.role_title || "Campus Placement"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono uppercase text-slate-500 border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-3">Roll No</th>
                <th className="py-3 px-3">Candidate</th>
                <th className="py-3 px-3">Dept</th>
                <th className="py-3 px-3">Readiness</th>
                <th className="py-3 px-3">Target Company</th>
                <th className="py-3 px-3">Current Round</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {driveApps.map((app) => {
                const stud = students.find((s) => s.id === app.student_id);
                const drv = drives.find((d) => d.id === app.drive_id);
                const isFinalStage = app.stage === "Offer Extended";

                return (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 font-mono font-semibold text-white">
                      {stud?.roll_no || "22CS001"}
                    </td>

                    <td className="py-3.5 px-3 font-medium text-white">
                      {stud?.full_name || "Adithya K. Sundaram"}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      {stud?.department || "CSE"}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                      {stud?.readiness_score || 88}%
                    </td>

                    <td className="py-3.5 px-3 text-slate-300 font-medium">
                      {drv?.company_name || "Zoho Corporation"}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          app.stage === "Offer Extended"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : app.stage === "Technical Interview"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {app.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {!isFinalStage ? (
                        <button
                          onClick={() => handleAdvanceStage(app.id, app.stage)}
                          className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all inline-flex items-center gap-1"
                        >
                          <span>Advance</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          Offer Placed 🎉
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Drive Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#111114] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <span>Configure Campus Recruitment Drive</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDrive} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Zoho Corporation / TCS / Infosys"
                    className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Role Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      CTC Package *
                    </label>
                    <input
                      type="text"
                      required
                      value={ctcRange}
                      onChange={(e) => setCtcRange(e.target.value)}
                      placeholder="e.g. ₹7.5 - ₹9.0 LPA"
                      className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Min Readiness Cutoff (%)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={minReadiness}
                      onChange={(e) => setMinReadiness(Number(e.target.value))}
                      className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Drive Date
                    </label>
                    <input
                      type="date"
                      required
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Role Description & Evaluation Pattern
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Includes Aptitude screening, coding round on DotCoder, and technical design."
                    className="w-full bg-[#18181C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    {saving ? "Publishing Drive..." : "Publish to Campus Network"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
