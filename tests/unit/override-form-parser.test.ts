/**
 * WHAT: Unit tests for parseOverrideForm — the validate-and-shape
 *       layer between an HTML form and the LocationOverride store.
 * WHY:  The parser is the only thing standing between an attacker
 *       sending a hand-crafted FormData payload and persisting bad
 *       data into KV. Regex + zod + the "drop closed days" rule have
 *       to hold up regardless of input shape.
 */
import { parseOverrideForm } from "@/lib/override-form-parser";

function days(rows: Partial<Record<string, { closed?: boolean; open?: string; close?: string }>>) {
  return {
    Mon: { closed: false, open: "", close: "", ...rows.Mon },
    Tue: { closed: false, open: "", close: "", ...rows.Tue },
    Wed: { closed: false, open: "", close: "", ...rows.Wed },
    Thu: { closed: false, open: "", close: "", ...rows.Thu },
    Fri: { closed: false, open: "", close: "", ...rows.Fri },
    Sat: { closed: false, open: "", close: "", ...rows.Sat },
    Sun: { closed: false, open: "", close: "", ...rows.Sun },
  };
}

describe("parseOverrideForm", () => {
  it("ok: phone only, no hours", () => {
    const result = parseOverrideForm({
      phone: "(555) 555-5555",
      days: days({}),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.phone).toBe("(555) 555-5555");
      expect(result.fields.hours).toBeUndefined();
    }
  });

  it("ok: trims whitespace from phone", () => {
    const result = parseOverrideForm({
      phone: "   (555) 555-5555   ",
      days: days({}),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.phone).toBe("(555) 555-5555");
    }
  });

  it("ok: empty phone becomes undefined (no override on phone)", () => {
    const result = parseOverrideForm({ phone: "", days: days({}) });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.phone).toBeUndefined();
    }
  });

  it("ok: produces hours when open + close set and not closed", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({ Mon: { open: "10:00", close: "21:00" } }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.hours).toEqual([
        { day: "Mon", open: "10:00", close: "21:00" },
      ]);
    }
  });

  it("ok: drops rows marked closed even if open/close are populated", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({
        Mon: { open: "10:00", close: "21:00" },
        Tue: { closed: true, open: "10:00", close: "21:00" },
      }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.hours).toHaveLength(1);
      expect(result.fields.hours![0].day).toBe("Mon");
    }
  });

  it("ok: hours preserved in Mon..Sun order regardless of object insertion order", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({
        Sun: { open: "11:00", close: "20:00" },
        Mon: { open: "10:00", close: "21:00" },
        Wed: { open: "10:00", close: "21:00" },
      }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.hours!.map((h) => h.day)).toEqual(["Mon", "Wed", "Sun"]);
    }
  });

  it("ok: hours undefined when no day produces an entry", () => {
    const result = parseOverrideForm({
      phone: "(555) 555-5555",
      days: days({
        Mon: { closed: true },
        Tue: { closed: true },
      }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.hours).toBeUndefined();
    }
  });

  it("rejects malformed time format (24:01 is invalid)", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({ Mon: { open: "24:01", close: "21:00" } }),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects 25:00 (out-of-range hour)", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({ Mon: { open: "25:00", close: "26:00" } }),
    });
    expect(result.ok).toBe(false);
  });

  it("rejects 9:00 (single-digit hour)", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({ Mon: { open: "9:00", close: "21:00" } }),
    });
    expect(result.ok).toBe(false);
  });

  it("accepts 24:00 as a valid close time (midnight)", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({ Fri: { open: "10:00", close: "24:00" } }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.hours![0].close).toBe("24:00");
    }
  });

  it("rejects phone over the max length", () => {
    const result = parseOverrideForm({
      phone: "x".repeat(41),
      days: days({}),
    });
    expect(result.ok).toBe(false);
  });

  it("skips rows where open is set but close is blank", () => {
    const result = parseOverrideForm({
      phone: "",
      days: days({ Mon: { open: "10:00", close: "" } }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fields.hours).toBeUndefined();
    }
  });
});
