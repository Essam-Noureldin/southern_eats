/**
 * WHAT: Bot-trap helpers for the contact form. Two layers:
 *       1) honeypot field: a hidden input real humans never fill in.
 *          Any value submitted means the request is from a dumb bot.
 *       2) timing trap: real humans take at least a couple seconds to
 *          fill a form. Sub-second submissions are bot-fast.
 * WHY:  These complement (not replace) the rate limiter. Rate limit
 *       caps volume; honeypot blocks single-shot bots that submit once
 *       per IP to evade rate limits. Together they handle 95%+ of
 *       contact-form spam without bothering real users with CAPTCHA.
 * IF REMOVED: contact form is wide open to single-submission spam from
 *       any of the millions of "scrape every form on the web" bots.
 * COMMON MISTAKE: failing loudly when a bot is detected. Show the bot
 *       a fake success and silently drop the message — that's how you
 *       avoid them adapting around the trap.
 *
 * POLICY NOTE (re: real users who copy-paste fast): this module only
 *       *reports* signals. The contact-form server action decides what
 *       to do with them. A *single* signal alone — especially timing —
 *       must NOT silently drop the message. Treat honeypot-triggered as
 *       a hard block; treat too-fast as a soft block only when combined
 *       with another signal (rate-limit hit, suspicious payload, etc.)
 *       so a fast paster still gets through.
 */

/**
 * Field name used for both the hidden form input and the server-side
 * payload key. Single source of truth so they never drift apart.
 *
 * Kept generic-sounding ("website_url") because dumb bots use field
 * names to decide what to fill in — a field literally named "honeypot"
 * gets skipped, but "website_url" looks like a normal field worth filling.
 */
const HONEYPOT_FIELD_NAME = "website_url";

/**
 * Minimum number of ms between page render and form submit. A real human
 * filling out name/email/message takes a few seconds; bots submit in
 * single-digit milliseconds. 2000ms is a forgiving floor.
 */
export const HONEYPOT_MIN_FILL_MS = 2000;

export function getHoneypotFieldName(): string {
  return HONEYPOT_FIELD_NAME;
}

/**
 * Returns true if the honeypot field has been filled with anything
 * meaningful. Whitespace-only values are NOT treated as triggered —
 * could be a stray paste from a real user, not worth losing the lead.
 */
export function isHoneypotTriggered(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value !== "string") return true; // defensive — non-string at all is suspicious
  return value.trim().length > 0;
}

/**
 * Returns true if the form was submitted impossibly fast after render.
 * If renderedAt is missing/invalid, we cannot prove the user took time —
 * fail closed and treat as too fast.
 */
export function isSubmissionTooFast(
  submittedAt: number,
  renderedAt: number,
  minMs: number = HONEYPOT_MIN_FILL_MS,
): boolean {
  if (typeof renderedAt !== "number" || !Number.isFinite(renderedAt))
    return true;
  if (typeof submittedAt !== "number" || !Number.isFinite(submittedAt))
    return true;
  const gap = submittedAt - renderedAt;
  if (gap < 0) return true; // submitted before rendered — clock skew or replay
  return gap < minMs;
}
