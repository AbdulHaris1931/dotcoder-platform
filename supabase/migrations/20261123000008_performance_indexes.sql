-- ==============================================================================
-- Migration: 20261123000008_performance_indexes.sql
-- Directive 05: Database Indexes & Directive 06: High-Concurrency Query Optimization
-- ==============================================================================

-- 1. Profiles & Roster Indexes (Optimizes student lookups & cohort queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role_college ON public.profiles(role, college_name);
CREATE INDEX IF NOT EXISTS idx_profiles_roll_no ON public.profiles(roll_no);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- 2. Curriculum Submissions (Fast user progress & solve state lookup)
CREATE INDEX IF NOT EXISTS idx_curr_subs_user_problem ON public.curriculum_submissions(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_curr_subs_user_status ON public.curriculum_submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_curr_subs_submitted_at ON public.curriculum_submissions(submitted_at DESC);

-- 3. Assessment Attempts & Scoring (Accelerates analytics & student history)
CREATE INDEX IF NOT EXISTS idx_assess_attempts_user_id ON public.assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_assess_attempts_assess_id ON public.assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assess_attempts_submitted_at ON public.assessment_attempts(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_assess_attempts_score ON public.assessment_attempts(score DESC);

-- 4. Campus Drives & 1-Click Placement Applications
CREATE INDEX IF NOT EXISTS idx_campus_drives_status_date ON public.campus_drives(status, drive_date DESC);
CREATE INDEX IF NOT EXISTS idx_drive_apps_drive_student ON public.drive_applications(drive_id, student_id);
CREATE INDEX IF NOT EXISTS idx_drive_apps_applied_at ON public.drive_applications(applied_at DESC);

-- 5. Student Skill Profiles & Telemetry
CREATE INDEX IF NOT EXISTS idx_student_skill_profiles_user_id ON public.student_skill_profiles(user_id);
