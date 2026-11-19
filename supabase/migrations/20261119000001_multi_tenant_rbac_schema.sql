-- ==============================================================================
-- DotCoder Multi-Tenant RBAC & Organizational Hierarchy Migration
-- Incremental & Non-Destructive
-- Adds: organizations, departments, batches, teacher_assignments
-- Updates: profiles role check constraint for 6 roles
-- ==============================================================================

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL DEFAULT 'Thanjavur',
    plan_tier TEXT NOT NULL DEFAULT 'enterprise_institutional',
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_org_dept UNIQUE (organization_id, code)
);

-- 3. Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_dept_batch UNIQUE (department_id, name)
);

-- 4. Alter Profiles Table (Safely add columns and update role check constraint)
DO $$
BEGIN
    -- Add organization_id if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
    END IF;

    -- Add department_id if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'department_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
    END IF;

    -- Add batch_id if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'batch_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL;
    END IF;

    -- Add avatar_url if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Update role check constraint safely
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('student', 'teacher', 'admin', 'tpo', 'super_admin', 'recruiter'));
END $$;

-- 5. Teacher Assignments Table
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_teacher_assignment UNIQUE (teacher_id, department_id, batch_id)
);

-- 6. Seed Default Institution & Departments (AVASC-TNJ)
INSERT INTO public.organizations (id, name, code, slug, city, plan_tier, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Annai Vailankanni Arts and Science College, Thanjavur',
    'AVASC-TNJ',
    'avasc-tnj',
    'Thanjavur, Tamil Nadu',
    'enterprise_institutional',
    true
)
ON CONFLICT (name) DO UPDATE SET
    code = EXCLUDED.code,
    slug = EXCLUDED.slug,
    is_active = true;

-- Seed Standard Departments for AVASC
INSERT INTO public.departments (id, organization_id, name, code)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Bachelor of Computer Applications', 'BCA'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'B.Sc Computer Science', 'B.Sc CS'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'B.Sc Information Technology', 'B.Sc IT'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Master of Computer Applications', 'MCA')
ON CONFLICT (organization_id, code) DO NOTHING;

-- Seed Standard Batches
INSERT INTO public.batches (id, department_id, name, start_year, end_year)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Batch 2023 - 2026', 2023, 2026),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Batch 2023 - 2026', 2023, 2026),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Batch 2023 - 2026', 2023, 2026),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Batch 2024 - 2026', 2024, 2026)
ON CONFLICT (department_id, name) DO NOTHING;

-- 7. Basic Row-Level Security Policies for Multi-Tenancy
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view active organizations
CREATE POLICY "Allow public read active organizations" ON public.organizations
    FOR SELECT TO authenticated, anon USING (is_active = true);

-- Allow authenticated users to view departments of their organization
CREATE POLICY "Allow authenticated read departments" ON public.departments
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to view batches
CREATE POLICY "Allow authenticated read batches" ON public.batches
    FOR SELECT TO authenticated USING (true);
