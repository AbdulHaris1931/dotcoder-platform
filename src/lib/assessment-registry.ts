import { Assessment, Problem } from "@/types";
import { SEED_PROBLEMS } from "./seed-data";
import { SEED_MCQS } from "./seed-mcqs";
import { MNC_CURRICULUM_UNITS, MNC_CODING_PROBLEMS, MNC_MCQS } from "./mnc-curriculum-data";

// Helper to convert MCQQuestion into a Problem
function createMCQProblem(
  id: string,
  title: string,
  category: string,
  questionMd: string,
  options: string[],
  correctOption: string,
  explanation: string,
  difficulty: "Easy" | "Medium" | "Hard" = "Easy"
): Problem {
  return {
    id,
    title,
    slug: `mcq-${id}`,
    difficulty,
    company_tags: [category, "AVASC Academic"],
    type: "mcq",
    description_md: questionMd,
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: options,
    correct_option: correctOption,
    explanation,
    is_public: true,
  };
}

// Convert SEED_MCQS
const ALL_SEED_MCQ_PROBLEMS: Problem[] = SEED_MCQS.map((m) =>
  createMCQProblem(
    m.id,
    `${m.sub_topic}: ${m.category}`,
    m.category,
    m.question_text,
    m.options,
    m.options[m.correct_option],
    m.explanation,
    m.difficulty
  )
);

// ----------------------------------------------------------------------------
// Flagship Assessments Catalog
// ----------------------------------------------------------------------------

export const ASSESSMENT_MODULE_1: Assessment = {
  id: "module-1",
  title: "Module 1 Assessment: Foundations & Arrays Invariants",
  description: "Comprehensive evaluation of asymptotic Big-O runtime analysis, two-pointer opposite direction techniques, prefix arrays, and hash map indexing.",
  duration_minutes: 45,
  is_proctored: true,
  problems: [
    createMCQProblem(
      "m1-q1",
      "Asymptotic Complexity: Nested Dependent Loops",
      "Complexity",
      "What is the time complexity of the following code snippet?\n\n```python\nfor i in range(1, n + 1):\n    for j in range(1, i + 1):\n        count += 1\n```",
      ["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"],
      "O(n^2)",
      "The inner loop runs 1 + 2 + 3 + ... + n times = n(n+1)/2 = O(n^2)."
    ),
    createMCQProblem(
      "m1-q2",
      "Two-Pointer Convergence Invariant",
      "Arrays",
      "In the two-pointer technique on a sorted array, what property ensures that moving the left pointer inward guarantees the pair sum will never decrease?",
      [
        "Array elements are non-negative",
        "Array is sorted in non-decreasing order",
        "Array length is even",
        "All elements are distinct"
      ],
      "Array is sorted in non-decreasing order",
      "When sorted in non-decreasing order, array[left + 1] >= array[left], ensuring the sum does not decrease."
    ),
    createMCQProblem(
      "m1-q3",
      "Prefix Sum Query Complexity",
      "Arrays",
      "Given an array of size N, what is the preprocessing time and subsequent range-sum query time using a standard 1D Prefix Sum array?",
      ["O(N) build, O(1) query", "O(1) build, O(N) query", "O(N log N) build, O(log N) query", "O(N) build, O(log N) query"],
      "O(N) build, O(1) query",
      "Prefix sums require O(N) linear time to build and allow any range sum [L, R] in O(1) via prefix[R] - prefix[L-1]."
    ),
    createMCQProblem(
      "m1-q4",
      "Hash Table Worst-Case Collisions",
      "Hashing",
      "Under severe hash collisions where all keys produce the same hash code in a hash table using linked-list chaining, what is the search time complexity?",
      ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      "O(n)",
      "All entries collapse into a single linked list of length n, degrading search to O(n)."
    ),
    createMCQProblem(
      "m1-q5",
      "Sliding Window Monotonicity",
      "Arrays",
      "Why can a sliding window with two pointers expand and shrink in overall O(N) time despite nested loops?",
      [
        "Inner loop runs in logarithmic time",
        "Amortized analysis: each pointer increments at most N times total",
        "The compiler vectorizes the array",
        "It only works on powers of 2"
      ],
      "Amortized analysis: each pointer increments at most N times total",
      "Both left and right pointers only move forward up to N times each, yielding 2N = O(N) amortized time."
    ),
    SEED_PROBLEMS[0], // Two Sum Target Pair (coding)
    SEED_PROBLEMS[4], // Subarray with Given Sum (coding)
  ],
};

