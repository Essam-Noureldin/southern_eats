/**
 * WHAT: Sanity-check the locations dataset shape.
 * WHY:  Catches data drift (a location missing required fields) and locks
 *       the contract for the /locations page.
 * IF REMOVED: regressions slip through (e.g. someone adds a Texas
 *       location with no phone, breaking the list card).
 * COMMON MISTAKE: asserting on a single hardcoded location's id —
 *       fragile to data edits. Assert on shape and on aggregates.
 */
import { LOCATIONS } from "@/lib/locations";

describe("LOCATIONS dataset", () => {
  it("has at least 8 entries (real franchise list as of 2026-05-10 = 41)", () => {
    expect(LOCATIONS.length).toBeGreaterThanOrEqual(8);
  });

  it("every location has the required fields populated", () => {
    for (const loc of LOCATIONS) {
      expect(loc.id).toMatch(/^[a-z0-9-]+$/);
      expect(loc.name).toBeTruthy();
      expect(loc.address.street).toBeTruthy();
      expect(loc.address.city).toBeTruthy();
      expect(loc.address.state).toMatch(/^[A-Z]{2}$/);
      expect(loc.address.zip).toMatch(/^\d{5}$/);
      expect(loc.phone).toMatch(/^[\d\s\-()+]+$/);
      expect(loc.coords.lat).toBeGreaterThan(20);
      expect(loc.coords.lat).toBeLessThan(50);
      expect(loc.coords.lng).toBeGreaterThan(-110);
      expect(loc.coords.lng).toBeLessThan(-70);
      // Hours array can be empty for newly-opened or unverified-hours
      // locations (we don't synthesize). Just enforce shape.
      expect(Array.isArray(loc.hours)).toBe(true);
    }
  });

  it("location ids are unique", () => {
    const ids = LOCATIONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
