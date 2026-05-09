# Sam's Southern Eatery — Delivery Checklist

> Final delivery gate. Three-state model:
> - **✅** verified at delivery time
> - **⏳** pending live deployment (with reason in notes)
> - **N/A** does not apply (with reason)

A speculative build cannot tick boxes that require a live URL — those items aren't "failed," they're correctly deferred to launch day. The notes column carries the *reason* an item is pending or N/A — far more useful than an unchecked box with no context.

---

## 1. Code & Config

| Status | Item | Notes |
|---|---|---|
| ✅ | `.env.example` lists every var with comments | 9 vars total (5 required, 4 optional) |
| ✅ | `.nvmrc` pins Node 20 | |
| ✅ | `package.json engines` requires Node ≥20 | |
| ✅ | `.gitignore` excludes `.env*`, build artefacts, sitemap regenerated files | |
| ✅ | TypeScript strict mode enabled | `tsconfig.json` |
| ✅ | Path alias `@/` set in tsconfig + jest moduleNameMapper | matched, no drift |
| ✅ | Tailwind v4 CSS-first @theme block | `app/globals.css` — brand tokens centralised |
| ✅ | ESLint flat config (eslint.config.mjs) with zero warnings | native `eslint-config-next/{core-web-vitals,typescript}` exports |
| ✅ | `next.config.ts` security headers + standalone output + Sentry wrap | regression test guards header survival |
| ✅ | Husky pre-commit (tsc + lint-staged) | |
| ✅ | Husky pre-push (jest --ci) | |
| ✅ | Dockerfile (multi-stage) + docker-compose.yml + docker-compose.prod.yml | |

## 2. Site Completeness

| Status | Item | Notes |
|---|---|---|
| ✅ | Sticky Navbar with mobile overlay menu | `components/layout/Navbar.tsx` |
| ✅ | Hero section with H1, subheadline, dual CTAs | `components/sections/Hero.tsx` |
| ✅ | About / Story tease (founders narrative) | `components/sections/StoryTease.tsx` |
| ✅ | Services / Menu carousel (signature dishes) | `components/sections/DishCarousel.tsx` + `lib/menu.ts` |
| ✅ | Numbers band (51 locations / 9 states) | `components/sections/NumbersBand.tsx` |
| ✅ | Reviews section (3-card lead slate) | `components/sections/Reviews.tsx` + `lib/reviews.ts` |
| ✅ | Franchise CTA tease | `components/sections/FranchiseTease.tsx` |
| ✅ | Footer with brand / Visit nav / Legal trio | `components/layout/Footer.tsx` |
| ✅ | Mobile-only fixed Order Online bar | `components/layout/MobileOrderBar.tsx` |
| ✅ | Cookie consent banner (UK/EU/CA compliant) | `components/consent/CookieConsent.tsx` |
| ✅ | Privacy Policy page at `/privacy` | placeholder copy |
| ✅ | Terms & Conditions page at `/terms` | placeholder copy |
| ✅ | Cookie Policy page at `/cookies` | placeholder copy |
| ✅ | Contact form at `/contact` + `/api/contact` | full security stack |
| ✅ | OG + Twitter Card meta tags | `app/layout.tsx` metadata |
| ⏳ | OG image at `public/og.jpg` (1200×630) | Awaiting brand photography |
| ⏳ | Favicon set (favicon.ico + apple-touch + android-chrome) | Awaiting logomark from client |
| ⏳ | Map / outbound directions link | Awaiting confirmed addresses for each location |
| ✅ | Sitemap auto-generated via next-sitemap postbuild | |
| ✅ | robots.txt auto-generated | |

## 3. Security

| Status | Item | Notes |
|---|---|---|
| ✅ | CSP header configured | no Google Fonts entries (next/font self-hosts) |
| ✅ | X-Frame-Options: DENY | |
| ✅ | X-Content-Type-Options: nosniff | |
| ✅ | Referrer-Policy: strict-origin-when-cross-origin | |
| ✅ | Permissions-Policy disabling camera/mic/geolocation | |
| ✅ | HSTS with 2-year max-age + includeSubDomains + preload | |
| ✅ | Security headers regression-guard test | `tests/integration/security-headers.test.ts` |
| ✅ | Honeypot trap on contact form | `lib/honeypot.ts` — hidden field, hard-block on fill |
| ✅ | Rate limit (3 per 10 min by IP) on contact form | `lib/rate-limit.ts` — in-memory fixed window |
| ✅ | Server-side input sanitisation | `lib/sanitize.ts` |
| ✅ | Server-side zod schema validation | `app/api/contact/route.ts` |
| ✅ | Generic error messages (no info leak) | |
| ✅ | No secrets hardcoded | all access via `lib/env.ts` |
| ✅ | No `console.log` in production code paths | dev-only stub log in `lib/email.ts` |
| ✅ | npm audit clean at high+ severity | 2 moderate transitives in postcss-via-Next 16 — fix would require Next downgrade |

## 4. Testing & Quality