export const ASSESSMENT_MODULE_2: Assessment = {
  id: "module-2",
  title: "Module 2 Assessment: Data Structures Basics & Strings",
  description: "Assessment on string pattern matching, sliding window frequency counters, fast & slow pointers, and cyclic sort.",
  duration_minutes: 45,
  is_proctored: true,
  problems: [
    createMCQProblem(
      "m2-q1",
      "String Immutability in Memory",
      "Strings",
      "Why does repeated string concatenation `s += ch` inside a loop of length N take O(N^2) time in languages with immutable strings like Python and Java?",
      [
        "Memory fragmentation prevents allocation",
        "A new string buffer of size proportional to current length is allocated and copied on each iteration",
        "Strings require garbage collection on every character",
        "Index lookups are O(N) in strings"
      ],
      "A new string buffer of size proportional to current length is allocated and copied on each iteration",
      "Copying 1 + 2 + ... + N characters sums to O(N^2). A list/StringBuilder should be used instead."
    ),
    createMCQProblem(
      "m2-q2",
      "Fast and Slow Pointer Cycle Detection",
      "Pointers",
      "In Floyd's Tortoise and Hare algorithm, if a cycle of length C exists, what is the maximum number of steps before the fast pointer catches the slow pointer once inside the cycle?",
      ["C steps", "2C steps", "C / 2 steps", "C^2 steps"],
      "C steps",
      "The relative speed difference is 1 step per iteration, so the distance between them decreases by 1 each step, catching up in at most C steps."
    ),
    createMCQProblem(
      "m2-q3",
      "Cyclic Sort Invariant",
      "Sorting",
      "Given an array containing numbers from 1 to N, what is the maximum number of swaps performed by Cyclic Sort to place each number at its correct index?",
      ["N - 1 swaps", "N log N swaps", "N^2 swaps", "2N swaps"],
      "N - 1 swaps",
      "Each swap places at least one element into its permanent correct index; hence at most N - 1 swaps occur."
    ),
    createMCQProblem(
      "m2-q4",
      "Anagram Frequency Vector Comparison",
      "Strings",
      "What is the space and time complexity of verifying if two ASCII strings of length N and M are anagrams using a fixed-size frequency array?",
      ["O(N + M) time, O(1) space", "O(N log N) time, O(N) space", "O(N * M) time, O(1) space", "O(1) time, O(N + M) space"],
      "O(N + M) time, O(1) space",
      "An array of size 26 or 256 requires O(1) constant auxiliary space, and one pass over each string requires O(N + M) time."
    ),
    createMCQProblem(
      "m2-q5",
      "Subsequence vs Substring",
      "Strings",
      "What is the total number of non-empty substrings of a string of length N with distinct characters?",
      ["N(N + 1) / 2", "2^N - 1", "N^2", "N!"],
      "N(N + 1) / 2",
      "Substrings are contiguous slices: N of length 1, N-1 of length 2, ... 1 of length N = N(N+1)/2."
    ),
    SEED_PROBLEMS[1], // Longest Unique Substring (coding)
    SEED_PROBLEMS[0], // Two Sum Target Pair (coding)
  ],
};

