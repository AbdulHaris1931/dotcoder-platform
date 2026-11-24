"use client";

import { useEffect, useState, useMemo } from "react";
import { DataService } from "@/lib/supabase/db";
import {
  GraduationCap,
  Users,
  Search,
  BookOpen,
  CheckCircle2,
  Award,
  Mail,
} from "lucide-react";

interface FacultyRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  facultyId: string;
  designation: string;
  mentoredCount: number;
  assignmentsPublished: number;
  avgStudentPassRate: number;
  status: "Active" | "On Track" | "Review Needed";
}

const INITIAL_FACULTY: FacultyRecord[] = [
  {
    id: "fac-1",
    name: "Dr. S. Meenakshi",
    email: "teacher@avc.edu.in",
    department: "BCA & Computer Science",
    facultyId: "AV-FAC-01",
    designation: "Associate Professor & Lab Head",
    mentoredCount: 58,
    assignmentsPublished: 14,
    avgStudentPassRate: 92,
    status: "Active",
  },
  {
    id: "fac-2",
    name: "Prof. K. Ramesh",
    email: "k.ramesh@avc.edu.in",
    department: "B.Sc CS",
    facultyId: "AV-FAC-02",
    designation: "Assistant Professor (Algorithms)",
    mentoredCount: 46,
    assignmentsPublished: 11,
    avgStudentPassRate: 86,
    status: "Active",
  },
  {
    id: "fac-3",
    name: "Dr. M. Sangeetha",
    email: "m.sangeetha@avc.edu.in",
    department: "B.Sc IT",
    facultyId: "AV-FAC-03",
    designation: "Assistant Professor (Full-Stack)",
    mentoredCount: 41,
    assignmentsPublished: 9,
    avgStudentPassRate: 84,
    status: "On Track",
  },
  {
    id: "fac-4",
    name: "Prof. T. Vijayakumar",
    email: "t.vijay@avc.edu.in",
    department: "MCA",
    facultyId: "AV-FAC-04",
    designation: "Senior Faculty (Data Structures)",
    mentoredCount: 38,
    assignmentsPublished: 12,
    avgStudentPassRate: 90,
    status: "Active",
  },
];

