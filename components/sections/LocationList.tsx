"use client";

/**
 * WHAT: Sorted, hover-aware list of locations for the /locations page.
 * WHY:  This is the keyboard- and screen-reader-accessible equivalent of
 *       the map. Both views read from the same data and share a single
 *       `hoveredId` so hovering a card lights up its pin and vice versa.
 * IF REMOVED: visitors who can't (or don't want to) use the map have no
 *       way to compare branches.
 * COMMON MISTAKE: putting onMouseEnter only — keyboard users never fire
 *       mouse events. We also handle onFocus/onBlur so a keyboard tab
 *       through the cards triggers the same map-pin highlight.
 */
import { directionsUrl, type Location } from "@/lib/locations";
import type { WithDistance } from "@/lib/distance";

interface Props {
  locations: WithDistance<Location>[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

const formatDistanceKm = (km: number | null): string | null => {
  if (km === null) return null;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
};

const todayHours = (loc: Location): string => {
  const days: Location["hours"][number]["day"][] = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
  ];
  const today = days[new Date().getDay()];
  const slot = loc.hours.find((h) => h.day === today);
  return slot ? `${slot.open} – ${slot.close}` : "Closed today";
};

export default function LocationList({ locations, hoveredId, onHover }: Props) {
  if (locations.length === 0) {
    return (
      <p className="rounded-lg border border-charcoal/10 bg-cream/60 p-6 text-charcoal/70">
        No locations match every filter you&apos;ve picked. Try removing one.
      </p>
    );
  }

  return (
    <ul role="list" className="flex flex-col gap-3">
      {locations.map((loc) => {
        const isHovered = hoveredId === loc.id;
        const distance = formatDistanceKm(loc.distanceKm);
        return (
          <li
            key={loc.id}
            onMouseEnter={() => onHover(loc.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(loc.id)}
            onBlur={() => onHover(null)}
            className={
              isHovered
                ? "rounded-lg border border-sams-red bg-cream p-4 shadow-sm transition-shadow"
                : "rounded-lg border border-charcoal/10 bg-cream p-4 transition-shadow hover:border-charcoal/25"
            }
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-charcoal">
                {loc.name}
              </h2>
              {distance ? (
                <span className="text-xs font-medium uppercase tracking-wider text-sams-red">
                  {distance}
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-sm text-charcoal/75">
              {loc.address.street}, {loc.address.city}, {loc.address.state}{" "}
              {loc.address.zip}
            </p>

            <p className="mt-1 text-xs text-charcoal/60">
              <span className="font-semibold">Today:</span> {todayHours(loc)}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <a
                href={`tel:${loc.phone.replace(/[^\d+]/g, "")}`}
                className="font-medium text-sams-red underline-offset-4 hover:underline"
              >
                {loc.phone}
              </a>
              <a
                href={directionsUrl(loc)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-charcoal underline-offset-4 hover:underline"
              >
                Get directions →
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
