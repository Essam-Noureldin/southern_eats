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
 * !!! BEFORE LAUNCH !!! ============================================
 * The 12 locations below are SYNTHETIC. They use plausible Southern-US
 * coordinates and city names but none correspond to real Sam's Southern
 * Eatery branches. Before launch:
 *   1. Get the real 51-location list from the franchise.
 *   2. Geocode each address (Mapbox geocoder, free OSM Nominatim, or
 *      manually via Google Maps right-click → "What's here").
 *   3. Replace this array verbatim. Type errors will guide you.
 *   4. Delete this banner.
 * ==================================================================
 */
import type { LatLng } from "./distance";

export type DietaryTag =
  | "halal-fryer"
  | "gf-fryer"
  | "vegan-options"
  | "drive-thru"
  | "dine-in";

export interface Hours {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  open: string; // "11:00"
  close: string; // "22:00"
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
  dietary: DietaryTag[];
}

const STANDARD_HOURS: Hours[] = [
  { day: "Mon", open: "11:00", close: "21:00" },
  { day: "Tue", open: "11:00", close: "21:00" },
  { day: "Wed", open: "11:00", close: "21:00" },
  { day: "Thu", open: "11:00", close: "21:00" },
  { day: "Fri", open: "11:00", close: "22:00" },
  { day: "Sat", open: "11:00", close: "22:00" },
  { day: "Sun", open: "12:00", close: "20:00" },
];

export const LOCATIONS: readonly Location[] = [
  {
    id: "shreveport-la",
    name: "Shreveport — Mansfield Rd",
    address: {
      street: "5530 Mansfield Rd",
      city: "Shreveport",
      state: "LA",
      zip: "71108",
    },
    phone: "(318) 686-7100",
    coords: { lat: 32.4145, lng: -93.7702 },
    hours: STANDARD_HOURS,
    dietary: ["halal-fryer", "gf-fryer", "drive-thru", "dine-in"],
  },
  {
    id: "monroe-la",
    name: "Monroe — Louisville Ave",
    address: {
      street: "1810 Louisville Ave",
      city: "Monroe",
      state: "LA",
      zip: "71201",
    },
    phone: "(318) 322-4500",
    coords: { lat: 32.5093, lng: -92.1193 },
    hours: STANDARD_HOURS,
    dietary: ["gf-fryer", "drive-thru", "dine-in"],
  },
  {
    id: "new-orleans-la",
    name: "New Orleans — Canal St",
    address: {
      street: "1532 Canal St",
      city: "New Orleans",
      state: "LA",
      zip: "70112",
    },
    phone: "(504) 522-8810",
    coords: { lat: 29.9551, lng: -90.0715 },
    hours: STANDARD_HOURS,
    dietary: ["halal-fryer", "vegan-options", "dine-in"],
  },
  {
    id: "baton-rouge-la",
    name: "Baton Rouge — Florida Blvd",
    address: {
      street: "9810 Florida Blvd",
      city: "Baton Rouge",
      state: "LA",
      zip: "70815",
    },
    phone: "(225) 928-3300",
    coords: { lat: 30.4515, lng: -91.0686 },
    hours: STANDARD_HOURS,
    dietary: ["drive-thru", "dine-in"],
  },
  {
    id: "houston-tx",
    name: "Houston — Westheimer Rd",
    address: {
      street: "6200 Westheimer Rd",
      city: "Houston",
      state: "TX",
      zip: "77057",
    },
    phone: "(713) 783-9100",
    coords: { lat: 29.7404, lng: -95.4698 },
    hours: STANDARD_HOURS,
    dietary: ["halal-fryer", "gf-fryer", "vegan-options", "dine-in"],
  },
  {
    id: "dallas-tx",
    name: "Dallas — Lemmon Ave",
    address: {
      street: "4220 Lemmon Ave",
      city: "Dallas",
      state: "TX",
      zip: "75219",
    },
    phone: "(214) 521-7700",
    coords: { lat: 32.8204, lng: -96.8067 },
    hours: STANDARD_HOURS,
    dietary: ["halal-fryer", "drive-thru", "dine-in"],
  },
  {
    id: "jackson-ms",
    name: "Jackson — Northside Dr",
    address: {
      street: "915 E Northside Dr",
      city: "Jackson",
      state: "MS",
      zip: "39211",
    },
    phone: "(601) 366-2200",
    coords: { lat: 32.345, lng: -90.1648 },
    hours: STANDARD_HOURS,
    dietary: ["gf-fryer", "drive-thru", "dine-in"],
  },
  {
    id: "memphis-tn",
    name: "Memphis — Poplar Ave",
    address: {
      street: "5101 Poplar Ave",
      city: "Memphis",
      state: "TN",
      zip: "38117",
    },
    phone: "(901) 763-4400",
    coords: { lat: 35.1174, lng: -89.8742 },
    hours: STANDARD_HOURS,
    dietary: ["halal-fryer", "vegan-options", "dine-in"],
  },
  {
    id: "birmingham-al",
    name: "Birmingham — 280",
    address: {
      street: "3220 US-280",
      city: "Birmingham",
      state: "AL",
      zip: "35243",
    },
    phone: "(205) 967-1100",
    coords: { lat: 33.4734, lng: -86.7553 },
    hours: STANDARD_HOURS,
    dietary: ["drive-thru", "dine-in"],
  },
  {
    id: "atlanta-ga",
    name: "Atlanta — Peachtree St",
    address: {
      street: "1395 Peachtree St NE",
      city: "Atlanta",
      state: "GA",
      zip: "30309",
    },
    phone: "(404) 876-5500",
    coords: { lat: 33.7896, lng: -84.3854 },
    hours: STANDARD_HOURS,
    dietary: ["halal-fryer", "gf-fryer", "vegan-options", "dine-in"],
  },
  {
    id: "little-rock-ar",
    name: "Little Rock — Markham St",
    address: {
      street: "10301 W Markham St",
      city: "Little Rock",
      state: "AR",
      zip: "72205",
    },
    phone: "(501) 224-3300",
    coords: { lat: 34.7607, lng: -92.4172 },
    hours: STANDARD_HOURS,
    dietary: ["gf-fryer", "drive-thru", "dine-in"],
  },
  {
    id: "tulsa-ok",
    name: "Tulsa — 71st St",
    address: {
      street: "8120 E 71st St",
      city: "Tulsa",
      state: "OK",
      zip: "74133",
    },
    phone: "(918) 252-4400",
    coords: { lat: 36.0708, lng: -95.8643 },
    hours: STANDARD_HOURS,
    dietary: ["drive-thru", "dine-in"],
  },
];

export function filterLocations(
  locations: readonly Location[],
  required: readonly DietaryTag[],
): Location[] {
  if (required.length === 0) return [...locations];
  return locations.filter((loc) =>
    required.every((tag) => loc.dietary.includes(tag)),
  );
}

export function directionsUrl(loc: Location): string {
  const { street, city, state, zip } = loc.address;
  const dest = encodeURIComponent(`${street}, ${city}, ${state} ${zip}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}
