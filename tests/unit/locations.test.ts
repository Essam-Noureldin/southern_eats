/**
 * WHAT: Sanity-check the locations dataset shape + the dietary-filter
 *       logic that drives the chip UI on /locations.
 * WHY:  Catches data drift (a locale missing required fields) and
 *       guarantees the filter helper returns predictable subsets.
 * IF REMOVED: regressions slip through (e.g. someone adds a Texas
 *       location with no phone, breaking the list card).
 * COMMON MISTAKE: asserting on a single hardcoded location's id —
 *       fragile to data edits. Assert on shape and on aggregates.
 */
import { LOCATIONS, filterLocations, type DietaryTag } from "@/lib/locations";

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
      expect(loc.hours.length).toBeGreaterThan(0);
    }
  });

  it("location ids are unique", () => {
    const ids = LOCATIONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("filterLocations", () => {
  it("returns the full set when no filters are active", () => {
    expect(filterLocations(LOCATIONS, []).length).toBe(LOCATIONS.length);
  });

  it("narrows to locations carrying every requested dietary tag", () => {
    const filters: DietaryTag[] = ["halal-fryer"];
    const out = filterLocations(LOCATIONS, filters);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(LOCATIONS.length);
    for (const loc of out) {
      expect(loc.dietary).toContain("halal-fryer");
    }
  });

  it("treats multiple filters as AND not OR", () => {
    const filters: DietaryTag[] = ["halal-fryer", "gf-fryer"];
    const out = filterLocations(LOCATIONS, filters);
    for (const loc of out) {
      expect(loc.dietary).toEqual(
        expect.arrayContaining(["halal-fryer", "gf-fryer"]),
      );
    }
  });

  it("returns empty array when no location matches", () => {
    // @ts-expect-error - intentionally bad tag to test miss path
    expect(filterLocations(LOCATIONS, ["does-not-exist"])).toEqual([]);
  });
});
