"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { SuperAdminService } from "@/lib/services/super-admin-service";
import { downloadFile } from "@/lib/utils";
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Search,
  Users,
  ArrowRight,
  Check,
} from "lucide-react";

interface CleanedStudent {
  full_name: string;
  roll_no: string;
  email: string;
  department: string;
  batch_year: number;
  college_name: string;
}

const SAMPLE_CSV_TEMPLATE = `Full Name,Roll Number,Email Address,Department,Batch Year,College Name
Karthik S,23BCA01,karthik.bca@avc.edu.in,BCA,2026,Annai Vailankanni Arts and Science College Thanjavur
Priya Dharshini M,23BCS014,priya.cs@avc.edu.in,B.Sc CS,2026,Annai Vailankanni Arts and Science College Thanjavur
Saravanan V,23BIT008,saravanan.it@avc.edu.in,B.Sc IT,2026,Annai Vailankanni Arts and Science College Thanjavur
Divya Bharathi K,24MCA005,divya.mca@avc.edu.in,MCA,2025,Annai Vailankanni Arts and Science College Thanjavur
Vignesh R,23BCA02,vignesh.bca@avc.edu.in,BCA,2026,Annai Vailankanni Arts and Science College Thanjavur`;

export default function SuperAdminBulkImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form & File Input States
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [defaultCollege, setDefaultCollege] = useState(
    "Annai Vailankanni Arts and Science College, Thanjavur"
  );
  const [defaultBatch, setDefaultBatch] = useState(2026);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  // AI Processing States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    source: string;
    aiConfidence: number;
    detectedMappings: Record<string, string>;
    students: CleanedStudent[];
  } | null>(null);

  // Search in preview
  const [previewSearch, setPreviewSearch] = useState("");
  const [filterDuplicateState, setFilterDuplicateState] = useState<"ALL" | "NEW" | "DUPLICATE">("ALL");

  // Provisioning Execution States
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    skipped: number;
    total: number;
  } | null>(null);

  // 1-Click Download Official Sample CSV Template
  const handleDownloadTemplate = () => {
    downloadFile("template_students_import.csv", SAMPLE_CSV_TEMPLATE, "text/csv");
  };

  // Handle file selection from drag-and-drop or file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  // Trigger Gemini AI CSV Analysis
  const handleAnalyzeWithAi = async () => {
    if (!csvText.trim()) {
      setErrorMsg("Please upload a CSV file or paste spreadsheet data first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAiResult(null);
    setImportSummary(null);

    try {
      const res = await fetch("/api/ai/parse-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent: csvText,
          defaultCollege,
          defaultBatch,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze CSV spreadsheet.");
      }

      setAiResult({
        source: data.source || "gemini_ai",
        aiConfidence: data.aiConfidence || 95,
        detectedMappings: data.detectedMappings || {},
        students: data.students || [],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while analyzing the CSV.";
      setErrorMsg(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Compute duplicate status against existing user database
  const studentAnalysis = useMemo(() => {
    if (!aiResult) return [];
    const allUsers = SuperAdminService.getAllUsers();
    const existingEmails = new Set(allUsers.map((u) => u.email?.toLowerCase().trim()).filter(Boolean));
    const existingRolls = new Set(allUsers.map((u) => u.roll_no?.toUpperCase().trim()).filter(Boolean));

    return aiResult.students.map((s) => {
      const isEmailDup = existingEmails.has(s.email.toLowerCase().trim());
      const isRollDup = existingRolls.has(s.roll_no.toUpperCase().trim());
      const isDuplicate = isEmailDup || isRollDup;

      return {
        ...s,
        isDuplicate,
        duplicateReason: isRollDup ? "Roll Number already registered" : isEmailDup ? "Email already registered" : null,
      };
    });
  }, [aiResult]);

  const totalParsed = studentAnalysis.length;
  const netNewCount = studentAnalysis.filter((s) => !s.isDuplicate).length;
  const duplicateCount = studentAnalysis.filter((s) => s.isDuplicate).length;

  const filteredPreviewStudents = useMemo(() => {
    return studentAnalysis.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(previewSearch.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(previewSearch.toLowerCase()) ||
        s.department.toLowerCase().includes(previewSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(previewSearch.toLowerCase());

      const matchesDup =
        filterDuplicateState === "ALL"
          ? true
          : filterDuplicateState === "NEW"
          ? !s.isDuplicate
          : s.isDuplicate;

      return matchesSearch && matchesDup;
    });
  }, [studentAnalysis, previewSearch, filterDuplicateState]);

  const [provisionedCredentials, setProvisionedCredentials] = useState<
    Array<{
      full_name: string;
      email: string;
      roll_no: string;
      department: string;
      temp_password: string;
    }>
  >([]);

  const handleDownloadProvisionedCredentials = () => {
    if (provisionedCredentials.length === 0) return;
    const header = "Full_Name,Roll_No,Email,Department,Temporary_Password";
    const rows = provisionedCredentials.map(
      (c) =>
        `"${c.full_name.replace(/"/g, '""')}","${c.roll_no}","${c.email}","${c.department}","${c.temp_password}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EQLV_Provisioned_Student_Credentials_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Execute Final Batch Import in 25-user chunks so 400-500 student imports never hit Vercel Free 504 timeouts
  const [importProgressLabel, setImportProgressLabel] = useState<string>("");

  const handleConfirmImport = async () => {
    if (!aiResult || netNewCount === 0) return;
    setIsProvisioning(true);
    setErrorMsg(null);
    setImportProgressLabel(`0 / ${aiResult.students.length}`);

    try {
      const allMapped = aiResult.students.map((s) => ({
        fullName: s.full_name,
        email: s.email,
        role: "student",
        department: s.department,
        rollNo: s.roll_no,
        batchYear: s.batch_year,
        collegeName: s.college_name,
      }));

      const CHUNK_SIZE = 25;
      let totalImported = 0;
      let totalSkipped = 0;
      let usedDemoFallback = false;
      const allCreds: Array<{
        full_name: string;
        email: string;
        roll_no: string;
        department: string;
        temp_password: string;
      }> = [];

      for (let offset = 0; offset < allMapped.length; offset += CHUNK_SIZE) {
        const slice = allMapped.slice(offset, offset + CHUNK_SIZE);
        setImportProgressLabel(
          `${Math.min(offset + slice.length, allMapped.length)} / ${allMapped.length}`
        );

        const apiRes = await fetch("/api/super-admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ users: slice }),
        });

        const apiData = await apiRes.json().catch(() => ({}));
        if (apiRes.ok && apiData.success) {
          totalImported += Number(apiData.imported) || 0;
          totalSkipped += Number(apiData.skipped) || 0;
          if (Array.isArray(apiData.credentials)) {
            allCreds.push(...apiData.credentials);
          }
          continue;
        }

        if (apiRes.status === 503 || apiData.mode === "local_demo_fallback") {
          usedDemoFallback = true;
          break;
        }

        setErrorMsg(apiData.error || "Live batch provisioning failed.");
        setIsProvisioning(false);
        return;
      }

      if (!usedDemoFallback) {
        setProvisionedCredentials(allCreds);
        SuperAdminService.bulkImportStudents(aiResult.students);
        setImportSummary({
          imported: totalImported,
          skipped: totalSkipped,
          total: aiResult.students.length,
        });
        setIsProvisioning(false);
        return;
      }

      // Local Demo Mode fallback when SUPABASE_SERVICE_ROLE_KEY is unconfigured
      const result = SuperAdminService.bulkImportStudents(aiResult.students);
      setImportSummary({
        imported: result.imported,
        skipped: result.skipped,
        total: result.total,
      });
    } catch (err) {
      console.error("Bulk provisioning failed:", err);
      setErrorMsg("Failed to provision student accounts. Please check your data.");
    } finally {
      setIsProvisioning(false);
      setImportProgressLabel("");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-2 sm:px-4 py-4 space-y-8 font-sans text-[#F4F7F5] select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/super-admin/users"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#99A9A0] hover:text-[#F4F7F5] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Users</span>
            </Link>
            <span className="text-[#2C4034]">&bull;</span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 font-bold">
              AI Data Engine
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5] mt-1.5 flex flex-wrap items-center gap-2.5">
            <span>AI-Powered Bulk Student Import</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#9DFF00] text-[#070B09]">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini AI
            </span>
          </h1>
          <p className="text-xs text-[#99A9A0] mt-1 max-w-2xl">
            Upload any college roster spreadsheet. Gemini AI automatically understands column variations, maps fields, generates student credentials, and skips duplicates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-4 py-2 text-xs font-semibold bg-[#0C120F] hover:bg-[#121B16] border border-[#1E2C24] hover:border-[#2C4034] text-[#F4F7F5] rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#9DFF00]" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Success Banner */}
      {importSummary && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-[#F4F7F5] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#9DFF00] text-[#070B09] flex items-center justify-center font-bold">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#F4F7F5]">
                  Bulk Provisioning Complete
                </h3>
                <p className="text-xs text-emerald-300">
                  {importSummary.imported} net-new student accounts have been created in the system database.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {provisionedCredentials.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadProvisionedCredentials}
                  className="px-4 py-2 rounded-xl bg-[#0C120F] hover:bg-[#121B16] border border-[#2C4034] text-[#9DFF00] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Credentials CSV</span>
                </button>
              )}
              <Link
                href="/super-admin/users?role=STUDENT"
                className="px-4 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>View All Students</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="p-3.5 bg-[#0C120F] rounded-xl border border-[#1E2C24]">
              <span className="text-[#99A9A0] block text-[10px]">SUCCESSFULLY IMPORTED</span>
              <strong className="text-[#9DFF00] text-lg font-bold tabular-nums">{importSummary.imported} Students</strong>
            </div>
            <div className="p-3.5 bg-[#0C120F] rounded-xl border border-[#1E2C24]">
              <span className="text-[#99A9A0] block text-[10px]">DUPLICATES SAFELY SKIPPED</span>
              <strong className="text-amber-300 text-lg font-bold tabular-nums">{importSummary.skipped} Existing</strong>
            </div>
            <div className="p-3.5 bg-[#0C120F] rounded-xl border border-[#1E2C24]">
              <span className="text-[#99A9A0] block text-[10px]">INITIAL CREDENTIALS</span>
              <strong className="text-[#F4F7F5] text-sm font-bold">Auto-Generated CSV</strong>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload or Paste CSV */}
      {!importSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 surface-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#F4F7F5]">Step 1: Provide Student Data</h2>
                <p className="text-xs text-[#99A9A0] mt-0.5">
                  Upload your institution&apos;s spreadsheet file or paste raw rows.
                </p>
              </div>

              <div className="flex items-center p-1 bg-[#070B09] rounded-xl border border-[#1E2C24] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-[#9DFF00] text-[#070B09] font-bold"
                      : "text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "paste"
                      ? "bg-[#9DFF00] text-[#070B09] font-bold"
                      : "text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  Paste CSV
                </button>
              </div>
            </div>

            {activeTab === "upload" ? (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  fileName
                    ? "border-[#9DFF00]/60 bg-[#9DFF00]/5"
                    : "border-[#2C4034] hover:border-[#9DFF00]/50 hover:bg-[#121B16]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="csv-file-input"
                  name="csvFile"
                  aria-label="Upload CSV or TXT file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-[#121B16] border border-[#1E2C24] text-[#9DFF00] flex items-center justify-center mx-auto mb-3">
                  {fileName ? (
                    <FileSpreadsheet className="w-7 h-7 text-[#9DFF00]" />
                  ) : (
                    <UploadCloud className="w-7 h-7 text-[#9DFF00]" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#F4F7F5]">
                    {fileName ? fileName : "Click to browse or drag & drop CSV file"}
                  </p>
                  <p className="text-xs text-[#99A9A0]">
                    Supports .CSV, .TXT (comma, tab, or semicolon separated values)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="paste-csv-rows" className="block text-xs font-semibold text-[#99A9A0] mb-1.5">
                  Paste Spreadsheet Rows (including header line):
                </label>
                <textarea
                  id="paste-csv-rows"
                  rows={8}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    setFileName(null);
                  }}
                  placeholder="Full Name,Roll Number,Email Address,Department,Batch Year&#10;Karthik S,23BCA01,karthik@avc.edu.in,BCA,2026&#10;Priya Dharshini M,23BCS014,priya@avc.edu.in,B.Sc CS,2026"
                  className="w-full p-4 rounded-2xl border border-[#1E2C24] font-mono text-xs text-[#F4F7F5] placeholder-[#85998D] focus:outline-none focus:border-[#9DFF00]/60 bg-[#070B09]"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#99A9A0] font-mono">
                {csvText.trim() ? `${csvText.split(/\r?\n/).filter((l) => l.trim()).length} lines detected` : "No data provided yet"}
              </span>

              <button
                type="button"
                onClick={handleAnalyzeWithAi}
                disabled={isAnalyzing || !csvText.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Gemini AI is analyzing schema...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#070B09]" />
                    <span>Analyze &amp; Validate with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-card rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#99A9A0] font-bold">
                Batch &amp; College Configuration
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label htmlFor="default-college" className="block text-[#F4F7F5] font-semibold mb-1">
                    Institution / College Name
                  </label>
                  <input
                    id="default-college"
                    name="defaultCollege"
                    aria-label="Institution or College Name"
                    type="text"
                    value={defaultCollege}
                    onChange={(e) => setDefaultCollege(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-xs focus:outline-none focus:border-[#9DFF00]/60"
                  />
                </div>

                <div>
                  <label htmlFor="default-batch" className="block text-[#F4F7F5] font-semibold mb-1">
                    Graduating Batch Year
                  </label>
                  <input
                    id="default-batch"
                    name="defaultBatch"
                    aria-label="Graduating Batch Year"
                    type="number"
                    value={defaultBatch}
                    onChange={(e) => setDefaultBatch(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-xs font-mono focus:outline-none focus:border-[#9DFF00]/60"
                  />
                </div>
              </div>
            </div>

            <div className="surface-card-elevated rounded-3xl p-6 space-y-3 border border-[#2C4034]">
              <div className="flex items-center gap-2 text-[#9DFF00] font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Normalization Engine</span>
              </div>
              <p className="text-xs text-[#99A9A0] leading-relaxed">
                Never worry about column order or naming differences:
              </p>
              <ul className="text-xs text-[#99A9A0] space-y-1.5 list-disc pl-4">
                <li>Understands messy names: <code className="text-[#9DFF00] font-mono">RegNo</code>, <code className="text-[#9DFF00] font-mono">Dept</code>, <code className="text-[#9DFF00] font-mono">YOP</code>.</li>
                <li>Generates missing emails as <code className="text-[#9DFF00] font-mono">&lt;roll&gt;@avc.edu.in</code>.</li>
                <li>Auto-detects duplicates and keeps existing user data intact.</li>
                <li>Provisions secure credentials with one-click export CSV.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: AI Analysis & Pre-Import Review Table */}
      {aiResult && !importSummary && (
        <div className="surface-card rounded-3xl overflow-hidden space-y-6 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2C24] pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Schema Inference: {aiResult.aiConfidence}% Confidence</span>
                </span>
                <span className="text-xs font-mono text-[#85998D]">
                  Engine: {aiResult.source === "gemini_ai" ? "Gemini 2.5 Flash" : "Heuristic Normalizer"}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-[#F4F7F5]">
                Step 2: Review Normalized Student Roster
              </h2>
              <p className="text-xs text-[#99A9A0]">
                Verify detected fields and preview student records before finalizing provisioning.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAiResult(null)}
                className="px-4 py-2 rounded-xl border border-[#1E2C24] bg-[#070B09] text-[#99A9A0] hover:text-[#F4F7F5] font-semibold text-xs cursor-pointer"
              >
                Cancel / Re-Upload
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isProvisioning || netNewCount === 0}
                className="px-6 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-extrabold text-xs flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
              >
                {isProvisioning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>
                      Provisioning {importProgressLabel ? `(${importProgressLabel})` : "Accounts..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-[#070B09]" />
                    <span>Confirm &amp; Provision {netNewCount} Students</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070B09] border border-[#1E2C24] space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#99A9A0] font-bold block">
              AI Detected Column Mappings:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(aiResult.detectedMappings).map(([orig, mapped]) => (
                <div
                  key={orig}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#121B16] border border-[#1E2C24] text-xs font-mono"
                >
                  <span className="text-[#85998D] line-through text-[11px]">{orig}</span>
                  <span className="text-[#85998D]">&rarr;</span>
                  <strong className="text-[#9DFF00] font-bold">{mapped}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#99A9A0] font-bold">
                Total Rows Detected
              </span>
              <div className="font-display text-2xl font-bold text-[#F4F7F5] tabular-nums">{totalParsed}</div>
              <p className="text-[11px] text-[#85998D]">From uploaded spreadsheet</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                Net-New Candidates (Ready)
              </span>
              <div className="font-display text-2xl font-bold text-[#9DFF00] tabular-nums">{netNewCount}</div>
              <p className="text-[11px] text-emerald-300/80">Ready for live Supabase Auth provisioning</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                Existing Duplicates (Will Skip)
              </span>
              <div className="font-display text-2xl font-bold text-amber-300 tabular-nums">{duplicateCount}</div>
              <p className="text-[11px] text-amber-300/80">Existing rolls/emails protected</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="preview-search"
                name="previewSearch"
                aria-label="Search candidate in preview"
                type="text"
                placeholder="Search candidate in preview..."
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#1E2C24] focus:outline-none focus:border-[#9DFF00]/60 bg-[#070B09] text-[#F4F7F5]"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterDuplicateState("ALL")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterDuplicateState === "ALL" ? "bg-[#9DFF00] text-[#070B09] font-bold" : "text-[#99A9A0]"
                }`}
              >
                All ({studentAnalysis.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterDuplicateState("NEW")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterDuplicateState === "NEW" ? "bg-[#9DFF00] text-[#070B09] font-bold" : "text-[#99A9A0]"
                }`}
              >
                Ready to Import ({netNewCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterDuplicateState("DUPLICATE")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterDuplicateState === "DUPLICATE" ? "bg-[#9DFF00] text-[#070B09] font-bold" : "text-[#99A9A0]"
                }`}
              >
                Duplicates ({duplicateCount})
              </button>
            </div>
          </div>

          <div className="border border-[#1E2C24] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F0C] border-b border-[#1E2C24] text-[#85998D] uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Institutional Email</th>
                  <th className="px-4 py-3">Credential Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2C24]">
                {filteredPreviewStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#85998D]">
                      No student records match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPreviewStudents.slice(0, 50).map((s, idx) => (
                    <tr
                      key={s.roll_no + idx}
                      className={s.isDuplicate ? "bg-amber-500/5" : "hover:bg-[#121B16]/70"}
                    >
                      <td className="px-4 py-3">
                        {s.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Skip Duplicate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Ready
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#F4F7F5]">{s.full_name}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#F4F7F5]">{s.roll_no}</td>
                      <td className="px-4 py-3 text-[#99A9A0]">{s.department}</td>
                      <td className="px-4 py-3 font-mono text-[#99A9A0]">{s.batch_year}</td>
                      <td className="px-4 py-3 font-mono text-[#99A9A0]">{s.email}</td>
                      <td className="px-4 py-3 font-mono text-[#9DFF00] font-bold">Auto-Generated</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredPreviewStudents.length > 50 && (
            <div className="text-center text-xs font-mono text-[#85998D] pt-2">
              Showing first 50 of {filteredPreviewStudents.length} candidates. All will be processed upon confirmation.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
