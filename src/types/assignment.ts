export type CohortBatch = "BCA" | "B.Sc CS" | "B.Sc IT" | "MCA" | "ALL";

export interface ProblemBundleItem {
  problemId: string;
  problemTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Warmup" | "Algorithmic Pattern" | "Edge Case Trap" | "Benchmark Challenge";
  targetSlug: string;
}

export interface TeacherAssignment {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  institutionId: string;
  targetDepartment: CohortBatch;
  cohortYear: string; // e.g. "2023 - 2026"
  problems: ProblemBundleItem[];
  dueDate: string; // ISO date
  passingCasePercent: number; // e.g. 80
  totalEnrolled: number;
  submittedCount: number;
  evaluatedCount: number;
  avgScore: number;
  status: "Active" | "Draft" | "Closed";
  createdAt: string;
}

export interface MentorFeedbackRecord {
  id: string;
  assignmentId?: string;
  submissionId?: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  feedbackText: string;
  codeQualityRating: 1 | 2 | 3 | 4 | 5;
  recommendedTopic?: string;
  createdAt: string;
}
