import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { securityHeaders } from "./lib/security-headers";

/**
 * WHAT: Next.js runtime config + security headers, wrapped with
 *       Sentry's build plugin (source-map upload, tunnel route, etc.).
 * WHY:  Headers apply to every response. Sourcing them from
 *       lib/security-headers keeps the values testable in isolation.
 *       The withSentryConfig wrap can silently drop the headers function
 *       if the SDK changes shape — tests/integration/api/security-headers
 *       is the regression guard against that.
 * IF REMOVED: site loses CSP/HSTS/etc., the standalone Docker output,
 *       and Sentry source maps.
 * COMMON MISTAKE: removing `silent: true` without setting SENTRY_AUTH_TOKEN —
 *       the build then prints noisy warnings about missing auth.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async headers() {
    return [
      {
        // Apply to all routes.
        source: "/(.*)",
        headers: securityHeaders.map((h) => ({ key: h.key, value: h.value })),
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress Sentry build-plugin output unless explicitly debugging.
  silent: true,
  // Source-map upload happens only when SENTRY_AUTH_TOKEN is set in env.
  // No token = no upload, but the wrap itself still runs (which is what
  // the regression test verifies).
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Disable telemetry pings to Sentry from the build plugin itself.
  telemetry: false,
});
