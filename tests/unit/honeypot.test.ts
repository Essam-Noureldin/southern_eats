/**
 * WHAT: Unit tests for lib/honeypot.ts — bot-trap helpers used by the
 *       contact-form server action.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - honeypot trips on any non-empty value
 *       - timing trap trips when submission is unrealistically fast
 *       - field-name helper is stable (used by both the form input and
 *         the server-action validation; one source of truth).
 *
 * COMMON MISTAKE: validating bot traffic loudly (returning 400 / showing
 * an error). That tells the bot exactly what tripped, which it then
 * adapts around. The right behaviour is silent drop with a fake-success
 * shape — the *server action* enforces that, this module just reports.
 */
import {
  isHoneypotTriggered,
  isSubmissionTooFast,
  getHoneypotFieldName,
  HONEYPOT_MIN_FILL_MS,
} from "@/lib/honeypot";

describe("isHoneypotTriggered", () => {
  it("returns false for empty string", () => {
    expect(isHoneypotTriggered("")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isHoneypotTriggered(undefined)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isHoneypotTriggered(null)).toBe(false);
  });

  it("returns false for whitespace-only input", () => {
    // Bots usually post empty; humans never touch the field.
    // Whitespace-only could be a stray copy-paste — treat as not tripped.
    expect(isHoneypotTriggered("   ")).toBe(false);
    expect(isHoneypotTriggered("\t\n")).toBe(false);
  });

  it("returns true for any meaningful value", () => {
    expect(isHoneypotTriggered("https://spam.example")).toBe(true);
    expect(isHoneypotTriggered("a")).toBe(true);
    expect(isHoneypotTriggered("Buy more now!")).toBe(true);
  });

  it("returns true for non-string values (defensive)", () => {
    expect(isHoneypotTriggered(123 as unknown as string)).toBe(true);
    expect(isHoneypotTriggered({} as unknown as string)).toBe(true);
  });
});

describe("isSubmissionTooFast", () => {
  it("returns true when gap is less than HONEYPOT_MIN_FILL_MS", () => {
    expect(isSubmissionTooFast(1500, 0)).toBe(true);
  });

  it("returns false when gap is exactly HONEYPOT_MIN_FILL_MS", () => {
    expect(isSubmissionTooFast(HONEYPOT_MIN_FILL_MS, 0)).toBe(false);
  });

  it("returns false when gap is greater than HONEYPOT_MIN_FILL_MS", () => {
    expect(isSubmissionTooFast(HONEYPOT_MIN_FILL_MS + 100, 0)).toBe(false);
    expect(isSubmissionTooFast(60_000, 0)).toBe(false);
  });

  it("respects an explicit minMs override", () => {
    expect(isSubmissionTooFast(500, 0, 1000)).toBe(true);
    expect(isSubmissionTooFast(1500, 0, 1000)).toBe(false);
  });

  it("returns true when renderedAt is missing or invalid (cannot prove the user took time)", () => {
    expect(isSubmissionTooFast(5000, NaN)).toBe(true);
    expect(isSubmissionTooFast(5000, undefined as unknown as number)).toBe(true);
  });

  it("returns true when submittedAt is before renderedAt (clock skew / replay)", () => {
    expect(isSubmissionTooFast(0, 1000)).toBe(true);
  });
});

describe("getHoneypotFieldName", () => {
  it("returns a non-empty stable string", () => {
    const a = getHoneypotFieldName();
    const b = getHoneypotFieldName();
    expect(typeof a).toBe("string");
    expect(a.length).toBeGreaterThan(0);
    expect(a).toBe(b);
  });

  it("returns a name that does not look obviously like a honeypot", () => {
    // Bots often skip fields literally named "honeypot", "trap", "spam".
    const name = getHoneypotFieldName().toLowerCase();
    expect(name).not.toMatch(/honeypot|honey|trap|spam|bot/);
  });
});
