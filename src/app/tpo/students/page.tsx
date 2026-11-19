"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  TrendingUp,
  Target,
  GraduationCap,
  X,
  UploadCloud,
  CheckCircle2,
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
  const router = useRouter();
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
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
            progress: Math.min(100, Math.round((s.readiness_score || 70) * 0.9)),
            readiness: Math.round(s.readiness_score || 75),
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
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === "All" || s.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, departmentFilter]);

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
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-7 font-sans">
      {/* Top Header matching Screen 07 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, monitor and track all student records.
          </p>
        </div>

        {/* Lime Green Add Student Button matching Screen 07 */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold text-xs transition-all shadow-xs active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>Add Student</span>
        </button>
      </div>

      {/* 3 KPI Cards matching Screen 07 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Students */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#9DFF00]/20 flex items-center justify-center flex-shrink-0 text-[#17251B]">
            <Users className="w-6 h-6 text-[#17251B]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              1,248
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total Students
            </div>
          </div>
        </div>

        {/* Active Learners */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              982
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Active Learners
            </div>
          </div>
        </div>

        {/* Placement Ready */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              817
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Placement Ready
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar matching Screen 07 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, roll no, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9DFF00] shadow-2xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-700 shadow-2xs">
            <span className="text-slate-400">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="BCA">BCA</option>
              <option value="B.Sc CS">B.Sc CS</option>
              <option value="B.Sc IT">B.Sc IT</option>
              <option value="MCA">MCA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table matching Screen 07 */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F9FAF8] text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-0" />
                </th>
                <th className="p-4 font-semibold">Roll No.</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Progress</th>
                <th className="p-4 font-semibold">Readiness</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {pagedStudents.map((student) => (
                <tr
                  key={student.rollNo}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-0" />
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-600">
                    {student.rollNo}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {student.name}
                  </td>
                  <td className="p-4 text-slate-600">
                    {student.department}
                  </td>
                  <td className="p-4 w-44">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#9DFF00] h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#9DFF00]/20 text-[#17251B] border border-[#9DFF00]/40 font-bold">
                      {student.readiness}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(student)}
                        title="View profile telemetry drawer"
                        className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(student)}
                        title="Edit student"
                        className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(student)}
                        title="More options"
                        className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
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

        {/* Table Pagination Footer matching Screen 07 */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-sans">
          <span>
            Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, filteredStudents.length)} of 1,248
          </span>

          {/* Numbered Pill Pagination */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
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
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-[#9DFF00] text-black shadow-2xs"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 3 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? "bg-[#9DFF00] text-black font-bold"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 23BCA025"
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#9DFF00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya R."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#9DFF00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#9DFF00]"
                >
                  <option value="BCA">BCA</option>
                  <option value="B.Sc CS">B.Sc CS</option>
                  <option value="B.Sc IT">B.Sc IT</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-black font-bold shadow-xs"
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
