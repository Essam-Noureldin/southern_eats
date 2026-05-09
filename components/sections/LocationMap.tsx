"use client";

/**
 * WHAT: MapLibre GL canvas with a marker per location, synced to the
 *       shared `hoveredId` highlight state.
 * WHY:  Provides spatial context the list can't — visitors instantly
 *       see whether the franchise covers their state. Free Carto basemap
 *       (no API key, no auth) keeps the demo deploy zero-config.
 * IF REMOVED: the page degrades to list-only — still functional, just
 *       less useful for spatial scanning.
 * COMMON MISTAKE: importing maplibre-gl at module top inside a "use client"
 *       file that's then statically rendered. The library reaches for
 *       window/document at import time and crashes SSR. Loading via
 *       next/dynamic({ ssr: false }) at the call site sidesteps it.
 */
import { useEffect, useRef } from "react";
import maplibregl, { Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Location } from "@/lib/locations";

interface Props {
  locations: readonly Location[];
  hoveredId: string | null;
  origin: { lat: number; lng: number } | null;
}

const CARTO_STYLE = {
  version: 8 as const,
  sources: {
    "carto-light": {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto-light-layer",
      type: "raster" as const,
      source: "carto-light",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export default function LocationMap({ locations, hoveredId, origin }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Map_marker_record>({});

  // Boot the map once on mount.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style: CARTO_STYLE as any,
      center: [-90, 33], // roughly Mississippi/Louisiana — covers the franchise footprint
      zoom: 4.4,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({}), "top-right");

    mapRef.current = map;

    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-sync markers whenever the location list changes (filtering).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Drop any markers no longer present.
    for (const id of Object.keys(markersRef.current)) {
      if (!locations.some((l) => l.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    }

    // Add markers for new locations.
    for (const loc of locations) {
      if (markersRef.current[loc.id]) continue;
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${loc.name} — ${loc.address.city}`);
      el.dataset.locationId = loc.id;
      el.className =
        "block h-3.5 w-3.5 rounded-full border-2 border-cream bg-sams-red shadow-md transition-transform";
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.coords.lng, loc.coords.lat])
        .addTo(map);
      markersRef.current[loc.id] = marker;
    }
  }, [locations]);

  // Highlight whichever marker matches hoveredId.
  useEffect(() => {
    for (const [id, marker] of Object.entries(markersRef.current)) {
      const el = marker.getElement();
      if (id === hoveredId) {
        el.style.transform = (el.style.transform || "") + " scale(1.6)";
        el.style.zIndex = "10";
      } else {
        el.style.transform = el.style.transform.replace(/ scale\([\d.]+\)/g, "");
        el.style.zIndex = "1";
      }
    }
  }, [hoveredId]);

  // Recenter on user origin once we have it.
  useEffect(() => {
    if (!origin || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [origin.lng, origin.lat],
      zoom: 7,
      duration: 1200,
    });
  }, [origin]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Map of all Sam's Southern Eatery locations"
      className="h-[500px] w-full overflow-hidden rounded-lg border border-charcoal/10 bg-cream/40"
    />
  );
}

// Helper type — keeps the markersRef record typed without polluting the public
// surface of the component.
type Map_marker_record = Record<string, Marker>;
