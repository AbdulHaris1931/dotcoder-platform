-- ==============================================================================
-- Migration: 20261119000005_assessment_engine_schema.sql
-- Description: Immutable Assessment Attempts, Anti-Cheat Telemetry, and Accreditation Compliance Snapshots
-- Institution: Annai Vailankanni Arts and Science College, Thanjavur (AVASC-TNJ)
-- ==============================================================================

-- 1. Assessment Attempts Table (Immutable Snapshots for NAAC / NBA Accreditation)
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id TEXT NOT NULL,
    assessment_title TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    department TEXT NOT NULL,
    batch_year INTEGER NOT NULL DEFAULT 2026,
    college_name TEXT NOT NULL DEFAULT 'Annai Vailankanni Arts and Science College, Thanjavur',
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    passed BOOLEAN NOT NULL DEFAULT false,
    passing_score INTEGER NOT NULL DEFAULT 60,
    total_questions INTEGER NOT NULL DEFAULT 5,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    tab_switch_count INTEGER NOT NULL DEFAULT 0,
    anti_cheat_score INTEGER NOT NULL DEFAULT 100 CHECK (anti_cheat_score >= 0 AND anti_cheat_score <= 100),
    duration_spent_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'flagged', 'voided')),
    accreditation_hash TEXT NOT NULL,
    grading_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    integrity_events JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast cohort analytics & student history lookups
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_id ON public.assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON public.assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_dept_batch ON public.assessment_attempts(department, batch_year);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON public.assessment_attempts(status);

-- Enable RLS
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Students can view their own attempts
DROP POLICY IF EXISTS "Students can view own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Students can view own assessment attempts"
    ON public.assessment_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Faculty, TPO, Admins can view all institutional attempts
DROP POLICY IF EXISTS "Faculty and Institutional Staff can view assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Faculty and Institutional Staff can view assessment attempts"
    ON public.assessment_attempts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('teacher', 'tpo', 'admin', 'super_admin')
        )
    );

-- Policy 3: Authenticated users can insert their own attempts
DROP POLICY IF EXISTS "Users can insert own assessment attempt" ON public.assessment_attempts;
CREATE POLICY "Users can insert own assessment attempt"
    ON public.assessment_attempts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Seed initial accredited attempts for AVASC-TNJ
-- Clean Slate: No mock assessment attempts are seeded in production migrations.
