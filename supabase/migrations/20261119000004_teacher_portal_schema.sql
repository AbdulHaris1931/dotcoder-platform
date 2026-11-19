-- ==============================================================================
-- DOTCODER 2.0: TEACHER & MENTOR PORTAL SCHEMA (PHASE 5)
-- Multi-Tenant Assignment Bundles, Cohort Health & Mentor Feedback
-- Target Institution: Annai Vailankanni Arts and Science College, Thanjavur (AVASC-TNJ)
-- ==============================================================================

-- 1. Teacher Assignment Bundles Table
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_department TEXT NOT NULL DEFAULT 'BCA',
  cohort_year TEXT NOT NULL DEFAULT '2023 - 2026',
  problems JSONB NOT NULL DEFAULT '[]'::jsonb,
  due_date TIMESTAMPTZ NOT NULL,
  passing_case_percent INT NOT NULL DEFAULT 80,
  total_enrolled INT NOT NULL DEFAULT 68,
  submitted_count INT NOT NULL DEFAULT 0,
  evaluated_count INT NOT NULL DEFAULT 0,
  avg_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for fast cohort queries
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_org ON public.teacher_assignments(org_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_dept ON public.teacher_assignments(target_department);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);

-- 2. Mentor Feedback Table
CREATE TABLE IF NOT EXISTS public.mentor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.teacher_assignments(id) ON DELETE SET NULL,
  submission_id TEXT,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  feedback_text TEXT NOT NULL,
  code_quality_rating INT NOT NULL DEFAULT 5 CHECK (code_quality_rating BETWEEN 1 AND 5),
  recommended_topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_feedback_student ON public.mentor_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_teacher ON public.mentor_feedback(teacher_id);

-- 3. Row Level Security (RLS)
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'teacher_assignments' AND policyname = 'teacher_assignments_read'
  ) THEN
    CREATE POLICY teacher_assignments_read ON public.teacher_assignments
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'teacher_assignments' AND policyname = 'teacher_assignments_write'
  ) THEN
    CREATE POLICY teacher_assignments_write ON public.teacher_assignments
      FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mentor_feedback' AND policyname = 'mentor_feedback_read'
  ) THEN
    CREATE POLICY mentor_feedback_read ON public.mentor_feedback
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mentor_feedback' AND policyname = 'mentor_feedback_write'
  ) THEN
    CREATE POLICY mentor_feedback_write ON public.mentor_feedback
      FOR ALL USING (true);
  END IF;
END $$;

-- 4. Seed Verified Initial Teacher Assignments for AVASC-TNJ (Dr. S. Meenakshi)
DO $$
DECLARE
  v_org_id UUID;
  v_teacher_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM public.organizations WHERE code = 'AVASC-TNJ' LIMIT 1;
  IF v_org_id IS NULL THEN
    v_org_id := 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  END IF;

  SELECT id INTO v_teacher_id FROM public.profiles WHERE role = 'teacher' LIMIT 1;
  IF v_teacher_id IS NULL THEN
    v_teacher_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- Assignment 1: Dynamic Programming Sprint
  IF NOT EXISTS (SELECT 1 FROM public.teacher_assignments WHERE title = 'Sprint 04: Dynamic Programming & Memoization Mastery') THEN
    INSERT INTO public.teacher_assignments (
      id, org_id, teacher_id, teacher_name, title, description,
      target_department, cohort_year, problems, due_date, passing_case_percent,
      total_enrolled, submitted_count, evaluated_count, avg_score, status
    ) VALUES (
      '33333333-0000-0000-0000-000000000001',
      v_org_id,
      v_teacher_id,
      'Dr. S. Meenakshi',
      'Sprint 04: Dynamic Programming & Memoization Mastery',
      'Targeted remedial drill for BCA & B.Sc CS cohorts on recurrence relations, memoization state caching, and boundary traps.',
      'BCA',
      '2023 - 2026',
      '[
        {"problemId": "11111111-0000-0000-0000-000000000001", "problemTitle": "Optimal Two Sum Index Pairs", "difficulty": "Easy", "category": "Warmup", "targetSlug": "optimal-two-sum-index-pairs"},
        {"problemId": "11111111-0000-0000-0000-000000000002", "problemTitle": "Longest Substring Without Repeating Characters", "difficulty": "Medium", "category": "Algorithmic Pattern", "targetSlug": "longest-substring"}
      ]'::jsonb,
      now() + interval '5 days',
      80,
      68,
      44,
      38,
      86.5,
      'Active'
    );
  END IF;

  -- Assignment 2: Two Pointers & Array Invariants
  IF NOT EXISTS (SELECT 1 FROM public.teacher_assignments WHERE title = 'Data Structures Lab: Two Pointers & In-Place Array Mutations') THEN
    INSERT INTO public.teacher_assignments (
      id, org_id, teacher_id, teacher_name, title, description,
      target_department, cohort_year, problems, due_date, passing_case_percent,
      total_enrolled, submitted_count, evaluated_count, avg_score, status
    ) VALUES (
      '33333333-0000-0000-0000-000000000002',
      v_org_id,
      v_teacher_id,
      'Dr. S. Meenakshi',
      'Data Structures Lab: Two Pointers & In-Place Array Mutations',
      'Lab mandatory exercises covering two-pointer convergence, shrinking sliding windows, and O(1) auxiliary space constraints.',
      'B.Sc CS',
      '2023 - 2026',
      '[
        {"problemId": "11111111-0000-0000-0000-000000000001", "problemTitle": "Optimal Two Sum Index Pairs", "difficulty": "Easy", "category": "Warmup", "targetSlug": "optimal-two-sum-index-pairs"}
      ]'::jsonb,
      now() + interval '2 days',
      80,
      56,
      51,
      49,
      91.2,
      'Active'
    );
  END IF;
END $$;
