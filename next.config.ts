import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

/**
 * WHAT: Next.js runtime config + security headers.
 * WHY:  Headers apply to every response. Sourcing them from
 *       lib/security-headers keeps the values testable in isolation.
 *       Sentry wrap arrives in feature-sentry; the regression test there
 *       proves headers survive the wrap.
 * IF REMOVED: site loses CSP/HSTS/etc. and the standalone Docker output.
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

export default nextConfig;
