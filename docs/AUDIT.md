# Pre-Vercel Audit — Sam's Southern Eatery

> Generated 2026-05-11 by a four-agent investigation: two web-research passes (security gaps + efficiency gaps in AI-built Next.js apps in 2025–2026) and two code-audit passes against the actual codebase. This document is the synthesised punch list, ordered by what to fix and when.

## TL;DR — three tiers of work

| Tier | When | Items |
|---|---|---|
| **A. Block real launch** | Before flipping `metadata.robots = index,follow` | A1–A6 |
| **B. Pre-launch hardening** | Within 1 week of franchise signing | B1–B12 |
| **C. Polish / future-proofing** | Nice to have | C1–C20 |

Nothing here blocks deploying the **speculative `noindex,nofollow`** demo to Vercel today. The current build is unusually well-structured for a multi-session Claude Code project — server/client boundaries are mostly right, `useSyncExternalStore` is used correctly, server-side cart resolution closes the obvious tampering vectors, every form has honeypot + rate-limit + sanitize, every image goes through `next/image`. The findings below are the gap between "solid speculative build" and "real production site for a 51-location franchise."

---

## Tier A — Block real launch (flip-the-noindex-switch gates)

### A1. Stub-mode email handler logs full PII to production logs

**Files:** `lib/email.ts:40`, `lib/email.ts:122`

When `RESEND_API_KEY` or `CONTACT_FORM_FROM_EMAIL` is empty, both `sendContactEmail` and `sendOrderEmail` run `console.log("[email:stub-mode...]", payload)` and return `{ ok: true, mode: "stub" }`. Payload includes customer **name, email, phone, message**. On Vercel this lands in Runtime Logs (team-readable, retained per plan) — and stub-mode silently returns success so a misconfigured prod deploy looks healthy while emails never send and PII piles up.

**Fix:**
```ts
if (!apiKey || !from) {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "Email not configured" };
  }
  console.log("[email:stub-mode]", { mode: "stub", payloadKeys: Object.keys(payload) });
  return { ok: true, mode: "stub" };
}
```

**Severity:** High. **Why AI missed it:** stub-mode was designed for dev — neither agent considered "what if this hits prod with empty env vars."

---

### A2. Sentry browser SDK ships ~50 KB to every visitor even when DSN is empty

**File:** `instrumentation-client.ts:11`

Top-level `import * as Sentry from "@sentry/nextjs"` is unconditional. The `shouldInitSentry()` gate only stops the *init call* — the whole SDK is still in the client bundle. On the speculative `noindex` deploy (DSN empty) every page ships 50 KB of dead Sentry code.

**Fix:** dynamic import, mirroring the server file:
```ts
export async function register() {
  if (!shouldInitSentry()) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({ /* ... */ });
}

export const onRouterTransitionStart = shouldInitSentry()
  ? (await import("@sentry/nextjs")).captureRouterTransitionStart
  : () => {};
```

**Severity:** High. **Why AI missed it:** the server `instrumentation.ts` was correctly dynamic but the client file copied the pattern wrong.

---

### A3. No `LocalBusiness` / `Restaurant` JSON-LD anywhere

**Files to add:** `app/layout.tsx` (Organization), `app/locations/[slug]/page.tsx` or each `/order/[id]/page.tsx` (Restaurant).

Grep for `application/ld+json` across the repo returned zero matches. A 41-location restaurant marketing site without structured data forfeits Google Knowledge Panel, "open now" rich snippets, Maps integration, and recipe carousels. The data is already structured in `lib/locations.ts` — just emit it.

**Fix:** one `<script type="application/ld+json">` per location with schema.org `Restaurant` (`address`, `geo`, `openingHoursSpecification`, `telephone`, `servesCuisine`), one site-wide `Organization` block in root layout. Vercel's `JsonLd` helper or hand-rolled JSON in `<Script type="application/ld+json" strategy="afterInteractive">`.

**Severity:** High. **Why AI missed it:** structured data isn't surfaced by build/lint/tests — invisible to the agent feedback loop.

---

### A4. IP spoofing trivially defeats both rate limiters

**Files:** `app/api/contact/route.ts:50`, `app/api/order/route.ts:53`

`clientIp()` reads `x-forwarded-for.split(',')[0]` — the **first** (client-supplied) value. On Vercel the trustworthy IP is in `x-real-ip` (Vercel-set) or the **last** entry of `x-forwarded-for` (Vercel-appended). Today an attacker rotating the prefix gets a fresh rate-limit bucket per request.

