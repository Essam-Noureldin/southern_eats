"use client";

/**
 * WHAT: Top-level /locations section — orchestrates filter chips,
 *       proximity sort, geolocation prompt, list, and (lazy-loaded)
 *       map. Holds the shared filter + hover + origin state.
 * WHY:  All three child views (filter, list, map) react to the same
 *       state — keeping it here keeps the children dumb and trivially
 *       testable.
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

type GeoState =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "ready"; origin: LatLng; label: string }
  | { kind: "denied" }
  | { kind: "unsupported" };

// City presets — work as a fallback when geolocation is unavailable
// (HTTP origin, browser permission denied, visitor outside the US testing
// the demo). Each preset acts identically to a successful geolocation.
const CITY_PRESETS: { id: string; label: string; coords: LatLng }[] = [
  { id: "shreveport", label: "Shreveport", coords: { lat: 32.5252, lng: -93.7502 } },
  { id: "houston", label: "Houston", coords: { lat: 29.7604, lng: -95.3698 } },
  { id: "atlanta", label: "Atlanta", coords: { lat: 33.749, lng: -84.388 } },
  { id: "nyc", label: "New York", coords: { lat: 40.7128, lng: -74.006 } },
];

export default function LocationFinder({ locations }: Props) {
  const [active, setActive] = useState<DietaryTag[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoState>({ kind: "idle" });

  const toggle = (tag: DietaryTag) =>
    setActive((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const filtered = useMemo(
    () => filterLocations(locations, active),
    [locations, active],
  );

  const origin = geo.kind === "ready" ? geo.origin : null;
  const sorted = useMemo(
    () => sortByProximity(filtered, origin),
    [filtered, origin],
  );

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo({ kind: "unsupported" });
      return;
    }
    setGeo({ kind: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGeo({
          kind: "ready",
          label: "your location",
          origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      () => setGeo({ kind: "denied" }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  const selectCityPreset = (preset: (typeof CITY_PRESETS)[number]) => {
    setGeo({ kind: "ready", origin: preset.coords, label: preset.label });
  };

  return (
    <section
      aria-labelledby="locations-heading"
      className="bg-cream py-section"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-3 md:mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-sams-red">
            51 locations · 9 states
          </p>
          <h1
            id="locations-heading"
            className="font-display text-4xl font-black italic text-charcoal md:text-6xl"
          >
            Find your nearest Sam&apos;s.
          </h1>
          <p className="max-w-2xl text-base text-charcoal/75 md:text-lg">
            Hand-breaded jumbo shrimp shouldn&apos;t require a road trip.
            Search the map, filter by what matters to you, get directions
            in one tap.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <DietaryFilter active={active} onToggle={toggle} />
          <button
            type="button"
            onClick={requestLocation}
            disabled={geo.kind === "requesting"}
            className="self-start rounded-full border border-charcoal/20 bg-cream px-5 py-2 text-sm font-medium text-charcoal transition-colors hover:border-sams-red hover:text-sams-red disabled:cursor-not-allowed disabled:opacity-60"
          >
            {geo.kind === "requesting"
              ? "Locating…"
              : geo.kind === "ready"
                ? `Sorted by ${geo.label} ✓`
                : "Use my location"}
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-charcoal/70">
          <span className="font-medium">Or jump to:</span>
          {CITY_PRESETS.map((p) => {
            const isActive =
              geo.kind === "ready" && geo.label === p.label;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectCityPreset(p)}
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
        </div>

        {geo.kind === "denied" ? (
          <p className="mb-4 rounded-md border border-sams-red/30 bg-sams-red/5 px-4 py-2 text-sm text-charcoal/80">
            Couldn&apos;t access your location. You can still scroll the
            list below.
          </p>
        ) : null}
        {geo.kind === "unsupported" ? (
          <p className="mb-4 rounded-md border border-charcoal/20 bg-cream/60 px-4 py-2 text-sm text-charcoal/80">
            Your browser doesn&apos;t support geolocation. The list works
            fine without it.
          </p>
        ) : null}

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
