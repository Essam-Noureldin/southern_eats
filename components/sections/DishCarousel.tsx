/**
 * WHAT: Homepage "What we're known for" section. Signature dishes ride
 *       an infinite conveyor belt — a pure-CSS marquee of DishCards
 *       that scrolls sideways forever and pauses on hover. Same
 *       seamless technique as components/sections/Marquee.tsx (the
 *       brand text band): REPEATS copies of the card set, the track
 *       translated by exactly -1/REPEATS so copy 2 lands where copy 1
 *       began — no visible seam.
 * WHY:  Above-the-fold appetite-bait that never stops moving reads as
 *       a busy, generous kitchen — on-brand for "huge portions" Sam's.
 *       Pure CSS keyframes run on the compositor thread: 60fps, zero
 *       JS, no carousel library, works without hydration. The old
 *       button-driven scroll-snap version is gone — a belt that loops
 *       forever has no "page" to step through.
 * IF REMOVED: homepage jumps hero → next section with no taste of the
 *       menu.
 * COMMON MISTAKE: forgetting to aria-hide the duplicate copies. The
 *       loop needs the cards on screen 3x; a screen reader must hear
 *       them once. Only copy 0 is in the a11y tree; copies 1..n are
 *       aria-hidden. Also: don't add .animate-dish-marquee to the
 *       reduced-motion carve-out in globals.css — this content is
 *       meaningful, so freezing (the default) is the correct a11y
 *       behaviour, unlike the decorative brand band.
 */
import { Fragment } from "react";
import Link from "next/link";
import { menu } from "@/lib/menu";
import DishCard from "./DishCard";

// Three copies = seamless loop on any reasonable viewport, matching
// Marquee.tsx. The animation translates the track by -33.333%
// (1 / REPEATS) so copy 2 ends exactly where copy 1 started.
const REPEATS = 3;

export default function DishCarousel() {
  const signatures = menu.filter((m) => m.signature);

  return (
    <section
      aria-labelledby="dish-carousel-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2
            id="dish-carousel-heading"
            className="font-display text-4xl md:text-6xl"
          >
            What we&apos;re <em>known</em> for.
          </h2>
          <Link
            href="/menu"
            className="hidden shrink-0 text-sm font-medium underline underline-offset-4 hover:text-sams-red md:inline"
          >
            See the full menu &rarr;
          </Link>
        </div>
      </div>

      {/*
       * Full-bleed belt: overflow-hidden clips the off-screen copies.
       * The track is w-max (sized to its content) so the translate
       * percentages are stable. Pause on hover so a visitor can
       * actually look at a dish — same affordance as the brand band.
       */}
      <div className="overflow-hidden">
        <ul
          data-testid="dish-belt-track"
          className="animate-dish-marquee flex w-max gap-4 px-4 hover:[animation-play-state:paused] md:gap-6 md:px-8"
        >
          {Array.from({ length: REPEATS }).map((_, copyIndex) => (
            <Fragment key={copyIndex}>
              {signatures.map((item) => (
                <li
                  key={`${copyIndex}-${item.id}`}
                  data-testid="dish-belt-card"
                  className="w-72 shrink-0 md:w-80"
                  // Copies 1..n are visual padding for the loop only —
                  // hide them from the accessibility tree so the cards
                  // are announced exactly once.
                  aria-hidden={copyIndex === 0 ? undefined : true}
                >
                  <DishCard item={item} />
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
      </div>

      {/* Mobile tail link — the desktop one sits in the header row. */}
      <div className="mx-auto mt-6 max-w-7xl px-4 md:hidden">
        <Link
          href="/menu"
          className="text-sm font-medium underline underline-offset-4 hover:text-sams-red"
        >
          See the full menu &rarr;
        </Link>
      </div>
    </section>
  );
}
