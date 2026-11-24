"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useEffect, useMemo } from "react";
import { DataService } from "@/lib/supabase/db";
import { UserProfile, Submission } from "@/types";
import { StudentDrawer } from "@/components/tpo/student-drawer";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Target,
  GraduationCap,
  X,
  Download,
} from "lucide-react";

interface StudentRecord {
  id?: string;
  rollNo: string;
  name: string;
  department: string;
  progress: number;
  readiness: number;
  email?: string;
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "a0000000-0000-0000-0000-000000000002",
    rollNo: "23BCA001",
    name: "Karthik S.",
    department: "BCA",
    progress: 78,
    readiness: 88,
    email: "karthik.bca@avc.edu.in",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    rollNo: "23BCS014",
    name: "Priya Dharshini M.",
    department: "B.Sc CS",
    progress: 72,
    readiness: 92,
    email: "priya.cs@avc.edu.in",
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    rollNo: "23BIT008",
    name: "Saravanan V.",
    department: "B.Sc IT",
    progress: 76,
    readiness: 76,
    email: "saravanan.it@avc.edu.in",
  },
  {
    id: "a0000000-0000-0000-0000-000000000005",
    rollNo: "24MCA005",
    name: "Divya Bharathi K.",
    department: "MCA",
    progress: 88,
    readiness: 88,
    email: "divya.mca@avc.edu.in",
  },
];

