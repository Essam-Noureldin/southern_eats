"use client";

/**
 * WHAT: The four-tile stats band on /franchise — $25k fee / 6% royalty
 *       / 50k territory / 2008 founded. Tiles slide up with a stagger
 *       when the band first enters the viewport.
 * WHY:  Static numbers read as a spec sheet. A short rise-and-fade as
 *       the band enters view lands the impact at the moment the user
 *       sees them. Reveal logic lives in `lib/use-reveal-on-view` and
 *       is shared with NumbersBand on the homepage; the stagger is
 *       applied here via inline animationDelay per tile.
 * IF REMOVED: page works the same; tiles are just static.
 */
import { useRevealOnView } from "@/lib/use-reveal-on-view";

const TERMS = [
  { value: "$25k", label: "Franchise fee" },
  { value: "6%", label: "Royalty" },
  { value: "50k", label: "Population territory" },
  { value: "2008", label: "Founded" },
] as const;

const STAGGER_MS = 90;

export default function FranchiseStatGrid() {
  const [ref, revealed] = useRevealOnView<HTMLDListElement>();

  return (
    // suppressHydrationWarning: useRevealOnView intentionally returns
    // true on SSR (visible to crawlers / no-JS) and false on the client's
    // first paint (so the reveal animation plays). The flag allows that
    // server/client className diff without React falling back to a
    // client-only re-render.
    <dl
      ref={ref}
      suppressHydrationWarning
      className={`mt-10 grid grid-cols-2 gap-8 border-t border-cream/20 pt-10 md:grid-cols-4 md:gap-6${
        revealed ? " is-revealed" : ""
      }`}
    >
      {TERMS.map((t, i) => (
        <div
          key={t.label}
          className="stat-tile"
          style={{ animationDelay: `${i * STAGGER_MS}ms` }}
        >
          <dt className="text-xs uppercase tracking-widest opacity-70">
            {t.label}
          </dt>
          <dd className="mt-1 font-display text-5xl md:text-7xl">{t.value}</dd>
        </div>
      ))}
    </dl>
  );
}
