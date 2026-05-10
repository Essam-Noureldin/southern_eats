"use client";

/**
 * WHAT: Dietary / amenity filter chips for /locations.
 * WHY:  A 51-location franchise has real heterogeneity in fryer separation
 *       (halal, gluten-free), drive-thru, and dine-in availability. The
 *       chips let visitors narrow the list to "places that fit my needs"
 *       in one tap.
 * IF REMOVED: visitors with dietary requirements have to phone every branch.
 * COMMON MISTAKE: rendering chips as <div onClick> instead of <button>.
 *       The latter is keyboard-activatable and screen-reader-announced
 *       as a control without ARIA gymnastics.
 */
import type { DietaryTag } from "@/lib/locations";

const CHIPS: { value: DietaryTag; label: string }[] = [
  { value: "drive-thru", label: "Drive-thru" },
  { value: "dine-in", label: "Dine-in" },
];

interface Props {
  active: readonly DietaryTag[];
  onToggle: (tag: DietaryTag) => void;
}

export default function DietaryFilter({ active, onToggle }: Props) {
  return (
    <ul
      role="list"
      aria-label="Filter locations by amenities"
      className="flex flex-wrap gap-2"
    >
      {CHIPS.map((chip) => {
        const isActive = active.includes(chip.value);
        return (
          <li key={chip.value}>
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => onToggle(chip.value)}
              className={
                isActive
                  ? "rounded-full border border-sams-red bg-sams-red px-4 py-1.5 text-sm font-medium text-cream transition-colors"
                  : "rounded-full border border-charcoal/15 bg-cream px-4 py-1.5 text-sm font-medium text-charcoal transition-colors hover:border-charcoal/35"
              }
            >
              {chip.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
