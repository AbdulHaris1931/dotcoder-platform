import { createClient } from "./client";
import { DemoStore } from "@/lib/demo-store";
import { CurriculumStore } from "@/lib/curriculum-store";
import {
  Problem,
  UserProfile,
  Assessment,
  Submission,
  POPULAR_COLLEGES,
  CampusDrive,
  DriveApplication,
} from "@/types";
import {
  CurriculumLesson,
  CurriculumProblem,
  ProblemSubmissionResult,
  BranchTag,
  SupportedLanguage,
  FailureCategory,
} from "@/types/curriculum";
import { SEED_DRIVES, SEED_DRIVE_APPLICATIONS } from "@/lib/seed-drives";

interface DbTestCaseRecord {
  id: string;
  problem_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

interface DbProblemRecord {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  company_tags?: string[];
  type?: "coding" | "mcq";
  description_md: string;
  starter_code_json?: Record<string, string>;
  mcq_options_json?: string[];
  correct_option?: string;
  is_public?: boolean;
  test_cases?: DbTestCaseRecord[];
}

interface DbAssessmentRecord {
  id: string;
  title: string;
  description?: string;
  target_college: string;
  duration_minutes?: number;
  is_proctored?: boolean;
  is_active?: boolean;
  created_at: string;
}

interface DbSubmissionRecord {
  id: string;
  assessment_id: string;
  user_id: string;
  problem_id: string;
  language: SupportedLanguage;
  source_code: string;
  status: Submission["status"];
  passed_cases: number;
  total_cases: number;
  score: string | number;
  tab_switches?: number;
  submitted_at: string;
}

interface DbCampusDriveRecord {
  id: string;
  company_name: string;
  company_logo?: string;
  role_title: string;
  ctc_range: string;
  location?: string;
  min_readiness_score?: number | string;
  allowed_departments?: string[];
  max_backlogs?: number;
  drive_date: string;
  application_deadline: string;
  status?: CampusDrive["status"];
  description?: string;
  applicant_count?: number;
}

interface DbDriveAppRecord {
  id: string;
  drive_id: string;
  student_id: string;
  stage: DriveApplication["stage"];
  notes?: string;
  applied_at: string;
  profiles: UserProfile;
  campus_drives: CampusDrive;
}

interface DbCurriculumTopicRecord {
  id: string;
  module_id: string;
  topic_order: number;
  title: string;
  concept_markdown: string;
}

interface DbCurriculumModuleRecord {
  id: string;
  lesson_id: string;
  module_number: number;
  title: string;
  unlock_threshold: number;
  curriculum_topics?: DbCurriculumTopicRecord[];
}

interface DbCurriculumLessonRecord {
  id: string;
  lesson_number: number;
  title: string;
  description: string;
  track_type: CurriculumLesson["track_type"];
  branch_tags?: BranchTag[];
  curriculum_modules?: DbCurriculumModuleRecord[];
}

interface DbCurriculumTestCaseRecord {
  id: string;
  problem_id: string;
  case_number: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  failure_category?: string;
}

interface DbCurriculumSubmissionRecord {
  id: string;
  problem_id: string;
  status: ProblemSubmissionResult["status"];
  passed_test_cases: number;
  total_test_cases: number;
  runtime_ms: number;
  memory_kb: number;
  test_results?: ProblemSubmissionResult["results"];
  submitted_at: string;
  submitted_code: string;
  language: SupportedLanguage;
}

export class DataService {
  /**
   * Fetch current user profile from Supabase Auth or fallback to DemoStore
   */
  static async getCurrentUser(): Promise<UserProfile> {
    const demoUser = DemoStore.getCurrentUser();
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            const resolved: UserProfile = {
              id: profile.id,
              email: profile.email || user.email || "",
              full_name: profile.full_name || "Campus User",
              role: profile.role,
              college_name: profile.college_name || "Annai Vailankanni Arts and Science College, Thanjavur",
              roll_no: profile.roll_no || "GEN-" + profile.id.slice(0, 6),
              department: profile.department || "BCA",
              batch_year: profile.batch_year || 2026,
              readiness_score: Number(profile.readiness_score) || 0,
              problems_solved: profile.problems_solved || 0,
              created_at: profile.created_at,
            };
            // Keep DemoStore synchronized with authoritative Supabase session (never let stale localStorage override JWT)
            if (!demoUser || demoUser.id !== resolved.id || demoUser.email !== resolved.email) {
              DemoStore.setCurrentUser(resolved);
            }
            return resolved;
          }
        }
      } catch (err) {
        console.warn("Supabase auth check failed, falling back to local demo:", err);
      }
    }
    return demoUser;
  }

  /**
   * Fetch all coding challenges with their test cases
   */
  static async getProblems(): Promise<Problem[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: problemsData, error: probErr } = await supabase
          .from("problems")
          .select("*, test_cases(*)")
          .order("created_at", { ascending: true });

        if (!probErr && problemsData && problemsData.length > 0) {
          return (problemsData as unknown as DbProblemRecord[]).map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            difficulty: p.difficulty,
            company_tags: p.company_tags || [],
            type: p.type || "coding",
            description_md: p.description_md,
            starter_code_json: p.starter_code_json || {},
            mcq_options_json: p.mcq_options_json,
            correct_option: p.correct_option,
            is_public: p.is_public ?? true,
            test_cases: (p.test_cases || []).map((tc) => ({
              id: tc.id,
              problem_id: tc.problem_id,
              input: tc.input,
              expected_output: tc.expected_output,
              is_hidden: tc.is_hidden,
              expectedOutput: tc.expected_output,
              isHidden: tc.is_hidden,
              weight: 20,
            })),
          }));
        }
      } catch (err) {
        console.warn("Supabase getProblems failed, falling back to DemoStore:", err);
      }
    }
    return DemoStore.getProblems();
  }

  /**
   * Fetch single problem by slug
   */
  static async getProblemBySlug(slug: string): Promise<Problem | null> {
    const problems = await this.getProblems();
    return problems.find((p) => p.slug === slug) || null;
  }

  /**
   * Insert a new coding problem with test cases into Supabase
   */
  static async createProblem(
    problem: Omit<Problem, "id" | "test_cases" | "created_at">,
    testCases: Array<{ input: string; expected_output: string; is_hidden: boolean }>
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    if (supabase) {
      try {
        // 1. Insert problem
        const { data: insertedProblem, error: probErr } = await supabase
          .from("problems")
          .insert({
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            company_tags: problem.company_tags,
            type: problem.type || "coding",
            description_md: problem.description_md,
            starter_code_json: problem.starter_code_json,
            is_public: true,
          })
          .select("id")
          .single();

        if (probErr) throw probErr;

        // 2. Insert test cases
        if (testCases.length > 0) {
          const formattedCases = testCases.map((tc) => ({
            problem_id: insertedProblem.id,
            input: tc.input,
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden,
          }));

          const { error: tcErr } = await supabase.from("test_cases").insert(formattedCases);
          if (tcErr) throw tcErr;
        }

        return { success: true };
      } catch (err: unknown) {
        console.error("Failed to insert problem into Supabase:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to create problem";
        return { success: false, error: errorMsg };
      }
    }

    // Fallback: add to DemoStore
    const newProb: Problem = {
      ...problem,
      id: `custom-prob-${Date.now()}`,
      created_at: new Date().toISOString(),
      test_cases: testCases.map((tc, idx) => ({
        id: `custom-tc-${Date.now()}-${idx}`,
        input: tc.input,
        expected_output: tc.expected_output,
        is_hidden: tc.is_hidden,
        expectedOutput: tc.expected_output,
        isHidden: tc.is_hidden,
        weight: 20,
      })),
    };
    DemoStore.getProblems().unshift(newProb);
    return { success: true };
  }

  /**
   * Fetch active assessments
   */
  static async getAssessments(collegeName?: string): Promise<Assessment[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase.from("assessments").select("*").eq("is_active", true);

        if (collegeName && collegeName !== "ALL") {
          query = query.in("target_college", ["ALL", collegeName]);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          if (data.length === 0) return [];
          const problems = await this.getProblems();
          return (data as unknown as DbAssessmentRecord[]).map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description || "",
            target_college: a.target_college,
            duration_minutes: a.duration_minutes || 60,
            is_proctored: a.is_proctored ?? true,
            is_active: a.is_active ?? true,
            created_at: a.created_at,
            problems: problems.slice(0, 5),
          }));
        }
      } catch (err) {
        console.warn("Supabase getAssessments failed, falling back to DemoStore:", err);
      }
    }
    return [DemoStore.getAssessment()];
  }

  /**
   * Create assessment in Supabase
   */
  static async createAssessment(assessment: {
    title: string;
    description: string;
    target_college: string;
    duration_minutes: number;
    is_proctored: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("assessments").insert({
          title: assessment.title,
          description: assessment.description,
          target_college: assessment.target_college || "ALL",
          duration_minutes: assessment.duration_minutes || 60,
          is_proctored: assessment.is_proctored ?? true,
          is_active: true,
        });
        if (error) throw error;
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }
    return { success: true };
  }

  /**
   * Record a submission and update student readiness in Supabase
   */
  static async recordSubmission(
    submission: Omit<Submission, "id" | "submitted_at">
  ): Promise<Submission> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: sub, error } = await supabase
          .from("submissions")
          .insert({
            user_id: submission.user_id,
            problem_id: submission.problem_id,
            assessment_id: submission.assessment_id || null,
            language: submission.language,
            source_code: submission.source_code,
            status: submission.status,
            passed_cases: submission.passed_cases,
            total_cases: submission.total_cases,
            score: submission.score,
            tab_switches: submission.tab_switches || 0,
          })
          .select("*")
          .single();

        if (!error && sub) {
          // Calculate and update user's readiness score and solved count
          const { data: userSubs } = await supabase
            .from("submissions")
            .select("score, status")
            .eq("user_id", submission.user_id);

          if (userSubs && userSubs.length > 0) {
            const avgScore =
              userSubs.reduce((acc, s) => acc + Number(s.score), 0) / userSubs.length;
            const newReadiness = Math.min(100, Math.round(avgScore * 0.8 + 20));
            const solvedCount = userSubs.filter((s) => s.status === "Accepted").length;

            await supabase
              .from("profiles")
              .update({
                readiness_score: newReadiness,
                problems_solved: solvedCount,
              })
              .eq("id", submission.user_id);
          }

          return {
            ...submission,
            id: sub.id,
            submitted_at: sub.submitted_at,
          };
        }
      } catch (err) {
        console.warn("Supabase recordSubmission failed, writing to DemoStore:", err);
      }
    }

    return DemoStore.recordSubmission(submission);
  }

  /**
   * Fetch distinct colleges registered in the platform
   */
  static async getColleges(): Promise<string[]> {
    const supabase = createClient();
    const collegeSet = new Set<string>(POPULAR_COLLEGES);

    if (supabase) {
      try {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("college_name");

        if (profiles) {
          profiles.forEach((p) => {
            if (p.college_name && p.college_name.trim().length > 0) {
              collegeSet.add(p.college_name.trim());
            }
          });
        }
      } catch (err) {
        console.warn("Could not query colleges from Supabase:", err);
      }
    }

    return Array.from(collegeSet);
  }

  /**
   * Fetch all registered students (with optional college filtering)
   */
  static async getStudents(collegeFilter?: string): Promise<UserProfile[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase.from("profiles").select("*").eq("role", "student");
        if (collegeFilter && collegeFilter !== "ALL") {
          query = query.eq("college_name", collegeFilter);
        }

        const { data, error } = await query.order("readiness_score", { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map((p) => ({
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            role: p.role,
            college_name: p.college_name || "Independent / General",
            roll_no: p.roll_no || "GEN-" + p.id.slice(0, 6),
            department: p.department || "CSE",
            batch_year: p.batch_year || 2026,
            readiness_score: Number(p.readiness_score) || 0,
            problems_solved: p.problems_solved || 0,
            created_at: p.created_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase getStudents failed, falling back to DemoStore:", err);
      }
    }

    const demoStudents = DemoStore.getStudents();
    if (collegeFilter && collegeFilter !== "ALL") {
      return demoStudents.filter((s) => s.college_name === collegeFilter);
    }
    return demoStudents;
  }

  /**
   * Fetch all registered faculty / mentors (with optional college filtering)
   */
  static async getTeachers(collegeFilter?: string): Promise<UserProfile[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase.from("profiles").select("*").in("role", ["teacher", "mentor"]);
        if (collegeFilter && collegeFilter !== "ALL") {
          query = query.eq("college_name", collegeFilter);
        }

        const { data, error } = await query.order("full_name", { ascending: true });
        if (!error && Array.isArray(data)) {
          return data.map((p) => ({
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            role: p.role,
            college_name: p.college_name || "",
            roll_no: p.roll_no || "FAC-" + p.id.slice(0, 4),
            department: p.department || "Computer Science",
            batch_year: p.batch_year || new Date().getFullYear(),
            readiness_score: Number(p.readiness_score) || 0,
            problems_solved: p.problems_solved || 0,
            created_at: p.created_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase getTeachers failed, falling back to DemoStore:", err);
      }
    }

    const allUsers = DemoStore.getAllUsers();
    const result = allUsers.filter((u) => u.role === "teacher");
    if (collegeFilter && collegeFilter !== "ALL") {
      return result.filter((t) => t.college_name === collegeFilter);
    }
    return result;
  }

  /**
   * Fetch all submissions (with optional college filtering)
   */
  static async getSubmissions(collegeFilter?: string): Promise<Submission[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase.from("submissions").select("*, problems(title), profiles(college_name)");
        if (collegeFilter && collegeFilter !== "ALL") {
          query = query.eq("profiles.college_name", collegeFilter);
        }

        const { data, error } = await query.order("submitted_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          return (data as unknown as (DbSubmissionRecord & { problems?: { title?: string } })[]).map((sub) => ({
            id: sub.id,
            assessment_id: sub.assessment_id,
            user_id: sub.user_id,
            problem_id: sub.problem_id,
            language: sub.language,
            source_code: sub.source_code,
            status: sub.status,
            passed_cases: sub.passed_cases,
            total_cases: sub.total_cases,
            score: Number(sub.score),
            execution_time_ms: 120,
            tab_switches: sub.tab_switches || 0,
            submitted_at: sub.submitted_at,
            problem_title: sub.problems?.title || "Placement Challenge",
          }));
        }
      } catch (err) {
        console.warn("Supabase getSubmissions failed, falling back to DemoStore:", err);
      }
    }

    return DemoStore.getSubmissions();
  }

  /**
   * Helper to retrieve locally persisted dynamic campus drives
   */
  static getLocalCampusDrives(): CampusDrive[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("eqlv_campus_drives");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  /**
   * Fetch active campus recruitment drives (combining cloud + local dynamic drives)
   */
  static async getCampusDrives(): Promise<CampusDrive[]> {
    const localDrives = this.getLocalCampusDrives();
    let baseDrives: CampusDrive[] = SEED_DRIVES;

    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("campus_drives")
          .select("*")
          .order("drive_date", { ascending: true });

        if (!error && Array.isArray(data)) {
          baseDrives = (data as unknown as DbCampusDriveRecord[]).map((d) => ({
            id: d.id,
            company_name: d.company_name,
            company_logo: d.company_logo,
            role_title: d.role_title,
            ctc_range: d.ctc_range,
            location: d.location || "Pan India",
            min_readiness_score: Number(d.min_readiness_score) || 60,
            allowed_departments: d.allowed_departments || ["CSE", "IT"],
            max_backlogs: d.max_backlogs || 0,
            drive_date: d.drive_date,
            application_deadline: d.application_deadline,
            status: d.status || "Upcoming",
            description: d.description || "",
            applicant_count: d.applicant_count || 12,
          }));
        }
      } catch (err) {
        console.warn("Supabase getCampusDrives failed, using local/seed drives:", err);
      }
    }

    // Merge local drives at the top, avoiding duplicates
    const combined = [...localDrives];
    baseDrives.forEach((bd) => {
      if (!combined.some((cd) => cd.id === bd.id || (cd.company_name === bd.company_name && cd.role_title === bd.role_title))) {
        combined.push(bd);
      }
    });

    return combined;
  }

  /**
   * Create a new campus drive (persists locally & broadcasts event)
   */
  static async createCampusDrive(drive: Omit<CampusDrive, "id" | "applicant_count">): Promise<{ success: boolean; drive?: CampusDrive; error?: string }> {
    const newDrive: CampusDrive = {
      ...drive,
      id: `drive-${Date.now()}`,
      applicant_count: 0,
    };

    // 1. Immediately persist locally so UI is 100% reactive
    if (typeof window !== "undefined") {
      try {
        const existing = this.getLocalCampusDrives();
        const updated = [newDrive, ...existing.filter((d) => d.id !== newDrive.id)];
        localStorage.setItem("eqlv_campus_drives", JSON.stringify(updated));
        window.dispatchEvent(new Event("eqlv_drives_updated"));
      } catch (err) {
        console.warn("Could not cache drive locally:", err);
      }
    }

    // Update in-memory SEED_DRIVES
    SEED_DRIVES.unshift(newDrive);

    // 2. Sync to Supabase in background if available
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("campus_drives").insert({
          company_name: drive.company_name,
          role_title: drive.role_title,
          ctc_range: drive.ctc_range,
          location: drive.location,
          min_readiness_score: drive.min_readiness_score,
          allowed_departments: drive.allowed_departments,
          max_backlogs: drive.max_backlogs,
          drive_date: drive.drive_date,
          application_deadline: drive.application_deadline,
          status: drive.status,
          description: drive.description,
        });
      } catch (err: unknown) {
        console.warn("Background Supabase drive insert notice:", err);
      }
    }

    return { success: true, drive: newDrive };
  }

  /**
   * Fetch drive applications
   */
  static async getDriveApplications(driveId?: string): Promise<DriveApplication[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase.from("drive_applications").select("*, profiles(*), campus_drives(*)");
        if (driveId) query = query.eq("drive_id", driveId);

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return (data as unknown as DbDriveAppRecord[]).map((a) => ({
            id: a.id,
            drive_id: a.drive_id,
            student_id: a.student_id,
            stage: a.stage,
            notes: a.notes,
            applied_at: a.applied_at,
            student: a.profiles,
            drive: a.campus_drives,
          }));
        }
      } catch (err) {
        console.warn("Supabase getDriveApplications failed, using local/seed fallback:", err);
      }
    }

    // Check localStorage fallback for client-side persistence
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("eqlv_drive_applications");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const list = driveId ? parsed.filter((a: DriveApplication) => a.drive_id === driveId) : parsed;
            return list;
          }
        }
      } catch {
        // ignore
      }
    }

    const seedList = SEED_DRIVE_APPLICATIONS.map((a) => ({ ...a }));
    return driveId ? seedList.filter((a) => a.drive_id === driveId) : seedList;
  }

  /**
   * 1-Click Apply to Campus Drive
   */
  static async applyToCampusDrive(driveId: string, studentId: string): Promise<{ success: boolean; error?: string }> {
    if (!driveId || !studentId) {
      return { success: false, error: "Missing driveId or studentId" };
    }

    let apps: DriveApplication[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("eqlv_drive_applications");
        if (stored) apps = JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    if (apps.length === 0) {
      apps = [...SEED_DRIVE_APPLICATIONS];
    }

    const existingIdx = apps.findIndex((a) => a.drive_id === driveId && a.student_id === studentId);
    if (existingIdx === -1) {
      const newApp: DriveApplication = {
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        drive_id: driveId,
        student_id: studentId,
        stage: "Applied",
        applied_at: new Date().toISOString(),
      };
      apps.push(newApp);
      SEED_DRIVE_APPLICATIONS.push(newApp);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("eqlv_drive_applications", JSON.stringify(apps));
        // Increment applicant_count on target drive
        const drivesRaw = localStorage.getItem("eqlv_campus_drives");
        if (drivesRaw) {
          const drives = JSON.parse(drivesRaw);
          if (Array.isArray(drives)) {
            const driveIdx = drives.findIndex((d: CampusDrive) => d.id === driveId);
            if (driveIdx >= 0) {
              drives[driveIdx].applicant_count = (drives[driveIdx].applicant_count || 0) + 1;
              localStorage.setItem("eqlv_campus_drives", JSON.stringify(drives));
            }
          }
        }
        window.dispatchEvent(new Event("eqlv_applications_updated"));
        window.dispatchEvent(new Event("eqlv_drives_updated"));
      } catch {
        // ignore
      }
    }

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("drive_applications").insert({
          drive_id: driveId,
          student_id: studentId,
          stage: "Applied",
        });
      } catch (err: unknown) {
        console.warn("Supabase applyToCampusDrive notice:", err);
      }
    }
    return { success: true };
  }

  /**
   * Update Candidate Recruitment Stage
   */
  static async updateApplicationStage(
    appId: string,
    newStage: DriveApplication["stage"]
  ): Promise<{ success: boolean; error?: string }> {
    // Always update local memory state immediately for zero-latency UI reactivity
    const app = SEED_DRIVE_APPLICATIONS.find((a) => a.id === appId);
    if (app) app.stage = newStage;

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from("drive_applications")
          .update({ stage: newStage })
          .eq("id", appId);
      } catch (err: unknown) {
        console.warn("Supabase updateApplicationStage notice:", err);
      }
    }
    return { success: true };
  }

  // =========================================================================
  // RELATIONAL CURRICULUM ACCESS (Phase 2)
  // =========================================================================

  /**
   * Fetch curriculum lessons with optional branch tag filter
   */
  static async getCurriculumLessons(branchFilter?: BranchTag | "ALL"): Promise<CurriculumLesson[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const query = supabase
          .from("curriculum_lessons")
          .select(`
            *,
            curriculum_modules (
              *,
              curriculum_topics (
                *
              )
            )
          `)
          .order("lesson_number", { ascending: true });

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const lessons: CurriculumLesson[] = (data as unknown as DbCurriculumLessonRecord[]).map((l) => ({
            id: l.id,
            lesson_number: l.lesson_number,
            title: l.title,
            description: l.description,
            track_type: l.track_type,
            branch_tags: l.branch_tags || [],
            modules: (l.curriculum_modules || []).map((m) => ({
              id: m.id,
              lesson_id: m.lesson_id,
              module_number: (m.module_number as 1 | 2) || 1,
              title: m.title,
              unlock_threshold: m.unlock_threshold,
              topics: (m.curriculum_topics || []).map((t) => ({
                id: t.id,
                module_id: t.module_id,
                topic_order: t.topic_order,
                title: t.title,
                concept_markdown: t.concept_markdown,
              })),
            })),
          }));

          if (!branchFilter || branchFilter === "ALL") {
            return lessons;
          }
          return lessons.filter(
            (l) => l.track_type === "shared_core" || (branchFilter && l.branch_tags.includes(branchFilter as BranchTag))
          );
        }
      } catch (err) {
        console.warn("Supabase getCurriculumLessons failed, using fallback:", err);
      }
    }
    return CurriculumStore.getLessons(branchFilter);
  }

  /**
   * Fetch curriculum problem by slug or id with test cases
   */
  static async getCurriculumProblemBySlug(slug: string): Promise<CurriculumProblem | null> {
    const supabase = createClient();
    if (supabase) {
      try {
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const query = supabase
          .from("curriculum_problems")
          .select("*, curriculum_test_cases(*)");
        const { data, error } = await (isUuid ? query.eq("id", slug) : query.eq("slug", slug)).maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            topic_id: data.topic_id,
            problem_type: data.problem_type,
            order_index: data.order_index,
            title: data.title,
            slug: data.slug,
            difficulty: data.difficulty,
            description_markdown: data.description_markdown,
            constraints_text: data.constraints_text,
            boilerplate_code: data.boilerplate_code || {},
            hints: data.hints || {},
            company_tags: data.company_tags || [],
            test_cases: ((data.curriculum_test_cases || []) as unknown as DbCurriculumTestCaseRecord[]).map((tc) => ({
              id: tc.id,
              problem_id: tc.problem_id,
              case_number: tc.case_number,
              input_data: tc.input_data,
              expected_output: tc.expected_output,
              is_hidden: tc.is_hidden,
              failure_category: (tc.failure_category as FailureCategory) || "logic",
            })),
          };
        }
      } catch (err) {
        console.warn("Supabase getCurriculumProblemBySlug failed, using fallback:", err);
      }
    }
    return CurriculumStore.getProblemById(slug);
  }

  /**
   * Submit curriculum solution with dual persistence (Supabase + CurriculumStore)
   */
  static async submitCurriculumCode(params: {
    userId: string;
    problem: CurriculumProblem;
    language: SupportedLanguage;
    sourceCode: string;
    isFinalSubmit?: boolean;
  }): Promise<ProblemSubmissionResult> {
    const result = CurriculumStore.evaluateSubmission(
      params.problem,
      params.language,
      params.sourceCode,
      params.isFinalSubmit ?? true
    );

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("curriculum_submissions").insert({
          user_id: params.userId,
          problem_id: params.problem.id,
          status: result.status,
          passed_test_cases: result.passed_cases,
          total_test_cases: result.total_cases,
          runtime_ms: result.runtime_ms,
          memory_kb: result.memory_kb,
          submitted_code: params.sourceCode,
          language: params.language,
          test_results: result.results,
        });
      } catch (err) {
        console.warn("Supabase submitCurriculumCode notice (fallback retained):", err);
      }
    }

    return result;
  }

  /**
   * Fetch curriculum submissions
   */
  static async getCurriculumSubmissions(userId?: string): Promise<ProblemSubmissionResult[]> {
    const supabase = createClient();
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("curriculum_submissions")
          .select("*")
          .eq("user_id", userId)
          .order("submitted_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          return (data as unknown as DbCurriculumSubmissionRecord[]).map((s) => ({
            submission_id: s.id,
            problem_id: s.problem_id,
            status: s.status,
            passed_cases: s.passed_test_cases,
            total_cases: s.total_test_cases,
            runtime_ms: s.runtime_ms,
            memory_kb: s.memory_kb,
            results: s.test_results || [],
            submitted_at: s.submitted_at,
            submitted_code: s.submitted_code,
            language: s.language as SupportedLanguage,
          }));
        }
      } catch (err) {
        console.warn("Supabase getCurriculumSubmissions failed, using local:", err);
      }
    }
    return CurriculumStore.getSubmissions();
  }
}
