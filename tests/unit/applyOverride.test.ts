/**
 * WHAT: Unit tests for `applyOverride` in lib/locations.ts.
 * WHY:  The function decides which fields the admin can over-rule
 *       (phone, hours) and which always come from static. Bugs here
 *       could either (a) silently ignore an admin edit or (b) let an
 *       empty/missing override blank out real data.
 */
import { applyOverride, type Location } from "@/lib/locations";

const BASE: Location = {
  id: "test-loc",
  name: "Test Location",
  address: { street: "1 Test St", city: "Testville", state: "TX", zip: "75001" },
  phone: "(555) 100-0000",
  coords: { lat: 32, lng: -96 },
  hours: [{ day: "Mon", open: "10:00", close: "20:00" }],
};

describe("applyOverride", () => {
  it("returns the location unchanged when override is null", () => {
    expect(applyOverride(BASE, null)).toEqual(BASE);
  });

  it("returns the location unchanged when override is undefined", () => {
    expect(applyOverride(BASE, undefined)).toEqual(BASE);
  });

  it("overrides phone when override.phone is set", () => {
    const result = applyOverride(BASE, {
      phone: "(555) 999-9999",
      updatedAt: "2026-05-11T12:00:00Z",
    });
    expect(result.phone).toBe("(555) 999-9999");
    expect(result.hours).toEqual(BASE.hours);
  });

  it("overrides hours when override.hours is non-empty", () => {
    const newHours = [{ day: "Tue" as const, open: "11:00", close: "21:00" }];
    const result = applyOverride(BASE, {
      hours: newHours,
      updatedAt: "2026-05-11T12:00:00Z",
    });
    expect(result.hours).toEqual(newHours);
    expect(result.phone).toBe(BASE.phone);
  });

  it("ignores an empty hours array (treated as 'no override')", () => {
    const result = applyOverride(BASE, {
      hours: [],
      updatedAt: "2026-05-11T12:00:00Z",
    });
    expect(result.hours).toEqual(BASE.hours);
  });

  it("ignores empty-string phone (treated as 'no override')", () => {
    const result = applyOverride(BASE, {
      phone: "",
      updatedAt: "2026-05-11T12:00:00Z",
    });
    expect(result.phone).toBe(BASE.phone);
  });

  it("applies both phone and hours together", () => {
    const result = applyOverride(BASE, {
      phone: "(555) 999-9999",
      hours: [{ day: "Wed", open: "09:00", close: "18:00" }],
      updatedAt: "2026-05-11T12:00:00Z",
    });
    expect(result.phone).toBe("(555) 999-9999");
    expect(result.hours).toHaveLength(1);
    expect(result.hours[0].day).toBe("Wed");
  });

  it("returns a new object (doesn't mutate the input)", () => {
    const originalPhone = BASE.phone;
    const result = applyOverride(BASE, {
      phone: "(555) 999-9999",
      updatedAt: "2026-05-11T12:00:00Z",
    });
    expect(result).not.toBe(BASE);
    expect(BASE.phone).toBe(originalPhone);
  });

  it("preserves id, name, address, coords across an override", () => {
    const result = applyOverride(BASE, {
      phone: "(555) 999-9999",
      updatedAt: "2026-05-11T12:00:00Z",
    });
    expect(result.id).toBe(BASE.id);
    expect(result.name).toBe(BASE.name);
    expect(result.address).toEqual(BASE.address);
    expect(result.coords).toEqual(BASE.coords);
  });
});
