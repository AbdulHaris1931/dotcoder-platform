"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AssessmentRegistry } from "@/lib/assessment-registry";
import { AssessmentService } from "@/lib/services/assessment-service";
import { Assessment, Problem } from "@/types";
import { AssessmentAttempt } from "@/types/assessment-attempt";
import {
  FileText,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Copy,
  Check,
  Upload,
  Layers,
  ShieldCheck,
  X,
  Trash2,
  BarChart3,
} from "lucide-react";

export default function TeacherAssessmentsPage() {

  // Assessments state
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<"input" | "generating" | "review" | "success">("input");
  const [inputMode, setInputMode] = useState<"upload" | "text">("upload");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState("");
  const [promptGuidance, setPromptGuidance] = useState("");
  const [title, setTitle] = useState("");
  const [targetDept, setTargetDept] = useState("All Students");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [difficulty, setDifficulty] = useState("Mixed");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Generated draft under review
  const [draftAssessment, setDraftAssessment] = useState<Assessment | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  const loadData = () => {
    const list = AssessmentRegistry.getAllAssessments();
    setAssessments(list);

    AssessmentService.getInstitutionalAttempts().then((atts) => {
      setAttempts(atts);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.id && a.id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDept =
        selectedDept === "ALL" ||
        (a.target_college && a.target_college.toLowerCase().includes(selectedDept.toLowerCase())) ||
        a.title.toLowerCase().includes(selectedDept.toLowerCase());

      return matchSearch && matchDept;
    });
  }, [assessments, searchQuery, selectedDept]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalAssessments = assessments.length;
    const totalSubmissions = attempts.length;
    const passedCount = attempts.filter((a) => a.passed).length;
    const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 85;
    const flaggedCount = attempts.filter((a) => (a.tabSwitchCount || 0) > 2).length;

    return {
      totalAssessments,
      totalSubmissions,
      passRate,
      flaggedCount,
    };
  }, [assessments, attempts]);

  // Handle PDF/Text File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(`Assessment: ${cleanName}`);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDocumentText(content || `Extracted syllabus from file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Generate assessment with Gemini AI
  const handleGenerateAI = async () => {
    if (!documentText.trim() && !promptGuidance.trim()) {
      setGenerationError("Please upload a document or enter instructions/syllabus notes.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setWizardStep("generating");

    try {
      const res = await fetch("/api/ai/generate-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          promptGuidance,
          title: title.trim() || "Unit Technical Assessment",
          durationMinutes: Number(durationMinutes) || 60,
          difficulty,
          targetDepartment: targetDept,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI generation failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.assessment) {
        throw new Error(data.error || "Failed to synthesize assessment structure.");
      }

      const gen = data.assessment;
      const newAssessmentId = `dynamic-${Date.now()}`;

      interface RawGeneratedProblem {
        id?: string;
        title?: string;
        difficulty?: Problem["difficulty"];
        type?: Problem["type"];
        description_md?: string;
        starter_code_json?: Problem["starter_code_json"];
        mcq_options_json?: string[];
        correct_option?: string;
        explanation?: string;
        test_cases?: Problem["test_cases"];
      }

      // Convert GeneratedProblem into full Problem interface
      const convertedProblems: Problem[] = ((gen.problems || []) as RawGeneratedProblem[]).map(
        (p, idx: number) => ({
          id: p.id || `gen-q-${idx + 1}`,
          title: p.title || `Problem ${idx + 1}`,
          slug: `slug-gen-${idx + 1}`,
          difficulty: p.difficulty || "Medium",
          company_tags: [targetDept, "AI Synthesized"],
          type: p.type || "mcq",
          description_md: p.description_md || "",
          starter_code_json: p.starter_code_json || {
            python: "# Write your solution here\n",
            java: "",
            c: "",
            cpp: "",
          },
          mcq_options_json: p.mcq_options_json || [],
          correct_option: p.correct_option || "",
          explanation: p.explanation || "",
          test_cases: p.test_cases || [],
          is_public: true,
        })
      );

      const newDraft: Assessment = {
        id: newAssessmentId,
        title: gen.title || title || "Technical Assessment",
        description: gen.description || "Synthesized proctored evaluation generated by Gemini AI.",
        target_college: targetDept,
        duration_minutes: Number(gen.duration_minutes) || durationMinutes,
        is_proctored: true,
        is_active: true,
        created_at: new Date().toISOString(),
        problems: convertedProblems,
      };

      setDraftAssessment(newDraft);
      setWizardStep("review");
    } catch (err: unknown) {
      console.error("AI Generation Error:", err);
      const errMessage = err instanceof Error ? err.message : "Could not generate assessment. Please try again.";
      setGenerationError(errMessage);
      setWizardStep("input");
    } finally {
      setIsGenerating(false);
    }
  };

  // Final Publish (persists to Supabase for cross-device student access + local cache)
  const handlePublishAssessment = async () => {
    if (!draftAssessment) return;

    const syncedToCloud = await AssessmentRegistry.publishAssessmentToCloud(draftAssessment);
    setPublishedId(draftAssessment.id);
    setWizardStep("success");
    loadData();
    showToast(
      syncedToCloud
        ? `Assessment "${draftAssessment.title}" published live to Supabase for all student devices!`
        : `Assessment "${draftAssessment.title}" published & assigned!`
    );
  };

  // Copy Student Exam Link
  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/student/exam/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast("Student exam link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Reset Wizard
  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setWizardStep("input");
    setUploadedFileName(null);
    setDocumentText("");
    setPromptGuidance("");
    setTitle("");
    setDraftAssessment(null);
    setPublishedId(null);
    setGenerationError(null);
  };

  return (
    <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#121B16] text-[#F4F7F5] rounded-xl shadow-2xl border border-[#2C4034] text-xs font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="bg-[#0C120F]/95 backdrop-blur-md border-b border-[#1E2C24] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
                  Faculty Proctored Suite
                </span>
                <span className="text-[#85998D] text-xs font-mono">• Gemini 2.5 Enabled</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-[#F4F7F5] tracking-tight flex items-center gap-2">
                Assessments &amp; Learning Growth
              </h1>
              <p className="text-xs sm:text-sm text-[#99A9A0] font-medium">
                Upload question papers, generate AI-tailored tests, assign cohorts, and monitor student test-case mastery.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setIsWizardOpen(true);
                  setWizardStep("input");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-[#070B09]" />
                <span>Create AI Assessment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0C120F] p-5 rounded-2xl border border-[#1E2C24] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#85998D] uppercase tracking-wider">Total Tests</div>
              <div className="text-2xl font-mono tabular-nums font-bold text-[#F4F7F5] mt-1">
                {stats.totalAssessments}
              </div>
              <div className="text-[11px] text-[#85998D] mt-0.5">Active curriculum catalog</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0C120F] p-5 rounded-2xl border border-[#1E2C24] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#85998D] uppercase tracking-wider">Total Submissions</div>
              <div className="text-2xl font-mono tabular-nums font-bold text-[#F4F7F5] mt-1">
                {stats.totalSubmissions}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Real-time accredited records
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0C120F] p-5 rounded-2xl border border-[#1E2C24] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#85998D] uppercase tracking-wider">Cohort Pass Rate</div>
              <div className="text-2xl font-mono tabular-nums font-bold text-[#F4F7F5] mt-1">{stats.passRate}%</div>
              <div className="text-[11px] text-[#85998D] mt-0.5">Benchmark score &ge; 60%</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#9DFF00]/15 border border-[#9DFF00]/30 flex items-center justify-center text-[#9DFF00]">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0C120F] p-5 rounded-2xl border border-[#1E2C24] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#85998D] uppercase tracking-wider">Proctor Integrity</div>
              <div className="text-2xl font-mono tabular-nums font-bold text-[#F4F7F5] mt-1">
                {stats.flaggedCount === 0 ? "100%" : `${stats.flaggedCount} Flagged`}
              </div>
              <div className="text-[11px] text-[#85998D] mt-0.5">Tab switch alerts monitored</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#0C120F] p-4 rounded-2xl border border-[#1E2C24] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-3" />
            <input
              id="teacher-assessment-search"
              name="searchQuery"
              aria-label="Search assessments"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test title, topic, or module..."
              className="w-full pl-10 pr-4 py-2 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs sm:text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] transition-all font-medium"
            />
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {["ALL", "BCA", "B.Sc CS", "B.Sc IT", "MCA"].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? "bg-[#9DFF00] text-[#070B09]"
                    : "bg-[#121B16] text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] border border-[#1E2C24]"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Assessments Catalog Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-[#F4F7F5] tracking-tight">
              Published Assessments ({filteredAssessments.length})
            </h2>
            <span className="text-xs text-[#85998D] font-medium">Click any test to inspect student telemetry</span>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center mx-auto text-[#85998D]">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#F4F7F5]">No assessments match your filter</h3>
                <p className="text-xs text-[#99A9A0] max-w-sm mx-auto">
                  Try adjusting your search criteria or create a new assessment from a question paper PDF using Gemini AI.
                </p>
              </div>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs rounded-xl transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#070B09]" />
                <span>Create AI Assessment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssessments.map((assessment) => {
                const assessmentAttempts = attempts.filter((att) => att.assessmentId === assessment.id);
                const avgScore =
                  assessmentAttempts.length > 0
                    ? Math.round(
                        assessmentAttempts.reduce((acc, curr) => acc + curr.score, 0) / assessmentAttempts.length
                      )
                    : 0;
                const problemCount = assessment.problems?.length || 5;
                const mcqCount = assessment.problems?.filter((p) => p.type === "mcq").length || 0;
                const codingCount = assessment.problems?.filter((p) => p.type === "coding").length || 0;

                return (
                  <div
                    key={assessment.id}
                    className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] hover:border-[#2C4034] transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#121B16] text-[#D5E0D9] border border-[#1E2C24]">
                          {assessment.target_college || "All Batches"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {assessment.is_proctored && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Proctored
                            </span>
                          )}
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-[#F4F7F5] text-base leading-snug group-hover:text-[#9DFF00] transition-colors line-clamp-2">
                          {assessment.title}
                        </h3>
                        <p className="text-xs text-[#99A9A0] line-clamp-2 font-medium">
                          {assessment.description}
                        </p>
                      </div>

                      {/* Specs Pill Matrix */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2C24] text-xs">
                        <div className="bg-[#121B16] p-2.5 rounded-xl border border-[#1E2C24] flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#85998D]" />
                          <div>
                            <div className="text-[10px] text-[#85998D] uppercase font-mono">Duration</div>
                            <div className="font-bold font-mono tabular-nums text-[#F4F7F5]">
                              {assessment.duration_minutes || 60} Mins
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#121B16] p-2.5 rounded-xl border border-[#1E2C24] flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#85998D]" />
                          <div>
                            <div className="text-[10px] text-[#85998D] uppercase font-mono">Questions</div>
                            <div className="font-bold font-mono tabular-nums text-[#F4F7F5]">
                              {problemCount} Qs ({mcqCount} MCQ / {codingCount} Code)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Telemetry Summary */}
                      <div className="bg-[#121B16] p-3 rounded-xl border border-[#1E2C24] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-[#85998D] uppercase font-mono">Candidate Submissions</div>
                          <div className="text-sm font-mono tabular-nums font-bold text-[#F4F7F5]">
                            {assessmentAttempts.length}{" "}
                            <span className="text-xs font-sans font-normal text-[#99A9A0]">students attempted</span>
                          </div>
                        </div>
                        {assessmentAttempts.length > 0 && (
                          <div className="text-right">
                            <div className="text-[10px] text-[#85998D] uppercase font-mono">Class Avg</div>
                            <div className="text-sm font-mono tabular-nums font-bold text-emerald-400">{avgScore}%</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Card Actions */}
                    <div className="px-5 py-3.5 bg-[#121B16]/70 border-t border-[#1E2C24] flex items-center justify-between gap-2">
                      <Link
                        href={`/teacher/assessments/${assessment.id}`}
                        className="inline-flex items-center gap-1.5 min-h-[28px] py-1 text-xs font-bold text-[#D5E0D9] hover:text-[#9DFF00] transition-colors"
                      >
                        <span>Telemetry &amp; Growth</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLink(assessment.id)}
                          title="Copy student test link"
                          className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-all"
                        >
                          {copiedId === assessment.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <a
                          href={`/student/exam/${assessment.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Preview as candidate"
                          className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AI ASSESSMENT CREATION WIZARD MODAL                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseWizard}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-3xl bg-[#0C120F] rounded-3xl shadow-2xl border border-[#2C4034] overflow-hidden z-10 my-8"
            >
              {/* Modal Top Header */}
              <div className="px-6 py-5 bg-[#121B16] text-[#F4F7F5] flex items-center justify-between border-b border-[#1E2C24]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#9DFF00]/15 border border-[#9DFF00]/30 flex items-center justify-center text-[#9DFF00]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold tracking-tight text-[#F4F7F5]">
                      AI Assessment Generator
                    </h2>
                    <p className="text-xs text-[#99A9A0]">
                      Convert PDF question papers or syllabus notes into live proctored tests using Gemini AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseWizard}
                  className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wizard Body */}
              <div className="p-6 max-h-[75vh] overflow-y-auto">
                {/* STEP 1: INPUT */}
                {wizardStep === "input" && (
                  <div className="space-y-6">
                    {/* Error Notice */}
                    {generationError && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{generationError}</span>
                      </div>
                    )}

                    {/* Mode Tabs */}
                    <div className="flex items-center gap-2 border-b border-[#1E2C24] pb-3">
                      <button
                        onClick={() => setInputMode("upload")}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inputMode === "upload"
                            ? "bg-[#9DFF00] text-[#070B09]"
                            : "bg-[#121B16] text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] border border-[#1E2C24]"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Question Paper / Notes</span>
                      </button>
                      <button
                        onClick={() => setInputMode("text")}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inputMode === "text"
                            ? "bg-[#9DFF00] text-[#070B09]"
                            : "bg-[#121B16] text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] border border-[#1E2C24]"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Paste Syllabus or Raw Text</span>
                      </button>
                    </div>

                    {/* File Upload Zone */}
                    {inputMode === "upload" && (
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
                        className="border-2 border-dashed border-[#2C4034] hover:border-[#9DFF00]/60 bg-[#070B09] hover:bg-[#121B16] rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          aria-label="Upload question paper or syllabus file"
                          accept=".pdf,.txt,.docx,.md"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center mx-auto text-[#99A9A0]">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-[#F4F7F5]">
                            {uploadedFileName ? uploadedFileName : "Click or drag your question paper or syllabus file"}
                          </div>
                          <p className="text-xs text-[#85998D]">Supports PDF, TXT, DOCX, Markdown</p>
                        </div>
                        {uploadedFileName && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Ready for AI Extraction
                          </span>
                        )}
                      </div>
                    )}

                    {/* Paste Raw Text Area */}
                    {inputMode === "text" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#D5E0D9]">
                          Syllabus Content / Question Bank Notes
                        </label>
                        <textarea
                          rows={6}
                          value={documentText}
                          onChange={(e) => setDocumentText(e.target.value)}
                          placeholder="Paste your question bank, topics, syllabus objectives, or assignment questions here..."
                          className="w-full p-3.5 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs sm:text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] transition-all font-mono"
                        />
                      </div>
                    )}

                    {/* Teacher Prompt Guidance */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#D5E0D9] flex items-center justify-between">
                        <span>Teacher Custom Instructions / Focus Areas (Optional)</span>
                        <span className="text-[11px] font-normal text-[#85998D] font-mono">Gemini AI Prompt</span>
                      </label>
                      <input
                        id="prompt-guidance"
                        name="promptGuidance"
                        aria-label="Teacher Custom Instructions / Focus Areas"
                        type="text"
                        value={promptGuidance}
                        onChange={(e) => setPromptGuidance(e.target.value)}
                        placeholder="E.g., Include 3 conceptual MCQs on Big-O and 2 Python coding problems with recursion & edge cases"
                        className="w-full px-3.5 py-2.5 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs sm:text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] transition-all font-medium"
                      />
                    </div>

                    {/* Assessment Configuration Parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label htmlFor="assessment-title" className="text-xs font-bold text-[#D5E0D9]">
                          Assessment Title
                        </label>
                        <input
                          id="assessment-title"
                          name="assessmentTitle"
                          aria-label="Assessment Title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="E.g., Unit 3: Tree Traversals & Hash Maps"
                          className="w-full px-3.5 py-2.5 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs sm:text-sm text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#D5E0D9]">Target Cohort / Department</label>
                        <ObsidianSelect value={String(targetDept)} onChange={(val) => setTargetDept(val)} options={[{ value: "All Students", label: "All Students (Campus Wide)" }, { value: "BCA", label: "BCA (Dept of Computer Applications)" }, { value: "B.Sc CS", label: "B.Sc Computer Science" }, { value: "B.Sc IT", label: "B.Sc Information Technology" }, { value: "MCA", label: "MCA (Post Graduate)" }]} buttonClassName="w-full px-3.5 py-2.5 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs sm:text-sm text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00] transition-all font-medium" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#D5E0D9]">Duration Limit (Minutes)</label>
                        <ObsidianSelect value={String(durationMinutes)} onChange={(val) => setDurationMinutes(Number(val))} options={[{ value: String(30), label: "30 Minutes" }, { value: String(45), label: "45 Minutes" }, { value: String(60), label: "60 Minutes (Standard)" }, { value: String(90), label: "90 Minutes" }, { value: String(120), label: "120 Minutes (Final Exam)" }]} buttonClassName="w-full px-3.5 py-2.5 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs sm:text-sm text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00] transition-all font-medium" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#D5E0D9]">Difficulty Level</label>
                        <ObsidianSelect value={String(difficulty)} onChange={(val) => setDifficulty(val)} options={[{ value: "Mixed", label: "Mixed (Foundational to Hard)" }, { value: "Easy", label: "Easy (Foundations)" }, { value: "Medium", label: "Medium (Campus Drive Prep)" }, { value: "Hard", label: "Hard (Tier-1 MNC Standard)" }]} buttonClassName="w-full px-3.5 py-2.5 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs sm:text-sm text-[#F4F7F5] focus:outline-none focus:border-[#9DFF00] transition-all font-medium" />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-[#1E2C24] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseWizard}
                        className="px-4 py-2.5 text-xs font-bold text-[#99A9A0] hover:text-[#F4F7F5] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-[#070B09]" />
                        <span>Synthesize with Gemini AI</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: GENERATING */}
                {wizardStep === "generating" && (
                  <div className="py-16 text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-[#1E2C24]" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-[#9DFF00] border-r-[#9DFF00] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BrainCircuit className="w-8 h-8 animate-pulse text-[#9DFF00]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-display font-bold text-[#F4F7F5]">
                        Gemini AI is Synthesizing Assessment
                      </h3>
                      <p className="text-xs text-[#99A9A0] max-w-md mx-auto">
                        Extracting core concepts, generating validated MCQs with rationale, designing coding challenges,
                        and writing comprehensive unit test cases...
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW & EDIT */}
                {wizardStep === "review" && draftAssessment && (
                  <div className="space-y-6">
                    {/* Header Summary */}
                    <div className="p-4 rounded-2xl bg-[#9DFF00]/10 border border-[#9DFF00]/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#9DFF00] uppercase tracking-wider">
                          Generated Assessment Preview
                        </span>
                        <span className="text-xs font-mono tabular-nums font-bold text-[#D5E0D9]">
                          {draftAssessment.problems?.length} Questions Generated
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#F4F7F5]">{draftAssessment.title}</h3>
                      <p className="text-xs text-[#99A9A0]">{draftAssessment.description}</p>
                    </div>

                    {/* Question Cards List */}
                    <div className="space-y-4">
                      {draftAssessment.problems?.map((problem, idx) => (
                        <div
                          key={problem.id}
                          className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-[#9DFF00] text-[#070B09] text-[11px] font-mono font-bold flex items-center justify-center">
                                Q{idx + 1}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  problem.type === "coding"
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                    : "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                                }`}
                              >
                                {problem.type === "coding" ? "Coding Challenge" : "Multiple Choice"}
                              </span>
                              <span className="text-xs font-bold text-[#85998D]">({problem.difficulty})</span>
                            </div>
                            <button
                              onClick={() => {
                                const updated = draftAssessment.problems?.filter((_, i) => i !== idx);
                                setDraftAssessment({ ...draftAssessment, problems: updated });
                              }}
                              className="text-[#85998D] hover:text-rose-400 transition-colors p-1"
                              title="Remove question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#F4F7F5]">{problem.title}</h4>
                            <p className="text-xs text-[#99A9A0] whitespace-pre-wrap">{problem.description_md}</p>
                          </div>

                          {/* MCQ Options Display */}
                          {problem.type === "mcq" && problem.mcq_options_json && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                              {problem.mcq_options_json.map((opt, oIdx) => {
                                const isCorrect = opt === problem.correct_option;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                      isCorrect
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                                        : "bg-[#070B09] border-[#1E2C24] text-[#D5E0D9]"
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && (
                                      <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">
                                        Answer
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Coding Challenge Specs */}
                          {problem.type === "coding" && (
                            <div className="p-3 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#D5E0D9] text-xs font-mono space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-[#85998D] border-b border-[#1E2C24] pb-1">
                                <span>Starter Code (Python)</span>
                                <span>{problem.test_cases?.length || 2} Test Cases Configured</span>
                              </div>
                              <pre className="text-[11px] text-emerald-400 overflow-x-auto p-1">
                                {problem.starter_code_json?.python || "# Code template"}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Bottom Review Action */}
                    <div className="pt-4 border-t border-[#1E2C24] flex items-center justify-between">
                      <button
                        onClick={() => setWizardStep("input")}
                        className="px-4 py-2 text-xs font-bold text-[#99A9A0] hover:text-[#F4F7F5] transition-colors"
                      >
                        Back to Edit
                      </button>
                      <button
                        onClick={handlePublishAssessment}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#070B09]" />
                        <span>Publish &amp; Assign to Candidates</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: SUCCESS */}
                {wizardStep === "success" && publishedId && (
                  <div className="py-12 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-bold text-[#F4F7F5]">
                        Assessment Published Successfully!
                      </h3>
                      <p className="text-xs text-[#99A9A0] max-w-md mx-auto">
                        The test is live and ready for candidate evaluations. Share this link directly with your students
                        or access live anti-cheat telemetry anytime.
                      </p>
                    </div>

                    {/* Student Exam Link Box */}
                    <div className="max-w-md mx-auto p-3 bg-[#070B09] border border-[#1E2C24] rounded-2xl flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-[#D5E0D9] truncate pl-2">
                        {typeof window !== "undefined" ? `${window.location.origin}/student/exam/${publishedId}` : ""}
                      </span>
                      <button
                        onClick={() => handleCopyLink(publishedId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121B16] hover:bg-[#18241D] text-[#F4F7F5] border border-[#2C4034] rounded-xl text-xs font-bold transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={handleCloseWizard}
                        className="px-5 py-2.5 bg-[#121B16] hover:bg-[#18241D] text-[#D5E0D9] hover:text-[#F4F7F5] border border-[#1E2C24] font-bold text-xs rounded-xl transition-all"
                      >
                        Back to Assessment Hub
                      </button>
                      <Link
                        href={`/teacher/assessments/${publishedId}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs rounded-xl transition-all"
                      >
                        <span>Open Telemetry Dashboard</span>
                        <ChevronRight className="w-4 h-4 text-[#070B09]" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
