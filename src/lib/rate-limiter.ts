import { NextResponse } from "next/server";

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitCheckOptions {
  key: string;
  config: RateLimitConfig;
  role?: string | null;
  email?: string | null;
  isOwner?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
  isExempted: boolean;
}

// =============================================================================
// ENTERPRISE CAMPUS CONCURRENCY PRESETS (ENGINEERED FOR 300+ CONCURRENT USERS)
// =============================================================================
export const RATE_LIMIT_PRESETS = {
  // Individual Student Code execution: 20 runs per 60s per verified student
  COMPILER: { limit: 20, windowSeconds: 60 } as RateLimitConfig,

  // Individual Student Assessment submissions: 15 per 60s per verified student
  SUBMIT: { limit: 15, windowSeconds: 60 } as RateLimitConfig,

  // AI Tutor chat requests: 30 per 60s per verified user
  AI_CHAT: { limit: 30, windowSeconds: 60 } as RateLimitConfig,

  // Heavy AI Generation / CSV Parse: 15 per 60s per verified staff member
  AI_ADMIN: { limit: 15, windowSeconds: 60 } as RateLimitConfig,

  // Individual Auth & login attempts: 10 per 60s per IP/identifier
  AUTH: { limit: 10, windowSeconds: 60 } as RateLimitConfig,

  // Campus NAT / College Lab Shared IP Perimeter:
  // 500+ students * 12 req/min = 6,000 req/min allowance for shared college Wi-Fi/NAT IP
  GLOBAL_CAMPUS_NAT_IP: { limit: 6000, windowSeconds: 60 } as RateLimitConfig,

  // Backward compatibility alias for global API
  GLOBAL_API: { limit: 6000, windowSeconds: 60 } as RateLimitConfig,

  // Authenticated Individual Student API allowance
  PER_STUDENT_API: { limit: 120, windowSeconds: 60 } as RateLimitConfig,
};

// In-Memory Sliding Window Log Store (fallback when Upstash Redis is not configured)
interface WindowEntry {
  timestamps: number[];
  lastCleanup: number;
}

const rateLimitStore = new Map<string, WindowEntry>();
const GLOBAL_STORE_CLEANUP_INTERVAL_MS = 2 * 60 * 1000;
let lastGlobalCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastGlobalCleanup < GLOBAL_STORE_CLEANUP_INTERVAL_MS) return;
  lastGlobalCleanup = now;

  rateLimitStore.forEach((entry, key) => {
    if (
      entry.timestamps.length === 0 ||
      now - entry.timestamps[entry.timestamps.length - 1] > 5 * 60 * 1000
    ) {
      rateLimitStore.delete(key);
    }
  });
}

/**
 * Reset in-memory store (used by automated tests)
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Check whether a SERVER-VERIFIED user or role is exempted from rate limits.
 * IMPORTANT: Callers must ONLY pass role/email/isOwner obtained from verified server auth.
 */
export function isExemptedRole(
  role?: string | null,
  email?: string | null,
  isOwner?: boolean
): boolean {
  if (isOwner) return true;

  const configuredOwnerEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const cleanEmail = email?.trim().toLowerCase();
  if (configuredOwnerEmail && cleanEmail && cleanEmail === configuredOwnerEmail) {
    return true;
  }

  const cleanRole = role?.trim().toLowerCase();
  return cleanRole === "super_admin" || cleanRole === "teacher" || cleanRole === "mentor";
}

/**
 * Check rate limit synchronously using in-memory Sliding Window Log algorithm
 */
export function checkRateLimit(options: RateLimitCheckOptions): RateLimitResult {
  cleanupStaleEntries();

  const { key, config, role, email, isOwner } = options;
  const { limit, windowSeconds } = config;

  if (isExemptedRole(role, email, isOwner)) {
    return {
      allowed: true,
      limit: 999999,
      remaining: 999999,
      resetSeconds: 0,
      retryAfterSeconds: 0,
      isExempted: true,
    };
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  const requestCount = entry.timestamps.length;
  const oldestTimestamp = entry.timestamps[0] || now;
  const timeToOldestExpireMs = Math.max(0, oldestTimestamp + windowMs - now);
  const resetSeconds = Math.ceil(timeToOldestExpireMs / 1000) || windowSeconds;

  if (requestCount >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil(timeToOldestExpireMs / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
      retryAfterSeconds,
      isExempted: false,
    };
  }

  entry.timestamps.push(now);
  const remaining = Math.max(0, limit - entry.timestamps.length);

  return {
    allowed: true,
    limit,
    remaining,
    resetSeconds,
    retryAfterSeconds: 0,
    isExempted: false,
  };
}

/**
 * Distributed Rate Limiter (Upstash Redis REST API with automatic in-memory fallback).
 * Works across Vercel Edge / multi-instance serverless deployments with zero extra npm deps.
 */
export async function checkRateLimitDistributed(
  options: RateLimitCheckOptions
): Promise<RateLimitResult> {
  const { key, config, role, email, isOwner } = options;
  const { limit, windowSeconds } = config;

  if (isExemptedRole(role, email, isOwner)) {
    return {
      allowed: true,
      limit: 999999,
      remaining: 999999,
      resetSeconds: 0,
      retryAfterSeconds: 0,
      isExempted: true,
    };
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return checkRateLimit(options);
  }

  try {
    const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const redisKey = `rl:${key}:${bucket}`;
    const pipelineRes = await fetch(`${redisUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSeconds + 5, "NX"],
      ]),
      signal: AbortSignal.timeout(1500),
    });

    if (!pipelineRes.ok) {
      return checkRateLimit(options);
    }

    const results = (await pipelineRes.json()) as Array<{ result?: number }>;
    const count = Number(results?.[0]?.result ?? 1);
    const nowSec = Math.floor(Date.now() / 1000);
    const resetSeconds = Math.max(1, (bucket + 1) * windowSeconds - nowSec);

    if (count > limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetSeconds,
        retryAfterSeconds: resetSeconds,
        isExempted: false,
      };
    }

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - count),
      resetSeconds,
      retryAfterSeconds: 0,
      isExempted: false,
    };
  } catch {
    // Graceful fallback if Upstash is unreachable
    return checkRateLimit(options);
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetSeconds.toString(),
  };

  if (!result.allowed && result.retryAfterSeconds > 0) {
    headers["Retry-After"] = result.retryAfterSeconds.toString();
  }

  return headers;
}

export function rateLimitExceededResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const headers = getRateLimitHeaders(result);
  return NextResponse.json(
    {
      error: "Too Many Requests",
      message:
        customMessage ||
        `Rate limit exceeded. Maximum ${result.limit} requests permitted per window. Please retry in ${result.retryAfterSeconds} seconds.`,
      retryAfter: result.retryAfterSeconds,
      limit: result.limit,
      remaining: 0,
    },
    {
      status: 429,
      headers,
    }
  );
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}
