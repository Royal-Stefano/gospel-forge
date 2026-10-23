/**
 * In-memory sliding-window rate limiter for production edge and server routes.
 * Protects against credential stuffing, upload flooding, and status alteration denial-of-service.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up stale records every 5 minutes (unref allows test runner / process to exit cleanly)
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 600000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
  if (cleanupTimer && typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(resetSeconds, 1),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetSeconds: windowSeconds,
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
