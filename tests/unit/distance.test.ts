/**
 * WHAT: Tests for the haversine distance + sort-by-proximity helpers.
 * WHY:  These power the "nearest location" UX on /locations. Wrong
 *       maths here = a customer in Shreveport told their nearest
 *       branch is in Mobile.
 * IF REMOVED: regressions in proximity ranking go silent.
 * COMMON MISTAKE: testing distance with degrees instead of kilometres
 *       — haversine inputs are degrees, output is kilometres.
 */
import {
  haversineKm,
  sortByProximity,
  type LatLng,
} from "@/lib/distance";

const SHREVEPORT: LatLng = { lat: 32.5252, lng: -93.7502 };
const MONROE: LatLng = { lat: 32.5093, lng: -92.1193 };
const NEW_ORLEANS: LatLng = { lat: 29.9511, lng: -90.0715 };
const HOUSTON: LatLng = { lat: 29.7604, lng: -95.3698 };

describe("haversineKm", () => {
  it("returns 0 km for identical points", () => {
    expect(haversineKm(SHREVEPORT, SHREVEPORT)).toBe(0);
  });

  it("Shreveport → Monroe is ~152 km (real distance, ±5 km)", () => {
    const km = haversineKm(SHREVEPORT, MONROE);
    expect(km).toBeGreaterThan(147);
    expect(km).toBeLessThan(157);
  });

  it("Shreveport → New Orleans is ~452 km great-circle (±10 km)", () => {
    // Driving distance is ~510 km via I-49/I-10; haversine returns the
    // straight-line great-circle distance, which is shorter.
    const km = haversineKm(SHREVEPORT, NEW_ORLEANS);
    expect(km).toBeGreaterThan(442);
    expect(km).toBeLessThan(462);
  });

  it("is symmetric", () => {
    const a = haversineKm(SHREVEPORT, HOUSTON);
    const b = haversineKm(HOUSTON, SHREVEPORT);
    expect(a).toBeCloseTo(b, 5);
  });
});

describe("sortByProximity", () => {
  const items = [
    { id: "no", coords: NEW_ORLEANS },
    { id: "mn", coords: MONROE },
    { id: "ho", coords: HOUSTON },
  ];

  it("orders items nearest-first relative to origin", () => {
    const sorted = sortByProximity(items, SHREVEPORT);
    expect(sorted.map((i) => i.id)).toEqual(["mn", "ho", "no"]);
  });

  it("attaches distanceKm to each result", () => {
    const sorted = sortByProximity(items, SHREVEPORT);
    expect(sorted[0].distanceKm).toBeGreaterThan(0);
    expect(typeof sorted[0].distanceKm).toBe("number");
  });

  it("does not mutate the input array", () => {
    const original = [...items];
    sortByProximity(items, SHREVEPORT);
    expect(items).toEqual(original);
  });

  it("returns identical order when origin is null (no preference)", () => {
    const sorted = sortByProximity(items, null);
    expect(sorted.map((i) => i.id)).toEqual(["no", "mn", "ho"]);
    expect(sorted[0].distanceKm).toBeNull();
  });
});
