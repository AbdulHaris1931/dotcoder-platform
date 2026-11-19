-- ==============================================================================
-- Migration: 20261119000006_recruiter_placement_schema.sql
-- Description: Campus Placement, Verified Talent Discovery, and Recruiter Pipeline
-- Institution: Annai Vailankanni Arts and Science College, Thanjavur (AVASC-TNJ)
-- ==============================================================================

-- 1. Student Privacy Consent Column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS share_profile_with_recruiters BOOLEAN DEFAULT true;

-- 2. Recruiter Companies Table
CREATE TABLE IF NOT EXISTS public.recruiter_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL DEFAULT 'Tier 1 Product',
    logo_url TEXT,
    website TEXT NOT NULL,
    headquarters TEXT NOT NULL,
    hiring_roles TEXT[] NOT NULL DEFAULT '{}',
    compensation_range TEXT NOT NULL,
    is_partner_institution BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Placement Drives Table
CREATE TABLE IF NOT EXISTS public.placement_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.recruiter_companies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    compensation TEXT NOT NULL,
    target_departments TEXT[] NOT NULL DEFAULT '{"BCA", "B.Sc CS", "MCA"}',
    target_batch_year INTEGER NOT NULL DEFAULT 2026,
    min_readiness_score INTEGER NOT NULL DEFAULT 80,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Completed')),
    drive_date DATE NOT NULL,
    registered_count INTEGER NOT NULL DEFAULT 0,
    shortlisted_count INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Recruiter Candidate Shortlists & Pipeline Stages Table
CREATE TABLE IF NOT EXISTS public.recruiter_shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    department TEXT NOT NULL,
    drive_id UUID REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    drive_title TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'Screening' CHECK (stage IN ('Screening', 'Coding Round', 'Technical Interview', 'Offered')),
    readiness_score INTEGER NOT NULL DEFAULT 85,
    dsa_mastery TEXT NOT NULL DEFAULT 'Arrays & Two Pointers',
    primary_language TEXT NOT NULL DEFAULT 'Python',
    recruiter_notes TEXT,
    shortlisted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recruiter_id, student_id, drive_id)
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_recruiter_shortlists_student ON public.recruiter_shortlists(student_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_shortlists_drive ON public.recruiter_shortlists(drive_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_shortlists_stage ON public.recruiter_shortlists(stage);

-- Enable RLS
ALTER TABLE public.recruiter_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_shortlists ENABLE ROW LEVEL SECURITY;

-- Read policies: Authenticated users can view companies and placement drives
CREATE POLICY "Anyone authenticated can view companies"
    ON public.recruiter_companies FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can view placement drives"
    ON public.placement_drives FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Recruiter Shortlists Policies: Recruiters can view and manage their shortlists
CREATE POLICY "Recruiters and TPOs can manage shortlists"
    ON public.recruiter_shortlists FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('recruiter', 'tpo', 'admin', 'super_admin')
        )
    );

-- Students can view their own shortlist status
CREATE POLICY "Students can view their own shortlist stage"
    ON public.recruiter_shortlists FOR SELECT
    USING (auth.uid() = student_id);

-- Seed Companies
INSERT INTO public.recruiter_companies (id, name, slug, tier, website, headquarters, hiring_roles, compensation_range, is_partner_institution)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Zoho Corporation',
    'zoho',
    'Tier 1 Product',
    'https://www.zohocorp.com',
    'Chennai, Tamil Nadu',
    ARRAY['Software Craftsman', 'Member Technical Staff', 'Quality Engineer'],
    '6.5 - 8.4 LPA',
    true
),
(
    'c0000000-0000-0000-0000-000000000002',
    'Tata Consultancy Services (TCS)',
    'tcs',
    'Tier 1 IT Services',
    'https://www.tcs.com',
    'Mumbai, Maharashtra',
    ARRAY['Digital Cadre Developer', 'Prime Engineer', 'Ninja Developer'],
    '3.6 - 9.0 LPA',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Placement Drives
INSERT INTO public.placement_drives (id, company_id, company_name, title, role, compensation, target_departments, target_batch_year, min_readiness_score, status, drive_date, registered_count, shortlisted_count, description)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Zoho Corporation',
    'Zoho Campus Recruitment Drive 2026',
    'Software Craftsman / Member Technical Staff',
    '6.5 - 8.4 LPA',
    ARRAY['BCA', 'B.Sc CS', 'MCA'],
    2026,
    80,
    'Active',
    '2026-12-05',
    48,
    14,
    'On-campus recruitment targeting AVASC BCA, B.Sc Computer Science and MCA final years with demonstrated DSA and Full-Stack problem solving skills.'
)
ON CONFLICT (id) DO NOTHING;
