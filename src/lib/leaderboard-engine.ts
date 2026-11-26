import type { NormalizedRole } from "@/lib/auth/rbac-routes";

export interface RawLeaderboardCandidate {
  id: string;
  fullName: string;
  rollNo: string;
  department: string;
  batchYear: number;
  readinessScore: number;
  problemsSolved: number;
  examAvgScore: number;
  examsPassed: number;
}

export interface RankedLeaderboardEntry {
  rank: number;
  id: string;
  fullName: string;
  rollNo: string;
  department: string;
  batchYear: number;
  readinessScore: number;
  problemsSolved: number;
  examAvgScore: number;
  examsPassed: number;
  compositeScore: number;
  percentile: number;
  tier: "Elite" | "Placement Ready" | "Rising" | "Foundation";
}

export interface DepartmentChampionshipEntry {
  rank: number;
  department: string;
  studentCount: number;
  avgCompositeScore: number;
  avgReadinessScore: number;
  totalProblemsSolved: number;
}

export interface StudentStandingSummary {
  entry: RankedLeaderboardEntry;
  totalInScope: number;
  pointsToNextRank: number;
  nextRankHolder: string | null;
}

export interface LeaderboardComputationResult {
  visibleEntries: RankedLeaderboardEntry[];
  totalCandidates: number;
  isPrivacyCapped: boolean;
  privacyCapLimit: number;
  departments: string[];
  batchYears: number[];
  departmentStandings: DepartmentChampionshipEntry[];
  myStanding: StudentStandingSummary | null;
  canViewFullCohort: boolean;
}

const STUDENT_PRIVACY_TOP_LIMIT = 25;

export function calculateCompositeScore(params: {
  readinessScore: number;
  problemsSolved: number;
  examAvgScore: number;
}): number {
  const readiness = Math.max(0, Math.min(100, Number(params.readinessScore) || 0));
  const solved = Math.max(0, Number(params.problemsSolved) || 0);
  const examAvg = Math.max(0, Math.min(100, Number(params.examAvgScore) || 0));
  return Math.round(readiness * 6 + solved * 12 + examAvg * 2);
}

function resolveTier(
  readinessScore: number,
  compositeScore: number
): RankedLeaderboardEntry["tier"] {
  if (readinessScore >= 85 || compositeScore >= 900) return "Elite";
  if (readinessScore >= 70 || compositeScore >= 650) return "Placement Ready";
  if (readinessScore >= 50 || compositeScore >= 400) return "Rising";
  return "Foundation";
}

export function computeCampusLeaderboard(params: {
  candidates: RawLeaderboardCandidate[];
  viewerId: string;
  viewerRole: NormalizedRole;
  departmentFilter?: string;
  batchFilter?: string;
}): LeaderboardComputationResult {
  const { candidates, viewerId, viewerRole, departmentFilter, batchFilter } = params;

  const deptSet = new Set<string>(["BCA", "B.Sc CS", "B.Sc IT", "MCA"]);
  const batchSet = new Set<number>([2026]);

  for (const c of candidates) {
    if (c.department?.trim()) deptSet.add(c.department.trim());
    if (c.batchYear && Number.isFinite(c.batchYear)) batchSet.add(c.batchYear);
  }

  // 1. Department Championship across the active batch filter (before dept filter)
  const batchScoped = candidates.filter((c) => {
    if (!batchFilter || batchFilter === "ALL") return true;
    return String(c.batchYear) === String(batchFilter);
  });

  const deptGroups = new Map<
    string,
    { count: number; sumComposite: number; sumReadiness: number; sumSolved: number }
  >();

  for (const c of batchScoped) {
    const dept = c.department?.trim() || "General";
    const comp = calculateCompositeScore(c);
    const prev = deptGroups.get(dept) || {
      count: 0,
      sumComposite: 0,
      sumReadiness: 0,
      sumSolved: 0,
    };
    prev.count += 1;
    prev.sumComposite += comp;
    prev.sumReadiness += c.readinessScore;
    prev.sumSolved += c.problemsSolved;
    deptGroups.set(dept, prev);
  }

  const departmentStandings: DepartmentChampionshipEntry[] = Array.from(
    deptGroups.entries()
  )
    .map(([department, agg]) => ({
      rank: 0,
      department,
      studentCount: agg.count,
      avgCompositeScore: Math.round(agg.sumComposite / Math.max(1, agg.count)),
      avgReadinessScore: Math.round(agg.sumReadiness / Math.max(1, agg.count)),
      totalProblemsSolved: agg.sumSolved,
    }))
    .sort(
      (a, b) =>
        b.avgCompositeScore - a.avgCompositeScore ||
        b.avgReadinessScore - a.avgReadinessScore ||
        a.department.localeCompare(b.department)
    )
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // 2. Apply Department + Batch Filters
  const filtered = batchScoped.filter((c) => {
    if (!departmentFilter || departmentFilter === "ALL") return true;
    return (c.department?.trim() || "General") === departmentFilter;
  });

  // 3. Score, Sort & Rank
  const scored = filtered
    .map((c) => {
      const compositeScore = calculateCompositeScore(c);
      return {
        ...c,
        compositeScore,
        tier: resolveTier(c.readinessScore, compositeScore),
      };
    })
    .sort(
      (a, b) =>
        b.compositeScore - a.compositeScore ||
        b.readinessScore - a.readinessScore ||
        b.problemsSolved - a.problemsSolved ||
        a.fullName.localeCompare(b.fullName)
    );

  const totalCandidates = scored.length;
  const ranked: RankedLeaderboardEntry[] = scored.map((item, idx) => {
    const rank = idx + 1;
    const percentile =
      totalCandidates <= 1
        ? 1
        : Math.max(1, Math.ceil((rank / totalCandidates) * 100));
    return {
      rank,
      id: item.id,
      fullName: item.fullName,
      rollNo: item.rollNo,
      department: item.department,
      batchYear: item.batchYear,
      readinessScore: Math.round(item.readinessScore),
      problemsSolved: item.problemsSolved,
      examAvgScore: Math.round(item.examAvgScore),
      examsPassed: item.examsPassed,
      compositeScore: item.compositeScore,
      percentile,
      tier: item.tier,
    };
  });

  // 4. Viewer's Own Standing
  let myStanding: StudentStandingSummary | null = null;
  const myIdx = ranked.findIndex((r) => r.id === viewerId);
  if (myIdx !== -1) {
    const myEntry = ranked[myIdx];
    const above = myIdx > 0 ? ranked[myIdx - 1] : null;
    myStanding = {
      entry: myEntry,
      totalInScope: totalCandidates,
      pointsToNextRank: above
        ? Math.max(1, above.compositeScore - myEntry.compositeScore + 1)
        : 0,
      nextRankHolder: above ? above.fullName : null,
    };
  }

  // 5. Role-Based Privacy Capping
  const canViewFullCohort = viewerRole !== "student";
  const isPrivacyCapped =
    !canViewFullCohort && ranked.length > STUDENT_PRIVACY_TOP_LIMIT;
  const visibleEntries = canViewFullCohort
    ? ranked
    : ranked.slice(0, STUDENT_PRIVACY_TOP_LIMIT);

  return {
    visibleEntries,
    totalCandidates,
    isPrivacyCapped,
    privacyCapLimit: STUDENT_PRIVACY_TOP_LIMIT,
    departments: Array.from(deptSet).sort(),
    batchYears: Array.from(batchSet).sort((a, b) => b - a),
    departmentStandings,
    myStanding,
    canViewFullCohort,
  };
}
