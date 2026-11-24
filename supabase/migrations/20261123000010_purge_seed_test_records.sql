-- ==============================================================================
-- Migration: 20261123000010_purge_seed_test_records.sql
-- Purpose: Remove any legacy mock/seed test users and mock records from live
--          tables so institutions start from a 100% clean slate (Super Admin only).
-- ==============================================================================

-- 1. Remove legacy seeded mock assessment attempts
DELETE FROM public.assessment_attempts
WHERE id IN (
  'aa111111-0000-0000-0000-000000000001',
  'aa111111-0000-0000-0000-000000000002'
)
OR accreditation_hash IN (
  'AVASC-2026-BCA-KART-92A1',
  'AVASC-2026-CS-PRIYA-88B2'
);

-- 2. Remove legacy seeded mock teacher assignments
DELETE FROM public.teacher_assignments
WHERE id IN (
  '33333333-0000-0000-0000-000000000001',
  '33333333-0000-0000-0000-000000000002'
);

-- 3. Remove legacy seeded mock profiles (preserving real users & Super Admin)
DELETE FROM public.profiles
WHERE role <> 'super_admin'
  AND (
    id IN (
      'a0000000-0000-0000-0000-000000000001',
      'a0000000-0000-0000-0000-000000000002',
      'a0000000-0000-0000-0000-000000000003',
      'a0000000-0000-0000-0000-000000000004',
      'a0000000-0000-0000-0000-000000000005',
      'a0000000-0000-0000-0000-000000000006',
      'a0000000-0000-0000-0000-000000000007',
      'a0000000-0000-0000-0000-000000000008'
    )
    OR LOWER(email) IN (
      'karthik.bca@avc.edu.in',
      'priya.cs@avc.edu.in',
      'saravanan.it@avc.edu.in',
      'divya.mca@avc.edu.in',
      'meenakshi@avc.edu.in',
      'tpo@avc.edu.in',
      'admin@avc.edu.in',
      'recruiter@zoho.com'
    )
  );