**Fix:**
```ts
function clientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (!fwd) return "unknown";
  const parts = fwd.split(",").map(s => s.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "unknown";
}
```

**Severity:** High. **Why AI missed it:** training data over-represents the naive "first IP in X-Forwarded-For" pattern from pre-CDN-era tutorials.

---

### A5. Order email has no `replyTo`; customer reply path is dead

**File:** `lib/email.ts:131–136`

`sendContactEmail` sets `replyTo: payload.email`. `sendOrderEmail` does not — and the order schema doesn't even collect email. When franchise staff hit "Reply" on an order notification they reply to the Resend `from:` address (likely `onboarding@resend.dev`), not the customer.

**Fix (cheapest):** route replies to the staff inbox so threads stay internal:
```ts
replyTo: process.env.CONTACT_FORM_TO_EMAIL,
```
**Fix (better):** add an optional `email` field to the checkout form and route `replyTo` to the customer.

**Severity:** High (correctness with a security flavour — staff who forward an unreachable thread leak the customer's phone number).

---

### A6. Resend domain SPF / DKIM / DMARC not set up

Resend handles SPF/DKIM automatically on domain verification, but **DMARC** requires a manual TXT record. Gmail's bulk-sender enforcement (Nov 2024 onward) bounces non-compliant mail. The franchise's domain MUST have:

```
_dmarc.<domain>  TXT  "v=DMARC1; p=quarantine; rua=mailto:postmaster@<domain>"
```

Plus the SPF/DKIM records the Resend dashboard generates on domain verify.

**Severity:** High (deliverability). **Why AI missed it:** outside the codebase entirely.

---

## Tier B — Pre-launch hardening

### B1. CSP allows `'unsafe-inline'` in `script-src`

**File:** `lib/security-headers.ts:31`

The comment justifies it (Next.js bootstrap), but with `'unsafe-inline'` set, the whole CSP is mostly cosmetic against XSS. The modern pattern is per-request nonce via `middleware.ts` + `'strict-dynamic'`.

**Fix:** add `middleware.ts` that generates a per-request nonce, emits it in both the CSP and a request header (`x-nonce`), and have layout read it via `headers()` to attach to `<Script nonce>`. Trade-off: every page becomes dynamic. For this 20-page marketing site that's fine.

**Reference:** [nextjs.org/docs/app/guides/content-security-policy](https://nextjs.org/docs/app/guides/content-security-policy)

---

### B2. In-memory rate limiter is per-instance on Vercel serverless

**File:** `lib/rate-limit.ts:41`

Vercel spawns N concurrent serverless instances under load; each gets its own `Map`. Effective rate limit = `RATE_LIMIT_MAX × N`. Combined with A4 (spoofable IP), the defence is thin.

**Fix:** Vercel Marketplace → Upstash Redis (one-click) → swap `Map` for `@upstash/ratelimit`. Module's exported API doesn't change; only the internals.

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "10 m"),
});
```

---

### B3. Sentry server init lacks PII scrubbers

**File:** `instrumentation.ts:21–32`

No `beforeSend`, no `sendDefaultPii: false`. The first `/api/contact` 500 will ship the customer's email + message into Sentry.

**Fix:**
```ts
Sentry.init({
  dsn,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.request?.data) delete event.request.data;
    if (event.request?.cookies) delete event.request.cookies;
    return event;
  },
});
```

---

### B4. WeightShiftHeading runs an 11-threshold IntersectionObserver per heading

**File:** `components/typography/WeightShiftHeading.tsx:68`

Used on `/our-story` (4×), `/franchise` (3×), `StoryTease`, `FranchiseTease`. 8–10 observers × 11 thresholds × `setState` on every threshold crossing = 80–100 React renders/sec during scroll. Probably the biggest source of main-thread jank on long pages.

**Fix (cheap):** drop to 4 thresholds. **Fix (proper):** replace with CSS `animation-timeline: view()` + a single custom-property animation; falls back gracefully on older browsers.

---

### B5. `clearCart()` runs in a `useEffect` on the confirmation page

**File:** `components/order/OrderConfirmation.tsx:116–118`

`useEffect(() => { clearCart(); }, [clearCart])` writes to localStorage → flips the `useSyncExternalStore` snapshot → re-renders this component → `useCart` returns a new memoized value → `clearCart` identity changes → effect re-fires. Idempotent today, but it's a double-fire and a set-state-in-effect-in-spirit violation. Also wipes the cart even on the "we can't find that order" fallback branch.

**Fix:** clear the cart inside `CheckoutForm.tsx:onSubmit` immediately after `sessionStorage.setItem(...)`:
```ts
window.sessionStorage.setItem(`sams_order_${data.orderId}`, JSON.stringify(data.summary));
clearCart(); // from useCart() — already imported
router.push(...);
```
Then remove the `useEffect` and the `useCart()` import from `OrderConfirmation` entirely.

---

### B6. MobileOrderBar floats over the checkout Submit button

**File:** `components/layout/MobileOrderBar.tsx` rendered by `app/layout.tsx`.

The bar appears at the bottom of every page, including `/order/[id]/checkout`, where it sits above the "Place order" button on mobile — two competing CTAs pointing different places.

**Fix:** in `MobileOrderBar` (already client), read `usePathname()` and return null when path starts with `/order/`. Or move it to a non-`/order/` layout segment.

---

### B7. Customer name + phone written to sessionStorage in cleartext

**File:** `components/order/CheckoutForm.tsx:125`

The full order summary (incl. `customer.name`, `customer.phone`) gets JSON.stringify'd into `sessionStorage[sams_order_<orderId>]`. Combined with B1 (`'unsafe-inline'`), any reflected XSS reads it trivially. Also: `?orderId=...` rides in the URL → referrers, server logs.

**Fix:**
- Strip `phone` from the stashed summary; render `"•••• ••• " + phone.slice(-4)` on confirmation.
- After parsing on confirmation mount, delete the sessionStorage key (also fixes M8 unbounded growth).
- Optional: pass orderId via `router.push` state instead of URL.

---

### B8. zod `.passthrough()` lets bot payloads ride along

**Files:** `app/api/contact/route.ts:48`, `app/api/order/route.ts:51`

`passthrough()` accepts unknown extra fields. zod v4 strips prototype-pollution keys so this isn't an injection hole, but `.strict()` rejects unknown keys outright — a small additional bot signal at zero cost.

**Fix:** swap `.passthrough()` for `.strict()` (the honeypot field is already declared on the schema so it's not rejected).

---

### B9. Belt-and-braces sanitiser inside the email layer

**File:** `lib/email.ts:52`

`subject` interpolates `payload.name`. Route handlers run `sanitizeString()` before calling, which strips `\r\n`, so today's path is safe — but the defence depends on the *caller*. A future entry point that skips sanitization re-opens CRLF/header injection.

**Fix:** scrub inside `sendContactEmail` / `sendOrderEmail` itself:
```ts
const safeName = payload.name.replace(/[\r\n\x00-\x1F\x7F]/g, "").slice(0, 200);
```

---

### B10. Predictable, non-cryptographic `orderId`

**File:** `app/api/order/route.ts:73–79`

Six base36 chars from `Math.random()` = ~31 bits of non-crypto randomness. Today only used as a sessionStorage key + URL param so exposure is low, but the comment already acknowledges the design debt.

**Fix:** one-line swap:
```ts
function makeOrderId(): string {
  return "ord_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
```

---

### B11. Honeypot field name is a single static constant

**File:** `lib/honeypot.ts:34`

`HONEYPOT_FIELD_NAME = "website_url"` across every request and every deploy. Once a targeted operator scrapes the HTML and learns to skip `website_url`, the honeypot drops to zero defence.

**Fix:** rotate per-deploy. Derive deterministically from a hash of `NEXT_PUBLIC_SITE_URL + buildId`. Centralised access via `getHoneypotFieldName()` is already there — only the constant computation changes.

---

### B12. Delete dead `.jpg` duplicates from `public/images/`

**Files:** `dish-catfish.jpg`, `dish-chicken.jpg`, `dish-familyfry.jpg`, `dish-greentomatoes.jpg`, `dish-poboy.jpg`, `dish-samspecial.jpg`, `hero-shrimp.jpg`, and matching `.jpeg` duplicates where both exist.

None of the `.jpg` variants are referenced in `lib/menu.ts` (which standardised on `.jpeg`). Total dead weight in the deploy: ~0.9 MB.

**Fix:** `git rm` them. Verify `hero-shrimp.jpg` isn't referenced anywhere via grep first (the SESSION_HANDOFF already flagged it as orphan).

---

## Tier C — Polish / future-proofing

### C1. Add COOP + CORP response headers
**File:** `lib/security-headers.ts:48–65`. Add `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-origin`. Hold off on COEP — it breaks MapLibre Carto tile loading.

### C2. Tighten `Permissions-Policy` to deny-all-unused
**File:** `lib/security-headers.ts:58–60`. Currently denies only camera/microphone/geolocation. Add `accelerometer=(), autoplay=(), display-capture=(), encrypted-media=(), fullscreen=(self), gamepad=(), gyroscope=(), magnetometer=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), web-share=(), xr-spatial-tracking=()`.

### C3. Add `images.formats: ['image/avif', 'image/webp']` to `next.config.ts`
~20–30% smaller than WebP on most photos.

### C4. Phone schema accepts garbage punctuation
**File:** `app/api/order/route.ts:46`. `+++++++` passes today. Fix: `if (cleaned.replace(/\D/g, "").length < 7) return null;` inside `sanitizePhone`.

### C5. Hero image: switch to `fill sizes="100vw"`
**File:** `components/sections/Hero.tsx:26–33`. Currently `width={1920} height={1080}` + `h-full w-full object-cover` — drop width/height, use `fill`, add `sizes`.

### C6. `lib/menu.ts` typed mutable; should be `readonly`
**File:** `lib/menu.ts:61, 91`. `export const menu: readonly MenuItem[] = [...]`.

### C7. Client components re-importing `lib/menu.ts` ships the table to the browser
**Files:** `components/order/LocationMenu.tsx:27`, `components/order/CheckoutForm.tsx:25`. ~12–18 KB minified. Pass the data as props from the server page (the pattern `MenuExperience` already uses).

### C8. `DishCarousel` is client-only for two arrow buttons
**File:** `components/sections/DishCarousel.tsx:16`. Extract a small `<CarouselArrows scrollerRef />` client island; keep `DishCarousel` server.

### C9. `MenuExperience` filters items twice per render
**File:** `components/menu/MenuExperience.tsx:174–177`. Build `Record<Category, MenuItem[]>` once in `useMemo`; iterate in render.

### C10. `MenuExperience` IntersectionObserver rebuilt on every keystroke
**File:** `components/menu/MenuExperience.tsx:71–93`. Depend on `visibleCategories.map(c => c.id).join(',')`, not the array reference.

### C11. DRY `Revealable` component onto `useRevealOnView` hook
Acceptable duplication today; refactor when touched.

### C12. Centralise env reads through `lib/env`
**Files:** `app/api/contact/route.ts`, `app/api/order/route.ts` (`Number(process.env.RATE_LIMIT_*)`); `lib/email.ts` (`process.env.RESEND_API_KEY` etc); `app/layout.tsx` (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SITE_URL`); `next.config.ts` (Sentry build vars). Policy stated in `lib/env.ts:13`, drift everywhere else.

