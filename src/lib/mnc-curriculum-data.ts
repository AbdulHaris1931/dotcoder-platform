// Generated from MNC_Interview_300_Questions_Coding_and_MCQ.pdf
// Contains 100 Coding Problems, 200 Technical MCQs with Part III Answer Keys, and 10 Curriculum Units.

export interface MncCodingProblem {
  id: string;
  number: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  constraints: string;
  company_tags: string[];
  starter_code_json: Record<string, string>;
}

export interface MncMCQ {
  id: string;
  number: number;
  question: string;
  options: string[];
  correct_option: number;
  correct_letter: "A" | "B" | "C" | "D";
  correct_answer_text: string;
  category: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface MncUnit {
  id: string;
  unit_number: number;
  title: string;
  subtitle: string;
  description: string;
  domain_tag: string;
  coding_problem_ids: string[];
  mcq_ids: string[];
  assessment_id: string;
  duration_minutes: number;
  passing_score: number;
  unlock_threshold: number;
}

export const MNC_CODING_PROBLEMS: MncCodingProblem[] = [
  {
    "id": "mnc-code-001",
    "number": 1,
    "title": "Reverse an integer",
    "slug": "mnc-reverse-an-integer",
    "difficulty": "Easy",
    "category": "Basics & Number Logic",
    "description": "Read an integer and output its digits in reverse order; preserve its sign.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 001: Reverse an integer\n# Category: Basics & Number Logic [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 001: Reverse an integer\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 001: Reverse an integer\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 001: Reverse an integer\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-002",
    "number": 2,
    "title": "Palindrome number",
    "slug": "mnc-palindrome-number",
    "difficulty": "Easy",
    "category": "Basics & Number Logic",
    "description": "Check whether a nonnegative integer reads the same backward.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 002: Palindrome number\n# Category: Basics & Number Logic [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 002: Palindrome number\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 002: Palindrome number\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 002: Palindrome number\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-003",
    "number": 3,
    "title": "Prime check",
    "slug": "mnc-prime-check",
    "difficulty": "Easy",
    "category": "Basics & Number Logic",
    "description": "Determine whether a given integer greater than 1 is prime.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 003: Prime check\n# Category: Basics & Number Logic [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 003: Prime check\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 003: Prime check\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 003: Prime check\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-004",
    "number": 4,
    "title": "Primes in a range",
    "slug": "mnc-primes-in-a-range",
    "difficulty": "Easy",
    "category": "Basics & Number Logic",
    "description": "Print every prime number between inclusive limits L and R.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 004: Primes in a range\n# Category: Basics & Number Logic [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 004: Primes in a range\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 004: Primes in a range\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 004: Primes in a range\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-005",
    "number": 5,
    "title": "Factorial",
    "slug": "mnc-factorial",
    "difficulty": "Easy",
    "category": "Basics & Number Logic",
    "description": "Compute n! for a nonnegative integer n.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 005: Factorial\n# Category: Basics & Number Logic [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 005: Factorial\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 005: Factorial\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 005: Factorial\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-006",
    "number": 6,
    "title": "Largest and second largest",
    "slug": "mnc-largest-and-second-largest",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "description": "Find the largest and second distinct largest elements of an integer array.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 006: Largest and second largest\n# Category: Arrays & Hashing [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 006: Largest and second largest\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 006: Largest and second largest\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 006: Largest and second largest\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-007",
    "number": 7,
    "title": "Reverse an array",
    "slug": "mnc-reverse-an-array",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "description": "Reverse an array in place using constant auxiliary space.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 007: Reverse an array\n# Category: Arrays & Hashing [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 007: Reverse an array\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 007: Reverse an array\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 007: Reverse an array\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-008",
    "number": 8,
    "title": "Rotate array by k",
    "slug": "mnc-rotate-array-by-k",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "description": "Rotate an array to the right by k steps, accounting for k larger than n.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 008: Rotate array by k\n# Category: Arrays & Hashing [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 008: Rotate array by k\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 008: Rotate array by k\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 008: Rotate array by k\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-009",
    "number": 9,
    "title": "Remove duplicates from sorted array",
    "slug": "mnc-remove-duplicates-from-sorted-array",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "description": "Compact a sorted array in place and return its number of unique elements.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 009: Remove duplicates from sorted array\n# Category: Arrays & Hashing [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 009: Remove duplicates from sorted array\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 009: Remove duplicates from sorted array\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 009: Remove duplicates from sorted array\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-010",
    "number": 10,
    "title": "Move zeros to end",
    "slug": "mnc-move-zeros-to-end",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "description": "Move all zeros to the end while maintaining the order of nonzero values.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 010: Move zeros to end\n# Category: Arrays & Hashing [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 010: Move zeros to end\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 010: Move zeros to end\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 010: Move zeros to end\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-011",
    "number": 11,
    "title": "Two sum",
    "slug": "mnc-two-sum",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Return indices of two distinct array items whose sum equals the target.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 011: Two sum\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 011: Two sum\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 011: Two sum\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 011: Two sum\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-012",
    "number": 12,
    "title": "Missing number",
    "slug": "mnc-missing-number",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "An array contains n distinct integers from 0 through n; find the missing integer.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 012: Missing number\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 012: Missing number\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 012: Missing number\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 012: Missing number\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-013",
    "number": 13,
    "title": "Find duplicate number",
    "slug": "mnc-find-duplicate-number",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "An array of n+1 integers has values from 1 through n; find a repeated value.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 013: Find duplicate number\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 013: Find duplicate number\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 013: Find duplicate number\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 013: Find duplicate number\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-014",
    "number": 14,
    "title": "Majority element",
    "slug": "mnc-majority-element",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Find a value occurring more than floor(n/2) times, if one exists.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 014: Majority element\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 014: Majority element\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 014: Majority element\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 014: Majority element\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-015",
    "number": 15,
    "title": "Maximum subarray sum",
    "slug": "mnc-maximum-subarray-sum",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Find the largest possible sum of a nonempty contiguous subarray.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 015: Maximum subarray sum\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 015: Maximum subarray sum\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 015: Maximum subarray sum\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 015: Maximum subarray sum\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-016",
    "number": 16,
    "title": "Best stock profit",
    "slug": "mnc-best-stock-profit",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Given daily prices, maximize profit from one buy followed by one sell.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 016: Best stock profit\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 016: Best stock profit\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 016: Best stock profit\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 016: Best stock profit\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-017",
    "number": 17,
    "title": "Product except self",
    "slug": "mnc-product-except-self",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Return the product of all elements except the current one without division.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 017: Product except self\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 017: Product except self\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 017: Product except self\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 017: Product except self\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-018",
    "number": 18,
    "title": "Merge sorted arrays",
    "slug": "mnc-merge-sorted-arrays",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Merge two sorted arrays into a single sorted result.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 018: Merge sorted arrays\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 018: Merge sorted arrays\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 018: Merge sorted arrays\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 018: Merge sorted arrays\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-019",
    "number": 19,
    "title": "Intersection of arrays",
    "slug": "mnc-intersection-of-arrays",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Return distinct values present in both integer arrays.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 019: Intersection of arrays\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 019: Intersection of arrays\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 019: Intersection of arrays\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 019: Intersection of arrays\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-020",
    "number": 20,
    "title": "Subarray sum equals k",
    "slug": "mnc-subarray-sum-equals-k",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Count contiguous subarrays whose elements sum to k.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 020: Subarray sum equals k\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 020: Subarray sum equals k\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 020: Subarray sum equals k\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 020: Subarray sum equals k\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-021",
    "number": 21,
    "title": "Longest consecutive sequence",
    "slug": "mnc-longest-consecutive-sequence",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Find the length of the longest consecutive-value sequence in an unsorted array.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 021: Longest consecutive sequence\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 021: Longest consecutive sequence\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 021: Longest consecutive sequence\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 021: Longest consecutive sequence\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-022",
    "number": 22,
    "title": "Sort 0s, 1s and 2s",
    "slug": "mnc-sort-0s-1s-and-2s",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Sort an array containing only 0, 1 and 2 in linear time.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 022: Sort 0s, 1s and 2s\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 022: Sort 0s, 1s and 2s\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 022: Sort 0s, 1s and 2s\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 022: Sort 0s, 1s and 2s\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-023",
    "number": 23,
    "title": "Trapping rain water",
    "slug": "mnc-trapping-rain-water",
    "difficulty": "Hard",
    "category": "Arrays & Hashing",
    "description": "Given bar heights, compute the total water retained after rain.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 023: Trapping rain water\n# Category: Arrays & Hashing [Hard]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 023: Trapping rain water\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 023: Trapping rain water\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 023: Trapping rain water\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-024",
    "number": 24,
    "title": "Container with most water",
    "slug": "mnc-container-with-most-water",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Choose two vertical lines that maximize contained water area.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 024: Container with most water\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 024: Container with most water\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 024: Container with most water\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 024: Container with most water\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-025",
    "number": 25,
    "title": "Top k frequent elements",
    "slug": "mnc-top-k-frequent-elements",
    "difficulty": "Medium",
    "category": "Arrays & Hashing",
    "description": "Return the k most frequent distinct array values.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 025: Top k frequent elements\n# Category: Arrays & Hashing [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 025: Top k frequent elements\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 025: Top k frequent elements\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 025: Top k frequent elements\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-026",
    "number": 26,
    "title": "Reverse a string",
    "slug": "mnc-reverse-a-string",
    "difficulty": "Easy",
    "category": "Strings & Sliding Window",
    "description": "Reverse the characters of a string without using a library reversal function.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 026: Reverse a string\n# Category: Strings & Sliding Window [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 026: Reverse a string\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 026: Reverse a string\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 026: Reverse a string\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-027",
    "number": 27,
    "title": "Palindrome string",
    "slug": "mnc-palindrome-string",
    "difficulty": "Easy",
    "category": "Strings & Sliding Window",
    "description": "Check whether a string is a palindrome ignoring case and nonalphanumeric characters.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 027: Palindrome string\n# Category: Strings & Sliding Window [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 027: Palindrome string\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 027: Palindrome string\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 027: Palindrome string\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-028",
    "number": 28,
    "title": "Anagram check",
    "slug": "mnc-anagram-check",
    "difficulty": "Easy",
    "category": "Strings & Sliding Window",
    "description": "Determine whether two strings contain exactly the same character counts.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 028: Anagram check\n# Category: Strings & Sliding Window [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 028: Anagram check\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 028: Anagram check\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 028: Anagram check\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-029",
    "number": 29,
    "title": "First nonrepeating character",
    "slug": "mnc-first-nonrepeating-character",
    "difficulty": "Easy",
    "category": "Strings & Sliding Window",
    "description": "Find the first character with frequency one, or report none.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 029: First nonrepeating character\n# Category: Strings & Sliding Window [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 029: First nonrepeating character\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 029: First nonrepeating character\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 029: First nonrepeating character\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-030",
    "number": 30,
    "title": "Character frequency",
    "slug": "mnc-character-frequency",
    "difficulty": "Easy",
    "category": "Strings & Sliding Window",
    "description": "Produce the frequency of each character of an input string.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 030: Character frequency\n# Category: Strings & Sliding Window [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 030: Character frequency\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 030: Character frequency\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 030: Character frequency\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-031",
    "number": 31,
    "title": "Remove duplicate characters",
    "slug": "mnc-remove-duplicate-characters",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Keep only the first occurrence of each character, preserving order.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 031: Remove duplicate characters\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 031: Remove duplicate characters\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 031: Remove duplicate characters\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 031: Remove duplicate characters\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-032",
    "number": 32,
    "title": "Longest common prefix",
    "slug": "mnc-longest-common-prefix",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Find the longest shared prefix of all strings in a list.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 032: Longest common prefix\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 032: Longest common prefix\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 032: Longest common prefix\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 032: Longest common prefix\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-033",
    "number": 33,
    "title": "Valid parentheses",
    "slug": "mnc-valid-parentheses",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Determine whether brackets (), [] and {} are correctly balanced and nested.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 033: Valid parentheses\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 033: Valid parentheses\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 033: Valid parentheses\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 033: Valid parentheses\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-034",
    "number": 34,
    "title": "Longest substring without repeats",
    "slug": "mnc-longest-substring-without-repeats",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Return the length of the longest substring with all distinct characters.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 034: Longest substring without repeats\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 034: Longest substring without repeats\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 034: Longest substring without repeats\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 034: Longest substring without repeats\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-035",
    "number": 35,
    "title": "Longest palindromic substring",
    "slug": "mnc-longest-palindromic-substring",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Return any longest contiguous palindromic substring.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 035: Longest palindromic substring\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 035: Longest palindromic substring\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 035: Longest palindromic substring\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 035: Longest palindromic substring\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-036",
    "number": 36,
    "title": "Group anagrams",
    "slug": "mnc-group-anagrams",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Partition strings into groups where each group consists of anagrams.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 036: Group anagrams\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 036: Group anagrams\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 036: Group anagrams\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 036: Group anagrams\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-037",
    "number": 37,
    "title": "String compression",
    "slug": "mnc-string-compression",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Compress runs of repeated characters into character-count pairs.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 037: String compression\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 037: String compression\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 037: String compression\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 037: String compression\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-038",
    "number": 38,
    "title": "Minimum window substring",
    "slug": "mnc-minimum-window-substring",
    "difficulty": "Hard",
    "category": "Strings & Sliding Window",
    "description": "Find the shortest substring containing all required target characters with multiplicity.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 038: Minimum window substring\n# Category: Strings & Sliding Window [Hard]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 038: Minimum window substring\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 038: Minimum window substring\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 038: Minimum window substring\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-039",
    "number": 39,
    "title": "Check string rotations",
    "slug": "mnc-check-string-rotations",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Determine whether one string is a rotation of another.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 039: Check string rotations\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 039: Check string rotations\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 039: Check string rotations\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 039: Check string rotations\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-040",
    "number": 40,
    "title": "Word frequency",
    "slug": "mnc-word-frequency",
    "difficulty": "Medium",
    "category": "Strings & Sliding Window",
    "description": "Split text into words and return case-insensitive frequency counts.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 040: Word frequency\n# Category: Strings & Sliding Window [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 040: Word frequency\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 040: Word frequency\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 040: Word frequency\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-041",
    "number": 41,
    "title": "Implement merge sort",
    "slug": "mnc-implement-merge-sort",
    "difficulty": "Easy",
    "category": "Sorting & Binary Search",
    "description": "Sort an integer array using merge sort.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 041: Implement merge sort\n# Category: Sorting & Binary Search [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 041: Implement merge sort\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 041: Implement merge sort\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 041: Implement merge sort\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-042",
    "number": 42,
    "title": "Implement quicksort",
    "slug": "mnc-implement-quicksort",
    "difficulty": "Easy",
    "category": "Sorting & Binary Search",
    "description": "Implement quicksort and explain pivot choice and worst-case complexity.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 042: Implement quicksort\n# Category: Sorting & Binary Search [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 042: Implement quicksort\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 042: Implement quicksort\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 042: Implement quicksort\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-043",
    "number": 43,
    "title": "Binary search",
    "slug": "mnc-binary-search",
    "difficulty": "Easy",
    "category": "Sorting & Binary Search",
    "description": "Return the index of a target in a sorted array, or -1 if absent.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 043: Binary search\n# Category: Sorting & Binary Search [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 043: Binary search\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 043: Binary search\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 043: Binary search\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-044",
    "number": 44,
    "title": "First and last occurrence",
    "slug": "mnc-first-and-last-occurrence",
    "difficulty": "Easy",
    "category": "Sorting & Binary Search",
    "description": "Find the first and last index of a target in a sorted array.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 044: First and last occurrence\n# Category: Sorting & Binary Search [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 044: First and last occurrence\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 044: First and last occurrence\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 044: First and last occurrence\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-045",
    "number": 45,
    "title": "Search rotated sorted array",
    "slug": "mnc-search-rotated-sorted-array",
    "difficulty": "Easy",
    "category": "Sorting & Binary Search",
    "description": "Search for a target in a sorted array rotated at an unknown pivot with distinct values.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 045: Search rotated sorted array\n# Category: Sorting & Binary Search [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 045: Search rotated sorted array\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 045: Search rotated sorted array\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 045: Search rotated sorted array\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-046",
    "number": 46,
    "title": "Find peak element",
    "slug": "mnc-find-peak-element",
    "difficulty": "Medium",
    "category": "Sorting & Binary Search",
    "description": "Find an index whose value is greater than its existing neighbors.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 046: Find peak element\n# Category: Sorting & Binary Search [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 046: Find peak element\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 046: Find peak element\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 046: Find peak element\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-047",
    "number": 47,
    "title": "Integer square root",
    "slug": "mnc-integer-square-root",
    "difficulty": "Medium",
    "category": "Sorting & Binary Search",
    "description": "Compute floor(sqrt(n)) without using a built-in square-root routine.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 047: Integer square root\n# Category: Sorting & Binary Search [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 047: Integer square root\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 047: Integer square root\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 047: Integer square root\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-048",
    "number": 48,
    "title": "Kth largest element",
    "slug": "mnc-kth-largest-element",
    "difficulty": "Medium",
    "category": "Sorting & Binary Search",
    "description": "Find the kth largest value of an unsorted array.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 048: Kth largest element\n# Category: Sorting & Binary Search [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 048: Kth largest element\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 048: Kth largest element\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 048: Kth largest element\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-049",
    "number": 49,
    "title": "Merge intervals",
    "slug": "mnc-merge-intervals",
    "difficulty": "Medium",
    "category": "Sorting & Binary Search",
    "description": "Merge all overlapping closed intervals and return them sorted.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 049: Merge intervals\n# Category: Sorting & Binary Search [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 049: Merge intervals\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 049: Merge intervals\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 049: Merge intervals\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-050",
    "number": 50,
    "title": "Count inversions",
    "slug": "mnc-count-inversions",
    "difficulty": "Medium",
    "category": "Sorting & Binary Search",
    "description": "Count index pairs (i,j) where i<j and a[i]>a[j].",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 050: Count inversions\n# Category: Sorting & Binary Search [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 050: Count inversions\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 050: Count inversions\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 050: Count inversions\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-051",
    "number": 51,
    "title": "Reverse linked list",
    "slug": "mnc-reverse-linked-list",
    "difficulty": "Easy",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Reverse a singly linked list iteratively.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 051: Reverse linked list\n# Category: Linked Lists, Stacks & Queues [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 051: Reverse linked list\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 051: Reverse linked list\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 051: Reverse linked list\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-052",
    "number": 52,
    "title": "Detect linked-list cycle",
    "slug": "mnc-detect-linked-list-cycle",
    "difficulty": "Easy",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Determine whether a singly linked list contains a cycle.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 052: Detect linked-list cycle\n# Category: Linked Lists, Stacks & Queues [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 052: Detect linked-list cycle\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 052: Detect linked-list cycle\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 052: Detect linked-list cycle\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-053",
    "number": 53,
    "title": "Find middle node",
    "slug": "mnc-find-middle-node",
    "difficulty": "Easy",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Return the middle node of a singly linked list using slow and fast pointers.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 053: Find middle node\n# Category: Linked Lists, Stacks & Queues [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 053: Find middle node\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 053: Find middle node\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 053: Find middle node\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-054",
    "number": 54,
    "title": "Merge two sorted lists",
    "slug": "mnc-merge-two-sorted-lists",
    "difficulty": "Easy",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Merge two sorted singly linked lists into a sorted list.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 054: Merge two sorted lists\n# Category: Linked Lists, Stacks & Queues [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 054: Merge two sorted lists\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 054: Merge two sorted lists\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 054: Merge two sorted lists\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-055",
    "number": 55,
    "title": "Remove nth node from end",
    "slug": "mnc-remove-nth-node-from-end",
    "difficulty": "Easy",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Remove the nth node counted backward from the end of a singly linked list.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 055: Remove nth node from end\n# Category: Linked Lists, Stacks & Queues [Easy]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 055: Remove nth node from end\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 055: Remove nth node from end\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 055: Remove nth node from end\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-056",
    "number": 56,
    "title": "Palindrome linked list",
    "slug": "mnc-palindrome-linked-list",
    "difficulty": "Medium",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Check whether list values read the same forward and backward.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 056: Palindrome linked list\n# Category: Linked Lists, Stacks & Queues [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 056: Palindrome linked list\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 056: Palindrome linked list\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 056: Palindrome linked list\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-057",
    "number": 57,
    "title": "Implement stack using queues",
    "slug": "mnc-implement-stack-using-queues",
    "difficulty": "Medium",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Support push, pop and top using only queues.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 057: Implement stack using queues\n# Category: Linked Lists, Stacks & Queues [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 057: Implement stack using queues\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 057: Implement stack using queues\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 057: Implement stack using queues\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-058",
    "number": 58,
    "title": "Implement queue using stacks",
    "slug": "mnc-implement-queue-using-stacks",
    "difficulty": "Medium",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Support enqueue, dequeue and front using only stacks.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 058: Implement queue using stacks\n# Category: Linked Lists, Stacks & Queues [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 058: Implement queue using stacks\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 058: Implement queue using stacks\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 058: Implement queue using stacks\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-059",
    "number": 59,
    "title": "Next greater element",
    "slug": "mnc-next-greater-element",
    "difficulty": "Medium",
    "category": "Linked Lists, Stacks & Queues",
    "description": "For each array value, find the next strictly greater value to its right.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 059: Next greater element\n# Category: Linked Lists, Stacks & Queues [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 059: Next greater element\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 059: Next greater element\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 059: Next greater element\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-060",
    "number": 60,
    "title": "Min stack",
    "slug": "mnc-min-stack",
    "difficulty": "Medium",
    "category": "Linked Lists, Stacks & Queues",
    "description": "Design push, pop, top and getMin in O(1) time per operation.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 060: Min stack\n# Category: Linked Lists, Stacks & Queues [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 060: Min stack\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 060: Min stack\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 060: Min stack\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-061",
    "number": 61,
    "title": "Binary tree inorder traversal",
    "slug": "mnc-binary-tree-inorder-traversal",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Return nodes in left-root-right order.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 061: Binary tree inorder traversal\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 061: Binary tree inorder traversal\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 061: Binary tree inorder traversal\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 061: Binary tree inorder traversal\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-062",
    "number": 62,
    "title": "Binary tree level order",
    "slug": "mnc-binary-tree-level-order",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Return tree node values grouped by BFS level.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 062: Binary tree level order\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 062: Binary tree level order\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 062: Binary tree level order\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 062: Binary tree level order\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-063",
    "number": 63,
    "title": "Maximum depth of binary tree",
    "slug": "mnc-maximum-depth-of-binary-tree",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Compute the number of nodes on the longest root-to-leaf path.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 063: Maximum depth of binary tree\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 063: Maximum depth of binary tree\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 063: Maximum depth of binary tree\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 063: Maximum depth of binary tree\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-064",
    "number": 64,
    "title": "Validate binary search tree",
    "slug": "mnc-validate-binary-search-tree",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Determine whether a binary tree satisfies strict BST ordering.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 064: Validate binary search tree\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 064: Validate binary search tree\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 064: Validate binary search tree\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 064: Validate binary search tree\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-065",
    "number": 65,
    "title": "Lowest common ancestor",
    "slug": "mnc-lowest-common-ancestor",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Find the lowest common ancestor of two nodes in a binary tree.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 065: Lowest common ancestor\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 065: Lowest common ancestor\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 065: Lowest common ancestor\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 065: Lowest common ancestor\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-066",
    "number": 66,
    "title": "Diameter of binary tree",
    "slug": "mnc-diameter-of-binary-tree",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Find the maximum number of edges on a path between any two tree nodes.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 066: Diameter of binary tree\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 066: Diameter of binary tree\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 066: Diameter of binary tree\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 066: Diameter of binary tree\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-067",
    "number": 67,
    "title": "Invert binary tree",
    "slug": "mnc-invert-binary-tree",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Swap the left and right children recursively at every tree node.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 067: Invert binary tree\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 067: Invert binary tree\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 067: Invert binary tree\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 067: Invert binary tree\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-068",
    "number": 68,
    "title": "Kth smallest in BST",
    "slug": "mnc-kth-smallest-in-bst",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Find the kth smallest value in a binary search tree.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 068: Kth smallest in BST\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 068: Kth smallest in BST\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 068: Kth smallest in BST\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 068: Kth smallest in BST\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-069",
    "number": 69,
    "title": "K closest / largest stream",
    "slug": "mnc-k-closest-largest-stream",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Maintain the k largest elements seen in a number stream using a heap.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 069: K closest / largest stream\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 069: K closest / largest stream\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 069: K closest / largest stream\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 069: K closest / largest stream\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-070",
    "number": 70,
    "title": "Implement trie",
    "slug": "mnc-implement-trie",
    "difficulty": "Medium",
    "category": "Trees, Heaps & Tries",
    "description": "Support insert, exact search and prefix search on lowercase words.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 070: Implement trie\n# Category: Trees, Heaps & Tries [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 070: Implement trie\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 070: Implement trie\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 070: Implement trie\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-071",
    "number": 71,
    "title": "Number of islands",
    "slug": "mnc-number-of-islands",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Count connected groups of land cells in a binary grid using four-direction adjacency.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 071: Number of islands\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 071: Number of islands\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 071: Number of islands\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 071: Number of islands\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-072",
    "number": 72,
    "title": "BFS shortest path",
    "slug": "mnc-bfs-shortest-path",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Find shortest path lengths from a source in an unweighted graph.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 072: BFS shortest path\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 072: BFS shortest path\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 072: BFS shortest path\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 072: BFS shortest path\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-073",
    "number": 73,
    "title": "Detect graph cycle",
    "slug": "mnc-detect-graph-cycle",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Detect a cycle in a directed graph.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 073: Detect graph cycle\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 073: Detect graph cycle\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 073: Detect graph cycle\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 073: Detect graph cycle\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-074",
    "number": 74,
    "title": "Course schedule",
    "slug": "mnc-course-schedule",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Determine if prerequisite dependencies allow all courses to be completed.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 074: Course schedule\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 074: Course schedule\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 074: Course schedule\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 074: Course schedule\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-075",
    "number": 75,
    "title": "Dijkstra shortest paths",
    "slug": "mnc-dijkstra-shortest-paths",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Find shortest distances from a source in a graph with nonnegative weights.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 075: Dijkstra shortest paths\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 075: Dijkstra shortest paths\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 075: Dijkstra shortest paths\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 075: Dijkstra shortest paths\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-076",
    "number": 76,
    "title": "Connected components",
    "slug": "mnc-connected-components",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Count connected components in an undirected graph.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 076: Connected components\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 076: Connected components\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 076: Connected components\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 076: Connected components\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-077",
    "number": 77,
    "title": "Generate subsets",
    "slug": "mnc-generate-subsets",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Enumerate the power set of a list of distinct integers.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 077: Generate subsets\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 077: Generate subsets\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 077: Generate subsets\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 077: Generate subsets\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-078",
    "number": 78,
    "title": "Generate permutations",
    "slug": "mnc-generate-permutations",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "List all permutations of distinct input values.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 078: Generate permutations\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 078: Generate permutations\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 078: Generate permutations\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 078: Generate permutations\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-079",
    "number": 79,
    "title": "Combination sum",
    "slug": "mnc-combination-sum",
    "difficulty": "Medium",
    "category": "Graphs & Backtracking",
    "description": "Find unique combinations of positive candidates that sum to a target; reuse allowed.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 079: Combination sum\n# Category: Graphs & Backtracking [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 079: Combination sum\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 079: Combination sum\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 079: Combination sum\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-080",
    "number": 80,
    "title": "N-Queens",
    "slug": "mnc-n-queens",
    "difficulty": "Hard",
    "category": "Graphs & Backtracking",
    "description": "Place n queens on an n-by-n board so none attack each other.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 080: N-Queens\n# Category: Graphs & Backtracking [Hard]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 080: N-Queens\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 080: N-Queens\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 080: N-Queens\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-081",
    "number": 81,
    "title": "Climbing stairs",
    "slug": "mnc-climbing-stairs",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Count ways to climb n steps taking one or two steps at a time.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 081: Climbing stairs\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 081: Climbing stairs\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 081: Climbing stairs\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 081: Climbing stairs\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-082",
    "number": 82,
    "title": "Coin change minimum",
    "slug": "mnc-coin-change-minimum",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Find the fewest coins needed to make an amount, or -1 if impossible.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 082: Coin change minimum\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 082: Coin change minimum\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 082: Coin change minimum\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 082: Coin change minimum\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-083",
    "number": 83,
    "title": "Longest increasing subsequence",
    "slug": "mnc-longest-increasing-subsequence",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Find the length of a strictly increasing subsequence.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 083: Longest increasing subsequence\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 083: Longest increasing subsequence\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 083: Longest increasing subsequence\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 083: Longest increasing subsequence\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-084",
    "number": 84,
    "title": "Longest common subsequence",
    "slug": "mnc-longest-common-subsequence",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Find the length of the longest subsequence shared by two strings.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 084: Longest common subsequence\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 084: Longest common subsequence\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 084: Longest common subsequence\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 084: Longest common subsequence\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-085",
    "number": 85,
    "title": "0/1 knapsack",
    "slug": "mnc-0-1-knapsack",
    "difficulty": "Hard",
    "category": "Dynamic Programming & Greedy",
    "description": "Maximize item value under a weight limit when each item may be chosen once.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 085: 0/1 knapsack\n# Category: Dynamic Programming & Greedy [Hard]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 085: 0/1 knapsack\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 085: 0/1 knapsack\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 085: 0/1 knapsack\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-086",
    "number": 86,
    "title": "House robber",
    "slug": "mnc-house-robber",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Maximize money taken from houses without selecting adjacent houses.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 086: House robber\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 086: House robber\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 086: House robber\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 086: House robber\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-087",
    "number": 87,
    "title": "Edit distance",
    "slug": "mnc-edit-distance",
    "difficulty": "Hard",
    "category": "Dynamic Programming & Greedy",
    "description": "Find the minimum insertions, deletions and replacements to change one string to another.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 087: Edit distance\n# Category: Dynamic Programming & Greedy [Hard]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 087: Edit distance\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 087: Edit distance\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 087: Edit distance\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-088",
    "number": 88,
    "title": "Unique grid paths",
    "slug": "mnc-unique-grid-paths",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Count routes from the top-left to bottom-right using right and down moves.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 088: Unique grid paths\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 088: Unique grid paths\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 088: Unique grid paths\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 088: Unique grid paths\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-089",
    "number": 89,
    "title": "Jump game",
    "slug": "mnc-jump-game",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Decide if the last array index is reachable from the first given maximum jump lengths.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 089: Jump game\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 089: Jump game\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 089: Jump game\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 089: Jump game\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-090",
    "number": 90,
    "title": "Activity selection",
    "slug": "mnc-activity-selection",
    "difficulty": "Medium",
    "category": "Dynamic Programming & Greedy",
    "description": "Select the maximum number of nonoverlapping activities by start/end times.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 090: Activity selection\n# Category: Dynamic Programming & Greedy [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 090: Activity selection\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 090: Activity selection\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 090: Activity selection\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-091",
    "number": 91,
    "title": "Single number XOR",
    "slug": "mnc-single-number-xor",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Find the unique element when every other element appears exactly twice.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 091: Single number XOR\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 091: Single number XOR\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 091: Single number XOR\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 091: Single number XOR\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-092",
    "number": 92,
    "title": "Count set bits",
    "slug": "mnc-count-set-bits",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Count 1-bits in the binary representation of a nonnegative integer.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 092: Count set bits\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 092: Count set bits\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 092: Count set bits\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 092: Count set bits\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-093",
    "number": 93,
    "title": "Power of two",
    "slug": "mnc-power-of-two",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Check whether a positive integer is an exact power of two.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 093: Power of two\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 093: Power of two\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 093: Power of two\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 093: Power of two\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-094",
    "number": 94,
    "title": "Fast exponentiation",
    "slug": "mnc-fast-exponentiation",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Compute a^b efficiently for nonnegative integer exponent b.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 094: Fast exponentiation\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 094: Fast exponentiation\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 094: Fast exponentiation\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 094: Fast exponentiation\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-095",
    "number": 95,
    "title": "Sieve of Eratosthenes",
    "slug": "mnc-sieve-of-eratosthenes",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Find all prime numbers at most n using a sieve.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 095: Sieve of Eratosthenes\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 095: Sieve of Eratosthenes\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 095: Sieve of Eratosthenes\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 095: Sieve of Eratosthenes\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-096",
    "number": 96,
    "title": "Matrix transpose",
    "slug": "mnc-matrix-transpose",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Produce the transpose of an m-by-n matrix.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 096: Matrix transpose\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 096: Matrix transpose\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 096: Matrix transpose\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 096: Matrix transpose\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-097",
    "number": 97,
    "title": "Spiral matrix traversal",
    "slug": "mnc-spiral-matrix-traversal",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Return matrix elements in clockwise spiral order.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 097: Spiral matrix traversal\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 097: Spiral matrix traversal\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 097: Spiral matrix traversal\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 097: Spiral matrix traversal\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-098",
    "number": 98,
    "title": "SQL second-highest salary",
    "slug": "mnc-sql-second-highest-salary",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Write a SQL query returning the second distinct highest salary, or NULL if missing.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 098: SQL second-highest salary\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 098: SQL second-highest salary\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 098: SQL second-highest salary\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 098: SQL second-highest salary\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-099",
    "number": 99,
    "title": "SQL duplicate emails",
    "slug": "mnc-sql-duplicate-emails",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Write a SQL query listing email values that occur more than once.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 099: SQL duplicate emails\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 099: SQL duplicate emails\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 099: SQL duplicate emails\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 099: SQL duplicate emails\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  },
  {
    "id": "mnc-code-100",
    "number": 100,
    "title": "SQL department top salary",
    "slug": "mnc-sql-department-top-salary",
    "difficulty": "Medium",
    "category": "Bit Manipulation, Math & SQL",
    "description": "Write a SQL query listing employee(s) with the highest salary in each department.",
    "constraints": "Time Complexity: O(N) or O(N log N) expected. Standard memory boundaries (256MB).",
    "company_tags": [
      "TCS NQT",
      "Zoho",
      "Cognizant",
      "Infosys",
      "MNC Screening"
    ],
    "starter_code_json": {
      "python": "# Problem 100: SQL department top salary\n# Category: Bit Manipulation, Math & SQL [Medium]\nimport sys\n\ndef solve():\n    # Implement solution according to MNC specification\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
      "java": "// Problem 100: SQL department top salary\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Implement solution\n    }\n}\n",
      "cpp": "// Problem 100: SQL department top salary\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Implement solution\n    return 0;\n}\n",
      "c": "// Problem 100: SQL department top salary\n#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Implement solution\n    return 0;\n}\n"
    }
  }
];

export const MNC_MCQS: MncMCQ[] = [
  {
    "id": "mnc-mcq-001",
    "number": 1,
    "question": "Which structure executes statements based on a condition?",
    "options": [
      "if",
      "for",
      "class",
      "import"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "if",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is A (if). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-002",
    "number": 2,
    "question": "Which loop checks its condition before each iteration?",
    "options": [
      "do-while",
      "while",
      "return",
      "switch"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "while",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is B (while). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-003",
    "number": 3,
    "question": "What is a function calling itself called?",
    "options": [
      "Compilation",
      "Recursion",
      "Casting",
      "Iteration"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Recursion",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is B (Recursion). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-004",
    "number": 4,
    "question": "Which concept hides implementation details?",
    "options": [
      "Iteration",
      "Serialization",
      "Abstraction",
      "Indexing"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Abstraction",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (Abstraction). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-005",
    "number": 5,
    "question": "Which error is detected before program execution by a compiler?",
    "options": [
      "Network",
      "Runtime",
      "Syntax",
      "Logical"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Syntax",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (Syntax). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-006",
    "number": 6,
    "question": "What stores a value in memory under a name?",
    "options": [
      "Operator",
      "Variable",
      "Comment",
      "Header"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Variable",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is B (Variable). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-007",
    "number": 7,
    "question": "Which symbol often denotes logical AND in C-like languages?",
    "options": [
      "++",
      "||",
      "&&",
      "!="
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "&&",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (&&). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-008",
    "number": 8,
    "question": "Which keyword exits a loop immediately in many languages?",
    "options": [
      "pass",
      "continue",
      "yield",
      "break"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "break",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is D (break). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-009",
    "number": 9,
    "question": "Which keyword skips to the next loop iteration in many languages?",
    "options": [
      "continue",
      "return",
      "break",
      "throw"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "continue",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is A (continue). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-010",
    "number": 10,
    "question": "Which programming paradigm uses objects?",
    "options": [
      "OOP",
      "Functional-only",
      "Assembly-only",
      "Procedural-only"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "OOP",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is A (OOP). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-011",
    "number": 11,
    "question": "Which type represents true or false?",
    "options": [
      "Float",
      "Character",
      "Boolean",
      "String"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Boolean",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (Boolean). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-012",
    "number": 12,
    "question": "What is converting one data type to another called?",
    "options": [
      "Sorting",
      "Hashing",
      "Casting",
      "Parsing-only"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Casting",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (Casting). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-013",
    "number": 13,
    "question": "Which memory allocation typically stores local function variables?",
    "options": [
      "Cache-only",
      "Disk",
      "Stack",
      "ROM"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Stack",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (Stack). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-014",
    "number": 14,
    "question": "Which notation describes an algorithm growth upper bound?",
    "options": [
      "HTTP",
      "ASCII",
      "Big-O",
      "UTF-8"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Big-O",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (Big-O). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-015",
    "number": 15,
    "question": "Which operator gives remainder in C, Java and Python?",
    "options": [
      "%",
      "//",
      "/",
      "**"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "%",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is A (%). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-016",
    "number": 16,
    "question": "What is the output of 7 // 2 in Python?",
    "options": [
      "3",
      "4",
      "3.5",
      "2"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "3",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is A (3). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-017",
    "number": 17,
    "question": "What does len(\"code\") return in Python?",
    "options": [
      "0",
      "3",
      "4",
      "5"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "4",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is C (4). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-018",
    "number": 18,
    "question": "Which Python type is immutable?",
    "options": [
      "set",
      "list",
      "dict",
      "tuple"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "tuple",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is D (tuple). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-019",
    "number": 19,
    "question": "What is a block of reusable code called?",
    "options": [
      "Variable",
      "Literal",
      "Token",
      "Function"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Function",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is D (Function). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-020",
    "number": 20,
    "question": "Which keyword creates a Python function?",
    "options": [
      "function",
      "func",
      "lambda-only",
      "def C, C++, Java & Python"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "def",
    "category": "Programming Fundamentals",
    "explanation": "Correct answer is D (def). In Programming Fundamentals, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-021",
    "number": 21,
    "question": "Which C format specifier prints an integer?",
    "options": [
      "%d",
      "%f",
      "%c",
      "%s"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "%d",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is A (%d). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-022",
    "number": 22,
    "question": "Which C function allocates heap memory?",
    "options": [
      "printf",
      "scanf",
      "malloc",
      "strlen"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "malloc",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is C (malloc). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-023",
    "number": 23,
    "question": "Which C operator accesses a member through a pointer?",
    "options": [
      "&",
      "::",
      ".",
      "->"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "->",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is D (->). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-024",
    "number": 24,
    "question": "Which C header declares printf?",
    "options": [
      "string.h",
      "math.h",
      "stdlib.h",
      "stdio.h"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "stdio.h",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is D (stdio.h). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-025",
    "number": 25,
    "question": "Which C keyword declares a read-only variable?",
    "options": [
      "volatile",
      "const",
      "extern",
      "static"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "const",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is B (const). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-026",
    "number": 26,
    "question": "Which C++ feature allows the same name with different parameters?",
    "options": [
      "Inheritance",
      "Overriding",
      "Encapsulation",
      "Overloading"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Overloading",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is D (Overloading). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-027",
    "number": 27,
    "question": "Which C++ keyword creates an object dynamically?",
    "options": [
      "create",
      "malloc",
      "new",
      "alloc"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "new",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is C (new). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-028",
    "number": 28,
    "question": "Which C++ keyword releases memory allocated by new?",
    "options": [
      "dispose",
      "remove",
      "free",
      "delete"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "delete",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is D (delete). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-029",
    "number": 29,
    "question": "Which C++ access level restricts members to the class and friends?",
    "options": [
      "package",
      "global",
      "private",
      "public"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "private",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is C (private). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-030",
    "number": 30,
    "question": "Which Java keyword prevents class inheritance?",
    "options": [
      "static",
      "abstract",
      "final",
      "public"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "final",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is C (final). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-031",
    "number": 31,
    "question": "Which Java method is the usual entry point?",
    "options": [
      "init",
      "main",
      "run",
      "start"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "main",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is B (main). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-032",
    "number": 32,
    "question": "Which Java keyword inherits a class?",
    "options": [
      "extends",
      "implements",
      "imports",
      "inherits"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "extends",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is A (extends). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-033",
    "number": 33,
    "question": "Which Java keyword implements an interface?",
    "options": [
      "implements",
      "extends",
      "super",
      "interface"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "implements",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is A (implements). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-034",
    "number": 34,
    "question": "Which Java collection stores unique items?",
    "options": [
      "HashSet",
      "Vector",
      "ArrayList",
      "LinkedList"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "HashSet",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is A (HashSet). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-035",
    "number": 35,
    "question": "Which Java class is immutable for text?",
    "options": [
      "StringBuilder",
      "StringBuffer",
      "char[]",
      "String"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "String",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is D (String). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-036",
    "number": 36,
    "question": "Which Java exception is unchecked?",
    "options": [
      "ClassNotFoundException",
      "SQLException",
      "IOException",
      "NullPointerException"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "NullPointerException",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is D (NullPointerException). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-037",
    "number": 37,
    "question": "What is the result of Python 2 ** 3?",
    "options": [
      "9",
      "6",
      "8",
      "5"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "8",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is C (8). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-038",
    "number": 38,
    "question": "Which Python collection maps keys to values?",
    "options": [
      "tuple",
      "set",
      "dict",
      "list"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "dict",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is C (dict). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-039",
    "number": 39,
    "question": "Which Python method adds an item at the end of a list?",
    "options": [
      "append",
      "add",
      "push",
      "insertEnd"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "append",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is A (append). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-040",
    "number": 40,
    "question": "Which Python keyword handles exceptions?",
    "options": [
      "except",
      "catch",
      "error",
      "rescue Object-Oriented Programming"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "except",
    "category": "C, C++, Java & Python",
    "explanation": "Correct answer is A (except). In C, C++, Java & Python, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-041",
    "number": 41,
    "question": "Which OOP principle bundles data with methods?",
    "options": [
      "Normalization",
      "Encapsulation",
      "Polymorphism",
      "Recursion"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Encapsulation",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is B (Encapsulation). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-042",
    "number": 42,
    "question": "Which OOP principle enables multiple forms of one interface?",
    "options": [
      "Polymorphism",
      "Indexing",
      "Encapsulation",
      "Aggregation"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Polymorphism",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is A (Polymorphism). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-043",
    "number": 43,
    "question": "Which OOP feature allows a child class to reuse parent behavior?",
    "options": [
      "Overloading",
      "Hashing",
      "Inheritance",
      "Compilation"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Inheritance",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is C (Inheritance). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-044",
    "number": 44,
    "question": "What creates an instance of a class?",
    "options": [
      "Destructor",
      "Constructor",
      "Namespace",
      "Iterator"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Constructor",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is B (Constructor). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-045",
    "number": 45,
    "question": "Which method has the same signature in a subclass to change behavior?",
    "options": [
      "Overload",
      "Override",
      "Overrun",
      "Overcast"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Override",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is B (Override). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-046",
    "number": 46,
    "question": "Which relation best describes a Car having an Engine?",
    "options": [
      "Recursion",
      "Inheritance",
      "Overloading",
      "Composition"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Composition",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is D (Composition). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-047",
    "number": 47,
    "question": "Which relation best describes Dog being an Animal?",
    "options": [
      "Dependency-only",
      "Aggregation-only",
      "Inheritance",
      "Composition"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Inheritance",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is C (Inheritance). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-048",
    "number": 48,
    "question": "What defines methods without necessarily providing implementation?",
    "options": [
      "Interface",
      "Instance",
      "Constructor",
      "Object"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Interface",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is A (Interface). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-049",
    "number": 49,
    "question": "Which class cannot be instantiated directly in many OOP languages?",
    "options": [
      "Static-only",
      "Concrete",
      "Final-only",
      "Abstract"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Abstract",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is D (Abstract). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-050",
    "number": 50,
    "question": "What refers to the current object in Java?",
    "options": [
      "base",
      "this",
      "super",
      "self"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "this",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is B (this). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-051",
    "number": 51,
    "question": "What refers to the parent-class implementation in Java?",
    "options": [
      "super",
      "this",
      "parent",
      "base"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "super",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is A (super). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-052",
    "number": 52,
    "question": "Which term means one method name with different parameter lists?",
    "options": [
      "Hiding",
      "Overriding",
      "Casting",
      "Overloading"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Overloading",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is D (Overloading). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-053",
    "number": 53,
    "question": "What is an object created from?",
    "options": [
      "Namespace",
      "Package",
      "Class",
      "Header"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Class",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is C (Class). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-054",
    "number": 54,
    "question": "Which access modifier generally exposes a member everywhere?",
    "options": [
      "private",
      "internal",
      "protected",
      "public"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "public",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is D (public). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-055",
    "number": 55,
    "question": "What is late runtime method selection called?",
    "options": [
      "Inlining",
      "Static linking",
      "Parsing",
      "Dynamic binding"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Dynamic binding",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is D (Dynamic binding). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-056",
    "number": 56,
    "question": "Which concept reduces dependency between modules?",
    "options": [
      "Loose coupling",
      "Hardcoding",
      "Tight coupling",
      "Global state"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Loose coupling",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is A (Loose coupling). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-057",
    "number": 57,
    "question": "Which SOLID principle is abbreviated SRP?",
    "options": [
      "Stable Resource",
      "Single Responsibility",
      "Shared Reference",
      "Single Runtime"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Single Responsibility",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is B (Single Responsibility). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-058",
    "number": 58,
    "question": "Which SOLID principle says extend without modifying existing code?",
    "options": [
      "Open-Closed",
      "Liskov-only",
      "Dependency Inversion",
      "Interface Segregation"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Open-Closed",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is A (Open-Closed). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-059",
    "number": 59,
    "question": "Which OOP term means providing only essential features to clients?",
    "options": [
      "Composition",
      "Abstraction",
      "Instantiation",
      "Overloading"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Abstraction",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is B (Abstraction). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-060",
    "number": 60,
    "question": "Which is a relationship where one object uses another temporarily?",
    "options": [
      "Polymorphism",
      "Encapsulation",
      "Dependency",
      "Inheritance Data Structures"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Dependency",
    "category": "Object-Oriented Programming",
    "explanation": "Correct answer is C (Dependency). In Object-Oriented Programming, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-061",
    "number": 61,
    "question": "Which data structure uses LIFO?",
    "options": [
      "Graph",
      "Heap",
      "Stack",
      "Queue"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Stack",
    "category": "Data Structures",
    "explanation": "Correct answer is C (Stack). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-062",
    "number": 62,
    "question": "Which data structure uses FIFO?",
    "options": [
      "Tree",
      "Stack",
      "Queue",
      "Set"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Queue",
    "category": "Data Structures",
    "explanation": "Correct answer is C (Queue). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-063",
    "number": 63,
    "question": "Which structure stores key-value pairs?",
    "options": [
      "Stack",
      "Queue",
      "Array-only",
      "Hash map"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Hash map",
    "category": "Data Structures",
    "explanation": "Correct answer is D (Hash map). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-064",
    "number": 64,
    "question": "Which linear structure supports random index access in O(1)?",
    "options": [
      "Array",
      "Queue",
      "Linked list",
      "Stack-only"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Array",
    "category": "Data Structures",
    "explanation": "Correct answer is A (Array). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-065",
    "number": 65,
    "question": "Which list node holds a pointer to the next node?",
    "options": [
      "Binary tree",
      "Singly linked",
      "Heap",
      "Trie"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Singly linked",
    "category": "Data Structures",
    "explanation": "Correct answer is B (Singly linked). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-066",
    "number": 66,
    "question": "Which tree has at most two children per node?",
    "options": [
      "Binary tree",
      "B-tree",
      "Trie",
      "Graph"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Binary tree",
    "category": "Data Structures",
    "explanation": "Correct answer is A (Binary tree). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-067",
    "number": 67,
    "question": "Which tree maintains heap-order property?",
    "options": [
      "Trie",
      "Suffix tree",
      "BST-only",
      "Heap"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Heap",
    "category": "Data Structures",
    "explanation": "Correct answer is D (Heap). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-068",
    "number": 68,
    "question": "Which structure is commonly used for BFS?",
    "options": [
      "Heap-only",
      "Hash set",
      "Queue",
      "Stack"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Queue",
    "category": "Data Structures",
    "explanation": "Correct answer is C (Queue). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-069",
    "number": 69,
    "question": "Which structure is commonly used for iterative DFS?",
    "options": [
      "Stack",
      "Priority queue",
      "Queue",
      "Ring buffer"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Stack",
    "category": "Data Structures",
    "explanation": "Correct answer is A (Stack). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-070",
    "number": 70,
    "question": "Which structure efficiently stores word prefixes?",
    "options": [
      "Queue",
      "Matrix",
      "Heap",
      "Trie"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Trie",
    "category": "Data Structures",
    "explanation": "Correct answer is D (Trie). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-071",
    "number": 71,
    "question": "What is the maximum number of edges in a tree with n vertices?",
    "options": [
      "n+1",
      "n-1",
      "n",
      "2n"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "n-1",
    "category": "Data Structures",
    "explanation": "Correct answer is B (n-1). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-072",
    "number": 72,
    "question": "Which traversal of BST yields sorted keys?",
    "options": [
      "Postorder",
      "Level order",
      "Inorder",
      "Preorder"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Inorder",
    "category": "Data Structures",
    "explanation": "Correct answer is C (Inorder). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-073",
    "number": 73,
    "question": "Which collision handling method stores items in buckets?",
    "options": [
      "Pipelining",
      "Chaining",
      "Recursion",
      "Inlining"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Chaining",
    "category": "Data Structures",
    "explanation": "Correct answer is B (Chaining). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-074",
    "number": 74,
    "question": "Which operation adds an element to a stack?",
    "options": [
      "Poll",
      "Pop",
      "Peek",
      "Push"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Push",
    "category": "Data Structures",
    "explanation": "Correct answer is D (Push). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-075",
    "number": 75,
    "question": "Which operation removes an element from a queue?",
    "options": [
      "Dequeue",
      "Enqueue",
      "Peek",
      "Push"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Dequeue",
    "category": "Data Structures",
    "explanation": "Correct answer is A (Dequeue). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-076",
    "number": 76,
    "question": "Which tree is self-balancing?",
    "options": [
      "Plain BST",
      "Heap-only",
      "AVL",
      "Trie-only"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "AVL",
    "category": "Data Structures",
    "explanation": "Correct answer is C (AVL). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-077",
    "number": 77,
    "question": "Which structure provides average O(1) key lookup?",
    "options": [
      "Unsorted list",
      "Hash table",
      "Array scan",
      "Binary tree"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Hash table",
    "category": "Data Structures",
    "explanation": "Correct answer is B (Hash table). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-078",
    "number": 78,
    "question": "Which heap exposes the smallest key at the root?",
    "options": [
      "Max-heap",
      "BST",
      "Min-heap",
      "Trie"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Min-heap",
    "category": "Data Structures",
    "explanation": "Correct answer is C (Min-heap). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-079",
    "number": 79,
    "question": "Which graph representation uses an n-by-n table?",
    "options": [
      "Adjacency list",
      "Adjacency matrix",
      "Disjoint set",
      "Edge list"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Adjacency matrix",
    "category": "Data Structures",
    "explanation": "Correct answer is B (Adjacency matrix). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-080",
    "number": 80,
    "question": "Which structure tracks disjoint connected groups?",
    "options": [
      "Queue",
      "Trie",
      "Union-find",
      "Stack Algorithms & Complexity"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Union-find",
    "category": "Data Structures",
    "explanation": "Correct answer is C (Union-find). In Data Structures, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-081",
    "number": 81,
    "question": "What is binary search worst-case time complexity?",
    "options": [
      "O(n log n)",
      "O(log n)",
      "O(n)",
      "O(1)"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "O(log n)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is B (O(log n)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-082",
    "number": 82,
    "question": "What is linear search worst-case time complexity?",
    "options": [
      "O(log n)",
      "O(1)",
      "O(n)",
      "O(n^2)"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "O(n)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is C (O(n)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-083",
    "number": 83,
    "question": "What is merge sort worst-case time complexity?",
    "options": [
      "O(log n)",
      "O(n^2)",
      "O(n)",
      "O(n log n)"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "O(n log n)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is D (O(n log n)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-084",
    "number": 84,
    "question": "What is bubble sort worst-case time complexity?",
    "options": [
      "O(n^2)",
      "O(log n)",
      "O(n log n)",
      "O(1)"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "O(n^2)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (O(n^2)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-085",
    "number": 85,
    "question": "What is insertion sort best-case time on sorted data?",
    "options": [
      "O(1)",
      "O(log n)",
      "O(n^2)",
      "O(n)"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "O(n)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is D (O(n)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-086",
    "number": 86,
    "question": "What is quicksort average time complexity?",
    "options": [
      "O(n log n)",
      "O(n)",
      "O(n^2)",
      "O(log n)"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "O(n log n)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (O(n log n)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-087",
    "number": 87,
    "question": "What is a hash-table lookup average complexity?",
    "options": [
      "O(n)",
      "O(1)",
      "O(n log n)",
      "O(log n)"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "O(1)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is B (O(1)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-088",
    "number": 88,
    "question": "What technique solves overlapping subproblems by caching?",
    "options": [
      "Memoization",
      "Brute force",
      "Backtracking-only",
      "Greedy"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Memoization",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (Memoization). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-089",
    "number": 89,
    "question": "What algorithm finds shortest unweighted paths?",
    "options": [
      "BFS",
      "Kruskal",
      "DFS",
      "Quicksort"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "BFS",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (BFS). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-090",
    "number": 90,
    "question": "Which algorithm handles nonnegative weighted shortest paths?",
    "options": [
      "Dijkstra",
      "Topological sort",
      "Bellman-only",
      "Prim"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Dijkstra",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (Dijkstra). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-091",
    "number": 91,
    "question": "Which algorithm builds a minimum spanning tree?",
    "options": [
      "Floyd-Warshall",
      "Kruskal",
      "Merge sort",
      "Binary search"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Kruskal",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is B (Kruskal). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-092",
    "number": 92,
    "question": "What is a sorting algorithm that keeps equal elements in order?",
    "options": [
      "Randomized",
      "Stable",
      "Adaptive-only",
      "Unstable"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Stable",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is B (Stable). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-093",
    "number": 93,
    "question": "Which pattern maintains two indices moving through data?",
    "options": [
      "Two pointers",
      "Memoization",
      "Topological",
      "Union-find"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Two pointers",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (Two pointers). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-094",
    "number": 94,
    "question": "What technique explores choices and undoes failed choices?",
    "options": [
      "Backtracking",
      "Binary search",
      "Greedy",
      "Hashing"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Backtracking",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (Backtracking). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-095",
    "number": 95,
    "question": "What does O(1) denote?",
    "options": [
      "Constant",
      "Linear",
      "Exponential",
      "Quadratic"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Constant",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (Constant). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-096",
    "number": 96,
    "question": "What is worst-case space for merge sort on arrays?",
    "options": [
      "O(log n)",
      "O(1)",
      "O(n)",
      "O(n^2)"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "O(n)",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is C (O(n)). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-097",
    "number": 97,
    "question": "Which sort repeatedly selects a minimum remaining item?",
    "options": [
      "Merge",
      "Selection",
      "Quick",
      "Heap"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Selection",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is B (Selection). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-098",
    "number": 98,
    "question": "Which search requires sorted input for its standard form?",
    "options": [
      "Binary",
      "BFS",
      "Linear",
      "DFS"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Binary",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is A (Binary). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-099",
    "number": 99,
    "question": "Which algorithm detects negative cycles in shortest paths?",
    "options": [
      "Dijkstra",
      "Bellman-Ford",
      "Binary search",
      "Prim"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Bellman-Ford",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is B (Bellman-Ford). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-100",
    "number": 100,
    "question": "Which traversal ordering solves prerequisite DAG ordering?",
    "options": [
      "Spiral",
      "Inorder",
      "Topological",
      "Postorder DBMS & SQL"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Topological",
    "category": "Algorithms & Complexity",
    "explanation": "Correct answer is C (Topological). In Algorithms & Complexity, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-101",
    "number": 101,
    "question": "What does SQL stand for?",
    "options": [
      "Sequential Query List",
      "Structured Query Language",
      "Simple Query Logic",
      "Standard Queue Language"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Structured Query Language",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is B (Structured Query Language). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-102",
    "number": 102,
    "question": "Which SQL clause filters rows before grouping?",
    "options": [
      "HAVING",
      "ORDER BY",
      "LIMIT",
      "WHERE"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "WHERE",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is D (WHERE). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-103",
    "number": 103,
    "question": "Which SQL clause filters grouped results?",
    "options": [
      "FROM",
      "SELECT",
      "HAVING",
      "WHERE"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "HAVING",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is C (HAVING). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-104",
    "number": 104,
    "question": "Which SQL clause sorts results?",
    "options": [
      "ORDER BY",
      "GROUP BY",
      "HAVING",
      "JOIN"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "ORDER BY",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is A (ORDER BY). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-105",
    "number": 105,
    "question": "Which SQL command retrieves rows?",
    "options": [
      "UPDATE",
      "SELECT",
      "INSERT",
      "DELETE"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "SELECT",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is B (SELECT). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-106",
    "number": 106,
    "question": "Which SQL command adds new rows?",
    "options": [
      "INSERT",
      "ALTER",
      "UPDATE",
      "SELECT"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "INSERT",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is A (INSERT). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-107",
    "number": 107,
    "question": "Which SQL keyword returns unique rows?",
    "options": [
      "DISTINCT",
      "SINGLE",
      "UNIQUEKEY",
      "ONLY"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "DISTINCT",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is A (DISTINCT). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-108",
    "number": 108,
    "question": "Which join keeps all matching and unmatched left rows?",
    "options": [
      "RIGHT JOIN",
      "CROSS JOIN",
      "LEFT JOIN",
      "INNER JOIN"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "LEFT JOIN",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is C (LEFT JOIN). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-109",
    "number": 109,
    "question": "Which join returns only matching rows on both sides?",
    "options": [
      "FULL JOIN",
      "LEFT JOIN",
      "INNER JOIN",
      "CROSS JOIN"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "INNER JOIN",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is C (INNER JOIN). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-110",
    "number": 110,
    "question": "Which SQL function counts rows?",
    "options": [
      "COUNT",
      "MIN",
      "AVG",
      "SUM"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "COUNT",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is A (COUNT). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-111",
    "number": 111,
    "question": "Which constraint uniquely identifies a table row?",
    "options": [
      "FOREIGN KEY",
      "CHECK",
      "DEFAULT",
      "PRIMARY KEY"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "PRIMARY KEY",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is D (PRIMARY KEY). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-112",
    "number": 112,
    "question": "Which key references a key in another table?",
    "options": [
      "UNIQUE",
      "FOREIGN KEY",
      "CANDIDATE",
      "PRIMARY KEY"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "FOREIGN KEY",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is B (FOREIGN KEY). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-113",
    "number": 113,
    "question": "Which normal form removes partial dependencies on a composite key?",
    "options": [
      "BCNF",
      "2NF",
      "1NF",
      "3NF"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "2NF",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is B (2NF). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-114",
    "number": 114,
    "question": "Which ACID property ensures all-or-nothing transactions?",
    "options": [
      "Isolation",
      "Consistency",
      "Durability",
      "Atomicity"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Atomicity",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is D (Atomicity). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-115",
    "number": 115,
    "question": "Which ACID property persists committed changes?",
    "options": [
      "Consistency",
      "Durability",
      "Isolation",
      "Atomicity"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Durability",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is B (Durability). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-116",
    "number": 116,
    "question": "Which SQL statement removes an entire table definition?",
    "options": [
      "DELETE",
      "DROP",
      "REMOVE",
      "TRUNCATE"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "DROP",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is B (DROP). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-117",
    "number": 117,
    "question": "Which SQL statement removes selected rows?",
    "options": [
      "ALTER",
      "DROP",
      "DELETE",
      "CREATE"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "DELETE",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is C (DELETE). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-118",
    "number": 118,
    "question": "Which structure accelerates common lookup queries?",
    "options": [
      "Transaction",
      "Index",
      "View-only",
      "Trigger"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Index",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is B (Index). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-119",
    "number": 119,
    "question": "Which join produces every combination of two tables?",
    "options": [
      "INNER JOIN",
      "LEFT JOIN",
      "CROSS JOIN",
      "SELF JOIN"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "CROSS JOIN",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is C (CROSS JOIN). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-120",
    "number": 120,
    "question": "Which SQL clause groups rows for aggregates?",
    "options": [
      "DISTINCT",
      "WHERE",
      "GROUP BY",
      "ORDER BY Operating Systems"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "GROUP BY",
    "category": "DBMS & SQL",
    "explanation": "Correct answer is C (GROUP BY). In DBMS & SQL, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-121",
    "number": 121,
    "question": "Which OS component manages hardware resources?",
    "options": [
      "Compiler",
      "Browser",
      "Kernel",
      "Shell"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Kernel",
    "category": "Operating Systems",
    "explanation": "Correct answer is C (Kernel). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-122",
    "number": 122,
    "question": "What is a running program called?",
    "options": [
      "Package",
      "Process",
      "File",
      "Thread-only"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Process",
    "category": "Operating Systems",
    "explanation": "Correct answer is B (Process). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-123",
    "number": 123,
    "question": "What is a lightweight execution unit within a process?",
    "options": [
      "Socket",
      "Partition",
      "Thread",
      "Program"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Thread",
    "category": "Operating Systems",
    "explanation": "Correct answer is C (Thread). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-124",
    "number": 124,
    "question": "Which scheduling policy serves arrivals in order?",
    "options": [
      "SJF",
      "Priority",
      "Round Robin",
      "FCFS"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "FCFS",
    "category": "Operating Systems",
    "explanation": "Correct answer is D (FCFS). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-125",
    "number": 125,
    "question": "Which scheduling policy uses a fixed time quantum?",
    "options": [
      "SJF",
      "FIFO-only",
      "FCFS",
      "Round Robin"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Round Robin",
    "category": "Operating Systems",
    "explanation": "Correct answer is D (Round Robin). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-126",
    "number": 126,
    "question": "What occurs when processes wait forever for each others resources?",
    "options": [
      "Thrashing",
      "Paging",
      "Starvation-only",
      "Deadlock"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Deadlock",
    "category": "Operating Systems",
    "explanation": "Correct answer is D (Deadlock). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-127",
    "number": 127,
    "question": "What technique maps virtual pages to physical frames?",
    "options": [
      "Spooling",
      "Caching-only",
      "Parsing",
      "Paging"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Paging",
    "category": "Operating Systems",
    "explanation": "Correct answer is D (Paging). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-128",
    "number": 128,
    "question": "What storage area backs pages evicted from RAM?",
    "options": [
      "Swap",
      "L1 cache",
      "ROM",
      "Register"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Swap",
    "category": "Operating Systems",
    "explanation": "Correct answer is A (Swap). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-129",
    "number": 129,
    "question": "Which OS mechanism allows isolated processes to exchange data?",
    "options": [
      "HTTP-only",
      "BIOS",
      "IPC",
      "DMA-only"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "IPC",
    "category": "Operating Systems",
    "explanation": "Correct answer is C (IPC). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-130",
    "number": 130,
    "question": "Which property prevents concurrent access conflicts on shared data?",
    "options": [
      "Mutual exclusion",
      "Virtualization",
      "Caching",
      "Preemption"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Mutual exclusion",
    "category": "Operating Systems",
    "explanation": "Correct answer is A (Mutual exclusion). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-131",
    "number": 131,
    "question": "Which lock primitive can protect a critical section?",
    "options": [
      "Router",
      "Mutex",
      "Index",
      "Compiler"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Mutex",
    "category": "Operating Systems",
    "explanation": "Correct answer is B (Mutex). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-132",
    "number": 132,
    "question": "Which primitive counts available resources?",
    "options": [
      "Semaphore",
      "Page table",
      "Socket",
      "Mutex-only"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Semaphore",
    "category": "Operating Systems",
    "explanation": "Correct answer is A (Semaphore). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-133",
    "number": 133,
    "question": "What is moving CPU between runnable processes called?",
    "options": [
      "Context switch",
      "Disk seek",
      "Interrupt mask",
      "Page fault"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Context switch",
    "category": "Operating Systems",
    "explanation": "Correct answer is A (Context switch). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-134",
    "number": 134,
    "question": "Which condition occurs on access to a nonresident virtual page?",
    "options": [
      "Buffer overflow",
      "Page fault",
      "Deadlock",
      "Segfault always"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Page fault",
    "category": "Operating Systems",
    "explanation": "Correct answer is B (Page fault). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-135",
    "number": 135,
    "question": "Which memory is closest to the CPU core?",
    "options": [
      "Register",
      "SSD",
      "Swap",
      "Disk"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Register",
    "category": "Operating Systems",
    "explanation": "Correct answer is A (Register). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-136",
    "number": 136,
    "question": "Which scheduling issue leaves low-priority tasks waiting indefinitely?",
    "options": [
      "Deadlock-only",
      "Livelock-only",
      "Fragmentation",
      "Starvation"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Starvation",
    "category": "Operating Systems",
    "explanation": "Correct answer is D (Starvation). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-137",
    "number": 137,
    "question": "Which memory allocation problem creates unusable gaps between blocks?",
    "options": [
      "Replication",
      "External fragmentation",
      "Spooling",
      "Paging"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "External fragmentation",
    "category": "Operating Systems",
    "explanation": "Correct answer is B (External fragmentation). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-138",
    "number": 138,
    "question": "Which UNIX call typically starts a child process?",
    "options": [
      "fork",
      "exec",
      "open",
      "wait"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "fork",
    "category": "Operating Systems",
    "explanation": "Correct answer is A (fork). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-139",
    "number": 139,
    "question": "Which UNIX call replaces the current process image?",
    "options": [
      "fork",
      "exec",
      "kill",
      "wait"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "exec",
    "category": "Operating Systems",
    "explanation": "Correct answer is B (exec). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-140",
    "number": 140,
    "question": "Which environment enables multiple programs to share CPU time?",
    "options": [
      "Multitasking",
      "Batch-only",
      "Single-tasking",
      "Firmware Computer Networks"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Multitasking",
    "category": "Operating Systems",
    "explanation": "Correct answer is A (Multitasking). In Operating Systems, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-141",
    "number": 141,
    "question": "Which OSI layer routes IP packets?",
    "options": [
      "Transport",
      "Application",
      "Data Link",
      "Network"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Network",
    "category": "Computer Networks",
    "explanation": "Correct answer is D (Network). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-142",
    "number": 142,
    "question": "Which OSI layer uses TCP?",
    "options": [
      "Network",
      "Transport",
      "Physical",
      "Session"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Transport",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (Transport). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-143",
    "number": 143,
    "question": "Which protocol gives reliable ordered delivery?",
    "options": [
      "UDP",
      "IP",
      "TCP",
      "ICMP"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "TCP",
    "category": "Computer Networks",
    "explanation": "Correct answer is C (TCP). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-144",
    "number": 144,
    "question": "Which protocol is connectionless at the transport layer?",
    "options": [
      "HTTP",
      "TLS",
      "UDP",
      "TCP"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "UDP",
    "category": "Computer Networks",
    "explanation": "Correct answer is C (UDP). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-145",
    "number": 145,
    "question": "Which protocol maps domain names to IP addresses?",
    "options": [
      "DHCP",
      "SMTP",
      "DNS",
      "ARP"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "DNS",
    "category": "Computer Networks",
    "explanation": "Correct answer is C (DNS). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-146",
    "number": 146,
    "question": "Which protocol automatically supplies IP configuration?",
    "options": [
      "SSH",
      "DNS",
      "FTP",
      "DHCP"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "DHCP",
    "category": "Computer Networks",
    "explanation": "Correct answer is D (DHCP). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-147",
    "number": 147,
    "question": "Which protocol securely transfers web pages?",
    "options": [
      "HTTP",
      "HTTPS",
      "Telnet",
      "FTP"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "HTTPS",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (HTTPS). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-148",
    "number": 148,
    "question": "Which protocol sends email between servers?",
    "options": [
      "SMTP",
      "IMAP",
      "DNS",
      "POP3"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "SMTP",
    "category": "Computer Networks",
    "explanation": "Correct answer is A (SMTP). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-149",
    "number": 149,
    "question": "Which protocol retrieves email while synchronizing folders?",
    "options": [
      "DNS",
      "SMTP",
      "ARP",
      "IMAP"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "IMAP",
    "category": "Computer Networks",
    "explanation": "Correct answer is D (IMAP). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-150",
    "number": 150,
    "question": "Which port is default for HTTPS?",
    "options": [
      "22",
      "443",
      "80",
      "25"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "443",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (443). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-151",
    "number": 151,
    "question": "Which port is default for HTTP?",
    "options": [
      "53",
      "21",
      "443",
      "80"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "80",
    "category": "Computer Networks",
    "explanation": "Correct answer is D (80). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-152",
    "number": 152,
    "question": "Which port is default for SSH?",
    "options": [
      "23",
      "22",
      "21",
      "25"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "22",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (22). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-153",
    "number": 153,
    "question": "Which device mainly forwards packets between networks?",
    "options": [
      "Router",
      "Repeater",
      "Switch",
      "Hub"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Router",
    "category": "Computer Networks",
    "explanation": "Correct answer is A (Router). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-154",
    "number": 154,
    "question": "Which device forwards frames by MAC address?",
    "options": [
      "Switch",
      "Modem",
      "Gateway-only",
      "Router"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Switch",
    "category": "Computer Networks",
    "explanation": "Correct answer is A (Switch). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-155",
    "number": 155,
    "question": "Which address identifies a network interface on a LAN?",
    "options": [
      "FQDN",
      "MAC",
      "URL",
      "Port"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "MAC",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (MAC). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-156",
    "number": 156,
    "question": "Which protocol resolves IPv4 addresses to MAC addresses?",
    "options": [
      "HTTP",
      "ARP",
      "DNS",
      "SMTP"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "ARP",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (ARP). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-157",
    "number": 157,
    "question": "Which command tests reachability using ICMP echo?",
    "options": [
      "ping",
      "chmod",
      "grep",
      "mkdir"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "ping",
    "category": "Computer Networks",
    "explanation": "Correct answer is A (ping). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-158",
    "number": 158,
    "question": "Which mask corresponds to IPv4 /24?",
    "options": [
      "255.255.0.0",
      "255.255.255.0",
      "255.255.255.255",
      "255.0.0.0"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "255.255.255.0",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (255.255.255.0). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-159",
    "number": 159,
    "question": "Which IP version uses 128-bit addresses?",
    "options": [
      "IPv4",
      "IPv6",
      "ARP",
      "ICMP"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "IPv6",
    "category": "Computer Networks",
    "explanation": "Correct answer is B (IPv6). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-160",
    "number": 160,
    "question": "Which web status indicates not found?",
    "options": [
      "301",
      "500",
      "404",
      "200 Software Engineering, Git & Testing"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "404",
    "category": "Computer Networks",
    "explanation": "Correct answer is C (404). In Computer Networks, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-161",
    "number": 161,
    "question": "Which methodology uses iterative sprints?",
    "options": [
      "Scrum",
      "Big Bang",
      "V-model-only",
      "Waterfall-only"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Scrum",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is A (Scrum). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-162",
    "number": 162,
    "question": "What does CI stand for in DevOps?",
    "options": [
      "Continuous Integration",
      "Code Inspection",
      "Central Interface",
      "Compiled Input"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Continuous Integration",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is A (Continuous Integration). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-163",
    "number": 163,
    "question": "What does CD often stand for in deployment pipelines?",
    "options": [
      "Compile Definition",
      "Continuous Delivery",
      "Central Database",
      "Code Directory"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Continuous Delivery",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (Continuous Delivery). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-164",
    "number": 164,
    "question": "Which Git command creates a repository?",
    "options": [
      "git merge",
      "git push",
      "git clone-only",
      "git init"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "git init",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is D (git init). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-165",
    "number": 165,
    "question": "Which Git command records staged changes?",
    "options": [
      "git status",
      "git commit",
      "git pull",
      "git fetch"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "git commit",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (git commit). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-166",
    "number": 166,
    "question": "Which Git command creates a new branch reference?",
    "options": [
      "git log",
      "git add",
      "git diff",
      "git branch"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "git branch",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is D (git branch). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-167",
    "number": 167,
    "question": "Which Git command downloads and merges remote changes by default?",
    "options": [
      "git push",
      "git fetch",
      "git stash",
      "git pull"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "git pull",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is D (git pull). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-168",
    "number": 168,
    "question": "Which Git command stages files?",
    "options": [
      "git reset-only",
      "git show",
      "git log",
      "git add"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "git add",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is D (git add). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-169",
    "number": 169,
    "question": "Which test checks an individual function or unit?",
    "options": [
      "Acceptance",
      "Unit",
      "Integration",
      "System"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Unit",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (Unit). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-170",
    "number": 170,
    "question": "Which test checks interactions between components?",
    "options": [
      "Smoke-only",
      "Integration",
      "Mutation",
      "Unit"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Integration",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (Integration). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-171",
    "number": 171,
    "question": "Which test confirms a prior fix still works?",
    "options": [
      "Penetration",
      "Regression",
      "Usability",
      "Load"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Regression",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (Regression). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-172",
    "number": 172,
    "question": "Which test examines behavior without seeing code?",
    "options": [
      "Static-only",
      "Black-box",
      "Mutation",
      "White-box"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Black-box",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (Black-box). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-173",
    "number": 173,
    "question": "Which UML diagram shows classes and their relations?",
    "options": [
      "Class",
      "Activity",
      "Sequence",
      "Deployment"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Class",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is A (Class). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-174",
    "number": 174,
    "question": "Which design pattern ensures one global instance?",
    "options": [
      "Decorator",
      "Observer",
      "Factory",
      "Singleton"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Singleton",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is D (Singleton). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-175",
    "number": 175,
    "question": "Which pattern notifies subscribers when state changes?",
    "options": [
      "Proxy",
      "Adapter",
      "Observer",
      "Builder"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Observer",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is C (Observer). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-176",
    "number": 176,
    "question": "Which API style uses resources and HTTP verbs?",
    "options": [
      "GraphQL-only",
      "SOAP-only",
      "REST",
      "RPC-only"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "REST",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is C (REST). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-177",
    "number": 177,
    "question": "Which HTTP method typically retrieves a resource?",
    "options": [
      "DELETE",
      "PUT",
      "POST",
      "GET"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "GET",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is D (GET). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-178",
    "number": 178,
    "question": "Which HTTP method is idempotent for complete replacement?",
    "options": [
      "POST",
      "PUT",
      "PATCH always",
      "CONNECT"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "PUT",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (PUT). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-179",
    "number": 179,
    "question": "Which HTTP status indicates successful creation?",
    "options": [
      "301",
      "201",
      "404",
      "200"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "201",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (201). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-180",
    "number": 180,
    "question": "Which principle avoids repeating the same logic?",
    "options": [
      "KISS",
      "DRY",
      "SOLID",
      "YAGNI Cloud, Security & Web Basics"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "DRY",
    "category": "Software Engineering, Git & Testing",
    "explanation": "Correct answer is B (DRY). In Software Engineering, Git & Testing, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-181",
    "number": 181,
    "question": "Which cloud model rents virtual infrastructure?",
    "options": [
      "PaaS",
      "IaaS",
      "FaaS-only",
      "SaaS"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "IaaS",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is B (IaaS). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-182",
    "number": 182,
    "question": "Which cloud model delivers complete hosted applications?",
    "options": [
      "PaaS",
      "Bare metal",
      "SaaS",
      "IaaS"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "SaaS",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is C (SaaS). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-183",
    "number": 183,
    "question": "Which cloud model manages app runtime/platform?",
    "options": [
      "Colocation",
      "IaaS",
      "SaaS",
      "PaaS"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "PaaS",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is D (PaaS). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-184",
    "number": 184,
    "question": "Which technology packages apps with dependencies?",
    "options": [
      "DNS",
      "RAID",
      "Spreadsheets",
      "Containers"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Containers",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is D (Containers). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-185",
    "number": 185,
    "question": "Which tool is widely used for container orchestration?",
    "options": [
      "Redis",
      "Git",
      "Nginx",
      "Kubernetes"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Kubernetes",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is D (Kubernetes). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-186",
    "number": 186,
    "question": "Which command builds a Docker image?",
    "options": [
      "docker pull",
      "docker run",
      "docker exec",
      "docker build"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "docker build",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is D (docker build). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-187",
    "number": 187,
    "question": "Which security property restricts information disclosure?",
    "options": [
      "Availability",
      "Confidentiality",
      "Integrity",
      "Scalability"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Confidentiality",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is B (Confidentiality). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-188",
    "number": 188,
    "question": "Which security property prevents unauthorized changes?",
    "options": [
      "Latency",
      "Confidentiality",
      "Availability",
      "Integrity"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Integrity",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is D (Integrity). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-189",
    "number": 189,
    "question": "Which method checks a secret by comparing a one-way digest?",
    "options": [
      "Indexing",
      "Compression",
      "Encoding",
      "Hashing"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "Hashing",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is D (Hashing). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-190",
    "number": 190,
    "question": "Which attack injects malicious SQL into input?",
    "options": [
      "CSRF",
      "Phishing",
      "SQL injection",
      "DDoS"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "SQL injection",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is C (SQL injection). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-191",
    "number": 191,
    "question": "Which attack tricks a browser into running injected scripts?",
    "options": [
      "XSS",
      "SQLi",
      "ARP spoofing",
      "DDoS"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "XSS",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is A (XSS). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-192",
    "number": 192,
    "question": "Which defense is primary for SQL injection?",
    "options": [
      "Parameterized queries",
      "String concatenation",
      "Client-only validation",
      "HTML comments"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Parameterized queries",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is A (Parameterized queries). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-193",
    "number": 193,
    "question": "Which protocol encrypts traffic in HTTPS?",
    "options": [
      "FTP",
      "TLS",
      "ICMP",
      "ARP"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "TLS",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is B (TLS). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-194",
    "number": 194,
    "question": "Which HTTP header commonly carries a bearer access token?",
    "options": [
      "User-Agent",
      "Authorization",
      "Host",
      "Accept"
    ],
    "correct_option": 1,
    "correct_letter": "B",
    "correct_answer_text": "Authorization",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is B (Authorization). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-195",
    "number": 195,
    "question": "Which browser storage mechanism is typically sent with matching HTTP requests?",
    "options": [
      "SessionStorage",
      "LocalStorage",
      "Cookie",
      "IndexedDB"
    ],
    "correct_option": 2,
    "correct_letter": "C",
    "correct_answer_text": "Cookie",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is C (Cookie). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-196",
    "number": 196,
    "question": "Which language styles web pages?",
    "options": [
      "CSS",
      "HTML",
      "SQL",
      "JSON"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "CSS",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is A (CSS). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-197",
    "number": 197,
    "question": "Which markup language structures web pages?",
    "options": [
      "HTML",
      "CSS",
      "C",
      "Python"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "HTML",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is A (HTML). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-198",
    "number": 198,
    "question": "Which JavaScript keyword declares a block-scoped reassigned variable?",
    "options": [
      "let",
      "var",
      "static",
      "const"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "let",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is A (let). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  },
  {
    "id": "mnc-mcq-199",
    "number": 199,
    "question": "Which file format is commonly used for JSON API responses?",
    "options": [
      "EXE",
      "JPEG",
      "MP3",
      "JSON"
    ],
    "correct_option": 3,
    "correct_letter": "D",
    "correct_answer_text": "JSON",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is D (JSON). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Easy"
  },
  {
    "id": "mnc-mcq-200",
    "number": 200,
    "question": "Which security model grants only necessary permissions?",
    "options": [
      "Least privilege",
      "Trust all",
      "Default admin",
      "Open access"
    ],
    "correct_option": 0,
    "correct_letter": "A",
    "correct_answer_text": "Least privilege",
    "category": "Cloud, Security & Web Basics",
    "explanation": "Correct answer is A (Least privilege). In Cloud, Security & Web Basics, this conforms to standard technical specifications evaluated in MNC screening rounds.",
    "difficulty": "Medium"
  }
];

export const MNC_CURRICULUM_UNITS: MncUnit[] = [
  {
    "id": "unit-1",
    "unit_number": 1,
    "title": "Programming Fundamentals & Number Logic",
    "subtitle": "Reverse Digits, Primes, Factorials & Syntax Invariants",
    "description": "Master foundational control structures, recursion depth, number theory invariants, and syntax conventions expected in tier-1 initial screening rounds.",
    "domain_tag": "Fundamentals",
    "coding_problem_ids": [
      "mnc-code-001",
      "mnc-code-002",
      "mnc-code-003",
      "mnc-code-004",
      "mnc-code-005",
      "mnc-code-006",
      "mnc-code-007",
      "mnc-code-008",
      "mnc-code-009",
      "mnc-code-010"
    ],
    "mcq_ids": [
      "mnc-mcq-001",
      "mnc-mcq-002",
      "mnc-mcq-003",
      "mnc-mcq-004",
      "mnc-mcq-005",
      "mnc-mcq-006",
      "mnc-mcq-007",
      "mnc-mcq-008",
      "mnc-mcq-009",
      "mnc-mcq-010",
      "mnc-mcq-011",
      "mnc-mcq-012",
      "mnc-mcq-013",
      "mnc-mcq-014",
      "mnc-mcq-015",
      "mnc-mcq-016",
      "mnc-mcq-017",
      "mnc-mcq-018",
      "mnc-mcq-019",
      "mnc-mcq-020"
    ],
    "assessment_id": "mnc-assessment-unit-1",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 0
  },
  {
    "id": "unit-2",
    "unit_number": 2,
    "title": "Multi-Language Core (C, C++, Java, Python) & Array Traversal",
    "subtitle": "Pointers, Memory, Garbage Collection & Array Max/Mins",
    "description": "Deep dive into language-level memory allocation, object references, pointer arithmetic, and contiguous array manipulation techniques.",
    "domain_tag": "Languages & Arrays",
    "coding_problem_ids": [
      "mnc-code-011",
      "mnc-code-012",
      "mnc-code-013",
      "mnc-code-014",
      "mnc-code-015",
      "mnc-code-016",
      "mnc-code-017",
      "mnc-code-018",
      "mnc-code-019",
      "mnc-code-020"
    ],
    "mcq_ids": [
      "mnc-mcq-021",
      "mnc-mcq-022",
      "mnc-mcq-023",
      "mnc-mcq-024",
      "mnc-mcq-025",
      "mnc-mcq-026",
      "mnc-mcq-027",
      "mnc-mcq-028",
      "mnc-mcq-029",
      "mnc-mcq-030",
      "mnc-mcq-031",
      "mnc-mcq-032",
      "mnc-mcq-033",
      "mnc-mcq-034",
      "mnc-mcq-035",
      "mnc-mcq-036",
      "mnc-mcq-037",
      "mnc-mcq-038",
      "mnc-mcq-039",
      "mnc-mcq-040"
    ],
    "assessment_id": "mnc-assessment-unit-2",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-3",
    "unit_number": 3,
    "title": "Object-Oriented Design & Hash Mapping",
    "subtitle": "Encapsulation, Polymorphism & O(1) Key-Value Indexing",
    "description": "Explore OOP design patterns, inheritance hierarchies, interface contracts, hash table collision resolution, and prefix sum indexing.",
    "domain_tag": "OOP & Hashing",
    "coding_problem_ids": [
      "mnc-code-021",
      "mnc-code-022",
      "mnc-code-023",
      "mnc-code-024",
      "mnc-code-025",
      "mnc-code-026",
      "mnc-code-027",
      "mnc-code-028",
      "mnc-code-029",
      "mnc-code-030"
    ],
    "mcq_ids": [
      "mnc-mcq-041",
      "mnc-mcq-042",
      "mnc-mcq-043",
      "mnc-mcq-044",
      "mnc-mcq-045",
      "mnc-mcq-046",
      "mnc-mcq-047",
      "mnc-mcq-048",
      "mnc-mcq-049",
      "mnc-mcq-050",
      "mnc-mcq-051",
      "mnc-mcq-052",
      "mnc-mcq-053",
      "mnc-mcq-054",
      "mnc-mcq-055",
      "mnc-mcq-056",
      "mnc-mcq-057",
      "mnc-mcq-058",
      "mnc-mcq-059",
      "mnc-mcq-060"
    ],
    "assessment_id": "mnc-assessment-unit-3",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-4",
    "unit_number": 4,
    "title": "Strings, Sliding Window & Two Pointers",
    "subtitle": "Substring Search, In-Place Convergences & Linear Data Structures",
    "description": "Learn window expansion/contraction invariants, two-pointer opposite convergences, anagram hashing, and linear data representations.",
    "domain_tag": "Strings & Pointers",
    "coding_problem_ids": [
      "mnc-code-031",
      "mnc-code-032",
      "mnc-code-033",
      "mnc-code-034",
      "mnc-code-035",
      "mnc-code-036",
      "mnc-code-037",
      "mnc-code-038",
      "mnc-code-039",
      "mnc-code-040"
    ],
    "mcq_ids": [
      "mnc-mcq-061",
      "mnc-mcq-062",
      "mnc-mcq-063",
      "mnc-mcq-064",
      "mnc-mcq-065",
      "mnc-mcq-066",
      "mnc-mcq-067",
      "mnc-mcq-068",
      "mnc-mcq-069",
      "mnc-mcq-070",
      "mnc-mcq-071",
      "mnc-mcq-072",
      "mnc-mcq-073",
      "mnc-mcq-074",
      "mnc-mcq-075",
      "mnc-mcq-076",
      "mnc-mcq-077",
      "mnc-mcq-078",
      "mnc-mcq-079",
      "mnc-mcq-080"
    ],
    "assessment_id": "mnc-assessment-unit-4",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-5",
    "unit_number": 5,
    "title": "Sorting Mechanisms, Binary Search & Complexity",
    "subtitle": "Logarithmic Search, Partitioning & Asymptotic Recurrences",
    "description": "Conquer QuickSort/MergeSort recursions, binary search space pruning, monotonic conditions, and Master Theorem complexity bounds.",
    "domain_tag": "Algorithms & Search",
    "coding_problem_ids": [
      "mnc-code-041",
      "mnc-code-042",
      "mnc-code-043",
      "mnc-code-044",
      "mnc-code-045",
      "mnc-code-046",
      "mnc-code-047",
      "mnc-code-048",
      "mnc-code-049",
      "mnc-code-050"
    ],
    "mcq_ids": [
      "mnc-mcq-081",
      "mnc-mcq-082",
      "mnc-mcq-083",
      "mnc-mcq-084",
      "mnc-mcq-085",
      "mnc-mcq-086",
      "mnc-mcq-087",
      "mnc-mcq-088",
      "mnc-mcq-089",
      "mnc-mcq-090",
      "mnc-mcq-091",
      "mnc-mcq-092",
      "mnc-mcq-093",
      "mnc-mcq-094",
      "mnc-mcq-095",
      "mnc-mcq-096",
      "mnc-mcq-097",
      "mnc-mcq-098",
      "mnc-mcq-099",
      "mnc-mcq-100"
    ],
    "assessment_id": "mnc-assessment-unit-5",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-6",
    "unit_number": 6,
    "title": "Linked Lists, Monotonic Stacks & Operating Systems",
    "subtitle": "Pointer Mutations, Process Scheduling & Memory Paging",
    "description": "Master in-place linked list manipulations, next greater element monotonic stacks, CPU process scheduling, and virtual memory page replacement.",
    "domain_tag": "Lists & OS Internals",
    "coding_problem_ids": [
      "mnc-code-051",
      "mnc-code-052",
      "mnc-code-053",
      "mnc-code-054",
      "mnc-code-055",
      "mnc-code-056",
      "mnc-code-057",
      "mnc-code-058",
      "mnc-code-059",
      "mnc-code-060"
    ],
    "mcq_ids": [
      "mnc-mcq-121",
      "mnc-mcq-122",
      "mnc-mcq-123",
      "mnc-mcq-124",
      "mnc-mcq-125",
      "mnc-mcq-126",
      "mnc-mcq-127",
      "mnc-mcq-128",
      "mnc-mcq-129",
      "mnc-mcq-130",
      "mnc-mcq-131",
      "mnc-mcq-132",
      "mnc-mcq-133",
      "mnc-mcq-134",
      "mnc-mcq-135",
      "mnc-mcq-136",
      "mnc-mcq-137",
      "mnc-mcq-138",
      "mnc-mcq-139",
      "mnc-mcq-140"
    ],
    "assessment_id": "mnc-assessment-unit-6",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-7",
    "unit_number": 7,
    "title": "Trees, Priority Heaps & Computer Networks",
    "subtitle": "BST Traversals, Heap Invariants, TCP/IP & Socket Protocols",
    "description": "Hierarchical tree traversals, Lowest Common Ancestor, Trie prefix lookups, and computer networking layers from TCP sockets to HTTP/3.",
    "domain_tag": "Trees & Networks",
    "coding_problem_ids": [
      "mnc-code-061",
      "mnc-code-062",
      "mnc-code-063",
      "mnc-code-064",
      "mnc-code-065",
      "mnc-code-066",
      "mnc-code-067",
      "mnc-code-068",
      "mnc-code-069",
      "mnc-code-070"
    ],
    "mcq_ids": [
      "mnc-mcq-141",
      "mnc-mcq-142",
      "mnc-mcq-143",
      "mnc-mcq-144",
      "mnc-mcq-145",
      "mnc-mcq-146",
      "mnc-mcq-147",
      "mnc-mcq-148",
      "mnc-mcq-149",
      "mnc-mcq-150",
      "mnc-mcq-151",
      "mnc-mcq-152",
      "mnc-mcq-153",
      "mnc-mcq-154",
      "mnc-mcq-155",
      "mnc-mcq-156",
      "mnc-mcq-157",
      "mnc-mcq-158",
      "mnc-mcq-159",
      "mnc-mcq-160"
    ],
    "assessment_id": "mnc-assessment-unit-7",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-8",
    "unit_number": 8,
    "title": "Graph Theory, Traversals & Software Engineering",
    "subtitle": "BFS/DFS Islands, Git Versioning & CI/CD Testing Pipelines",
    "description": "Adjacency matrix/list graphs, connected component discovery, topological DAG sorting, Git branch management, and automated testing.",
    "domain_tag": "Graphs & Devops",
    "coding_problem_ids": [
      "mnc-code-071",
      "mnc-code-072",
      "mnc-code-073",
      "mnc-code-074",
      "mnc-code-075",
      "mnc-code-076",
      "mnc-code-077",
      "mnc-code-078",
      "mnc-code-079",
      "mnc-code-080"
    ],
    "mcq_ids": [
      "mnc-mcq-161",
      "mnc-mcq-162",
      "mnc-mcq-163",
      "mnc-mcq-164",
      "mnc-mcq-165",
      "mnc-mcq-166",
      "mnc-mcq-167",
      "mnc-mcq-168",
      "mnc-mcq-169",
      "mnc-mcq-170",
      "mnc-mcq-171",
      "mnc-mcq-172",
      "mnc-mcq-173",
      "mnc-mcq-174",
      "mnc-mcq-175",
      "mnc-mcq-176",
      "mnc-mcq-177",
      "mnc-mcq-178",
      "mnc-mcq-179",
      "mnc-mcq-180"
    ],
    "assessment_id": "mnc-assessment-unit-8",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-9",
    "unit_number": 9,
    "title": "Dynamic Programming & Cloud Security Architecture",
    "subtitle": "State Transitions, Knapsack, HTTPS Encryption & Microservices",
    "description": "Solve 1D and 2D DP recurrence relations, memoization caching, greedy activity selection, cloud containerization, and public key cryptography.",
    "domain_tag": "DP & Cloud Security",
    "coding_problem_ids": [
      "mnc-code-081",
      "mnc-code-082",
      "mnc-code-083",
      "mnc-code-084",
      "mnc-code-085",
      "mnc-code-086",
      "mnc-code-087",
      "mnc-code-088",
      "mnc-code-089",
      "mnc-code-090"
    ],
    "mcq_ids": [
      "mnc-mcq-181",
      "mnc-mcq-182",
      "mnc-mcq-183",
      "mnc-mcq-184",
      "mnc-mcq-185",
      "mnc-mcq-186",
      "mnc-mcq-187",
      "mnc-mcq-188",
      "mnc-mcq-189",
      "mnc-mcq-190",
      "mnc-mcq-191",
      "mnc-mcq-192",
      "mnc-mcq-193",
      "mnc-mcq-194",
      "mnc-mcq-195",
      "mnc-mcq-196",
      "mnc-mcq-197",
      "mnc-mcq-198",
      "mnc-mcq-199",
      "mnc-mcq-200"
    ],
    "assessment_id": "mnc-assessment-unit-9",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  },
  {
    "id": "unit-10",
    "unit_number": 10,
    "title": "High-Performance SQL, Bitwise Logic & Databases",
    "subtitle": "Bitwise XOR, Relational Indexing, ACID & Window Functions",
    "description": "Conquer low-level bitwise manipulation masks, SQL group ranking, B-Tree database indexing, and transaction concurrency isolation.",
    "domain_tag": "SQL & Bitwise",
    "coding_problem_ids": [
      "mnc-code-091",
      "mnc-code-092",
      "mnc-code-093",
      "mnc-code-094",
      "mnc-code-095",
      "mnc-code-096",
      "mnc-code-097",
      "mnc-code-098",
      "mnc-code-099",
      "mnc-code-100"
    ],
    "mcq_ids": [
      "mnc-mcq-101",
      "mnc-mcq-102",
      "mnc-mcq-103",
      "mnc-mcq-104",
      "mnc-mcq-105",
      "mnc-mcq-106",
      "mnc-mcq-107",
      "mnc-mcq-108",
      "mnc-mcq-109",
      "mnc-mcq-110",
      "mnc-mcq-111",
      "mnc-mcq-112",
      "mnc-mcq-113",
      "mnc-mcq-114",
      "mnc-mcq-115",
      "mnc-mcq-116",
      "mnc-mcq-117",
      "mnc-mcq-118",
      "mnc-mcq-119",
      "mnc-mcq-120"
    ],
    "assessment_id": "mnc-assessment-unit-10",
    "duration_minutes": 45,
    "passing_score": 75,
    "unlock_threshold": 75
  }
];
