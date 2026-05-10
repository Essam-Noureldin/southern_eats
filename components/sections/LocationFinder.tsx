"use client";

/**
 * WHAT: Top-level /locations section — orchestrates filter chips, state
 *       presets that act as proximity origins, list, and (lazy-loaded)
 *       map. Holds the shared filter + hover + origin state.
 * WHY:  All three child views (filter, list, map) react to the same
 *       state — keeping it here keeps the children dumb and trivially
 *       testable. State presets are derived from LOCATIONS so adding
 *       a branch in a new state automatically surfaces a chip — no
 *       manual sync.
 * IF REMOVED: /locations has nothing to render.
 * COMMON MISTAKE: importing the map at module top — that pulls
 *       maplibre-gl into the server bundle, which crashes because the
 *       library reaches for window/document at import time. Use
 *       next/dynamic with ssr:false (below).
 */
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { sortByProximity, type LatLng } from "@/lib/distance";
import {
  filterLocations,
  type DietaryTag,
  type Location,
} from "@/lib/locations";
import DietaryFilter from "./DietaryFilter";
import LocationList from "./LocationList";

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Loading map"
      className="grid h-[500px] w-full place-items-center rounded-lg border border-charcoal/10 bg-cream/60 text-sm text-charcoal/60"
    >
      Loading map…
    </div>
  ),
});

interface Props {
  locations: readonly Location[];
}

// Full state names for the eleven US states Sam's currently operates in.
// Picking a chip filters list + map down to that state only.
const STATE_LABELS: Record<string, string> = {
  AL: "Alabama",
  AR: "Arkansas",
  IL: "Illinois",
  LA: "Louisiana",
  MO: "Missouri",
  MS: "Mississippi",
  NC: "North Carolina",
  OH: "Ohio",
  OK: "Oklahoma",
  SC: "South Carolina",
  TX: "Texas",
};

function deriveStatePresets(
  locations: readonly Location[],
): { code: string; label: string; coords: LatLng }[] {
  // One preset per unique state, using the first matching branch's coords
  // as the origin. Computed from data so the chip list stays in sync
  // automatically when franchise data changes. Sorted alphabetically by
  // label for predictable UI ordering.
  const seen = new Set<string>();
  const out: { code: string; label: string; coords: LatLng }[] = [];
  for (const loc of locations) {
    const code = loc.address.state;
    if (seen.has(code)) continue;
    seen.add(code);
    out.push({
      code,
      label: STATE_LABELS[code] ?? code,
      coords: loc.coords,
    });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export default function LocationFinder({ locations }: Props) {
  const [active, setActive] = useState<DietaryTag[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [originState, setOriginState] = useState<string | null>(null);

  const toggle = (tag: DietaryTag) =>
    setActive((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const presets = useMemo(() => deriveStatePresets(locations), [locations]);
  const activePreset = presets.find((p) => p.code === originState) ?? null;
  const origin = activePreset?.coords ?? null;

  // Apply dietary filter, then narrow to the selected state if any. Both
  // the list AND the map read from `filtered` so they stay in lockstep —
  // selecting Texas drops every non-Texas pin from the map too.
  const filtered = useMemo(() => {
    const byDiet = filterLocations(locations, active);
    if (!originState) return byDiet;
    return byDiet.filter((l) => l.address.state === originState);
  }, [locations, active, originState]);

  // Within the (possibly state-narrowed) set, still sort by proximity to
  // the state's flagship coords so cards within a state appear in a
  // sensible nearest-first order.
  const sorted = useMemo(
    () => sortByProximity(filtered, origin),
    [filtered, origin],
  );

  return (
    <section
      aria-labelledby="locations-heading"
      className="bg-cream py-section"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-3 md:mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-sams-red">
            41 locations · 11 states
          </p>
          <h1
            id="locations-heading"
            className="font-display text-4xl font-black italic text-charcoal md:text-6xl"
          >
            Find your nearest Sam&apos;s.
          </h1>
          <p className="max-w-2xl text-base text-charcoal/75 md:text-lg">
            Hand-breaded jumbo shrimp shouldn&apos;t require a road trip.
            Filter by what matters to you, jump to your state, get directions
            in one tap.
          </p>
        </div>

        <div className="mb-4">
          <DietaryFilter active={active} onToggle={toggle} />
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-charcoal/70">
          <span className="font-medium">Sort by state:</span>
          {presets.map((p) => {
            const isActive = originState === p.code;
            return (
              <button
                key={p.code}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  setOriginState((prev) => (prev === p.code ? null : p.code))
                }
                className={
                  isActive
                    ? "rounded-full border border-sams-red bg-sams-red px-3 py-1 text-xs font-semibold text-cream"
                    : "rounded-full border border-charcoal/15 bg-cream px-3 py-1 text-xs font-semibold text-charcoal hover:border-charcoal/40"
                }
              >
                {p.label}
              </button>
            );
          })}
          {originState ? (
            <button
              type="button"
              onClick={() => setOriginState(null)}
              className="ml-1 text-xs text-charcoal/60 underline-offset-4 hover:underline"
            >
              clear
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <LocationList
              locations={sorted}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          </div>
          <div className="min-h-[500px]">
            <LocationMap
              locations={filtered}
              hoveredId={hoveredId}
              origin={origin}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
