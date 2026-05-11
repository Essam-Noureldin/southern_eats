/**
 * WHAT: Locations dataset + dietary-filter helper for the /locations page.
 * WHY:  Single source of truth shared by the list view, the map markers,
 *       and the filter chips. Keeping it data-only (no JSX) makes it
 *       trivial to swap for an API call later.
 * IF REMOVED: /locations renders nothing.
 * COMMON MISTAKE: storing addresses as one freeform string. Splitting
 *       into structured fields lets us format consistently AND build
 *       a clean Google Maps directions URL.
 *
 * SOURCE: Addresses, names, and phone numbers below were lifted verbatim
 * from samssoutherneatery.com/locations on 2026-05-10. Coordinates were
 * geocoded via OpenStreetMap Nominatim. Hours were researched per
 * location on 2026-05-10 from publicly-available sources (Google Maps
 * business panels surfaced via search, official franchise subdomains,
 * Yelp listings, local press). Where hours weren't publicly listed, the
 * `hours` array is left empty — we never synthesize.
 *
 * The franchise's marketing line claims "51 locations across 9 states"
 * but the live locations page lists 41 across 11 states — we use the
 * actual published list, not the marketing copy.
 *
 * Two locations ship with hours: [] :
 *   - lubbock-50th-e-tx — search engines kept conflating with the
 *     4928 50th St branch; needs a manual phone-call confirmation.
 *   - haltom-city-denton-tx — newly opened ~late April 2026; Google
 *     business panel hadn't published hours at research time.
 */
import type { LatLng } from "./distance";
import type { MenuOverride } from "./menu";


export interface Hours {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  open: string; // "11:00"
  close: string; // "22:00" (24:00 = midnight close)
}

export interface Location {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string; // 2-letter
    zip: string; // 5-digit
  };
  phone: string;
  coords: LatLng;
  hours: Hours[];
  /**
   * Google Place ID for this location, when known.
   *
   * When set AND `GOOGLE_PLACES_API_KEY` env var is configured, the location
   * detail page pulls live hours + reviews from the Google Places API and
   * merges them over the static `hours` array above.
   *
   * Find the ID via Google's Place ID Finder:
   *   https://developers.google.com/maps/documentation/places/web-service/place-id
   *
   * When unset, the location falls back to the static `hours` array and
   * the mock reviews in lib/reviews.ts (offline-safe, CI-safe).
   */
  googlePlaceId?: string;
  /**
   * Per-location menu override. Lets a franchise location drop items,
   * retag prices, or add house specials on top of the base `menu` array
   * in lib/menu.ts.
   *
   * Read through `getMenuForLocation(id)` — never combine the override
   * with the base menu by hand at the consumer level. `/api/order` uses
   * the helper for server-side cart validation so per-location prices
   * are the trust boundary.
   *
   * When unset, the location serves the base menu unchanged.
   */
  menuOverride?: MenuOverride;
  /**
   * External ordering URL for this location (HungerRush, Toast, ChowNow,
   * Square Online, etc.). When set, the "Start order" CTA on /order
   * routes the customer to the franchise's real ordering platform in a
   * new tab (rel="noopener noreferrer") instead of the in-house demo
   * flow. The per-location page /order/[id] additionally surfaces a
   * banner pointing to the real ordering URL.
   *
   * Must be an absolute https URL — the routing code does not normalise.
   *
   * When unset, the location falls through to the in-house demo flow.
   * This matches the franchise reality: not every store has a public
   * ordering URL yet.
   */
  orderingUrl?: string;
}

