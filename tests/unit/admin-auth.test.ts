/**
 * WHAT: Unit tests for lib/admin-auth.ts — Basic Auth header parsing,
 *       timing-safe compare, and the verdict surface.
 * WHY:  This is the entire trust boundary for /admin. A bug here means
 *       either nobody can log in (annoying) or anybody can (catastrophic).
 *       Tested in isolation so we don't have to spin the Edge runtime.
 */
import { checkAdminAuth, timingSafeStringEqual } from "@/lib/admin-auth";

const USER = "admin";
const PASS = "correct-horse-battery-staple";

function basicHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

describe("timingSafeStringEqual", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeStringEqual("abc", "abc")).toBe(true);
  });

  it("returns true for two empty strings", () => {
    expect(timingSafeStringEqual("", "")).toBe(true);
  });

  it("returns false when one is a prefix of the other", () => {
    expect(timingSafeStringEqual("abc", "abcd")).toBe(false);
    expect(timingSafeStringEqual("abcd", "abc")).toBe(false);
  });

  it("returns false on a single mid-string byte difference", () => {
    expect(timingSafeStringEqual("abcdef", "abcXef")).toBe(false);
  });

  it("returns false comparing empty with non-empty", () => {
    expect(timingSafeStringEqual("", "x")).toBe(false);
    expect(timingSafeStringEqual("x", "")).toBe(false);
  });
});

describe("checkAdminAuth", () => {
  it("returns ok for correct credentials", () => {
    expect(checkAdminAuth(basicHeader(USER, PASS), USER, PASS)).toBe("ok");
  });

  it("returns unauthorized for a null header", () => {
    expect(checkAdminAuth(null, USER, PASS)).toBe("unauthorized");
  });

  it("returns unauthorized for an empty header", () => {
    expect(checkAdminAuth("", USER, PASS)).toBe("unauthorized");
  });

  it("returns unauthorized for a non-Basic scheme", () => {
    expect(checkAdminAuth("Bearer xyz", USER, PASS)).toBe("unauthorized");
  });

  it("returns unauthorized for malformed base64", () => {
    expect(checkAdminAuth("Basic !!!not-base64!!!", USER, PASS)).toBe(
      "unauthorized",
    );
  });

  it("returns unauthorized when the decoded payload has no colon", () => {
    const encoded = Buffer.from("nocolonatall").toString("base64");
    expect(checkAdminAuth(`Basic ${encoded}`, USER, PASS)).toBe("unauthorized");
  });

  it("returns unauthorized for wrong username", () => {
    expect(checkAdminAuth(basicHeader("attacker", PASS), USER, PASS)).toBe(
      "unauthorized",
    );
  });

  it("returns unauthorized for wrong password", () => {
    expect(checkAdminAuth(basicHeader(USER, "wrong"), USER, PASS)).toBe(
      "unauthorized",
    );
  });

  it("returns unauthorized when both are wrong", () => {
    expect(checkAdminAuth(basicHeader("attacker", "wrong"), USER, PASS)).toBe(
      "unauthorized",
    );
  });

  it("accepts passwords containing colons (only the first colon splits)", () => {
    const pass = "with:colon:inside";
    expect(checkAdminAuth(basicHeader(USER, pass), USER, pass)).toBe("ok");
  });
});