export const ASSESSMENT_MODULE_3: Assessment = {
  id: "module-3",
  title: "Module 3 Assessment: Data Structures In-Depth (Stacks, Queues, Trees)",
  description: "Assessment on monotonic stacks, expression parsing, double-ended queues, linked list mutations, and binary tree traversals.",
  duration_minutes: 60,
  is_proctored: true,
  problems: [
    createMCQProblem(
      "m3-q1",
      "Monotonic Stack Next Greater Element",
      "Stacks",
      "Why does finding the Next Greater Element for all items in an array of size N using a monotonic stack run in O(N) total time?",
      [
        "The stack is sorted using Quicksort",
        "Each element is pushed onto the stack exactly once and popped at most once",
        "Stack operations use direct pointer addressing",
        "It only checks neighboring indices"
      ],
      "Each element is pushed onto the stack exactly once and popped at most once",
      "Across all iterations, there are at most N pushes and N pops, guaranteeing 2N = O(N) linear time."
    ),
    createMCQProblem(
      "m3-q2",
      "Sliding Window Maximum with Deque",
      "Queues",
      "In the sliding window maximum algorithm using a Double-Ended Queue (Deque), what invariant is maintained inside the deque?",
      [
        "Elements are strictly increasing from front to back",
        "Elements are stored in decreasing order of values from front to back",
        "Only the minimum element is retained",
        "Elements are hashed by frequency"
      ],
      "Elements are stored in decreasing order of values from front to back",
      "A monotonically decreasing deque ensures the maximum element of the current window is always accessible at the front in O(1)."
    ),
    createMCQProblem(
      "m3-q3",
      "Binary Search Tree Inorder Traversal",
      "Trees",
      "What sequence is produced by performing an Inorder (Left-Root-Right) traversal on a valid Binary Search Tree?",
      ["Descending order", "Strictly ascending sorted order", "Level-order sequence", "Pre-order sequence"],
      "Strictly ascending sorted order",
      "By BST definition, left subtree < root < right subtree; inorder traversal naturally visits elements in ascending sorted order."
    ),
    createMCQProblem(
      "m3-q4",
      "Linked List In-Place Reversal",
      "Linked Lists",
      "How many pointer re-assignments are needed per node when reversing a singly linked list iteratively in O(1) space?",
      ["1 pointer update", "2 pointer updates", "3 pointer updates", "O(N) pointer updates"],
      "1 pointer update",
      "At each step, `curr.next = prev`, using temporary variables to advance `prev` and `curr`."
    ),
    createMCQProblem(
      "m3-q5",
      "Balanced Binary Tree Height Invariant",
      "Trees",
      "What is the maximum allowed difference in height between the left and right subtrees of any node in an AVL balanced tree?",
      ["At most 0", "At most 1", "At most 2", "At most log N"],
      "At most 1",
      "AVL trees enforce balance factor |height(left) - height(right)| <= 1 at every node."
    ),
    SEED_PROBLEMS[2], // Valid Balanced Parentheses (coding)
    SEED_PROBLEMS[3], // Trapping Rain Water (coding)
  ],
};

