import type { Metadata } from "next";
import MenuExperience from "@/components/menu/MenuExperience";
import { categories, menu } from "@/lib/menu";

/**
 * WHAT: /menu page — full menu grouped by category. The static shell
 *       (header + container) renders server-side; the interactive
 *       experience (search, scroll-spy category nav, reveal-on-view
 *       sections) is owned by the MenuExperience client component
 *       which receives the items and categories as props.
 * WHY:  Server component for the page header so dish names + the
 *       initial grid render in HTML on first paint (SEO + no JS
 *       waterfall). MenuExperience is the single client boundary,
 *       narrowed to the search filter + scroll-spy + click-to-jump
 *       behaviours. Keeps the page itself a thin shell.
 * IF REMOVED: /menu 404s, the "See the full menu" link from the
 *       homepage carousel goes nowhere.
 * COMMON MISTAKE: rendering the items directly here bypasses the
 *       search and scroll-spy entirely. Always go through
 *       MenuExperience so the experience is consistent.
 */
export const metadata: Metadata = {
  title: "Menu",
  description:
    "The full Sam's Southern Eatery menu — hand-breaded jumbo shrimp, Mississippi catfish, po'boys, family-size platters, salads, wings, and Southern sides.",
};

export default function MenuPage() {
  return (
    <main className="bg-cream">
      <section
        aria-labelledby="menu-page-heading"
        className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24"
      >
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-sams-red">
            The full menu
          </p>
          <h1
            id="menu-page-heading"
            className="font-display text-5xl leading-tight md:text-7xl"
          >
            Hand-breaded. <em>Fried gold.</em>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Search, jump by category, or scroll the whole menu. Tap any
            plate to see the full description and an order link.
          </p>
        </header>

        <MenuExperience items={menu} categories={categories} />
      </section>
    </main>
  );
}
