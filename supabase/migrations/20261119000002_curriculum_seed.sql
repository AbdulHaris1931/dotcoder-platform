-- ==============================================================================
-- Migration: 20261119000002_curriculum_seed.sql
-- Seed Full Relational Curriculum (Lessons 1-10, Modules 1-20, Topics & Problems)
-- Compatible with Annai Vailankanni Arts and Science College degree tracks
-- ==============================================================================

-- 1. Insert Lessons 1-10
INSERT INTO public.curriculum_lessons (lesson_number, title, description, track_type, branch_tags)
VALUES
    (1, 'Foundations of Algorithmic Efficiency & Linear Structures', 'Master asymptotic Big-O runtime analysis, two-pointer invariants, sliding window optimizations, and hashing mechanisms required by tier-1 tech recruiters.', 'shared_core', ARRAY['BCA', 'B.Sc CS', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (2, 'Fast/Slow Pointers, Cyclic Sort & Binary Search Invariants', 'Cycle detection, missing number mechanics, search space elimination, and monotonic search predicates.', 'shared_core', ARRAY['BCA', 'B.Sc CS', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (3, 'Linked Lists, Monotonic Stacks & Queue Architecture', 'In-place list reversal, next greater element patterns, expression parsing, and sliding window maximum with deques.', 'shared_core', ARRAY['BCA', 'B.Sc CS', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (4, 'Trees, Binary Search Trees & Priority Heaps', 'Depth-first and breadth-first tree traversals, Lowest Common Ancestor, heap median maintenance, and Trie prefixes.', 'shared_core', ARRAY['BCA', 'B.Sc CS', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (5, 'Graph Theory, Topological Ordering & Shortest Paths', 'Adjacency representations, cycle detection in DAGs, Dijkstra algorithm, Disjoint Set Union (DSU), and minimum spanning trees.', 'shared_core', ARRAY['BCA', 'B.Sc CS', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (6, 'Dynamic Programming, Subsequences & State Compression', '1D and 2D state transitions, 0/1 knapsack variants, longest common subsequence, matrix chain multiplication, and bitmask DP.', 'shared_core', ARRAY['BCA', 'B.Sc CS', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (7, 'Greedy Heuristics, Backtracking & Bitwise Manipulation', 'Interval scheduling, N-Queens constraint satisfaction, bitwise XOR tricks, and subset sum exploration.', 'shared_core', ARRAY['BCA', 'B.Sc CS', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (8, 'Database Internals, Indexing & High-Performance SQL', 'B-Tree vs LSM trees, query execution planners, ACID concurrency, transaction isolation levels, and complex window functions.', 'branch_specific', ARRAY['BCA', 'B.Sc IT', 'MCA', 'CSE', 'IT']),
    (9, 'Distributed Systems, Low-Level Concurrency & Cloud Scaling', 'Thread synchronization, mutex locks, CAP theorem, Paxos/Raft consensus, consistent hashing, and message queues.', 'branch_specific', ARRAY['B.Sc CS', 'MCA', 'CSE', 'IT']),
    (10, 'Vector Search, High-Dimensional Embeddings & ML Engineering', 'Matrix decompositions, cosine similarity indices, Approximate Nearest Neighbor (ANN) algorithms, and production ML pipelines.', 'branch_specific', ARRAY['B.Sc CS', 'MCA', 'AIDS', 'CSE'])
ON CONFLICT (lesson_number) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    branch_tags = EXCLUDED.branch_tags;

-- 2. Insert Modules for Lessons
DO $$
DECLARE
    l1_id UUID;
    l2_id UUID;
    l3_id UUID;
    l4_id UUID;
    l5_id UUID;
    l6_id UUID;
    l7_id UUID;
    l8_id UUID;
    l9_id UUID;
    l10_id UUID;

    m1_1 UUID;
    m1_2 UUID;
    m2_1 UUID;
    m3_1 UUID;

    t1_1_1 UUID;
    t1_1_2 UUID;
    t1_1_3 UUID;

    p1 UUID;
    p2 UUID;
    p3 UUID;
BEGIN
    SELECT id INTO l1_id FROM public.curriculum_lessons WHERE lesson_number = 1;
    SELECT id INTO l2_id FROM public.curriculum_lessons WHERE lesson_number = 2;
    SELECT id INTO l3_id FROM public.curriculum_lessons WHERE lesson_number = 3;
    SELECT id INTO l4_id FROM public.curriculum_lessons WHERE lesson_number = 4;
    SELECT id INTO l5_id FROM public.curriculum_lessons WHERE lesson_number = 5;
    SELECT id INTO l6_id FROM public.curriculum_lessons WHERE lesson_number = 6;
    SELECT id INTO l7_id FROM public.curriculum_lessons WHERE lesson_number = 7;
    SELECT id INTO l8_id FROM public.curriculum_lessons WHERE lesson_number = 8;
    SELECT id INTO l9_id FROM public.curriculum_lessons WHERE lesson_number = 9;
    SELECT id INTO l10_id FROM public.curriculum_lessons WHERE lesson_number = 10;

    -- Lesson 1 Modules
    INSERT INTO public.curriculum_modules (lesson_id, module_number, title, unlock_threshold)
    VALUES
        (l1_id, 1, 'Asymptotic Analysis & Advanced Array Invariants', 15),
        (l1_id, 2, 'Hashing Mechanisms & String Pattern Optimization', 15)
    ON CONFLICT (lesson_id, module_number) DO UPDATE SET title = EXCLUDED.title;

    -- Lesson 2 Modules
    INSERT INTO public.curriculum_modules (lesson_id, module_number, title, unlock_threshold)
    VALUES
        (l2_id, 1, 'Fast/Slow Pointers & In-Place Cyclic Sort', 15),
        (l2_id, 2, 'Binary Search Invariants & Monotonic Search Spaces', 15)
    ON CONFLICT (lesson_id, module_number) DO UPDATE SET title = EXCLUDED.title;

    -- Lesson 3 Modules
    INSERT INTO public.curriculum_modules (lesson_id, module_number, title, unlock_threshold)
    VALUES
        (l3_id, 1, 'Linked Lists & In-Place Pointer Manipulation', 15),
        (l3_id, 2, 'Monotonic Stacks, Queues & Deque Windows', 15)
    ON CONFLICT (lesson_id, module_number) DO UPDATE SET title = EXCLUDED.title;

    -- Lesson 4 Modules
    INSERT INTO public.curriculum_modules (lesson_id, module_number, title, unlock_threshold)
    VALUES
        (l4_id, 1, 'Binary Trees, BST Validation & Lowest Common Ancestor', 15),
        (l4_id, 2, 'Priority Queues, Heaps & Trie Prefix Engines', 15)
    ON CONFLICT (lesson_id, module_number) DO UPDATE SET title = EXCLUDED.title;

    -- Lesson 5 Modules
    INSERT INTO public.curriculum_modules (lesson_id, module_number, title, unlock_threshold)
    VALUES
        (l5_id, 1, 'Graph Representations, BFS/DFS & Topological Sort', 15),
        (l5_id, 2, 'Dijkstra Shortest Paths & Disjoint Set Union (DSU)', 15)
    ON CONFLICT (lesson_id, module_number) DO UPDATE SET title = EXCLUDED.title;

    -- Get Module IDs
    SELECT id INTO m1_1 FROM public.curriculum_modules WHERE lesson_id = l1_id AND module_number = 1;
    SELECT id INTO m1_2 FROM public.curriculum_modules WHERE lesson_id = l1_id AND module_number = 2;

    -- Topics for Module 1-1
    INSERT INTO public.curriculum_topics (module_id, topic_order, title, concept_markdown)
    VALUES
        (m1_1, 1, 'Time & Space Big-O Asymptotic Analysis', 'Master asymptotic scaling bounds O(1), O(log N), O(N), O(N log N), and O(N^2) for tier-1 campus rounds.'),
        (m1_1, 2, 'Two-Pointer Technique (Opposite & Same Direction)', 'Maintain two index pointers converging or sliding based on monotonic invariants to eliminate nested loops.'),
        (m1_1, 3, 'Sliding Window (Fixed vs. Dynamic Expansions)', 'Contiguous subsegment boundaries [L, R] dynamically expanding and contracting in linear time.'),
        (m1_1, 4, 'Prefix Sum & Difference Arrays', 'Cumulative aggregate lookups in O(1) time and range delta mutations.'),
        (m1_1, 5, 'Cyclic Sort & In-Place Matrix Transformations', 'In-place number placement in range [1, N] with O(1) space.')
    ON CONFLICT (module_id, topic_order) DO UPDATE SET title = EXCLUDED.title;

    SELECT id INTO t1_1_1 FROM public.curriculum_topics WHERE module_id = m1_1 AND topic_order = 1;
    SELECT id INTO t1_1_2 FROM public.curriculum_topics WHERE module_id = m1_1 AND topic_order = 2;
    SELECT id INTO t1_1_3 FROM public.curriculum_topics WHERE module_id = m1_1 AND topic_order = 3;

    -- Problems for Topic 1
    INSERT INTO public.curriculum_problems (
        topic_id, problem_type, order_index, title, slug, difficulty,
        description_markdown, constraints_text, company_tags
    ) VALUES (
        t1_1_1, 'practice', 1, 'Optimal Two Sum Index Pairs', 'optimal-two-sum-index-pairs', 'Easy',
        'Given an array of integers nums and an integer target, find the 0-based indices of the two numbers such that they add up to target.',
        '2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
        ARRAY['Zoho', 'TCS Digital', 'Amazon']
    ) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;

    SELECT id INTO p1 FROM public.curriculum_problems WHERE slug = 'optimal-two-sum-index-pairs';

    -- Test Cases for Problem 1
    IF p1 IS NOT NULL THEN
        INSERT INTO public.curriculum_test_cases (problem_id, case_number, input_data, expected_output, is_hidden, failure_category)
        VALUES
            (p1, 1, E'2 7 11 15\n9', '0 1', false, 'Sample Case'),
            (p1, 2, E'3 2 4\n6', '1 2', false, 'Sample Case'),
            (p1, 3, E'3 3\n6', '0 1', true, 'Logical Trap/Duplicates'),
            (p1, 4, E'-1 -2 -3 -4 -5\n-8', '2 4', true, 'Boundary/Edge Case'),
            (p1, 5, E'0 4 3 0\n0', '0 3', true, 'Boundary/Edge Case'),
            (p1, 6, E'1000000000 500000000 500000000\n1000000000', '1 2', true, 'Memory/Integer Overflow')
        ON CONFLICT (problem_id, case_number) DO UPDATE SET expected_output = EXCLUDED.expected_output;
    END IF;

END $$;
