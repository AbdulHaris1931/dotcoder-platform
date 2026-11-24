import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import {
  checkRateLimitDistributed,
  RATE_LIMIT_PRESETS,
  rateLimitExceededResponse,
} from "@/lib/rate-limiter";

export const runtime = "nodejs";

interface GeneratedProblem {
  id: string;
  type: "coding" | "mcq";
  title: string;
  description_md: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  mcq_options_json?: string[];
  correct_option?: string;
  explanation?: string;
  starter_code_json?: Record<string, string>;
  test_cases?: Array<{
    id?: string;
    input: string;
    expected_output: string;
    is_hidden: boolean;
  }>;
}

interface GeneratedAssessment {
  title: string;
  description: string;
  duration_minutes: number;
  target_department: string;
  difficulty: string;
  problems: GeneratedProblem[];
  source: string;
}

// Fallback generator when Gemini API is offline or unprovisioned
function generateFallbackAssessment(
  title: string,
  targetDept: string,
  durationMinutes: number
): GeneratedAssessment {
  return {
    title: title || "Algorithmic & Placement Readiness Test",
    description: `Curriculum assessment assigned to ${targetDept} students covering fundamental algorithms, time complexities, and problem-solving.`,
    duration_minutes: durationMinutes || 60,
    target_department: targetDept || "All Students",
    difficulty: "Mixed",
    source: "heuristic_engine",
    problems: [
      {
        id: `mcq-${Date.now()}-1`,
        type: "mcq",
        title: "Worst-Case Time Complexity of Quicksort",
        description_md: "What is the worst-case time complexity of standard Quicksort when using a deterministic pivot strategy on already sorted input?",
        difficulty: "Easy",
        points: 10,
        mcq_options_json: ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"],
        correct_option: "O(N^2)",
        explanation: "When elements are already sorted and the pivot chosen is always the first or last element, the partition creates unbalanced subproblems of size 0 and N-1, leading to O(N^2) quadratic complexity.",
      },
      {
        id: `mcq-${Date.now()}-2`,
        type: "mcq",
        title: "Optimal Data Structure for FIFO Processing",
        description_md: "Which data structure operates strictly under the First-In, First-Out (FIFO) principle and is commonly utilized in Breadth-First Search (BFS)?",
        difficulty: "Easy",
        points: 10,
        mcq_options_json: ["Stack", "Queue", "Priority Queue", "Binary Search Tree"],
        correct_option: "Queue",
        explanation: "A Queue guarantees FIFO ordering, making it the standard structure for tracking BFS level-order frontier nodes.",
      },
      {
        id: `mcq-${Date.now()}-3`,
        type: "mcq",
        title: "Hash Collision Resolution via Open Addressing",
        description_md: "In a hash table employing Open Addressing with Linear Probing, what is the primary consequence of significant cluster formations (primary clustering)?",
        difficulty: "Medium",
        points: 15,
        mcq_options_json: [
          "Search time degrades towards O(N) linear scan",
          "Memory overhead decreases exponentially",
          "Hash codes become uniformly distributed",
          "Load factor automatically resets to zero",
        ],
        correct_option: "Search time degrades towards O(N) linear scan",
        explanation: "Primary clustering causes consecutive occupied slots to merge into long runs, causing subsequent insertions and lookups to perform sequential probing.",
      },
      {
        id: `code-${Date.now()}-1`,
        type: "coding",
        title: "Target Sum Index Pairs",
        description_md: `Given an array of integers \`nums\` and an integer \`target\`, find the indices of the two numbers such that they add up to \`target\`.

### Input Format
- First line contains integer \`N\` (array size).
- Second line contains \`N\` space-separated integers.
- Third line contains integer \`target\`.

### Output Format
- Print two 0-based indices separated by a space in ascending order.`,
        difficulty: "Easy",
        points: 30,
        starter_code_json: {
          python: "import sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
          java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n",
        },
        test_cases: [
          {
            input: "4\n2 7 11 15\n9",
            expected_output: "0 1",
            is_hidden: false,
          },
          {
            input: "3\n3 2 4\n6",
            expected_output: "1 2",
            is_hidden: false,
          },
          {
            input: "5\n1 5 8 12 17\n20",
            expected_output: "1 2",
            is_hidden: true,
          },
        ],
      },
      {
        id: `code-${Date.now()}-2`,
        type: "coding",
        title: "Subarray with Maximum Sum (Kadane's Challenge)",
        description_md: `Given an array of integers \`arr\`, find the contiguous subarray (containing at least one number) which has the largest sum and print its sum.

### Input Format
- First line contains integer \`N\`.
- Second line contains \`N\` space-separated integers.

### Output Format
- Print a single integer representing the maximum subarray sum.`,
        difficulty: "Medium",
        points: 35,
        starter_code_json: {
          python: "import sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
          java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n",
        },
        test_cases: [
          {
            input: "9\n-2 1 -3 4 -1 2 1 -5 4",
            expected_output: "6",
            is_hidden: false,
          },
          {
            input: "1\n1",
            expected_output: "1",
            is_hidden: false,
          },
          {
            input: "5\n5 4 -1 7 8",
            expected_output: "23",
            is_hidden: true,
          },
        ],
      },
    ],
  };
}

