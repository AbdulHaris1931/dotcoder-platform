import { createClient } from "@/lib/supabase/client";
import { TeacherAssignment, MentorFeedbackRecord, CohortBatch } from "@/types/assignment";

const ASSIGNMENTS_STORAGE_KEY = "dotcoder_teacher_assignments";
const FEEDBACK_STORAGE_KEY = "dotcoder_mentor_feedback";

const DEFAULT_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: "assign-001",
    title: "Sprint 04: Dynamic Programming & Memoization Mastery",
    description: "Targeted remedial drill for BCA & B.Sc CS cohorts on recurrence relations, memoization state caching, and boundary traps.",
    teacherId: "00000000-0000-0000-0000-000000000001",
    teacherName: "Dr. S. Meenakshi",
    institutionId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    targetDepartment: "BCA",
    cohortYear: "2023 - 2026",
    problems: [
      {
        problemId: "11111111-0000-0000-0000-000000000001",
        problemTitle: "Optimal Two Sum Index Pairs",
        difficulty: "Easy",
        category: "Warmup",
        targetSlug: "optimal-two-sum-index-pairs",
      },
      {
        problemId: "11111111-0000-0000-0000-000000000002",
        problemTitle: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        category: "Algorithmic Pattern",
        targetSlug: "longest-substring",
      },
    ],
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    passingCasePercent: 80,
    totalEnrolled: 68,
    submittedCount: 44,
    evaluatedCount: 38,
    avgScore: 86.5,
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "assign-002",
    title: "Data Structures Lab: Two Pointers & In-Place Mutations",
    description: "Lab mandatory exercises covering two-pointer convergence, sliding windows, and O(1) auxiliary space constraints.",
    teacherId: "00000000-0000-0000-0000-000000000001",
    teacherName: "Dr. S. Meenakshi",
    institutionId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    targetDepartment: "B.Sc CS",
    cohortYear: "2023 - 2026",
    problems: [
      {
        problemId: "11111111-0000-0000-0000-000000000001",
        problemTitle: "Optimal Two Sum Index Pairs",
        difficulty: "Easy",
        category: "Warmup",
        targetSlug: "optimal-two-sum-index-pairs",
      },
    ],
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    passingCasePercent: 80,
    totalEnrolled: 56,
    submittedCount: 51,
    evaluatedCount: 49,
    avgScore: 91.2,
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "assign-003",
    title: "Algorithmic Invariants: Graph BFS/DFS & Cycle Traps",
    description: "Cycle detection in directed graphs, adjacency list memory considerations, and topological dependencies.",
    teacherId: "00000000-0000-0000-0000-000000000001",
    teacherName: "Dr. S. Meenakshi",
    institutionId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    targetDepartment: "MCA",
    cohortYear: "2024 - 2026",
    problems: [
      {
        problemId: "11111111-0000-0000-0000-000000000002",
        problemTitle: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        category: "Benchmark Challenge",
        targetSlug: "longest-substring",
      },
    ],
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    passingCasePercent: 90,
    totalEnrolled: 42,
    submittedCount: 18,
    evaluatedCount: 15,
    avgScore: 78.4,
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_FEEDBACK: MentorFeedbackRecord[] = [
  {
    id: "fb-001",
    studentId: "a0000000-0000-0000-0000-000000000002",
    studentName: "Karthik S.",
    teacherId: "00000000-0000-0000-0000-000000000001",
    teacherName: "Dr. S. Meenakshi",
    feedbackText: "Excellent hash map indexing for Two Sum with O(n) runtime. For dynamic programming, make sure to test empty base case arrays.",
    codeQualityRating: 5,
    recommendedTopic: "Dynamic Programming (1D & 2D)",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export class AssignmentService {
  /**
   * Fetch all teacher assignments, filtered optionally by cohort
   */
  static async getAssignments(department?: CohortBatch): Promise<TeacherAssignment[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase
          .from("teacher_assignments")
          .select("*")
          .order("created_at", { ascending: false });

        if (department && department !== "ALL") {
          query = query.eq("target_department", department);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
            teacherId: item.teacher_id,
            teacherName: item.teacher_name,
            institutionId: item.org_id,
            targetDepartment: item.target_department as CohortBatch,
            cohortYear: item.cohort_year,
            problems: item.problems || [],
            dueDate: item.due_date,
            passingCasePercent: item.passing_case_percent,
            totalEnrolled: item.total_enrolled,
            submittedCount: item.submitted_count,
            evaluatedCount: item.evaluated_count,
            avgScore: Number(item.avg_score) || 0,
            status: item.status as "Active" | "Draft" | "Closed",
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("[AssignmentService] Supabase query failed, falling back to local cache:", err);
      }
    }

    // Local fallback
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
        if (stored) {
          const parsed: TeacherAssignment[] = JSON.parse(stored);
          if (department && department !== "ALL") {
            return parsed.filter((a) => a.targetDepartment === department || a.targetDepartment === "ALL");
          }
          return parsed;
        }
      } catch {
        // use defaults
      }
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_ASSIGNMENTS));
    }

    if (department && department !== "ALL") {
      return DEFAULT_ASSIGNMENTS.filter((a) => a.targetDepartment === department || a.targetDepartment === "ALL");
    }
    return DEFAULT_ASSIGNMENTS;
  }

  /**
   * Create a new teacher assignment
   */
  static async createAssignment(
    assignment: Omit<TeacherAssignment, "id" | "createdAt" | "submittedCount" | "evaluatedCount" | "avgScore">
  ): Promise<TeacherAssignment> {
    const newRecord: TeacherAssignment = {
      ...assignment,
      id: `assign-${Date.now()}`,
      submittedCount: 0,
      evaluatedCount: 0,
      avgScore: 0,
      createdAt: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("teacher_assignments").insert({
          id: newRecord.id,
          org_id: newRecord.institutionId,
          teacher_id: newRecord.teacherId,
          teacher_name: newRecord.teacherName,
          title: newRecord.title,
          description: newRecord.description,
          target_department: newRecord.targetDepartment,
          cohort_year: newRecord.cohortYear,
          problems: newRecord.problems,
          due_date: newRecord.dueDate,
          passing_case_percent: newRecord.passingCasePercent,
          total_enrolled: newRecord.totalEnrolled,
          submitted_count: 0,
          evaluated_count: 0,
          avg_score: 0,
          status: newRecord.status,
        });
      } catch (err) {
        console.warn("[AssignmentService] Supabase insert failed:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
        const existing: TeacherAssignment[] = stored ? JSON.parse(stored) : DEFAULT_ASSIGNMENTS;
        const updated = [newRecord, ...existing];
        localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("[AssignmentService] LocalStorage insert failed:", err);
      }
    }

    return newRecord;
  }

  /**
   * Get mentor feedback records
   */
  static async getMentorFeedback(studentId?: string): Promise<MentorFeedbackRecord[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase.from("mentor_feedback").select("*").order("created_at", { ascending: false });
        if (studentId) {
          query = query.eq("student_id", studentId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            assignmentId: item.assignment_id,
            submissionId: item.submission_id,
            studentId: item.student_id,
            studentName: item.student_name,
            teacherId: item.teacher_id,
            teacherName: item.teacher_name,
            feedbackText: item.feedback_text,
            codeQualityRating: item.code_quality_rating as 1 | 2 | 3 | 4 | 5,
            recommendedTopic: item.recommended_topic,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn("[AssignmentService] Supabase get feedback failed:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        if (stored) {
          const parsed: MentorFeedbackRecord[] = JSON.parse(stored);
          if (studentId) {
            return parsed.filter((f) => f.studentId === studentId);
          }
          return parsed;
        }
      } catch {
        // use default
      }
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(DEFAULT_FEEDBACK));
    }

    if (studentId) {
      return DEFAULT_FEEDBACK.filter((f) => f.studentId === studentId);
    }
    return DEFAULT_FEEDBACK;
  }

  /**
   * Submit new mentor feedback on a student submission
   */
  static async submitMentorFeedback(
    feedback: Omit<MentorFeedbackRecord, "id" | "createdAt">
  ): Promise<MentorFeedbackRecord> {
    const newRecord: MentorFeedbackRecord = {
      ...feedback,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("mentor_feedback").insert({
          id: newRecord.id,
          assignment_id: newRecord.assignmentId || null,
          submission_id: newRecord.submissionId || null,
          student_id: newRecord.studentId,
          student_name: newRecord.studentName,
          teacher_id: newRecord.teacherId,
          teacher_name: newRecord.teacherName,
          feedback_text: newRecord.feedbackText,
          code_quality_rating: newRecord.codeQualityRating,
          recommended_topic: newRecord.recommendedTopic,
        });
      } catch (err) {
        console.warn("[AssignmentService] Supabase feedback insert failed:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const existing: MentorFeedbackRecord[] = stored ? JSON.parse(stored) : DEFAULT_FEEDBACK;
        const updated = [newRecord, ...existing];
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("[AssignmentService] LocalStorage feedback insert failed:", err);
      }
    }

    return newRecord;
  }
}