### C13. Dead code: `_tooFast` computed and discarded
**File:** `app/api/contact/route.ts:97–107`. Either combine with the rate-limit signal or delete the timing branch + `renderedAt` from the schema.

### C14. Dead code: `getCspReportUrl()` exported, tested, never imported
**File:** `lib/sentry.ts:32`. Either wire CSP `report-to` to point at it, or delete.

### C15. `Math.random()`-shaped console allowances
**File:** `eslint.config.mjs`. Add `"no-console": ["error", { allow: ["warn", "error"] }]`.

### C16. `Footer` uses `new Date().getFullYear()` at render time
**File:** `components/layout/Footer.tsx:35`. SSG bakes the year; if not redeployed in 12 months it reads stale. Document or accept.

### C17. `LocationList` calls `new Date().getDay()` at render → SSG-time TZ
**File:** `components/locations/LocationList.tsx:28`. Render `null` server-side, resolve "today" on client.

### C18. Universal `*` reduced-motion kill freezes animations at their **end** keyframe
**File:** `app/globals.css:217`. `iteration-count: 1` means animations end at 100% — `signature-pulse` ends with 0 alpha, so the badge disappears under reduced-motion.

### C19. `LocationMap` style typed `as any`
**File:** `components/sections/LocationMap.tsx:69`. Import real `StyleSpecification` from `@maplibre/maplibre-gl-style-spec`.

