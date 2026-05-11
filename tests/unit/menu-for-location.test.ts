/**
 * @jest-environment node
 *
 * WHAT: Tests for getMenuForLocation in lib/menu.
 * WHY:  Feature 2 (per-location menus) lets a franchise location override
 *       the shared base menu in three independent dimensions:
 *         - hide:           items removed from the menu at that location
 *         - priceOverrides: item id → new price (replaces base price)
 *         - addItems:       extra items only available at that location
 *       The helper is the trust-boundary read path: /api/order recomputes
 *       totals from it so customers can't game a different location's price.
 *
 *       Tests use a synthetic MenuOverride object plus the LOCATIONS array
 *       monkey-patched in-place so we don't depend on any location actually
 *       having an override set at landing time. Restored in finally{}.
 */
import { getMenuForLocation, menu } from "@/lib/menu";
import { LOCATIONS, type Location } from "@/lib/locations";

type MutLocation = Location & {
  menuOverride?: import("@/lib/menu").MenuOverride;
};

const target = LOCATIONS[0] as unknown as MutLocation;

afterEach(() => {
  delete target.menuOverride;
});

describe("getMenuForLocation", () => {
  it("returns the base menu unchanged for a location with no override", () => {
    const result = getMenuForLocation(target.id);
    expect(result).toHaveLength(menu.length);
    expect(result.map((m) => m.id)).toEqual(menu.map((m) => m.id));
  });

  it("returns the base menu unchanged for an unknown locationId", () => {
    const result = getMenuForLocation("not-a-real-location");
    expect(result).toHaveLength(menu.length);
    expect(result.map((m) => m.id)).toEqual(menu.map((m) => m.id));
  });

  it("hides items listed in override.hide", () => {
    target.menuOverride = { hide: ["hush-puppies", "fried-pickles"] };
    const result = getMenuForLocation(target.id);
    expect(result.find((m) => m.id === "hush-puppies")).toBeUndefined();
    expect(result.find((m) => m.id === "fried-pickles")).toBeUndefined();
    // sanity: other items still present
    expect(result.find((m) => m.id === "jumbo-shrimp-15")).toBeDefined();
  });

  it("applies priceOverrides without changing other fields", () => {
    target.menuOverride = { priceOverrides: { "jumbo-shrimp-15": 17.99 } };
    const result = getMenuForLocation(target.id);
    const shrimp = result.find((m) => m.id === "jumbo-shrimp-15");
    expect(shrimp).toBeDefined();
    expect(shrimp?.price).toBe(17.99);
    // Other fields untouched
    expect(shrimp?.name).toBe(
      menu.find((m) => m.id === "jumbo-shrimp-15")?.name,
    );
    // Other items keep their base price
    const tea = result.find((m) => m.id === "sweet-tea");
    expect(tea?.price).toBe(menu.find((m) => m.id === "sweet-tea")?.price);
  });

  it("appends items from override.addItems", () => {
    target.menuOverride = {
      addItems: [
        {
          id: "shreveport-special",
          category: "seafood",
          name: "Shreveport Special",
          description: "Only at this location.",
          price: 18.99,
          tags: ["shellfish"],
        },
      ],
    };
    const result = getMenuForLocation(target.id);
    expect(result).toHaveLength(menu.length + 1);
    expect(result.find((m) => m.id === "shreveport-special")?.price).toBe(
      18.99,
    );
  });

  it("composes all three dimensions together", () => {
    target.menuOverride = {
      hide: ["hush-puppies"],
      priceOverrides: { "jumbo-shrimp-15": 19.99 },
      addItems: [
        {
          id: "house-okra",
          category: "sides",
          name: "House Okra",
          description: "Local twist.",
          price: 3.5,
          tags: [],
        },
      ],
    };
    const result = getMenuForLocation(target.id);
    expect(result.find((m) => m.id === "hush-puppies")).toBeUndefined();
    expect(result.find((m) => m.id === "jumbo-shrimp-15")?.price).toBe(19.99);
    expect(result.find((m) => m.id === "house-okra")?.price).toBe(3.5);
    // Length = base - hide + add
    expect(result).toHaveLength(menu.length - 1 + 1);
  });

  it("does not mutate the base menu array", () => {
    const before = menu.map((m) => ({ id: m.id, price: m.price }));
    target.menuOverride = {
      hide: ["hush-puppies"],
      priceOverrides: { "jumbo-shrimp-15": 99.99 },
    };
    getMenuForLocation(target.id);
    const after = menu.map((m) => ({ id: m.id, price: m.price }));
    expect(after).toEqual(before);
  });
});
