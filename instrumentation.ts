/**
 * WHAT: Next.js server-side instrumentation hook. Runs once on server
 *       startup. Initialises Sentry on the server when conditions allow.
 * WHY:  Next 15+ moved Sentry server init from `sentry.server.config.ts`
 *       into the framework-native `register()` hook here. Decision
 *       (should we even init?) lives in lib/sentry so this stays trivial.
 * IF REMOVED: server-side errors never reach Sentry.
 * COMMON MISTAKE: import @sentry/nextjs at the top level. The dynamic
 *       import below ensures the SDK is only resolved when actually used,
 *       so build-time analysis stays clean.
 */
import { shouldInitSentry } from "./lib/sentry";

export async function register() {
  if (!shouldInitSentry()) return;

  // Next.js sets NEXT_RUNTIME to "nodejs" or "edge". Sentry needs
  // different init paths for each.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}
