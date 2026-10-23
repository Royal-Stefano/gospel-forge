/**
 * Shared & In-memory sliding-window rate limiter for production edge and server routes.
 * Protects against credential stuffing, upload flooding, and status alteration denial-of-service.
 * Supports distributed multi-process environments (Hostinger PM2 cluster, Docker replicas)
 * via Upstash Redis REST or Supabase PostgreSQL RPC with automatic fallback.
 */

// Dynamically or relatively import Supabase admin client to support both Next.js bundling and direct Node test runner
async function getAdminClient() {
  try {
    const adminModule = await import("../supabase/admin");
    return adminModule.getSupabaseAdminClient();
  } catch {
    return null;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up stale in-memory records every 5 minutes (unref allows test runner / process to exit cleanly)
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

/**
 * Synchronous in-memory sliding-window rate limiter.
 * Ideal for unit tests, offline development, and fallback.
 */
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

/**
 * Distributed Shared Rate Limiter for multi-process Node.js environments.
 * Priority:
 * 1. Upstash Redis REST (if UPSTASH_REDIS_REST_URL is configured)
 * 2. Supabase PostgreSQL check_rate_limit RPC (if Supabase is configured)
 * 3. In-memory sliding-window fallback
 */
export async function checkSharedRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  // 1. Upstash Redis REST check (zero external NPM dependencies, HTTPS fetch)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", `gf_rl:${identifier}`],
          ["EXPIRE", `gf_rl:${identifier}`, windowSeconds, "NX"],
          ["TTL", `gf_rl:${identifier}`],
        ]),
        cache: "no-store",
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = Number(results[0]?.result) || 1;
        const ttl = Math.max(Number(results[2]?.result) || windowSeconds, 1);

        if (currentCount > maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetSeconds: ttl,
          };
        }

        return {
          allowed: true,
          remaining: Math.max(0, maxRequests - currentCount),
          resetSeconds: ttl,
        };
      }
    } catch (err) {
      console.warn("Upstash Redis rate limiter error, falling back:", err);
    }
  }

  // 2. Supabase Database RPC check
  try {
    const adminSupabase: any = await getAdminClient();
    if (adminSupabase) {
      const { data, error } = await adminSupabase.rpc("check_rate_limit", {
        p_key: identifier,
        p_max: maxRequests,
        p_window_seconds: windowSeconds,
      });

      if (!error && data) {
        return {
          allowed: Boolean(data.allowed),
          remaining: Number(data.remaining),
          resetSeconds: Number(data.resetSeconds),
        };
      }
    }
  } catch (dbErr) {
    console.warn("Database shared rate limiter error, falling back:", dbErr);
  }

  // 3. Fallback to in-memory sliding window
  return checkRateLimit(identifier, maxRequests, windowSeconds);
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
