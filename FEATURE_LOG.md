# Feature Log — Sam's Southern Eatery

> One entry per shipped/parked/dropped feature: what it does, why it
> exists, key files, the branch/commit it lives on, its tests, and
> status. The fast index for "what does this site do and where is it."
> Newest work at the top of each section.
>
> **Project:** speculative marketing site for Sam's Southern Eatery —
> a 41-location US Southern-fried-seafood franchise. Built as a sales
> asset before the franchise signs.
> **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 ·
> TypeScript · Jest + Testing Library + jest-axe · MapLibre/Carto ·
> Resend · Sentry · deployed via Vercel (GitHub auto-deploy once connected).
> **Git:** repo rooted at `site/`. `main` is the shippable branch;
> merges require green scans **and** in-browser approval.

---

## Status legend

| Mark | Meaning |
|---|---|
| ✅ **Shipped** | Merged to `main`, live in the codebase |
| 🅿️ **Parked** | Built + tested, on `origin/feature-*`, NOT merged — waiting on real client data |
| ❌ **Dropped** | Deliberately not built / removed (decision recorded) |

---

## Shipped to `main`

### Real menu prices (samsofmobile.com)
- **What:** Replaced placeholder prices in `lib/menu.ts` with real
  prices read off the live samsofmobile.com ordering menu (the only
  Sam's location publishing per-item prices). Applied to the **base**
  menu so every surface (`/`, `/menu`, `/order/[id]`) uses them.
- **Why:** A credible pitch artifact needs real numbers, not invented ones.
- **Mapping discipline:** exact matches verbatim; different-portion
  items use the real nearest-portion price (tagged `// ~Mobile`); items
  not on Mobile's menu keep prior placeholder (tagged `// NO Mobile
  price`) — never invent a number (no-synthetic-data rule).
- **Caveat:** Mobile is one store; franchise prices vary. The
  per-location override system (below) is how a signed franchise sets
  real per-store prices. "Demo prices" banner stays until then.
- **Files:** `lib/menu.ts`, `tests/smoke/menu-detail-page.test.tsx`
- **Commit:** `1f89ce3` · **Tests:** 422/422

### Infinite conveyor-belt carousel ("What we're known for")
- **What:** The homepage signature-dish section is now a pure-CSS
  infinite marquee — cards glide forever, pause on hover, no buttons.
- **Why:** Reads as a busy, generous kitchen; zero JS (compositor
  thread, works without hydration).
- **How:** Same technique as `Marquee.tsx` — 3 copies, track translated
  −33.33%, loop duplicates `aria-hidden`. New `--animate-dish-marquee`
  token (60s). Deliberately freezes (not re-enabled) under
  `prefers-reduced-motion` because it carries meaningful content.
- **Files:** `components/sections/DishCarousel.tsx`, `app/globals.css`,
  `tests/unit/DishCarousel.test.tsx`
- **Commit:** `1a64841` · **Tests:** 7/7 (rewritten contract)

### Feature 2 — Per-location menu overrides
- **What:** `MenuOverride` type (`hide` / `priceOverrides` / `addItems`)
  + `getMenuForLocation(id)` helper. Every menu consumer + `/api/order`
  cart validation routes through it.
- **Why:** Franchise locations vary; this is the trust boundary — a
  tampered cart can't ship a base price when the location price differs.
- **Files:** `lib/menu.ts`, `lib/locations.ts`, `components/order/LocationMenu.tsx`,
  `app/api/order/route.ts`, `tests/unit/menu-for-location.test.ts`
- **Commits:** `be5f6ac` (+ chore `3c480be`: removed hush puppies /
  fried pickles / appetizer sampler + orphan images)

### Feature 1 — Google Places (live reviews + live hours)
- **What:** `lib/google-places.ts` server client (24h fetch-cache,
  5-review cap, null-on-failure). `Reviews` async server component
  prefers live ≥4★ newest-first, falls back to mock. `/locations`
  enriches hours from Google. Optional `Location.googlePlaceId`.
- **Why:** Franchises already maintain a Google Business Profile;
  removes the duplicate-edit chore and demos a "real" site. $0 under
  the free tier; client supplies their own API key at launch.
- **Files:** `lib/google-places.ts`, `lib/reviews.ts`,
  `components/sections/Reviews.tsx` + `ReviewCard.tsx`,
  `app/locations/page.tsx`, `lib/locations.ts`
- **Commit:** `5f3e53a` · **Tests:** +12 (MSW-mocked, no live network)

### Pre-launch audit — Tier A security + SEO
- **A1** email stub-mode hard-fails in production, PII redacted to keys
  in dev · **A2** Sentry dynamic-imported behind `shouldInitSentry()`
  (~50 KB off initial bundle) · **A3** Organization + per-location
  Restaurant JSON-LD (`lib/json-ld.ts`) · **A4** `getClientIp()`
  anti-spoof helper · **A5** `replyTo` on order email · **B8**
  `z.strictObject` on both API routes · **B12** 7 orphan images deleted
  · hydration warning silenced.
- **Commits:** `88201e5`, `6cc4e59`, `ef110f4` (+merge `4624a20`),
  `53352e2` (+merge `b9a6dca`) · **Doc:** `site/docs/AUDIT.md`

### Ordering flow (in-house demo)
- **What:** `/order` location picker → `/order/[id]` per-location menu
  + cart (CartContext, `useSyncExternalStore` + localStorage) →
  checkout form → `/api/order` (server-side cart re-pricing) →
  `/confirmation`. "Demo prices" banner on `/order/[id]`.
- **Files:** `components/order/*`, `app/order/**`, `app/api/order/route.ts`
- **Commits:** `1d6206b`, `17be5ad`

### Core site + infrastructure
- **What:** Homepage (hero, story, numbers band, dish carousel,
  reviews, marquee, locations finder w/ MapLibre+Carto map, contact),
  `/menu` + `/menu/[slug]` (View Transitions morph via native DOM API),
  `/our-story`, `/franchise`, legal trio, contact form + `/api/contact`,
  cookie consent → GA gating, Sentry scaffold, full security headers/CSP,
  15 `/docs` files, `DELIVERY_CHECKLIST.md`.
- **Infra:** GitHub Actions CI (`d04485f` — typecheck/lint/jest/build on
  every push & PR); memory-hygiene tooling `scripts/kill-background-node.ps1`
  + binding rules in `docs/CLAUDE.md` (`5983c64`).

---

## Parked on `origin` (built, tested, NOT merged — awaiting real data)

### Feature 3 — HungerRush ordering routing 🅿️
- **What:** Optional `Location.orderingUrl`. When set, the "Order
  online" CTA links to the franchise's external ordering page
  (`target="_blank" rel="noopener noreferrer"`); when unset, falls
  back to the in-house demo flow. `/order/[id]` shows a demo banner
  when a real URL exists.
- **Why parked:** Placeholder URLs (`example.com`) make the demo *worse*
  than the unified in-house flow. Revive when Sam's provides real
  per-store HungerRush URLs: swap the 2 seeded values, re-scan, FF-merge.
- **Branch:** `origin/feature-hungerrush-routing` · **Commits:**
  `85ffefa` + `579660c` · **Tests:** 3 new cases, suite green
- **Note:** This is also the **card-payment story** — HungerRush handles
  payment/PCI/receipts. Stripe-on-our-domain is an explicit $8K+ post-launch
  engagement, out of scope.

### Feature 5 — Admin panel (Basic Auth + Vercel KV) 🅿️
- **What:** `/admin` + `/admin/[id]` to edit per-location hours/phone.
  `middleware.ts` HTTP Basic Auth (timing-safe compare; 404 if
  `ADMIN_PASSWORD` unset — fail closed). `lib/location-overrides.ts`
  Vercel KV (Upstash REST) with in-memory dev fallback. Server actions
  + override-aware loaders. 64 tests.
- **Why parked:** User chose to ditch it from `main` for now (kept on
  origin, recoverable — same as Feature 3, NOT deleted).
- **Branch:** `origin/feature-admin-panel` · **Commit:** `63887cc`

---

## Dropped (deliberate non-features)

| Feature | Decision & reason |
|---|---|
| **Feature 4 — Reservations CTA** | ❌ Dropped entirely. A `tel:` link is ~30 min to add if Sam's ever asks; not worth carrying on the plan. (Pattern still captured in master-prompt v2.1 §F.) |
| **Gift cards** | ❌ Skipped. Symbolic without a real POS — a code nothing can redeem is a CS foot-gun. Defer until real ordering/POS integration. |
| **Food photography** | ❌ Out of scope. Client pays a photographer directly; the 36 AI `dish-*.jpeg` are flagged for replacement before public launch. |
| **Stripe checkout on our domain** | ❌ Out of scope. Separate $8K+ engagement (POS reconciliation, refunds, merchant account). Feature 3 / HungerRush is the payment path. |
| **CMS** | ❌ Skipped for v1. Manual content updates are part of the retainer; admin scaffolding (Feature 5) covers the common edit needs. |

---

## Key data-layer decisions (binding)

- `Location` ships optional `googlePlaceId`, `menuOverride`,
  `orderingUrl` from the start — slots exist even when unused.
- All location/menu reads go through loader helpers
  (`getMenuForLocation`, `getLocationsWithLiveHours`,
  `getLocationWithOverrides`) — never the raw array in a consumer.
- **`/api/order` re-prices the cart server-side through
  `getMenuForLocation` — the trust boundary. Never price from the
  request body.**
- No synthetic per-record data. Search the internet first; empty-state
  second; demo values only with a visible banner + core-flow necessity.
- Speculative build: `metadata.robots = noindex,nofollow` until the
  franchise signs and a real domain is pointed at Vercel.

---

## Outstanding before real launch (not code-blocked)

Flip `robots` to index; point real domain at Vercel + update
`NEXT_PUBLIC_SITE_URL`; Google Search Console + sitemap submit; real
per-store price book (replaces demo prices); real Google Place IDs;
real HungerRush URLs (revives Feature 3); solicitor review of legal
pages; SPF/DKIM/DMARC on the franchise domain; replace AI dish photos.
Full detail in `SESSION_HANDOFF.md` (workspace parent) and
`site/docs/AUDIT.md`.
