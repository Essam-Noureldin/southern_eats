/**
 * WHAT: Homepage "What we're known for" section. Filters the menu
 *       to signature items and renders a horizontally scrollable
 *       carousel of DishCards.
 * WHY:  Above-the-fold appetite-bait. The carousel is CSS-only
 *       (overflow-x + scroll-snap) — no JS, no a11y traps, swipes
 *       on mobile and scrolls with the trackpad on desktop.
 * IF REMOVED: homepage skips straight from hero to next section
 *       without showing what the brand actually serves.
 * COMMON MISTAKE: building this with a heavy carousel library when
 *       native scroll-snap already gives you the same UX with zero
 *       bundle weight and works without JS.
 */
import Link from "next/link";
import { menu } from "@/lib/menu";
import DishCard from "./DishCard";

export default function DishCarousel() {
  const signatures = menu.filter((m) => m.signature).slice(0, 6);

  return (
    <section
      aria-labelledby="dish-carousel-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2
            id="dish-carousel-heading"
            className="font-display text-4xl md:text-6xl"
          >
            What we&apos;re <em>known</em> for.
          </h2>
          <Link
            href="/menu"
            className="hidden text-sm font-medium underline underline-offset-4 hover:text-sams-red md:inline"
          >
            See the full menu &rarr;
          </Link>
        </div>
        {/*
         * Negative horizontal margins on the scroll container bleed
         * the carousel to the edges of the parent's padding, then the
         * inner flex re-applies the same padding so the FIRST card's
         * left edge lines up exactly with the heading above. Without
         * this nesting, the previous version had overflow-x-auto on a
         * full-viewport-width div outside max-w-7xl, which let cards
         * extend past the heading's right edge on wide screens (the
         * bug Essam flagged: ~510px left gutter vs ~120px right).
         */}
        <div className="-mx-4 overflow-x-auto md:-mx-8">
          <div className="flex snap-x snap-mandatory gap-4 px-4 pb-4 md:gap-6 md:px-8">
            {signatures.map((item) => (
              <div
                key={item.id}
                className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[24%]"
              >
                <DishCard item={item} />
              </div>
            ))}
          </div>
        </div>
        {/* Mobile-only tail link, since the desktop "See the full menu" lives in the header row above */}
        <div className="mt-4 md:hidden">
          <Link
            href="/menu"
            className="text-sm font-medium underline underline-offset-4 hover:text-sams-red"
          >
            See the full menu &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
