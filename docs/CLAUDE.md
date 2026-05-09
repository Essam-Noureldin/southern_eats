# CLAUDE.md — Project Brain

> Auto-loaded by future Claude Code sessions. Single source of truth for what this project is, how it's built, and what's load-bearing.

## What this project is

Sam's Southern Eatery — a 51-location Southern fried-seafood/chicken franchise based in Shreveport, LA. This repo is the **redesigned marketing site**, built speculatively as a sales asset before the franchise has signed.

- Live demo: deployed to Vercel (URL set on launch day)
- Domain: client's existing domain to be pointed at Vercel post-launch
- Status: speculative build — `metadata.robots = noindex,nofollow` on the demo URL until launch

## Stack at a glance

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | React 19. `instrumentation.ts` for Sentry server hook. |
| Styling | Tailwind CSS v4 (CSS-first @theme) | Brand tokens in `app/globals.css`, NOT `tailwind.config.ts`. |
| Lang | TypeScript 5 strict | Path alias `@/` → project root. |
| Tests | Jest + `next/jest` SWC + jest-axe + MSW | 206 tests / 30 suites at last clean state. |
| Email | Resend 6 (`lib/email.ts` stub-mode fallback) | Demo deploys work without DNS verified. |
| Errors | Sentry (`lib/sentry.ts`) | Init only when `NEXT_PUBLIC_SENTRY_DSN` set in production. |
| Analytics | GA4 via `next/script` | Gated by cookie consent. |
| Hosting | Vercel | Auto-deploy via dashboard, preview URL per branch. |
| CI | Husky pre-commit (`tsc + lint-staged`) + pre-push (`jest --ci`). | First-commit only ran `jest --ci` against everything. |

## Repo structure (top-level)

```
sams-southern-eatery/
├── MASTER_PROMPT_DEVIATIONS.md      # log of v2 prompt divergences
├── SESSION_HANDOFF.md               # state at session end
├── DELIVERY_CHECKLIST.md            # final delivery gate
└── site/                            # the Next.js app
    ├── app/
    │   ├── layout.tsx               # RootLayout — chrome only, NO <main>
    │   ├── page.tsx                 # homepage
    │   ├── api/contact/route.ts     # contact form POST
    │   ├── contact/                 # /contact
    │   ├── privacy / terms / cookies
    ├── components/
    │   ├── analytics/GAScript.tsx   # consent-gated GA loader
    │   ├── consent/CookieConsent.tsx
    │   ├── forms/ContactForm.tsx    # client form, hidden honeypot
    │   ├── layout/                  # Navbar, Footer, MobileOrderBar
    │   └── sections/                # Hero, DishCarousel, Reviews, etc.
    ├── lib/
    │   ├── env.ts                   # zod-validated env vars (single source)
    │   ├── sentry.ts                # shouldInitSentry() decision
    │   ├── security-headers.ts     # CSP/HSTS/etc. config
    │   ├── email.ts                 # Resend wrapper + stub-mode
    │   ├── sanitize.ts              # server-side input sanitisers
    │   ├── rate-limit.ts            # in-memory fixed-window limiter
    │   ├── honeypot.ts              # bot-trap helpers
    │   ├── menu.ts                  # 29 dishes (mock data)
    │   └── reviews.ts               # 3-card lead reviews (mock data)
    ├── tests/
    │   ├── unit/        ~20 files, ~140 tests
    │   ├── integration/ ~3 files, includes /api/contact + headers regression
    │   └── smoke/       homepage, legal, contact, layout-chrome (axe)
    ├── instrumentation.ts           # Next 16 server Sentry init hook
    ├── instrumentation-client.ts    # browser Sentry init
    ├── next.config.ts               # security headers + withSentryConfig wrap
    └── docs/                        # this folder
```

## Load-bearing decisions (read before changing)

1. **Tailwind v4 CSS-first.** No `tailwind.config.ts`. Brand tokens in `app/globals.css` `@theme {}` block. Class names like `bg-cream` and `text-sams-red` map to those CSS variables.
2. **`lib/env.ts` is the only place that reads `process.env` for app config.** Adding a new env var means updating the zod schema there first.
3. **`lib/sentry.ts` controls whether Sentry runs at all.** Both `instrumentation.ts` and `instrumentation-client.ts` call `shouldInitSentry()` first.
4. **Two-CTAs-by-breakpoint pattern.** Multiple sections render the same link twice (desktop + mobile, breakpoint-gated visibility). Tests must use `getAllByRole`, not `getByRole`. Logged in `MASTER_PROMPT_DEVIATIONS.md`.
5. **Mock data files (`lib/menu.ts`, `lib/reviews.ts`) are placeholders.** Each carries a `!!! BEFORE LAUNCH !!!` block. Real menu items + permission-confirmed reviews must replace them.
6. **`metadata.robots = noindex,nofollow` is intentional.** Flip to `index,follow` on real launch day.
7. **No double `<main>` element.** RootLayout renders `<div className="flex-1">{children}</div>` — pages own their own `<main>`. axe will fail with two `<main>`s.

