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
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
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
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
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
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : p.difficulty === "Medium"
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-rose-500/10 text-rose-400 border-rose-500/20",
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
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20",
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#111114] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-12px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden text-slate-200"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#141418]">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search problems, students, assessments, or actions (⌘K)..."
                className="w-full bg-transparent pl-8 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
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
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? "bg-[#1f1f26] text-white"
                          : "text-slate-300 hover:bg-[#18181c]"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-indigo-600/30 text-indigo-400" : "bg-white/[0.04] text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-white truncate flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${item.badgeColor || "bg-white/5 border-white/10"}`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-slate-400 truncate">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono flex-shrink-0 pl-2">
                          <span>Jump</span>
                          <CornerDownLeft className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Shortcut Bar */}
            <div className="px-4 py-2 bg-[#0c0c0e] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-slate-400">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-slate-400">↵</kbd> to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-slate-400">ESC</kbd> to close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
