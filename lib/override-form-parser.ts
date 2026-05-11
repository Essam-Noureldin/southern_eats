/**
 * WHAT: Pure FormData → LocationOverride parser shared between the
 *       /admin/[id] server action and its unit tests.
 * WHY:  Lives outside `app/admin/actions.ts` because that file is
 *       marked `"use server"` — Next.js only allows async exports
 *       there, so synchronous helpers move out. Keeping the parser
 *       pure also lets tests drive the regex + zod validation without
 *       touching the KV store.
 * IF REMOVED: form validation would have to be re-implemented in the
 *       action body and would drift from any test fixture.
 * COMMON MISTAKE: making the parser permissive ("good enough, server
 *       will refuse bad data anyway"). The parser IS the server's
 *       refuse-bad-data step — strict regex + zod are load-bearing.
 */
import { z } from "zod";
import type { Hours } from "./locations";
import type { LocationOverride } from "./location-overrides";

// Accepts 00:00..23:59 plus the special-case 24:00 (used as a midnight
// close time in lib/locations.ts). Rejects 24:01, 24:30, etc.
const TIME_RE = /^(?:([01]\d|2[0-3]):[0-5]\d|24:00)$/;

export const DAYS: Hours["day"][] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const phoneSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const dayRowSchema = z.object({
  closed: z.boolean(),
  open: z.string().max(5),
  close: z.string().max(5),
});

const formSchema = z.object({
  phone: phoneSchema,
  days: z.record(z.string(), dayRowSchema),
});

export type ParseResult =
  | { ok: true; fields: Partial<Omit<LocationOverride, "updatedAt">> }
  | { ok: false; error: string };

export function parseOverrideForm(input: {
  phone: unknown;
  days: Record<string, unknown>;
}): ParseResult {
  const parsed = formSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid form input — check field types",
    };
  }
  const hours: Hours[] = [];
  for (const day of DAYS) {
    const row = parsed.data.days[day];
    if (!row || row.closed) continue;
    if (!row.open || !row.close) continue;
    // Validate time format here so a malformed HH:MM rejects the whole
    // submit rather than silently dropping the day.
    if (!TIME_RE.test(row.open) || !TIME_RE.test(row.close)) {
      return {
        ok: false,
        error: `Invalid time on ${day} — expected HH:MM (e.g. 10:00)`,
      };
    }
    hours.push({ day, open: row.open, close: row.close });
  }
  return {
    ok: true,
    fields: {
      phone: parsed.data.phone,
      hours: hours.length > 0 ? hours : undefined,
    },
  };
}