### C20. axe `region` rule disabled in 14 smoke tests
Audit each — most are component-in-isolation tests where wrapping the render in a `<main>` is the right fix instead of disabling the rule globally.

---

## What the audit found done well

So this list isn't all doom — the baseline is solid:

- **Server-side total recomputation** in `/api/order` — client-supplied prices are never trusted. The "100× Family Pack at $0.01" attack the route docblock calls out is genuinely closed.
- **`useSyncExternalStore` correctly used** in `CartContext`, `CookieConsent`, `OrderConfirmation` — no setState-in-effect, no hydration mismatch, module-level snapshot cache satisfies React's reference-stability contract.
- **Honeypot returns fake 200** (no detection signal to bots).
- **Defence-in-depth** on every form: zod shape + sanitize functions + length caps + honeypot + rate limit.
- **Cookie consent is opt-in, equal-weight, SSR-safe**; GA only loads on accepted path; explicit test that "event without storage" doesn't unlock GA.
- **Sentry init gated on `NODE_ENV === "production" && DSN`** — won't fire on previews.
- **Replay sample rates explicitly 0** — no session replay shipping PII by default.
- **`noindex,nofollow` correctly enforced** on the speculative deploy.
- **`.gitignore` covers all `.env*` variants and Sentry CLI configs.**
- **MapLibre dynamic-imported with `ssr: false`** + real loading state.
- **Every image uses `next/image`** — zero raw `<img>` tags.
- **`prefers-reduced-motion` honoured** in `Revealable`, `useRevealOnView`, `WeightShiftHeading`, `LocationMap.flyTo/easeTo`, plus a universal CSS kill — comprehensive coverage.
- **`view-transition-name` reduced-motion handling** at `globals.css:249–254` — often forgotten.
- **Static generation is implicit and correct** — `generateStaticParams` on all dynamic routes, no unnecessary `force-dynamic`.
- **CSP separates dev from prod** for `'unsafe-eval'` with explicit tests for both.
- **Test-driven security headers** with a regression test that explicitly guards the `withSentryConfig` wrap from dropping headers.