export async function POST(req: Request) {
  try {
    const auth = await requireApiAuth(req, {
      allowedRoles: ["teacher", "mentor", "tpo", "admin", "super_admin"],
    });
    if (auth.errorResponse) return auth.errorResponse;
    const authUser = auth.user;

    const rateResult = await checkRateLimitDistributed({
      key: `ai_gen:user:${authUser.id}`,
      config: RATE_LIMIT_PRESETS.AI_ADMIN,
      role: authUser.role,
      email: authUser.email,
      isOwner: authUser.isOwner,
    });
    if (!rateResult.allowed) {
      return rateLimitExceededResponse(
        rateResult,
        `AI assessment generator limit reached. Please retry in ${rateResult.retryAfterSeconds} seconds.`
      );
    }

    const body = await req.json();
    const {
      documentText = "",
      promptGuidance = "",
      title = "Teacher AI Assessment",
      durationMinutes = 60,
      difficulty = "Mixed",
      targetDepartment = "All Students",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are an elite academic computer science professor and technical examiner.
A faculty member has uploaded the following question paper, notes, syllabus, or instructions:
"""
${(documentText || promptGuidance).slice(0, 8000)}
"""

TEACHER GUIDANCE / CUSTOM INSTRUCTIONS:
"${promptGuidance || "Create a comprehensive balanced assessment covering the topics with both conceptual MCQs and hands-on coding challenges."}"

PARAMETERS:
- Assessment Title: "${title}"
- Duration: ${durationMinutes} minutes
- Target Batch: "${targetDepartment}"
- Difficulty Level: "${difficulty}"

TASK:
Synthesize a high-quality, professional technical assessment.
You MUST output valid JSON only (do not include markdown \`\`\`json code blocks, output raw JSON only) adhering strictly to this schema:

{
  "title": "${title}",
  "description": "Concise summary of the topics tested in this assessment.",
  "duration_minutes": ${durationMinutes},
  "target_department": "${targetDepartment}",
  "difficulty": "${difficulty}",
  "problems": [
    {
      "id": "mcq-1",
      "type": "mcq",
      "title": "Clear question title",
      "description_md": "Complete question text with mathematical or algorithmic context.",
      "difficulty": "Easy",
      "points": 10,
      "mcq_options_json": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option": "Option A",
      "explanation": "Clear educational explanation of why this answer is correct."
    },
    {
      "id": "code-1",
      "type": "coding",
      "title": "Algorithmic Challenge Title",
      "description_md": "Full problem description with constraints, input format, and output format.",
      "difficulty": "Medium",
      "points": 30,
      "starter_code_json": {
        "python": "import sys\\n\\ndef solve():\\n    # Write your solution here\\n    pass\\n\\nif __name__ == '__main__':\\n    solve()\\n",
        "java": "import java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        // Write solution here\\n    }\\n}\\n",
        "cpp": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    // Write solution here\\n    return 0;\\n}\\n"
      },
      "test_cases": [
        {
          "input": "sample input",
          "expected_output": "expected output",
          "is_hidden": false
        },
        {
          "input": "hidden benchmark test",
          "expected_output": "benchmark output",
          "is_hidden": true
        }
      ]
    }
  ]
}

Ensure at least 3-5 MCQs and 1-2 coding problems with valid test cases.`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2500,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleanedText = rawText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

          const parsed = JSON.parse(cleanedText) as GeneratedAssessment;

          if (parsed && Array.isArray(parsed.problems) && parsed.problems.length > 0) {
            // Assign unique IDs to problems
            parsed.problems = parsed.problems.map((p, idx) => ({
              ...p,
              id: p.id || `${p.type}-${Date.now()}-${idx + 1}`,
              points: p.points || (p.type === "coding" ? 30 : 10),
            }));

            return NextResponse.json({
              success: true,
              source: "gemini_ai",
              assessment: {
                ...parsed,
                source: "gemini_ai",
              },
            });
          }
        }
      } catch (aiErr) {
        console.warn("Gemini assessment generation failed, using heuristic fallback:", aiErr);
      }
    }

    // Heuristic Fallback
    const fallback = generateFallbackAssessment(title, targetDepartment, durationMinutes);
    return NextResponse.json({
      success: true,
      source: "heuristic_engine",
      assessment: fallback,
    });
  } catch (error) {
    console.error("Generate assessment API error:", error);
    return NextResponse.json(
      { error: "Failed to generate assessment. Please check your input." },
      { status: 500 }
    );
  }
}
