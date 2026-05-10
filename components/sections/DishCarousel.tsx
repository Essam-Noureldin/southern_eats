/**
 * WHAT: Homepage "What we're known for" section. Filters the menu
 *       to signature items and renders a horizontally scrollable
 *       carousel of DishCards with explicit prev/next buttons.
 * WHY:  Above-the-fold appetite-bait. The carousel is still CSS
 *       scroll-snap (no library), but we drive it with buttons that
 *       call scrollBy on the container. The native scrollbar is
 *       hidden via .no-scrollbar so the only horizontal control on
 *       the section is the two buttons (mobile swipe still works).
 * IF REMOVED: homepage skips straight from hero to next section
 *       without showing what the brand actually serves.
 * COMMON MISTAKE: building this with a heavy carousel library when
 *       native scroll-snap already gives you the same UX with zero
 *       bundle weight and works without JS.
 */
"use client";
import { useRef } from "react";
import Link from "next/link";
import { menu } from "@/lib/menu";
import DishCard from "./DishCard";

export default function DishCarousel() {
  const signatures = menu.filter((m) => m.signature).slice(0, 6);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  /*
   * Scroll-by-page approach. clientWidth * 0.9 leaves a peek of the
   * adjacent card so users see there's more content; falls back to a
   * sensible fixed amount in jsdom (where clientWidth is 0).
   */
  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = (el.clientWidth || 320) * 0.9 * direction;
    el.scrollBy({ left: distance, behavior: "smooth" });
  };

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
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="hidden text-sm font-medium underline underline-offset-4 hover:text-sams-red md:inline"
            >
              See the full menu &rarr;
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous dishes"
                onClick={() => scrollByPage(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/20 bg-cream text-charcoal transition-colors hover:bg-sams-red hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next dishes"
                onClick={() => scrollByPage(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/20 bg-cream text-charcoal transition-colors hover:bg-sams-red hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
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
        <div
          ref={scrollerRef}
          className="no-scrollbar -mx-4 overflow-x-auto md:-mx-8"
        >
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
