/**
 * WHAT: Tests the getMenuItem(slug) lookup helper.
 * WHY:  /menu/[slug] page needs a deterministic way to look a dish up by
 *       id. Test-first locks the contract — case-sensitive, returns
 *       undefined on miss, never throws.
 * IF REMOVED: a future refactor could silently change the lookup to be
 *       case-insensitive or throw on miss; the [slug] page would break
 *       in subtle ways.
 */
import { getMenuItem, menu } from "@/lib/menu";

describe("getMenuItem", () => {
  it("returns the matching dish for a known slug", () => {
    const item = getMenuItem("jumbo-shrimp-15");
    expect(item).toBeDefined();
    expect(item?.id).toBe("jumbo-shrimp-15");
    expect(item?.name).toMatch(/jumbo shrimp/i);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getMenuItem("not-a-real-dish")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getMenuItem("")).toBeUndefined();
  });

  it("is case-sensitive (slug must match exactly)", () => {
    expect(getMenuItem("JUMBO-SHRIMP-15")).toBeUndefined();
  });

  it("can find every dish in the menu", () => {
    for (const dish of menu) {
      expect(getMenuItem(dish.id)?.id).toBe(dish.id);
    }
  });
});
