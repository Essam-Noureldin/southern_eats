"use client";

/**
 * WHAT: Client orchestrator for /order. Lists every Sam's location
 *       as a card with three controls: a "Start order" button that
 *       routes to /order/[id] (the per-location menu), a tel: phone
 *       link, and a Google Maps directions link. Includes a search
 *       input that filters by name / city / 2-letter state / street.
 * WHY:  /order is the entry to our in-house ordering flow. Each
 *       store deep-links into its own menu page; from there the user
 *       builds a cart and proceeds to checkout. The picker stays
 *       narrow in scope — it doesn't try to be a menu page itself,
 *       which would dwarf the location list.
 * IF REMOVED: /order has no interactive surface and users can't
 *       reach a location's menu.
 * COMMON MISTAKE: linking the "Start order" CTA to the global /menu
 *       page. The menu has to be scoped to a chosen location so the
 *       checkout step knows where to send the order.
 */
import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import { directionsUrl, type Location } from "@/lib/locations";

const SEARCH_MAX_LENGTH = 100;

interface Props {
  locations: ReadonlyArray<Location>;
}

/*
 * Build a tel: href from a US-formatted phone string. Strips every
 * non-digit and prefixes +1. Mobile dialers handle the parens/dashes
 * fine but tel: schemes prefer the canonical E.164 form.
 */
function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+1${digits}`;
}

export default function OrderExperience({ locations }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => {
      const haystack = [
        loc.name,
        loc.address.city,
        loc.address.state,
        loc.address.street,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [locations, query]);

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value.slice(0, SEARCH_MAX_LENGTH));
  }

  return (
    <div>
      <div className="mb-10">
        <input
          type="search"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search by city, state, or street…"
          aria-label="Search locations"
          maxLength={SEARCH_MAX_LENGTH}
          autoComplete="off"
          className="w-full rounded-full border border-border bg-card px-5 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sams-red/40"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Pick your store to start an order. Pickup only &mdash;
          delivery is rolling out per region.
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center font-display text-2xl italic text-muted-foreground">
          No locations match &ldquo;
          {query.length > 30 ? `${query.slice(0, 30)}…` : query}
          &rdquo;. Try a city or 2-letter state.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loc) => (
            <li
              key={loc.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="font-display text-xl text-charcoal">
                {loc.name}
              </h2>
              <address className="mt-2 not-italic text-sm text-muted-foreground">
                {loc.address.street}
                <br />
                {loc.address.city}, {loc.address.state} {loc.address.zip}
              </address>

              <div className="mt-4 flex flex-col gap-2 text-sm">
                <a
                  href={telHref(loc.phone)}
                  className="font-medium text-charcoal underline underline-offset-4 hover:text-sams-red"
                >
                  {loc.phone}
                </a>
                <a
                  href={directionsUrl(loc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-charcoal/80 underline underline-offset-4 hover:text-sams-red"
                >
                  Get directions &rarr;
                </a>
              </div>

              <div className="mt-auto pt-6">
                <Link
                  href={`/order/${loc.id}`}
                  aria-label={`Start order from ${loc.name}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-sams-red px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-sams-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
                >
                  Start order &rarr;
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
