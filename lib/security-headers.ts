/**
 * WHAT: Security header config consumed by next.config.ts headers().
 * WHY:  Layered defence. Browsers honour these headers before any of
 *       our application code runs — they're cheaper and harder to bypass
 *       than runtime checks.
 * IF REMOVED: site is exposed to clickjacking (no X-Frame-Options),
 *       MIME-sniffing attacks (no X-Content-Type-Options), unrestricted
 *       script execution (no CSP), and downgrade attacks (no HSTS).
 * COMMON MISTAKE: adding 'unsafe-eval' to script-src to silence a CSP
 *       violation in dev — that defeats the entire CSP for production users.
 */

/**
 * Content Security Policy directives.
 *
 * NO Google Fonts entries — `next/font/google` self-hosts at build time.
 * `report-to` is intentionally NOT set here; it's gated on
 * NEXT_PUBLIC_SENTRY_DSN being present and wired up in feature-sentry.
 */
const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-inline' on script-src is required for Next.js inline bootstrap
  // scripts; nonces would be cleaner but require dynamic rendering.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: https://www.google-analytics.com",
  "connect-src 'self' https://www.google-analytics.com https://o*.ingest.sentry.io",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

const cspHeader = cspDirectives.join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
] as const;