export default function StudentManagementPage() {
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [minReadinessFilter, setMinReadinessFilter] = useState("0");
  const [showAddModal, setShowAddModal] = useState(false);
  const [drawerStudent, setDrawerStudent] = useState<UserProfile | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // New Student Form State
  const [newRollNo, setNewRollNo] = useState("");
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("BCA");

  useEffect(() => {
    async function loadData() {
      try {
        const [studs, subs] = await Promise.all([
          DataService.getStudents(),
          DataService.getSubmissions(),
        ]);
        setSubmissions(subs);
        if (studs && studs.length > 0) {
          const mapped: StudentRecord[] = studs.map((s) => ({
            id: s.id,
            rollNo: s.roll_no || "23BCA01",
            name: s.full_name,
            department: s.department || "BCA",
            progress: Math.min(100, Math.round((s.readiness_score ?? 0) * 0.9)),
            readiness: Math.round(s.readiness_score ?? 0),
            email: s.email,
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.warn("Failed to load students data:", err);
      }
    }
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const minScore = Number(minReadinessFilter) || 0;
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === "All" || s.department === departmentFilter;
      const matchesReadiness = s.readiness >= minScore;
      return matchesSearch && matchesDept && matchesReadiness;
    });
  }, [students, searchQuery, departmentFilter, minReadinessFilter]);

  const handleExportShortlistCsv = () => {
    const headers = ["Roll No", "Student Name", "Department", "Email", "Progress (%)", "Readiness (%)"];
    const escapeCell = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
    const rows = filteredStudents.map((s) =>
      [
        s.rollNo,
        s.name,
        s.department,
        s.email || `${s.rollNo.toLowerCase()}@avc.edu.in`,
        s.progress,
        s.readiness,
      ]
        .map(escapeCell)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eqlv-placement-shortlist-${departmentFilter.toLowerCase().replace(/\s+/g, "-")}-min${minReadinessFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pagedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleOpenDrawer = (record: StudentRecord) => {
    const profile: UserProfile = {
      id: record.id || `stud-${record.rollNo}`,
      full_name: record.name,
      roll_no: record.rollNo,
      department: record.department,
      readiness_score: record.readiness,
      email: record.email || `${record.rollNo.toLowerCase()}@avc.edu.in`,
      role: "student",
      college_name: "Annai Vailankanni Arts and Science College, Thanjavur",
      batch_year: 2026,
    };
    setDrawerStudent(profile);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo || !newName) return;
    const added: StudentRecord = {
      id: `new-${Date.now()}`,
      rollNo: newRollNo,
      name: newName,
      department: newDept,
      progress: 60,
      readiness: 70,
      email: `${newRollNo.toLowerCase()}@avc.edu.in`,
    };
    setStudents((prev) => [added, ...prev]);
    setShowAddModal(false);
    setNewRollNo("");
    setNewName("");
  };

  return (
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-7 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F5]">
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Manage, monitor and track all student records.
          </p>
        </div>

        {/* Lime Green Add Student Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs transition-all shadow-md shadow-[#9DFF00]/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#070B09] stroke-[3]" />
          <span>Add Student</span>
        </button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Students */}
        <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/25 flex items-center justify-center flex-shrink-0 text-[#9DFF00]">
            <Users className="w-6 h-6 text-[#9DFF00]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#F4F7F5] font-mono tabular-nums tracking-tight">
              1,248
            </div>
            <div className="text-xs text-[#99A9A0] font-medium">
              Total Students
            </div>
          </div>
        </div>

        {/* Active Learners */}
        <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center flex-shrink-0 text-sky-300">
            <GraduationCap className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#F4F7F5] font-mono tabular-nums tracking-tight">
              982
            </div>
            <div className="text-xs text-[#99A9A0] font-medium">
              Active Learners
            </div>
          </div>
        </div>

        {/* Placement Ready */}
        <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-300">
            <Target className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#F4F7F5] font-mono tabular-nums tracking-tight">
              817
            </div>
            <div className="text-xs text-[#99A9A0] font-medium">
              Placement Ready
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            aria-label="Search by name, roll no, or department"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, roll no, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none"
          />
        </div>

        {/* Dropdowns & 1-Click Recruiter Shortlist Export */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-[#070B09] border border-[#1E2C24] px-3 py-2 rounded-xl text-[#D5E0D9]">
            <span className="text-[#85998D]">Department:</span>
            <ObsidianSelect value={String(departmentFilter)} onChange={(val) => {
                setDepartmentFilter(val);
                setCurrentPage(1);
              }} options={[{ value: "All", label: "All" }, { value: "BCA", label: "BCA" }, { value: "B.Sc CS", label: "B.Sc CS" }, { value: "B.Sc IT", label: "B.Sc IT" }, { value: "MCA", label: "MCA" }]} buttonClassName="bg-[#070B09] font-semibold text-[#F4F7F5] focus:outline-none cursor-pointer" />
          </div>

          <div className="flex items-center gap-1.5 bg-[#070B09] border border-[#1E2C24] px-3 py-2 rounded-xl text-[#D5E0D9]">
            <span className="text-[#85998D]">Min Readiness:</span>
            <ObsidianSelect
              value={minReadinessFilter}
              onChange={(val) => {
                setMinReadinessFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "0", label: "All Scores" },
                { value: "60", label: ">= 60%" },
                { value: "70", label: ">= 70%" },
                { value: "80", label: ">= 80%" },
                { value: "90", label: ">= 90%" },
              ]}
              buttonClassName="bg-[#070B09] font-semibold text-[#F4F7F5] focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleExportShortlistCsv}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-2 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] hover:border-[#9DFF00]/50 text-xs font-mono font-bold text-[#9DFF00] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Shortlist CSV ({filteredStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2C24] bg-[#121B16] text-[#99A9A0] font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" name="select-all" aria-label="Select all students" className="rounded border-[#2C4034] bg-[#070B09] accent-[#9DFF00] focus:ring-0" />
                </th>
                <th className="p-4 font-semibold">Roll No.</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Progress</th>
                <th className="p-4 font-semibold">Readiness</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C24] text-[#D5E0D9]">
              {pagedStudents.map((student) => (
                <tr
                  key={student.rollNo}
                  className="hover:bg-[#18241D] transition-colors"
                >
                  <td className="p-4 text-center">
                    <input type="checkbox" name={`select-${student.rollNo}`} aria-label={`Select student ${student.name}`} className="rounded border-[#2C4034] bg-[#070B09] accent-[#9DFF00] focus:ring-0" />
                  </td>
                  <td className="p-4 font-mono tabular-nums font-medium text-[#99A9A0]">
                    {student.rollNo}
                  </td>
                  <td className="p-4 font-semibold text-[#F4F7F5]">
                    {student.name}
                  </td>
                  <td className="p-4 text-[#99A9A0]">
                    {student.department}
                  </td>
                  <td className="p-4 w-44">
                    <div className="w-full bg-[#121B16] border border-[#1E2C24] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#9DFF00] h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-4 font-mono tabular-nums font-bold">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30 font-bold">
                      {student.readiness}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-[#85998D]">
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(student)}
                        title="View profile telemetry drawer"
                        aria-label={`View profile telemetry for ${student.name}`}
                        className="inline-flex items-center justify-center min-w-[28px] min-h-[28px] p-1 text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] rounded-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(student)}
                        title="Edit student"
                        aria-label={`Edit ${student.name}`}
                        className="inline-flex items-center justify-center min-w-[28px] min-h-[28px] p-1 text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] rounded-md transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(student)}
                        title="More options"
                        aria-label={`More options for ${student.name}`}
                        className="inline-flex items-center justify-center min-w-[28px] min-h-[28px] p-1 text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] rounded-md transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-[#1E2C24] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#99A9A0] font-sans">
          <span className="font-mono tabular-nums">
            Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredStudents.length)} of 1,248
          </span>

          {/* Numbered Pill Pagination */}
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg bg-[#121B16] border border-[#1E2C24] flex items-center justify-center text-[#D5E0D9] hover:bg-[#18241D] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
              const p = i + 1;
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#9DFF00] text-[#070B09]"
                      : "hover:bg-[#18241D] text-[#99A9A0]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 3 && (
              <>
                <span className="px-1 text-[#85998D]">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === totalPages
                      ? "bg-[#9DFF00] text-[#070B09] font-bold"
                      : "hover:bg-[#18241D] text-[#99A9A0]"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-lg bg-[#121B16] border border-[#1E2C24] flex items-center justify-center text-[#D5E0D9] hover:bg-[#18241D] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0C120F] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#1E2C24] space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
              <h3 className="font-display text-base font-bold tracking-tight text-[#F4F7F5]">Add New Student</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#85998D] hover:text-[#F4F7F5] hover:bg-[#18241D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Roll Number</label>
                <input
                  type="text"
                  name="rollNo"
                  aria-label="Roll Number"
                  required
                  placeholder="e.g. 23BCA025"
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] font-mono text-xs focus:border-[#9DFF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  aria-label="Full Name"
                  required
                  placeholder="e.g. Ananya R."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] text-xs focus:border-[#9DFF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Department</label>
                <ObsidianSelect value={String(newDept)} onChange={(val) => setNewDept(val)} options={[{ value: "BCA", label: "BCA" }, { value: "B.Sc CS", label: "B.Sc CS" }, { value: "B.Sc IT", label: "B.Sc IT" }, { value: "MCA", label: "MCA" }]} buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-xs focus:border-[#9DFF00] focus:outline-none" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#D5E0D9] hover:bg-[#18241D] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold shadow-md shadow-[#9DFF00]/20 cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Telemetry Slide-Over Drawer */}
      <StudentDrawer
        student={drawerStudent}
        submissions={submissions}
        onClose={() => setDrawerStudent(null)}
      />
    </div>
  );
}