export const ASSESSMENT_MODULE_4: Assessment = {
  id: "module-4",
  title: "Module 4 Assessment: Algorithms, Searching & Recursion",
  description: "Assessment on binary search space reduction, recursion stack frames, divide-and-conquer, and greedy choice properties.",
  duration_minutes: 60,
  is_proctored: true,
  problems: [
    createMCQProblem(
      "m4-q1",
      "Binary Search on Answer Space",
      "Binary Search",
      "When using binary search on a monotonic predicate `P(x)` where `P(x)` is false for x < target and true for x >= target, what is the termination condition?",
      [
        "low <= high with high = mid - 1",
        "low < high with mid = low + (high - low) // 2",
        "low == high - 1",
        "mid == 0"
      ],
      "low < high with mid = low + (high - low) // 2",
      "Using `low < high` and setting `high = mid` when `P(mid)` is true converges cleanly to the boundary."
    ),
    createMCQProblem(
      "m4-q2",
      "Merge Sort Auxiliary Space",
      "Sorting",
      "What is the auxiliary memory complexity required by standard top-down Merge Sort on an array of size N?",
      ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
      "O(N)",
      "Merging two sorted subarrays requires a secondary buffer of size up to N to store merged elements."
    ),
    createMCQProblem(
      "m4-q3",
      "Recursion Call Stack Overflow",
      "Recursion",
      "What causes a `RecursionError: maximum recursion depth exceeded` in recursive divide and conquer implementations?",
      [
        "Missing base case or problem size not reducing toward base case",
        "Allocating memory on the heap",
        "Using global variables",
        "Returning None"
      ],
      "Missing base case or problem size not reducing toward base case",
      "Without a reachable base case, stack frames accumulate indefinitely until OS call stack limits are breached."
    ),
    createMCQProblem(
      "m4-q4",
      "Greedy Choice Property",
      "Greedy",
      "In the Activity Selection / Interval Scheduling problem, sorting intervals by which metric guarantees optimal selection?",
      ["Start time ascending", "End time ascending", "Interval duration descending", "Interval duration ascending"],
      "End time ascending",
      "Sorting by earliest end time frees up the resource as early as possible, maximizing remaining opportunities."
    ),
    createMCQProblem(
      "m4-q5",
      "Master Theorem for Divide & Conquer",
      "Algorithms",
      "Given recurrence `T(n) = 2T(n/2) + O(n)`, what is the asymptotic runtime by the Master Theorem?",
      ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      "O(n log n)",
      "Here a=2, b=2, log_b(a)=1, and f(n)=O(n^1). By Case 2 of Master Theorem, T(n) = O(n log n)."
    ),
    SEED_PROBLEMS[7], // Find Peak Element (coding)
    SEED_PROBLEMS[6], // Merge Overlapping Intervals (coding)
  ],
};

export const ASSESSMENT_MODULE_5: Assessment = {
  id: "module-5",
  title: "Module 5 Assessment: Advanced Problem Solving, DP & Graphs",
  description: "Assessment on graph representations, topological sort, Dijkstra shortest paths, and dynamic programming state transitions.",
  duration_minutes: 60,
  is_proctored: true,
  problems: [
    createMCQProblem(
      "m5-q1",
      "Topological Sort DAG Prerequisite",
      "Graphs",
      "Why can a Directed Graph have a valid Topological Ordering if and only if it contains no directed cycles (DAG)?",
      [
        "Cycles prevent all vertices from having in-degree 0 initially, causing cyclic dependency deadlock",
        "Topological sort only works on trees",
        "Cycles cause memory overflow in BFS queue",
        "Graph edges must be undirected"
      ],
      "Cycles prevent all vertices from having in-degree 0 initially, causing cyclic dependency deadlock",
      "In a cycle u -> v -> u, u must come before v and v must come before u, making a linear ordering impossible."
    ),
    createMCQProblem(
      "m5-q2",
      "Dijkstra Negative Edge Weight Limitation",
      "Graphs",
      "Why does Dijkstra's algorithm fail to guarantee shortest paths on graphs with negative edge weights?",
      [
        "It uses a priority queue which only accepts positive numbers",
        "It assumes once a node is visited/settled, its shortest distance cannot be improved by subsequent paths",
        "Negative edges cause infinite loops in undirected graphs",
        "It cannot compute edge weights"
      ],
      "It assumes once a node is visited/settled, its shortest distance cannot be improved by subsequent paths",
      "Dijkstra greedily marks nodes as finalized; a negative edge discovered later can reduce already finalized paths."
    ),
    createMCQProblem(
      "m5-q3",
      "Dynamic Programming Overlapping Subproblems",
      "Dynamic Programming",
      "What is the key difference between Divide & Conquer and Dynamic Programming?",
      [
        "Divide & conquer solves independent subproblems; Dynamic programming memoizes overlapping subproblems",
        "Dynamic programming only works on arrays",
        "Divide & conquer cannot be implemented recursively",
        "Dynamic programming requires exponential space"
      ],
      "Divide & conquer solves independent subproblems; Dynamic programming memoizes overlapping subproblems",
      "When subproblems repeat (like Fibonacci or Knapsack), DP avoids recalculation by caching states."
    ),
    createMCQProblem(
      "m5-q4",
      "0/1 Knapsack Space Optimization",
      "Dynamic Programming",
      "When optimizing 2D DP for 0/1 Knapsack to 1D array of capacity W, why must the inner capacity loop iterate in reverse order (W down to weight[i])?",
      [
        "To avoid using an item multiple times in the same iteration",
        "Because reverse iteration is faster in hardware cache",
        "To handle negative weights",
        "Reverse iteration sorts the items"
      ],
      "To avoid using an item multiple times in the same iteration",
      "Iterating forward would use the updated values from the current item, simulating Unbounded Knapsack."
    ),
    createMCQProblem(
      "m5-q5",
      "Disjoint Set Union (DSU) Path Compression",
      "Graphs",
      "With Path Compression and Union by Rank, what is the amortized time complexity per find/union operation in DSU with N elements?",
      ["O(log N)", "O(alpha(N)) ~ O(1) Inverse Ackermann", "O(N)", "O(N log N)"],
      "O(alpha(N)) ~ O(1) Inverse Ackermann",
      "Path compression flattens tree depths, reducing operations to effectively constant time O(alpha(N))."
    ),
    SEED_PROBLEMS[5], // Minimum Coin Change (coding)
    SEED_PROBLEMS[1], // Longest Unique Substring (coding)
  ],
};

