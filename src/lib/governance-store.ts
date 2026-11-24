export interface PlatformGovernanceConfig {
  college_name: string;
  active_batch_year: number;
  departments: string[];
  ai_mentor_frozen: boolean;
  idle_timeout_minutes: number;
  broadcast_enabled: boolean;
  broadcast_message: string;
  broadcast_target: "all" | "student" | "teacher" | "tpo";
  broadcast_severity: "info" | "warning" | "urgent";
  updated_by?: string | null;
  updated_at?: string;
}

export interface RevokedCredentialRecord {
  credential_hash: string;
  reason: string;
  revoked_by: string;
  revoked_at: string;
}

export const DEFAULT_GOVERNANCE_CONFIG: PlatformGovernanceConfig = {
  college_name: "Annai Vailankanni Arts and Science College, Thanjavur",
  active_batch_year: 2026,
  departments: ["BCA", "B.Sc CS", "B.Sc IT", "MCA"],
  ai_mentor_frozen: false,
  idle_timeout_minutes: 30,
  broadcast_enabled: false,
  broadcast_message: "",
  broadcast_target: "all",
  broadcast_severity: "info",
  updated_by: null,
  updated_at: new Date().toISOString(),
};

const globalGovernance = globalThis as unknown as {
  __eqlvGovernanceConfig?: PlatformGovernanceConfig;
  __eqlvRevokedCredentials?: RevokedCredentialRecord[];
};

export function getFallbackGovernance(): PlatformGovernanceConfig {
  if (!globalGovernance.__eqlvGovernanceConfig) {
    globalGovernance.__eqlvGovernanceConfig = { ...DEFAULT_GOVERNANCE_CONFIG };
  }
  return globalGovernance.__eqlvGovernanceConfig;
}

export function setFallbackGovernance(
  partial: Partial<PlatformGovernanceConfig>
): PlatformGovernanceConfig {
  const current = getFallbackGovernance();
  const updated: PlatformGovernanceConfig = {
    ...current,
    ...partial,
    updated_at: new Date().toISOString(),
  };
  globalGovernance.__eqlvGovernanceConfig = updated;
  return updated;
}

export function getFallbackRevokedCredentials(): RevokedCredentialRecord[] {
  if (!globalGovernance.__eqlvRevokedCredentials) {
    globalGovernance.__eqlvRevokedCredentials = [];
  }
  return globalGovernance.__eqlvRevokedCredentials;
}

export function addFallbackRevokedCredential(
  record: RevokedCredentialRecord
): RevokedCredentialRecord[] {
  const list = getFallbackRevokedCredentials().filter(
    (r) => r.credential_hash.toLowerCase() !== record.credential_hash.toLowerCase()
  );
  list.unshift(record);
  globalGovernance.__eqlvRevokedCredentials = list;
  return list;
}

export function removeFallbackRevokedCredential(
  hash: string
): RevokedCredentialRecord[] {
  const list = getFallbackRevokedCredentials().filter(
    (r) => r.credential_hash.toLowerCase() !== hash.toLowerCase()
  );
  globalGovernance.__eqlvRevokedCredentials = list;
  return list;
}

export function isGovernanceTableMissing(message?: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("schema cache") ||
    lower.includes("does not exist") ||
    lower.includes("pgrst205") ||
    lower.includes("platform_governance") ||
    lower.includes("revoked_credentials")
  );
}
