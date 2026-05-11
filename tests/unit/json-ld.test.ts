/**
 * WHAT: Unit tests for lib/json-ld — builders that emit schema.org
 *       structured data for the site and per-location.
 * WHY:  Audit A3 (2026-05-11). A 41-location restaurant marketing site
 *       without JSON-LD forfeits Google Knowledge Panel, "Open now"
 *       rich snippets, and Google Maps integration. The builders are
 *       pure functions so we test the exact shape they emit.
 */
import { LOCATIONS } from "@/lib/locations";
import { organizationLd, restaurantLd, jsonLdScript } from "@/lib/json-ld";

const SITE_URL = "https://samssoutherneatery.example";

describe("organizationLd", () => {
  it("emits the correct schema.org Organization shape", () => {
    const result = organizationLd(SITE_URL);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("FoodEstablishment");
    expect(result.name).toBe("Sam's Southern Eatery");
    expect(result.url).toBe(SITE_URL);
    expect(result.description).toMatch(/southern/i);
  });

  it("includes servesCuisine that matches the menu identity", () => {
    const result = organizationLd(SITE_URL);
    expect(result.servesCuisine).toEqual(
      expect.arrayContaining(["Southern American", "Cajun", "Seafood"]),
    );
  });

  it("strips a trailing slash from the URL so canonical and id match", () => {
    const result = organizationLd(`${SITE_URL}/`);
    expect(result.url).toBe(SITE_URL);
    expect(result["@id"]).toBe(`${SITE_URL}#organization`);
  });
});

describe("restaurantLd", () => {
  // Pick the first location for deterministic assertions.
  const loc = LOCATIONS[0];

  it("emits the correct schema.org Restaurant shape", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Restaurant");
    expect(result.name).toContain("Sam's Southern Eatery");
    expect(result.name).toContain(loc.name);
  });

  it("includes a structured PostalAddress (not a freeform string)", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(result.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: loc.address.street,
      addressLocality: loc.address.city,
      addressRegion: loc.address.state,
      postalCode: loc.address.zip,
      addressCountry: "US",
    });
  });

  it("includes GeoCoordinates for Maps integration", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(result.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: loc.coords.lat,
      longitude: loc.coords.lng,
    });
  });

  it("includes the location's phone in telephone field", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(result.telephone).toBe(loc.phone);
  });

  it("sets url to the per-location order page", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(result.url).toBe(`${SITE_URL}/order/${loc.id}`);
  });

  it("emits OpeningHoursSpecification entries when hours are known", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(Array.isArray(result.openingHoursSpecification)).toBe(true);
    expect(result.openingHoursSpecification!.length).toBeGreaterThan(0);
    const first = result.openingHoursSpecification![0];
    expect(first["@type"]).toBe("OpeningHoursSpecification");
    expect(first.dayOfWeek).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    expect(first.opens).toMatch(/^\d{2}:\d{2}$/);
    expect(first.closes).toMatch(/^\d{2}:\d{2}$/);
  });

  it("omits openingHoursSpecification entirely when hours are unknown", () => {
    const noHoursLoc = LOCATIONS.find((l) => l.hours.length === 0);
    if (!noHoursLoc) {
      throw new Error("Fixture broken: expected at least one location with empty hours");
    }
    const result = restaurantLd(noHoursLoc, SITE_URL);
    expect(result.openingHoursSpecification).toBeUndefined();
  });

  it("links back to the parent Organization via branchOf", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(result.branchOf).toEqual({
      "@type": "FoodEstablishment",
      "@id": `${SITE_URL}#organization`,
      name: "Sam's Southern Eatery",
    });
  });

  it("emits a price range that matches a casual fried-southern restaurant", () => {
    const result = restaurantLd(loc, SITE_URL);
    expect(result.priceRange).toBe("$");
  });
});

describe("jsonLdScript — the SSR-safe inline-script attributes", () => {
  it("produces the type and a stringified body for dangerouslySetInnerHTML", () => {
    const fixture = { "@context": "https://schema.org", "@type": "Thing" };
    const props = jsonLdScript(fixture);
    expect(props.type).toBe("application/ld+json");
    expect(props.dangerouslySetInnerHTML.__html).toBe(JSON.stringify(fixture));
  });

  it("escapes </script> in the JSON to prevent inline-script breakout", () => {
    // schema.org never has </script> in the wild, but a malicious value
    // sneaking in via a freeform field (a restaurant name, a description)
    // would prematurely close our <script> tag.
    const evil = {
      "@context": "https://schema.org",
      name: "Sam's </script><script>alert(1)</script>",
    };
    const props = jsonLdScript(evil);
    expect(props.dangerouslySetInnerHTML.__html).not.toContain("</script>");
    expect(props.dangerouslySetInnerHTML.__html).toContain("<\\/script>");
  });
});
