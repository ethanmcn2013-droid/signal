import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Public-endpoint rate limiting for Signal.
 *
 * The audit (2026-06-18) flagged that Signal had NO rate limiting on any
 * endpoint. This is the shared limiter the public routes call.
 *
 * Design decisions:
 *   - GATED. When `UPSTASH_REDIS_REST_URL` / `_TOKEN` are unset (dev,
 *     preview, or before the operator provisions Upstash) the limiter is a
 *     no-op that ALLOWS. So wiring this up never breaks a deployment, it
 *     simply starts enforcing the moment the env is present.
 *   - FAILS OPEN. If Redis errors at request time we allow rather than
 *     500, a cache outage must not take a public endpoint down. Abuse
 *     protection is best-effort by nature.
 *   - Sliding window, keyed by the caller (IP for anonymous routes, userId
 *     for authed ones). One Ratelimit instance is cached per (name, limit,
 *     window) so we don't rebuild it per request.
 *
 * Operator: provision Upstash Redis (Vercel → Integrations → Upstash) and
 * add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to the Signal
 * project. No code change needed to turn it on.
 */

type Duration = `${number} ${"ms" | "s" | "m" | "h" | "d"}`;

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, limit: number, window: Duration): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${name}:${limit}:${window}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `signal:rl:${name}`,
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/** Best-effort client IP for anonymous routes (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Returns true if the request is within the limit. Allows (returns true)
 * when Upstash is unconfigured OR errors, see the fail-open note above.
 *
 * @param name        logical bucket, e.g. "unsubscribe", namespaces the keys
 * @param identifier  the caller key, an IP or a userId
 */
export async function allow(
  name: string,
  identifier: string,
  limit: number,
  window: Duration,
): Promise<boolean> {
  const limiter = getLimiter(name, limit, window);
  if (!limiter) return true; // not configured → allow
  try {
    const { success } = await limiter.limit(identifier);
    return success;
  } catch {
    return true; // fail open, never let a cache outage break the endpoint
  }
}
