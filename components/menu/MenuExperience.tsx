"use client";

/**
 * WHAT: Client orchestrator for /menu. Owns three pieces of behaviour
 *       on top of the static server-rendered shell:
 *         1. A search box that filters items by name + description.
 *         2. A sticky category nav rail (pills under the navbar) with
 *            scroll-spy — the pill matching the section currently in
 *            view gets the active treatment.
 *         3. An empty-state message when no items match the search.
 *       Each category section is wrapped in <Revealable> so the
 *       category fades up as it enters the viewport. Items are
 *       rendered as a responsive grid (1/2/3/4 cols).
 * WHY:  The static server-rendered grid was a wall of cards with no
 *       affordance for finding a specific dish or skimming the
 *       structure. Search + scroll-spy nav turn the menu into an
 *       exploration surface. Render still happens server-side on
 *       initial load (this client component receives data via props,
 *       so items are in the SSR HTML for SEO).
 * IF REMOVED: /menu degrades to the previous static grid.
 * COMMON MISTAKE: setting active-category state inside an effect on
 *       mount (the React 19 lint rule react-hooks/set-state-in-effect
 *       flags it). The default value is taken from the first category
 *       at lazy-init time.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import DishLink from "@/components/menu/DishLink";
import DishCard from "@/components/sections/DishCard";
import Revealable from "@/components/Revealable";
import type { Category, MenuItem } from "@/lib/menu";

interface Props {
  items: ReadonlyArray<MenuItem>;
  categories: ReadonlyArray<{ id: Category; label: string }>;
}

export default function MenuExperience({ items, categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(
    () => categories[0]?.id ?? null,
  );
  const sectionRefs = useRef(new Map<Category, HTMLElement>());

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q),
    );
  }, [items, query]);

  const visibleCategories = useMemo(() => {
    const ids = new Set(filteredItems.map((it) => it.category));
    return categories.filter((c) => ids.has(c.id));
  }, [filteredItems, categories]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-category-id");
          if (id) setActiveCategory(id as Category);
        }
      },
      // Trigger band sits in the upper part of the viewport so the
      // active pill flips when the section heading crosses the line
      // just under the sticky nav rail.
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleCategories]);

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  function jumpToCategory(catId: Category) {
    const el = sectionRefs.current.get(catId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 mb-12 border-y border-border bg-cream/95 backdrop-blur md:-mx-8">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
          <input
            type="search"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search the menu — try “shrimp” or “gumbo”…"
            aria-label="Search menu items"
            className="mb-3 w-full rounded-full border border-border bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sams-red/40"
          />
          <nav aria-label="Menu categories">
            <ul className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {visibleCategories.map((c) => {
                const isActive = activeCategory === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => jumpToCategory(c.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={
                        "whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors " +
                        (isActive
                          ? "border-sams-red bg-sams-red text-cream"
                          : "border-border bg-card text-charcoal hover:border-sams-red/50")
                      }
                    >
                      {c.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {visibleCategories.length === 0 ? (
        <p className="py-16 text-center font-display text-2xl italic text-muted-foreground">
          No matches for &ldquo;{query}&rdquo;. Try a different word.
        </p>
      ) : (
        visibleCategories.map((cat) => {
          const catItems = filteredItems.filter(
            (m) => m.category === cat.id,
          );
          return (
            <section
              key={cat.id}
              data-category-id={cat.id}
              ref={(el: HTMLElement | null) => {
                if (el) sectionRefs.current.set(cat.id, el);
                else sectionRefs.current.delete(cat.id);
              }}
              aria-labelledby={`menu-cat-${cat.id}`}
              className="mb-16 scroll-mt-40 last:mb-0"
            >
              <Revealable>
                <h2
                  id={`menu-cat-${cat.id}`}
                  className="mb-6 font-display text-3xl md:text-4xl"
                >
                  {cat.label}
                </h2>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {catItems.map((item) => (
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
              </Revealable>
            </section>
          );
        })
      )}
    </div>
  );
}
