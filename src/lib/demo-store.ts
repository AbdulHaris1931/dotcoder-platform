import {
  UserProfile,
  UserRole,
  Department,
  Batch,
  Problem,
  Assessment,
  Submission,
  DepartmentStat,
} from "@/types";
import {
  SEED_ORGANIZATION,
  SEED_DEPARTMENTS,
  SEED_BATCHES,
  SEED_ADMIN,
  SEED_TPO,
  SEED_TEACHER,
  SEED_RECRUITER,
  SEED_STUDENTS,
  ALL_SEED_USERS,
  SEED_PROBLEMS,
  SEED_MCQS,
} from "./seed-data";
import { AssessmentRegistry } from "./assessment-registry";

const STORAGE_KEYS = {
  CURRENT_USER: "dotcoder_v2_current_user",
  STUDENTS: "dotcoder_v2_students",
  SUBMISSIONS: "dotcoder_v2_submissions",
  ASSESSMENT_PROGRESS: "dotcoder_v2_assessment_progress",
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

// Cross-tab reactive synchronization
if (isClient) {
  window.addEventListener("storage", (event) => {
    if (
      event.key &&
      (Object.values(STORAGE_KEYS).includes(event.key) ||
        event.key.startsWith("eqlv_") ||
        event.key.startsWith("dotcoder_"))
    ) {
      notifyListeners();
    }
  });
}

export function subscribeToDemoStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const GUEST_FALLBACK_USER: UserProfile = {
  id: "guest",
  full_name: "Campus User",
  email: "",
  role: "student",
  college_name: "",
  roll_no: "",
  department: "",
  batch_year: new Date().getFullYear(),
  readiness_score: 0,
  problems_solved: 0,
  created_at: new Date().toISOString(),
};

export class DemoStore {
  // Current active user (never auto-logs into a mock test student)
  static getCurrentUser(): UserProfile {
    if (!isClient) return GUEST_FALLBACK_USER;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && parsed.id) {
          return parsed as UserProfile;
        }
      } catch {
        // fallback
      }
    }
    return GUEST_FALLBACK_USER;
  }

  static setCurrentUser(user: UserProfile | null): void {
    if (!isClient) return;
    if (user && user.id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      try {
        document.cookie = `eqlv_demo_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;
      } catch {}
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      try {
        document.cookie = "eqlv_demo_user=; path=/; max-age=0; SameSite=Lax";
      } catch {}
    }
    notifyListeners();
  }

  static signOut(): void {
    if (!isClient) return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    try {
      document.cookie = "eqlv_demo_user=; path=/; max-age=0; SameSite=Lax";
    } catch {}
    notifyListeners();
  }

  static switchRole(role: UserRole): UserProfile {
    let targetUser: UserProfile;
    switch (role) {
      case "teacher":
        targetUser = SEED_TEACHER;
        break;
      case "recruiter":
        targetUser = SEED_RECRUITER;
        break;
      case "tpo":
        targetUser = SEED_TPO;
        break;
      case "admin":
      case "super_admin":
        targetUser = SEED_ADMIN;
        break;
      case "student":
      default:
        targetUser = SEED_STUDENTS[0];
        break;
    }
    this.setCurrentUser(targetUser);
    return targetUser;
  }

  static getProvisionedUsers(): UserProfile[] {
    if (!isClient) return [];
    try {
      const raw = localStorage.getItem("eqlv_provisioned_users_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as UserProfile[];
      }
    } catch {
      // ignore
    }
    return [];
  }

  static getAllUsers(): UserProfile[] {
    // 100% clean slate by default: zero built-in mock seed users
    const seedIds = new Set(ALL_SEED_USERS.map((u) => u.id));
    const provisioned = this.getProvisionedUsers().filter((u) => !seedIds.has(u.id));
    const map = new Map<string, UserProfile>();

    // Provisioned real users only
    for (const u of provisioned) {
      map.set(u.id, u);
      if (u.email) map.set(u.email.toLowerCase().trim(), u);
    }

    // Custom added students
    if (isClient) {
      try {
        const customStuds = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        if (customStuds) {
          const parsed = JSON.parse(customStuds);
          if (Array.isArray(parsed)) {
            for (const u of parsed) {
              map.set(u.id, u);
              if (u.email) map.set(u.email.toLowerCase().trim(), u);
            }
          }
        }
      } catch {
        // ignore
      }
    }

    const uniqueById = new Map<string, UserProfile>();
    Array.from(map.values()).forEach((u) => {
      uniqueById.set(u.id, u);
    });
    return Array.from(uniqueById.values());
  }

  static findUser(identifier: string): UserProfile | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim();
    const lower = clean.toLowerCase();
    const upper = clean.toUpperCase();

    // Check Sovereign Super Admin Owner
    if (
      lower === "mmam92005@gmail.com" ||
      lower === "owner@eqlv.code" ||
      lower === "owner" ||
      lower === "c8d50800-aae2-42b6-84a7-f10241621c5a" ||
      lower === "usr-super-admin-owner"
    ) {
      return {
        id: "c8d50800-aae2-42b6-84a7-f10241621c5a",
        email: "mmam92005@gmail.com",
        full_name: "Abdul Haris M",
        role: "super_admin",
        college_name: "EQLV CODE Platform Master",
        roll_no: "OWNER-01",
        department: "Platform Engineering",
        batch_year: 2026,
        readiness_score: 100,
        problems_solved: 999,
        created_at: new Date().toISOString(),
      };
    }

    const all = this.getAllUsers();

    // 1. Exact ID match
    const byId = all.find((u) => u.id === clean);
    if (byId) return byId;

    // 2. Email match (case-insensitive)
    const byEmail = all.find((u) => u.email && u.email.toLowerCase().trim() === lower);
    if (byEmail) return byEmail;

    // 3. Roll Number match (case-insensitive)
    const byRoll = all.find(
      (u) => u.roll_no && u.roll_no.toUpperCase().trim() === upper
    );
    if (byRoll) return byRoll;

    // 4. Username match (prefix before @ in email)
    const byUsername = all.find((u) => {
      if (!u.email) return false;
      const prefix = u.email.split("@")[0].toLowerCase();
      return prefix === lower;
    });
    if (byUsername) return byUsername;

    return undefined;
  }

  static getDepartments(): Department[] {
    return SEED_DEPARTMENTS;
  }

  static getBatches(): Batch[] {
    return SEED_BATCHES;
  }

  static getUserByEmail(email: string): UserProfile | undefined {
    return this.findUser(email);
  }

  // Students list
  static getStudents(): UserProfile[] {
    const all = this.getAllUsers();
    return all.filter((u) => u.role === "student");
  }

  // Faculty / Teachers list
  static getTeachers(): UserProfile[] {
    const all = this.getAllUsers();
    return all.filter((u) => u.role === "teacher" || (u.role as string) === "mentor");
  }

  // Placement Officers / Admins list
  static getTpos(): UserProfile[] {
    const all = this.getAllUsers();
    return all.filter((u) => u.role === "tpo" || u.role === "admin");
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
        readiness_score: 0, // Fresh records start at 0% readiness
        problems_solved: 0,
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

  static saveStudents(students: UserProfile[]): void {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    notifyListeners();
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
  static getAssessment(id?: string): Assessment {
    if (id) {
      return AssessmentRegistry.getAssessment(id);
    }
    return AssessmentRegistry.getAssessment("assessment-1");
  }

  // Submissions (100% clean slate by default - zero mock submissions)
  static getSubmissions(): Submission[] {
    if (!isClient) return [];
    const seedIds = new Set(ALL_SEED_USERS.map((u) => u.id));
    const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Submission[];
        if (Array.isArray(parsed)) {
          return parsed.filter((s) => !seedIds.has(s.user_id));
        }
      } catch {
        // fallback
      }
    }
    return [];
  }

  /**
   * Purge all mock seed students and dummy submissions for a 100% clean college launch
   */
  static purgeTestData(): void {
    if (!isClient) return;
    localStorage.setItem("eqlv_test_users_purged_v1", "true");
    const seedIds = new Set(ALL_SEED_USERS.map((u) => u.id));
    const currentSubs = this.getSubmissions().filter((s) => !seedIds.has(s.user_id));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(currentSubs));
    notifyListeners();
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
    const depts = ["BCA", "B.Sc CS", "B.Sc IT", "MCA"];

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