## Test coverage gaps to close alongside the fixes

| When fixing | Add test |
|---|---|
| A1 (PII logging) | Assert `console.log` is not called when `NODE_ENV=production && !RESEND_API_KEY` |
| A2 (Sentry bundle) | Smoke test that asserts the Sentry SDK is NOT in the client bundle when DSN is empty |
| A4 (IP spoofing) | Unit test feeding `x-forwarded-for: 1.2.3.4, 5.6.7.8` and asserting the trusted IP wins |
| A3 (JSON-LD) | Snapshot test of the emitted `application/ld+json` blocks |
| B3 (Sentry scrubber) | Feed synthetic event with `request.data`; assert scrubber removes it |
| B5 (clearCart in effect) | Mount confirmation twice; assert `localStorage.getItem('sams_cart')` doesn't oscillate |
| B6 (MobileOrderBar hidden) | Smoke test asserting it's absent on `/order/<id>/checkout` |
| B11 (honeypot rotation) | Same `getHoneypotFieldName()` within a build; different across builds |
| C1 (COOP/CORP) | Extend the existing security-headers regression test |

## Dependency posture

`npm audit` → 2 moderate (PostCSS `GHSA-qx2v-qp2m-jg93`, build-time only via Next; `fixAvailable` points at a destructive Next downgrade — ignore until Next pins newer postcss). No middleware.ts in repo so CVE-2025-29927 doesn't apply. Add Renovate/Dependabot before launch.

---

## Order of attack — recommended

If working through these systematically:

1. **A1 + A2** (PII logging + Sentry bundle) — 10 minutes each, both single-file changes, huge impact.
2. **A4** (IP spoofing) — 5 minutes, one helper function.
3. **B5 + B6** (clearCart effect + MobileOrderBar) — 20 minutes total, both small.
4. **A3** (JSON-LD) — 1–2 hours, biggest pre-launch SEO win.
5. **A5 + A6** (replyTo + Resend DMARC) — DMARC happens in the DNS dashboard, replyTo is one line.
6. **B8 + B9 + B10** (zod strict + email sanitizer + crypto orderId) — batch in one commit.
7. **B7** (sessionStorage PII redaction) — tied to A2 (cookies/PII story).
8. **B4** (WeightShiftHeading perf) — measure first; might not be as bad as agent estimated.
9. **B1** (CSP nonces) — bigger change; defer to second sprint unless you want belt-and-braces XSS defence before launch.
10. **B2** (Upstash rate limiter) — only when the franchise signs, since Vercel KV/Upstash is a per-month cost.
11. **C1–C20** — bundle into a final "polish" branch.

Most of A and half of B can be done in one focused half-day session.
