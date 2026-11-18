-- ==============================================================================
-- DotCoder Progressive Curriculum & Assessment Schema
-- Lesson 1-10 Hierarchy: Lessons -> Modules -> Topics -> Practice/Assessment Problems
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Curriculum Lessons Table (10 total: 1-7 shared_core, 8-10 branch_specific)
CREATE TABLE IF NOT EXISTS public.curriculum_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_number INT NOT NULL UNIQUE CHECK (lesson_number BETWEEN 1 AND 10),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    track_type TEXT NOT NULL CHECK (track_type IN ('shared_core', 'branch_specific')),
    branch_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Curriculum Modules Table (2 per Lesson = 20 total)
CREATE TABLE IF NOT EXISTS public.curriculum_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
    module_number INT NOT NULL CHECK (module_number IN (1, 2)),
    title TEXT NOT NULL,
    unlock_threshold INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_lesson_module UNIQUE (lesson_id, module_number)
);

-- 4. Curriculum Topics Table (5 per Module = 100 total)
CREATE TABLE IF NOT EXISTS public.curriculum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.curriculum_modules(id) ON DELETE CASCADE,
    topic_order INT NOT NULL CHECK (topic_order BETWEEN 1 AND 5),
    title TEXT NOT NULL,
    concept_markdown TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_module_topic UNIQUE (module_id, topic_order)
);

-- 5. Curriculum Problems Table (Practice: 1-5 per topic, Assessment: 1 per topic)
CREATE TABLE IF NOT EXISTS public.curriculum_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
    problem_type TEXT NOT NULL CHECK (problem_type IN ('practice', 'assessment')),
    order_index INT NOT NULL CHECK (order_index BETWEEN 1 AND 5),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    description_markdown TEXT NOT NULL,
    constraints_text TEXT NOT NULL,
    boilerplate_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    hints JSONB NOT NULL DEFAULT '[]'::jsonb,
    company_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. Curriculum Test Cases Table (6 per Problem: TC 1-2 public, TC 3-6 hidden)
CREATE TABLE IF NOT EXISTS public.curriculum_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.curriculum_problems(id) ON DELETE CASCADE,
    case_number INT NOT NULL CHECK (case_number BETWEEN 1 AND 6),
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    failure_category TEXT NOT NULL CHECK (failure_category IN (
        'Sample Case',
        'Boundary/Edge Case',
        'Logical Trap/Duplicates',
        'Max Constraint TLE',
        'Memory/Integer Overflow'
    )),
    CONSTRAINT unique_problem_case UNIQUE (problem_id, case_number)
);

-- 7. Curriculum Module Assessments Table (1 per Module = 20 total)
CREATE TABLE IF NOT EXISTS public.curriculum_module_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL UNIQUE REFERENCES public.curriculum_modules(id) ON DELETE CASCADE,
    duration_minutes INT NOT NULL DEFAULT 90,
    passing_score INT NOT NULL DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. Curriculum Assessment MCQs Table (10 per Assessment — 2 per topic)
CREATE TABLE IF NOT EXISTS public.curriculum_assessment_mcqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.curriculum_module_assessments(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.curriculum_topics(id) ON DELETE CASCADE,
    order_index INT NOT NULL CHECK (order_index BETWEEN 1 AND 10),
    question_markdown TEXT NOT NULL,
    code_snippet TEXT,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
    question_category TEXT NOT NULL CHECK (question_category IN (
        'Output Prediction',
        'Bug Spotting',
        'Complexity',
        'Architecture'
    )),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 9. Curriculum Submissions & User Progress Tables
CREATE TABLE IF NOT EXISTS public.curriculum_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    problem_id UUID NOT NULL REFERENCES public.curriculum_problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error')),
    passed_test_cases INT NOT NULL DEFAULT 0,
    total_test_cases INT NOT NULL DEFAULT 6,
    runtime_ms INT NOT NULL DEFAULT 0,
    memory_kb INT NOT NULL DEFAULT 0,
    submitted_code TEXT NOT NULL,
    language TEXT NOT NULL,
    test_results JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.curriculum_assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    module_id UUID NOT NULL REFERENCES public.curriculum_modules(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.curriculum_module_assessments(id) ON DELETE CASCADE,
    total_score NUMERIC(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    mcq_score NUMERIC(5, 2) NOT NULL,
    coding_score NUMERIC(5, 2) NOT NULL,
    topic_mastery JSONB NOT NULL DEFAULT '{}'::jsonb,
    mcq_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_module_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_assessment_mcqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_assessment_attempts ENABLE ROW LEVEL SECURITY;

-- Read policies for curriculum
CREATE POLICY "Anyone can view curriculum lessons" ON public.curriculum_lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can view curriculum modules" ON public.curriculum_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view curriculum topics" ON public.curriculum_topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view curriculum problems" ON public.curriculum_problems FOR SELECT USING (true);
CREATE POLICY "Anyone can view public test cases" ON public.curriculum_test_cases FOR SELECT USING (is_hidden = false);
CREATE POLICY "Anyone can view module assessments" ON public.curriculum_module_assessments FOR SELECT USING (true);
CREATE POLICY "Anyone can view assessment mcqs" ON public.curriculum_assessment_mcqs FOR SELECT USING (true);

-- User progress policies
CREATE POLICY "Users can view own curriculum submissions" ON public.curriculum_submissions FOR SELECT USING (auth.uid() = user_id OR user_id IS NOT NULL);
CREATE POLICY "Users can insert own curriculum submissions" ON public.curriculum_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own assessment attempts" ON public.curriculum_assessment_attempts FOR SELECT USING (auth.uid() = user_id OR user_id IS NOT NULL);
CREATE POLICY "Users can insert own assessment attempts" ON public.curriculum_assessment_attempts FOR INSERT WITH CHECK (true);
