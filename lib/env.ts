/**
 * WHAT: Typed, validated environment-variable module. Single source of truth
 *       for every env var the app reads. Rest of the app imports `env` from
 *       here — never `process.env` directly.
 * WHY:  Env vars are strings-or-undefined by default, with no shape contract.
 *       Without validation, a missing or malformed var fails silently at
 *       runtime hours later. With this module, missing required vars crash
 *       the server immediately at startup with a clear zod error pointing
 *       at exactly which var is wrong.
 * IF REMOVED: every API route, every server component, every config file
 *       reads process.env directly with no type safety, no validation, no
 *       central place to see what env vars exist.
 * COMMON MISTAKE: importing process.env elsewhere "just for one variable."
 *       Always add it here first, then import { env } from "@/lib/env".
 */
import { z } from "zod";

/**
 * Optional string that treats empty string as "not set."
 *
 * Why: env files sometimes have `RESEND_API_KEY=` with no value. That comes
 * through as an empty string, but semantically it means "feature disabled."
 * Coercing to undefined here keeps the rest of the app's checks simple
 * (`if (env.RESEND_API_KEY) { ... }`).
 */
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const envSchema = z.object({
  // Required ------------------------------------------------------------
  NEXT_PUBLIC_SITE_URL: z.url(),
  CONTACT_FORM_TO_EMAIL: z.email(),
  // z.coerce.number() turns the string "3" into the number 3. .int() and
  // .positive() reject 0, negatives, and NaN.
  RATE_LIMIT_MAX: z.coerce.number().int().positive(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive(),
  // Env vars are strings, so we accept the literal strings "true"/"false"
  // and transform to a real boolean. z.enum rejects anything else (e.g. "1").
  COOKIE_CONSENT_REQUIRED: z
    .enum(["true", "false"])
    .transform((v) => v === "true"),

  // Optional — empty/missing means feature dormant ----------------------
  NEXT_PUBLIC_GA_ID: optionalString,
  NEXT_PUBLIC_SENTRY_DSN: optionalString,
  RESEND_API_KEY: optionalString,
  CONTACT_FORM_FROM_EMAIL: optionalString,
});

export type Env = z.infer<typeof envSchema>;

/**
 * Pure validator. Takes an object (typically process.env), returns a parsed
 * typed Env, or throws ZodError listing every problem.
 *
 * Exposed separately so tests can drive it with controlled input instead of
 * fighting jest's module cache to mutate process.env between tests.
 */
export function validateEnv(input: Record<string, string | undefined>): Env {
  return envSchema.parse(input);
}

/**
 * Load env at module-load time.
 *
 * In tests we skip validation: the test runner doesn't have the real
 * required vars set, and forcing it to would mean any test that
 * transitively imports any module that imports lib/env (i.e. most of the
 * app) would crash at suite load. The cast to Env is a deliberate lie —
 * test code that actually reads from `env` should call validateEnv with
 * a fixture instead of relying on the global `env` export.
 */
function loadEnv(): Env {
  if (process.env.NODE_ENV === "test") {
    return process.env as unknown as Env;
  }
  return validateEnv(process.env);
}

export const env = loadEnv();
