export type TrackType = "shared_core" | "branch_specific";
export type BranchTag = "CSE" | "IT" | "AIDS" | "BCA" | "B.Sc CS" | "B.Sc IT" | "MCA";
export type ProblemDifficulty = "Easy" | "Medium" | "Hard";
export type CurriculumProblemType = "practice" | "assessment";
export type PracticeOrderIndex = 1 | 2 | 3 | 4 | 5;

export type SupportedLanguage = "cpp" | "java" | "python" | "c" | "sql";

export type FailureCategory =
  | "Sample Case"
  | "Boundary/Edge Case"
  | "Logical Trap/Duplicates"
  | "Max Constraint TLE"
  | "Memory/Integer Overflow";

export type MCQCategory =
  | "Output Prediction"
  | "Bug Spotting"
  | "Complexity"
  | "Architecture";

export interface CurriculumLesson {
  id: string;
  lesson_number: number; // 1 - 10
  title: string;
  description: string;
  track_type: TrackType;
  branch_tags: BranchTag[];
  modules?: CurriculumModule[];
}

export interface CurriculumModule {
  id: string;
  lesson_id: string;
  module_number: 1 | 2;
  title: string;
  unlock_threshold: number; // default: 15 (e.g. 15 / 25 problems solved)
  topics?: CurriculumTopic[];
  assessment?: ModuleAssessment;
}

export interface CurriculumTopic {
  id: string;
  module_id: string;
  topic_order: number; // 1 - 5
  title: string;
  concept_markdown: string; // 3-minute quick study guide & Big-O cheat sheet
  problems?: CurriculumProblem[];
  solved_count?: number;
  total_count?: number;
}

export interface ProgressiveHints {
  intuition: string; // Hint 1: Core algorithmic pattern / insight
  data_structure: string; // Hint 2: Data structure & state representation
  edge_case_warning: string; // Hint 3: Edge cases, traps, and constraints warning
}

export interface CurriculumProblem {
  id: string;
  topic_id: string;
  problem_type: CurriculumProblemType;
  order_index: number; // 1: Guided Warmup, 2: Pattern Application, 3: Edge-Case Trap, 4: Combined Concept, 5: Company Hard; or 1 for assessment
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  description_markdown: string;
  constraints_text: string;
  boilerplate_code: Partial<Record<SupportedLanguage, string>> | Record<string, string>;
  hints: ProgressiveHints;
  company_tags: string[];
  test_cases?: CurriculumTestCase[];
  // Derived state
  practice_stage_name?: string;
  is_solved?: boolean;
}

export interface CurriculumTestCase {
  id: string;
  problem_id: string;
  case_number: number; // 1 - 6
  input_data: string;
  expected_output: string;
  is_hidden: boolean; // false for TC 1 - 2, true for TC 3 - 6
  failure_category: FailureCategory;
}

export interface ModuleAssessment {
  id: string;
  module_id: string;
  duration_minutes: number; // 90
  passing_score: number; // 80
  mcqs?: AssessmentMCQ[]; // 10 MCQs (2 per topic)
  coding_problems?: CurriculumProblem[]; // 5 coding problems (1 per topic)
}

export interface AssessmentMCQ {
  id: string;
  assessment_id: string;
  topic_id: string;
  topic_title?: string;
  order_index: number; // 1 - 10
  question_markdown: string;
  code_snippet?: string;
  options: string[]; // 4 options
  correct_option_index: number; // 0 - 3
  question_category: MCQCategory;
}

export interface TestCaseExecutionResult {
  case_number: number;
  is_hidden: boolean;
  passed: boolean;
  input_data?: string;
  expected_output?: string;
  actual_output?: string;
  execution_time_ms: number;
  failure_category: FailureCategory;
  error_message?: string;
}

export interface ProblemSubmissionResult {
  submission_id: string;
  problem_id: string;
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compilation Error" | "Runtime Error";
  passed_cases: number;
  total_cases: number;
  runtime_ms: number;
  memory_kb: number;
  results: TestCaseExecutionResult[];
  submitted_at: string;
  submitted_code: string;
  language: SupportedLanguage;
}

export interface AssessmentAttemptResult {
  id: string;
  module_id: string;
  assessment_id: string;
  user_id: string;
  total_score: number;
  passed: boolean;
  mcq_score: number;
  coding_score: number;
  topic_mastery: Record<
    string,
    {
      topic_title: string;
      accuracy_percentage: number;
      is_weak: boolean;
      solved_mcqs: number;
      total_mcqs: number;
      coding_passed_cases: number;
      coding_total_cases: number;
    }
  >;
  submitted_at: string;
}
