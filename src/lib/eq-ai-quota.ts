/**
 * EQ AI Student Daily Quota Management
 * 
 * Enforces a strict 20 chats/day limit per student.
 * Quotas automatically reset every night at midnight local time (00:00).
 */

export const MAX_DAILY_AI_CHATS = 20;
const STORAGE_KEY = "eqlv_ai_daily_quota_v1";

export interface QuotaStatus {
  used: number;
  remaining: number;
  maxLimit: number;
  date: string;
  isExhausted: boolean;
  resetsInHours: number;
}

interface StoredQuota {
  date: string; // YYYY-MM-DD
  used: number;
  studentId?: string;
}

/**
 * Returns today's formatted local date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates hours remaining until next midnight
 */
export function getHoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
}

/**
 * Retrieves the current quota status for a student
 */
export function getDailyAiQuota(studentId: string = "student-default"): QuotaStatus {
  const today = getTodayDateString();
  const resetsInHours = getHoursUntilMidnight();

  if (typeof window === "undefined") {
    return {
      used: 0,
      remaining: MAX_DAILY_AI_CHATS,
      maxLimit: MAX_DAILY_AI_CHATS,
      date: today,
      isExhausted: false,
      resetsInHours,
    };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${studentId}`);
    if (!raw) {
      return {
        used: 0,
        remaining: MAX_DAILY_AI_CHATS,
        maxLimit: MAX_DAILY_AI_CHATS,
        date: today,
        isExhausted: false,
        resetsInHours,
      };
    }

    const parsed: StoredQuota = JSON.parse(raw);
    // If the stored record is from a previous day, auto-reset to 0
    if (parsed.date !== today) {
      const resetData: StoredQuota = { date: today, used: 0, studentId };
      localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(resetData));
      return {
        used: 0,
        remaining: MAX_DAILY_AI_CHATS,
        maxLimit: MAX_DAILY_AI_CHATS,
        date: today,
        isExhausted: false,
        resetsInHours,
      };
    }

    const used = Math.min(parsed.used, MAX_DAILY_AI_CHATS);
    const remaining = Math.max(0, MAX_DAILY_AI_CHATS - used);

    return {
      used,
      remaining,
      maxLimit: MAX_DAILY_AI_CHATS,
      date: today,
      isExhausted: remaining <= 0,
      resetsInHours,
    };
  } catch {
    return {
      used: 0,
      remaining: MAX_DAILY_AI_CHATS,
      maxLimit: MAX_DAILY_AI_CHATS,
      date: today,
      isExhausted: false,
      resetsInHours,
    };
  }
}

/**
 * Consumes 1 chat from the student's daily quota.
 * Returns true if allowed and consumed, false if limit was already reached.
 */
export function consumeDailyAiQuota(studentId: string = "student-default"): {
  allowed: boolean;
  status: QuotaStatus;
} {
  const current = getDailyAiQuota(studentId);
  const today = getTodayDateString();
  const resetsInHours = getHoursUntilMidnight();

  if (current.isExhausted) {
    return {
      allowed: false,
      status: current,
    };
  }

  const newUsed = current.used + 1;
  const newRemaining = Math.max(0, MAX_DAILY_AI_CHATS - newUsed);

  if (typeof window !== "undefined") {
    try {
      const payload: StoredQuota = {
        date: today,
        used: newUsed,
        studentId,
      };
      localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(payload));
    } catch {
      // Ignore storage errors in restricted private browsing
    }
  }

  const updatedStatus: QuotaStatus = {
    used: newUsed,
    remaining: newRemaining,
    maxLimit: MAX_DAILY_AI_CHATS,
    date: today,
    isExhausted: newRemaining <= 0,
    resetsInHours,
  };

  return {
    allowed: true,
    status: updatedStatus,
  };
}
