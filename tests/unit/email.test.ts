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

import { sendContactEmail } from "@/lib/email";

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
