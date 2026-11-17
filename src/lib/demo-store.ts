import {
  UserProfile,
  Problem,
  Assessment,
  Submission,
  DepartmentStat,
} from "@/types";
import {
  SEED_ORGANIZATION,
  SEED_TPO,
  SEED_STUDENTS,
  SEED_PROBLEMS,
  SEED_MCQS,
  SEED_ASSESSMENT,
  SEED_SUBMISSIONS,
} from "./seed-data";

const STORAGE_KEYS = {
  CURRENT_USER: "dotcoder_current_user",
  STUDENTS: "dotcoder_students",
  SUBMISSIONS: "dotcoder_submissions",
  ASSESSMENT_PROGRESS: "dotcoder_assessment_progress",
};

// Check if running in browser
const isClient = typeof window !== "undefined";

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("DemoStore listener error:", e);
    }
  });
}

export function subscribeToDemoStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export class DemoStore {
  // Current active user
  static getCurrentUser(): UserProfile {
    if (!isClient) return SEED_STUDENTS[0];
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        return JSON.parse(stored) as UserProfile;
      } catch {
        // fallback
      }
    }
    // Default to first student
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_STUDENTS[0]));
    return SEED_STUDENTS[0];
  }

  static setCurrentUser(user: UserProfile): void {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    notifyListeners();
  }

  static switchRole(role: "student" | "tpo"): UserProfile {
    const targetUser = role === "tpo" ? SEED_TPO : SEED_STUDENTS[0];
    this.setCurrentUser(targetUser);
    return targetUser;
  }

  // Students list
  static getStudents(): UserProfile[] {
    if (!isClient) return SEED_STUDENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (stored) {
      try {
        return JSON.parse(stored) as UserProfile[];
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
    return SEED_STUDENTS;
  }

  static addStudents(
    newStudents: Array<{
      full_name: string;
      roll_no: string;
      department: string;
      email: string;
      batch_year: number;
    }>
  ): { added: number; duplicates: number } {
    const current = this.getStudents();
    const existingRolls = new Set(current.map((s) => (s.roll_no || "").toUpperCase()));
    const validToAdd: UserProfile[] = [];
    let duplicates = 0;

    for (const student of newStudents) {
      if (existingRolls.has(student.roll_no.toUpperCase())) {
        duplicates++;
        continue;
      }
      existingRolls.add(student.roll_no.toUpperCase());
      validToAdd.push({
        id: `custom-student-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        org_id: SEED_ORGANIZATION.id,
        full_name: student.full_name,
        roll_no: student.roll_no,
        department: student.department,
        batch_year: student.batch_year,
        role: "student",
        college_name: SEED_ORGANIZATION.name,
        readiness_score: Math.floor(Math.random() * 35) + 60, // Realistic initial readiness 60-95
        email: student.email,
        created_at: new Date().toISOString(),
      });
    }

    if (validToAdd.length > 0) {
      const updated = [...current, ...validToAdd];
      if (isClient) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
      }
      notifyListeners();
    }

    return { added: validToAdd.length, duplicates };
  }

  // Problems
  static getProblems(): Problem[] {
    return SEED_PROBLEMS;
  }

  static getProblemBySlug(slug: string): Problem | undefined {
    return SEED_PROBLEMS.find((p) => p.slug === slug);
  }

  static getAllProblemsAndMCQs(): Problem[] {
    return [...SEED_PROBLEMS, ...SEED_MCQS];
  }

  // Assessment
  static getAssessment(): Assessment {
    return SEED_ASSESSMENT;
  }

  // Submissions
  static getSubmissions(): Submission[] {
    if (!isClient) return SEED_SUBMISSIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (stored) {
      try {
        return JSON.parse(stored) as Submission[];
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(SEED_SUBMISSIONS));
    return SEED_SUBMISSIONS;
  }

  static recordSubmission(submissionData: Omit<Submission, "id" | "submitted_at">): Submission {
    const current = this.getSubmissions();
    const problem = SEED_PROBLEMS.find((p) => p.id === submissionData.problem_id);
    const newSub: Submission = {
      ...submissionData,
      id: `sub-${Date.now()}`,
      submitted_at: new Date().toISOString(),
      problem_title: problem?.title || "Placement Challenge",
    };

    const updated = [newSub, ...current];
    if (isClient) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));

      // Recalculate readiness score for this student
      this.updateStudentReadiness(submissionData.user_id);
    }

    notifyListeners();
    return newSub;
  }

  private static updateStudentReadiness(userId: string): void {
    const students = this.getStudents();
    const submissions = this.getSubmissions().filter((s) => s.user_id === userId);
    if (submissions.length === 0) return;

    const avgSubScore =
      submissions.reduce((acc, cur) => acc + cur.score, 0) / submissions.length;
    // Readiness formula: 70% weighted on average submission score + 30% consistency
    const newReadiness = Math.min(100, Math.round(avgSubScore * 0.8 + 20));

    const updatedStudents = students.map((s) =>
      s.id === userId ? { ...s, readiness_score: newReadiness } : s
    );
    if (isClient) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));

      // Also update current user if matching
      const currentUser = this.getCurrentUser();
      if (currentUser.id === userId) {
        currentUser.readiness_score = newReadiness;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    }
  }

  // Executive KPIs
  static getExecutiveKpis() {
    const students = this.getStudents();
    const submissions = this.getSubmissions();

    const totalStudents = students.length;
    const placedReady = students.filter((s) => s.readiness_score >= 75).length;
    const avgScore =
      students.length > 0
        ? Math.round(
            students.reduce((acc, s) => acc + Number(s.readiness_score), 0) / students.length
          )
        : 0;

    const totalViolations = submissions.reduce(
      (acc, sub) => acc + (sub.tab_switches || 0),
      0
    );

    return {
      totalStudents,
      placedReady,
      avgScore,
      totalViolations,
    };
  }

  // Department Analytics
  static getDepartmentAnalytics(): DepartmentStat[] {
    const students = this.getStudents();
    const depts = ["CSE", "IT", "ECE", "EEE", "Mech"];

    return depts.map((dept) => {
      const deptStudents = students.filter((s) => s.department === dept);
      const totalStudents = deptStudents.length;
      const placedReady = deptStudents.filter((s) => s.readiness_score >= 75).length;
      const avgReadiness =
        totalStudents > 0
          ? Math.round(
              deptStudents.reduce((acc, s) => acc + Number(s.readiness_score), 0) /
                totalStudents
            )
          : 0;
      const avgScore = Math.max(0, avgReadiness - Math.floor(Math.random() * 5));

      return {
        department: dept,
        totalStudents,
        placedReady,
        avgReadiness,
        avgScore,
      };
    });
  }

  // Reset to default seed
  static resetStore(): void {
    if (!isClient) return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_PROGRESS);
    notifyListeners();
  }
}
