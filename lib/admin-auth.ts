/**
 * WHAT: Pure functions for parsing + verifying HTTP Basic Auth on the
 *       /admin route. Lives outside middleware.ts so it can be unit-
 *       tested without spinning up the Next.js edge runtime.
 * WHY:  Wrong credentials must be rejected without leaking which half
 *       (username or password) was wrong, and without leaking how many
 *       characters matched. Constant-time string compare + always
 *       checking both halves gives that property.
 * IF REMOVED: middleware.ts would have inline auth code that can't be
 *       tested in isolation; regressions in the timing-safe compare
 *       could ship undetected.
 * COMMON MISTAKE: using `a === b` (string compare). JS string equality
 *       short-circuits on the first non-matching byte, revealing the
 *       prefix length of a correct password to an attacker measuring
 *       request latency.
 */

/**
 * Constant-time string comparison.
 *
 * Equal-length and unequal-length strings both run the same loop count
 * (bounded by the longer string). XOR-folding the per-byte diff plus
 * the length-diff means a single integer summarises "any byte different
 * OR any length difference" — early-exit free.
 *
 * Note: this is weaker than Node's `crypto.timingSafeEqual` (which
 * requires equal-length Buffers and uses CPU-native constant-time
 * intrinsics), but Next.js middleware runs on the Edge runtime which
 * doesn't expose Node's `crypto.timingSafeEqual`. This implementation
 * is adequate for ~12-byte admin passwords. Don't repurpose for
 * comparing cryptographic MACs.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/**
 * Decodes an `Authorization: Basic <base64>` header and checks the
 * decoded `user:pass` against the expected credentials.
 *
 * Returns `"ok"` only when the header is well-formed AND both halves
 * match. Any other case (missing header, wrong scheme, malformed
 * base64, missing colon, wrong creds) returns `"unauthorized"` — same
 * response so the client can't distinguish which step failed.
 */
export function checkAdminAuth(
  authHeader: string | null,
  expectedUsername: string,
  expectedPassword: string,
): "ok" | "unauthorized" {
  if (!authHeader || !authHeader.startsWith("Basic ")) return "unauthorized";
  const encoded = authHeader.slice("Basic ".length).trim();
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return "unauthorized";
  }
  const colonIdx = decoded.indexOf(":");
  if (colonIdx === -1) return "unauthorized";
  const user = decoded.slice(0, colonIdx);
  const pass = decoded.slice(colonIdx + 1);
  // Important: evaluate BOTH compares before AND-ing the results. Doing
  // `userOk && passOk` would still short-circuit, but assigning to
  // locals first forces both calls to run regardless of the first
  // result — same total runtime whether user, pass, or both are wrong.
  const userOk = timingSafeStringEqual(user, expectedUsername);
  const passOk = timingSafeStringEqual(pass, expectedPassword);
  return userOk && passOk ? "ok" : "unauthorized";
}
