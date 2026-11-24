"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AssessmentRegistry } from "@/lib/assessment-registry";
import { AssessmentService } from "@/lib/services/assessment-service";
import { DataService } from "@/lib/supabase/db";
import { Assessment, UserProfile } from "@/types";
import { AssessmentAttempt } from "@/types/assessment-attempt";
import {
  FileText,
  Clock,
  Search,
  ShieldCheck,
  Layers,
  Play,
  Award,
} from "lucide-react";

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const [, setCurrentUser] = useState<UserProfile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "teacher" | "modules" | "mnc">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLoading] = useState(true);

  const loadAssessments = async () => {
    const [list, user] = await Promise.all([
      AssessmentRegistry.syncFromCloud(),
      DataService.getCurrentUser(),
    ]);
    setAssessments(list);
    setCurrentUser(user);
    if (user && user.id !== "guest") {
      const atts = await AssessmentService.getStudentAttempts(user.id);
      setAttempts(atts);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAssessments();

    // Listen to localStorage or cross-tab updates when teacher publishes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "eqlv_dynamic_teacher_assessments") {
        loadAssessments();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const isTeacherCreated = a.id.startsWith("dynamic-");
      const isMnc = a.id.includes("unit-") || a.id.includes("mnc");
      const isModule = !isTeacherCreated && !isMnc;

      if (activeTab === "teacher" && !isTeacherCreated) return false;
      if (activeTab === "modules" && !isModule) return false;
      if (activeTab === "mnc" && !isMnc) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.target_college && a.target_college.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [assessments, activeTab, searchQuery]);

  const teacherAssessmentsCount = useMemo(() => {
    return assessments.filter((a) => a.id.startsWith("dynamic-")).length;
  }, [assessments]);

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30">
              Examination &amp; Proctored Lab
            </span>
            <span className="text-xs text-[#85998D] font-mono">&bull; Accredited Grading</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7F5]">
            Assessments &amp; Certification
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Take tests assigned by your faculty, verify curriculum competency, and prepare for placement drives.
          </p>
        </div>

        {/* Status Counter */}
        <div className="flex items-center gap-2">
          {teacherAssessmentsCount > 0 && (
            <div className="px-3.5 py-2 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#F4F7F5] text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse" />
              <span>{teacherAssessmentsCount} Faculty Test{teacherAssessmentsCount > 1 ? "s" : ""} Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All Assessments (${assessments.length})` },
            { id: "teacher", label: `Assigned by Faculty (${teacherAssessmentsCount})` },
            { id: "modules", label: "Curriculum Milestones" },
            { id: "mnc", label: "MNC Units (1-10)" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "all" | "teacher" | "modules" | "mnc")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#9DFF00] text-[#070B09]"
                    : "bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] hover:bg-[#121B16] hover:text-[#F4F7F5]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-2.5" />
          <input
            id="student-assessment-search"
            name="searchQuery"
            aria-label="Search test topics"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test topics..."
            className="w-full pl-10 pr-4 py-2 bg-[#070B09] border border-[#1E2C24] rounded-xl text-xs font-medium text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] transition-all"
          />
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-[#85998D] mx-auto" />
            <div className="text-sm font-bold text-[#F4F7F5]">No assessments found</div>
            <p className="text-xs text-[#99A9A0]">Select another filter tab or clear your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssessments.map((assessment) => {
              const isTeacher = assessment.id.startsWith("dynamic-");
              const isMnc = assessment.id.includes("unit-") || assessment.id.includes("mnc");

              // Check if student took this test
              const myAttempt = attempts.find(
                (att) => att.assessmentId === assessment.id || att.assessmentTitle === assessment.title
              );

              const problemCount = assessment.problems?.length || 5;
              const mcqCount = assessment.problems?.filter((p) => p.type === "mcq").length || 0;
              const codingCount = assessment.problems?.filter((p) => p.type === "coding").length || 0;

              return (
                <div
                  key={assessment.id}
                  className={`rounded-2xl bg-[#0C120F] border p-5 flex flex-col justify-between transition-all hover:border-[#2C4034] ${
                    isTeacher
                      ? "border-[#9DFF00]/45 ring-1 ring-[#9DFF00]/20"
                      : "border-[#1E2C24]"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Tag Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isTeacher ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#9DFF00] text-[#070B09]">
                            Faculty Assigned
                          </span>
                        ) : isMnc ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-teal-500/10 text-teal-300 border border-teal-500/25">
                            MNC Unit Test
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#121B16] text-[#D5E0D9] border border-[#1E2C24]">
                            Curriculum Milestone
                          </span>
                        )}

                        <span className="text-[10px] font-mono font-bold text-[#85998D]">
                          {assessment.target_college || "All Batches"}
                        </span>
                      </div>

                      {/* Proctoring Tag */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Proctored
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="font-display font-bold text-[#F4F7F5] text-base leading-snug">
                        {assessment.title}
                      </h3>
                      <p className="text-xs text-[#99A9A0] line-clamp-2 font-medium leading-relaxed">
                        {assessment.description}
                      </p>
                    </div>

                    {/* Specs Pill Matrix */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2C24] text-xs">
                      <div className="bg-[#121B16] p-2.5 rounded-xl border border-[#1E2C24] flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#9DFF00]" />
                        <div>
                          <div className="text-[10px] text-[#85998D] uppercase font-mono">Time Limit</div>
                          <div className="font-mono font-bold text-[#F4F7F5] tabular-nums">{assessment.duration_minutes || 60} Mins</div>
                        </div>
                      </div>

                      <div className="bg-[#121B16] p-2.5 rounded-xl border border-[#1E2C24] flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <div>
                          <div className="text-[10px] text-[#85998D] uppercase font-mono">Questions</div>
                          <div className="font-mono font-bold text-[#F4F7F5] tabular-nums">
                            {problemCount} Qs ({mcqCount} MCQ / {codingCount} Code)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prior Attempt Feedback */}
                    {myAttempt && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] uppercase font-mono font-bold text-emerald-300">
                            Attempt Completed
                          </div>
                          <div className="font-mono font-bold text-[#F4F7F5] text-sm tabular-nums">
                            Score: {myAttempt.score}% {myAttempt.passed ? "(Passed)" : "(Retake Advised)"}
                          </div>
                        </div>
                        <Award className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-4 border-t border-[#1E2C24] mt-4">
                    <button
                      type="button"
                      onClick={() => router.push(`/student/exam/${assessment.id}`)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                        myAttempt
                          ? "bg-[#121B16] hover:bg-[#18241D] text-[#F4F7F5] border border-[#2C4034]"
                          : "bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09]"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{myAttempt ? "Review or Retake Test" : "Start Assessment →"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
