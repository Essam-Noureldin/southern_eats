/**
 * WHAT: In-memory fixed-window rate limiter. One bucket per `key`
 *       (typically the request IP), tracking hit count and window expiry.
 * WHY:  Caps how often the same IP can submit the contact form. Defends
 *       against bot spam, Resend-budget abuse, and inbox flooding.
 * IF REMOVED: any bot can submit the form unlimited times — every hit
 *       costs us a Resend send and a Sentry event, and the client's
 *       inbox fills up with garbage.
 * COMMON MISTAKE: assuming this works across multiple Vercel regions /
 *       cold-started instances. It does NOT — the Map lives in the JS
 *       process and dies when the function instance dies. For
 *       single-region, mostly-warm deploys this is acceptable. Once the
 *       site needs multi-region or strict cross-instance accounting,
 *       swap the backing store for Vercel KV / Upstash Redis. The public
 *       API of this module is shaped so that swap is a one-file change.
 */

export interface RateLimitOpts {
  /** Maximum hits allowed within the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Current time in ms. Injected so tests are deterministic. Defaults to Date.now(). */
  now?: number;
}

export interface RateLimitResult {
  /** True if this hit is allowed; false if the bucket is exhausted. */
  allowed: boolean;
  /** Hits remaining in the current window after this call. */
  remaining: number;
  /** Wall-clock ms at which the current window resets. */
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  opts: RateLimitOpts,
): RateLimitResult {
  const now = opts.now ?? Date.now();
  const existing = store.get(key);

  // No bucket yet, OR existing bucket has expired -> start fresh.
  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + opts.windowMs };
    store.set(key, bucket);
    return {
      allowed: true,
      remaining: opts.max - 1,
      resetAt: bucket.resetAt,
    };
  }

  // Bucket alive — already exhausted?
  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  // Bucket alive, has room — count this hit.
  existing.count += 1;
  return {
    allowed: true,
    remaining: opts.max - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Wipe all buckets. Test-only — production code never calls this.
 */
export function resetRateLimitStore(): void {
  store.clear();
}
