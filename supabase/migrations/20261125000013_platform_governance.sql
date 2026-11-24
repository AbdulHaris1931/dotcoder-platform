-- ============================================================================
-- Platform Governance Configuration & Credential Revocation Registry
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_governance (
  id TEXT PRIMARY KEY DEFAULT 'default',
  college_name TEXT NOT NULL DEFAULT 'Annai Vailankanni Arts and Science College, Thanjavur',
  active_batch_year INTEGER NOT NULL DEFAULT 2026,
  departments JSONB NOT NULL DEFAULT '["BCA","B.Sc CS","B.Sc IT","MCA"]'::jsonb,
  ai_mentor_frozen BOOLEAN NOT NULL DEFAULT false,
  idle_timeout_minutes INTEGER NOT NULL DEFAULT 30,
  broadcast_enabled BOOLEAN NOT NULL DEFAULT false,
  broadcast_message TEXT NOT NULL DEFAULT '',
  broadcast_target TEXT NOT NULL DEFAULT 'all'
    CHECK (broadcast_target IN ('all', 'student', 'teacher', 'tpo')),
  broadcast_severity TEXT NOT NULL DEFAULT 'info'
    CHECK (broadcast_severity IN ('info', 'warning', 'urgent')),
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.platform_governance (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.revoked_credentials (
  credential_hash TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT '',
  revoked_by TEXT NOT NULL DEFAULT '',
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revoked_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read platform governance" ON public.platform_governance;
CREATE POLICY "Authenticated users can read platform governance"
  ON public.platform_governance
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Super admins can update platform governance" ON public.platform_governance;
CREATE POLICY "Super admins can update platform governance"
  ON public.platform_governance
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

DROP POLICY IF EXISTS "Anyone can read revoked credentials for verification" ON public.revoked_credentials;
CREATE POLICY "Anyone can read revoked credentials for verification"
  ON public.revoked_credentials
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super admins can manage revoked credentials" ON public.revoked_credentials;
CREATE POLICY "Super admins can manage revoked credentials"
  ON public.revoked_credentials
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
