import { createClient } from "./client";
import { DemoStore } from "@/lib/demo-store";
import {
  Problem,
  UserProfile,
  Assessment,
  Submission,
  POPULAR_COLLEGES,
  CampusDrive,
  DriveApplication,
} from "@/types";
import { SEED_DRIVES, SEED_DRIVE_APPLICATIONS } from "@/lib/seed-drives";

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
          // If a demo persona was specifically switched or set, honor it
          if (demoUser && demoUser.email && demoUser.email !== user.email) {
            return demoUser;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            return {
              id: profile.id,
              email: profile.email || user.email,
              full_name: profile.full_name,
              role: profile.role,
              college_name: profile.college_name || "Annai Vailankanni Arts and Science College, Thanjavur",
              roll_no: profile.roll_no || "GEN-" + profile.id.slice(0, 6),
              department: profile.department || "BCA",
              batch_year: profile.batch_year || 2026,
              readiness_score: Number(profile.readiness_score) || 0,
              problems_solved: profile.problems_solved || 0,
              created_at: profile.created_at,
            };
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
          return problemsData.map((p: any) => ({
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
            test_cases: (p.test_cases || []).map((tc: any) => ({
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
      } catch (err: any) {
        console.error("Failed to insert problem into Supabase:", err);
        return { success: false, error: err.message || "Failed to create problem" };
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
          query = query.or(`target_college.eq.ALL,target_college.eq.${collegeName}`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const problems = await this.getProblems();
          return data.map((a: any) => ({
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
      } catch (err: any) {
        return { success: false, error: err.message };
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
        let query = supabase.from("profiles").select("*");
        if (collegeFilter && collegeFilter !== "ALL") {
          query = query.eq("college_name", collegeFilter);
        }

        const { data, error } = await query.order("readiness_score", { ascending: false });
        if (!error && data && data.length > 0) {
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
        if (!error && data && data.length > 0) {
          return data.map((sub: any) => ({
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
   * Fetch active campus recruitment drives
   */
  static async getCampusDrives(): Promise<CampusDrive[]> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("campus_drives")
          .select("*")
          .order("drive_date", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
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
        console.warn("Supabase getCampusDrives failed, using SEED_DRIVES:", err);
      }
    }
    return SEED_DRIVES;
  }

  /**
   * Create a new campus drive
   */
  static async createCampusDrive(drive: Omit<CampusDrive, "id" | "applicant_count">): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    if (supabase) {
      try {
        const { error } = await supabase.from("campus_drives").insert({
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
        if (error) throw error;
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    SEED_DRIVES.unshift({ ...drive, id: `drive-${Date.now()}`, applicant_count: 0 });
    return { success: true };
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
        if (!error && data && data.length > 0) {
          return data.map((a: any) => ({
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
        console.warn("Supabase getDriveApplications failed, using SEED_DRIVE_APPLICATIONS:", err);
      }
    }
    return SEED_DRIVE_APPLICATIONS.map((a) => ({ ...a }));
  }

  /**
   * 1-Click Apply to Campus Drive
   */
  static async applyToCampusDrive(driveId: string, studentId: string): Promise<{ success: boolean; error?: string }> {
    const existing = SEED_DRIVE_APPLICATIONS.find((a) => a.drive_id === driveId && a.student_id === studentId);
    if (!existing) {
      SEED_DRIVE_APPLICATIONS.push({
        id: `44444444-0000-0000-0000-${Date.now().toString().slice(-12)}`,
        drive_id: driveId,
        student_id: studentId,
        stage: "Applied",
        applied_at: new Date().toISOString(),
      });
    }

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("drive_applications").insert({
          drive_id: driveId,
          student_id: studentId,
          stage: "Applied",
        });
      } catch (err: any) {
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
      } catch (err: any) {
        console.warn("Supabase updateApplicationStage notice:", err);
      }
    }
    return { success: true };
  }
}
