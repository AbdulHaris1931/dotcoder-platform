import { Organization, UserProfile, Problem, Assessment, Submission } from "@/types";

export const SEED_ORGANIZATION: Organization = {
  id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  name: "Cauvery Institute of Technology, Thanjavur",
  code: "CIT-TN",
  city: "Thanjavur, Tamil Nadu",
  plan_tier: "enterprise",
  created_at: new Date().toISOString(),
};

export const SEED_TPO: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  org_id: SEED_ORGANIZATION.id,
  full_name: "Dr. S. Ranganathan",
  roll_no: "TPO-01",
  department: "Placement Cell",
  batch_year: 2026,
  role: "tpo",
  readiness_score: 98.5,
  email: "tpo@cauvery.edu.in",
  created_at: new Date().toISOString(),
};

export const SEED_STUDENTS: UserProfile[] = [
  {
    id: "00000000-0000-0000-0000-000000000002",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Adithya K. Sundaram",
    roll_no: "22CS001",
    department: "CSE",
    batch_year: 2026,
    role: "student",
    readiness_score: 88.0,
    email: "adithya.22cs@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Kavitha Ramachandran",
    roll_no: "22CS014",
    department: "CSE",
    batch_year: 2026,
    role: "student",
    readiness_score: 92.5,
    email: "kavitha.22cs@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Manoj Kumar V.",
    roll_no: "22CS029",
    department: "CSE",
    batch_year: 2026,
    role: "student",
    readiness_score: 64.0,
    email: "manoj.22cs@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Deepika Natarajan",
    roll_no: "22IT008",
    department: "IT",
    batch_year: 2026,
    role: "student",
    readiness_score: 81.0,
    email: "deepika.22it@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Siddharth S.",
    roll_no: "22IT022",
    department: "IT",
    batch_year: 2026,
    role: "student",
    readiness_score: 76.5,
    email: "siddharth.22it@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Priyanka Balaji",
    roll_no: "22IT035",
    department: "IT",
    batch_year: 2026,
    role: "student",
    readiness_score: 58.0,
    email: "priyanka.22it@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Vigneshwaran P.",
    roll_no: "22EC011",
    department: "ECE",
    batch_year: 2026,
    role: "student",
    readiness_score: 78.0,
    email: "vignesh.22ec@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Nandhini Murugan",
    roll_no: "22EC027",
    department: "ECE",
    batch_year: 2026,
    role: "student",
    readiness_score: 84.5,
    email: "nandhini.22ec@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Hariharan R.",
    roll_no: "22EC042",
    department: "ECE",
    batch_year: 2026,
    role: "student",
    readiness_score: 45.0,
    email: "hariharan.22ec@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Shalini Devendran",
    roll_no: "22EE005",
    department: "EEE",
    batch_year: 2026,
    role: "student",
    readiness_score: 72.0,
    email: "shalini.22ee@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Karthick Raja M.",
    roll_no: "22EE019",
    department: "EEE",
    batch_year: 2026,
    role: "student",
    readiness_score: 68.0,
    email: "karthick.22ee@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Abinaya Selvam",
    roll_no: "22EE031",
    department: "EEE",
    batch_year: 2026,
    role: "student",
    readiness_score: 52.0,
    email: "abinaya.22ee@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Gokulnath C.",
    roll_no: "22ME003",
    department: "Mech",
    batch_year: 2026,
    role: "student",
    readiness_score: 74.0,
    email: "gokulnath.22me@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Praveen Raj K.",
    roll_no: "22ME018",
    department: "Mech",
    batch_year: 2026,
    role: "student",
    readiness_score: 61.5,
    email: "praveen.22me@cauvery.edu.in",
  },
  {
    id: "00000000-0000-0000-0000-000000000016",
    org_id: SEED_ORGANIZATION.id,
    full_name: "Suresh Kumar B.",
    roll_no: "22ME037",
    department: "Mech",
    batch_year: 2026,
    role: "student",
    readiness_score: 41.0,
    email: "suresh.22me@cauvery.edu.in",
  },
];