| Status | Item | Notes |
|---|---|---|
| ✅ | Jest configured with `next/jest` SWC transformer | not ts-jest |
| ✅ | `@testing-library/react` + `jest-dom` + `user-event` | |
| ✅ | MSW for HTTP mocking | |
| ✅ | jest-axe for accessibility assertions | not @axe-core/react |
| ✅ | Husky + lint-staged | |
| ✅ | `modulePathIgnorePatterns: ['<rootDir>/.next/']` | |
| ✅ | jest.setup.ts guards browser mocks behind typeof window | |
| ✅ | Unit tests | ~140 tests across 20 suites |
| ✅ | Integration tests | API contact + GA wiring + headers regression |
| ✅ | Smoke tests with jest-axe | homepage + legal + contact + layout-chrome |
| ✅ | Total: 206 tests / 30 suites — 100% pass rate | latest commit: 094bc0f |
| ✅ | Coverage thresholds 80% all four | branches/functions/lines/statements |
| ✅ | `npx tsc --noEmit` zero errors | |
| ✅ | `npx eslint . --max-warnings 0` zero | |
| ✅ | `npm run build` succeeds | Sentry wrap respected, postbuild sitemap regenerated |
| ⏳ | Lighthouse Performance ≥ 90 mobile | Capture against live URL pre-launch — see PERFORMANCE.md |
| ⏳ | Lighthouse Accessibility 100 | Capture against live URL pre-launch |
| ⏳ | Lighthouse Best Practices ≥ 95 | Capture against live URL pre-launch |
| ⏳ | Lighthouse SEO 100 | Capture against live URL pre-launch |
| ⏳ | Manual mobile viewport test at 375px | Will repeat against live URL |

## 5. Documentation

| Status | Item | Notes |
|---|---|---|
| ✅ | `docs/CLAUDE.md` — project brain + jargon table | single project-wide table |
| ✅ | `docs/README.md` — developer setup | |
| ✅ | `docs/ARCHITECTURE.md` — diagrams + sequences | |
| ✅ | `docs/SETUP.md` — new-machine setup | |
| ✅ | `docs/DOCKER.md` — multi-stage build + commands | |
| ✅ | `docs/ERRORS.md` — error catalogue + decision trees | |
| ✅ | `docs/MAINTENANCE.md` — Vercel + maintenance rhythm | gantt for monthly/quarterly/annual |
| ✅ | `docs/SECURITY.md` — threat model + header walkthrough | |
| ✅ | `docs/LEGAL.md` — solicitor reminder + jurisdiction notes | |
| ✅ | `docs/TESTING.md` — philosophy + how to add a test | |
| ✅ | `docs/IMAGES.md` — image inventory + photographer brief | |
| ✅ | `docs/PERFORMANCE.md` — targets + animation rule | actuals deferred to launch |
| ✅ | `docs/DESIGN.md` — palette + type + components | |
| ✅ | `docs/USER_GUIDE.md` — owner guide with ASCII wireframes + FAQ | |
| ✅ | `docs/HANDOVER.md` — credentials table with [FILL] placeholders | warning at top — do not send unfilled |
| ✅ | `SESSION_HANDOFF.md` at project root | resume guide for next session |
| ✅ | `MASTER_PROMPT_DEVIATIONS.md` at project root | logged 7 deviations from v2 prompt |

## 6. Pre-Launch (mostly ⏳ until launch day)

| Status | Item | Notes |
|---|---|---|
| ⏳ | securityheaders.com scored A or A+ | Run against live URL post-deploy |
| ⏳ | Contact form end-to-end on live URL | Submit test, confirm email arrives |
| ⏳ | GA gating verified live | Open in incognito → decline cookies → confirm GA never loads |
| ⏳ | Sitemap accessible at /sitemap.xml on live URL | |
| ⏳ | robots.txt accessible at /robots.txt on live URL | |
| ⏳ | `metadata.robots` flipped to `index,follow` | Currently `noindex,nofollow` — speculative build |
| ⏳ | Sentry receives a test event from production | |
| ⏳ | All env vars set on Vercel — Production AND Preview | |
| ⏳ | Domain pointed at Vercel (DNS verified) | |
| ⏳ | Resend `from` domain verified (replace onboarding@resend.dev) | |
| ⏳ | Mock data swapped — `lib/menu.ts` real menu items | flagged with !!! BEFORE LAUNCH !!! block |
| ⏳ | Mock data swapped — `lib/reviews.ts` real attributed reviews | |
| ⏳ | Real photography swapped in (`public/images/`) | per IMAGES.md photographer brief |
| ⏳ | OG image at `public/og.jpg` | |
| ⏳ | Favicon set | |
| ⏳ | HANDOVER.md credentials table fully filled | warning at top of file |

## 🚨 Critical (non-negotiable blockers)

| Status | Item | Why critical |
|---|---|---|
| ⏳ | **Solicitor review of all three legal pages** | LEGAL.md spells out exactly what each must cover. Can't launch without this. |
| ⏳ | **HANDOVER.md credentials table fully filled in** | Sending unfilled is worse than not sending. |

---

## Sign-off

| | |
|---|---|
| Built by | Essam Noureldin |
| Date completed (steps 1–20) | 2026-05-09 |
| Demo deployed | ⏳ pending step 21 (Vercel dashboard wire-up) |
| Total tests | 206 / 206 passing |
| Test suites | 30 / 30 passing |
| Coverage | 80%+ branches / functions / lines / statements |
| Status | ✅ Foundation + features + tests + docs complete; ready for animation polish, content swap-in, and Vercel deploy |
