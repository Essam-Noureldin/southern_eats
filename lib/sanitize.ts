/**
 * WHAT: Server-side input sanitisers used on every contact-form payload.
 * WHY:  Defence-in-depth on top of the form's zod validation. zod proves
 *       the input is the right *shape*; these helpers strip dangerous
 *       *content* (HTML tags, control chars, header-injection sequences)
 *       and enforce length caps. Cheap and idempotent — safe to apply
 *       even if the input is already clean.
 * IF REMOVED: contact-form payloads flow into emails, logs, and Sentry
 *       breadcrumbs unscrubbed. Risks: email header injection, log
 *       injection, oversize-message DoS, second-order XSS if input ever
 *       gets rendered back into HTML.
 * COMMON MISTAKE: trying to use DOMPurify here. DOMPurify needs a DOM,
 *       which doesn't exist server-side without jsdom (heavy + slow).
 *       Plain string-level scrubbing is enough for short form fields.
 */

const HTML_TAG_RE = /<[^>]*>/g;
// Strip all C0 control characters and DEL.
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/g;
// Same, but keep \n (0x0A) and \t (0x09) — for free-form messages.
const CONTROL_CHARS_KEEP_NEWLINES_RE = /[\x00-\x08\x0B-\x1F\x7F]/g;

const DEFAULT_STRING_MAX = 1000;
const DEFAULT_MESSAGE_MAX = 5000;
const EMAIL_MAX_LENGTH = 254; // RFC 5321 §4.5.3.1
// Loose RFC-flavoured pattern. Real validation belongs in zod / form layer;
// this just confirms the post-scrub string still looks like an email.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sanitize a single-line string field (name, subject, etc.).
 * Strips HTML, strips control chars, collapses whitespace, trims, caps length.
 */
export function sanitizeString(
  input: string,
  maxLength: number = DEFAULT_STRING_MAX,
): string {
  if (typeof input !== "string") return "";
  return input
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_CHARS_RE, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize an email address.
 * Strips HTML and ALL whitespace/controls (defends against header injection),
 * lowercases, caps at RFC max length, then validates loose shape.
 * Returns null for anything that no longer looks like an email.
 */
export function sanitizeEmail(input: string): string | null {
  if (typeof input !== "string" || input.length === 0) return null;
  const cleaned = input
    .replace(HTML_TAG_RE, "")
    .replace(/\s/g, "") // remove EVERY whitespace char including \r \n \t
    .replace(CONTROL_CHARS_RE, "")
    .toLowerCase();
  if (cleaned.length === 0 || cleaned.length > EMAIL_MAX_LENGTH) return null;
  if (!EMAIL_RE.test(cleaned)) return null;
  return cleaned;
}

/**
 * Sanitize a multi-line message field. Same rules as sanitizeString but
 * preserves newlines and tabs so paragraph structure survives.
 */
export function sanitizeMessage(
  input: string,
  maxLength: number = DEFAULT_MESSAGE_MAX,
): string {
  if (typeof input !== "string") return "";
  return input
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_CHARS_KEEP_NEWLINES_RE, "")
    .trim()
    .slice(0, maxLength);
}
