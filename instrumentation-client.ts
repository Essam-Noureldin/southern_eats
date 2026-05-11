/**
 * WHAT: Next.js browser-side instrumentation hook. Runs once on client
 *       app startup. Initialises Sentry in the browser when conditions allow.
 * WHY:  Captures uncaught browser errors, unhandled promise rejections,
 *       and client-side route errors. Decision (should we even init?)
 *       lives in lib/sentry so this stays trivial.
 * IF REMOVED: client-side errors never reach Sentry.
 *
 * A2 hardening (2026-05-11): the @sentry/nextjs SDK is ~50 KB minified.
 *       Previously a top-level `import * as Sentry` shipped it to every
 *       visitor — even on the speculative deploy where DSN is empty and
 *       shouldInitSentry() returns false. Now wrapped in a dynamic
 *       import() inside the gate, so when DSN is empty the bundler can
 *       tree-shake the SDK out of the initial chunk entirely.
 *
 * COMMON MISTAKE: putting `Sentry.init` at module top level. Doing so runs
 *       init even when the gate would have refused — AND forces the SDK
 *       into every visitor's bundle.
 */
import { shouldInitSentry } from "./lib/sentry";

// Type of Next 16's router-transition hook. We export a stable function
// reference that delegates to the real Sentry hook once the SDK has
// finished loading; before that, calls are no-ops.
type TransitionHook = (...args: unknown[]) => void;

let realHook: TransitionHook = () => {};

if (shouldInitSentry()) {
  // Dynamic import: the SDK lives in its own chunk that the bundler
  // only emits because this branch references it. When the gate refuses
  // (DSN empty), this entire branch is dead and the SDK chunk never
  // ships to the client.
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
    realHook = Sentry.captureRouterTransitionStart as TransitionHook;
  });
}

// Always exported so Next can call it on every route transition.
// Delegates to Sentry once loaded; no-op until then (or forever, if
// the gate refused).
export const onRouterTransitionStart: TransitionHook = (...args) => {
  realHook(...args);
};
