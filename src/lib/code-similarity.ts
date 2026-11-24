import type { AssessmentAttempt } from "@/types/assessment-attempt";

export interface SimilarityPair {
  attemptA: AssessmentAttempt;
  attemptB: AssessmentAttempt;
  similarityPercent: number;
  riskLevel: "high" | "moderate";
  matchedQuestions: string[];
}

const CODE_KEYWORDS = new Set([
  "def",
  "return",
  "for",
  "while",
  "if",
  "elif",
  "else",
  "in",
  "range",
  "len",
  "class",
  "import",
  "from",
  "function",
  "const",
  "let",
  "var",
  "int",
  "void",
  "public",
  "static",
  "true",
  "false",
  "none",
  "null",
]);

/**
 * Strips comments and normalizes variable identifiers to `ID` so
 * renamed-variable copies still produce high structural similarity.
 */
export function normalizeCodeTokens(raw: string): string[] {
  const withoutComments = raw
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/#[^\n]*/g, " ")
    .toLowerCase();

  const matches = withoutComments.match(/[a-z_][a-z0-9_]*|[0-9]+|[+\-*/%=<>!&|]+/g);
  if (!matches) return [];

  return matches.map((tok) => {
    if (/^[0-9]+$/.test(tok)) return "NUM";
    if (/^[a-z_][a-z0-9_]*$/.test(tok) && !CODE_KEYWORDS.has(tok)) return "ID";
    return tok;
  });
}

function buildNGrams(tokens: string[], n = 4): Set<string> {
  const grams = new Set<string>();
  if (tokens.length < n) {
    if (tokens.length > 0) grams.add(tokens.join("|"));
    return grams;
  }
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.add(tokens.slice(i, i + n).join("|"));
  }
  return grams;
}

export function computeCodeSimilarity(codeA: string, codeB: string): number {
  const tokensA = normalizeCodeTokens(codeA);
  const tokensB = normalizeCodeTokens(codeB);
  if (tokensA.length < 4 || tokensB.length < 4) return 0;

  const gramsA = buildNGrams(tokensA);
  const gramsB = buildNGrams(tokensB);
  if (gramsA.size === 0 || gramsB.size === 0) return 0;

  let intersection = 0;
  gramsA.forEach((g) => {
    if (gramsB.has(g)) intersection++;
  });
  const union = gramsA.size + gramsB.size - intersection;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

/**
 * Compares coding answers across all student attempts in an assessment
 * and flags suspiciously similar pairs (>= 55% structural overlap).
 */
export function detectCohortSimilarity(
  attempts: AssessmentAttempt[],
  minThresholdPercent = 55
): SimilarityPair[] {
  const pairs: SimilarityPair[] = [];

  for (let i = 0; i < attempts.length; i++) {
    for (let j = i + 1; j < attempts.length; j++) {
      const a = attempts[i];
      const b = attempts[j];

      const codingA = (a.gradingDetails || []).filter(
        (d) => d.questionType === "coding" && typeof d.userAnswer === "string" && d.userAnswer.trim().length > 12
      );
      const codingB = (b.gradingDetails || []).filter(
        (d) => d.questionType === "coding" && typeof d.userAnswer === "string" && d.userAnswer.trim().length > 12
      );

      const matchedQuestions: string[] = [];
      let peakSimilarity = 0;

      for (const qa of codingA) {
        const qb = codingB.find((item) => item.questionId === qa.questionId);
        if (
          !qb ||
          typeof qa.userAnswer !== "string" ||
          typeof qb.userAnswer !== "string"
        ) {
          continue;
        }
        const sim = computeCodeSimilarity(qa.userAnswer, qb.userAnswer);
        if (sim >= minThresholdPercent) {
          matchedQuestions.push(qa.questionTitle);
          if (sim > peakSimilarity) peakSimilarity = sim;
        }
      }

      if (peakSimilarity >= minThresholdPercent) {
        pairs.push({
          attemptA: a,
          attemptB: b,
          similarityPercent: peakSimilarity,
          riskLevel: peakSimilarity >= 75 ? "high" : "moderate",
          matchedQuestions,
        });
      }
    }
  }

  return pairs.sort((x, y) => y.similarityPercent - x.similarityPercent);
}
