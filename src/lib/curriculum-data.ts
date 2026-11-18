import {
  CurriculumLesson,
  CurriculumModule,
  CurriculumTopic,
  CurriculumProblem,
  CurriculumTestCase,
  ModuleAssessment,
  AssessmentMCQ,
} from "@/types/curriculum";

// ============================================================================
// 10 LESSONS CATALOG (Lessons 1-7 Shared Core, Lessons 8-10 Branch Specific)
// ============================================================================
export const SEED_LESSONS: CurriculumLesson[] = [
  {
    id: "lesson-1",
    lesson_number: 1,
    title: "Foundations of Algorithmic Efficiency & Linear Structures",
    description: "Master asymptotic Big-O runtime analysis, two-pointer invariants, sliding window optimizations, and hashing mechanisms required by tier-1 tech recruiters.",
    track_type: "shared_core",
    branch_tags: ["CSE", "IT", "AIDS"],
  },
  {
    id: "lesson-2",
    lesson_number: 2,
    title: "Fast/Slow Pointers, Cyclic Sort & Binary Search Invariants",
    description: "Cycle detection, missing number mechanics, search space elimination, and monotonic search predicates.",
    track_type: "shared_core",
    branch_tags: ["CSE", "IT", "AIDS"],
  },
  {
    id: "lesson-3",
    lesson_number: 3,
    title: "Linked Lists, Monotonic Stacks & Queue Architecture",
    description: "In-place list reversal, next greater element patterns, expression parsing, and sliding window maximum with deques.",
    track_type: "shared_core",
    branch_tags: ["CSE", "IT", "AIDS"],
  },
  {
    id: "lesson-4",
    lesson_number: 4,
    title: "Trees, Binary Search Trees & Priority Heaps",
    description: "Depth-first and breadth-first tree traversals, Lowest Common Ancestor, heap median maintenance, and Trie prefixes.",
    track_type: "shared_core",
    branch_tags: ["CSE", "IT", "AIDS"],
  },
  {
    id: "lesson-5",
    lesson_number: 5,
    title: "Graph Theory, Topological Ordering & Shortest Paths",
    description: "Adjacency representations, cycle detection in DAGs, Dijkstra's algorithm, Disjoint Set Union (DSU), and minimum spanning trees.",
    track_type: "shared_core",
    branch_tags: ["CSE", "IT", "AIDS"],
  },
  {
    id: "lesson-6",
    lesson_number: 6,
    title: "Dynamic Programming, Subsequences & State Compression",
    description: "1D and 2D state transitions, 0/1 knapsack variants, longest common subsequence, matrix chain multiplication, and bitmask DP.",
    track_type: "shared_core",
    branch_tags: ["CSE", "IT", "AIDS"],
  },
  {
    id: "lesson-7",
    lesson_number: 7,
    title: "Greedy Heuristics, Backtracking & Bitwise Manipulation",
    description: "Interval scheduling, N-Queens constraint satisfaction, bitwise XOR tricks, and subset sum exploration.",
    track_type: "shared_core",
    branch_tags: ["CSE", "IT", "AIDS"],
  },
  {
    id: "lesson-8",
    lesson_number: 8,
    title: "Database Internals, Indexing & High-Performance SQL",
    description: "B-Tree vs LSM trees, query execution planners, ACID concurrency, transaction isolation levels, and complex window functions.",
    track_type: "branch_specific",
    branch_tags: ["CSE", "IT"],
  },
  {
    id: "lesson-9",
    lesson_number: 9,
    title: "Distributed Systems, Low-Level Concurrency & Cloud Scaling",
    description: "Thread synchronization, mutex locks, CAP theorem, Paxos/Raft consensus, consistent hashing, and message queues.",
    track_type: "branch_specific",
    branch_tags: ["CSE", "IT"],
  },
  {
    id: "lesson-10",
    lesson_number: 10,
    title: "Vector Search, High-Dimensional Embeddings & ML Engineering",
    description: "Matrix decompositions, cosine similarity indices, Approximate Nearest Neighbor (ANN) algorithms, and production ML pipelines.",
    track_type: "branch_specific",
    branch_tags: ["AIDS", "CSE"],
  },
];

// ============================================================================
// LESSON 1 MODULES (Module 1 & Module 2)
// ============================================================================
export const SEED_MODULES: CurriculumModule[] = [
  {
    id: "mod-1-1",
    lesson_id: "lesson-1",
    module_number: 1,
    title: "Asymptotic Analysis & Advanced Array Invariants",
    unlock_threshold: 15,
  },
  {
    id: "mod-1-2",
    lesson_id: "lesson-1",
    module_number: 2,
    title: "Hashing Mechanisms & String Pattern Optimization",
    unlock_threshold: 15,
  },
];