// ----------------------------------------------------------------------------
// Comprehensive 20-Question Institutional Placement Mock
// 15 MCQs (5 Quant, 5 Logic, 5 CS) + 5 Coding Problems = 20 Questions
// ----------------------------------------------------------------------------
export const ASSESSMENT_COMPREHENSIVE_MOCK: Assessment = {
  id: "assessment-1",
  title: "Campus Placement Screening Mock 2026",
  description: "Mandatory proctored placement examination featuring Quantitative Aptitude, Logical Reasoning, CS Fundamentals, and Algorithmic Coding for TCS, Zoho, Cognizant, and Infosys campus drives.",
  duration_minutes: 90,
  is_proctored: true,
  problems: [
    // 5 Quant MCQs (Q1 - Q5)
    ALL_SEED_MCQ_PROBLEMS[0],
    ALL_SEED_MCQ_PROBLEMS[1],
    ALL_SEED_MCQ_PROBLEMS[2],
    ALL_SEED_MCQ_PROBLEMS[3],
    ALL_SEED_MCQ_PROBLEMS[4],

    // 5 Logic MCQs (Q6 - Q10)
    ALL_SEED_MCQ_PROBLEMS[5],
    ALL_SEED_MCQ_PROBLEMS[6],
    ALL_SEED_MCQ_PROBLEMS[7],
    ALL_SEED_MCQ_PROBLEMS[8],
    ALL_SEED_MCQ_PROBLEMS[9],

    // 5 CS Fundamentals MCQs (Q11 - Q15)
    ALL_SEED_MCQ_PROBLEMS[10],
    ALL_SEED_MCQ_PROBLEMS[11],
    ALL_SEED_MCQ_PROBLEMS[12],
    ALL_SEED_MCQ_PROBLEMS[13],
    ALL_SEED_MCQ_PROBLEMS[14],

    // 5 Placement Coding Problems (Q16 - Q20)
    SEED_PROBLEMS[0], // Two Sum Target Pair
    SEED_PROBLEMS[1], // Longest Unique Substring
    SEED_PROBLEMS[2], // Valid Balanced Parentheses
    SEED_PROBLEMS[4], // Subarray with Given Sum
    SEED_PROBLEMS[5], // Minimum Coin Change
  ],
};

