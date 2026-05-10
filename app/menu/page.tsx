import type { Metadata } from "next";
import DishLink from "@/components/menu/DishLink";
import DishCard from "@/components/sections/DishCard";
import { categories, menu } from "@/lib/menu";

/**
 * WHAT: /menu page — full menu grouped by category. Each dish card is
 *       wrapped in a DishLink that morphs into the matching dish detail
 *       page via the browser's View Transitions API.
 * WHY:  Server component so dish names + descriptions are in HTML on
 *       first paint (SEO + no JS waterfall). DishLink is the only
 *       client boundary, narrowed to the click handler that triggers
 *       startViewTransition.
 * IF REMOVED: /menu 404s, the "See the full menu" link from the
 *       homepage carousel goes nowhere.
 * COMMON MISTAKE: rendering all dishes in one flat grid. The category
 *       sub-headings give screen-reader users a way to skip past
 *       sections they don't care about and group related items
 *       visually for everyone else.
 */
export const metadata: Metadata = {
  title: "Menu",
  description:
    "The full Sam's Southern Eatery menu — hand-breaded jumbo shrimp, Mississippi catfish, po'boys, family-size platters, and Southern sides.",
};

export default function MenuPage() {
  return (
    <main className="bg-cream">
      <section
        aria-labelledby="menu-page-heading"
        className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24"
      >
        <header className="mb-12 max-w-3xl">
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
            Twenty-eight dishes across nine categories. Tap any plate to see
            the full description, price, and an order link.
          </p>
        </header>

        {categories.map((cat) => {
          const items = menu.filter((m) => m.category === cat.id);
          if (items.length === 0) return null;
          return (
            <div key={cat.id} className="mb-16 last:mb-0">
              <h2 className="mb-6 font-display text-3xl md:text-4xl">
                {cat.label}
              </h2>
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <li key={item.id} className="list-none">
                    <DishLink
                      href={`/menu/${item.id}`}
                      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sams-red"
                    >
                      <DishCard item={item} />
                    </DishLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}
