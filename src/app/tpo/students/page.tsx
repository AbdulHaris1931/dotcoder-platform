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
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
              Placement Cell • Roster Manager
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Cauvery Institute of Technology, Thanjavur (CIT-TN)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Bulk Student Onboarding & CSV Validator
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Import engineering candidate batches via CSV with client-side schema validation and duplicate checks.
          </p>
        </div>

        <button
          onClick={handleLoadSampleCsv}
          className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center gap-2 shadow-sm hover:border-slate-300 active:scale-[0.98]"
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
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
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[240px] shadow-sm ${
              dragActive
                ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-200 shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-900 text-sm">
              Click to browse or drop CSV
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Required: <code className="text-indigo-600 font-bold">full_name, roll_no, department, email, batch_year</code>
            </p>
          </div>

          {importStatus && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-mono flex items-center gap-2.5 shadow-sm ${
                importStatus.startsWith("Success")
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {importStatus.startsWith("Success") ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Validation Inspector Table */}
        <div className="lg:col-span-2 card-luxury rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live CSV Inspector & Validation Previews
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Verify invalid entries before writing to institutional profiles.
              </p>
            </div>

            {parsedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {validRowCount} Valid
                </span>
                {invalidRowCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {invalidRowCount} Errors
                  </span>
                )}
                <button
                  onClick={handleUploadValid}
                  disabled={validRowCount === 0}
                  className="ml-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  Commit {validRowCount} Valid Rows
                </button>
              </div>
            )}
          </div>

          {parsedRows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-600" />
              No CSV staged. Drag a file or click <strong>Load Test CSV with Validation Errors</strong> above.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[280px]">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200 sticky top-0 bg-white">
                  <tr>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Roll No</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Dept</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Validation Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.isValid
                          ? "hover:bg-slate-50/80"
                          : "bg-rose-50/70 text-rose-900 border-l-4 border-rose-500"
                      }
                    >
                      <td className="p-2.5">
                        {row.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{row.roll_no}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{row.full_name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{row.department}</td>
                      <td className="p-2.5 font-mono text-slate-600">{row.email}</td>
                      <td className="p-2.5 font-mono">
                        {row.isValid ? (
                          <span className="text-emerald-700 font-semibold">Ready for database</span>
                        ) : (
                          <span className="text-rose-700 font-bold">
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
      <div className="card-luxury rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Active Enrolled Candidates ({students.length})
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Cauvery Institute of Technology, Thanjavur • 2026 Placement Batch
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidate or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56 shadow-sm"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm"
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
            <thead className="text-[11px] font-mono uppercase text-slate-500 bg-slate-50/80 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{s.roll_no}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{s.full_name}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {s.department}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">{s.batch_year}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">{s.email || "-"}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2 font-mono">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            s.readiness_score >= 75
                              ? "bg-emerald-500"
                              : s.readiness_score >= 60
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${s.readiness_score}%` }}
                        />
                      </div>
                      <span className="text-slate-900 tabular-nums font-bold">{s.readiness_score}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                        s.readiness_score >= 75
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : s.readiness_score >= 60
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
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