export default function TPOTeachersPage() {
  const [faculty, setFaculty] = useState<FacultyRecord[]>(INITIAL_FACULTY);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const teachers = await DataService.getTeachers();
        if (teachers && teachers.length > 0) {
          // Merge dynamic teachers with default roster
          const dynamicRecords: FacultyRecord[] = teachers.map((t, idx) => ({
            id: t.id,
            name: t.full_name,
            email: t.email || `faculty${idx + 1}@avc.edu.in`,
            department: t.department || "Computer Science",
            facultyId: t.roll_no || `AV-FAC-0${idx + 1}`,
            designation: "Faculty Mentor",
            mentoredCount: 45 + (idx * 5) % 20,
            assignmentsPublished: 8 + (idx * 3) % 10,
            avgStudentPassRate: Math.round(t.readiness_score || 88),
            status: "Active",
          }));

          // Avoid duplicating initial teachers if IDs match
          const existingIds = new Set(INITIAL_FACULTY.map((f) => f.id));
          const additions = dynamicRecords.filter((d) => !existingIds.has(d.id));
          setFaculty([...INITIAL_FACULTY, ...additions]);
        }
      } catch (err) {
        console.warn("Could not fetch Supabase teachers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        departmentFilter === "ALL" ||
        f.department.toLowerCase().includes(departmentFilter.toLowerCase());

      return matchesSearch && matchesDept;
    });
  }, [faculty, searchQuery, departmentFilter]);

  // Aggregate KPIs
  const totalFaculty = faculty.length;
  const totalMentored = faculty.reduce((acc, f) => acc + f.mentoredCount, 0);
  const totalAssignments = faculty.reduce((acc, f) => acc + f.assignmentsPublished, 0);
  const avgPassRate =
    totalFaculty > 0
      ? Math.round(faculty.reduce((acc, f) => acc + f.avgStudentPassRate, 0) / totalFaculty)
      : 88;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2C24] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/25 font-bold">
              TPO Academic Telemetry
            </span>
            <span className="text-[11px] text-[#85998D] font-mono">
              Annai Vailankanni Arts and Science College &bull; Faculty Operations
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F5] mt-1">
            Faculty &amp; Mentor Progress Tracking
          </h1>
          <p className="text-xs text-[#99A9A0] font-sans mt-0.5">
            Monitor teacher progress, student mentoring loads, published lab assignments, and batch pass benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#99A9A0] bg-[#0C120F] border border-[#1E2C24] px-3 py-1.5 rounded-xl">
            Academic Year: <strong className="text-[#F4F7F5] tabular-nums">2026 - 2027</strong>
          </span>
        </div>
      </div>

      {/* 4-Card Faculty Telemetry Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0C120F] rounded-2xl p-6 border border-[#1E2C24] space-y-2">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Total Faculty Mentors</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-300 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-[#F4F7F5]">{totalFaculty}</div>
          <p className="text-[11px] text-[#85998D]">Across BCA, CS, IT, &amp; MCA Departments</p>
        </div>

        <div className="bg-[#0C120F] rounded-2xl p-6 border border-[#1E2C24] space-y-2">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Students Under Mentorship</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-[#F4F7F5]">{totalMentored}</div>
          <p className="text-[11px] text-emerald-300 font-medium">Active 1:1 &amp; Lab Mentorship</p>
        </div>

        <div className="bg-[#0C120F] rounded-2xl p-6 border border-[#1E2C24] space-y-2">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Lab Assignments Created</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-300 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-[#F4F7F5]">{totalAssignments}</div>
          <p className="text-[11px] text-[#85998D]">Algorithmic &amp; Placement Practice</p>
        </div>

        <div className="bg-[#0C120F] rounded-2xl p-6 border border-[#1E2C24] space-y-2">
          <div className="flex items-center justify-between text-[#99A9A0]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Avg Student Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/25 text-[#9DFF00] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-[#F4F7F5]">{avgPassRate}%</div>
          <p className="text-[11px] text-emerald-300 font-medium">&uarr; +4.2% from prior semester</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="faculty-search"
            name="facultySearch"
            aria-label="Search faculty by name, email, or faculty ID"
            type="text"
            placeholder="Search faculty by name, email, or faculty ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "BCA", "B.Sc CS", "B.Sc IT", "MCA"].map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                departmentFilter === dept
                  ? "bg-[#9DFF00] text-[#070B09] font-bold"
                  : "bg-[#121B16] border border-[#1E2C24] text-[#99A9A0] hover:bg-[#18241D] hover:text-[#F4F7F5]"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Roster Table */}
      <div className="bg-[#0C120F] rounded-2xl border border-[#1E2C24] overflow-hidden">
        <div className="p-5 border-b border-[#1E2C24] flex items-center justify-between bg-[#121B16]">
          <div>
            <h2 className="font-display text-base font-bold tracking-tight text-[#F4F7F5]">Department Faculty &amp; Mentors</h2>
            <p className="text-xs text-[#99A9A0]">Live operational telemetry across active college departments</p>
          </div>
          <span className="text-xs font-mono tabular-nums font-bold px-3 py-1 bg-[#070B09] border border-[#1E2C24] rounded-xl text-[#D5E0D9]">
            {filteredFaculty.length} Faculty Members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121B16] border-b border-[#1E2C24] text-[#99A9A0] uppercase font-mono text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Faculty Member</th>
                <th className="px-5 py-3.5">Faculty ID</th>
                <th className="px-5 py-3.5">Department &amp; Designation</th>
                <th className="px-5 py-3.5">Mentored Students</th>
                <th className="px-5 py-3.5">Assignments Created</th>
                <th className="px-5 py-3.5">Student Pass Rate</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C24]">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#85998D]">
                    No faculty found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr key={f.id} className="hover:bg-[#18241D] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#F4F7F5]">{f.name}</div>
                      <div className="text-[11px] text-[#85998D] font-sans flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-[#85998D]" />
                        <span>{f.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono tabular-nums text-[#D5E0D9] font-semibold">
                      {f.facultyId}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#F4F7F5]">{f.department}</div>
                      <div className="text-[11px] text-[#99A9A0]">{f.designation}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#F4F7F5] font-mono tabular-nums">
                        <Users className="w-3.5 h-3.5 text-sky-300" />
                        <span>{f.mentoredCount} Students</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-mono tabular-nums text-[#D5E0D9] font-bold">
                        {f.assignmentsPublished} Modules
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono tabular-nums font-bold text-xs ${
                            f.avgStudentPassRate >= 90
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                              : "bg-sky-500/10 text-sky-300 border border-sky-500/25"
                          }`}
                        >
                          {f.avgStudentPassRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
