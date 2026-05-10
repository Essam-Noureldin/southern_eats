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

describe("filterLocations", () => {
  it("returns the full set when no filters are active", () => {
    expect(filterLocations(LOCATIONS, []).length).toBe(LOCATIONS.length);
  });

  it("returns empty array for tags with no public source confirmation", () => {
    // No-synthetic-data policy: halal-fryer / gf-fryer / vegan-options are
    // not advertised per-location anywhere we can verify, so they filter
    // to empty until the franchise confirms per branch.
    const unverifiedTags: DietaryTag[] = [
      "halal-fryer",
      "gf-fryer",
      "vegan-options",
    ];
    for (const tag of unverifiedTags) {
      expect(filterLocations(LOCATIONS, [tag])).toEqual([]);
    }
  });

  it("returns the expected matching subset for tags that DO have public confirmation", () => {
    // Drive-thru explicitly confirmed at 2 locations (Mobile, Conway).
    const drivethru = filterLocations(LOCATIONS, ["drive-thru"]);
    expect(drivethru.length).toBeGreaterThanOrEqual(2);
    for (const loc of drivethru) {
      expect(loc.dietary).toContain("drive-thru");
    }
    // Dine-in tagged on a handful of locations where snippets explicitly
    // listed it. Conservative coverage; not every sit-down branch.
    const dinein = filterLocations(LOCATIONS, ["dine-in"]);
    expect(dinein.length).toBeGreaterThanOrEqual(3);
    for (const loc of dinein) {
      expect(loc.dietary).toContain("dine-in");
    }
  });

  it("returns empty array when no location matches", () => {
    // @ts-expect-error - intentionally bad tag to test miss path
    expect(filterLocations(LOCATIONS, ["does-not-exist"])).toEqual([]);
  });
});
