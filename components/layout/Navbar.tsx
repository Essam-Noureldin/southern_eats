"use client";

/**
 * WHAT: Sticky header. Brand wordmark + four nav links + Order Online
 *       CTA on desktop; hamburger -> fullscreen overlay on mobile.
 * WHY:  Always-visible navigation is the price of entry for a marketing
 *       site. Sticky keeps Order Online one click away on long pages.
 *       Mobile overlay (instead of inline collapse) keeps the nav
 *       comfortable on small screens.
 * IF REMOVED: site has no top-level navigation; users can only reach
 *       linked sections by scrolling.
 * COMMON MISTAKE: rendering nav links twice (once for desktop, once for
 *       mobile) without keying them differently — React warns. Here the
 *       desktop and mobile renders use distinct keyed maps.
 */
import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/locations", label: "Locations" },
  { href: "/our-story", label: "Our Story" },
  { href: "/franchise", label: "Franchise" },
] as const;

const HamburgerIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-6 w-6"
  >
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-6 w-6"
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="flex items-baseline gap-2 font-display text-xl font-black italic text-sams-red"
        >
          Sam&apos;s
          <span className="font-body text-[10px] not-italic font-semibold tracking-widest text-charcoal">
            SOUTHERN EATERY
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((n) => (
            <Link
              key={`desktop-${n.href}`}
              href={n.href}
              className="text-charcoal transition-colors hover:text-sams-red"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/order"
            className="hidden rounded-full bg-sams-red px-5 py-2 text-sm font-semibold text-cream transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            Order Online
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 text-charcoal md:hidden"
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-50 flex flex-col bg-cream md:hidden"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-display text-xl font-black italic text-sams-red">
              Sam&apos;s
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 text-charcoal"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="flex flex-col gap-6 px-6 pt-8 font-display text-3xl italic">
            {NAV_LINKS.map((n) => (
              <Link
                key={`mobile-${n.href}`}
                href={n.href}
                onClick={() => setOpen(false)}
                className="text-charcoal hover:text-sams-red"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-fit rounded-full bg-sams-red px-6 py-3 font-body text-base font-semibold not-italic text-cream"
            >
              Order Online
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
