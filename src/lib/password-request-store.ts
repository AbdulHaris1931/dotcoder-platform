export interface PasswordChangeRequestRow {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
  department: string;
  roll_no: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed" | "expired";
  approved_until: string | null;
  admin_note: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const globalForPwdStore = globalThis as unknown as {
  __eqlvPasswordRequests?: PasswordChangeRequestRow[];
};

function getStore(): PasswordChangeRequestRow[] {
  if (!globalForPwdStore.__eqlvPasswordRequests) {
    globalForPwdStore.__eqlvPasswordRequests = [];
  }
  return globalForPwdStore.__eqlvPasswordRequests;
}

export function isMissingTableError(message?: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("schema cache") ||
    lower.includes("password_change_requests") ||
    lower.includes("does not exist") ||
    lower.includes("pgrst205")
  );
}

export function fallbackGetLatestForUser(
  userId: string
): PasswordChangeRequestRow | null {
  const list = getStore().filter((r) => r.user_id === userId);
  if (list.length === 0) return null;
  const latest = list[0];
  if (
    latest.status === "approved" &&
    latest.approved_until &&
    new Date(latest.approved_until).getTime() < Date.now()
  ) {
    latest.status = "expired";
  }
  return latest;
}

export function fallbackCreateRequest(
  input: Omit<
    PasswordChangeRequestRow,
    "id" | "status" | "approved_until" | "admin_note" | "reviewed_by" | "reviewed_at" | "created_at"
  >
): { alreadyPending: boolean; request: PasswordChangeRequestRow } {
  const store = getStore();
  const existing = store.find(
    (r) => r.user_id === input.user_id && r.status === "pending"
  );
  if (existing) {
    return { alreadyPending: true, request: existing };
  }

  const created: PasswordChangeRequestRow = {
    ...input,
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    approved_until: null,
    admin_note: "",
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString(),
  };
  store.unshift(created);
  return { alreadyPending: false, request: created };
}

export function fallbackCompleteRequest(userId: string, requestId: string): void {
  const item = getStore().find(
    (r) => r.id === requestId && r.user_id === userId && r.status === "approved"
  );
  if (item) {
    item.status = "completed";
  }
}

export function fallbackListAllRequests(): PasswordChangeRequestRow[] {
  const now = Date.now();
  return getStore().map((row) => {
    if (
      row.status === "approved" &&
      row.approved_until &&
      new Date(row.approved_until).getTime() < now
    ) {
      row.status = "expired";
    }
    return row;
  });
}

export function fallbackReviewRequest(params: {
  id: string;
  action: "approve" | "reject";
  adminNote: string;
  reviewedBy: string;
  unlockMinutes: number;
}): PasswordChangeRequestRow | null {
  const item = getStore().find((r) => r.id === params.id);
  if (!item) return null;
  const isApprove = params.action === "approve";
  item.status = isApprove ? "approved" : "rejected";
  item.approved_until = isApprove
    ? new Date(Date.now() + params.unlockMinutes * 60 * 1000).toISOString()
    : null;
  item.admin_note = params.adminNote;
  item.reviewed_by = params.reviewedBy;
  item.reviewed_at = new Date().toISOString();
  return item;
}
