import type { NextConfig } from "next";

/**
 * WHAT: Next.js runtime config. Currently minimal — security headers,
 *       CSP whitelist, and Sentry wrap arrive in feature-headers / feature-sentry.
 * WHY:  Bootstrap branch keeps config to the bare minimum so each later
 *       feature branch produces a focused, reviewable diff.
 * IF REMOVED: Next falls back to defaults but we lose `output: "standalone"`,
 *       which the production Dockerfile depends on.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
