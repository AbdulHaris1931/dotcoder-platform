import {
  CampusDrive,
  CandidateShortlistEntry,
  PlacementStage,
  RecruiterCompany,
} from "@/types/recruiter";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_SHORTLISTS_KEY = "dotcoder_recruiter_shortlists_cache";

const INITIAL_DEMO_DRIVES: CampusDrive[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    companyId: "c0000000-0000-0000-0000-000000000001",
    companyName: "Zoho Corporation",
    title: "Zoho Campus Recruitment Drive 2026",
    role: "Software Craftsman / Member Technical Staff",
    compensation: "6.5 - 8.4 LPA",
    targetDepartments: ["BCA", "B.Sc CS", "MCA"],
    targetBatchYear: 2026,
    minReadinessScore: 80,
    status: "Active",
    driveDate: "2026-12-05",
    registeredCount: 48,
    shortlistedCount: 3,
    description: "On-campus recruitment targeting AVASC BCA, B.Sc Computer Science and MCA final years.",
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    companyId: "c0000000-0000-0000-0000-000000000002",
    companyName: "Tata Consultancy Services (TCS)",
    title: "TCS NQT National Campus Drive 2026",
    role: "Digital Cadre & Prime Developer",
    compensation: "7.5 - 9.0 LPA",
    targetDepartments: ["BCA", "B.Sc CS", "B.Sc IT", "MCA"],
    targetBatchYear: 2026,
    minReadinessScore: 75,
    status: "Active",
    driveDate: "2026-12-15",
    registeredCount: 62,
    shortlistedCount: 4,
    description: "National qualifier test hiring for Digital and Prime engineer profiles.",
  },
];

const INITIAL_DEMO_SHORTLISTS: CandidateShortlistEntry[] = [
  {
    id: "sl-001",
    studentId: "00000000-0000-0000-0000-000000000001",
    studentName: "Karthik S.",
    rollNo: "23BCA01",
    department: "BCA",
    readinessScore: 88,
    dsaMastery: "Optimal Hash Map & Sliding Window",
    primaryLanguage: "Python",
    driveId: "d0000000-0000-0000-0000-000000000001",
    driveTitle: "Zoho Campus Recruitment Drive 2026",
    stage: "Technical Interview",
    recruiterNotes: "Exceptional code readability and linear time complexity optimization.",
    shortlistedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    accreditationHash: "AVASC-2026-BCA-23BCA01-92-A1K7",
  },
  {
    id: "sl-002",
    studentId: "00000000-0000-0000-0000-000000000002",
    studentName: "Priya Dharshini M.",
    rollNo: "23CS012",
    department: "B.Sc CS",
    readinessScore: 92.5,
    dsaMastery: "Two Pointers & Monotonic Stack",
    primaryLanguage: "C++",
    driveId: "d0000000-0000-0000-0000-000000000001",
    driveTitle: "Zoho Campus Recruitment Drive 2026",
    stage: "Coding Round",
    recruiterNotes: "High execution efficiency in compiled C++ benchmarks.",
    shortlistedAt: new Date(Date.now() - 86400000).toISOString(),
    accreditationHash: "AVASC-2026-CS-23CS012-88-B2P9",
  },
];

