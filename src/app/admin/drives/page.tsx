"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { CampusDrive, DriveApplication, UserProfile } from "@/types";
import { downloadFile } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
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
  Layers,
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
        stud?.full_name || "Karthik S.",
        stud?.roll_no || "23BCA01",
        stud?.department || "BCA",
        String(stud?.batch_year || 2026),
        stud?.email || "candidate@avc.edu.in",
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

    setExportNotice(`Exported ${filename}`);
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

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <BlurFade delay={0.05}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Campus Drives
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Recruitment drives and candidate pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-luxury-primary text-white font-mono text-xs font-semibold shadow-md active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Drive</span>
            </button>

            <button
              onClick={handleExportHrCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200 hover:border-emerald-300 transition-all shadow-sm active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Shortlist</span>
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Export Confirmation */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drive Selector Pill Bar */}
      <BlurFade delay={0.1}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
          <button
            onClick={() => setSelectedDriveId("ALL")}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedDriveId === "ALL"
                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs"
            }`}
          >
            All ({drives.length})
          </button>

          {drives.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDriveId(d.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedDriveId === d.id
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs"
              }`}
            >
              <span>{d.company_name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {d.ctc_range}
              </span>
            </button>
          ))}
        </div>
      </BlurFade>

      {/* Candidate Shortlist & Pipeline Table */}
      <BlurFade delay={0.15}>
        <div className="rounded-3xl p-7 bg-white border border-slate-200/90 shadow-luxury space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Applicants ({driveApps.length})</span>
              </h2>
            </div>

            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 self-start sm:self-auto">
              {activeDrive?.role_title || "Campus Placement"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-slate-100 font-bold">
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
              <tbody className="divide-y divide-slate-100">
                {driveApps.map((app) => {
                  const stud = students.find((s) => s.id === app.student_id);
                  const drv = drives.find((d) => d.id === app.drive_id);
                  const isFinalStage = app.stage === "Offer Extended";

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-3 font-mono font-bold text-slate-900">
                        {stud?.roll_no || "22CS001"}
                      </td>

                      <td className="py-4 px-3 font-semibold text-slate-900">
                        {stud?.full_name || "Adithya K. Sundaram"}
                      </td>

                      <td className="py-4 px-3 font-mono text-slate-500">
                        {stud?.department || "CSE"}
                      </td>

                      <td className="py-4 px-3 font-mono font-extrabold text-emerald-600">
                        {stud?.readiness_score || 88}%
                      </td>

                      <td className="py-4 px-3 text-slate-700 font-medium">
                        {drv?.company_name || "Zoho Corporation"}
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                            app.stage === "Offer Extended"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : app.stage === "Technical Interview"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {app.stage}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-right">
                        {!isFinalStage ? (
                          <button
                            onClick={() => handleAdvanceStage(app.id, app.stage)}
                            className="px-3.5 py-1.5 text-[11px] font-mono font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-all inline-flex items-center gap-1 shadow-xs active:scale-95"
                          >
                            <span>Advance</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-emerald-600 font-bold">
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
      </BlurFade>

      {/* Post Drive Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <span>Configure Campus Recruitment Drive</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDrive} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Zoho Corporation / TCS / Infosys"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">
                      Role Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">
                      CTC Package *
                    </label>
                    <input
                      type="text"
                      required
                      value={ctcRange}
                      onChange={(e) => setCtcRange(e.target.value)}
                      placeholder="e.g. ₹7.5 - ₹9.0 LPA"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">
                      Min Readiness Cutoff (%)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={minReadiness}
                      onChange={(e) => setMinReadiness(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">
                      Drive Date
                    </label>
                    <input
                      type="date"
                      required
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 font-bold mb-1">
                    Role Description & Evaluation Pattern
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Includes Aptitude screening, coding round on DotCoder, and technical interview."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-2xl btn-luxury-primary text-white font-mono text-xs font-bold transition-all shadow-md disabled:opacity-50 active:scale-95"
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