// ============================================================================
// TOPICS FOR LESSON 1 (5 topics in Module 1, 5 topics in Module 2 = 10 topics)
// ============================================================================
export const SEED_TOPICS: CurriculumTopic[] = [
  // Module 1 Topics
  {
    id: "topic-1-1-1",
    module_id: "mod-1-1",
    topic_order: 1,
    title: "Time & Space Big-O Asymptotic Analysis",
    concept_markdown: `### 3-Minute Concept Guide: Asymptotic Analysis

#### Core Mental Model
In campus recruitment coding rounds, your code isn't just evaluated on correctness—it is scrutinized on **scaling efficiency**.
- **Time Complexity** measures how execution steps grow relative to input size $N$.
- **Space Complexity** measures auxiliary memory allocated beyond the inputs.

| Complexity | Operations for $N=10^5$ | Typical Campus Verdict | Typical Patterns |
| :--- | :--- | :--- | :--- |
| **$O(1)$** | 1 | Instant (0.01 ms) | Math formula, hash lookup, bitwise |
| **$O(\\log N)$** | ~17 | Lightning (< 1 ms) | Binary search, GCD, divide & conquer |
| **$O(N)$** | $10^5$ | Optimal (5 ms) | Single pass, two pointers, sliding window |
| **$O(N \\log N)$** | ~1.7 × $10^6$ | Pass (20 ms) | Merge sort, heap operations, sorting |
| **$O(N^2)$** | $10^{10}$ | **TIME LIMIT EXCEEDED (TLE)** | Nested loops, naive brute force |

> **Placement Golden Rule:** If $N \\le 10^5$, your solution **MUST** run in $O(N)$ or $O(N \\log N)$. Never submit an $O(N^2)$ nested loop when $N > 10^4$.`,
  },
  {
    id: "topic-1-1-2",
    module_id: "mod-1-1",
    topic_order: 2,
    title: "Two-Pointer Technique (Opposite & Same Direction)",
    concept_markdown: `### 3-Minute Concept Guide: Two-Pointer Technique

#### Core Mental Model
Instead of testing all pairs with nested loops $O(N^2)$, maintain two index pointers that converge or slide based on a monotonic invariant.

\`\`\`
Left Pointer -> [ 2,  7, 11, 15 ] <- Right Pointer
Sum = 2 + 15 = 17 (> Target 9) -> Decrement Right Pointer
Sum = 2 + 7 = 9   (== Target)  -> Found in O(N)!
\`\`\`

#### Pattern Variations
1. **Opposite Ends (Converging):** Sorted arrays, Pair Sum, Container with Most Water, Palindrome verification.
2. **Same Direction (Fast & Slow):** Remove duplicates in-place, partition zero-shifts, linked list cycle detection.

#### Complexity Target
- Time: **$O(N)$** linear scan
- Space: **$O(1)$** constant auxiliary memory`,
  },
  {
    id: "topic-1-1-3",
    module_id: "mod-1-1",
    topic_order: 3,
    title: "Sliding Window (Fixed vs. Dynamic Expansions)",
    concept_markdown: `### 3-Minute Concept Guide: Sliding Window

#### Core Mental Model
A contiguous subsegment of an array or string whose boundaries \`[L, R]\` expand and contract dynamically to maintain a valid window condition.

\`\`\`
Initial Window:  [ 1,  4,  2 ] 10  2  (Sum = 7)
Slide Window:      [ 4,  2, 10 ] 2  (Subtract 1, Add 10 -> Sum = 16)
\`\`\`

#### Fixed vs Dynamic Rules
- **Fixed Size $K$:** Initialize window of size $K$. When stepping forward, add incoming element at $R$, subtract outgoing element at $L$.
- **Dynamic Window:** Expand $R$ until the condition breaks. Contract $L$ until validity is restored.

#### Big-O Target
- Time: **$O(N)$** since each element enters and leaves the window at most once.
- Space: **$O(1)$** to $O(K)$ auxiliary frequency table.`,
  },
  {
    id: "topic-1-1-4",
    module_id: "mod-1-1",
    topic_order: 4,
    title: "Prefix Sum & Difference Arrays",
    concept_markdown: `### 3-Minute Concept Guide: Prefix Sum & Difference Arrays

#### Core Mental Model
Precomputing cumulative aggregates enables **$O(1)$ range sum queries** and **$O(1)$ range updates**.

\`\`\`
Original Array A:     [ 3,  1,  4,  1,  5 ]
Prefix Sum P:         [ 0,  3,  4,  8,  9, 14 ]
Sum(Range L=1 to R=3) = P[R+1] - P[L] = P[4] - P[1] = 9 - 3 = 6
\`\`\`

#### Difference Array Trick (Range Updates)
To add value $V$ to all indices in range $[L, R]$ in $O(1)$:
\`\`\`
Diff[L] += V
Diff[R + 1] -= V
\`\`\`
Recover the final modified array via a single prefix sum pass!`,
  },
  {
    id: "topic-1-1-5",
    module_id: "mod-1-1",
    topic_order: 5,
    title: "Cyclic Sort & In-Place Matrix Transformations",
    concept_markdown: `### 3-Minute Concept Guide: Cyclic Sort & In-Place Matrix

#### Core Mental Model
When an array contains numbers in range $[1, N]$ or $[0, N]$, every number belongs at index \`value - 1\`. Place each number in its rightful slot by swapping!

\`\`\`
Input:   [ 3,  4, -1,  1 ]
Swap 3 -> index 2: [ -1,  4,  3,  1 ]
Swap 4 -> index 3: [ -1,  1,  3,  4 ]
Swap 1 -> index 0: [  1, -1,  3,  4 ]
First index where arr[i] != i + 1 is 1 -> Missing is 2!
\`\`\`

#### Big-O Target
- Time: **$O(N)$** (each number is swapped at most twice)
- Space: **$O(1)$** strict in-place operation`,
  },

  // Module 2 Topics
  {
    id: "topic-1-2-1",
    module_id: "mod-1-2",
    topic_order: 1,
    title: "Hash Map Collisions & Custom Probing",
    concept_markdown: `### 3-Minute Concept Guide: Hash Map Collisions & Probing

#### Core Mental Model
Hash tables convert arbitrary keys into fixed table indices via hash function $h(k) = k \\pmod M$.
When two keys map to the same slot, collision resolution is required:
1. **Separate Chaining:** Each bucket stores a linked list or Red-Black Tree ($O(\\log K)$ worst-case).
2. **Open Addressing:** Linear probing ($h(k) + i$), Quadratic probing ($h(k) + c_1 i + c_2 i^2$), or Double Hashing.

#### Amortized Cost
- Lookup / Insert / Delete: **$O(1)$ average**, $O(N)$ worst-case under adversarial collisions.`,
  },
  {
    id: "topic-1-2-2",
    module_id: "mod-1-2",
    topic_order: 2,
    title: "Rolling Hash & Rabin-Karp Substring Matching",
    concept_markdown: `### 3-Minute Concept Guide: Rolling Hash & Rabin-Karp

#### Core Mental Model
Instead of $O(N \\times M)$ naive string matching, compute a polynomial rolling hash in $O(1)$ time per sliding window:

$$H = \\left(c_0 B^{M-1} + c_1 B^{M-2} + \\dots + c_{M-1}\\right) \\pmod Q$$

When sliding by 1 character:
$$H_{new} = \\left((H_{old} - c_{old} B^{M-1}) \\times B + c_{new}\\right) \\pmod Q$$

#### Big-O Target
- Precomputation: $O(M)$
- Search: **$O(N)$** average time vs $O(N \\times M)$ naive brute force.`,
  },
  {
    id: "topic-1-2-3",
    module_id: "mod-1-2",
    topic_order: 3,
    title: "Monotonic Deque for Sliding Windows",
    concept_markdown: `### 3-Minute Concept Guide: Monotonic Deque

#### Core Mental Model
To find maximums or minimums across all sliding windows of size $K$ in $O(N)$ total time, maintain a **strictly decreasing double-ended queue** of indices.

\`\`\`
Window sliding right:
1. Pop indices from front if they fall out of window boundary (idx <= R - K).
2. Pop indices from back while arr[back] <= arr[new_elem] (they can never be max!).
3. Push new_elem index to back.
4. Front of deque is ALWAYS the maximum of the current window!
\`\`\`

#### Big-O Target
- Time: **$O(N)$** (each element enters and exits deque at most once).
- Space: **$O(K)$** auxiliary memory.`,
  },
  {
    id: "topic-1-2-4",
    module_id: "mod-1-2",
    topic_order: 4,
    title: "String Permutations & Anagram Frequency Windows",
    concept_markdown: `### 3-Minute Concept Guide: String Anagram Windows

#### Core Mental Model
Two strings are anagrams if and only if their character frequencies match identically.
Instead of sorting $O(K \\log K)$ on every window step:
- Maintain an array of size 26 for ASCII lowercase counts.
- Track a \`matches\` variable counting how many of the 26 characters currently have identical frequencies.
- Update \`matches\` in $O(1)$ when sliding one character.

#### Big-O Target
- Time: **$O(N)$**
- Space: **$O(1)$** (fixed array of length 26)`,
  },
  {
    id: "topic-1-2-5",
    module_id: "mod-1-2",
    topic_order: 5,
    title: "Two-Pass Frequency & Bitmask Matching",
    concept_markdown: `### 3-Minute Concept Guide: Two-Pass Frequency & Bitmask Matching

#### Core Mental Model
When finding unique characters, majority elements, or odd-parity occurrences:
1. **Two-Pass Frequency:** Pass 1 tallies frequencies in a hash table or array; Pass 2 inspects the first element satisfying the target predicate.
2. **Bitmask Representation:** For sets of size $\\le 32$, an integer bitmask encodes character presence in a single 32-bit register.

#### Big-O Target
- Time: **$O(N)$** linear
- Space: **$O(1)$** auxiliary space with bitwise operations`,
  },
];

