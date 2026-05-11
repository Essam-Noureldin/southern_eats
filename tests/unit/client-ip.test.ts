/**
 * @jest-environment node
 *
 * WHAT: Unit tests for lib/client-ip — the helper that figures out a
 *       request's "real" IP from the forwarding headers a proxy/CDN
 *       inserts. Used as the key for our per-IP rate limiter.
 * WHY:  AI-shipped Next.js code commonly trusts the FIRST value of
 *       `x-forwarded-for`, which is whatever the client supplied.
 *       Attackers prepend a fake address and dodge the rate limiter.
 *       This test locks in the safer pattern: prefer `x-real-ip`
 *       (Vercel-set, client-uncontrollable), fall back to the LAST
 *       entry of `x-forwarded-for` (which is the IP Vercel itself
 *       appended). Audit finding A4 (2026-05-11).
 */
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/client-ip";

function reqWith(headers: Record<string, string>): NextRequest {
  return new NextRequest("http://localhost/", { headers });
}

describe("getClientIp", () => {
  it("prefers x-real-ip over x-forwarded-for", () => {
    const req = reqWith({
      "x-real-ip": "203.0.113.5",
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("ignores a client-spoofed prefix in x-forwarded-for", () => {
    // The attacker writes "1.2.3.4" as the first value; the trusted
    // proxy appends "203.0.113.5" as the last value. We must NOT
    // return 1.2.3.4 (the old, vulnerable behavior).
    const req = reqWith({ "x-forwarded-for": "1.2.3.4, 5.6.7.8, 203.0.113.5" });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("returns the single value when x-forwarded-for has only one entry", () => {
    const req = reqWith({ "x-forwarded-for": "203.0.113.5" });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("trims whitespace around forwarded values", () => {
    const req = reqWith({ "x-forwarded-for": " 1.2.3.4 ,  203.0.113.5 " });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("falls through empty entries to find the last real value", () => {
    const req = reqWith({ "x-forwarded-for": "1.2.3.4,  , 203.0.113.5,  " });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("returns 'unknown' when no forwarding headers are present", () => {
    const req = reqWith({});
    expect(getClientIp(req)).toBe("unknown");
  });

  it("returns 'unknown' when x-forwarded-for is whitespace only", () => {
    const req = reqWith({ "x-forwarded-for": "   , , " });
    expect(getClientIp(req)).toBe("unknown");
  });
});
