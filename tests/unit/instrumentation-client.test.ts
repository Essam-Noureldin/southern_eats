/**
 * WHAT: Unit tests for instrumentation-client.ts. Proves that the
 *       Sentry SDK is NOT imported at module load when shouldInitSentry()
 *       returns false. Without this gate, the SDK ships ~50 KB of
 *       browser code to every visitor on the speculative (DSN-empty)
 *       deploy.
 * WHY:  Audit finding A2 (2026-05-11). The previous file had a top-level
 *       `import * as Sentry` which the bundler always includes. The fix
 *       is a guarded dynamic `import("@sentry/nextjs")` so Turbopack /
 *       Webpack can code-split it out when the gate refuses.
 */

const sentryImportTracker = jest.fn();

jest.mock("@sentry/nextjs", () => {
  sentryImportTracker();
  return {
    init: jest.fn(),
    captureRouterTransitionStart: jest.fn(),
  };
});

const mockShouldInitSentry = jest.fn();
jest.mock("@/lib/sentry", () => ({
  shouldInitSentry: () => mockShouldInitSentry(),
}));

beforeEach(() => {
  jest.resetModules();
  sentryImportTracker.mockClear();
  mockShouldInitSentry.mockReset();
});

describe("instrumentation-client (A2 — gated Sentry import)", () => {
  it("does NOT import @sentry/nextjs when shouldInitSentry() returns false", async () => {
    mockShouldInitSentry.mockReturnValue(false);
    // Loading the module must not trigger any access to the Sentry
    // module — that's the whole point of the dynamic-import gate.
    await import("@/instrumentation-client");
    // Give any microtasks a chance to flush in case the gate wrongly
    // queues an import behind a .then().
    await new Promise((r) => setTimeout(r, 0));
    expect(sentryImportTracker).not.toHaveBeenCalled();
  });

  it("imports @sentry/nextjs when shouldInitSentry() returns true", async () => {
    mockShouldInitSentry.mockReturnValue(true);
    await import("@/instrumentation-client");
    // The import happens inside a Promise chain; allow it to resolve.
    await new Promise((r) => setTimeout(r, 0));
    expect(sentryImportTracker).toHaveBeenCalled();
  });

  it("always exports onRouterTransitionStart (no-op until SDK loads)", async () => {
    mockShouldInitSentry.mockReturnValue(false);
    const mod = await import("@/instrumentation-client");
    expect(typeof mod.onRouterTransitionStart).toBe("function");
    // Calling it must not throw even when Sentry was never loaded.
    expect(() => mod.onRouterTransitionStart("/from", "/to", "push")).not.toThrow();
  });
});