## Workflow rules (binding)

- **Test-first.** Write the failing test → implement → green. No implementation without a test.
- **Branch-per-feature.** One branch off main per feature, fast-forward merge when green.
- **Push immediately after FF-merge.** `git push origin main feature-X` is part of the merge ritual.
- **Scan after every change.** `npx tsc --noEmit && npx eslint . --max-warnings 0 && npx jest`. Build only if pages/routes/deps/config changed.
- **Track deviations.** Append to `MASTER_PROMPT_DEVIATIONS.md` (project root) as they happen.

## Jargon used in this project

> Single project-wide jargon table. Other docs link here rather than redefining.

| Term | Plain English |
|---|---|
| **App Router** | Next.js's modern routing system where folders inside `app/` define URLs. `app/contact/page.tsx` becomes `/contact`. |
| **Branch-per-feature** | Every change gets its own git branch named `feature-<scope>`, merged into `main` when green. |
| **CLS** (Cumulative Layout Shift) | A Lighthouse metric — how much page content jumps around as it loads. Embedded iframes are a common cause. |
| **CSP** (Content Security Policy) | A browser-enforced rule list saying which scripts/images/fonts the page is allowed to load. Stops most XSS attacks. |
| **fast-forward merge** | Git merge that just moves the main branch pointer to the tip of the feature branch — no merge commit. Only possible if main hasn't moved since the branch was created. |
| **flat config** (ESLint) | ESLint 9's modern single-file config (`eslint.config.mjs`). No more nested `.eslintrc` files. |
| **HSTS** (HTTP Strict Transport Security) | A response header that tells the browser to refuse HTTP for this domain forever. Stops downgrade attacks. |
| **honeypot** | A form field hidden from users but visible to bots. If it's filled in, the submission is a bot. |
| **instrumentation.ts** | Next 16's framework-native way to register Sentry on the server. Replaces `sentry.server.config.ts`. |
| **landmark** | An HTML element that defines a page region (`<main>`, `<nav>`, `<footer>`, etc.). Screen readers use them for navigation. |
| **MSW** (Mock Service Worker) | A library for mocking HTTP requests in tests. We use it for testing API integration without hitting a real server. |
| **next/font** | Next.js's font loader. Downloads the font at build time and self-hosts it — no runtime requests to Google Fonts. |
| **next/image** | Next.js's image component. Auto-converts to AVIF/WebP, generates responsive sizes, lazy-loads. |
| **next/jest** | Jest preset that uses Next's SWC compiler for tests. Faster than ts-jest, same module resolution as the build. |
| **postbuild hook** | An npm script that runs automatically after `npm run build`. We use it to regenerate the sitemap. |
| **rate limit** | A cap on how many requests one IP can make in a window. We use 3 contact submissions per 10 minutes. |
| **ResendStubMode** | When `RESEND_API_KEY` is empty, `lib/email.ts` logs the submission instead of sending. Lets the form work locally and pre-DNS. |
| **scroll-snap** | A CSS property that snaps a horizontally scrolling container to specific child elements. Native carousel without JS. |
| **shouldInitSentry()** | The single decision function in `lib/sentry.ts`. Returns true only when DSN is set and `NODE_ENV === "production"`. |
| **smoke test** | A shallow end-to-end test that proves a page renders without crashing. Ours also run jest-axe. |
| **SSR** (Server-Side Rendering) | The page's HTML is built on the server, sent to the browser, then hydrated. Most of this site is SSR or static. |
| **stub mode** | A feature is wired up but doesn't do real work — used for local dev and demo deploys. Our email module supports stub mode. |
| **withSentryConfig** | Sentry's wrapper for `next.config.ts`. Adds source-map upload, route-handler instrumentation. Risky — can drop fields. Guarded by `tests/integration/security-headers.test.ts`. |
| **zod** | A TypeScript-first schema validation library. We use it for env vars (`lib/env.ts`) and form payloads. |

## Where to read more

| For… | Read |
|---|---|
| New developer setup | `docs/SETUP.md` |
| Architecture diagrams | `docs/ARCHITECTURE.md` |
| Why each header exists | `docs/SECURITY.md` |
| Adding a new test | `docs/TESTING.md` |
| What can go wrong on prod | `docs/ERRORS.md` |
| Deploying / managing the live site | `docs/MAINTENANCE.md` |
| Owner-facing guide | `docs/USER_GUIDE.md` |
| Final delivery gate | `../DELIVERY_CHECKLIST.md` |
