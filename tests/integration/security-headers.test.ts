/**
 * @jest-environment node
 *
 * WHAT: Regression guard — every security header survives the
 *       `withSentryConfig(...)` wrap in next.config.ts.
 * WHY:  The Sentry build plugin replaces the exported nextConfig with a
 *       wrapped object. A future SDK release could change wrap shape and
 *       silently drop fields like `headers`. Without this test, that
 *       failure ships to production undetected and the site loses CSP /
 *       X-Frame-Options / HSTS overnight.
 * IF REMOVED: no permanent guard against the wrap dropping headers.
 * COMMON MISTAKE: testing securityHeaders directly. That tests the source
 *       of truth — but the bug we're guarding is the wrap, so we have to
 *       reach through the wrapped config.
 */
import nextConfig from "@/next.config";
import { securityHeaders } from "@/lib/security-headers";

describe("next.config.ts withSentryConfig wrap", () => {
  it("preserves the headers() function", () => {
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("headers() still emits every security header", async () => {
    const result = await nextConfig.headers!();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    const allHeaders = result.flatMap((rule) => rule.headers);
    const keys = allHeaders.map((h) => h.key);

    for (const expected of securityHeaders) {
      expect(keys).toContain(expected.key);
    }
  });

  it("CSP header value still contains default-src 'self'", async () => {
    const result = await nextConfig.headers!();
    const allHeaders = result.flatMap((rule) => rule.headers);
    const csp = allHeaders.find((h) => h.key === "Content-Security-Policy");
    expect(csp).toBeTruthy();
    expect(csp!.value).toContain("default-src 'self'");
  });

  it("X-Frame-Options is still DENY", async () => {
    const result = await nextConfig.headers!();
    const allHeaders = result.flatMap((rule) => rule.headers);
    const xfo = allHeaders.find((h) => h.key === "X-Frame-Options");
    expect(xfo?.value).toBe("DENY");
  });

  it("HSTS still has 2-year max-age, includeSubDomains, preload", async () => {
    const result = await nextConfig.headers!();
    const allHeaders = result.flatMap((rule) => rule.headers);
    const hsts = allHeaders.find(
      (h) => h.key === "Strict-Transport-Security",
    );
    expect(hsts?.value).toContain("max-age=63072000");
    expect(hsts?.value).toContain("includeSubDomains");
    expect(hsts?.value).toContain("preload");
  });

  it("Rule covers all routes (source = /(.*))", async () => {
    const result = await nextConfig.headers!();
    expect(result.some((r) => r.source === "/(.*)")).toBe(true);
  });
});
