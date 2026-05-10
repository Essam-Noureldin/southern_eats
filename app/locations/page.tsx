import type { Metadata } from "next";
import LocationFinder from "@/components/sections/LocationFinder";
import { LOCATIONS } from "@/lib/locations";

/**
 * WHAT: /locations page — owns its <main> landmark and renders the
 *       LocationFinder section with the full dataset.
 * WHY:  Server component (default) so the location data is in HTML on
 *       first paint — better for SEO, no waterfall before the list shows.
 *       LocationFinder itself is "use client" because it manages filter +
 *       hover state and lazy-loads the map.
 * IF REMOVED: /locations 404s.
 * COMMON MISTAKE: making this client-side too, which costs the SEO win
 *       — every location's name + address would be JS-rendered, not HTML.
 */
export const metadata: Metadata = {
  title: "Locations",
  description:
    "All 41 Sam's Southern Eatery locations across the South — find your nearest, filter by halal/gluten-free fryer, drive-thru, and more.",
};

export default function LocationsPage() {
  return (
    <main>
      <LocationFinder locations={LOCATIONS} />
    </main>
  );
}
