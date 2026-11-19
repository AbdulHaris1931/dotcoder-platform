export type UserRole =
  | "student"
  | "teacher"
  | "admin"
  | "tpo"
  | "super_admin"
  | "recruiter";

export interface Organization {
  id: string;
  name: string;
  code: string;
  slug?: string;
  city: string;
  plan_tier: string;
  logo_url?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface Batch {
  id: string;
  department_id: string;
  name: string;
  start_year: number;
  end_year: number;
  created_at?: string;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  department_id: string;
  batch_id?: string;
  assigned_at?: string;
}

export type SupportedLanguage = "python" | "java" | "c" | "cpp" | "sql";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type ProblemType = "coding" | "mcq";

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  role: UserRole;
  college_name?: string;
  organization_id?: string;
  department_id?: string;
  batch_id?: string;
  roll_no?: string;
  department?: string;
  batch_year?: number;
  readiness_score: number;
  problems_solved?: number;
  avatar_url?: string;
  created_at?: string;
  // legacy alias for backward compatibility
  org_id?: string;
}

export interface TestCase {
  id: string;
  problem_id?: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  weight?: number;
  expectedOutput?: string;
  isHidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  company_tags: string[];
  type: ProblemType;
  description_md: string;
  starter_code_json?: Partial<Record<SupportedLanguage, string>> | Record<string, string>;
  mcq_options_json?: string[];
  correct_option?: string;
  explanation?: string;
  is_public?: boolean;
  test_cases?: TestCase[];
  created_at?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  target_college?: string;
  duration_minutes: number;
  is_proctored: boolean;
  is_active?: boolean;
  created_by?: string;
  starts_at?: string;
  ends_at?: string;
  created_at?: string;
  problems?: Problem[];
  // legacy alias
  org_id?: string;
}

export interface Submission {
  id: string;
  assessment_id?: string | null;
  user_id: string;
  problem_id: string;
  language: SupportedLanguage;
  source_code: string;
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compilation Error" | "Runtime Error";
  passed_cases: number;
  total_cases: number;
  score: number;
  execution_time_ms: number;
  tab_switches: number;
  submitted_at: string;
  problem_title?: string;
}

export interface TestCaseResult {
  testCaseId: string;
  isHidden: boolean;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTimeMs: number;
  errorMessage?: string;
}

export interface ExecuteCodeResponse {
  success: boolean;
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compilation Error" | "Runtime Error";
  passedCases: number;
  totalCases: number;
  scorePercentage: number;
  executionTimeMs: number;
  compileError?: string;
  results: TestCaseResult[];
}

export interface DepartmentStat {
  department: string;
  totalStudents: number;
  placedReady: number;
  avgReadiness: number;
  avgScore: number;
}

export interface ProctorViolationLog {
  timestamp: string;
  type: "tab_switch" | "fullscreen_exit" | "blur";
  details: string;
}

export const POPULAR_COLLEGES: string[] = [
  "Annai Vailankanni Arts and Science College, Thanjavur",
];

export interface MCQQuestion {
  id: string;
  category: "Quantitative" | "Logical" | "Verbal" | "CS Fundamentals";
  sub_topic: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  difficulty: ProblemDifficulty;
}

export interface CampusDrive {
  id: string;
  company_name: string;
  company_logo?: string;
  role_title: string;
  ctc_range: string;
  location: string;
  min_readiness_score: number;
  allowed_departments: string[];
  max_backlogs: number;
  drive_date: string;
  application_deadline: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  description: string;
  applicant_count?: number;
  created_at?: string;
}

export interface DriveApplication {
  id: string;
  drive_id: string;
  student_id: string;
  stage: "Applied" | "Shortlisted for Test" | "Technical Interview" | "HR Interview" | "Offer Extended" | "Rejected";
  resume_url?: string;
  notes?: string;
  applied_at: string;
  student?: UserProfile;
  drive?: CampusDrive;
}

export interface SimulatorSection {
  id: string;
  title: string;
  duration_minutes: number;
  type: "mcq" | "coding";
  questions: (MCQQuestion | Problem)[];
}

export interface SimulatorResult {
  candidate_name: string;
  roll_no: string;
  quant_score: number;
  logic_score: number;
  code_score: number;
  total_score: number;
  max_score: number;
  qualified_profile: "Digital Profile (7.5+ LPA)" | "Ninja Profile (3.6 - 4.5 LPA)" | "Needs Re-Evaluation";
  completed_at: string;
}

