import { SupportedLanguage } from "./curriculum";

export type ProctorViolationType = "tab_switch" | "fullscreen_exit" | "blur" | "shortcut_attempt";

export interface ProctorIntegrityEvent {
  id: string;
  timestamp: string;
  type: ProctorViolationType;
  details: string;
  severity: "low" | "medium" | "high";
}

export interface QuestionSubmissionAnswer {
  questionId: string;
  questionType: "mcq" | "coding";
  questionTitle: string;
  selectedOption?: number | string;
  code?: string;
  language?: SupportedLanguage;
  isMarkedReview?: boolean;
}

export interface QuestionGradingDetail {
  questionId: string;
  questionTitle: string;
  questionType: "mcq" | "coding";
  maxScore: number;
  awardedScore: number;
  passed: boolean;
  userAnswer?: string | number;
  correctAnswer?: string | number;
  executionTimeMs?: number;
  passedCases?: number;
  totalCases?: number;
  feedback?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  userId: string;
  studentName: string;
  rollNo: string;
  department: string;
  batchYear: number;
  collegeName: string;
  score: number; // 0 - 100
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  tabSwitchCount: number;
  antiCheatScore: number; // 0 - 100%
  durationSpentSeconds: number;
  status: "submitted" | "flagged" | "voided";
  submittedAt: string;
  accreditationHash: string;
  gradingDetails: QuestionGradingDetail[];
  integrityEvents: ProctorIntegrityEvent[];
}

export interface AssessmentSubmissionPayload {
  assessmentId: string;
  assessmentTitle: string;
  userId: string;
  studentName: string;
  rollNo: string;
  department: string;
  collegeName: string;
  durationSpentSeconds: number;
  tabSwitches: number;
  answers: Record<string, QuestionSubmissionAnswer>;
  integrityEvents: ProctorIntegrityEvent[];
}

export interface AssessmentSubmissionResponse {
  success: boolean;
  attempt: AssessmentAttempt;
  message?: string;
}
