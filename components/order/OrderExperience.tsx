"use client";

/**
 * WHAT: Client orchestrator for /order. Lists every Sam's location
 *       with three controls per card: a primary CTA that adapts to
 *       the store's situation (an "Order online" outbound link to
 *       the location's HungerRush subdomain when location.orderUrl
 *       is set; otherwise a "Call to order" tel: link), a quick-tap
 *       phone link, and a Google Maps directions link.
 * WHY:  Sam's runs per-location HungerRush ordering subdomains; 37
 *       of 41 stores are live, the other 4 are explicitly listed as
 *       "Not accepting online orders" on samssoutherneatery.com. No
 *       fabricated URLs — when orderUrl is set, the button opens the
 *       real location page; when it's missing, the user gets a real
 *       phone link instead of a dead disabled button. Every card
 *       has an actionable primary CTA.
 * IF REMOVED: /order has no interactive surface — search, filter,
 *       and per-card controls all disappear.
 * COMMON MISTAKE: rendering an enabled "Order online" link that
 *       routes to /menu or to a guessed URL when orderUrl is
 *       missing. That's lying to the user. tel:-fallback is the
 *       honest pattern that also gives the user a working action.
 */
import { useMemo, useState, type ChangeEvent } from "react";
import { directionsUrl, type Location } from "@/lib/locations";

// Hard cap on the search input. Same threat model as MenuExperience —
// state-only, used in `.includes()` and as React text, defended in
// depth with maxLength + slice + autoComplete=off.
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
          Each store runs its own online ordering. Stores marked
          &ldquo;Call to order&rdquo; aren&apos;t set up online yet &mdash;
          tap to call them direct.
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
                {loc.orderUrl ? (
                  <a
                    href={loc.orderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Order from ${loc.name}`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-sams-red px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-sams-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
                  >
                    Order online &rarr;
                  </a>
                ) : (
                  <a
                    href={telHref(loc.phone)}
                    aria-label={`Call ${loc.name} to order — ${loc.phone}`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-sams-red/30 bg-cream px-5 py-3 text-sm font-semibold text-sams-red transition-colors hover:border-sams-red hover:bg-sams-red hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
                  >
                    Call to order &rarr;
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
