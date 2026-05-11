/**
 * WHAT: Schema.org structured-data builders. `organizationLd()` describes
 *       the franchise as a whole; `restaurantLd(location, siteUrl)`
 *       describes one branch. `jsonLdScript(obj)` returns the props for
 *       a `<script type="application/ld+json" />` tag (handles the
 *       </script> escape that prevents a malicious value from closing
 *       the inline-script context).
 * WHY:  Audit finding A3 (2026-05-11). A 41-location restaurant site
 *       without JSON-LD forfeits Google Knowledge Panel, "Open now"
 *       rich snippets in search results, and Google Maps integration.
 *       Data already exists in lib/locations.ts; we just emit it in
 *       the format Google understands.
 * IF REMOVED: Google search results lose rich snippets for every
 *       location page; Maps panel won't auto-populate; "Restaurants
 *       near me" intent queries skip us.
 * COMMON MISTAKE: rendering with JSON.stringify but forgetting to
 *       escape `</script>`. A freeform field containing the literal
 *       `</script>` closes the inline-script context and lets the
 *       rest of the JSON render as HTML — an XSS amplifier. Always
 *       escape via the jsonLdScript() helper, never bare interpolate.
 */
import type { Location, Hours } from "./locations";

const ORG_NAME = "Sam's Southern Eatery";
const ORG_DESCRIPTION =
  "Family-run Southern fried seafood and chicken — catfish, shrimp, chicken, po'boys, gumbo, sides, and family packs. 41 locations across the South.";
const CUISINES = ["Southern American", "Cajun", "Seafood", "Comfort Food"];
const PRICE_RANGE = "$"; // casual counter-service price tier

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export interface OrganizationLd {
  "@context": "https://schema.org";
  "@type": "FoodEstablishment";
  "@id": string;
  name: string;
  url: string;
  description: string;
  servesCuisine: string[];
  priceRange: string;
}

export function organizationLd(siteUrl: string): OrganizationLd {
  const url = stripTrailingSlash(siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${url}#organization`,
    name: ORG_NAME,
    url,
    description: ORG_DESCRIPTION,
    servesCuisine: CUISINES,
    priceRange: PRICE_RANGE,
  };
}

interface OpeningHoursSpecificationLd {
  "@type": "OpeningHoursSpecification";
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  opens: string;
  closes: string;
}

export interface RestaurantLd {
  "@context": "https://schema.org";
  "@type": "Restaurant";
  name: string;
  url: string;
  telephone: string;
  description: string;
  servesCuisine: string[];
  priceRange: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: "US";
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: OpeningHoursSpecificationLd[];
  branchOf: {
    "@type": "FoodEstablishment";
    "@id": string;
    name: string;
  };
}

const DAY_FULL: Record<Hours["day"], OpeningHoursSpecificationLd["dayOfWeek"]> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export function restaurantLd(loc: Location, siteUrl: string): RestaurantLd {
  const url = stripTrailingSlash(siteUrl);
  const out: RestaurantLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: `${ORG_NAME} — ${loc.name}`,
    url: `${url}/order/${loc.id}`,
    telephone: loc.phone,
    description: `${ORG_NAME} at ${loc.address.street}, ${loc.address.city}, ${loc.address.state}. Pickup orders, family packs, and the full Southern catch.`,
    servesCuisine: CUISINES,
    priceRange: PRICE_RANGE,
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.address.street,
      addressLocality: loc.address.city,
      addressRegion: loc.address.state,
      postalCode: loc.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: loc.coords.lat,
      longitude: loc.coords.lng,
    },
    branchOf: {
      "@type": "FoodEstablishment",
      "@id": `${url}#organization`,
      name: ORG_NAME,
    },
  };
  // Only emit openingHoursSpecification when we actually have hours;
  // schema.org treats an empty array as a falsy claim ("we don't open").
  if (loc.hours.length > 0) {
    out.openingHoursSpecification = loc.hours.map((h) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: DAY_FULL[h.day],
      opens: h.open,
      closes: h.close,
    }));
  }
  return out;
}

/**
 * Returns the props for a `<script type="application/ld+json" />` tag.
 * Use with React's `{...spread}` pattern so the script is rendered as
 * server-side HTML and never executes (it's data, not code).
 *
 * The `</script>` escape is the load-bearing security detail: without it,
 * any value containing the literal string `</script>` would close our
 * inline script context and let attacker-controlled content render as
 * the start of HTML — an XSS amplifier. Schema.org never has this in
 * normal data, but freeform fields (description, restaurant name) could
 * be poisoned if data ever flowed from user input.
 */
export function jsonLdScript(obj: unknown): {
  type: "application/ld+json";
  dangerouslySetInnerHTML: { __html: string };
} {
  const serialized = JSON.stringify(obj).replace(/<\/script/gi, "<\\/script");
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: serialized },
  };
}
