"use client";

import { useState, useRef, useEffect } from "react";
import { DemoStore, subscribeToDemoStore } from "@/lib/demo-store";
import { UserProfile } from "@/types";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ParsedStudentRow {
  full_name: string;
  roll_no: string;
  department: string;
  email: string;
  batch_year: number;
  isValid: boolean;
  errors: string[];
}

export default function BulkStudentOnboardingPage() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudents(DemoStore.getStudents());
    const unsub = subscribeToDemoStore(() => {
      setStudents(DemoStore.getStudents());
    });
    return unsub;
  }, []);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const parseCsvText = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setImportStatus("Error: CSV must contain a header and at least one data row.");
      return;
    }

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const requiredCols = ["full_name", "roll_no", "department", "email", "batch_year"];
    const missing = requiredCols.filter((col) => !header.includes(col));

    if (missing.length > 0) {
      setImportStatus(`Error: Missing required column headers: ${missing.join(", ")}`);
      return;
    }

    const colIdx = {
      full_name: header.indexOf("full_name"),
      roll_no: header.indexOf("roll_no"),
      department: header.indexOf("department"),
      email: header.indexOf("email"),
      batch_year: header.indexOf("batch_year"),
    };

    const existingRolls = new Set(students.map((s) => (s.roll_no || "").toUpperCase()));
    const seenRollsInFile = new Set<string>();

    const rows: ParsedStudentRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      if (parts.length < 5) continue;

      const full_name = parts[colIdx.full_name] || "";
      const roll_no = parts[colIdx.roll_no] || "";
      const department = parts[colIdx.department] || "";
      const email = parts[colIdx.email] || "";
      const batch_year = parseInt(parts[colIdx.batch_year], 10) || 2026;

      const errors: string[] = [];

      if (!full_name) errors.push("Missing name");
      if (!roll_no) errors.push("Missing roll number");
      else if (existingRolls.has(roll_no.toUpperCase())) {
        errors.push(`Duplicate roll no (already in campus db)`);
      } else if (seenRollsInFile.has(roll_no.toUpperCase())) {
        errors.push(`Duplicate roll no (repeated in file)`);
      } else {
        seenRollsInFile.add(roll_no.toUpperCase());
      }

      if (!email || !validateEmail(email)) {
        errors.push(`Invalid email format`);
      }

      if (!department) errors.push("Missing department");

      rows.push({
        full_name,
        roll_no,
        department,
        email,
        batch_year,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedRows(rows);
    setImportStatus(null);
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setImportStatus("Please upload a valid .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadValid = () => {
    const valid = parsedRows.filter((r) => r.isValid);
    if (valid.length === 0) return;

    const res = DemoStore.addStudents(valid);
    setImportStatus(`Success! Successfully enrolled ${res.added} candidate(s) into Cauvery Institute.`);
    setParsedRows([]);
  };

  const handleLoadSampleCsv = () => {
    const sample = `full_name,roll_no,department,email,batch_year
Sanjay Venkat,22CS088,CSE,sanjay.22cs@cauvery.edu.in,2026
Meena Krishnan,22IT044,IT,meena.22it@cauvery.edu.in,2026
Harish Sundar,22EC055,ECE,harish.22ec@cauvery.edu.in,2026
Invalid Student,22CS001,CSE,bad-email-format,2026
Duplicate Batch,22IT044,IT,dup@cauvery.edu.in,2026`;
    parseCsvText(sample);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === "ALL" || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const validRowCount = parsedRows.filter((r) => r.isValid).length;
  const invalidRowCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Placement Cell • Roster Manager
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Cauvery Institute of Technology, Thanjavur (CIT-TN)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Bulk Student Onboarding & CSV Validator
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Import engineering candidate batches via CSV with client-side schema validation and duplicate checks.
          </p>
        </div>

        <button
          onClick={handleLoadSampleCsv}
          className="px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          <span>Load Test CSV with Validation Errors</span>
        </button>
      </div>

      {/* Drag & Drop Area & Live Validation Inspector */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[240px] ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                : "border-white/[0.1] hover:border-white/[0.2] bg-[#111114]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/20 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="font-semibold text-white text-sm">
              Click to browse or drop CSV
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Required: <code className="text-indigo-400">full_name, roll_no, department, email, batch_year</code>
            </p>
          </div>

          {importStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                importStatus.startsWith("Success")
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
              }`}
            >
              {importStatus.startsWith("Success") ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Validation Inspector Table */}
        <div className="lg:col-span-2 card-obsidian rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Live CSV Inspector & Validation Previews
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Verify invalid entries before writing to institutional profiles.
              </p>
            </div>

            {parsedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {validRowCount} Valid
                </span>
                {invalidRowCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {invalidRowCount} Errors
                  </span>
                )}
                <button
                  onClick={handleUploadValid}
                  disabled={validRowCount === 0}
                  className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  Commit {validRowCount} Valid Rows
                </button>
              </div>
            )}
          </div>

          {parsedRows.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-400" />
              No CSV staged. Drag a file or click <strong>Load Test CSV with Validation Errors</strong> above.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[280px]">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] font-mono uppercase text-slate-500 border-b border-white/[0.06] sticky top-0 bg-[#111114]">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Roll No</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Dept</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Validation Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.isValid
                          ? "hover:bg-white/[0.02]"
                          : "bg-rose-500/[0.04] text-rose-200 border-l-2 border-rose-500"
                      }
                    >
                      <td className="p-2.5">
                        {row.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </td>
                      <td className="p-2.5 font-mono font-semibold">{row.roll_no}</td>
                      <td className="p-2.5">{row.full_name}</td>
                      <td className="p-2.5 font-mono">{row.department}</td>
                      <td className="p-2.5 font-mono">{row.email}</td>
                      <td className="p-2.5 font-mono">
                        {row.isValid ? (
                          <span className="text-emerald-400">Ready for database</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">
                            {row.errors.join(", ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Currently Enrolled Students Roster */}
      <div className="card-obsidian rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Active Enrolled Candidates ({students.length})
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Cauvery Institute of Technology, Thanjavur • 2026 Placement Batch
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidate or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#141418] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1.5 px-3 text-xs bg-[#141418] border border-white/[0.08] rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mech">Mech</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono uppercase text-slate-500 border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-3">Roll No</th>
                <th className="py-3 px-3">Candidate Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Campus Email</th>
                <th className="py-3 px-3">Readiness</th>
                <th className="py-3 px-3">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 font-mono font-semibold text-white">{s.roll_no}</td>
                  <td className="py-3.5 px-3 font-medium text-white">{s.full_name}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {s.department}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{s.batch_year}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{s.email || "-"}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2 font-mono">
                      <div className="w-14 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.readiness_score >= 75
                              ? "bg-emerald-400"
                              : s.readiness_score >= 60
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${s.readiness_score}%` }}
                        />
                      </div>
                      <span className="text-white tabular-nums font-semibold">{s.readiness_score}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        s.readiness_score >= 75
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : s.readiness_score >= 60
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {s.readiness_score >= 75
                        ? "Ready"
                        : s.readiness_score >= 60
                        ? "Needs Practice"
                        : "At-Risk"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
