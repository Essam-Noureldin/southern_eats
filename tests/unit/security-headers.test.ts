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
});
