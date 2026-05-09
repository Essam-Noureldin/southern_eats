/**
 * WHAT: Next.js browser-side instrumentation hook. Runs once on client
 *       app startup. Initialises Sentry in the browser when conditions allow.
 * WHY:  Captures uncaught browser errors, unhandled promise rejections,
 *       and client-side route errors. Decision (should we even init?)
 *       lives in lib/sentry so this stays trivial.
 * IF REMOVED: client-side errors never reach Sentry.
 * COMMON MISTAKE: putting `Sentry.init` at module top level. Doing so
 *       runs init even when the gate would have refused. Always gate first.
 */
import * as Sentry from "@sentry/nextjs";
import { shouldInitSentry } from "./lib/sentry";

if (shouldInitSentry()) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

// Required export for navigation transactions in App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