// ----------------------------------------------------------------------------
// MNC 300 Interview Preparation Units Dynamic Builder
// ----------------------------------------------------------------------------
export function getMncUnitAssessment(unitIdentifier: string): Assessment {
  const cleanId = (unitIdentifier || "").toLowerCase().trim();
  
  const unit =
    MNC_CURRICULUM_UNITS.find(
      (u) =>
        u.id.toLowerCase() === cleanId ||
        u.assessment_id.toLowerCase() === cleanId ||
        `unit-${u.unit_number}` === cleanId ||
        `mnc-unit-${u.unit_number}` === cleanId ||
        cleanId.endsWith(`-${u.unit_number}`)
    ) || MNC_CURRICULUM_UNITS[0];

  const unitMCQs = MNC_MCQS.filter((m) => unit.mcq_ids.includes(m.id));
  const mcqProblems: Problem[] = unitMCQs.map((m) =>
    createMCQProblem(
      m.id,
      `Q${m.number}: ${m.category}`,
      m.category,
      m.question,
      m.options,
      m.options[m.correct_option] || m.options[0],
      m.explanation,
      m.difficulty
    )
  );

  const unitCodeProblems = MNC_CODING_PROBLEMS.filter((p) =>
    unit.coding_problem_ids.slice(0, 2).includes(p.id)
  );
  const codingProblems: Problem[] = unitCodeProblems.map((cp) => ({
    id: cp.id,
    title: cp.title,
    slug: cp.slug,
    difficulty: cp.difficulty,
    company_tags: cp.company_tags,
    type: "coding",
    description_md: `### Problem Description\n${cp.description}\n\n### Constraints\n${cp.constraints}`,
    starter_code_json: cp.starter_code_json,
    is_public: true,
  }));

  return {
    id: unit.assessment_id,
    title: `Unit ${unit.unit_number} Proctored Assessment: ${unit.title}`,
    description: `Official 45-minute timed assessment for ${unit.title}. Covers ${unitMCQs.length} domain MCQs and ${codingProblems.length} representative coding challenges with automated evaluation. Score 75% or higher to unlock Unit ${Math.min(10, unit.unit_number + 1)}.`,
    duration_minutes: 45,
    is_proctored: true,
    problems: [...mcqProblems, ...codingProblems],
  };
}

// ----------------------------------------------------------------------------
// Registry Lookup Engine
// ----------------------------------------------------------------------------
export class AssessmentRegistry {
  private static DYNAMIC_ASSESSMENTS: Record<string, Assessment> = {};

  private static readonly ASSESSMENTS: Record<string, Assessment> = {
    "assessment-1": ASSESSMENT_COMPREHENSIVE_MOCK,
    "placement-mock": ASSESSMENT_COMPREHENSIVE_MOCK,
    "cognizant-mock": ASSESSMENT_COMPREHENSIVE_MOCK,
    "tcs-nqt-practice": ASSESSMENT_COMPREHENSIVE_MOCK,
    "module-1": ASSESSMENT_MODULE_1,
    "arrays-quiz": ASSESSMENT_MODULE_1,
    "arrays-and-strings-quiz": ASSESSMENT_MODULE_1,
    "module-2": ASSESSMENT_MODULE_2,
    "module-3": ASSESSMENT_MODULE_3,
    "mod-3-ds": ASSESSMENT_MODULE_3,
    "module-4": ASSESSMENT_MODULE_4,
    "module-5": ASSESSMENT_MODULE_5,
  };

