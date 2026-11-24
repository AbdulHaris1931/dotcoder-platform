"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DemoStore } from "@/lib/demo-store";
import { generatePlacementCsv, downloadFile } from "@/lib/utils";
import { canRoleAccessPath, NormalizedRole } from "@/lib/auth/rbac-routes";
import {
  Search,
  Code2,
  ShieldCheck,
  Users,
  Download,
  GraduationCap,
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
  icon: React.ComponentType<{ className?: string }>;
  requiredPath?: string;
  allowedRoles?: NormalizedRole[];
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  userRole = "student",
}: {
  isOpen: boolean;
  onClose: () => void;
  userRole?: NormalizedRole;
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
      id: "act-drives-student",
      category: "Actions",
      title: "Campus Placement Drives",
      subtitle: "Zoho, TCS, Cognizant, Infosys recruitment openings",
      icon: Briefcase,
      badge: "4 Active",
      badgeColor: "bg-[#9DFF00]/15 text-[#9DFF00] border-[#9DFF00]/30",
      requiredPath: "/student/drives",
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
      requiredPath: "/student/resume",
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
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      requiredPath: "/student/exam/22222222-0000-0000-0000-000000000001/simulator",
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
      requiredPath: "/tpo/drives",
      action: () => {
        router.push("/tpo/drives");
        onClose();
      },
    },
    {
      id: "act-tpo-teachers",
      category: "Actions",
      title: "Track Faculty & Mentors",
      subtitle: "Department mentoring loads, assignments published, and batch pass benchmarks",
      icon: GraduationCap,
      requiredPath: "/tpo/teachers",
      action: () => {
        router.push("/tpo/teachers");
        onClose();
      },
    },
    {
      id: "act-problems",
      category: "Actions",
      title: "Manage Question Bank",
      subtitle: "Add new coding problems, starter codes, and test cases",
      icon: Code2,
      requiredPath: "/admin/problems",
      action: () => {
        router.push("/admin/problems");
        onClose();
      },
    },
    {
      id: "act-assessments",
      category: "Actions",
      title: "Faculty Assessments & Tests",
      subtitle: "Configure proctored exams and AI assessment suites",
      icon: ShieldCheck,
      requiredPath: "/teacher/assessments",
      action: () => {
        router.push("/teacher/assessments");
        onClose();
      },
    },
    {
      id: "act-csv",
      category: "Actions",
      title: "Export NAAC / Placement Audit CSV",
      subtitle: "Instant download of accreditation benchmark dataset",
      badge: "NAAC 5.2.1",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: Download,
      allowedRoles: ["tpo", "super_admin"],
      action: () => {
        const csv = generatePlacementCsv(students, DemoStore.getSubmissions());
        downloadFile(`NAAC_Placement_Audit_CIT_${Date.now()}.csv`, csv);
        onClose();
      },
    },
    {
      id: "act-onboarding",
      category: "Actions",
      title: "Student Roster Management",
      subtitle: "View and manage cohort onboarding status",
      icon: FileSpreadsheet,
      requiredPath: "/tpo/students",
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
      badgeColor: "bg-[#9DFF00]/15 text-[#9DFF00] border-[#9DFF00]/30",
      icon: ShieldCheck,
      requiredPath: `/student/exam/${assessment.id}`,
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
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : p.difficulty === "Medium"
          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
          : "bg-rose-500/15 text-rose-300 border-rose-500/30",
      icon: Code2,
      requiredPath: `/practice/${p.slug || p.id}`,
      action: () => {
        router.push(`/practice/${p.slug || p.id}`);
        onClose();
      },
    })),

    // Students (only visible to TPO / Teacher / Super Admin)
    ...students.map((s) => ({
      id: `stud-${s.id}`,
      category: "Students" as const,
      title: `${s.full_name} (${s.roll_no})`,
      subtitle: `${s.department} • Readiness: ${s.readiness_score}%`,
      badge: s.readiness_score >= 75 ? "Ready" : "Practice",
      badgeColor:
        s.readiness_score >= 75
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: Users,
      allowedRoles: ["tpo", "teacher", "super_admin"] as NormalizedRole[],
      action: () => {
        router.push(userRole === "teacher" ? "/teacher/students" : "/tpo/dashboard");
        onClose();
      },
    })),
  ];

  // Role-filter + Query-filter
  const roleScopedItems = allItems.filter((item) => {
    if (item.allowedRoles && !item.allowedRoles.includes(userRole)) return false;
    if (item.requiredPath && !canRoleAccessPath(userRole, item.requiredPath)) return false;
    return true;
  });

  const filteredItems = roleScopedItems.filter((item) => {
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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#0C120F] border border-[#2C4034] shadow-obsidian rounded-2xl overflow-hidden text-[#F4F7F5]"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-5 py-4 border-b border-[#1E2C24] bg-[#0A0F0C]">
              <Search className="w-4 h-4 text-[#85998D] absolute left-5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                name="command-search"
                aria-label="Search problems, students, assessments, or actions"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search problems, students, assessments, or actions (⌘K)..."
                className="w-full bg-transparent pl-8 pr-12 text-sm text-[#F4F7F5] placeholder-[#85998D] focus:outline-none font-medium"
              />
              <button
                type="button"
                aria-label="Close command palette"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#85998D] font-medium">
                  No matching results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                        isSelected
                          ? "bg-[#121B16] text-[#F4F7F5] font-semibold ring-1 ring-[#9DFF00]/40"
                          : "text-[#99A9A0] hover:bg-[#121B16]/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? "bg-[#9DFF00] text-[#070B09]" : "bg-[#121B16] border border-[#1E2C24] text-[#99A9A0]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-[#F4F7F5] truncate flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || "bg-[#121B16] text-[#99A9A0] border-[#1E2C24]"}`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-[#85998D] truncate mt-0.5 font-sans font-normal">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] text-[#9DFF00] font-mono font-bold flex-shrink-0 pl-2">
                          <span>Jump</span>
                          <CornerDownLeft className="w-3.5 h-3.5 text-[#9DFF00]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Shortcut Bar */}
            <div className="px-5 py-2.5 bg-[#0A0F0C] border-t border-[#1E2C24] flex items-center justify-between text-[11px] text-[#85998D] font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-[#121B16] border border-[#2C4034] text-[#F4F7F5] font-bold">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-[#121B16] border border-[#2C4034] text-[#F4F7F5] font-bold">↵</kbd> to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-[#121B16] border border-[#2C4034] text-[#F4F7F5] font-bold">ESC</kbd> to close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
