"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { CampusDrive, DriveApplication, UserProfile } from "@/types";
import { downloadFile } from "@/lib/utils";
import {
  Users,
  Download,
  Plus,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function TPODrivesPage() {
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>("ALL");
  const [applications, setApplications] = useState<DriveApplication[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [, setLoading] = useState(true);
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

    const handleDrivesUpdate = async () => {
      const [refreshedDrives, refreshedApps] = await Promise.all([
        DataService.getCampusDrives(),
        DataService.getDriveApplications(),
      ]);
      setDrives(refreshedDrives);
      setApplications(refreshedApps);
    };

    window.addEventListener("eqlv_drives_updated", handleDrivesUpdate);
    window.addEventListener("eqlv_applications_updated", handleDrivesUpdate);
    window.addEventListener("storage", handleDrivesUpdate);
    return () => {
      window.removeEventListener("eqlv_drives_updated", handleDrivesUpdate);
      window.removeEventListener("eqlv_applications_updated", handleDrivesUpdate);
      window.removeEventListener("storage", handleDrivesUpdate);
    };
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
        `${stud?.readiness_score ?? 0}%`,
        drv?.company_name || "Zoho Corporation",
        drv?.role_title || "SDE",
        app.stage,
        app.applied_at || new Date().toISOString().split("T")[0],
      ]);
    });

    const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const filename = `${activeDrive?.company_name || "Campus"}_Shortlisted_Candidates_${new Date().toISOString().split("T")[0]}.csv`;
    downloadFile(filename, csvContent, "text/csv");

    setExportNotice(`Exported candidate shortlist for ${activeDrive?.company_name || "all drives"}.`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  // Create new drive handler
  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !roleTitle) return;
    setSaving(true);
    const res = await DataService.createCampusDrive({
      company_name: companyName,
      role_title: roleTitle,
      ctc_range: ctcRange,
      location,
      min_readiness_score: Number(minReadiness),
      allowed_departments: ["BCA", "B.Sc CS", "B.Sc IT", "MCA"],
      max_backlogs: 0,
      drive_date: driveDate,
      application_deadline: driveDate,
      status: "Upcoming",
      description: description || `Campus placement hiring drive for ${roleTitle} at ${companyName}.`,
    });

    if (res.success) {
      const refreshed = await DataService.getCampusDrives();
      setDrives(refreshed);
      if (res.drive) {
        setSelectedDriveId(res.drive.id);
      }
      setShowModal(false);
      setCompanyName("");
      setRoleTitle("");
      setDescription("");
      setExportNotice(`Campus Drive for ${companyName} posted successfully.`);
      setTimeout(() => setExportNotice(null), 5000);
    }
    setSaving(false);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-bold">
              TPO Placement Operations
            </span>
            <span className="text-[11px] text-[#85998D] font-mono">
              Placement Cell &bull; Campus Drives
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F5] mt-1">
            Campus Recruitment Drives
          </h1>
          <p className="text-xs text-[#99A9A0] font-sans mt-0.5">
            Post new placement drives, set eligibility filters, track applicants, and export shortlist rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportHrCsv}
            disabled={driveApps.length === 0}
            className="px-3.5 py-2 text-xs font-semibold bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] hover:border-[#2C4034] text-[#F4F7F5] rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#99A9A0]" />
            <span>Export Candidate Shortlist</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-xs font-bold bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] rounded-xl shadow-md shadow-[#9DFF00]/20 transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#070B09]" />
            <span>Post New Drive</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation Banner */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-medium text-emerald-300 flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{exportNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Campus Drives Horizontal Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-[#99A9A0] font-bold">
            Live Placement Drives ({drives.length})
          </div>
          <button
            onClick={() => setSelectedDriveId("ALL")}
            className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedDriveId === "ALL"
                ? "bg-[#9DFF00] text-[#070B09] font-bold"
                : "text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D]"
            }`}
          >
            View All Drives
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.map((d) => {
            const isSelected = selectedDriveId === d.id;
            const appCount = applications.filter((a) => a.drive_id === d.id).length;

            return (
              <div
                key={d.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedDriveId(d.id);
                  }
                }}
                onClick={() => setSelectedDriveId(d.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-[#121B16] border-[#9DFF00] ring-2 ring-[#9DFF00]/20 shadow-lg shadow-[#9DFF00]/5"
                    : "bg-[#0C120F] border-[#1E2C24] hover:border-[#2C4034] hover:bg-[#121B16]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#121B16] border border-[#1E2C24] text-[#D5E0D9] font-bold">
                      {d.status}
                    </span>
                    <h3 className="font-display text-base font-bold text-[#F4F7F5] mt-2">
                      {d.company_name}
                    </h3>
                    <p className="text-xs text-sky-300 font-semibold">{d.role_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono tabular-nums font-bold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/25">
                      {d.ctc_range}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E2C24] grid grid-cols-2 gap-2 text-xs text-[#99A9A0]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#85998D]" />
                    <span className="font-mono tabular-nums">{d.drive_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Users className="w-3.5 h-3.5 text-[#85998D]" />
                    <span className="font-bold font-mono tabular-nums text-[#F4F7F5]">{appCount} Applied</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] font-mono tabular-nums text-[#85998D] flex items-center justify-between">
                  <span>Min Readiness: {d.min_readiness_score}%</span>
                  <span>{d.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drive Candidates & Recruitment Pipeline */}
      <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] overflow-hidden">
        <div className="p-5 border-b border-[#1E2C24] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121B16]">
          <div>
            <h2 className="font-display text-base font-bold tracking-tight text-[#F4F7F5]">
              Registered Candidates & Pipeline Stages
            </h2>
            <p className="text-xs text-[#99A9A0] mt-0.5">
              Showing applicants for {selectedDriveId === "ALL" ? "All Drives" : activeDrive?.company_name || "Drive"}
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums font-bold px-3 py-1 bg-[#070B09] border border-[#1E2C24] rounded-xl text-[#D5E0D9]">
            {driveApps.length} Registered Applicants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121B16] border-b border-[#1E2C24] text-[#99A9A0] uppercase font-mono text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Roll No</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Readiness Score</th>
                <th className="px-5 py-3.5">Current Stage</th>
                <th className="px-5 py-3.5 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C24]">
              {driveApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#85998D] font-sans">
                    No candidates registered for this drive yet.
                  </td>
                </tr>
              ) : (
                driveApps.map((app) => {
                  const stud = students.find((s) => s.id === app.student_id);
                  const isEligible = (stud?.readiness_score || 0) >= (activeDrive?.min_readiness_score || 70);

                  return (
                    <tr key={app.id} className="hover:bg-[#18241D] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#F4F7F5]">{stud?.full_name || "Student"}</div>
                        <div className="text-[11px] text-[#85998D]">{stud?.email}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono tabular-nums text-[#D5E0D9] font-semibold">
                        {stud?.roll_no || "23BCA01"}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-[#99A9A0]">
                        {stud?.department || "BCA"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono tabular-nums font-bold text-xs ${
                              isEligible
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                : "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                            }`}
                          >
                            {stud?.readiness_score ?? 0}%
                          </span>
                          {isEligible && (
                            <span className="text-[10px] text-emerald-300 font-mono">Eligible</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/25">
                          {app.stage}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {app.stage === "Offer Extended" ? (
                          <span className="text-emerald-300 font-bold text-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Offer Placed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStage(app.id, app.stage)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#121B16] hover:bg-[#9DFF00] text-[#F4F7F5] hover:text-[#070B09] border border-[#2C4034] hover:border-[#9DFF00] transition-all active:scale-95 cursor-pointer"
                          >
                            Next Stage &rarr;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post New Drive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0C120F] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#1E2C24]">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-4">
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight text-[#F4F7F5]">Post New Campus Drive</h3>
                <p className="text-xs text-[#99A9A0] mt-0.5">
                  Publish a new placement opportunity for eligible students.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#121B16] hover:bg-[#18241D] border border-[#1E2C24] flex items-center justify-center text-[#99A9A0] hover:text-[#F4F7F5] cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-4 text-xs font-sans">
              <div>
                <label htmlFor="drive-company-name" className="block text-[#D5E0D9] font-semibold mb-1">Company Name</label>
                <input
                  id="drive-company-name"
                  name="companyName"
                  aria-label="Company Name"
                  type="text"
                  required
                  placeholder="e.g. Zoho Corporation, TCS, Cognizant"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="drive-role-title" className="block text-[#D5E0D9] font-semibold mb-1">Role Title</label>
                  <input
                    id="drive-role-title"
                    name="roleTitle"
                    aria-label="Role Title"
                    type="text"
                    required
                    placeholder="e.g. Associate Software Engineer"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="drive-ctc-range" className="block text-[#D5E0D9] font-semibold mb-1">CTC Package</label>
                  <input
                    id="drive-ctc-range"
                    name="ctcRange"
                    aria-label="CTC Package"
                    type="text"
                    placeholder="e.g. ₹5.5 - ₹8.0 LPA"
                    value={ctcRange}
                    onChange={(e) => setCtcRange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="drive-date" className="block text-[#D5E0D9] font-semibold mb-1">Drive Date</label>
                  <input
                    id="drive-date"
                    name="driveDate"
                    aria-label="Drive Date"
                    type="date"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="drive-min-readiness" className="block text-[#D5E0D9] font-semibold mb-1">Min Readiness (%)</label>
                  <input
                    id="drive-min-readiness"
                    name="minReadiness"
                    aria-label="Min Readiness"
                    type="number"
                    min={0}
                    max={100}
                    value={minReadiness}
                    onChange={(e) => setMinReadiness(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none text-xs font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="drive-location" className="block text-[#D5E0D9] font-semibold mb-1">Location</label>
                <input
                  id="drive-location"
                  name="location"
                  aria-label="Location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[#D5E0D9] font-semibold mb-1">Job Description &amp; Eligibility</label>
                <textarea
                  rows={3}
                  placeholder="Eligibility details, skills evaluated (Python, DSA, SQL), selection criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2C24]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#D5E0D9] font-semibold hover:bg-[#18241D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold shadow-md shadow-[#9DFF00]/20 cursor-pointer"
                >
                  {saving ? "Posting..." : "Publish Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
