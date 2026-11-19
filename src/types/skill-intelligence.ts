export interface DSATopicMastery {
  topic: string;
  category: "Linear" | "Trees" | "Graphs" | "DP" | "Algorithms" | "Databases";
  masteryPercentage: number; // 0 - 100
  problemsSolved: number;
  totalProblems: number;
  accuracy: number;
  status: "Mastered" | "Proficient" | "Developing" | "Needs Remediation";
}

export interface AdaptiveRecommendation {
  id: string;
  topic: string;
  reason: string;
  recommendedProblemSlug: string;
  recommendedProblemTitle: string;
  difficulty: "Easy" | "Medium" | "Hard";
  priority: "High" | "Medium" | "Low";
  targetScore: number;
  isCompleted?: boolean;
}

export interface SkillScoreBreakdown {
  accuracyScore: number; // 0 - 100 (ACC)
  accuracyWeight: number; // 0.25
  psiScore: number; // 0 - 100 (PSI)
  psiWeight: number; // 0.25
  dsaMasteryScore: number; // 0 - 100 (DSA)
  dsaWeight: number; // 0.25
  efficiencyScore: number; // 0 - 100 (EFF)
  efficiencyWeight: number; // 0.15
  consistencyScore: number; // 0 - 100 (CON)
  consistencyWeight: number; // 0.10
  placementReadinessScore: number; // 0 - 100 (PLR)
}

export interface StudentSkillProfile {
  userId: string;
  rollNo: string;
  fullName: string;
  department: string;
  batchYear: number;
  breakdown: SkillScoreBreakdown;
  dsaTopicMastery: DSATopicMastery[];
  weakTopics: Array<{ topic: string; score: number; recommendedProblemSlug: string }>;
  adaptiveRecommendations: AdaptiveRecommendation[];
  streakDays: number;
  totalSubmissions: number;
  passedSubmissions: number;
  lastUpdated: string;
}
