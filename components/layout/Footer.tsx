/**
 * WHAT: Site footer. Brand block + tagline + Shreveport origin, primary
 *       nav repeated, legal trio (Privacy/Terms/Cookies), copyright.
 *       Three-column grid on md+ collapsing to one on mobile.
 * WHY:  Footers are the second-chance navigation — users who scroll past
 *       the hero and don't find what they want look here. Repeating the
 *       primary nav and surfacing the legal trio is the price of entry.
 *       Charcoal background mirrors the lovable demo and contrasts the
 *       cream-tone hero we'll build above it.
 * IF REMOVED: no contentinfo landmark (a11y regression), no legal-page
 *       links (compliance regression), copyright disappears.
 * COMMON MISTAKE: hard-coding the year. `new Date().getFullYear()` runs
 *       at render — fine on the server (SSG/SSR rebuild on deploy) and
 *       on the client (hydrated value matches if rebuilt this year). If
 *       the site sat un-rebuilt across a New Year, the footer would
 *       still be correct on hydration because client renders fresh.
 */
import Link from "next/link";

const VISIT_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order Online" },
  { href: "/locations", label: "Locations" },
  { href: "/our-story", label: "Our Story" },
  { href: "/franchise", label: "Franchise" },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-charcoal pb-12 pt-16 text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-3xl font-black italic text-butter">
            Sam&apos;s
          </p>
          <p className="mt-3 text-sm leading-relaxed opacity-80">
            Home of the jumbo shrimp.
            <br />
            Fried hot. Plates piled high.
            <br />
            Shreveport, since 2008.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest opacity-60">
            Visit
          </p>
          <ul className="space-y-2 text-sm">
            {VISIT_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-butter"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest opacity-60">
            Legal
          </p>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-butter"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-wrap justify-between gap-2 border-t border-cream/10 px-6 pt-6 text-xs opacity-60 md:px-8">
        <span>&copy; {year} Sam&apos;s Southern Eatery. All rights reserved.</span>
        <span>Founded 2008 &middot; Shreveport, LA</span>
      </div>
    </footer>
  );
}
