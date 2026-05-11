/**
 * WHAT: Unit tests for lib/email.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - stub-mode when RESEND_API_KEY is missing (works locally
 *         without a Resend account)
 *       - stub-mode when CONTACT_FORM_FROM_EMAIL is missing (works
 *         on demo deploys before DNS verification)
 *       - live-mode calls Resend with from/to/subject/replyTo/text
 *       - returns ok:false with error message when Resend errors
 */

// Hoisted mock for the Resend SDK. The "mock" name prefix lets Jest's
// babel-plugin-jest-hoist reference this from inside the jest.mock factory.
const mockSend = jest.fn();
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { sendContactEmail, sendOrderEmail } from "@/lib/email";

// Helper to mutate NODE_ENV from inside a test. Direct assignment is
// blocked by the TS lib (readonly NodeJS.ProcessEnv); cast to widen.
function setNodeEnv(value: "development" | "production" | "test"): void {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("sendContactEmail — stub mode", () => {
  it("returns mode:stub when RESEND_API_KEY is empty", async () => {
    process.env.RESEND_API_KEY = "";
    process.env.CONTACT_FORM_FROM_EMAIL = "from@example.com";
    process.env.CONTACT_FORM_TO_EMAIL = "to@example.com";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const result = await sendContactEmail({
      name: "Karen H.",
      email: "karen@example.com",
      message: "Loved the shrimp.",
    });
    expect(result).toEqual({ ok: true, mode: "stub" });
    expect(mockSend).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("returns mode:stub when CONTACT_FORM_FROM_EMAIL is empty", async () => {
    process.env.RESEND_API_KEY = "re_live_key";
    process.env.CONTACT_FORM_FROM_EMAIL = "";
    process.env.CONTACT_FORM_TO_EMAIL = "to@example.com";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const result = await sendContactEmail({
      name: "Marcus",
      email: "m@x.com",
      message: "Howdy.",
    });
    expect(result).toEqual({ ok: true, mode: "stub" });
    expect(mockSend).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("sendContactEmail — stub mode hardened (A1 — prod-safe)", () => {
  it("redacts the payload in dev stub-mode logs (only keys, never values)", async () => {
    setNodeEnv("development");
    process.env.RESEND_API_KEY = "";
    process.env.CONTACT_FORM_FROM_EMAIL = "from@example.com";
    process.env.CONTACT_FORM_TO_EMAIL = "to@example.com";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await sendContactEmail({
      name: "Karen Particular-Name",
      email: "karen-particular@example.com",
      message: "A particular message that should not be in logs.",
    });

    // The log call should not contain any of the payload VALUES — only
    // the structural shape (mode + key names).
    const allLogs = consoleSpy.mock.calls
      .flat()
      .map((c) => JSON.stringify(c))
      .join("\n");
    expect(allLogs).not.toMatch(/Karen Particular-Name/);
    expect(allLogs).not.toMatch(/karen-particular/);
    expect(allLogs).not.toMatch(/particular message/);
    consoleSpy.mockRestore();
  });

  it("hard-fails in production stub-mode and never logs payload", async () => {
    setNodeEnv("production");
    process.env.RESEND_API_KEY = "";
    process.env.CONTACT_FORM_FROM_EMAIL = "";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendContactEmail({
      name: "Karen",
      email: "k@x.com",
      message: "Hi.",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not configured/i);
    }
    // Critical: payload must NEVER be logged in production.
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
    setNodeEnv("test");
  });
});

describe("sendContactEmail — live mode", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_live_key";
    process.env.CONTACT_FORM_FROM_EMAIL = "no-reply@sams.example";
    process.env.CONTACT_FORM_TO_EMAIL = "ops@sams.example";
  });

  it("calls Resend with from/to/subject/replyTo/text on success", async () => {
    mockSend.mockResolvedValueOnce({
      data: { id: "email-id-123" },
      error: null,
    });
    const result = await sendContactEmail({
      name: "Linda",
      email: "linda@x.com",
      message: "Y'all are wonderful.",
    });
    expect(result).toEqual({ ok: true, mode: "live", id: "email-id-123" });
    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.from).toBe("no-reply@sams.example");
    expect(call.to).toBe("ops@sams.example");
    expect(call.replyTo).toBe("linda@x.com");
    expect(call.subject).toMatch(/Linda/);
    expect(call.text).toContain("Y'all are wonderful.");
  });

  it("returns ok:false when Resend returns an error", async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Quota exceeded" },
    });
    const result = await sendContactEmail({
      name: "Bill",
      email: "b@x.com",
      message: "Hi.",
    });
    expect(result).toEqual({ ok: false, error: "Quota exceeded" });
  });

  it("returns ok:false when Resend throws", async () => {
    mockSend.mockRejectedValueOnce(new Error("Network down"));
    const result = await sendContactEmail({
      name: "Aisha",
      email: "a@x.com",
      message: "Hello.",
    });
    expect(result).toEqual({ ok: false, error: "Network down" });
  });
});

