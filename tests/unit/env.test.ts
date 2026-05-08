/**
 * WHAT: Unit tests for lib/env.ts — the typed environment module.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - required vars are required (validateEnv throws on missing)
 *       - optional vars stay optional (validateEnv accepts undefined)
 *       - numeric vars come out as numbers (env strings get coerced)
 *       - boolean vars come out as booleans
 *       - the validation is skipped when NODE_ENV === "test" so test-time
 *         imports of any module that transitively imports lib/env do not
 *         crash on missing required vars.
 *
 * COMMON MISTAKE: testing env modules by mutating process.env and re-importing.
 * That fights jest's module cache. We expose a pure `validateEnv(input)`
 * function and pass controlled objects to it instead.
 */
import { validateEnv } from "@/lib/env";

const validInput = {
  NEXT_PUBLIC_SITE_URL: "https://samssoutherneatery.com",
  CONTACT_FORM_TO_EMAIL: "owner@example.com",
  RATE_LIMIT_MAX: "3",
  RATE_LIMIT_WINDOW_MS: "600000",
  COOKIE_CONSENT_REQUIRED: "true",
};

describe("validateEnv", () => {
  it("returns a typed env object when all required vars are present", () => {
    const env = validateEnv(validInput);
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://samssoutherneatery.com");
    expect(env.CONTACT_FORM_TO_EMAIL).toBe("owner@example.com");
  });

  it("coerces RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS to numbers", () => {
    const env = validateEnv(validInput);
    expect(env.RATE_LIMIT_MAX).toBe(3);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(600000);
    expect(typeof env.RATE_LIMIT_MAX).toBe("number");
    expect(typeof env.RATE_LIMIT_WINDOW_MS).toBe("number");
  });

  it("coerces COOKIE_CONSENT_REQUIRED to a boolean", () => {
    expect(validateEnv({ ...validInput, COOKIE_CONSENT_REQUIRED: "true" }).COOKIE_CONSENT_REQUIRED).toBe(true);
    expect(validateEnv({ ...validInput, COOKIE_CONSENT_REQUIRED: "false" }).COOKIE_CONSENT_REQUIRED).toBe(false);
  });

  it("treats NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_SENTRY_DSN, RESEND_API_KEY, CONTACT_FORM_FROM_EMAIL as optional", () => {
    const env = validateEnv(validInput);
    expect(env.NEXT_PUBLIC_GA_ID).toBeUndefined();
    expect(env.NEXT_PUBLIC_SENTRY_DSN).toBeUndefined();
    expect(env.RESEND_API_KEY).toBeUndefined();
    expect(env.CONTACT_FORM_FROM_EMAIL).toBeUndefined();
  });

  it("passes through optional vars when provided", () => {
    const env = validateEnv({
      ...validInput,
      NEXT_PUBLIC_GA_ID: "G-XXXXXXX",
      NEXT_PUBLIC_SENTRY_DSN: "https://abc@o0.ingest.sentry.io/1",
      RESEND_API_KEY: "re_test_123",
      CONTACT_FORM_FROM_EMAIL: "noreply@example.com",
    });
    expect(env.NEXT_PUBLIC_GA_ID).toBe("G-XXXXXXX");
    expect(env.NEXT_PUBLIC_SENTRY_DSN).toBe("https://abc@o0.ingest.sentry.io/1");
    expect(env.RESEND_API_KEY).toBe("re_test_123");
    expect(env.CONTACT_FORM_FROM_EMAIL).toBe("noreply@example.com");
  });

  it("treats empty strings on optional vars as not set", () => {
    const env = validateEnv({
      ...validInput,
      NEXT_PUBLIC_GA_ID: "",
      RESEND_API_KEY: "",
    });
    expect(env.NEXT_PUBLIC_GA_ID).toBeUndefined();
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  it.each([
    "NEXT_PUBLIC_SITE_URL",
    "CONTACT_FORM_TO_EMAIL",
    "RATE_LIMIT_MAX",
    "RATE_LIMIT_WINDOW_MS",
    "COOKIE_CONSENT_REQUIRED",
  ])("throws when required var %s is missing", (key) => {
    const broken = { ...validInput } as Record<string, string | undefined>;
    delete broken[key];
    expect(() => validateEnv(broken)).toThrow();
  });

  it.each([
    "NEXT_PUBLIC_SITE_URL",
    "CONTACT_FORM_TO_EMAIL",
  ])("throws when required var %s is an empty string", (key) => {
    const broken = { ...validInput, [key]: "" };
    expect(() => validateEnv(broken)).toThrow();
  });

  it("throws when NEXT_PUBLIC_SITE_URL is not a valid URL", () => {
    expect(() => validateEnv({ ...validInput, NEXT_PUBLIC_SITE_URL: "not-a-url" })).toThrow();
  });

  it("throws when CONTACT_FORM_TO_EMAIL is not a valid email", () => {
    expect(() => validateEnv({ ...validInput, CONTACT_FORM_TO_EMAIL: "not-an-email" })).toThrow();
  });

  it("throws when RATE_LIMIT_MAX is not a positive integer", () => {
    expect(() => validateEnv({ ...validInput, RATE_LIMIT_MAX: "0" })).toThrow();
    expect(() => validateEnv({ ...validInput, RATE_LIMIT_MAX: "-1" })).toThrow();
    expect(() => validateEnv({ ...validInput, RATE_LIMIT_MAX: "banana" })).toThrow();
  });
});

describe("env module", () => {
  it("exports the env object without crashing under NODE_ENV=test", async () => {
    const mod = await import("@/lib/env");
    expect(mod).toHaveProperty("env");
    expect(mod).toHaveProperty("validateEnv");
  });
});
