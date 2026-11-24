-- ============================================================================
-- Flow A: Super Admin Approved Password-Change Unlock Window
-- Zero plaintext passwords are ever stored in this table.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.password_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Campus User',
  user_role TEXT NOT NULL DEFAULT 'student',
  department TEXT DEFAULT '',
  roll_no TEXT DEFAULT '',
  reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'expired')),
  approved_until TIMESTAMPTZ,
  admin_note TEXT DEFAULT '',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pwd_req_status_created
  ON public.password_change_requests (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pwd_req_user_created
  ON public.password_change_requests (user_id, created_at DESC);

ALTER TABLE public.password_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own password requests" ON public.password_change_requests;
CREATE POLICY "Users can view own password requests"
  ON public.password_change_requests
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own password requests" ON public.password_change_requests;
CREATE POLICY "Users can create own password requests"
  ON public.password_change_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Users can complete own approved password requests" ON public.password_change_requests;
CREATE POLICY "Users can complete own approved password requests"
  ON public.password_change_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'approved')
  WITH CHECK (auth.uid() = user_id AND status = 'completed');

DROP POLICY IF EXISTS "Super admins can manage all password requests" ON public.password_change_requests;
CREATE POLICY "Super admins can manage all password requests"
  ON public.password_change_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );
