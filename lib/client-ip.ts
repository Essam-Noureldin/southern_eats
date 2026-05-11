/**
 * WHAT: Single source of truth for "what's this request's IP?" — used as
 *       the per-IP key for our rate limiter on /api/contact and /api/order.
 * WHY:  AI-shipped Next.js code routinely trusts the FIRST value of
 *       `x-forwarded-for`. That value is whatever the client supplied;
 *       attackers prepend a fake address ("1.2.3.4, <real>") and dodge
 *       the rate limiter by rotating the spoof. The safe pattern:
 *       1. Prefer `x-real-ip` — Vercel writes this itself and strips any
 *          client-supplied copy at the edge, so it's not spoofable.
 *       2. Otherwise fall back to the LAST entry of `x-forwarded-for`,
 *          which is the entry the trusted proxy (Vercel) appended last.
 *       On a self-hosted deployment without a trusted proxy, neither
 *       header is trustworthy, but `x-real-ip` is at least less common
 *       to be set by random clients.
 * IF REMOVED: rate limiter falls back to a single bucket (all "unknown")
 *       and any attacker can exhaust the contact-form / order-form budget.
 * COMMON MISTAKE: `xff.split(',')[0]` — the first value is the original
 *       client-claimed IP, the most spoofable position in the chain.
 */
import type { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  if (real && real.trim().length > 0) return real.trim();

  const fwd = req.headers.get("x-forwarded-for");
  if (!fwd) return "unknown";

  const parts = fwd
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) return "unknown";
  return parts[parts.length - 1] ?? "unknown";
}
