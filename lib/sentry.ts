/**
 * WHAT: Sentry init decision logic. shouldInitSentry() answers "do we
 *       actually run Sentry right now?" — only true in production with a
 *       DSN configured. getCspReportUrl() composes the Sentry CSP-reporting
 *       endpoint URL when applicable, or null when Sentry is dormant.
 * WHY:  Keeping this decision in a tiny pure module means the framework
 *       hook files (instrumentation.ts and instrumentation-client.ts) can
 *       stay one-liners that just call init() when this returns true.
 *       Tested in isolation. Same logic runs server- and client-side.
 * IF REMOVED: instrumentation files duplicate the env/NODE_ENV check
 *       across two files, and CSP report-uri logic in next.config.ts has
 *       to repeat it again — three places to keep in sync.
 * COMMON MISTAKE: reading env vars at module-load time. Read at call time
 *       so test cases can mutate process.env between assertions.
 */

export function shouldInitSentry(): boolean {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || dsn.length === 0) return false;
  return process.env.NODE_ENV === "production";
}

/**
 * Build the Sentry CSP report-to endpoint URL.
 *
 * Sentry's security-report URL is derived from the DSN: the DSN
 * "https://<key>@<host>/<projectId>" maps to a report endpoint at
 * "https://<host>/api/<projectId>/security/?sentry_key=<key>". Returning
 * null when Sentry isn't initialised keeps next.config.ts from emitting
 * a report-to header that points nowhere.
 */
export function getCspReportUrl(): string | null {
  if (!shouldInitSentry()) return null;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN!;
  try {
    const parsed = new URL(dsn);
    const key = parsed.username;
    const projectId = parsed.pathname.replace(/^\//, "");
    return `${parsed.protocol}//${parsed.host}/api/${projectId}/security/?sentry_key=${key}`;
  } catch {
    return null;
  }
}
