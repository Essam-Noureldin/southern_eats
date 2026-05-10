import { securityHeaders } from "@/lib/security-headers";

/**
 * WHAT: Unit test for the security headers config consumed by next.config.ts.
 * WHY:  Test-first per master prompt. Validates the headers array is shaped
 *       correctly and contains every required header before we wire it.
 *       Runtime regression test (headers actually shipped to clients,
 *       survives the withSentryConfig wrap) lives in feature-sentry.
 */
function headerValue(key: string): string | undefined {
  return securityHeaders.find(
    (h) => h.key.toLowerCase() === key.toLowerCase(),
  )?.value;
}

describe("security headers", () => {
  it("declares Content-Security-Policy with strict default-src", () => {
    const csp = headerValue("Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
  });

  it("whitelists Google Tag Manager and GA in script-src", () => {
    const csp = headerValue("Content-Security-Policy");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("https://www.google-analytics.com");
  });

  it("does NOT whitelist Google Fonts (next/font self-hosts)", () => {
    const csp = headerValue("Content-Security-Policy");
    expect(csp).not.toContain("fonts.googleapis.com");
    expect(csp).not.toContain("fonts.gstatic.com");
  });

  it("blocks framing via frame-src 'none' and X-Frame-Options DENY", () => {
    expect(headerValue("Content-Security-Policy")).toContain(
      "frame-src 'none'",
    );
    expect(headerValue("X-Frame-Options")).toBe("DENY");
  });

  it("sets X-Content-Type-Options nosniff", () => {
    expect(headerValue("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets a strict Referrer-Policy", () => {
    expect(headerValue("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("denies camera, microphone, and geolocation via Permissions-Policy", () => {
    const value = headerValue("Permissions-Policy");
    expect(value).toContain("camera=()");
    expect(value).toContain("microphone=()");
    expect(value).toContain("geolocation=()");
  });

  it("sets HSTS with includeSubDomains and preload", () => {
    const value = headerValue("Strict-Transport-Security");
    expect(value).toContain("max-age=63072000");
    expect(value).toContain("includeSubDomains");
    expect(value).toContain("preload");
  });

  it("does NOT include 'unsafe-eval' in production CSP", () => {
    // jest.isolateModules forces a fresh import so the module re-reads
    // process.env.NODE_ENV at load time. Critical: a stale top-level
    // import would have been frozen with NODE_ENV=test.
    jest.isolateModules(() => {
      const env = process.env as Record<string, string | undefined>;
      const original = env["NODE_ENV"];
      try {
        // Bracket-notation assignment sidesteps the @types/node readonly
        // declaration on NODE_ENV without an `as any` escape hatch.
        env["NODE_ENV"] = "production";
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { securityHeaders: prodHeaders } = require("@/lib/security-headers");
        const csp = prodHeaders.find(
          (h: { key: string; value: string }) =>
            h.key === "Content-Security-Policy",
        )?.value;
        expect(csp).not.toContain("'unsafe-eval'");
      } finally {
        env["NODE_ENV"] = original;
      }
    });
  });

  it("DOES include 'unsafe-eval' in development (so React's dev runtime works without CSP errors)", () => {
    jest.isolateModules(() => {
      const env = process.env as Record<string, string | undefined>;
      const original = env["NODE_ENV"];
      try {
        env["NODE_ENV"] = "development";
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { securityHeaders: devHeaders } = require("@/lib/security-headers");
        const csp = devHeaders.find(
          (h: { key: string; value: string }) =>
            h.key === "Content-Security-Policy",
        )?.value;
        expect(csp).toContain("'unsafe-eval'");
      } finally {
        env["NODE_ENV"] = original;
      }
    });
  });
});
