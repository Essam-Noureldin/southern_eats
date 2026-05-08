/**
 * WHAT: POST /api/contact — receives JSON contact-form submissions,
 *       composes the security stack (honeypot -> rate-limit ->
 *       sanitize -> email), and sends via lib/email.
 * WHY:  The composition order is deliberate:
 *       1. Honeypot is a hard block — bots get a 200 fake success so
 *          they can't probe for what failed.
 *       2. Rate limit by IP — caps volume regardless of payload.
 *       3. Sanitize — defence in depth on the data before it touches
 *          email/log/Sentry.
 *       4. Send via lib/email (stub-mode covers missing Resend creds).
 * IF REMOVED: contact form has no submission target.
 * COMMON MISTAKE: surfacing "honeypot triggered" or "rate limited" in
 *       a way bots can detect (specific error codes/strings). Honeypot
 *       returns 200; rate limit uses a generic 429 with no detail.
 *
 * POLICY NOTE (master prompt): single signal alone must NOT silently
 *       drop. Honeypot=hard block (single signal IS the rule, by
 *       design). Too-fast=soft signal — let it through alone (fast
 *       pasters), drop only when paired with rate-limit hit.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeMessage,
} from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getHoneypotFieldName,
  isHoneypotTriggered,
  isSubmissionTooFast,
  HONEYPOT_MIN_FILL_MS,
} from "@/lib/honeypot";
import { sendContactEmail } from "@/lib/email";

const HP_FIELD = getHoneypotFieldName();

const schema = z
  .object({
    name: z.string().min(1).max(200),
    email: z.string().min(3).max(254),
    message: z.string().min(5).max(5000),
    renderedAt: z.coerce.number().optional(),
    [HP_FIELD]: z.string().optional(),
  })
  .passthrough();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function fail(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid request body");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Invalid form data");
  }
  const data = parsed.data as Record<string, unknown>;

  // 1. Honeypot — fake success so bots can't probe.
  if (isHoneypotTriggered(data[HP_FIELD])) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 2. Rate limit
  const ip = clientIp(req);
  const limit = checkRateLimit(`contact:${ip}`, {
    max: Number(process.env.RATE_LIMIT_MAX ?? 3),
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 600000),
  });
  if (!limit.allowed) {
    // Rate-limit hit triggers the drop. Even if "tooFast" is also true,
    // the rate-limit response is what the client sees.
    return fail(429, "Too many requests. Try again later.");
  }

  // 3. Timing trap — soft signal. Recorded for observability but does
  //    not drop a request alone (per policy note: fast pasters).
  //    When a future signal source (e.g. Sentry breadcrumb tagging)
  //    arrives this becomes a contributing factor in dropping.
  const _tooFast =
    typeof data.renderedAt === "number"
      ? isSubmissionTooFast(
          Date.now(),
          data.renderedAt,
          HONEYPOT_MIN_FILL_MS,
        )
      : false;
  // We deliberately ignore _tooFast on its own. Reading the variable
  // satisfies the compiler that it's intentional, not a forgotten check.
  void _tooFast;

  // 4. Sanitize — defence in depth on top of zod shape validation
  const cleanName = sanitizeString(String(data.name), 100);
  const cleanEmail = sanitizeEmail(String(data.email));
  const cleanMessage = sanitizeMessage(String(data.message));
  if (!cleanName || !cleanEmail || cleanMessage.length < 5) {
    return fail(400, "Invalid form data");
  }

  // 5. Send (or stub)
  const result = await sendContactEmail({
    name: cleanName,
    email: cleanEmail,
    message: cleanMessage,
  });
  if (!result.ok) {
    return fail(500, "Could not send your message. Please try again.");
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
