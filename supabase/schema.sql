-- ==============================================================================
-- DotCoder Open Self-Serve Multi-Tenant SaaS PostgreSQL Schema
-- Idempotent setup for Supabase SQL Editor
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles Table (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
    college_name TEXT NOT NULL DEFAULT 'Independent / General',
    roll_no TEXT,
    department TEXT,
    batch_year INT,
    readiness_score NUMERIC(5, 2) DEFAULT 0.00,
    problems_solved INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Problems Table (Coding Challenges & Aptitude MCQs)
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    company_tags TEXT[] DEFAULT '{}',
    type TEXT NOT NULL DEFAULT 'coding' CHECK (type IN ('coding', 'mcq')),
    description_md TEXT NOT NULL,
    starter_code_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    mcq_options_json JSONB DEFAULT NULL,
    correct_option TEXT DEFAULT NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Test Cases Table
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false
);

-- 5. Assessments Table (Mock Tests & Coding Rounds)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_college TEXT DEFAULT 'ALL',
    duration_minutes INT DEFAULT 60,
    is_proctored BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    language TEXT NOT NULL,
    source_code TEXT NOT NULL,
    status TEXT NOT NULL,
    passed_cases INT DEFAULT 0,
    total_cases INT DEFAULT 0,
    score NUMERIC(5, 2) DEFAULT 0.00,
    tab_switches INT DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Automatic Profile Trigger Function (Zero-Maintenance Signup)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    college_name,
    roll_no,
    department,
    batch_year,
    readiness_score,
    problems_solved
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student Candidate'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'college_name', 'Independent / General'),
    COALESCE(NEW.raw_user_meta_data->>'roll_no', 'GEN-' || substr(NEW.id::text, 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'department', 'CSE'),
    COALESCE((NEW.raw_user_meta_data->>'batch_year')::int, 2026),
    0.0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    college_name = EXCLUDED.college_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch requesting user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Helper function to fetch requesting user college
CREATE OR REPLACE FUNCTION public.current_user_college()
RETURNS TEXT AS $$
  SELECT college_name FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- 2. Problems Policies
DROP POLICY IF EXISTS "Problems are readable by all" ON public.problems;
CREATE POLICY "Problems are readable by all"
  ON public.problems FOR SELECT
  TO authenticated, anon
  USING (is_public = true OR public.current_user_role() IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can manage problems" ON public.problems;
CREATE POLICY "Admins can manage problems"
  ON public.problems FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'super_admin'));

-- 3. Test Cases Policies
DROP POLICY IF EXISTS "Public test cases are readable by students" ON public.test_cases;
CREATE POLICY "Public test cases are readable by students"
  ON public.test_cases FOR SELECT
  TO authenticated, anon
  USING (is_hidden = false OR public.current_user_role() IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can manage test cases" ON public.test_cases;
CREATE POLICY "Admins can manage test cases"
  ON public.test_cases FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'super_admin'));

-- 4. Assessments Policies
DROP POLICY IF EXISTS "Assessments are readable by target students or admins" ON public.assessments;
CREATE POLICY "Assessments are readable by target students or admins"
  ON public.assessments FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      target_college = 'ALL' OR 
      target_college = public.current_user_college() OR 
      public.current_user_role() IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage assessments" ON public.assessments;
CREATE POLICY "Admins can manage assessments"
  ON public.assessments FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'super_admin'));

-- 5. Submissions Policies
DROP POLICY IF EXISTS "Students can insert their own submissions" ON public.submissions;
CREATE POLICY "Students can insert their own submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Students can read their own submissions, admins can read institution submissions" ON public.submissions;
CREATE POLICY "Students can read their own submissions, admins can read institution submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.current_user_role() = 'super_admin' OR
    (public.current_user_role() = 'admin' AND user_id IN (
      SELECT id FROM public.profiles WHERE college_name = public.current_user_college()
    ))
  );
