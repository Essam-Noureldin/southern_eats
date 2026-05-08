/**
 * @jest-environment node
 *
 * WHAT: Integration tests for the POST /api/contact route handler.
 * WHY:  The route is the single point where rate-limit + sanitize +
 *       honeypot + timing trap + email all meet. The unit tests
 *       prove each piece works in isolation; this suite proves they
 *       compose correctly per the policy note (single signal alone
 *       must not silently drop; honeypot=hard block; too-fast=soft).
 */

jest.mock("@/lib/email", () => ({
  sendContactEmail: jest.fn().mockResolvedValue({ ok: true, mode: "stub" }),
}));

import { POST } from "@/app/api/contact/route";
import { resetRateLimitStore } from "@/lib/rate-limit";
import { sendContactEmail } from "@/lib/email";
import { getHoneypotFieldName, HONEYPOT_MIN_FILL_MS } from "@/lib/honeypot";

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  resetRateLimitStore();
  jest.clearAllMocks();
  process.env = {
    ...ORIGINAL_ENV,
    RATE_LIMIT_MAX: "3",
    RATE_LIMIT_WINDOW_MS: "600000",
  };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

function makeReq(
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "1.2.3.4",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Karen H.",
    email: "karen@example.com",
    message: "Hello from Karen — loved the shrimp.",
    renderedAt: Date.now() - (HONEYPOT_MIN_FILL_MS + 1000),
    [getHoneypotFieldName()]: "",
    ...overrides,
  };
}

describe("POST /api/contact — happy path", () => {
  it("accepts a valid submission and sends email", async () => {
    const res = await POST(makeReq(validPayload()) as never);
    expect(res.status).toBe(200);
    expect(sendContactEmail).toHaveBeenCalledTimes(1);
    const arg = (sendContactEmail as jest.Mock).mock.calls[0][0];
    expect(arg.name).toBe("Karen H.");
    expect(arg.email).toBe("karen@example.com");
  });
});

describe("POST /api/contact — validation", () => {
  it("rejects malformed JSON with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }) as never,
    );
    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it("rejects missing name with 400", async () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>).name;
    const res = await POST(makeReq(payload) as never);
    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it("rejects an invalid email shape with 400", async () => {
    const res = await POST(
      makeReq(validPayload({ email: "not-an-email" })) as never,
    );
    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it("rejects a too-short message with 400", async () => {
    const res = await POST(makeReq(validPayload({ message: "hi" })) as never);
    expect(res.status).toBe(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });
});

describe("POST /api/contact — honeypot (hard block)", () => {
  it("returns 200 fake success and does NOT send email when honeypot is filled", async () => {
    const res = await POST(
      makeReq(
        validPayload({ [getHoneypotFieldName()]: "https://spam.example" }),
      ) as never,
    );
    expect(res.status).toBe(200);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });
});

describe("POST /api/contact — rate limit", () => {
  it("429s the 4th submission from the same IP within the window", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await POST(makeReq(validPayload()) as never);
      expect(res.status).toBe(200);
    }
    const fourth = await POST(makeReq(validPayload()) as never);
    expect(fourth.status).toBe(429);
    expect(sendContactEmail).toHaveBeenCalledTimes(3);
  });

  it("limits per-IP — a different IP is unaffected", async () => {
    for (let i = 0; i < 3; i++) {
      await POST(makeReq(validPayload()) as never);
    }
    const otherIp = await POST(
      makeReq(validPayload(), { "x-forwarded-for": "9.9.9.9" }) as never,
    );
    expect(otherIp.status).toBe(200);
  });
});

describe("POST /api/contact — timing trap (soft signal — policy note)", () => {
  it("a too-fast submission alone is NOT silently dropped (fast paster)", async () => {
    const res = await POST(
      makeReq(validPayload({ renderedAt: Date.now() })) as never,
    );
    expect(res.status).toBe(200);
    expect(sendContactEmail).toHaveBeenCalledTimes(1);
  });

  it("too-fast + rate-limit-hit returns 429 (combined signal triggers drop)", async () => {
    // Fill the rate limit with normal submissions
    for (let i = 0; i < 3; i++) {
      await POST(makeReq(validPayload()) as never);
    }
    // Now try a too-fast submission while rate-limited
    const res = await POST(
      makeReq(validPayload({ renderedAt: Date.now() })) as never,
    );
    expect(res.status).toBe(429);
  });
});
