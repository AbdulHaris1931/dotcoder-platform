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
INSERT INTO public.assessment_attempts (
    id,
    assessment_id,
    assessment_title,
    user_id,
    student_name,
    roll_no,
    department,
    batch_year,
    college_name,
    score,
    passed,
    passing_score,
    total_questions,
    correct_answers,
    tab_switch_count,
    anti_cheat_score,
    duration_spent_seconds,
    status,
    accreditation_hash,
    grading_details,
    integrity_events,
    submitted_at
) VALUES (
    'aa111111-0000-0000-0000-000000000001',
    'assessment-1',
    'Mid-Term Technical Aptitude & Coding Milestone',
    '00000000-0000-0000-0000-000000000001',
    'Karthik S.',
    '23BCA01',
    'BCA',
    2026,
    'Annai Vailankanni Arts and Science College, Thanjavur',
    92,
    true,
    60,
    5,
    5,
    0,
    100,
    1840,
    'submitted',
    'AVASC-2026-BCA-KART-92A1',
    '[
      {"questionId":"q1","questionTitle":"Time Complexity of Two Pointer Search","questionType":"mcq","maxScore":20,"awardedScore":20,"passed":true,"userAnswer":"O(n)","correctAnswer":"O(n)","feedback":"Correct logarithmic reduction logic"},
      {"questionId":"q2","questionTitle":"Two Sum Index Search","questionType":"coding","maxScore":20,"awardedScore":20,"passed":true,"executionTimeMs":45,"passedCases":6,"totalCases":6,"feedback":"Optimal Hash Map implementation with 100% test pass rate"}
    ]'::jsonb,
    '[]'::jsonb,
    NOW() - INTERVAL '2 days'
),
(
    'aa111111-0000-0000-0000-000000000002',
    'assessment-1',
    'Mid-Term Technical Aptitude & Coding Milestone',
    '00000000-0000-0000-0000-000000000002',
    'Priya Dharshini M.',
    '23CS012',
    'B.Sc CS',
    2026,
    'Annai Vailankanni Arts and Science College, Thanjavur',
    88,
    true,
    60,
    5,
    4,
    1,
    85,
    2100,
    'submitted',
    'AVASC-2026-CS-PRIYA-88B2',
    '[
      {"questionId":"q1","questionTitle":"Stack LIFO Property","questionType":"mcq","maxScore":20,"awardedScore":20,"passed":true,"userAnswer":"LIFO","correctAnswer":"LIFO","feedback":"Correct definition"},
      {"questionId":"q2","questionTitle":"Two Sum Index Search","questionType":"coding","maxScore":20,"awardedScore":16,"passed":true,"executionTimeMs":78,"passedCases":5,"totalCases":6,"feedback":"Passed all sample cases; boundary hidden case timed out slightly"}
    ]'::jsonb,
    '[{"id":"evt-1","timestamp":"2026-11-17T10:14:22Z","type":"tab_switch","details":"Window focus lost for 4.2 seconds","severity":"low"}]'::jsonb,
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;
