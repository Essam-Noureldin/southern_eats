"use client";

/**
 * WHAT: Numbers band — dark charcoal section with a pull-quote and
 *       four big stat tiles (locations, franchise fee, royalty,
 *       population territory). Tiles slide up with a stagger when the
 *       band first enters the viewport.
 * WHY:  Anchors the homepage between food-focused sections and the
 *       brand story with proof of scale and a quiet franchise pitch.
 *       Reveal-on-view lands the impact at the moment the user sees
 *       the numbers — same pattern (and same hook) as the
 *       FranchiseStatGrid on /franchise so the two grids feel
 *       of-a-kind. Charcoal + butter accent contrasts the cream-tone
 *       sections above and below.
 * IF REMOVED: homepage loses its credibility punch.
 * COMMON MISTAKE: animating these numbers with a count-up library on
 *       scroll. Looks gimmicky on a small four-tile band, hurts
 *       perceived legitimacy, and adds JS for no real lift.
 */
import { useRevealOnView } from "@/lib/use-reveal-on-view";
import WeightShiftHeading from "@/components/typography/WeightShiftHeading";

const STATS = [
  { value: "41", label: "Locations" },
  { value: "$25k", label: "Franchise fee" },
  { value: "6%", label: "Royalty" },
  { value: "50k", label: "Population territory" },
] as const;

const STAGGER_MS = 90;

export default function NumbersBand() {
  const [ref, revealed] = useRevealOnView<HTMLDivElement>();

  return (
    <section
      aria-labelledby="numbers-band-heading"
      className="bg-charcoal py-16 text-cream md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <WeightShiftHeading
          as="p"
          id="numbers-band-heading"
          className="mb-10 font-display text-3xl italic text-butter md:text-5xl"
        >
          41 locations. 11 states. One promise.
        </WeightShiftHeading>
        <div
          ref={ref}
          data-testid="numbers-band-grid"
          className={`grid grid-cols-2 gap-6 md:grid-cols-4${
            revealed ? " is-revealed" : ""
          }`}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="stat-tile border-t border-cream/20 pt-4"
              style={{ animationDelay: `${i * STAGGER_MS}ms` }}
            >
              <p className="font-display text-5xl md:text-7xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest opacity-70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