export class RecruiterService {
  /**
   * Get active placement drives
   */
  static async getCampusDrives(): Promise<CampusDrive[]> {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("placement_drives")
          .select("*")
          .order("drive_date", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            companyId: d.company_id,
            companyName: d.company_name,
            title: d.title,
            role: d.role,
            compensation: d.compensation,
            targetDepartments: d.target_departments || [],
            targetBatchYear: d.target_batch_year,
            minReadinessScore: d.min_readiness_score,
            status: d.status,
            driveDate: d.drive_date,
            registeredCount: d.registered_count,
            shortlistedCount: d.shortlisted_count,
            description: d.description,
          }));
        }
      }
    } catch (err) {
      console.warn("Supabase placement drives error:", err);
    }
    return INITIAL_DEMO_DRIVES;
  }

  /**
   * Get candidate pipeline shortlists
   */
  static async getShortlists(driveId?: string): Promise<CandidateShortlistEntry[]> {
    const local = this.getLocalShortlists();

    try {
      const supabase = createClient();
      if (supabase) {
        let query = supabase
          .from("recruiter_shortlists")
          .select("*")
          .order("updated_at", { ascending: false });

        if (driveId && driveId !== "ALL") {
          query = query.eq("drive_id", driveId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            studentId: s.student_id,
            studentName: s.student_name,
            rollNo: s.roll_no,
            department: s.department,
            readinessScore: s.readiness_score,
            dsaMastery: s.dsa_mastery,
            primaryLanguage: s.primary_language,
            driveId: s.drive_id,
            driveTitle: s.drive_title,
            stage: s.stage,
            recruiterNotes: s.recruiter_notes,
            shortlistedAt: s.shortlisted_at,
          }));
        }
      }
    } catch (err) {
      console.warn("Supabase shortlists read error:", err);
    }

    if (driveId && driveId !== "ALL") {
      return local.filter((s) => s.driveId === driveId);
    }
    return local;
  }

  /**
   * Advance or update candidate pipeline stage
   */
  static async updateCandidateStage(
    entryId: string,
    newStage: PlacementStage
  ): Promise<boolean> {
    const local = this.getLocalShortlists();
    const updated = local.map((item) =>
      item.id === entryId ? { ...item, stage: newStage } : item
    );
    this.saveLocalShortlists(updated);

    try {
      const supabase = createClient();
      if (supabase) {
        await supabase
          .from("recruiter_shortlists")
          .update({ stage: newStage, updated_at: new Date().toISOString() })
          .eq("id", entryId);
      }
    } catch (err) {
      console.warn("Supabase update shortlist stage error:", err);
    }

    return true;
  }

  /**
   * Shortlist candidate
   */
  static async shortlistCandidate(
    entry: Omit<CandidateShortlistEntry, "id" | "shortlistedAt">
  ): Promise<CandidateShortlistEntry> {
    const newEntry: CandidateShortlistEntry = {
      ...entry,
      id: `sl-${Date.now()}`,
      shortlistedAt: new Date().toISOString(),
    };

    const local = this.getLocalShortlists();
    const exists = local.find(
      (s) => s.studentId === entry.studentId && s.driveId === entry.driveId
    );
    if (!exists) {
      this.saveLocalShortlists([newEntry, ...local]);
    }

    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.from("recruiter_shortlists").upsert({
          id: newEntry.id,
          student_id: newEntry.studentId,
          student_name: newEntry.studentName,
          roll_no: newEntry.rollNo,
          department: newEntry.department,
          drive_id: newEntry.driveId,
          drive_title: newEntry.driveTitle,
          stage: newEntry.stage,
          readiness_score: newEntry.readinessScore,
          dsa_mastery: newEntry.dsaMastery,
          primary_language: newEntry.primaryLanguage,
          recruiter_notes: newEntry.recruiterNotes,
        });
      }
    } catch (err) {
      console.warn("Supabase shortlist insert error:", err);
    }

    return newEntry;
  }

  /**
   * Remove candidate from shortlist
   */
  static async removeShortlist(studentId: string, driveId?: string): Promise<boolean> {
    const local = this.getLocalShortlists();
    const filtered = local.filter((s) => {
      if (driveId) {
        return !(s.studentId === studentId && s.driveId === driveId);
      }
      return s.studentId !== studentId;
    });
    this.saveLocalShortlists(filtered);

    try {
      const supabase = createClient();
      if (supabase) {
        let query = supabase.from("recruiter_shortlists").delete().eq("student_id", studentId);
        if (driveId) {
          query = query.eq("drive_id", driveId);
        }
        await query;
      }
    } catch (err) {
      console.warn("Supabase shortlist delete error:", err);
    }

    return true;
  }

  // --- Local Cache Helpers ---
  private static getLocalShortlists(): CandidateShortlistEntry[] {
    if (typeof window === "undefined") return INITIAL_DEMO_SHORTLISTS;
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_SHORTLISTS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to read shortlists cache:", err);
    }
    return INITIAL_DEMO_SHORTLISTS;
  }

  private static saveLocalShortlists(items: CandidateShortlistEntry[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_SHORTLISTS_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to write shortlists cache:", err);
    }
  }
}