export const SEED_PROBLEMS: Problem[] = [
  {
    id: "11111111-0000-0000-0000-000000000001",
    title: "Two Sum Target Pair",
    slug: "two-sum-target",
    difficulty: "Easy",
    company_tags: ["Zoho", "TCS NQT"],
    type: "coding",
    description_md: `### Problem Statement
Given an array of integers \`nums\` and an integer \`target\`, find the **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice. Return the indices sorted in ascending order separated by a single space.

### Input Format
- **Line 1:** Space-separated integers representing the array \`nums\`.
- **Line 2:** An integer \`target\`.

### Output Format
- Print two space-separated indices \`i j\` (\`i < j\`).

### Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
`,
    starter_code_json: {
      python: `import sys

def solve():
    lines = [line.strip() for line in sys.stdin.read().strip().split("\\n") if line.strip()]
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        if (!sc.hasNextInt()) return;
        int target = sc.nextInt();
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                System.out.println(map.get(complement) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <unordered_map>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);
    int target;
    if (!(cin >> target)) return 0;
    unordered_map<int, int> mp;
    for (int i = 0; i < (int)nums.size(); i++) {
        int complement = target - nums[i];
        if (mp.count(complement)) {
            cout << mp[complement] << " " << i << endl;
            return 0;
        }
        mp[nums[i]] = i;
    }
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[10000];
    if (!fgets(line, sizeof(line), stdin)) return 0;
    int nums[5000];
    int n = 0;
    char *tok = strtok(line, " \\t\\r\\n");
    while (tok) {
        nums[n++] = atoi(tok);
        tok = strtok(NULL, " \\t\\r\\n");
    }
    int target;
    if (scanf("%d", &target) != 1) return 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-101",
        problem_id: "11111111-0000-0000-0000-000000000001",
        input: "2 7 11 15\n9",
        expected_output: "0 1",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-102",
        problem_id: "11111111-0000-0000-0000-000000000001",
        input: "3 2 4\n6",
        expected_output: "1 2",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-103",
        problem_id: "11111111-0000-0000-0000-000000000001",
        input: "3 3\n6",
        expected_output: "0 1",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-104",
        problem_id: "11111111-0000-0000-0000-000000000001",
        input: "1 5 8 12 14\n20",
        expected_output: "2 3",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-105",
        problem_id: "11111111-0000-0000-0000-000000000001",
        input: "-10 -3 4 7 19\n-6",
        expected_output: "0 1",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
  {
    id: "11111111-0000-0000-0000-000000000002",
    title: "Longest Unique Substring",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    company_tags: ["Infosys", "Zoho"],
    type: "coding",
    description_md: `### Problem Statement
Given a string \`s\`, find the length of the longest substring without repeating characters.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print an integer denoting the maximum length of a non-repeating substring.

### Constraints
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols, and spaces.
`,
    starter_code_json: {
      python: `import sys

def solve():
    s = sys.stdin.read().rstrip("\\r\\n")
    char_map = {}
    left = 0
    max_len = 0
    for right, c in enumerate(s):
        if c in char_map and char_map[c] >= left:
            left = char_map[c] + 1
        char_map[c] = right
        max_len = max(max_len, right - left + 1)
    print(max_len)

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine().replaceAll("[\\\\r\\\\n]", "") : "";
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        System.out.println(maxLen);
    }
}
`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

int main() {
    string s;
    if (!getline(cin, s)) { cout << 0 << endl; return 0; }
    while (!s.empty() && (s.back() == '\\r' || s.back() == '\\n')) s.pop_back();
    unordered_map<char, int> mp;
    int left = 0, maxLen = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        if (mp.count(s[right]) && mp[s[right]] >= left) {
            left = mp[s[right]] + 1;
        }
        mp[s[right]] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    cout << maxLen << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[50000];
    if (!fgets(s, sizeof(s), stdin)) { printf("0\\n"); return 0; }
    int n = strlen(s);
    while (n > 0 && (s[n-1] == '\\n' || s[n-1] == '\\r')) n--;
    s[n] = '\\0';
    int last[256];
    for (int i = 0; i < 256; i++) last[i] = -1;
    int left = 0, maxLen = 0;
    for (int right = 0; right < n; right++) {
        unsigned char c = (unsigned char)s[right];
        if (last[c] >= left) left = last[c] + 1;
        last[c] = right;
        int cur = right - left + 1;
        if (cur > maxLen) maxLen = cur;
    }
    printf("%d\\n", maxLen);
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-201",
        problem_id: "11111111-0000-0000-0000-000000000002",
        input: "abcabcbb",
        expected_output: "3",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-202",
        problem_id: "11111111-0000-0000-0000-000000000002",
        input: "bbbbb",
        expected_output: "1",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-203",
        problem_id: "11111111-0000-0000-0000-000000000002",
        input: "pwwkew",
        expected_output: "3",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-204",
        problem_id: "11111111-0000-0000-0000-000000000002",
        input: "au",
        expected_output: "2",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-205",
        problem_id: "11111111-0000-0000-0000-000000000002",
        input: "dvdf",
        expected_output: "3",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
  {
    id: "11111111-0000-0000-0000-000000000003",
    title: "Valid Balanced Parentheses",
    slug: "valid-parentheses-depth",
    difficulty: "Easy",
    company_tags: ["Cognizant", "TCS NQT"],
    type: "coding",
    description_md: `### Problem Statement
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` if valid, else \`false\`.
`,
    starter_code_json: {
      python: `import sys

def solve():
    s = sys.stdin.read().strip()
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for c in s:
        if c in pairs.values():
            stack.append(c)
        elif c in pairs:
            if not stack or stack.pop() != pairs[c]:
                print("false")
                return
        else:
            continue
    print("true" if not stack else "false")

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNext() ? sc.next().trim() : "";
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else if (c == ')') {
                if (stack.isEmpty() || stack.pop() != '(') { System.out.println("false"); return; }
            } else if (c == '}') {
                if (stack.isEmpty() || stack.pop() != '{') { System.out.println("false"); return; }
            } else if (c == ']') {
                if (stack.isEmpty() || stack.pop() != '[') { System.out.println("false"); return; }
            }
        }
        System.out.println(stack.isEmpty() ? "true" : "false");
    }
}
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) { cout << "true" << endl; return 0; }
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else if (c == ')') {
            if (st.empty() || st.top() != '(') { cout << "false" << endl; return 0; }
            st.pop();
        } else if (c == '}') {
            if (st.empty() || st.top() != '{') { cout << "false" << endl; return 0; }
            st.pop();
        } else if (c == ']') {
            if (st.empty() || st.top() != '[') { cout << "false" << endl; return 0; }
            st.pop();
        }
    }
    cout << (st.empty() ? "true" : "false") << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char s[10000];
    if (scanf("%s", s) != 1) { printf("true\\n"); return 0; }
    char stack[10000];
    int top = -1;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else if (c == ')') {
            if (top < 0 || stack[top--] != '(') { printf("false\\n"); return 0; }
        } else if (c == '}') {
            if (top < 0 || stack[top--] != '{') { printf("false\\n"); return 0; }
        } else if (c == ']') {
            if (top < 0 || stack[top--] != '[') { printf("false\\n"); return 0; }
        }
    }
    printf("%s\\n", top == -1 ? "true" : "false");
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-301",
        problem_id: "11111111-0000-0000-0000-000000000003",
        input: "()[]{}",
        expected_output: "true",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-302",
        problem_id: "11111111-0000-0000-0000-000000000003",
        input: "(]",
        expected_output: "false",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-303",
        problem_id: "11111111-0000-0000-0000-000000000003",
        input: "([{}])",
        expected_output: "true",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-304",
        problem_id: "11111111-0000-0000-0000-000000000003",
        input: "({[)]}",
        expected_output: "false",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-305",
        problem_id: "11111111-0000-0000-0000-000000000003",
        input: "(((((((((())))))))))",
        expected_output: "true",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
  {
    id: "11111111-0000-0000-0000-000000000004",
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "Hard",
    company_tags: ["Zoho", "Infosys"],
    type: "coding",
    description_md: `### Problem Statement
Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

### Input Format
- A single line containing space-separated non-negative integers representing the elevation heights.

### Output Format
- Print a single integer representing total trapped rain units.
`,
    starter_code_json: {
      python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        print(0)
        return
    h = list(map(int, line.split()))
    if not h:
        print(0)
        return
    left, right = 0, len(h) - 1
    max_l, max_r = 0, 0
    ans = 0
    while left < right:
        if h[left] <= h[right]:
            if h[left] >= max_l:
                max_l = h[left]
            else:
                ans += max_l - h[left]
            left += 1
        else:
            if h[right] >= max_r:
                max_r = h[right]
            else:
                ans += max_r - h[right]
            right -= 1
    print(ans)

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) { System.out.println(0); return; }
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] h = new int[parts.length];
        for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i]);
        int left = 0, right = h.length - 1;
        int maxL = 0, maxR = 0, ans = 0;
        while (left < right) {
            if (h[left] <= h[right]) {
                if (h[left] >= maxL) maxL = h[left];
                else ans += maxL - h[left];
                left++;
            } else {
                if (h[right] >= maxR) maxR = h[right];
                else ans += maxR - h[right];
                right--;
            }
        }
        System.out.println(ans);
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) { cout << 0 << endl; return 0; }
    stringstream ss(line);
    vector<int> h;
    int val;
    while (ss >> val) h.push_back(val);
    int left = 0, right = (int)h.size() - 1;
    int maxL = 0, maxR = 0, ans = 0;
    while (left < right) {
        if (h[left] <= h[right]) {
            if (h[left] >= maxL) maxL = h[left];
            else ans += maxL - h[left];
            left++;
        } else {
            if (h[right] >= maxR) maxR = h[right];
            else ans += maxR - h[right];
            right--;
        }
    }
    cout << ans << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[50000];
    if (!fgets(line, sizeof(line), stdin)) { printf("0\\n"); return 0; }
    int h[10000];
    int n = 0;
    char *tok = strtok(line, " \\t\\r\\n");
    while (tok) {
        h[n++] = atoi(tok);
        tok = strtok(NULL, " \\t\\r\\n");
    }
    int left = 0, right = n - 1;
    int maxL = 0, maxR = 0, ans = 0;
    while (left < right) {
        if (h[left] <= h[right]) {
            if (h[left] >= maxL) maxL = h[left];
            else ans += maxL - h[left];
            left++;
        } else {
            if (h[right] >= maxR) maxR = h[right];
            else ans += maxR - h[right];
            right--;
        }
    }
    printf("%d\\n", ans);
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-401",
        problem_id: "11111111-0000-0000-0000-000000000004",
        input: "0 1 0 2 1 0 1 3 2 1 2 1",
        expected_output: "6",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-402",
        problem_id: "11111111-0000-0000-0000-000000000004",
        input: "4 2 0 3 2 5",
        expected_output: "9",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-403",
        problem_id: "11111111-0000-0000-0000-000000000004",
        input: "3 0 2 0 4",
        expected_output: "7",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-404",
        problem_id: "11111111-0000-0000-0000-000000000004",
        input: "1 2 3 4 5",
        expected_output: "0",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-405",
        problem_id: "11111111-0000-0000-0000-000000000004",
        input: "5 4 1 2",
        expected_output: "1",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
  {
    id: "11111111-0000-0000-0000-000000000005",
    title: "Subarray with Given Sum",
    slug: "subarray-with-given-sum",
    difficulty: "Medium",
    company_tags: ["TCS NQT", "Cognizant"],
    type: "coding",
    description_md: `### Problem Statement
Given an unsorted array of non-negative integers \`nums\` and an integer \`S\`, find a continuous subarray which adds to a given sum \`S\`. Output the 1-based start and end indices of the first such subarray found. If no such subarray exists, output \`-1\`.

### Input Format
- Line 1: Space-separated integers representing the array \`nums\`.
- Line 2: Target sum \`S\`.

### Output Format
- Space-separated 1-based indices \`start end\` or \`-1\`.
`,
    starter_code_json: {
      python: `import sys

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split("\\n") if l.strip()]
    if len(lines) < 2:
        print("-1")
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
    cur_sum = 0
    left = 0
    for right, val in enumerate(nums):
        cur_sum += val
        while cur_sum > target and left <= right:
            cur_sum -= nums[left]
            left += 1
        if cur_sum == target:
            print(f"{left + 1} {right + 1}")
            return
    print("-1")

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) { System.out.println("-1"); return; }
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        if (!sc.hasNextInt()) { System.out.println("-1"); return; }
        int target = sc.nextInt();
        int curSum = 0, left = 0;
        for (int right = 0; right < nums.length; right++) {
            curSum += nums[right];
            while (curSum > target && left <= right) {
                curSum -= nums[left++];
            }
            if (curSum == target) {
                System.out.println((left + 1) + " " + (right + 1));
                return;
            }
        }
        System.out.println("-1");
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) { cout << -1 << endl; return 0; }
    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);
    int target;
    if (!(cin >> target)) { cout << -1 << endl; return 0; }
    int curSum = 0, left = 0;
    for (int right = 0; right < (int)nums.size(); right++) {
        curSum += nums[right];
        while (curSum > target && left <= right) curSum -= nums[left++];
        if (curSum == target) {
            cout << (left + 1) << " " << (right + 1) << endl;
            return 0;
        }
    }
    cout << -1 << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[50000];
    if (!fgets(line, sizeof(line), stdin)) { printf("-1\\n"); return 0; }
    int nums[10000];
    int n = 0;
    char *tok = strtok(line, " \\t\\r\\n");
    while (tok) {
        nums[n++] = atoi(tok);
        tok = strtok(NULL, " \\t\\r\\n");
    }
    int target;
    if (scanf("%d", &target) != 1) { printf("-1\\n"); return 0; }
    int cur = 0, left = 0;
    for (int right = 0; right < n; right++) {
        cur += nums[right];
        while (cur > target && left <= right) cur -= nums[left++];
        if (cur == target) {
            printf("%d %d\\n", left + 1, right + 1);
            return 0;
        }
    }
    printf("-1\\n");
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-501",
        problem_id: "11111111-0000-0000-0000-000000000005",
        input: "1 2 3 7 5\n12",
        expected_output: "2 4",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-502",
        problem_id: "11111111-0000-0000-0000-000000000005",
        input: "1 2 3 4 5 6 7 8 9 10\n15",
        expected_output: "1 5",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-503",
        problem_id: "11111111-0000-0000-0000-000000000005",
        input: "5 3 4\n2",
        expected_output: "-1",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-504",
        problem_id: "11111111-0000-0000-0000-000000000005",
        input: "7 2 3 1 6\n11",
        expected_output: "1 4",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-505",
        problem_id: "11111111-0000-0000-0000-000000000005",
        input: "10 20 30\n50",
        expected_output: "2 3",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
  {
    id: "11111111-0000-0000-0000-000000000006",
    title: "Minimum Coin Change",
    slug: "coin-change-minimum",
    difficulty: "Medium",
    company_tags: ["Infosys", "Zoho"],
    type: "coding",
    description_md: `### Problem Statement
You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

### Input Format
- Line 1: Space-separated integers representing the coin denominations.
- Line 2: The integer \`amount\`.

### Output Format
- Single integer representing the minimum coins required, or \`-1\`.
`,
    starter_code_json: {
      python: `import sys

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split("\\n") if l.strip()]
    if len(lines) < 2:
        print(0)
        return
    coins = list(map(int, lines[0].split()))
    amount = int(lines[1])
    
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    print(dp[amount] if dp[amount] != float('inf') else -1)

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] coins = new int[parts.length];
        for (int i = 0; i < parts.length; i++) coins[i] = Integer.parseInt(parts[i]);
        if (!sc.hasNextInt()) return;
        int amount = sc.nextInt();
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int coin : coins) {
            for (int x = coin; x <= amount; x++) {
                dp[x] = Math.min(dp[x], dp[x - coin] + 1);
            }
        }
        System.out.println(dp[amount] > amount ? -1 : dp[amount]);
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    vector<int> coins;
    int c;
    while (ss >> c) coins.push_back(c);
    int amount;
    if (!(cin >> amount)) return 0;
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int coin : coins) {
        for (int x = coin; x <= amount; x++) {
            dp[x] = min(dp[x], dp[x - coin] + 1);
        }
    }
    cout << (dp[amount] > amount ? -1 : dp[amount]) << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[50000];
    if (!fgets(line, sizeof(line), stdin)) return 0;
    int coins[100];
    int n = 0;
    char *tok = strtok(line, " \\t\\r\\n");
    while (tok) {
        coins[n++] = atoi(tok);
        tok = strtok(NULL, " \\t\\r\\n");
    }
    int amount;
    if (scanf("%d", &amount) != 1) return 0;
    int *dp = (int*)malloc((amount + 1) * sizeof(int));
    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;
    dp[0] = 0;
    for (int i = 0; i < n; i++) {
        int coin = coins[i];
        for (int x = coin; x <= amount; x++) {
            if (dp[x - coin] + 1 < dp[x]) dp[x] = dp[x - coin] + 1;
        }
    }
    printf("%d\\n", dp[amount] > amount ? -1 : dp[amount]);
    free(dp);
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-601",
        problem_id: "11111111-0000-0000-0000-000000000006",
        input: "1 2 5\n11",
        expected_output: "3",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-602",
        problem_id: "11111111-0000-0000-0000-000000000006",
        input: "2\n3",
        expected_output: "-1",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-603",
        problem_id: "11111111-0000-0000-0000-000000000006",
        input: "1\n0",
        expected_output: "0",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-604",
        problem_id: "11111111-0000-0000-0000-000000000006",
        input: "1 3 4 5\n7",
        expected_output: "2",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-605",
        problem_id: "11111111-0000-0000-0000-000000000006",
        input: "2 5 10\n15",
        expected_output: "2",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
  {
    id: "11111111-0000-0000-0000-000000000007",
    title: "Merge Overlapping Intervals",
    slug: "merge-sorted-intervals",
    difficulty: "Medium",
    company_tags: ["Cognizant", "Zoho"],
    type: "coding",
    description_md: `### Problem Statement
Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return the non-overlapping intervals sorted by start time.

### Input Format
- First line: Integer \`N\` denoting number of intervals.
- Next \`N\` lines: Two space-separated integers representing \`start\` and \`end\`.

### Output Format
- Print each merged interval on a new line formatted as \`start end\`.
`,
    starter_code_json: {
      python: `import sys

def solve():
    lines = [l.strip() for l in sys.stdin.read().strip().split("\\n") if l.strip()]
    if not lines:
        return
    n = int(lines[0])
    intervals = []
    for i in range(1, n + 1):
        if i < len(lines):
            intervals.append(list(map(int, lines[i].split())))
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    for s, e in merged:
        print(f"{s} {e}")

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] cur : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < cur[0]) {
                merged.add(cur);
            } else {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], cur[1]);
            }
        }
        for (int[] inter : merged) {
            System.out.println(inter[0] + " " + inter[1]);
        }
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; i++) cin >> intervals[i].first >> intervals[i].second;
    sort(intervals.begin(), intervals.end());
    vector<pair<int, int>> merged;
    for (auto &cur : intervals) {
        if (merged.empty() || merged.back().second < cur.first) {
            merged.push_back(cur);
        } else {
            merged.back().second = max(merged.back().second, cur.second);
        }
    }
    for (auto &p : merged) cout << p.first << " " << p.second << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

typedef struct { int start; int end; } Interval;

int compare(const void *a, const void *b) {
    return ((Interval*)a)->start - ((Interval*)b)->start;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    Interval *arr = (Interval*)malloc(n * sizeof(Interval));
    for (int i = 0; i < n; i++) scanf("%d %d", &arr[i].start, &arr[i].end);
    qsort(arr, n, sizeof(Interval), compare);
    Interval *merged = (Interval*)malloc(n * sizeof(Interval));
    int m = 0;
    for (int i = 0; i < n; i++) {
        if (m == 0 || merged[m - 1].end < arr[i].start) {
            merged[m++] = arr[i];
        } else {
            if (arr[i].end > merged[m - 1].end) merged[m - 1].end = arr[i].end;
        }
    }
    for (int i = 0; i < m; i++) printf("%d %d\\n", merged[i].start, merged[i].end);
    free(arr); free(merged);
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-701",
        problem_id: "11111111-0000-0000-0000-000000000007",
        input: "4\n1 3\n2 6\n8 10\n15 18",
        expected_output: "1 6\n8 10\n15 18",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-702",
        problem_id: "11111111-0000-0000-0000-000000000007",
        input: "2\n1 4\n4 5",
        expected_output: "1 5",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-703",
        problem_id: "11111111-0000-0000-0000-000000000007",
        input: "3\n1 4\n0 2\n3 5",
        expected_output: "0 5",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-704",
        problem_id: "11111111-0000-0000-0000-000000000007",
        input: "3\n6 8\n1 9\n2 4",
        expected_output: "1 9",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-705",
        problem_id: "11111111-0000-0000-0000-000000000007",
        input: "1\n2 3",
        expected_output: "2 3",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
  {
    id: "11111111-0000-0000-0000-000000000008",
    title: "Find Peak Element",
    slug: "binary-tree-maximum-path-sum",
    difficulty: "Easy",
    company_tags: ["TCS NQT", "Infosys"],
    type: "coding",
    description_md: `### Problem Statement
A peak element is an element that is strictly greater than its neighbors.

Given a 0-indexed integer array \`nums\`, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.

You may imagine that \`nums[-1] = nums[n] = -∞\`.

### Input Format
- A single line of space-separated integers.

### Output Format
- Single integer representing any peak index.
`,
    starter_code_json: {
      python: `import sys

def solve():
    line = sys.stdin.read().strip()
    if not line:
        return
    nums = list(map(int, line.split()))
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[mid + 1]:
            right = mid
        else:
            left = mid + 1
    print(left)

if __name__ == "__main__":
    solve()
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = (left + right) / 2;
            if (nums[mid] > nums[mid + 1]) right = mid;
            else left = mid + 1;
        }
        System.out.println(left);
    }
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    vector<int> nums;
    int val;
    while (ss >> val) nums.push_back(val);
    int left = 0, right = (int)nums.size() - 1;
    while (left < right) {
        int mid = (left + right) / 2;
        if (nums[mid] > nums[mid + 1]) right = mid;
        else left = mid + 1;
    }
    cout << left << endl;
    return 0;
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[50000];
    if (!fgets(line, sizeof(line), stdin)) return 0;
    int nums[10000];
    int n = 0;
    char *tok = strtok(line, " \\t\\r\\n");
    while (tok) {
        nums[n++] = atoi(tok);
        tok = strtok(NULL, " \\t\\r\\n");
    }
    int left = 0, right = n - 1;
    while (left < right) {
        int mid = (left + right) / 2;
        if (nums[mid] > nums[mid + 1]) right = mid;
        else left = mid + 1;
    }
    printf("%d\\n", left);
    return 0;
}
`,
    },
    test_cases: [
      {
        id: "tc-801",
        problem_id: "11111111-0000-0000-0000-000000000008",
        input: "1 2 3 1",
        expected_output: "2",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-802",
        problem_id: "11111111-0000-0000-0000-000000000008",
        input: "1 2 1 3 5 6 4",
        expected_output: "5",
        is_hidden: false,
        weight: 20,
      },
      {
        id: "tc-803",
        problem_id: "11111111-0000-0000-0000-000000000008",
        input: "1 2",
        expected_output: "1",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-804",
        problem_id: "11111111-0000-0000-0000-000000000008",
        input: "2 1",
        expected_output: "0",
        is_hidden: true,
        weight: 20,
      },
      {
        id: "tc-805",
        problem_id: "11111111-0000-0000-0000-000000000008",
        input: "1 5 10 20 15 7 2",
        expected_output: "3",
        is_hidden: true,
        weight: 20,
      },
    ],
  },
];

export const SEED_MCQS: Problem[] = [
  {
    id: "33333333-0000-0000-0000-000000000001",
    title: "Time & Work Rate Problem",
    slug: "mcq-time-and-work-1",
    difficulty: "Easy",
    company_tags: ["TCS NQT", "Infosys"],
    type: "mcq",
    description_md: "A can complete a piece of work in 12 days and B can do the same work in 18 days. If they work together, in how many days will the entire work be completed?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["7.2 days", "8.5 days", "6.4 days", "9 days"],
    correct_option: "7.2 days",
    explanation: "Combined rate = 1/12 + 1/18 = (3 + 2)/36 = 5/36. Total time = 36/5 = 7.2 days.",
  },
  {
    id: "33333333-0000-0000-0000-000000000002",
    title: "Data Structure Asymptotic Complexity",
    slug: "mcq-time-complexity-hashmap",
    difficulty: "Easy",
    company_tags: ["Zoho"],
    type: "mcq",
    description_md: "What is the worst-case time complexity of searching an element in a Hash Table when using separate chaining with linked lists under total hash collisions?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct_option: "O(n)",
    explanation: "When all keys hash to the same bucket, the linked list contains all n items, reducing search time to O(n).",
  },
  {
    id: "33333333-0000-0000-0000-000000000003",
    title: "Permutations & Combinations",
    slug: "mcq-permutations-letters",
    difficulty: "Medium",
    company_tags: ["Cognizant"],
    type: "mcq",
    description_md: "How many distinct 4-letter words can be formed from the letters of the word 'CAMPUS' without repetition?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["360", "720", "120", "240"],
    correct_option: "360",
    explanation: "The word CAMPUS has 6 distinct letters. The number of 4-letter permutations is P(6, 4) = 6 * 5 * 4 * 3 = 360.",
  },
  {
    id: "33333333-0000-0000-0000-000000000004",
    title: "Probability of Dice Roll",
    slug: "mcq-probability-sum-prime",
    difficulty: "Easy",
    company_tags: ["TCS NQT"],
    type: "mcq",
    description_md: "Two unbiased 6-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is a prime number?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["5/12", "7/18", "15/36", "11/36"],
    correct_option: "5/12",
    explanation: "Possible sums: 2 (1 pair), 3 (2 pairs), 5 (4 pairs), 7 (6 pairs), 11 (2 pairs). Total favorable outcomes = 15. Probability = 15/36 = 5/12.",
  },
  {
    id: "33333333-0000-0000-0000-000000000005",
    title: "Logical Deductions & Syllogisms",
    slug: "mcq-logical-syllogism-1",
    difficulty: "Medium",
    company_tags: ["Infosys"],
    type: "mcq",
    description_md: "Statements: All laptops are devices. Some devices are phones. Conclusion I: Some laptops are phones. Conclusion II: No laptop is a phone. Which conclusion follows?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["Only I follows", "Only II follows", "Either I or II follows", "Neither I nor II follows"],
    correct_option: "Either I or II follows",
    explanation: "This is a complementary pair (Some and No) between the same subjects, so either I or II must hold true.",
  },
  {
    id: "33333333-0000-0000-0000-000000000006",
    title: "Operating Systems Memory Paging",
    slug: "mcq-os-virtual-memory",
    difficulty: "Medium",
    company_tags: ["Zoho"],
    type: "mcq",
    description_md: "If a system uses 32-bit virtual addresses and a 4KB page size, how many entries are there in a single-level page table?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["2^20 (1,048,576)", "2^12 (4,096)", "2^16 (65,536)", "2^24 (16,777,216)"],
    correct_option: "2^20 (1,048,576)",
    explanation: "Page size 4KB = 2^12 bytes (12 offset bits). Page number bits = 32 - 12 = 20 bits. Total entries = 2^20 = 1,048,576.",
  },
  {
    id: "33333333-0000-0000-0000-000000000007",
    title: "Profit & Loss Calculation",
    slug: "mcq-profit-loss-markup",
    difficulty: "Easy",
    company_tags: ["TCS NQT"],
    type: "mcq",
    description_md: "A merchant marks his goods 25% above cost price and allows a discount of 10% on marked price. What is his net profit percentage?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["12.5%", "15.0%", "10.0%", "14.5%"],
    correct_option: "12.5%",
    explanation: "Let CP = 100. MP = 125. SP = 125 - 10% of 125 = 112.5. Profit = 12.5%.",
  },
  {
    id: "33333333-0000-0000-0000-000000000008",
    title: "Speed, Distance & Relative Velocity",
    slug: "mcq-train-platform-speed",
    difficulty: "Medium",
    company_tags: ["Cognizant"],
    type: "mcq",
    description_md: "A train 180 meters long passes a platform 220 meters long in 20 seconds. What is the speed of the train in km/hr?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["72 km/hr", "64 km/hr", "80 km/hr", "90 km/hr"],
    correct_option: "72 km/hr",
    explanation: "Total distance = 180 + 220 = 400 m. Speed = 400 / 20 = 20 m/s. In km/hr = 20 * (18 / 5) = 72 km/hr.",
  },
  {
    id: "33333333-0000-0000-0000-000000000009",
    title: "Graph Theory & Spanning Trees",
    slug: "mcq-minimum-spanning-tree",
    difficulty: "Medium",
    company_tags: ["Zoho", "Infosys"],
    type: "mcq",
    description_md: "A connected undirected graph has 15 vertices and 25 edges. How many edges will be present in its Minimum Spanning Tree (MST)?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["14", "15", "10", "24"],
    correct_option: "14",
    explanation: "A spanning tree of a graph with V vertices always contains exactly V - 1 edges. Here 15 - 1 = 14 edges.",
  },
  {
    id: "33333333-0000-0000-0000-000000000010",
    title: "Coding Decoding Pattern",
    slug: "mcq-coding-pattern-logic",
    difficulty: "Easy",
    company_tags: ["TCS NQT"],
    type: "mcq",
    description_md: "In a certain code, 'CAMPUS' is written as 'EDORWU'. How is 'PYTHON' written in that same code?",
    starter_code_json: { python: "", java: "", c: "", cpp: "" },
    mcq_options_json: ["RAVJQP", "RBNJRQ", "RAVJRO", "RZWJQP"],
    correct_option: "RAVJQP",
    explanation: "Each letter is shifted forward by 2 positions: P(+2)=R, Y(+2)=A, T(+2)=V, H(+2)=J, O(+2)=Q, N(+2)=P -> RAVJQP.",
  },
];

export const SEED_ASSESSMENT: Assessment = {
  id: "22222222-0000-0000-0000-000000000001",
  org_id: SEED_ORGANIZATION.id,
  title: "Campus Placement Screening Mock 2026",
  description: "Mandatory proctored placement assessment featuring Quantitative Aptitude, Logical Reasoning, and Data Structures coding rounds for TCS, Zoho, and Infosys recruitment drives.",
  duration_minutes: 45,
  is_proctored: true,
  starts_at: new Date(Date.now() - 3600000).toISOString(),
  ends_at: new Date(Date.now() + 86400000 * 30).toISOString(),
  problems: [
    SEED_MCQS[0],
    SEED_MCQS[1],
    SEED_MCQS[2],
    SEED_PROBLEMS[0],
    SEED_PROBLEMS[1],
  ],
};

export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: "sub-001",
    assessment_id: SEED_ASSESSMENT.id,
    user_id: SEED_STUDENTS[0].id,
    problem_id: SEED_PROBLEMS[0].id,
    language: "python",
    source_code: SEED_PROBLEMS[0].starter_code_json.python,
    status: "Accepted",
    passed_cases: 5,
    total_cases: 5,
    score: 100,
    execution_time_ms: 124,
    tab_switches: 0,
    submitted_at: new Date(Date.now() - 7200000).toISOString(),
    problem_title: SEED_PROBLEMS[0].title,
  },
  {
    id: "sub-002",
    assessment_id: SEED_ASSESSMENT.id,
    user_id: SEED_STUDENTS[1].id,
    problem_id: SEED_PROBLEMS[0].id,
    language: "python",
    source_code: SEED_PROBLEMS[0].starter_code_json.python,
    status: "Accepted",
    passed_cases: 5,
    total_cases: 5,
    score: 100,
    execution_time_ms: 98,
    tab_switches: 0,
    submitted_at: new Date(Date.now() - 5400000).toISOString(),
    problem_title: SEED_PROBLEMS[0].title,
  },
  {
    id: "sub-003",
    assessment_id: SEED_ASSESSMENT.id,
    user_id: SEED_STUDENTS[8].id, // Hariharan R.
    problem_id: SEED_PROBLEMS[0].id,
    language: "python",
    source_code: "# Incomplete submission\nprint('hello')",
    status: "Wrong Answer",
    passed_cases: 0,
    total_cases: 5,
    score: 0,
    execution_time_ms: 85,
    tab_switches: 3, // Flagged violation
    submitted_at: new Date(Date.now() - 3600000).toISOString(),
    problem_title: SEED_PROBLEMS[0].title,
  },
];