// ============================================================================
// BOILERPLATE HELPER FACTORY
// ============================================================================
function createBoilerplate(funcName: string, signatureParams: string, returnType: string) {
  return {
    python: `import sys

def ${funcName}(${signatureParams}):
    # Write your optimal code here
    pass

if __name__ == "__main__":
    lines = [line.strip() for line in sys.stdin.read().strip().split("\\n") if line.strip()]
    if lines:
        print(${funcName}(lines))
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

${returnType} ${funcName}(const vector<string>& lines) {
    // Write your optimal C++ solution here
    return {};
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Read stdin
    return 0;
}
`,
    java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Write your solution logic here
    }
}
`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write optimal C solution here
    return 0;
}
`,
    sql: `-- Write your SQL query statement below
SELECT 1;
`,
  };
}

// ============================================================================
// SAMPLE SEEDED PROBLEMS WITH 6 TEST CASES EACH
// ============================================================================
export const SEED_PROBLEMS: CurriculumProblem[] = [
  // Problem 1: Guided Warmup for Topic 1-1-1
  {
    id: "prob-1-1-1-1",
    topic_id: "topic-1-1-1",
    problem_type: "practice",
    order_index: 1,
    title: "Optimal Two Sum Index Pairs",
    slug: "optimal-two-sum-index-pairs",
    difficulty: "Easy",
    practice_stage_name: "Guided Warmup",
    description_markdown: `### Problem Description
Given an array of integers \`nums\` and an integer \`target\`, find the **0-based indices** of the two numbers such that they add up to \`target\`.

You may assume that each input has **exactly one solution**, and you may not use the same element twice. Return the indices sorted in ascending order separated by a space.

### Input Format
- **Line 1:** Space-separated integers representing the array \`nums\`.
- **Line 2:** An integer \`target\`.

### Output Format
- Print two space-separated indices \`i j\` (\`i < j\`).`,
    constraints_text: `2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9`,
    company_tags: ["Zoho", "TCS Digital", "Amazon"],
    boilerplate_code: createBoilerplate("two_sum", "lines", "vector<int>"),
    hints: {
      intuition: "Instead of testing all pairs with nested loops O(N^2), ask: for each number x, what partner value y would make x + y = target?",
      data_structure: "Use a Hash Map to store previously visited elements as {element_value: index}. As you iterate, check if (target - num) exists in O(1).",
      edge_case_warning: "Watch out for duplicate values (e.g. [3, 3] with target 6). Ensure you don't pick the same index twice.",
    },
    test_cases: [
      {
        id: "tc-1-1",
        problem_id: "prob-1-1-1-1",
        case_number: 1,
        input_data: "2 7 11 15\n9",
        expected_output: "0 1",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-1-2",
        problem_id: "prob-1-1-1-1",
        case_number: 2,
        input_data: "3 2 4\n6",
        expected_output: "1 2",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-1-3",
        problem_id: "prob-1-1-1-1",
        case_number: 3,
        input_data: "3 3\n6",
        expected_output: "0 1",
        is_hidden: true,
        failure_category: "Boundary/Edge Case",
      },
      {
        id: "tc-1-4",
        problem_id: "prob-1-1-1-1",
        case_number: 4,
        input_data: "-5 10 20 -15\n-20",
        expected_output: "0 3",
        is_hidden: true,
        failure_category: "Logical Trap/Duplicates",
      },
      {
        id: "tc-1-5",
        problem_id: "prob-1-1-1-1",
        case_number: 5,
        input_data: "1 2 3 4 5 6 7 8 9 100000\n100001",
        expected_output: "0 9",
        is_hidden: true,
        failure_category: "Max Constraint TLE",
      },
      {
        id: "tc-1-6",
        problem_id: "prob-1-1-1-1",
        case_number: 6,
        input_data: "1000000000 -1000000000 5\n0",
        expected_output: "0 1",
        is_hidden: true,
        failure_category: "Memory/Integer Overflow",
      },
    ],
  },

  // Problem 2: Pattern Application for Topic 1-1-2
  {
    id: "prob-1-1-2-2",
    topic_id: "topic-1-1-2",
    problem_type: "practice",
    order_index: 2,
    title: "Container With Most Water",
    slug: "container-with-most-water",
    difficulty: "Medium",
    practice_stage_name: "Pattern Application",
    description_markdown: `### Problem Description
You are given an integer array \`height\` of length $N$. There are $N$ vertical lines drawn such that the two endpoints of the $i$-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the **most water**. Return the maximum area of water a container can store.

### Formula
$$\\text{Area} = \\min(\\text{height}[L], \\text{height}[R]) \\times (R - L)$$`,
    constraints_text: `2 <= height.length <= 10^5\n0 <= height[i] <= 10^4`,
    company_tags: ["Zoho", "Google", "Microsoft"],
    boilerplate_code: createBoilerplate("max_water", "lines", "long long"),
    hints: {
      intuition: "Start with the widest container using pointers at the left and right ends. Which pointer should move to have any hope of finding a larger area?",
      data_structure: "Two integer pointers L = 0 and R = N - 1. The bottleneck is strictly the shorter wall.",
      edge_case_warning: "Always advance the pointer pointing to the shorter vertical bar. Moving the taller one can only reduce width without increasing the height bottleneck.",
    },
    test_cases: [
      {
        id: "tc-2-1",
        problem_id: "prob-1-1-2-2",
        case_number: 1,
        input_data: "1 8 6 2 5 4 8 3 7",
        expected_output: "49",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-2-2",
        problem_id: "prob-1-1-2-2",
        case_number: 2,
        input_data: "1 1",
        expected_output: "1",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-2-3",
        problem_id: "prob-1-1-2-2",
        case_number: 3,
        input_data: "4 3 2 1 4",
        expected_output: "16",
        is_hidden: true,
        failure_category: "Boundary/Edge Case",
      },
      {
        id: "tc-2-4",
        problem_id: "prob-1-1-2-2",
        case_number: 4,
        input_data: "1 2 1",
        expected_output: "2",
        is_hidden: true,
        failure_category: "Logical Trap/Duplicates",
      },
      {
        id: "tc-2-5",
        problem_id: "prob-1-1-2-2",
        case_number: 5,
        input_data: "1000 1 1 1 1 1 1 1 1000",
        expected_output: "8000",
        is_hidden: true,
        failure_category: "Max Constraint TLE",
      },
      {
        id: "tc-2-6",
        problem_id: "prob-1-1-2-2",
        case_number: 6,
        input_data: "0 2 0 3 0 0 4 0",
        expected_output: "10",
        is_hidden: true,
        failure_category: "Memory/Integer Overflow",
      },
    ],
  },

  // Problem 3: Edge-Case Trap for Topic 1-1-3
  {
    id: "prob-1-1-3-3",
    topic_id: "topic-1-1-3",
    problem_type: "practice",
    order_index: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    practice_stage_name: "Edge-Case Trap",
    description_markdown: `### Problem Description
Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print the integer length of the longest substring.`,
    constraints_text: `0 <= s.length <= 10^5\ns consists of English letters, digits, symbols and spaces.`,
    company_tags: ["Amazon", "TCS Digital", "Infosys"],
    boilerplate_code: createBoilerplate("length_of_longest_substring", "lines", "int"),
    hints: {
      intuition: "Maintain a dynamic sliding window [L, R]. If the character at R has appeared inside the current window, contract L past its previous position.",
      data_structure: "Use a Hash Map or integer array of size 256 mapping character -> last seen index.",
      edge_case_warning: "When updating L, remember L can only move forward: L = max(L, last_seen[char] + 1). Never move L backward!",
    },
    test_cases: [
      {
        id: "tc-3-1",
        problem_id: "prob-1-1-3-3",
        case_number: 1,
        input_data: "abcabcbb",
        expected_output: "3",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-3-2",
        problem_id: "prob-1-1-3-3",
        case_number: 2,
        input_data: "bbbbb",
        expected_output: "1",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-3-3",
        problem_id: "prob-1-1-3-3",
        case_number: 3,
        input_data: "pwwkew",
        expected_output: "3",
        is_hidden: true,
        failure_category: "Boundary/Edge Case",
      },
      {
        id: "tc-3-4",
        problem_id: "prob-1-1-3-3",
        case_number: 4,
        input_data: "abba",
        expected_output: "2",
        is_hidden: true,
        failure_category: "Logical Trap/Duplicates",
      },
      {
        id: "tc-3-5",
        problem_id: "prob-1-1-3-3",
        case_number: 5,
        input_data: "abcdefghijklmnopqrstuvwxyz1234567890",
        expected_output: "36",
        is_hidden: true,
        failure_category: "Max Constraint TLE",
      },
      {
        id: "tc-3-6",
        problem_id: "prob-1-1-3-3",
        case_number: 6,
        input_data: " ",
        expected_output: "1",
        is_hidden: true,
        failure_category: "Memory/Integer Overflow",
      },
    ],
  },

  // Problem 4: Combined Concept for Topic 1-1-4
  {
    id: "prob-1-1-4-4",
    topic_id: "topic-1-1-4",
    problem_type: "practice",
    order_index: 4,
    title: "Subarray Sum Equals Target K",
    slug: "subarray-sum-equals-target-k",
    difficulty: "Medium",
    practice_stage_name: "Combined Concept",
    description_markdown: `### Problem Description
Given an array of integers \`nums\` and an integer \`k\`, return the total number of subarrays whose sum equals to \`k\`.

A subarray is a contiguous non-empty sequence of elements within an array. Negative numbers are permitted!`,
    constraints_text: `1 <= nums.length <= 10^5\n-1000 <= nums[i] <= 1000\n-10^7 <= k <= 10^7`,
    company_tags: ["Google", "Zoho", "Meta"],
    boilerplate_code: createBoilerplate("subarray_sum", "lines", "int"),
    hints: {
      intuition: "Notice: Sum(i..j) = Prefix[j] - Prefix[i-1]. If Prefix[j] - Prefix[i-1] = k, then Prefix[i-1] = Prefix[j] - k.",
      data_structure: "Maintain a Hash Map storing the frequency of running prefix sums seen so far. Initialize {0: 1} to count subarrays starting from index 0.",
      edge_case_warning: "Because elements can be negative, the prefix sum is NOT monotonic—sliding window fails! Hash Map is mandatory.",
    },
    test_cases: [
      {
        id: "tc-4-1",
        problem_id: "prob-1-1-4-4",
        case_number: 1,
        input_data: "1 1 1\n2",
        expected_output: "2",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-4-2",
        problem_id: "prob-1-1-4-4",
        case_number: 2,
        input_data: "1 2 3\n3",
        expected_output: "2",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-4-3",
        problem_id: "prob-1-1-4-4",
        case_number: 3,
        input_data: "1 -1 0\n0",
        expected_output: "3",
        is_hidden: true,
        failure_category: "Boundary/Edge Case",
      },
      {
        id: "tc-4-4",
        problem_id: "prob-1-1-4-4",
        case_number: 4,
        input_data: "0 0 0 0 0\n0",
        expected_output: "15",
        is_hidden: true,
        failure_category: "Logical Trap/Duplicates",
      },
      {
        id: "tc-4-5",
        problem_id: "prob-1-1-4-4",
        case_number: 5,
        input_data: "1000 -1000 1000 -1000\n0",
        expected_output: "4",
        is_hidden: true,
        failure_category: "Max Constraint TLE",
      },
      {
        id: "tc-4-6",
        problem_id: "prob-1-1-4-4",
        case_number: 6,
        input_data: "3 4 7 2 -3 1 4 2\n7",
        expected_output: "4",
        is_hidden: true,
        failure_category: "Memory/Integer Overflow",
      },
    ],
  },

  // Problem 5: Company Hard Challenge for Topic 1-1-5
  {
    id: "prob-1-1-5-5",
    topic_id: "topic-1-1-5",
    problem_type: "practice",
    order_index: 5,
    title: "First Missing Positive Integer",
    slug: "first-missing-positive-integer",
    difficulty: "Hard",
    practice_stage_name: "Company Hard Challenge",
    description_markdown: `### Problem Description
Given an unsorted integer array \`nums\`, return the **smallest positive integer** that is not present in \`nums\`.

You must implement an algorithm that runs in **$O(N)$ time** and uses **$O(1)$ auxiliary space**.

### Input Format
- A single line of space-separated integers.

### Output Format
- Print the smallest missing positive integer.`,
    constraints_text: `1 <= nums.length <= 10^5\n-2^31 <= nums[i] <= 2^31 - 1`,
    company_tags: ["Zoho", "Google", "Amazon", "Microsoft"],
    boilerplate_code: createBoilerplate("first_missing_positive", "lines", "int"),
    hints: {
      intuition: "For an array of length N, the answer must lie strictly in the range [1, N + 1]. Can we use the array itself as a hash table?",
      data_structure: "Cyclic sort: Place each number x in range [1, N] at index x - 1 using in-place swaps.",
      edge_case_warning: "Ignore negative numbers, zeros, and numbers > N. Be careful with duplicates to avoid infinite swap loops!",
    },
    test_cases: [
      {
        id: "tc-5-1",
        problem_id: "prob-1-1-5-5",
        case_number: 1,
        input_data: "1 2 0",
        expected_output: "3",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-5-2",
        problem_id: "prob-1-1-5-5",
        case_number: 2,
        input_data: "3 4 -1 1",
        expected_output: "2",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-5-3",
        problem_id: "prob-1-1-5-5",
        case_number: 3,
        input_data: "7 8 9 11 12",
        expected_output: "1",
        is_hidden: true,
        failure_category: "Boundary/Edge Case",
      },
      {
        id: "tc-5-4",
        problem_id: "prob-1-1-5-5",
        case_number: 4,
        input_data: "1 1",
        expected_output: "2",
        is_hidden: true,
        failure_category: "Logical Trap/Duplicates",
      },
      {
        id: "tc-5-5",
        problem_id: "prob-1-1-5-5",
        case_number: 5,
        input_data: "2",
        expected_output: "1",
        is_hidden: true,
        failure_category: "Max Constraint TLE",
      },
      {
        id: "tc-5-6",
        problem_id: "prob-1-1-5-5",
        case_number: 6,
        input_data: "1",
        expected_output: "2",
        is_hidden: true,
        failure_category: "Memory/Integer Overflow",
      },
    ],
  },

  // Problem 6: Assessment Coding Problem for Module 1
  {
    id: "prob-1-1-assess-1",
    topic_id: "topic-1-1-2",
    problem_type: "assessment",
    order_index: 1,
    title: "Trapping Rain Water Capacity",
    slug: "trapping-rain-water-capacity",
    difficulty: "Hard",
    description_markdown: `### Assessment Problem: Trapping Rain Water Capacity
Given $N$ non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

### Input Format
- A single line of space-separated integers representing elevation heights.

### Output Format
- Print a single integer representing total trapped rain units.`,
    constraints_text: `1 <= height.length <= 10^5\n0 <= height[i] <= 10^5`,
    company_tags: ["Zoho", "Google", "Amazon"],
    boilerplate_code: createBoilerplate("trap_water", "lines", "long long"),
    hints: {
      intuition: "Water above bar i is determined by min(max_left, max_right) - height[i]. Can two pointers maintain these bounds in O(1) space?",
      data_structure: "Two pointers L = 0, R = N - 1 tracking left_max and right_max.",
      edge_case_warning: "Monotonically increasing or decreasing elevations trap 0 water.",
    },
    test_cases: [
      {
        id: "tc-assess-1-1",
        problem_id: "prob-1-1-assess-1",
        case_number: 1,
        input_data: "0 1 0 2 1 0 1 3 2 1 2 1",
        expected_output: "6",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-assess-1-2",
        problem_id: "prob-1-1-assess-1",
        case_number: 2,
        input_data: "4 2 0 3 2 5",
        expected_output: "9",
        is_hidden: false,
        failure_category: "Sample Case",
      },
      {
        id: "tc-assess-1-3",
        problem_id: "prob-1-1-assess-1",
        case_number: 3,
        input_data: "1 2 3 4 5",
        expected_output: "0",
        is_hidden: true,
        failure_category: "Boundary/Edge Case",
      },
      {
        id: "tc-assess-1-4",
        problem_id: "prob-1-1-assess-1",
        case_number: 4,
        input_data: "5 4 1 2",
        expected_output: "1",
        is_hidden: true,
        failure_category: "Logical Trap/Duplicates",
      },
      {
        id: "tc-assess-1-5",
        problem_id: "prob-1-1-assess-1",
        case_number: 5,
        input_data: "2 0 2",
        expected_output: "2",
        is_hidden: true,
        failure_category: "Max Constraint TLE",
      },
      {
        id: "tc-assess-1-6",
        problem_id: "prob-1-1-assess-1",
        case_number: 6,
        input_data: "5 0 0 0 5",
        expected_output: "15",
        is_hidden: true,
        failure_category: "Memory/Integer Overflow",
      },
    ],
  },

  // Problem 7: Assessment Coding Challenge 2 (Topic 1)
  {
    id: "prob-1-1-assess-2",
    topic_id: "topic-1-1-1",
    problem_type: "assessment",
    order_index: 2,
    title: "Maximum Subarray Kadane's Optimal",
    slug: "maximum-subarray-kadanes-optimal",
    difficulty: "Medium",
    description_markdown: `### Assessment Problem: Maximum Subarray Kadane's Optimal
Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

You must design an algorithm that runs in $O(N)$ linear time.`,
    constraints_text: `1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4`,
    company_tags: ["TCS Digital", "Amazon", "Microsoft"],
    boilerplate_code: createBoilerplate("max_sub_array", "lines", "int"),
    hints: {
      intuition: "Kadane's algorithm: at each index, decide whether to extend the previous subarray or start fresh from current element.",
      data_structure: "Track current_sum and max_so_far.",
      edge_case_warning: "All negative numbers: the answer is the least negative single element.",
    },
    test_cases: [
      { id: "tc-a2-1", problem_id: "prob-1-1-assess-2", case_number: 1, input_data: "-2 1 -3 4 -1 2 1 -5 4", expected_output: "6", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a2-2", problem_id: "prob-1-1-assess-2", case_number: 2, input_data: "1", expected_output: "1", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a2-3", problem_id: "prob-1-1-assess-2", case_number: 3, input_data: "5 4 -1 7 8", expected_output: "23", is_hidden: true, failure_category: "Boundary/Edge Case" },
      { id: "tc-a2-4", problem_id: "prob-1-1-assess-2", case_number: 4, input_data: "-1 -2 -3 -4", expected_output: "-1", is_hidden: true, failure_category: "Logical Trap/Duplicates" },
      { id: "tc-a2-5", problem_id: "prob-1-1-assess-2", case_number: 5, input_data: "1000 2000 -500 3000", expected_output: "5500", is_hidden: true, failure_category: "Max Constraint TLE" },
      { id: "tc-a2-6", problem_id: "prob-1-1-assess-2", case_number: 6, input_data: "-10000 0 -5", expected_output: "0", is_hidden: true, failure_category: "Memory/Integer Overflow" },
    ],
  },

  // Problem 8: Assessment Coding Challenge 3 (Topic 3)
  {
    id: "prob-1-1-assess-3",
    topic_id: "topic-1-1-3",
    problem_type: "assessment",
    order_index: 3,
    title: "Minimum Window Substring Invariant",
    slug: "minimum-window-substring-invariant",
    difficulty: "Hard",
    description_markdown: `### Assessment Problem: Minimum Window Substring
Given two strings \`s\` and \`t\`, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included in the window.

If there is no such substring, return the empty string \`""\`.`,
    constraints_text: `1 <= s.length, t.length <= 10^5\ns and t consist of uppercase and lowercase English letters.`,
    company_tags: ["Google", "Meta", "Zoho"],
    boilerplate_code: createBoilerplate("min_window", "lines", "string"),
    hints: {
      intuition: "Sliding window with frequency hash table. Expand right pointer until window is valid, contract left pointer to minimize length.",
      data_structure: "Frequency map for t, frequency map for window, and a match counter.",
      edge_case_warning: "Character counts in s must meet or exceed counts in t.",
    },
    test_cases: [
      { id: "tc-a3-1", problem_id: "prob-1-1-assess-3", case_number: 1, input_data: "ADOBECODEBANC\nABC", expected_output: "BANC", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a3-2", problem_id: "prob-1-1-assess-3", case_number: 2, input_data: "a\na", expected_output: "a", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a3-3", problem_id: "prob-1-1-assess-3", case_number: 3, input_data: "a\naa", expected_output: "", is_hidden: true, failure_category: "Boundary/Edge Case" },
      { id: "tc-a3-4", problem_id: "prob-1-1-assess-3", case_number: 4, input_data: "aaflslflsldkalskaaa\naaa", expected_output: "aaa", is_hidden: true, failure_category: "Logical Trap/Duplicates" },
      { id: "tc-a3-5", problem_id: "prob-1-1-assess-3", case_number: 5, input_data: "abcdebdde\nbde", expected_output: "bde", is_hidden: true, failure_category: "Max Constraint TLE" },
      { id: "tc-a3-6", problem_id: "prob-1-1-assess-3", case_number: 6, input_data: "zxywvu\nabc", expected_output: "", is_hidden: true, failure_category: "Memory/Integer Overflow" },
    ],
  },

  // Problem 9: Assessment Coding Challenge 4 (Topic 4)
  {
    id: "prob-1-1-assess-4",
    topic_id: "topic-1-1-4",
    problem_type: "assessment",
    order_index: 4,
    title: "Continuous Subarray Sum Multiple of K",
    slug: "continuous-subarray-sum-multiple-of-k",
    difficulty: "Medium",
    description_markdown: `### Assessment Problem: Continuous Subarray Sum Multiple of K
Given an integer array \`nums\` and an integer \`k\`, return \`true\` if \`nums\` has a continuous subarray of size at least **two** whose elements sum up to a multiple of \`k\`, or \`false\` otherwise.

An integer $x$ is a multiple of $k$ if there exists an integer $n$ such that $x = n \\times k$. $0$ is always a multiple of $k$.`,
    constraints_text: `1 <= nums.length <= 10^5\n0 <= nums[i] <= 10^9\n1 <= k <= 2^31 - 1`,
    company_tags: ["Facebook", "Amazon", "Infosys"],
    boilerplate_code: createBoilerplate("check_subarray_sum", "lines", "bool"),
    hints: {
      intuition: "Prefix sum modulo k: If (prefix[j] - prefix[i]) % k == 0, then prefix[j] % k == prefix[i] % k.",
      data_structure: "Hash map storing {remainder: first_seen_index}. Initialize {0: -1} to handle prefix starting from index 0.",
      edge_case_warning: "The subarray length must be at least 2: j - first_seen_index >= 2.",
    },
    test_cases: [
      { id: "tc-a4-1", problem_id: "prob-1-1-assess-4", case_number: 1, input_data: "23 2 4 6 7\n6", expected_output: "true", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a4-2", problem_id: "prob-1-1-assess-4", case_number: 2, input_data: "23 2 6 4 7\n6", expected_output: "true", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a4-3", problem_id: "prob-1-1-assess-4", case_number: 3, input_data: "23 2 6 4 7\n13", expected_output: "false", is_hidden: true, failure_category: "Boundary/Edge Case" },
      { id: "tc-a4-4", problem_id: "prob-1-1-assess-4", case_number: 4, input_data: "0 0\n1", expected_output: "true", is_hidden: true, failure_category: "Logical Trap/Duplicates" },
      { id: "tc-a4-5", problem_id: "prob-1-1-assess-4", case_number: 5, input_data: "5 0 0 0\n3", expected_output: "true", is_hidden: true, failure_category: "Max Constraint TLE" },
      { id: "tc-a4-6", problem_id: "prob-1-1-assess-4", case_number: 6, input_data: "1 0\n2", expected_output: "false", is_hidden: true, failure_category: "Memory/Integer Overflow" },
    ],
  },

  // Problem 10: Assessment Coding Challenge 5 (Topic 5)
  {
    id: "prob-1-1-assess-5",
    topic_id: "topic-1-1-5",
    problem_type: "assessment",
    order_index: 5,
    title: "Find All Duplicates in Linear Time",
    slug: "find-all-duplicates-in-linear-time",
    difficulty: "Medium",
    description_markdown: `### Assessment Problem: Find All Duplicates in an Array
Given an integer array \`nums\` of length $N$ where all the integers of \`nums\` are in the range $[1, N]$ and each integer appears **at most twice**, return an array of all the integers that appear twice.

You must write an algorithm that runs in $O(N)$ time and uses only $O(1)$ auxiliary space. Output the duplicates sorted in ascending order.`,
    constraints_text: `1 <= nums.length <= 10^5\n1 <= nums[i] <= nums.length`,
    company_tags: ["Microsoft", "Zoho", "Cognizant"],
    boilerplate_code: createBoilerplate("find_duplicates", "lines", "vector<int>"),
    hints: {
      intuition: "Since values are in [1, N], you can use the sign of nums[abs(val) - 1] as an in-place visited flag!",
      data_structure: "Negate elements in-place: if nums[abs(x) - 1] < 0, then x is a duplicate.",
      edge_case_warning: "Remember to use abs() when using array elements as indices.",
    },
    test_cases: [
      { id: "tc-a5-1", problem_id: "prob-1-1-assess-5", case_number: 1, input_data: "4 3 2 7 8 2 3 1", expected_output: "2 3", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a5-2", problem_id: "prob-1-1-assess-5", case_number: 2, input_data: "1 1 2", expected_output: "1", is_hidden: false, failure_category: "Sample Case" },
      { id: "tc-a5-3", problem_id: "prob-1-1-assess-5", case_number: 3, input_data: "1", expected_output: "", is_hidden: true, failure_category: "Boundary/Edge Case" },
      { id: "tc-a5-4", problem_id: "prob-1-1-assess-5", case_number: 4, input_data: "2 2", expected_output: "2", is_hidden: true, failure_category: "Logical Trap/Duplicates" },
      { id: "tc-a5-5", problem_id: "prob-1-1-assess-5", case_number: 5, input_data: "1 2 3 4 5", expected_output: "", is_hidden: true, failure_category: "Max Constraint TLE" },
      { id: "tc-a5-6", problem_id: "prob-1-1-assess-5", case_number: 6, input_data: "5 4 6 7 9 3 10 9 5 6", expected_output: "5 6 9", is_hidden: true, failure_category: "Memory/Integer Overflow" },
    ],
  },
];

// ============================================================================
// MODULE ASSESSMENTS (Module 1 Assessment: 90 mins, passing score 80)
// ============================================================================
export const SEED_ASSESSMENTS: ModuleAssessment[] = [
  {
    id: "assess-mod-1-1",
    module_id: "mod-1-1",
    duration_minutes: 90,
    passing_score: 80,
    mcqs: [
      {
        id: "mcq-1-1",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-1",
        order_index: 1,
        question_markdown: "What is the worst-case time complexity of finding a pair with given sum in an **unsorted** array of size $N$ using a Hash Set?",
        question_category: "Complexity",
        options: ["O(N log N)", "O(1)", "O(N)", "O(N^2) under hash collisions"],
        correct_option_index: 3,
      },
      {
        id: "mcq-1-2",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-1",
        order_index: 2,
        question_markdown: "Analyze the asymptotic time complexity of the following snippet:",
        code_snippet: `for (int i = 1; i <= n; i *= 2) {
    for (int j = 0; j < i; j++) {
        count++;
    }
}`,
        question_category: "Output Prediction",
        options: ["O(N)", "O(N log N)", "O(log N)", "O(N^2)"],
        correct_option_index: 0,
      },
      {
        id: "mcq-1-3",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-2",
        order_index: 3,
        question_markdown: "In the Two-Pointer opposite-direction technique for sorted arrays, which condition guarantees that moving pointer $L$ to $L+1$ will never decrease the sum?",
        question_category: "Architecture",
        options: [
          "The array elements are strictly non-negative",
          "The array is sorted in ascending order",
          "All elements are unique",
          "Array size is a power of 2"
        ],
        correct_option_index: 1,
      },
      {
        id: "mcq-1-4",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-2",
        order_index: 4,
        question_markdown: "Identify the critical bug in this Two-Pointer palindrome checking function:",
        code_snippet: `bool isPalindrome(string s) {
    int L = 0, R = s.length() - 1;
    while (L < R) {
        if (s[L++] != s[R--]) return false;
    }
    return true;
}`,
        question_category: "Bug Spotting",
        options: [
          "Fails to handle odd-length strings",
          "Fails to ignore non-alphanumeric characters and casing",
          "Causes buffer overflow at s[L++]",
          "Infinite loop when string has length 1"
        ],
        correct_option_index: 1,
      },
      {
        id: "mcq-1-5",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-3",
        order_index: 5,
        question_markdown: "In a dynamic sliding window algorithm for positive integers, why is the overall time complexity $O(N)$ despite a nested \`while\` loop?",
        question_category: "Complexity",
        options: [
          "The inner loop runs in O(log N)",
          "Amortized analysis: Left pointer increments at most N times total",
          "The compiler vectorizes the inner loop",
          "It is only O(N) on sorted inputs"
        ],
        correct_option_index: 1,
      },
      {
        id: "mcq-1-6",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-3",
        order_index: 6,
        question_markdown: "What will be printed when computing maximum sum of a fixed window of size $K=3$ on array \`[2, 1, 5, 1, 3, 2]\`?",
        question_category: "Output Prediction",
        options: ["8", "9", "7", "11"],
        correct_option_index: 1,
      },
      {
        id: "mcq-1-7",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-4",
        order_index: 7,
        question_markdown: "To perform multiple range additions \`[L, R] += V\` in $O(1)$ each, which technique should be preferred over Prefix Sum?",
        question_category: "Architecture",
        options: ["Difference Array", "Segment Tree", "Binary Indexed Tree", "Sparse Table"],
        correct_option_index: 0,
      },
      {
        id: "mcq-1-8",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-4",
        order_index: 8,
        question_markdown: "What bug occurs if you use a standard sliding window on \`Subarray Sum Equals K\` when elements can be negative?",
        question_category: "Bug Spotting",
        options: [
          "Integer overflow in prefix counter",
          "The window sum is not monotonic, so expanding/contracting misses valid subarrays",
          "Array out-of-bounds exception",
          "Hash collisions in memory"
        ],
        correct_option_index: 1,
      },
      {
        id: "mcq-1-9",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-5",
        order_index: 9,
        question_markdown: "What is the maximum number of swaps performed during Cyclic Sort on an array of size $N$?",
        question_category: "Complexity",
        options: ["N log N", "2N", "N^2", "N - 1"],
        correct_option_index: 3,
      },
      {
        id: "mcq-1-10",
        assessment_id: "assess-mod-1-1",
        topic_id: "topic-1-1-5",
        order_index: 10,
        question_markdown: "Which in-place matrix transformation rotates an $N \\times N$ matrix 90 degrees clockwise without allocating a secondary buffer?",
        question_category: "Architecture",
        options: [
          "Transpose matrix, then reverse each row",
          "Reverse each column, then transpose",
          "Reverse each row, then reverse each column",
          "Circular shift rows by 1"
        ],
        correct_option_index: 0,
      },
    ],
  },
];