// 7-day uniform schedules — common Sam's patterns, defined once for
// readability. Per-location overrides specified inline below.
const D7 = (open: string, close: string): Hours[] =>
  (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map((day) => ({
    day,
    open,
    close,
  }));

// Mon-Sat with the same window, separate Sun window. `null` Sun = closed.
const MS6_S1 = (
  ms: { open: string; close: string },
  sun: { open: string; close: string } | null,
): Hours[] => {
  const out: Hours[] = (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const).map(
    (day) => ({ day, open: ms.open, close: ms.close }),
  );
  if (sun) out.push({ day: "Sun", ...sun });
  return out;
};

export const LOCATIONS: readonly Location[] = [
  {
    id: "jackson-raymond-rd-ms",
    name: "Jackson — Raymond Rd",
    address: { street: "724 Raymond Rd", city: "Jackson", state: "MS", zip: "39204" },
    phone: "(769) 257-6578",
    coords: { lat: 32.283393, lng: -90.228307 },
    hours: MS6_S1({ open: "10:00", close: "20:30" }, { open: "11:00", close: "20:00" }),
  },
  {
    id: "st-louis-gravois-mo",
    name: "St. Louis — Gravois Ave",
    address: { street: "3505 Gravois Ave", city: "St. Louis", state: "MO", zip: "63118" },
    phone: "(314) 659-8619",
    coords: { lat: 38.5935516, lng: -90.2426147 },
    hours: D7("11:00", "22:00"),  },
  {
    id: "springfield-glenstone-mo",
    name: "Springfield — N Glenstone Ave",
    address: { street: "1631 N Glenstone Ave", city: "Springfield", state: "MO", zip: "65803" },
    phone: "(417) 319-5334",
    coords: { lat: 37.2272686, lng: -93.2614594 },
    hours: D7("10:00", "22:00"),
  },
  {
    id: "mobile-dauphin-al",
    name: "Mobile — Dauphin St",
    address: { street: "3246 Dauphin St", city: "Mobile", state: "AL", zip: "36606" },
    phone: "(251) 525-9985",
    coords: { lat: 30.6894803, lng: -88.1189346 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "18:00" }),
  },
  {
    id: "opelika-1st-ave-al",
    name: "Opelika — 1st Avenue",
    address: { street: "1006 1st Avenue", city: "Opelika", state: "AL", zip: "36801" },
    phone: "(334) 363-0708",
    coords: { lat: 32.6473412, lng: -85.3834723 },
    hours: [
      { day: "Mon", open: "10:00", close: "20:00" },
      { day: "Tue", open: "10:00", close: "20:00" },
      { day: "Wed", open: "10:00", close: "20:00" },
      { day: "Thu", open: "10:00", close: "20:00" },
      { day: "Fri", open: "10:00", close: "20:30" },
      { day: "Sat", open: "10:00", close: "20:30" },
      { day: "Sun", open: "11:00", close: "16:00" },
    ],
  },
  {
    id: "eufaula-s-eufaula-ave-al",
    name: "Eufaula — S Eufaula Ave",
    address: { street: "325 South Eufaula Ave", city: "Eufaula", state: "AL", zip: "36027" },
    phone: "(334) 232-4417",
    coords: { lat: 31.8892025, lng: -85.1451299 },
    hours: [
      { day: "Mon", open: "10:00", close: "21:00" },
      { day: "Tue", open: "10:00", close: "21:00" },
      { day: "Wed", open: "10:00", close: "21:00" },
      { day: "Thu", open: "10:00", close: "21:00" },
      { day: "Fri", open: "10:00", close: "22:00" },
      { day: "Sat", open: "10:00", close: "21:00" },
      { day: "Sun", open: "11:00", close: "20:00" },
    ],
  },
  {
    id: "shreveport-greenwood-rd-la",
    name: "Shreveport — Greenwood Rd",
    address: { street: "6122 Greenwood Rd", city: "Shreveport", state: "LA", zip: "71119" },
    phone: "(318) 631-7782",
    coords: { lat: 32.4522114, lng: -93.8622371 },
    hours: D7("10:00", "22:00"),
    // PLACEHOLDER — needs the franchise's real per-store HungerRush URL
    // before public launch. Uses example.com (IANA-reserved) so the demo
    // routing lands on a recognisable "Example Domain" page rather than
    // a real third-party site. The path carries the intent.
    orderingUrl: "https://example.com/sams-shreveport-greenwood/order",
  },
  {
    id: "vivian-hwy-1-la",
    name: "Vivian — Highway 1",
    address: { street: "14347 Highway 1", city: "Vivian", state: "LA", zip: "71082" },
    phone: "(318) 375-2094",
    coords: { lat: 32.9040266, lng: -93.9821626 },
    hours: D7("10:00", "20:40"),
  },
  {
    id: "springhill-n-arkansas-la",
    name: "Springhill — N Arkansas St",
    address: { street: "1011 N Arkansas St", city: "Springhill", state: "LA", zip: "71075" },
    phone: "(318) 539-2558",
    coords: { lat: 33.0176462, lng: -93.4670037 },
    hours: D7("10:00", "20:40"),
  },
  {
    id: "shreveport-70th-la",
    name: "Shreveport — W 70th St",
    address: { street: "801 W 70th St", city: "Shreveport", state: "LA", zip: "71106" },
    phone: "(318) 670-7285",
    coords: { lat: 32.441906, lng: -93.771725 },
    // Closed Sun per Google panel.
    hours: MS6_S1({ open: "10:00", close: "20:10" }, null),
  },
  {
    id: "bossier-city-barksdale-la",
    name: "Bossier City — Barksdale Blvd",
    address: { street: "2910 Barksdale Blvd", city: "Bossier City", state: "LA", zip: "71112" },
    phone: "(318) 658-9980",
    coords: { lat: 32.4987967, lng: -93.6920769 },
    // Closed Sun.
    hours: MS6_S1({ open: "10:00", close: "21:00" }, null),
  },
  {
    id: "alexandria-lee-st-la",
    name: "Alexandria — Lee St",
    address: { street: "4814 Lee St", city: "Alexandria", state: "LA", zip: "71302" },
    phone: "(318) 704-0027",
    coords: { lat: 31.263516, lng: -92.447745 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "port-allen-lobdell-la",
    name: "Port Allen — N Lobdell Hwy",
    address: { street: "1680 N Lobdell Hwy", city: "Port Allen", state: "LA", zip: "70767" },
    phone: "(225) 218-6570",
    coords: { lat: 30.4639195, lng: -91.2112302 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "baton-rouge-sherwood-la",
    name: "Baton Rouge — Sherwood Forest",
    address: { street: "3120 S Sherwood Forest Blvd", city: "Baton Rouge", state: "LA", zip: "70816" },
    phone: "(225) 256-1460",
    coords: { lat: 30.4241713, lng: -91.0520439 },
    hours: MS6_S1({ open: "10:00", close: "22:00" }, { open: "11:00", close: "20:00" }),
  },
  {
    id: "harvey-westbank-la",
    name: "Harvey — Westbank Expressway",
    address: { street: "3950 Westbank Expressway", city: "Harvey", state: "LA", zip: "70058" },
    phone: "(504) 510-2900",
    coords: { lat: 29.8952734, lng: -90.0888914 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "20:00" }),
  },
  {
    id: "slidell-pontchartrain-la",
    name: "Slidell — Pontchartrain Dr",
    address: { street: "3114 Pontchartrain Dr", city: "Slidell", state: "LA", zip: "70458" },
    phone: "(985) 201-7446",
    coords: { lat: 30.2616521, lng: -89.7854777 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "20:00" }),
  },
  {
    id: "laplace-belle-terre-la",
    name: "LaPlace — Belle Terre Blvd",
    address: { street: "143 Belle Terre Blvd", city: "LaPlace", state: "LA", zip: "70068" },
    phone: "(985) 359-1677",
    coords: { lat: 30.0750712, lng: -90.5006304 },
    hours: [
      { day: "Mon", open: "09:00", close: "21:00" },
      { day: "Tue", open: "09:00", close: "21:00" },
      { day: "Wed", open: "09:00", close: "21:00" },
      { day: "Thu", open: "09:00", close: "21:00" },
      { day: "Fri", open: "09:00", close: "21:00" },
      { day: "Sat", open: "09:00", close: "21:00" },
      { day: "Sun", open: "09:00", close: "20:00" },
    ],  },
  {
    id: "niles-youngstown-warren-oh",
    name: "Niles — Youngstown-Warren Rd",
    address: { street: "5832 Youngstown Warren Rd", city: "Niles", state: "OH", zip: "44446" },
    phone: "(330) 349-4129",
    coords: { lat: 41.2079699, lng: -80.7445049 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "20:00" }),
  },
  {
    id: "youngstown-south-ave-oh",
    name: "Youngstown — South Ave",
    address: { street: "2705 South Ave", city: "Youngstown", state: "OH", zip: "44502" },
    phone: "(330) 333-3049",
    coords: { lat: 41.0724471, lng: -80.645842 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "20:00" }),
  },
  {
    id: "beaumont-college-tx",
    name: "Beaumont — College St",
    address: { street: "2949 College St, Ste 115", city: "Beaumont", state: "TX", zip: "77701" },
    phone: "(409) 832-5050",
    coords: { lat: 30.0680399, lng: -94.1164765 },
    hours: MS6_S1({ open: "10:00", close: "20:30" }, { open: "11:00", close: "18:30" }),
  },
  {
    id: "pampa-hobart-tx",
    name: "Pampa — N Hobart St",
    address: { street: "220 N Hobart St", city: "Pampa", state: "TX", zip: "79065" },
    phone: "(806) 419-3005",
    coords: { lat: 35.5316396, lng: -100.9716636 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "nacogdoches-north-st-tx",
    name: "Nacogdoches — North St",
    address: { street: "1220 North St, Ste 101", city: "Nacogdoches", state: "TX", zip: "75961" },
    phone: "(936) 205-3113",
    coords: { lat: 31.6135681, lng: -94.6529476 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "amarillo-teckla-tx",
    name: "Amarillo — Teckla Blvd",
    address: { street: "4317 Teckla Blvd", city: "Amarillo", state: "TX", zip: "79109" },
    phone: "(806) 437-1349",
    coords: { lat: 35.1651255, lng: -101.8874605 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "dumas-us-87-tx",
    name: "Dumas — US-87",
    address: { street: "5928 US-87", city: "Dumas", state: "TX", zip: "79029" },
    phone: "(806) 934-5740",
    coords: { lat: 35.8636971, lng: -102.0120126 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "lufkin-timberland-tx",
    name: "Lufkin — S Timberland Dr",
    address: { street: "214 S Timberland Dr", city: "Lufkin", state: "TX", zip: "75901" },
    phone: "(936) 899-5066",
    coords: { lat: 31.3336313, lng: -94.7204745 },
    hours: [
      { day: "Mon", open: "10:00", close: "19:30" },
      { day: "Tue", open: "10:00", close: "21:00" },
      { day: "Wed", open: "10:00", close: "21:00" },
      { day: "Thu", open: "10:00", close: "21:00" },
      { day: "Fri", open: "10:00", close: "21:00" },
      { day: "Sat", open: "10:00", close: "21:00" },
      { day: "Sun", open: "10:00", close: "21:00" },
    ],
  },
  {
    id: "lubbock-50th-w-tx",
    name: "Lubbock — 50th St (West)",
    address: { street: "4928 50th St", city: "Lubbock", state: "TX", zip: "79414" },
    phone: "(806) 701-2432",
    coords: { lat: 33.5491922, lng: -101.917807 },
    hours: [
      { day: "Mon", open: "10:00", close: "22:00" },
      { day: "Tue", open: "10:00", close: "22:00" },
      { day: "Wed", open: "10:00", close: "22:00" },
      { day: "Thu", open: "10:00", close: "22:00" },
      { day: "Fri", open: "10:00", close: "24:00" },
      { day: "Sat", open: "10:00", close: "24:00" },
      { day: "Sun", open: "10:00", close: "22:00" },
    ],
  },
  {
    id: "lubbock-50th-e-tx",
    name: "Lubbock — 50th St (East)",
    address: { street: "811 50th St", city: "Lubbock", state: "TX", zip: "79404" },
    phone: "(806) 701-1444",
    coords: { lat: 33.5487028, lng: -101.8430336 },
    // Search engines conflated this with the 4928 location; needs phone confirmation.
    hours: [],
  },
  {
    id: "haltom-city-denton-tx",
    name: "Haltom City — Denton Hwy",
    address: { street: "4616 Denton Hwy", city: "Haltom City", state: "TX", zip: "76117" },
    phone: "(817) 393-7714",
    coords: { lat: 32.8301031, lng: -97.2642219 },
    // Newly opened ~late April 2026; Google panel hadn't published hours.
    hours: [],
  },
  {
    id: "texarkana-new-boston-tx",
    name: "Texarkana — New Boston Rd",
    address: { street: "2901 New Boston Rd", city: "Texarkana", state: "TX", zip: "75501" },
    phone: "(903) 255-7735",
    coords: { lat: 33.4358615, lng: -94.080738 },
    hours: MS6_S1({ open: "10:00", close: "20:15" }, { open: "11:00", close: "18:15" }),
  },
  {
    id: "brownwood-clements-tx",
    name: "Brownwood — Clements St",
    address: { street: "1113 Clements St", city: "Brownwood", state: "TX", zip: "76801" },
    phone: "(325) 203-5120",
    coords: { lat: 31.7286673, lng: -98.9800814 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "conway-us-701-sc",
    name: "Conway — US-701",
    address: { street: "2635 US-701", city: "Conway", state: "SC", zip: "29526" },
    phone: "(843) 438-8678",
    coords: { lat: 33.8655387, lng: -79.0539054 },
    hours: MS6_S1({ open: "10:30", close: "20:30" }, { open: "11:00", close: "15:30" }),
  },
  {
    id: "norman-w-main-ok",
    name: "Norman — W Main St",
    address: { street: "408 W Main St", city: "Norman", state: "OK", zip: "73069" },
    phone: "(405) 561-7400",
    coords: { lat: 35.2183695, lng: -97.4484078 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "20:00" }),
    // PLACEHOLDER — see note on shreveport-greenwood-rd-la above.
    orderingUrl: "https://example.com/sams-norman-mainst/order",
  },
  {
    id: "midwest-city-ne-10th-ok",
    name: "Midwest City — NE 10th St",
    address: { street: "9411 NE 10th St", city: "Midwest City", state: "OK", zip: "73130" },
    phone: "(405) 519-5153",
    coords: { lat: 35.478614, lng: -97.3622215 },
    hours: D7("11:00", "21:00"),
  },
  {
    id: "ada-mississippi-ave-ok",
    name: "Ada — S Mississippi Ave",
    address: { street: "620 S Mississippi Ave", city: "Ada", state: "OK", zip: "74820" },
    phone: "(580) 453-7033",
    coords: { lat: 34.7690384, lng: -96.669791 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "siloam-springs-us-412-ar",
    name: "Siloam Springs — US-412",
    address: { street: "4290 US-412", city: "Siloam Springs", state: "AR", zip: "72761" },
    phone: "(479) 373-2362",
    coords: { lat: 36.1803271, lng: -94.4975602 },
    hours: MS6_S1({ open: "10:30", close: "21:00" }, { open: "11:00", close: "20:00" }),
  },
  {
    id: "dardanelle-ar-22-ar",
    name: "Dardanelle — AR-22",
    address: { street: "1566 AR-22", city: "Dardanelle", state: "AR", zip: "72834" },
    phone: "(479) 477-3020",
    coords: { lat: 35.2287632, lng: -93.1685341 },
    // Sunday status unclear; treating as closed.
    hours: MS6_S1({ open: "10:00", close: "21:00" }, null),
  },
  {
    id: "fort-smith-phoenix-ar",
    name: "Fort Smith — Phoenix Ave",
    address: { street: "1615 Phoenix Ave", city: "Fort Smith", state: "AR", zip: "72901" },
    phone: "(479) 769-2786",
    coords: { lat: 35.3392891, lng: -94.4172164 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "little-rock-baseline-ar",
    name: "Little Rock — Baseline Rd",
    address: { street: "6205 Baseline Rd", city: "Little Rock", state: "AR", zip: "72209" },
    phone: "(501) 562-2255",
    coords: { lat: 34.6691629, lng: -92.3467677 },
    hours: [
      { day: "Mon", open: "10:00", close: "21:00" },
      { day: "Tue", open: "10:00", close: "21:00" },
      { day: "Wed", open: "10:00", close: "21:00" },
      { day: "Thu", open: "10:00", close: "21:00" },
      { day: "Fri", open: "10:00", close: "21:30" },
      { day: "Sat", open: "10:00", close: "21:30" },
      { day: "Sun", open: "11:00", close: "20:00" },
    ],
  },
  {
    id: "russellville-parkway-ar",
    name: "Russellville — E Parkway Dr",
    address: { street: "2725 E Parkway Dr", city: "Russellville", state: "AR", zip: "72802" },
    phone: "(479) 498-4746",
    coords: { lat: 35.2823365, lng: -93.1010019 },
    hours: MS6_S1({ open: "10:00", close: "21:00" }, { open: "11:00", close: "19:00" }),
  },
  {
    id: "wood-river-vaughn-il",
    name: "Wood River — Vaughn Rd",
    address: { street: "1800 Vaughn Rd", city: "Wood River", state: "IL", zip: "62095" },
    phone: "(618) 251-8011",
    coords: { lat: 38.8658713, lng: -90.069513 },
    hours: [
      { day: "Mon", open: "10:00", close: "22:00" },
      { day: "Tue", open: "10:00", close: "22:00" },
      { day: "Wed", open: "10:00", close: "22:00" },
      { day: "Thu", open: "10:00", close: "22:00" },
      { day: "Fri", open: "10:00", close: "22:00" },
      { day: "Sat", open: "10:00", close: "22:00" },
      { day: "Sun", open: "10:00", close: "21:00" },
    ],
  },
  {
    id: "havelock-w-main-nc",
    name: "Havelock — W Main St",
    address: { street: "411 W Main St", city: "Havelock", state: "NC", zip: "28532" },
    phone: "(252) 652-6108",
    coords: { lat: 34.8893736, lng: -76.9207378 },
    hours: D7("10:00", "20:40"),
  },
];

export function directionsUrl(loc: Location): string {
  const { street, city, state, zip } = loc.address;
  const dest = encodeURIComponent(`${street}, ${city}, ${state} ${zip}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

/**
 * Server-only helper. Returns the LOCATIONS array with each location's
 * `hours` field replaced by live Google Places hours where available.
 *
 * Strategy:
 *   - For every location with a `googlePlaceId`, fetch live hours in
 *     parallel. The Next.js fetch cache (revalidate: 86400) keeps the
 *     real network cost low — at most one Google call per place per day.
 *   - When live hours come back non-empty, they win over the static
 *     fallback. When they're null/empty (no key, network blip, place
 *     has no hours published), we keep the static array.
 *
 * Callers that don't need live hours (e.g. cart/order validation, JSON-LD)
 * can keep importing LOCATIONS directly. Live-hours enrichment is
 * opt-in per page.
 */
export async function getLocationsWithLiveHours(): Promise<Location[]> {
  const { fetchPlaceData } = await import("./google-places");
  const enriched = await Promise.all(
    LOCATIONS.map(async (loc) => {
      if (!loc.googlePlaceId) return { ...loc };
      const data = await fetchPlaceData(loc.googlePlaceId);
      if (!data || !data.hours || data.hours.length === 0) {
        return { ...loc };
      }
      return { ...loc, hours: data.hours };
    }),
  );
  return enriched;
}
