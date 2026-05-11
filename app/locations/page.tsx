import type { Metadata } from "next";
import LocationFinder from "@/components/sections/LocationFinder";
import { getLocationsWithLiveHours } from "@/lib/locations";

/**
 * WHAT: /locations page — owns its <main> landmark and renders the
 *       LocationFinder section with the full dataset, opening hours
 *       enriched from Google Places where each location has a
 *       googlePlaceId set.
 * WHY:  Server component (default) so the location data is in HTML on
 *       first paint — better for SEO, no waterfall before the list shows.
 *       LocationFinder itself is "use client" because it manages filter +
 *       hover state and lazy-loads the map.
 *       Live-hours merge happens here (server-side) and the augmented
 *       array is handed to the client — the client never sees an empty
 *       hours array for a place that's just slow to fetch.
 * IF REMOVED: /locations 404s.
 * COMMON MISTAKE: making this client-side too, which costs the SEO win
 *       — every location's name + address would be JS-rendered, not HTML.
 */
export const metadata: Metadata = {
  title: "Locations",
  description:
    "All 41 Sam's Southern Eatery locations across the South — find your nearest by state.",
};

export default async function LocationsPage() {
  const locations = await getLocationsWithLiveHours();
  return (
    <main>
      <LocationFinder locations={locations} />
    </main>
  );
}
