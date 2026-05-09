# HANDOVER.md

> 🚨 **For the developer**: this file ships with placeholders by design. **Do not send this to the client until every `[FILL]` placeholder below is replaced with a real value.** A halfway-filled handover is worse than no handover.

---

# Sam's Southern Eatery — Site Handover

Welcome to your new website. This document is everything you need to take ownership of the site after launch.

## At a glance

| Thing | Value |
|---|---|
| Live URL | `[FILL — https://samssoutherneatery.com]` |
| GitHub repo | `https://github.com/Essam-Noureldin/southern_eats` |
| Hosting | Vercel — auto-deploys from `main` branch |
| Domain registrar | `[FILL — e.g. GoDaddy / Namecheap / Cloudflare]` |
| DNS provider | `[FILL — usually same as registrar]` |
| Email-on-form receiver | `[FILL — the inbox where contact form messages arrive]` |
| GA4 property ID | `[FILL — G-XXXXXXXXXX or "not yet configured"]` |
| Sentry organisation | `[FILL — your Sentry org slug, or "not yet configured"]` |
| Resend account | `[FILL — email tied to Resend account, or "not yet configured"]` |

## Credentials & access

> Don't share this section over email or unencrypted chat. Use a password manager (1Password, Bitwarden) and share via its sharing feature.

| Account | Email | Where to log in | Notes |
|---|---|---|---|
| GitHub | `[FILL]` | github.com | Source of truth — every change goes here first |
| Vercel | `[FILL]` | vercel.com | Hosting; auto-deploys |
| Domain registrar | `[FILL]` | `[FILL]` | DNS settings live here |
| Resend | `[FILL]` | resend.com | Email API for contact form |
| Google Analytics | `[FILL]` | analytics.google.com | Property: `[FILL]` |
| Sentry | `[FILL]` | sentry.io | Org: `[FILL]` Project: `[FILL]` |

## What you own

- **The source code** — in your GitHub repo. Yours, perpetual, exclusive license. Forkable, modifiable, transferable.
- **The brand assets** — logos, photography, copy. Yours.
- **All third-party accounts above** — registered in your name with your billing.

## What we still own (and will continue to provide)

- Maintenance services if you've taken a retainer.
- Code that runs the site is yours; the time it takes to update it is what you pay for going forward.

## Pre-launch checklist (must all be ✅ before flipping the switch)

> See `../DELIVERY_CHECKLIST.md` for the comprehensive version. Headline items:

- [ ] Solicitor has reviewed and approved Privacy / Terms / Cookies pages
- [ ] Real photography has replaced placeholder dish images
- [ ] Real customer reviews (with permission) have replaced placeholder reviews
- [ ] `metadata.robots` flipped from `noindex,nofollow` to `index,follow`
- [ ] Resend `from` domain verified (replace `onboarding@resend.dev` with `hello@samssoutherneatery.com` or similar)
- [ ] DNS pointing your domain at Vercel
- [ ] GA4 property created and `NEXT_PUBLIC_GA_ID` set on Vercel
- [ ] Sentry project created and `NEXT_PUBLIC_SENTRY_DSN` set on Vercel
- [ ] Test contact form on the live URL — confirm the email arrives in the right inbox
- [ ] Submit sitemap to Google Search Console

## How to make a content change

For a one-off text or image change:

1. Email us with the change you want.
2. We branch off main, make the change, run the tests, push, Vercel auto-deploys.
3. We confirm with you on a preview URL before merging to main.
4. You see it live within minutes of approving.

For ongoing content edits without us, see `docs/USER_GUIDE.md` → "How to update content".

## How to roll back

If a deploy goes wrong:

1. Log in to Vercel
2. Deployments → find the last good deploy
3. ⋮ menu → Promote to Production

Five-second rollback. No deploy is unrecoverable.

## What happens when we step away

If we're unreachable for any reason:

- The site continues to work. Vercel hosts it; Resend sends the form emails; nothing is dependent on our presence.
- Domain renewal happens automatically (verify auto-renew is on at your registrar).
- For any code change you'd want to make, any Next.js / React developer can pick up the codebase. The `docs/` folder is the brief.

## Project documentation in this repo

| File | What it covers |
|---|---|
| `docs/CLAUDE.md` | Project brain — load-bearing decisions, jargon table |
| `docs/README.md` | Developer setup |
| `docs/ARCHITECTURE.md` | System design, sequence diagrams |
| `docs/DESIGN.md` | Brand tokens, palette, typography, components |
| `docs/SETUP.md` | New-machine setup |
| `docs/SECURITY.md` | Threat model, header walkthrough |
| `docs/LEGAL.md` | Solicitor-review requirements |
| `docs/IMAGES.md` | Image inventory + photographer brief |
| `docs/PERFORMANCE.md` | Targets + regression tree |
| `docs/MAINTENANCE.md` | Vercel + maintenance rhythm |
| `docs/DOCKER.md` | Containerisation (optional) |
| `docs/ERRORS.md` | Troubleshooting tree |
| `docs/USER_GUIDE.md` | Owner-facing guide (you, today) |
| `docs/TESTING.md` | Test strategy |
| `docs/HANDOVER.md` | This file |

## Sign-off

| | |
|---|---|
| Built by | Essam Noureldin |
| Email | `onoureldin@gmail.com` |
| Delivered | `[FILL — date]` |
| Live since | `[FILL — date]` |
| Retainer terms | `[FILL — see contract]` |

Welcome to your new site.
