# LEGAL.md

## 🚨 Critical — non-negotiable

The Privacy Policy, Terms & Conditions, and Cookie Policy pages currently shipped on the site are **placeholder copy written by a developer**. They cover the obvious points but they are not legally reviewed and they are not bespoke to Sam's Southern Eatery's actual business operations.

**Before any public launch, a qualified solicitor licensed in the appropriate jurisdiction (Louisiana / US for the franchise headquarters; UK if any UK-based marketing) must review and amend each page.**

This is the single most important pre-launch task. Do not skip it. Do not "add it to next quarter's list." It blocks launch.

The same reminder lives in `docs/HANDOVER.md` and `DELIVERY_CHECKLIST.md`.

## What's on the site today

| Page | Path | What's covered (placeholder) |
|---|---|---|
| Privacy Policy | `/privacy` | What we collect (form submissions + GA when consented), why, how we store it, contact for data requests |
| Terms & Conditions | `/terms` | Site-use terms, IP, disclaimer of warranty, limitation of liability, governing law placeholder |
| Cookie Policy | `/cookies` | What cookies we set (only GA, only after consent), how to revoke consent |

The three pages are linked from the footer of every page.

## What a real review needs to confirm or amend

### Privacy Policy
- Lawful basis for processing under GDPR (legitimate interest? consent?) for any UK/EU visitors
- CCPA disclosures for California visitors (the "do not sell" language)
- Data retention period (currently unspecified)
- Data sharing — do we share with Resend? Yes (they're our processor). That needs to be named.
- Right to access / erase / object — process for handling these requests
- Children under 13 (COPPA in the US)
- International transfers — US franchise hosting US-based, but Resend may be in EU

### Terms & Conditions
- Governing law clause — currently placeholder. Should be Louisiana state law (or whichever the franchise prefers).
- Arbitration clause vs jury trial waiver — depends on franchise's policy
- Limitation of liability $ cap (often the lower of $X or 12-months fees)
- Acceptable use clause if any user-generated content surfaces (currently none)
- DMCA takedown process (US — required to qualify for safe-harbor)

### Cookie Policy
- List every cookie set, the purpose, the duration, the domain, and whether it's first-party or third-party
- Revoke-consent mechanism (we have one — let it be reviewed)

## Process for handing the review back to engineering

1. Solicitor sends back marked-up copy as Word/PDF.
2. Engineer transcribes the changes into the relevant `app/<page>/page.tsx` files.
3. Bump a version date at the bottom of each page (e.g. "Last updated: 2026-06-15").
4. Commit on `feature-legal-review-<date>` branch.
5. Run `npm test` (legal pages have unit + smoke tests — they should still pass).
6. Merge → push → Vercel auto-deploys → confirm live URLs render.

## Cookies — what's actually set

| Cookie | Set by | Purpose | Duration |
|---|---|---|---|
| `cookie_consent` | Our `CookieConsent` component | Stores `accepted` or `declined` so we don't re-prompt | Indefinite (localStorage) |
| `_ga`, `_ga_*` | Google Analytics 4 | Distinguishing users / sessions | 2 years |
| `_gid` | Google Analytics 4 (legacy) | Distinguishing users (24h) | 24 hours |

GA cookies are **only ever set after the user clicks Accept**. The `GAScript` component listens for `cookie-consent-accepted` before injecting the GA script. If the user declines, GA never loads.

## ICO / GDPR / CCPA notes (rough — confirm with solicitor)

- **GDPR** (UK/EU visitors): we need a lawful basis. Consent for cookies/analytics, legitimate interest for the contact form (we need to reach the person who wrote to us).
- **CCPA / CPRA** (California): Disclose data collection categories, allow opt-out of "sale" (we don't sell data — easy disclosure).
- **PIPEDA** (Canada): Mostly aligned with GDPR. Consent + access/correction rights.
- **Louisiana state law**: No comprehensive consumer privacy law as of 2026. Federal-level (CCPA-equivalent at federal level) is in flux. Solicitor will know current state.

## Accessibility law

| Jurisdiction | Law | What it means |
|---|---|---|
| US | ADA Title III | Public-accommodation websites must be accessible. Demand letters are common. |
| UK | Equality Act 2010 | Service providers must make reasonable adjustments — includes websites. |
| EU | EAA (European Accessibility Act, 2025) | Wider scope; B2C ecommerce and similar are in. Sam's site as a marketing/franchise site is likely out of scope but watch this space. |

We've baked WCAG 2.1 AA-equivalent practices into the build (semantic HTML, jest-axe smoke tests, focus states, contrast). It's not a substitute for a manual audit before launch but it dramatically reduces the demand-letter risk.
