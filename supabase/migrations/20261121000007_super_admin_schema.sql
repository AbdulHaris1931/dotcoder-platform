-- ==============================================================================
-- EQLV CODE Super Admin & User Lifecycle Management Migration
-- Incremental & Non-Destructive
-- Adds: account_status on profiles, admin_audit_logs table
-- ==============================================================================

DO $$
BEGIN
    -- 1. Add account_status column on public.profiles if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'account_status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active' 
            CHECK (account_status IN ('active', 'inactive', 'suspended', 'archived'));
    END IF;

    -- 2. Add suspended_at timestamp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'suspended_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN suspended_at TIMESTAMPTZ;
    END IF;

    -- 3. Add suspension_reason text
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'suspension_reason'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN suspension_reason TEXT;
    END IF;

    -- 4. Add archived_at timestamp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN archived_at TIMESTAMPTZ;
    END IF;
END $$;

-- 5. Create Append-Only Administrative Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    actor_type TEXT NOT NULL DEFAULT 'super_admin',
    action TEXT NOT NULL,
    target_user_id TEXT,
    target_user_email TEXT,
    target_user_role TEXT,
    operation_result TEXT NOT NULL DEFAULT 'success' CHECK (operation_result IN ('success', 'failed', 'blocked')),
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users matching owner or service role can select
DROP POLICY IF EXISTS "Audit logs are readable by authorized super admin" ON public.admin_audit_logs;
CREATE POLICY "Audit logs are readable by authorized super admin"
    ON public.admin_audit_logs FOR SELECT
    TO authenticated
    USING (
        auth.jwt()->>'email' = current_setting('app.super_admin_email', true) OR
        public.current_user_role() = 'super_admin'
    );
