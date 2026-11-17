"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore } from "@/lib/demo-store";
import { generatePlacementCsv, downloadFile } from "@/lib/utils";
import {
  Search,
  Code2,
  ShieldCheck,
  Users,
  Download,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  X,
  FileSpreadsheet,
  Briefcase,
  Award,
  Trophy,
} from "lucide-react";

interface CommandItem {
  id: string;
  category: "Problems" | "Assessments" | "Students" | "Actions";
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon: any;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const problems = DemoStore.getProblems();
  const students = DemoStore.getStudents();
  const assessment = DemoStore.getAssessment();

  // Build searchable items list
  const allItems: CommandItem[] = [
    // Quick Actions
    {
      id: "act-student",
      category: "Actions",
      title: "Switch to Student Workspace",
      subtitle: "Adithya K. Sundaram • CSE • Roll 22CS001",
      icon: GraduationCap,
      action: () => {
        DemoStore.switchRole("student");
        router.push("/student/dashboard");
        onClose();
      },
    },
    {
      id: "act-tpo",
      category: "Actions",
      title: "Switch to Admin / Placement Command",
      subtitle: "Executive Analytics • College Filter • Leaderboards",
      icon: Building2,
      action: () => {
        DemoStore.switchRole("tpo");
        router.push("/admin/dashboard");
        onClose();
      },
    },
    {
      id: "act-drives-student",
      category: "Actions",
      title: "Campus Placement Drives",
      subtitle: "Zoho, TCS, Cognizant, Infosys recruitment openings",
      icon: Briefcase,
      badge: "4 Active",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      action: () => {
        router.push("/student/drives");
        onClose();
      },
    },
    {
      id: "act-resume",
      category: "Actions",
      title: "Verified Placement Resume",
      subtitle: "ATS-optimized 1-page resume with verified readiness QR",
      icon: Award,
      action: () => {
        router.push("/student/resume");
        onClose();
      },
    },
    {
      id: "act-simulator",
      category: "Actions",
      title: "TCS NQT National Simulator",
      subtitle: "Multi-section proctored mock exam (Quant, Logic, Coding)",
      icon: Trophy,
      badge: "Mock Pattern",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      action: () => {
        router.push("/student/exam/22222222-0000-0000-0000-000000000001/simulator");
        onClose();
      },
    },
    {
      id: "act-admin-drives",
      category: "Actions",
      title: "Manage Drives & Hiring Pipeline",
      subtitle: "TPO applicant progression & 1-click HR shortlist export",
      icon: Briefcase,
      action: () => {
        router.push("/admin/drives");
        onClose();
      },
    },
    {
      id: "act-problems",
      category: "Actions",
      title: "Manage Question Bank",
      subtitle: "Add new coding problems, starter codes, and test cases",
      icon: Code2,
      action: () => {
        router.push("/admin/problems");
        onClose();
      },
    },
    {
      id: "act-assessments",
      category: "Actions",
      title: "Proctored Assessments Manager",
      subtitle: "Configure national mock exams and anti-cheat settings",
      icon: ShieldCheck,
      action: () => {
        router.push("/admin/assessments");
        onClose();
      },
    },
    {
      id: "act-csv",
      category: "Actions",
      title: "Export NAAC / Placement Audit CSV",
      subtitle: "Instant download of accreditation benchmark dataset",
      badge: "NAAC 5.2.1",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Download,
      action: () => {
        const csv = generatePlacementCsv(students, DemoStore.getSubmissions());
        downloadFile(`NAAC_Placement_Audit_CIT_${Date.now()}.csv`, csv);
        onClose();
      },
    },
    {
      id: "act-onboarding",
      category: "Actions",
      title: "Bulk Student Onboarding",
      subtitle: "Drag & drop CSV parser with live schema validation",
      icon: FileSpreadsheet,
      action: () => {
        router.push("/tpo/students");
        onClose();
      },
    },

    // Assessments
    {
      id: "asm-mock",
      category: "Assessments",
      title: assessment.title,
      subtitle: `${assessment.duration_minutes} Mins • Anti-Cheat Proctored Suite`,
      badge: "Active",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: ShieldCheck,
      action: () => {
        router.push(`/student/exam/${assessment.id}`);
        onClose();
      },
    },

    // Coding Problems
    ...problems.map((p) => ({
      id: `prob-${p.id}`,
      category: "Problems" as const,
      title: p.title,
      subtitle: p.company_tags.join(", "),
      badge: p.difficulty,
      badgeColor:
        p.difficulty === "Easy"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : p.difficulty === "Medium"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-rose-50 text-rose-700 border-rose-200",
      icon: Code2,
      action: () => {
        router.push(`/student/lab/${p.slug}`);
        onClose();
      },
    })),

    // Students
    ...students.map((s) => ({
      id: `stud-${s.id}`,
      category: "Students" as const,
      title: `${s.full_name} (${s.roll_no})`,
      subtitle: `${s.department} • Readiness: ${s.readiness_score}%`,
      badge: s.readiness_score >= 75 ? "Ready" : "Practice",
      badgeColor:
        s.readiness_score >= 75
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
      icon: Users,
      action: () => {
        router.push("/tpo/dashboard");
        onClose();
      },
    })),
  ];

  // Filter items by query
  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 font-sans">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white border border-slate-200/90 shadow-2xl rounded-3xl overflow-hidden text-slate-900"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <Search className="w-4 h-4 text-slate-400 absolute left-5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search problems, students, assessments, or actions (⌘K)..."
                className="w-full bg-transparent pl-8 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No matching results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer text-xs transition-all ${
                        isSelected
                          ? "bg-indigo-50/90 text-indigo-950 font-semibold ring-1 ring-indigo-200"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 truncate flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm ${item.badgeColor || "bg-slate-100 text-slate-600 border-slate-200"}`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5 font-sans font-normal">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-mono font-bold flex-shrink-0 pl-2">
                          <span>Jump</span>
                          <CornerDownLeft className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Shortcut Bar */}
            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-xs">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-xs">↵</kbd> to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-xs">ESC</kbd> to close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
