/**
 * WHAT: Numbers band — dark charcoal section with a pull-quote and
 *       four big stat tiles (locations, franchise fee, royalty,
 *       population territory).
 * WHY:  Anchors the homepage between food-focused sections and the
 *       brand story with proof of scale and a quiet franchise pitch.
 *       Charcoal + butter accent contrasts the cream-tone sections
 *       above and below.
 * IF REMOVED: homepage loses its credibility punch — no scale claim
 *       and no franchise hint above the franchise-tease section.
 * COMMON MISTAKE: animating these numbers with a count-up library on
 *       scroll. Looks gimmicky on a small four-tile band, hurts
 *       perceived legitimacy, and adds JS for no real lift.
 */
import WeightShiftHeading from "@/components/typography/WeightShiftHeading";

const STATS = [
  { value: "41", label: "Locations" },
  { value: "$25k", label: "Franchise fee" },
  { value: "6%", label: "Royalty" },
  { value: "50k", label: "Population territory" },
] as const;

export default function NumbersBand() {
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
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border-t border-cream/20 pt-4">
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