  /**
   * Register a new teacher-created or AI-generated assessment locally and sync to Supabase
   */
  static registerAssessment(assessment: Assessment): void {
    const key = (assessment.id || "").toLowerCase().trim();
    this.ASSESSMENTS[key] = assessment;
    this.DYNAMIC_ASSESSMENTS[key] = assessment;

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("eqlv_dynamic_teacher_assessments");
        const list: Assessment[] = stored ? JSON.parse(stored) : [];
        const filtered = list.filter((a) => a.id !== assessment.id);
        localStorage.setItem(
          "eqlv_dynamic_teacher_assessments",
          JSON.stringify([assessment, ...filtered])
        );
      } catch (err) {
        console.warn("Failed to persist dynamic assessment locally:", err);
      }
    }
  }

  /**
   * Publish an assessment to Supabase via /api/assessments so students on all devices receive it
   */
  static async publishAssessmentToCloud(assessment: Assessment): Promise<boolean> {
    this.registerAssessment(assessment);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment),
      });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.persisted);
    } catch {
      return false;
    }
  }

  /**
   * Sync cloud-published assessments from Supabase into the local registry cache
   */
  static async syncFromCloud(): Promise<Assessment[]> {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.assessments)) {
          for (const a of data.assessments as Assessment[]) {
            const key = (a.id || "").toLowerCase().trim();
            if (key) {
              this.ASSESSMENTS[key] = a;
              this.DYNAMIC_ASSESSMENTS[key] = a;
            }
          }
        }
      }
    } catch {
      // Offline or unconfigured: rely on local catalog
    }
    return this.getAllAssessments();
  }

  /**
   * Retrieve all teacher assessments created dynamically
   */
  static getDynamicTeacherAssessments(): Assessment[] {
    if (typeof window === "undefined") {
      return Object.values(this.DYNAMIC_ASSESSMENTS);
    }
    try {
      const stored = localStorage.getItem("eqlv_dynamic_teacher_assessments");
      if (stored) {
        const list: Assessment[] = JSON.parse(stored);
        if (Array.isArray(list)) {
          list.forEach((a) => {
            const k = a.id.toLowerCase().trim();
            this.ASSESSMENTS[k] = a;
            this.DYNAMIC_ASSESSMENTS[k] = a;
          });
          return list;
        }
      }
    } catch {}
    return Object.values(this.DYNAMIC_ASSESSMENTS);
  }

  static getAssessment(id: string): Assessment {
    const key = (id || "").toLowerCase().trim();
    if (this.ASSESSMENTS[key]) {
      return this.ASSESSMENTS[key];
    }

    // Check dynamic teacher assessments
    const dynamicList = this.getDynamicTeacherAssessments();
    const dynamicFound = dynamicList.find((a) => a.id.toLowerCase().trim() === key);
    if (dynamicFound) {
      return dynamicFound;
    }

    // MNC 10-Unit assessments dynamic routing
    if (key.includes("mnc") || key.startsWith("unit-") || key.includes("unit-")) {
      return getMncUnitAssessment(key);
    }

    if (key.includes("1")) return ASSESSMENT_MODULE_1;
    if (key.includes("2")) return ASSESSMENT_MODULE_2;
    if (key.includes("3")) return ASSESSMENT_MODULE_3;
    if (key.includes("4")) return ASSESSMENT_MODULE_4;
    if (key.includes("5")) return ASSESSMENT_MODULE_5;

    return ASSESSMENT_COMPREHENSIVE_MOCK;
  }

  static getAllAssessments(): Assessment[] {
    const mncAssessments = MNC_CURRICULUM_UNITS.map((u) => getMncUnitAssessment(u.id));
    const dynamicTeacher = this.getDynamicTeacherAssessments();

    return [
      ...dynamicTeacher,
      ASSESSMENT_COMPREHENSIVE_MOCK,
      ASSESSMENT_MODULE_1,
      ASSESSMENT_MODULE_2,
      ASSESSMENT_MODULE_3,
      ASSESSMENT_MODULE_4,
      ASSESSMENT_MODULE_5,
      ...mncAssessments,
    ];
  }
}
