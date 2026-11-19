-- ==============================================================================
-- Migration: 20261119000003_skill_intelligence_schema.sql
-- DotCoder Skill Intelligence Engine: 6-Dimensional Index & Adaptive Learning
-- ==============================================================================

-- 1. Student Skill Profiles Table
CREATE TABLE IF NOT EXISTS public.student_skill_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    accuracy_score NUMERIC(5, 2) NOT NULL DEFAULT 85,
    psi_score NUMERIC(5, 2) NOT NULL DEFAULT 80,
    dsa_mastery_score NUMERIC(5, 2) NOT NULL DEFAULT 75,
    efficiency_score NUMERIC(5, 2) NOT NULL DEFAULT 82,
    consistency_score NUMERIC(5, 2) NOT NULL DEFAULT 80,
    placement_readiness_score NUMERIC(5, 2) NOT NULL DEFAULT 80,
    dsa_topic_mastery JSONB NOT NULL DEFAULT '[]'::jsonb,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Skill History Snapshots Table (Telemetry & Accreditation Analytics)
CREATE TABLE IF NOT EXISTS public.skill_history_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    placement_readiness_score NUMERIC(5, 2) NOT NULL,
    accuracy_score NUMERIC(5, 2) NOT NULL,
    psi_score NUMERIC(5, 2) NOT NULL,
    dsa_mastery_score NUMERIC(5, 2) NOT NULL,
    efficiency_score NUMERIC(5, 2) NOT NULL,
    consistency_score NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Adaptive Recommendations Table
CREATE TABLE IF NOT EXISTS public.adaptive_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    recommended_problem_slug TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.student_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_history_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_recommendations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users and staff can view skill profiles" ON public.student_skill_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own skill profile" ON public.student_skill_profiles
    FOR ALL USING (auth.uid() = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users and staff can view skill snapshots" ON public.skill_history_snapshots
    FOR SELECT USING (true);

CREATE POLICY "Users can insert skill snapshots" ON public.skill_history_snapshots
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users and staff can view adaptive recommendations" ON public.adaptive_recommendations
    FOR SELECT USING (true);

CREATE POLICY "Users can update own adaptive recommendations" ON public.adaptive_recommendations
    FOR ALL USING (auth.uid() = user_id OR user_id IS NOT NULL);
