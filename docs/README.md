# Sam's Southern Eatery — Site

A redesigned marketing site for Sam's Southern Eatery — a 51-location Southern fried-seafood/chicken franchise based in Shreveport, LA.

## Quick start

```bash
cd site
npm install
cp .env.example .env.local       # fill required vars (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required env vars

The five required vars are listed in `.env.example`. The site won't start without them. The four optional ones (`RESEND_API_KEY`, `CONTACT_FORM_FROM_EMAIL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SENTRY_DSN`) make the corresponding feature dormant when empty — useful for local dev and demo deploys.

| Var | What it does | Required? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for OG / sitemap | yes |
| `CONTACT_FORM_TO_EMAIL` | Recipient of contact submissions | yes |
| `RATE_LIMIT_MAX` | Max submissions per IP per window (3) | yes |
| `RATE_LIMIT_WINDOW_MS` | Window length in ms (600000 = 10 min) | yes |
| `COOKIE_CONSENT_REQUIRED` | Whether to show the consent banner (true) | yes |
| `RESEND_API_KEY` | Resend API key — leave empty for stub mode | no |
| `CONTACT_FORM_FROM_EMAIL` | Verified Resend sender (or `onboarding@resend.dev` for demo) | no |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID (`G-XXXXXX`) | no |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN URL | no |

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR. |
| `npm run build` | Production build + `postbuild` regenerates sitemap. **Use this, not `npx next build`** — the postbuild hook only runs from the npm script. |
| `npm start` | Run the production build locally. |
| `npm test` | Full Jest suite. |
| `npm run test:watch` | Jest watch mode. |
| `npm run test:ci` | Jest with coverage + open-handles detection. |
| `npm run test:unit` | Just the unit tests. |
| `npm run test:integration` | Just the integration tests. |
| `npm run lint` | ESLint with zero-warning gate. |

## Pre-commit and pre-push

- **pre-commit**: `tsc --noEmit` (whole project) + `lint-staged` (eslint --fix on changed files)
- **pre-push**: full Jest suite

If a hook fails, fix the underlying issue. Don't `--no-verify`.

## Project structure

See `docs/CLAUDE.md` → "Repo structure".

## Deploying

See `docs/MAINTENANCE.md` for the Vercel-via-dashboard auto-deploy setup.

## Tests

See `docs/TESTING.md`.

## Security

See `docs/SECURITY.md` for the threat model and header walkthrough.

## Legal

Privacy / Terms / Cookies pages are placeholder copy. **Solicitor review is non-negotiable before launch** — see `docs/LEGAL.md`.
