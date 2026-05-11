/**
 * @jest-environment node
 *
 * WHAT: Integration tests for POST /api/order — the in-house order
 *       submission endpoint. Mirrors the structure of contact.test.ts
 *       (honeypot, rate-limit, sanitize, send) plus the order-specific
 *       contract: cart line validation, server-computed totals,
 *       location lookup, summary returned in the response body.
 * WHY:  This endpoint accepts unauthenticated user input and triggers
 *       an email send. Every defence layer needs an integration test
 *       so a future refactor that drops one fails loudly here.
 */

jest.mock("@/lib/email", () => ({
  sendContactEmail: jest.fn().mockResolvedValue({ ok: true, mode: "stub" }),
  sendOrderEmail: jest.fn().mockResolvedValue({ ok: true, mode: "stub" }),
}));

import { POST } from "@/app/api/order/route";
import { resetRateLimitStore } from "@/lib/rate-limit";
import { sendOrderEmail } from "@/lib/email";
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
  return new Request("http://localhost/api/order", {
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
    locationId: "shreveport-greenwood-rd-la",
    lines: [{ id: "fried-green-tomatoes", qty: 2 }],
    name: "Karen Holiday",
    phone: "(318) 555-0199",
    pickupTime: "2026-05-12T18:30",
    renderedAt: Date.now() - (HONEYPOT_MIN_FILL_MS + 1000),
    [getHoneypotFieldName()]: "",
    ...overrides,
  };
}

describe("POST /api/order — happy path", () => {
  it("accepts a valid order, returns orderId + summary, and sends email", async () => {
    const res = await POST(makeReq(validPayload()) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.orderId).toBe("string");
    expect(body.orderId.length).toBeGreaterThan(0);
    expect(body.summary).toBeDefined();
    expect(body.summary.locationName).toMatch(/shreveport/i);
    expect(body.summary.lines).toHaveLength(1);
    expect(body.summary.lines[0].id).toBe("fried-green-tomatoes");
    expect(body.summary.lines[0].qty).toBe(2);
    // Server should compute lineTotal, subtotal, tax, total — never trust client math.
    expect(body.summary.lines[0].lineTotal).toBeCloseTo(
      body.summary.lines[0].price * 2,
      2,
    );
    expect(body.summary.subtotal).toBeCloseTo(
      body.summary.lines[0].lineTotal,
      2,
    );
    expect(body.summary.total).toBeGreaterThan(body.summary.subtotal);
    expect(sendOrderEmail).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/order — validation", () => {
  it("rejects malformed JSON with 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      }) as never,
    );
    expect(res.status).toBe(400);
    expect(sendOrderEmail).not.toHaveBeenCalled();
  });

  it("rejects missing name with 400", async () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>).name;
    const res = await POST(makeReq(payload) as never);
    expect(res.status).toBe(400);
  });

  it("rejects an unknown locationId with 400", async () => {
    const res = await POST(
      makeReq(validPayload({ locationId: "not-a-real-store" })) as never,
    );
    expect(res.status).toBe(400);
    expect(sendOrderEmail).not.toHaveBeenCalled();
  });

  it("rejects a cart with an unknown menu item id with 400", async () => {
    const res = await POST(
      makeReq(
        validPayload({ lines: [{ id: "not-a-real-dish", qty: 1 }] }),
      ) as never,
    );
    expect(res.status).toBe(400);
  });

  it("rejects an empty cart with 400", async () => {
    const res = await POST(makeReq(validPayload({ lines: [] })) as never);
    expect(res.status).toBe(400);
  });

  it("rejects qty <= 0 with 400", async () => {
    const res = await POST(
      makeReq(
        validPayload({ lines: [{ id: "fried-green-tomatoes", qty: 0 }] }),
      ) as never,
    );
    expect(res.status).toBe(400);
  });

  it("rejects qty above the per-line cap with 400", async () => {
    const res = await POST(
      makeReq(
        validPayload({ lines: [{ id: "fried-green-tomatoes", qty: 999 }] }),
      ) as never,
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/order — honeypot (hard block)", () => {
  it("returns 200 fake success and does NOT send when honeypot is filled", async () => {
    const res = await POST(
      makeReq(
        validPayload({ [getHoneypotFieldName()]: "https://spam.example" }),
      ) as never,
    );
    expect(res.status).toBe(200);
    expect(sendOrderEmail).not.toHaveBeenCalled();
  });
});

describe("POST /api/order — rate limit", () => {
  it("429s the 4th submission from the same IP within the window", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await POST(makeReq(validPayload()) as never);
      expect(res.status).toBe(200);
    }
    const fourth = await POST(makeReq(validPayload()) as never);
    expect(fourth.status).toBe(429);
    expect(sendOrderEmail).toHaveBeenCalledTimes(3);
  });
});
