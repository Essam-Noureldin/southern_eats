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
 * geocoded via OpenStreetMap Nominatim (1 req/sec, with the required
 * User-Agent header). The franchise's marketing line claims "51 locations
 * across 9 states" but the live locations page lists 41 across 11 states
 * — we use the actual published list, not the marketing copy.
 *
 * DIETARY: empty for every location until the franchise confirms which
 * branches have halal/gluten-free fryer separation, vegan options, drive-
 * thru, and dine-in. The data shape supports it; the chips render
 * automatically once a branch's `dietary` array gains entries. We do NOT
 * synthesize per-location dietary attributes — too misleading for visitors
 * with real dietary needs (and for the franchise itself during the pitch).
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
    id: "jackson-raymond-rd-ms",
    name: "Jackson — Raymond Rd",
    address: { street: "724 Raymond Rd", city: "Jackson", state: "MS", zip: "39204" },
    phone: "(769) 257-6578",
    coords: { lat: 32.283393, lng: -90.228307 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "st-louis-gravois-mo",
    name: "St. Louis — Gravois Ave",
    address: { street: "3505 Gravois Ave", city: "St. Louis", state: "MO", zip: "63118" },
    phone: "(314) 659-8619",
    coords: { lat: 38.5935516, lng: -90.2426147 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "springfield-glenstone-mo",
    name: "Springfield — N Glenstone Ave",
    address: { street: "1631 N Glenstone Ave", city: "Springfield", state: "MO", zip: "65803" },
    phone: "(417) 319-5334",
    coords: { lat: 37.2272686, lng: -93.2614594 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "mobile-dauphin-al",
    name: "Mobile — Dauphin St",
    address: { street: "3246 Dauphin St", city: "Mobile", state: "AL", zip: "36606" },
    phone: "(251) 525-9985",
    coords: { lat: 30.6894803, lng: -88.1189346 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "opelika-1st-ave-al",
    name: "Opelika — 1st Avenue",
    address: { street: "1006 1st Avenue", city: "Opelika", state: "AL", zip: "36801" },
    phone: "(334) 363-0708",
    coords: { lat: 32.6473412, lng: -85.3834723 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "eufaula-s-eufaula-ave-al",
    name: "Eufaula — S Eufaula Ave",
    address: { street: "325 South Eufaula Ave", city: "Eufaula", state: "AL", zip: "36027" },
    phone: "(334) 232-4417",
    coords: { lat: 31.8892025, lng: -85.1451299 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "shreveport-greenwood-rd-la",
    name: "Shreveport — Greenwood Rd",
    address: { street: "6122 Greenwood Rd", city: "Shreveport", state: "LA", zip: "71119" },
    phone: "(318) 631-7782",
    coords: { lat: 32.4522114, lng: -93.8622371 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "vivian-hwy-1-la",
    name: "Vivian — Highway 1",
    address: { street: "14347 Highway 1", city: "Vivian", state: "LA", zip: "71082" },
    phone: "(318) 375-2094",
    coords: { lat: 32.9040266, lng: -93.9821626 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "springhill-n-arkansas-la",
    name: "Springhill — N Arkansas St",
    address: { street: "1011 N Arkansas St", city: "Springhill", state: "LA", zip: "71075" },
    phone: "(318) 539-2558",
    coords: { lat: 33.0176462, lng: -93.4670037 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "shreveport-70th-la",
    name: "Shreveport — W 70th St",
    address: { street: "801 W 70th St", city: "Shreveport", state: "LA", zip: "71106" },
    phone: "(318) 670-7285",
    coords: { lat: 32.441906, lng: -93.771725 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "bossier-city-barksdale-la",
    name: "Bossier City — Barksdale Blvd",
    address: { street: "2910 Barksdale Blvd", city: "Bossier City", state: "LA", zip: "71112" },
    phone: "(318) 658-9980",
    coords: { lat: 32.4987967, lng: -93.6920769 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "alexandria-lee-st-la",
    name: "Alexandria — Lee St",
    address: { street: "4814 Lee St", city: "Alexandria", state: "LA", zip: "71302" },
    phone: "(318) 704-0027",
    coords: { lat: 31.263516, lng: -92.447745 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "port-allen-lobdell-la",
    name: "Port Allen — N Lobdell Hwy",
    address: { street: "1680 N Lobdell Hwy", city: "Port Allen", state: "LA", zip: "70767" },
    phone: "(225) 218-6570",
    coords: { lat: 30.4639195, lng: -91.2112302 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "baton-rouge-sherwood-la",
    name: "Baton Rouge — Sherwood Forest",
    address: { street: "3120 S Sherwood Forest Blvd", city: "Baton Rouge", state: "LA", zip: "70816" },
    phone: "(225) 256-1460",
    coords: { lat: 30.4241713, lng: -91.0520439 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "harvey-westbank-la",
    name: "Harvey — Westbank Expressway",
    address: { street: "3950 Westbank Expressway", city: "Harvey", state: "LA", zip: "70058" },
    phone: "(504) 510-2900",
    coords: { lat: 29.8952734, lng: -90.0888914 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "slidell-pontchartrain-la",
    name: "Slidell — Pontchartrain Dr",
    address: { street: "3114 Pontchartrain Dr", city: "Slidell", state: "LA", zip: "70458" },
    phone: "(985) 201-7446",
    coords: { lat: 30.2616521, lng: -89.7854777 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "laplace-belle-terre-la",
    name: "LaPlace — Belle Terre Blvd",
    address: { street: "143 Belle Terre Blvd", city: "LaPlace", state: "LA", zip: "70068" },
    phone: "(985) 359-1677",
    coords: { lat: 30.0750712, lng: -90.5006304 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "niles-youngstown-warren-oh",
    name: "Niles — Youngstown-Warren Rd",
    address: { street: "5832 Youngstown Warren Rd", city: "Niles", state: "OH", zip: "44446" },
    phone: "(330) 349-4129",
    coords: { lat: 41.2079699, lng: -80.7445049 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "youngstown-south-ave-oh",
    name: "Youngstown — South Ave",
    address: { street: "2705 South Ave", city: "Youngstown", state: "OH", zip: "44502" },
    phone: "(330) 333-3049",
    coords: { lat: 41.0724471, lng: -80.645842 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "beaumont-college-tx",
    name: "Beaumont — College St",
    address: { street: "2949 College St, Ste 115", city: "Beaumont", state: "TX", zip: "77701" },
    phone: "(409) 832-5050",
    coords: { lat: 30.0680399, lng: -94.1164765 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "pampa-hobart-tx",
    name: "Pampa — N Hobart St",
    address: { street: "220 N Hobart St", city: "Pampa", state: "TX", zip: "79065" },
    phone: "(806) 419-3005",
    coords: { lat: 35.5316396, lng: -100.9716636 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "nacogdoches-north-st-tx",
    name: "Nacogdoches — North St",
    address: { street: "1220 North St, Ste 101", city: "Nacogdoches", state: "TX", zip: "75961" },
    phone: "(936) 205-3113",
    coords: { lat: 31.6135681, lng: -94.6529476 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "amarillo-teckla-tx",
    name: "Amarillo — Teckla Blvd",
    address: { street: "4317 Teckla Blvd", city: "Amarillo", state: "TX", zip: "79109" },
    phone: "(806) 437-1349",
    coords: { lat: 35.1651255, lng: -101.8874605 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "dumas-us-87-tx",
    name: "Dumas — US-87",
    address: { street: "5928 US-87", city: "Dumas", state: "TX", zip: "79029" },
    phone: "(806) 934-5740",
    coords: { lat: 35.8636971, lng: -102.0120126 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "lufkin-timberland-tx",
    name: "Lufkin — S Timberland Dr",
    address: { street: "214 S Timberland Dr", city: "Lufkin", state: "TX", zip: "75901" },
    phone: "(936) 899-5066",
    coords: { lat: 31.3336313, lng: -94.7204745 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "lubbock-50th-w-tx",
    name: "Lubbock — 50th St (West)",
    address: { street: "4928 50th St", city: "Lubbock", state: "TX", zip: "79414" },
    phone: "(806) 701-2432",
    coords: { lat: 33.5491922, lng: -101.917807 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "lubbock-50th-e-tx",
    name: "Lubbock — 50th St (East)",
    address: { street: "811 50th St", city: "Lubbock", state: "TX", zip: "79404" },
    phone: "(806) 701-1444",
    coords: { lat: 33.5487028, lng: -101.8430336 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "haltom-city-denton-tx",
    name: "Haltom City — Denton Hwy",
    address: { street: "4616 Denton Hwy", city: "Haltom City", state: "TX", zip: "76117" },
    phone: "(817) 393-7714",
    coords: { lat: 32.8301031, lng: -97.2642219 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "texarkana-new-boston-tx",
    name: "Texarkana — New Boston Rd",
    address: { street: "2901 New Boston Rd", city: "Texarkana", state: "TX", zip: "75501" },
    phone: "(903) 255-7735",
    coords: { lat: 33.4358615, lng: -94.080738 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "brownwood-clements-tx",
    name: "Brownwood — Clements St",
    address: { street: "1113 Clements St", city: "Brownwood", state: "TX", zip: "76801" },
    phone: "(325) 203-5120",
    coords: { lat: 31.7286673, lng: -98.9800814 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "conway-us-701-sc",
    name: "Conway — US-701",
    address: { street: "2635 US-701", city: "Conway", state: "SC", zip: "29526" },
    phone: "(843) 438-8678",
    coords: { lat: 33.8655387, lng: -79.0539054 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "norman-w-main-ok",
    name: "Norman — W Main St",
    address: { street: "408 W Main St", city: "Norman", state: "OK", zip: "73069" },
    phone: "(405) 561-7400",
    coords: { lat: 35.2183695, lng: -97.4484078 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "midwest-city-ne-10th-ok",
    name: "Midwest City — NE 10th St",
    address: { street: "9411 NE 10th St", city: "Midwest City", state: "OK", zip: "73130" },
    phone: "(405) 519-5153",
    coords: { lat: 35.478614, lng: -97.3622215 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "ada-mississippi-ave-ok",
    name: "Ada — S Mississippi Ave",
    address: { street: "620 S Mississippi Ave", city: "Ada", state: "OK", zip: "74820" },
    phone: "(580) 453-7033",
    coords: { lat: 34.7690384, lng: -96.669791 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "siloam-springs-us-412-ar",
    name: "Siloam Springs — US-412",
    address: { street: "4290 US-412", city: "Siloam Springs", state: "AR", zip: "72761" },
    phone: "(479) 373-2362",
    coords: { lat: 36.1803271, lng: -94.4975602 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "dardanelle-ar-22-ar",
    name: "Dardanelle — AR-22",
    address: { street: "1566 AR-22", city: "Dardanelle", state: "AR", zip: "72834" },
    phone: "(479) 477-3020",
    coords: { lat: 35.2287632, lng: -93.1685341 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "fort-smith-phoenix-ar",
    name: "Fort Smith — Phoenix Ave",
    address: { street: "1615 Phoenix Ave", city: "Fort Smith", state: "AR", zip: "72901" },
    phone: "(479) 769-2786",
    coords: { lat: 35.3392891, lng: -94.4172164 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "little-rock-baseline-ar",
    name: "Little Rock — Baseline Rd",
    address: { street: "6205 Baseline Rd", city: "Little Rock", state: "AR", zip: "72209" },
    phone: "(501) 562-2255",
    coords: { lat: 34.6691629, lng: -92.3467677 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "russellville-parkway-ar",
    name: "Russellville — E Parkway Dr",
    address: { street: "2725 E Parkway Dr", city: "Russellville", state: "AR", zip: "72802" },
    phone: "(479) 498-4746",
    coords: { lat: 35.2823365, lng: -93.1010019 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "wood-river-vaughn-il",
    name: "Wood River — Vaughn Rd",
    address: { street: "1800 Vaughn Rd", city: "Wood River", state: "IL", zip: "62095" },
    phone: "(618) 251-8011",
    coords: { lat: 38.8658713, lng: -90.069513 },
    hours: STANDARD_HOURS,
    dietary: [],
  },
  {
    id: "havelock-w-main-nc",
    name: "Havelock — W Main St",
    address: { street: "411 W Main St", city: "Havelock", state: "NC", zip: "28532" },
    phone: "(252) 652-6108",
    coords: { lat: 34.8893736, lng: -76.9207378 },
    hours: STANDARD_HOURS,
    dietary: [],
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
