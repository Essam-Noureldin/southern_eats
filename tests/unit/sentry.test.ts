/**
 * WHAT: Unit tests for lib/sentry.ts decision logic.
 * WHY:  shouldInitSentry() and getCspReportUrl() are tiny but load-bearing —
 *       they're the gate that decides whether Sentry runs at all. Test the
 *       gate in isolation so the framework hook files (instrumentation*.ts)
 *       can stay trivial.
 */
import { shouldInitSentry, getCspReportUrl } from "@/lib/sentry";

describe("lib/sentry", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  afterEach(() => {
    setNodeEnv(originalNodeEnv);
    process.env.NEXT_PUBLIC_SENTRY_DSN = originalDsn;
  });

  function setNodeEnv(v: string | undefined) {
    // Direct assignment — Object.defineProperty on process.env.NODE_ENV
    // in Jest+SWC does not propagate to subsequent reads.
    (process.env as Record<string, string | undefined>).NODE_ENV = v;
  }

  describe("shouldInitSentry", () => {
    it("returns false when DSN is missing in production", () => {
      setNodeEnv("production");
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      expect(shouldInitSentry()).toBe(false);
    });

    it("returns false when DSN is empty string in production", () => {
      setNodeEnv("production");
      process.env.NEXT_PUBLIC_SENTRY_DSN = "";
      expect(shouldInitSentry()).toBe(false);
    });

    it("returns false in development even with DSN set", () => {
      setNodeEnv("development");
      process.env.NEXT_PUBLIC_SENTRY_DSN =
        "https://abc@o123.ingest.sentry.io/456";
      expect(shouldInitSentry()).toBe(false);
    });

    it("returns false in test even with DSN set", () => {
      setNodeEnv("test");
      process.env.NEXT_PUBLIC_SENTRY_DSN =
        "https://abc@o123.ingest.sentry.io/456";
      expect(shouldInitSentry()).toBe(false);
    });

    it("returns true only in production with DSN set", () => {
      setNodeEnv("production");
      process.env.NEXT_PUBLIC_SENTRY_DSN =
        "https://abc@o123.ingest.sentry.io/456";
      expect(shouldInitSentry()).toBe(true);
    });
  });

  describe("getCspReportUrl", () => {
    it("returns null when Sentry would not init", () => {
      setNodeEnv("development");
      process.env.NEXT_PUBLIC_SENTRY_DSN =
        "https://abc@o123.ingest.sentry.io/456";
      expect(getCspReportUrl()).toBeNull();
    });

    it("returns null when DSN missing in production", () => {
      setNodeEnv("production");
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      expect(getCspReportUrl()).toBeNull();
    });

    it("returns a CSP report endpoint URL in production with DSN", () => {
      setNodeEnv("production");
      process.env.NEXT_PUBLIC_SENTRY_DSN =
        "https://abc@o123.ingest.sentry.io/456";
      const url = getCspReportUrl();
      expect(url).toBeTruthy();
      expect(url).toContain("sentry.io");
    });
  });
});
