/**
 * WHAT: Unit tests for lib/rate-limit.ts — sliding-fixed-window rate limiter
 *       used by the contact-form server action.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - allows up to `max` hits per `windowMs`
 *       - blocks the (max+1)th hit and beyond until the window expires
 *       - keys are independent (one IP cannot exhaust another)
 *       - resets cleanly when the window has fully elapsed
 *       - exposes the time control via injected `now` (not Date.now mocks)
 *
 * COMMON MISTAKE: time-based tests that use real Date.now() / setTimeout —
 * flaky, slow. Inject `now` as a number into the API and the tests run in
 * microseconds with deterministic outcomes.
 */
import {
  checkRateLimit,
  resetRateLimitStore,
} from "@/lib/rate-limit";

const max = 3;
const windowMs = 10 * 60 * 1000; // 10 minutes
const opts = (now: number) => ({ max, windowMs, now });

beforeEach(() => {
  resetRateLimitStore();
});

describe("checkRateLimit", () => {
  it("allows the first hit and reports remaining", () => {
    const r = checkRateLimit("ip-a", opts(0));
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(max - 1);
    expect(r.resetAt).toBe(windowMs);
  });

  it("allows up to `max` hits in a window", () => {
    expect(checkRateLimit("ip-a", opts(0)).allowed).toBe(true);
    expect(checkRateLimit("ip-a", opts(1)).allowed).toBe(true);
    expect(checkRateLimit("ip-a", opts(2)).allowed).toBe(true);
  });

  it("blocks the (max+1)th hit", () => {
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    const r = checkRateLimit("ip-a", opts(0));
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("decrements `remaining` per hit until 0", () => {
    expect(checkRateLimit("ip-a", opts(0)).remaining).toBe(2);
    expect(checkRateLimit("ip-a", opts(0)).remaining).toBe(1);
    expect(checkRateLimit("ip-a", opts(0)).remaining).toBe(0);
    expect(checkRateLimit("ip-a", opts(0)).remaining).toBe(0); // already exhausted
  });

  it("isolates keys (one IP cannot exhaust another)", () => {
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    expect(checkRateLimit("ip-a", opts(0)).allowed).toBe(false);
    // ip-b is fresh
    expect(checkRateLimit("ip-b", opts(0)).allowed).toBe(true);
  });

  it("resets after the window expires", () => {
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    expect(checkRateLimit("ip-a", opts(0)).allowed).toBe(false);

    // Advance past the window — first hit in new window should pass.
    const r = checkRateLimit("ip-a", opts(windowMs + 1));
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(max - 1);
  });

  it("returns a sensible resetAt that moves with the window", () => {
    const r1 = checkRateLimit("ip-a", opts(100));
    expect(r1.resetAt).toBe(100 + windowMs);
    // resetAt stays the same throughout the same window
    const r2 = checkRateLimit("ip-a", opts(200));
    expect(r2.resetAt).toBe(100 + windowMs);
  });

  it("treats empty key as its own bucket (does not throw)", () => {
    expect(() => checkRateLimit("", opts(0))).not.toThrow();
  });
});

describe("resetRateLimitStore", () => {
  it("clears all keys", () => {
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    checkRateLimit("ip-a", opts(0));
    resetRateLimitStore();
    expect(checkRateLimit("ip-a", opts(0)).allowed).toBe(true);
  });
});
