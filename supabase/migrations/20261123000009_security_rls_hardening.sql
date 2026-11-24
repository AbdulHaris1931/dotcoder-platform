-- ==============================================================================
-- Migration: 20261123000009_security_rls_hardening.sql
-- Purpose: Close overly permissive USING(true) / WITH CHECK(true) RLS policies
--          and bind writes strictly to authenticated ownership and roles.
-- ==============================================================================

-- Helper: Safely resolve current user's authoritative role from public.profiles
CREATE OR REPLACE FUNCTION public.get_authenticated_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() AND account_status = 'active' LIMIT 1),
    'anonymous'
  );
$$;

-- 1. Harden teacher_assignments (previously FOR ALL USING (true))
DROP POLICY IF EXISTS teacher_assignments_read ON public.teacher_assignments;
DROP POLICY IF EXISTS teacher_assignments_write ON public.teacher_assignments;

CREATE POLICY teacher_assignments_read_authenticated
  ON public.teacher_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY teacher_assignments_staff_insert
  ON public.teacher_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_authenticated_role() IN ('teacher', 'admin', 'tpo', 'super_admin')
    AND (teacher_id = auth.uid() OR public.get_authenticated_role() IN ('admin', 'super_admin'))
  );

CREATE POLICY teacher_assignments_staff_update
  ON public.teacher_assignments
  FOR UPDATE
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR public.get_authenticated_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    teacher_id = auth.uid()
    OR public.get_authenticated_role() IN ('admin', 'super_admin')
  );

CREATE POLICY teacher_assignments_staff_delete
  ON public.teacher_assignments
  FOR DELETE
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR public.get_authenticated_role() IN ('admin', 'super_admin')
  );

-- 2. Harden mentor_feedback (previously FOR ALL USING (true))
DROP POLICY IF EXISTS mentor_feedback_read ON public.mentor_feedback;
DROP POLICY IF EXISTS mentor_feedback_write ON public.mentor_feedback;

CREATE POLICY mentor_feedback_read_scoped
  ON public.mentor_feedback
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR teacher_id = auth.uid()
    OR public.get_authenticated_role() IN ('teacher', 'admin', 'tpo', 'super_admin')
  );

CREATE POLICY mentor_feedback_staff_write
  ON public.mentor_feedback
  FOR ALL
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR public.get_authenticated_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    public.get_authenticated_role() IN ('teacher', 'admin', 'tpo', 'super_admin')
    AND (teacher_id = auth.uid() OR public.get_authenticated_role() IN ('admin', 'super_admin'))
  );

-- 3. Harden curriculum_submissions & curriculum_assessment_attempts INSERT policies
DROP POLICY IF EXISTS "Users can insert own curriculum submissions" ON public.curriculum_submissions;
CREATE POLICY "Users can insert own curriculum submissions"
  ON public.curriculum_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessment attempts" ON public.curriculum_assessment_attempts;
CREATE POLICY "Users can insert own assessment attempts"
  ON public.curriculum_assessment_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Harden student_skill_profiles (prevent students from fabricating skill scores for others)
DROP POLICY IF EXISTS "Authenticated users can insert skill profiles" ON public.student_skill_profiles;
DROP POLICY IF EXISTS "Users can insert own skill profile" ON public.student_skill_profiles;
CREATE POLICY "Users can insert own skill profile"
  ON public.student_skill_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR public.get_authenticated_role() IN ('teacher', 'admin', 'tpo', 'super_admin')
  );
