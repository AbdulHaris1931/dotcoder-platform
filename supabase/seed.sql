-- ==============================================================================
-- DotCoder Open SaaS Starter Seed Data
-- 10 Placement Coding Challenges & 2 Mock Assessments
-- ==============================================================================

-- 1. Insert 10 Core Placement Coding Challenges
INSERT INTO public.problems (id, title, slug, difficulty, company_tags, type, description_md, starter_code_json, is_public)
VALUES
(
    '11111111-0000-0000-0000-000000000001',
    'Two Sum Target Pair',
    'two-sum-target',
    'Easy',
    ARRAY['Zoho', 'TCS NQT'],
    'coding',
    $desc$### Problem Statement
Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers such that they add up to `target`.

You may assume that each input has exactly one solution, and you may not use the same element twice. Return the indices sorted in ascending order separated by a space.

### Input Format
- First line: Space-separated integers representing the array `nums`.
- Second line: Single integer `target`.

### Output Format
- Space-separated indices `i j` where `nums[i] + nums[j] == target`.$desc$,
    $json${
        "python": "import sys\n\ndef solve():\n    lines = [l.strip() for l in sys.stdin.read().strip().split(\"\\n\") if l.strip()]\n    if len(lines) < 2: return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            print(f\"{lookup[diff]} {i}\")\n            return\n        lookup[num] = i\n\nsolve()\n",
        "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        if (!sc.hasNextInt()) return;\n        int target = sc.nextInt();\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                System.out.println(map.get(diff) + \" \" + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    string line; if (!getline(cin, line)) return 0;\n    stringstream ss(line); vector<int> nums; int val;\n    while (ss >> val) nums.push_back(val);\n    int target; if (!(cin >> target)) return 0;\n    unordered_map<int, int> mp;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        int diff = target - nums[i];\n        if (mp.count(diff)) { cout << mp[diff] << \" \" << i << endl; return 0; }\n        mp[nums[i]] = i;\n    }\n    return 0;\n}",
        "c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    char line[10000]; if (!fgets(line, sizeof(line), stdin)) return 0;\n    int nums[5000]; int n = 0; char *tok = strtok(line, \" \\t\\r\\n\");\n    while (tok) { nums[n++] = atoi(tok); tok = strtok(NULL, \" \\t\\r\\n\"); }\n    int target; if (scanf(\"%d\", &target) != 1) return 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) { printf(\"%d %d\\n\", i, j); return 0; }\n        }\n    }\n    return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000002',
    'Longest Unique Substring',
    'longest-substring-without-repeating-characters',
    'Medium',
    ARRAY['Infosys', 'Zoho'],
    'coding',
    $desc$### Problem Statement
Given a string `s`, find the length of the longest substring without repeating characters.$desc$,
    $json${
        "python": "import sys\n\ndef solve():\n    s = sys.stdin.read().rstrip(\"\\r\\n\")\n    char_map = {}\n    left, max_len = 0, 0\n    for right, c in enumerate(s):\n        if c in char_map and char_map[c] >= left:\n            left = char_map[c] + 1\n        char_map[c] = right\n        max_len = max(max_len, right - left + 1)\n    print(max_len)\n\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine().replaceAll(\"[\\\\r\\\\n]\", \"\") : \"\";\n        Map<Character, Integer> map = new HashMap<>();\n        int left = 0, maxLen = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (map.containsKey(c) && map.get(c) >= left) left = map.get(c) + 1;\n            map.put(c, right);\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        System.out.println(maxLen);\n    }\n}",
        "cpp": "#include <iostream>\n#include <string>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string s; if (!getline(cin, s)) { cout << 0 << endl; return 0; }\n    while (!s.empty() && (s.back() == '\\r' || s.back() == '\\n')) s.pop_back();\n    unordered_map<char, int> mp; int left = 0, maxLen = 0;\n    for (int right = 0; right < (int)s.size(); right++) {\n        if (mp.count(s[right]) && mp[s[right]] >= left) left = mp[s[right]] + 1;\n        mp[s[right]] = right;\n        maxLen = max(maxLen, right - left + 1);\n    }\n    cout << maxLen << endl; return 0;\n}",
        "c": "#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[50000]; if (!fgets(s, sizeof(s), stdin)) { printf(\"0\\n\"); return 0; }\n    int n = strlen(s);\n    while (n > 0 && (s[n-1] == '\\n' || s[n-1] == '\\r')) n--;\n    s[n] = '\\0'; int last[256]; for (int i = 0; i < 256; i++) last[i] = -1;\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < n; right++) {\n        unsigned char c = s[right];\n        if (last[c] >= left) left = last[c] + 1;\n        last[c] = right;\n        int cur = right - left + 1; if (cur > maxLen) maxLen = cur;\n    }\n    printf(\"%d\\n\", maxLen); return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000003',
    'Valid Balanced Parentheses',
    'valid-parentheses-depth',
    'Easy',
    ARRAY['Cognizant', 'TCS NQT'],
    'coding',
    $desc$### Problem Statement
Given a string `s` containing brackets, return `true` if every bracket is properly matched and nested, else `false`.$desc$,
    $json${
        "python": "import sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    stack = []\n    pairs = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"}\n    for c in s:\n        if c in pairs.values(): stack.append(c)\n        elif c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                print(\"false\"); return\n    print(\"true\" if not stack else \"false\")\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next().trim() : \"\";\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '{' || c == '[') stack.push(c);\n            else if (c == ')') { if (stack.isEmpty() || stack.pop() != '(') { System.out.println(\"false\"); return; } }\n            else if (c == '}') { if (stack.isEmpty() || stack.pop() != '{') { System.out.println(\"false\"); return; } }\n            else if (c == ']') { if (stack.isEmpty() || stack.pop() != '[') { System.out.println(\"false\"); return; } }\n        }\n        System.out.println(stack.isEmpty() ? \"true\" : \"false\");\n    }\n}",
        "cpp": "#include <iostream>\n#include <stack>\nusing namespace std;\nint main() {\n    string s; if (!(cin >> s)) { cout << \"true\" << endl; return 0; }\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{' || c == '[') st.push(c);\n        else if (c == ')') { if (st.empty() || st.top() != '(') { cout << \"false\" << endl; return 0; } st.pop(); }\n        else if (c == '}') { if (st.empty() || st.top() != '{') { cout << \"false\" << endl; return 0; } st.pop(); }\n        else if (c == ']') { if (st.empty() || st.top() != '[') { cout << \"false\" << endl; return 0; } st.pop(); }\n    }\n    cout << (st.empty() ? \"true\" : \"false\") << endl; return 0;\n}",
        "c": "#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[10000]; if (scanf(\"%s\", s) != 1) { printf(\"true\\n\"); return 0; }\n    char stack[10000]; int top = -1;\n    for (int i = 0; s[i] != '\\0'; i++) {\n        char c = s[i];\n        if (c == '(' || c == '{' || c == '[') stack[++top] = c;\n        else if (c == ')') { if (top < 0 || stack[top--] != '(') { printf(\"false\\n\"); return 0; } }\n        else if (c == '}') { if (top < 0 || stack[top--] != '{') { printf(\"false\\n\"); return 0; } }\n        else if (c == ']') { if (top < 0 || stack[top--] != '[') { printf(\"false\\n\"); return 0; } }\n    }\n    printf(\"%s\\n\", top == -1 ? \"true\" : \"false\"); return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000004',
    'Trapping Rain Water',
    'trapping-rain-water',
    'Hard',
    ARRAY['Zoho', 'Infosys'],
    'coding',
    $desc$### Problem Statement
Given `n` non-negative integers representing an elevation map where each bar has width 1, compute total units of trapped rain water.$desc$,
    $json${
        "python": "import sys\ndef solve():\n    line = sys.stdin.read().strip()\n    if not line: print(0); return\n    h = list(map(int, line.split()))\n    if not h: print(0); return\n    left, right = 0, len(h) - 1\n    max_l, max_r, ans = 0, 0, 0\n    while left < right:\n        if h[left] <= h[right]:\n            if h[left] >= max_l: max_l = h[left]\n            else: ans += max_l - h[left]\n            left += 1\n        else:\n            if h[right] >= max_r: max_r = h[right]\n            else: ans += max_r - h[right]\n            right -= 1\n    print(ans)\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) { System.out.println(0); return; }\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] h = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i]);\n        int left = 0, right = h.length - 1, maxL = 0, maxR = 0, ans = 0;\n        while (left < right) {\n            if (h[left] <= h[right]) {\n                if (h[left] >= maxL) maxL = h[left]; else ans += maxL - h[left];\n                left++;\n            } else {\n                if (h[right] >= maxR) maxR = h[right]; else ans += maxR - h[right];\n                right--;\n            }\n        }\n        System.out.println(ans);\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\nint main() {\n    string line; if (!getline(cin, line)) { cout << 0 << endl; return 0; }\n    stringstream ss(line); vector<int> h; int val;\n    while (ss >> val) h.push_back(val);\n    int left = 0, right = (int)h.size() - 1, maxL = 0, maxR = 0, ans = 0;\n    while (left < right) {\n        if (h[left] <= h[right]) {\n            if (h[left] >= maxL) maxL = h[left]; else ans += maxL - h[left];\n            left++;\n        } else {\n            if (h[right] >= maxR) maxR = h[right]; else ans += maxR - h[right];\n            right--;\n        }\n    }\n    cout << ans << endl; return 0;\n}",
        "c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\nint main() {\n    char line[50000]; if (!fgets(line, sizeof(line), stdin)) { printf(\"0\\n\"); return 0; }\n    int h[10000]; int n = 0; char *tok = strtok(line, \" \\t\\r\\n\");\n    while (tok) { h[n++] = atoi(tok); tok = strtok(NULL, \" \\t\\r\\n\"); }\n    int left = 0, right = n - 1, maxL = 0, maxR = 0, ans = 0;\n    while (left < right) {\n        if (h[left] <= h[right]) {\n            if (h[left] >= maxL) maxL = h[left]; else ans += maxL - h[left];\n            left++;\n        } else {\n            if (h[right] >= maxR) maxR = h[right]; else ans += maxR - h[right];\n            right--;\n        }\n    }\n    printf(\"%d\\n\", ans); return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000005',
    'Subarray with Given Sum',
    'subarray-with-given-sum',
    'Medium',
    ARRAY['TCS NQT', 'Cognizant'],
    'coding',
    $desc$### Problem Statement
Given an unsorted array of non-negative integers `nums` and integer `S`, output the 1-based start and end indices of the continuous subarray adding to `S`.$desc$,
    $json${
        "python": "import sys\ndef solve():\n    lines = [l.strip() for l in sys.stdin.read().strip().split(\"\\n\") if l.strip()]\n    if len(lines) < 2: print(\"-1\"); return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    cur_sum, left = 0, 0\n    for right, val in enumerate(nums):\n        cur_sum += val\n        while cur_sum > target and left <= right: cur_sum -= nums[left]; left += 1\n        if cur_sum == target: print(f\"{left + 1} {right + 1}\"); return\n    print(\"-1\")\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) { System.out.println(\"-1\"); return; }\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        if (!sc.hasNextInt()) { System.out.println(\"-1\"); return; }\n        int target = sc.nextInt();\n        int curSum = 0, left = 0;\n        for (int right = 0; right < nums.length; right++) {\n            curSum += nums[right];\n            while (curSum > target && left <= right) curSum -= nums[left++];\n            if (curSum == target) { System.out.println((left + 1) + \" \" + (right + 1)); return; }\n        }\n        System.out.println(\"-1\");\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\nint main() {\n    string line; if (!getline(cin, line)) { cout << -1 << endl; return 0; }\n    stringstream ss(line); vector<int> nums; int val;\n    while (ss >> val) nums.push_back(val);\n    int target; if (!(cin >> target)) { cout << -1 << endl; return 0; }\n    int curSum = 0, left = 0;\n    for (int right = 0; right < (int)nums.size(); right++) {\n        curSum += nums[right];\n        while (curSum > target && left <= right) curSum -= nums[left++];\n        if (curSum == target) { cout << (left + 1) << \" \" << (right + 1) << endl; return 0; }\n    }\n    cout << -1 << endl; return 0;\n}",
        "c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\nint main() {\n    char line[50000]; if (!fgets(line, sizeof(line), stdin)) { printf(\"-1\\n\"); return 0; }\n    int nums[10000]; int n = 0; char *tok = strtok(line, \" \\t\\r\\n\");\n    while (tok) { nums[n++] = atoi(tok); tok = strtok(NULL, \" \\t\\r\\n\"); }\n    int target; if (scanf(\"%d\", &target) != 1) { printf(\"-1\\n\"); return 0; }\n    int cur = 0, left = 0;\n    for (int right = 0; right < n; right++) {\n        cur += nums[right];\n        while (cur > target && left <= right) cur -= nums[left++];\n        if (cur == target) { printf(\"%d %d\\n\", left + 1, right + 1); return 0; }\n    }\n    printf(\"-1\\n\"); return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000006',
    'Minimum Coin Change',
    'coin-change-minimum',
    'Medium',
    ARRAY['Infosys', 'Zoho'],
    'coding',
    $desc$### Problem Statement
Given denominations `coins` and total `amount`, return the fewest number of coins needed, or `-1` if impossible.$desc$,
    $json${
        "python": "import sys\ndef solve():\n    lines = [l.strip() for l in sys.stdin.read().strip().split(\"\\n\") if l.strip()]\n    if len(lines) < 2: print(0); return\n    coins = list(map(int, lines[0].split()))\n    amount = int(lines[1])\n    dp = [float(\"inf\")] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for x in range(coin, amount + 1): dp[x] = min(dp[x], dp[x - coin] + 1)\n    print(dp[amount] if dp[amount] != float(\"inf\") else -1)\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] coins = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) coins[i] = Integer.parseInt(parts[i]);\n        if (!sc.hasNextInt()) return;\n        int amount = sc.nextInt();\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int coin : coins) for (int x = coin; x <= amount; x++) dp[x] = Math.min(dp[x], dp[x - coin] + 1);\n        System.out.println(dp[amount] > amount ? -1 : dp[amount]);\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string line; if (!getline(cin, line)) return 0;\n    stringstream ss(line); vector<int> coins; int c;\n    while (ss >> c) coins.push_back(c);\n    int amount; if (!(cin >> amount)) return 0;\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int coin : coins) for (int x = coin; x <= amount; x++) dp[x] = min(dp[x], dp[x - coin] + 1);\n    cout << (dp[amount] > amount ? -1 : dp[amount]) << endl; return 0;\n}",
        "c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\nint main() {\n    char line[50000]; if (!fgets(line, sizeof(line), stdin)) return 0;\n    int coins[100]; int n = 0; char *tok = strtok(line, \" \\t\\r\\n\");\n    while (tok) { coins[n++] = atoi(tok); tok = strtok(NULL, \" \\t\\r\\n\"); }\n    int amount; if (scanf(\"%d\", &amount) != 1) return 0;\n    int *dp = (int*)malloc((amount + 1) * sizeof(int));\n    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;\n    dp[0] = 0;\n    for (int i = 0; i < n; i++) {\n        int coin = coins[i];\n        for (int x = coin; x <= amount; x++) if (dp[x - coin] + 1 < dp[x]) dp[x] = dp[x - coin] + 1;\n    }\n    printf(\"%d\\n\", dp[amount] > amount ? -1 : dp[amount]); free(dp); return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000007',
    'Merge Overlapping Intervals',
    'merge-sorted-intervals',
    'Medium',
    ARRAY['Cognizant', 'Zoho'],
    'coding',
    $desc$### Problem Statement
Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals.$desc$,
    $json${
        "python": "import sys\ndef solve():\n    lines = [l.strip() for l in sys.stdin.read().strip().split(\"\\n\") if l.strip()]\n    if not lines: return\n    n = int(lines[0])\n    intervals = [list(map(int, lines[i].split())) for i in range(1, n + 1) if i < len(lines)]\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for cur in intervals:\n        if not merged or merged[-1][1] < cur[0]: merged.append(cur)\n        else: merged[-1][1] = max(merged[-1][1], cur[1])\n    for s, e in merged: print(f\"{s} {e}\")\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[][] intervals = new int[n][2];\n        for (int i = 0; i < n; i++) { intervals[i][0] = sc.nextInt(); intervals[i][1] = sc.nextInt(); }\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> merged = new ArrayList<>();\n        for (int[] cur : intervals) {\n            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < cur[0]) merged.add(cur);\n            else merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], cur[1]);\n        }\n        for (int[] inter : merged) System.out.println(inter[0] + \" \" + inter[1]);\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    vector<pair<int, int>> intervals(n);\n    for (int i = 0; i < n; i++) cin >> intervals[i].first >> intervals[i].second;\n    sort(intervals.begin(), intervals.end());\n    vector<pair<int, int>> merged;\n    for (auto &cur : intervals) {\n        if (merged.empty() || merged.back().second < cur.first) merged.push_back(cur);\n        else merged.back().second = max(merged.back().second, cur.second);\n    }\n    for (auto &p : merged) cout << p.first << \" \" << p.second << endl; return 0;\n}",
        "c": "#include <stdio.h>\n#include <stdlib.h>\ntypedef struct { int start; int end; } Interval;\nint cmp(const void *a, const void *b) { return ((Interval*)a)->start - ((Interval*)b)->start; }\nint main() {\n    int n; if (scanf(\"%d\", &n) != 1) return 0;\n    Interval *arr = (Interval*)malloc(n * sizeof(Interval));\n    for (int i = 0; i < n; i++) scanf(\"%d %d\", &arr[i].start, &arr[i].end);\n    qsort(arr, n, sizeof(Interval), cmp);\n    Interval *merged = (Interval*)malloc(n * sizeof(Interval)); int m = 0;\n    for (int i = 0; i < n; i++) {\n        if (m == 0 || merged[m - 1].end < arr[i].start) merged[m++] = arr[i];\n        else if (arr[i].end > merged[m - 1].end) merged[m - 1].end = arr[i].end;\n    }\n    for (int i = 0; i < m; i++) printf(\"%d %d\\n\", merged[i].start, merged[i].end);\n    free(arr); free(merged); return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000008',
    'Find Peak Element in Array',
    'binary-tree-maximum-path-sum',
    'Easy',
    ARRAY['TCS NQT', 'Infosys'],
    'coding',
    $desc$### Problem Statement
A peak element is an element strictly greater than its neighbors. Return the index of any peak element.$desc$,
    $json${
        "python": "import sys\ndef solve():\n    line = sys.stdin.read().strip()\n    if not line: return\n    nums = list(map(int, line.split()))\n    left, right = 0, len(nums) - 1\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] > nums[mid + 1]: right = mid\n        else: left = mid + 1\n    print(left)\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int left = 0, right = nums.length - 1;\n        while (left < right) {\n            int mid = (left + right) / 2;\n            if (nums[mid] > nums[mid + 1]) right = mid; else left = mid + 1;\n        }\n        System.out.println(left);\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\nint main() {\n    string line; if (!getline(cin, line)) return 0;\n    stringstream ss(line); vector<int> nums; int val;\n    while (ss >> val) nums.push_back(val);\n    int left = 0, right = (int)nums.size() - 1;\n    while (left < right) {\n        int mid = (left + right) / 2;\n        if (nums[mid] > nums[mid + 1]) right = mid; else left = mid + 1;\n    }\n    cout << left << endl; return 0;\n}",
        "c": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\nint main() {\n    char line[50000]; if (!fgets(line, sizeof(line), stdin)) return 0;\n    int nums[10000]; int n = 0; char *tok = strtok(line, \" \\t\\r\\n\");\n    while (tok) { nums[n++] = atoi(tok); tok = strtok(NULL, \" \\t\\r\\n\"); }\n    int left = 0, right = n - 1;\n    while (left < right) {\n        int mid = (left + right) / 2;\n        if (nums[mid] > nums[mid + 1]) right = mid; else left = mid + 1;\n    }\n    printf(\"%d\\n\", left); return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000009',
    'Reverse Linked List Values',
    'reverse-linked-list',
    'Easy',
    ARRAY['Zoho', 'Cognizant'],
    'coding',
    $desc$### Problem Statement
Given space-separated integers representing nodes in a linked list, reverse the list and print node values.$desc$,
    $json${
        "python": "import sys\ndef solve():\n    nums = sys.stdin.read().split()\n    print(\" \".join(nums[::-1]))\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<String> list = new ArrayList<>();\n        while (sc.hasNext()) list.add(sc.next());\n        Collections.reverse(list);\n        System.out.println(String.join(\" \", list));\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\nint main() {\n    vector<string> v; string s;\n    while (cin >> s) v.push_back(s);\n    for (int i = (int)v.size() - 1; i >= 0; i--) cout << v[i] << (i ? \" \" : \"\\n\");\n    return 0;\n}",
        "c": "#include <stdio.h>\n#include <string.h>\nint main() {\n    char words[1000][100]; int n = 0;\n    while (scanf(\"%s\", words[n]) == 1) n++;\n    for (int i = n - 1; i >= 0; i--) printf(\"%s%s\", words[i], i ? \" \" : \"\\n\");\n    return 0;\n}"
    }$json$::jsonb,
    true
),
(
    '11111111-0000-0000-0000-000000000010',
    'Next Greater Element',
    'next-greater-element',
    'Medium',
    ARRAY['TCS NQT', 'Infosys'],
    'coding',
    $desc$### Problem Statement
Given an array `arr[]`, print the Next Greater Element (NGE) for each element in space-separated order. If none exists, print `-1`.$desc$,
    $json${
        "python": "import sys\ndef solve():\n    nums = list(map(int, sys.stdin.read().split()))\n    if not nums: return\n    n = len(nums)\n    res = [-1] * n\n    st = []\n    for i in range(n - 1, -1, -1):\n        while st and st[-1] <= nums[i]: st.pop()\n        if st: res[i] = st[-1]\n        st.append(nums[i])\n    print(\" \".join(map(str, res)))\nsolve()\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (sc.hasNextInt()) list.add(sc.nextInt());\n        int n = list.size(); int[] res = new int[n];\n        Stack<Integer> st = new Stack<>();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!st.isEmpty() && st.peek() <= list.get(i)) st.pop();\n            res[i] = st.isEmpty() ? -1 : st.peek();\n            st.push(list.get(i));\n        }\n        for (int i = 0; i < n; i++) System.out.print(res[i] + (i < n - 1 ? \" \" : \"\\n\"));\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <stack>\nusing namespace std;\nint main() {\n    vector<int> a; int val; while (cin >> val) a.push_back(val);\n    int n = a.size(); vector<int> res(n, -1); stack<int> st;\n    for (int i = n - 1; i >= 0; i--) {\n        while (!st.empty() && st.top() <= a[i]) st.pop();\n        if (!st.empty()) res[i] = st.top();\n        st.push(a[i]);\n    }\n    for (int i = 0; i < n; i++) cout << res[i] << (i < n - 1 ? \" \" : \"\\n\"); return 0;\n}",
        "c": "#include <stdio.h>\nint main() {\n    int a[10000]; int n = 0;\n    while (scanf(\"%d\", &a[n]) == 1) n++;\n    int res[10000]; int st[10000]; int top = -1;\n    for (int i = n - 1; i >= 0; i--) {\n        while (top >= 0 && st[top] <= a[i]) top--;\n        res[i] = (top >= 0) ? st[top] : -1;\n        st[++top] = a[i];\n    }\n    for (int i = 0; i < n; i++) printf(\"%d%s\", res[i], (i < n - 1 ? \" \" : \"\\n\")); return 0;\n}"
    }$json$::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Visible & Hidden Test Cases
INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
VALUES
    -- Two Sum
    ('11111111-0000-0000-0000-000000000001', E'2 7 11 15\n9', '0 1', false),
    ('11111111-0000-0000-0000-000000000001', E'3 2 4\n6', '1 2', false),
    ('11111111-0000-0000-0000-000000000001', E'3 3\n6', '0 1', true),
    ('11111111-0000-0000-0000-000000000001', E'1 5 8 12 14\n20', '2 3', true),

    -- Longest Unique Substring
    ('11111111-0000-0000-0000-000000000002', 'abcabcbb', '3', false),
    ('11111111-0000-0000-0000-000000000002', 'bbbbb', '1', false),
    ('11111111-0000-0000-0000-000000000002', 'pwwkew', '3', true),

    -- Valid Parentheses
    ('11111111-0000-0000-0000-000000000003', '()[]{}', 'true', false),
    ('11111111-0000-0000-0000-000000000003', '(]', 'false', false),
    ('11111111-0000-0000-0000-000000000003', '([{}])', 'true', true),

    -- Trapping Rain Water
    ('11111111-0000-0000-0000-000000000004', '0 1 0 2 1 0 1 3 2 1 2 1', '6', false),
    ('11111111-0000-0000-0000-000000000004', '4 2 0 3 2 5', '9', false),
    ('11111111-0000-0000-0000-000000000004', '3 0 2 0 4', '7', true),

    -- Reverse Linked List
    ('11111111-0000-0000-0000-000000000009', '1 2 3 4 5', '5 4 3 2 1', false),
    ('11111111-0000-0000-0000-000000000009', '10 20', '20 10', false),
    ('11111111-0000-0000-0000-000000000009', '42', '42', true),

    -- Next Greater Element
    ('11111111-0000-0000-0000-000000000010', '4 5 2 25', '5 25 25 -1', false),
    ('11111111-0000-0000-0000-000000000010', '13 7 6 12', '-1 12 12 -1', false),
    ('11111111-0000-0000-0000-000000000010', '1 2 3 4', '2 3 4 -1', true);

-- 3. Insert 2 Active Placement Mock Assessments
INSERT INTO public.assessments (id, title, description, target_college, duration_minutes, is_proctored, is_active)
VALUES
(
    '22222222-0000-0000-0000-000000000001',
    'TCS NQT Campus National Mock 2026',
    'Mandatory nationwide screening assessment featuring Quantitative Aptitude, Logical Reasoning, and Data Structures coding rounds.',
    'ALL',
    45,
    true,
    true
),
(
    '22222222-0000-0000-0000-000000000002',
    'Zoho Day-1 Technical Screening Mock',
    'Comprehensive technical coding and problem solving assessment modeled after Zoho Corporation campus recruitment rounds.',
    'ALL',
    60,
    true,
    true
)
ON CONFLICT (id) DO NOTHING;
