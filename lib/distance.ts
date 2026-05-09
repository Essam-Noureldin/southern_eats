/**
 * WHAT: Haversine great-circle distance in kilometres + a small helper
 *       that sorts a list of items by proximity to an origin point.
 * WHY:  Powers the "nearest location" UX on /locations. Pure-functional
 *       so it's trivially testable and shared by both the list (sort)
 *       and the map (display "X km away" labels).
 * IF REMOVED: list cannot be sorted by proximity; geolocation-based
 *       discovery falls back to whatever order the data ships in.
 * COMMON MISTAKE: forgetting to convert degrees → radians before the
 *       trig calls. JavaScript's Math.{sin,cos,atan2} all expect radians.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLng = Math.sin(dLng / 2);
  const h =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfDLng * sinHalfDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

export interface Locatable {
  coords: LatLng;
}

export type WithDistance<T> = T & { distanceKm: number | null };

export function sortByProximity<T extends Locatable>(
  items: readonly T[],
  origin: LatLng | null,
): WithDistance<T>[] {
  // Defensive copy — never mutate input.
  const enriched: WithDistance<T>[] = items.map((item) => ({
    ...item,
    distanceKm: origin ? haversineKm(item.coords, origin) : null,
  }));

  if (!origin) return enriched;

  return enriched.sort(
    (x, y) => (x.distanceKm ?? Infinity) - (y.distanceKm ?? Infinity),
  );
}
