-- ==============================================================================
-- Migration: 20261123000011_published_assessments_sync.sql
-- Purpose: Enable cross-device persistence of teacher/AI published assessments
--          (MCQs + Coding challenges) directly in Supabase.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.published_assessments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_college TEXT NOT NULL DEFAULT 'ALL',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_proctored BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  problems_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_published_assessments_active_created
  ON public.published_assessments (is_active, created_at DESC);

ALTER TABLE public.published_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS published_assessments_read_auth ON public.published_assessments;
CREATE POLICY published_assessments_read_auth
  ON public.published_assessments
  FOR SELECT
  TO authenticated
  USING (is_active = true OR created_by = auth.uid() OR public.get_authenticated_role() IN ('teacher', 'admin', 'tpo', 'super_admin'));

DROP POLICY IF EXISTS published_assessments_staff_write ON public.published_assessments;
CREATE POLICY published_assessments_staff_write
  ON public.published_assessments
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.get_authenticated_role() IN ('teacher', 'admin', 'tpo', 'super_admin')
  )
  WITH CHECK (
    public.get_authenticated_role() IN ('teacher', 'admin', 'tpo', 'super_admin')
  );