const ORDER_PAYLOAD = {
  orderId: "ord_abc123",
  locationName: "Sam's Norman",
  locationAddress: "1234 Main St, Norman, OK 73019",
  customer: { name: "Linda T.", phone: "+1 405 555 0199" },
  pickupTime: "2026-05-12T18:30",
  lines: [{ name: "Catfish Plate", qty: 2, price: 13.99, lineTotal: 27.98 }],
  subtotal: 27.98,
  tax: 2.31,
  total: 30.29,
};

describe("sendOrderEmail — stub mode", () => {
  beforeEach(() => {
    setNodeEnv("test");
  });

  it("dev stub-mode redacts payload in logs (no PII values)", async () => {
    setNodeEnv("development");
    process.env.RESEND_API_KEY = "";
    process.env.CONTACT_FORM_FROM_EMAIL = "from@example.com";
    process.env.CONTACT_FORM_TO_EMAIL = "to@example.com";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendOrderEmail(ORDER_PAYLOAD);

    expect(result).toEqual({ ok: true, mode: "stub" });
    const allLogs = consoleSpy.mock.calls
      .flat()
      .map((c) => JSON.stringify(c))
      .join("\n");
    expect(allLogs).not.toMatch(/Linda T\./);
    expect(allLogs).not.toMatch(/405 555 0199/);
    consoleSpy.mockRestore();
  });

  it("prod stub-mode hard-fails and never logs payload", async () => {
    setNodeEnv("production");
    process.env.RESEND_API_KEY = "";
    process.env.CONTACT_FORM_FROM_EMAIL = "";
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendOrderEmail(ORDER_PAYLOAD);

    expect(result.ok).toBe(false);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
    setNodeEnv("test");
  });
});

describe("sendOrderEmail — live mode", () => {
  beforeEach(() => {
    setNodeEnv("test");
    process.env.RESEND_API_KEY = "re_live_key";
    process.env.CONTACT_FORM_FROM_EMAIL = "no-reply@sams.example";
    process.env.CONTACT_FORM_TO_EMAIL = "ops@sams.example";
  });

  it("sets replyTo to the staff inbox so franchise replies stay internal (A5)", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "id-1" }, error: null });

    await sendOrderEmail(ORDER_PAYLOAD);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call.replyTo).toBe("ops@sams.example");
  });

  it("includes location, customer name + phone, items, and totals in the body", async () => {
    mockSend.mockResolvedValueOnce({ data: { id: "id-2" }, error: null });

    await sendOrderEmail(ORDER_PAYLOAD);

    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toMatch(/Sam's Norman/);
    expect(call.text).toContain("Linda T.");
    expect(call.text).toContain("+1 405 555 0199");
    expect(call.text).toContain("2× Catfish Plate");
    expect(call.text).toContain("$30.29");
  });
});
