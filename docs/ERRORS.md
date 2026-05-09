# ERRORS.md — Error catalogue & decision trees

## "The site is down"

```mermaid
flowchart TB
  A[Reports of site down] --> B{Vercel dashboard reachable?}
  B -- no --> C[Vercel platform issue → status.vercel.com]
  B -- yes --> D{Is the latest deploy 'Ready'?}
  D -- error --> E[Click into deploy → check build logs]
  D -- ready --> F{DNS resolves to Vercel?}
  F -- no --> G[Check domain provider DNS → CNAME to cname.vercel-dns.com]
  F -- yes --> H{HTTPS cert valid?}
  H -- no --> I[Vercel auto-issues — usually self-heals in 15 min]
  H -- yes --> J[Open Sentry → look for uncaught error spikes in last hour]
```

## "The contact form doesn't send"

```mermaid
flowchart TB
  A[Form not sending] --> B{Submission gives 200?}
  B -- 429 --> C[Rate limit hit — same IP submitted 3x in 10 min]
  B -- 400 --> D[Validation failed — message <5 chars, bad email format, etc.]
  B -- 500 --> E[Resend API down OR auth token expired]
  B -- 200 --> F{Email actually arrives?}
  F -- no --> G{Stub mode active?}
  G -- yes --> H[Set RESEND_API_KEY + CONTACT_FORM_FROM_EMAIL on Vercel]
  G -- no --> I[Check Resend dashboard → bounces / blocked / suppressed]
  F -- yes --> J[Working as expected]
```

## "I get a CSP violation in the console"

| Violation | Cause | Fix |
|---|---|---|
| `Refused to load script 'X'` | A new external script was added without updating CSP | Add the host to `script-src` in `lib/security-headers.ts` |
| `Refused to apply inline style` | Pasted inline `style=` attribute somewhere | Move it to a Tailwind class. `style-src 'unsafe-inline'` is already permitted but only for next/font. |
| `Refused to connect to 'X'` | New API endpoint or Sentry tunnel | Add to `connect-src` |
| `Refused to load font` | New font source other than self-hosted | Use `next/font` to self-host instead of whitelisting |

## "The cookie consent banner won't dismiss"

| Cause | Fix |
|---|---|
| Browser dev tools have localStorage disabled | Re-enable in Application → Storage |
| `cookie_consent` already in localStorage but banner showing anyway | Hard refresh — banner reads localStorage on mount |
| Hydration mismatch warning in console | A useEffect ran before mount — see `components/consent/CookieConsent.tsx` for the SSR-safe pattern |

## "Tests failing only in CI, passing locally"

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module '@/...'` | tsconfig paths not in sync with jest moduleNameMapper | Confirm both list the same alias |
| `window is not defined` | Node-env test imports a module that touches window | Add the typeof window guard in jest.setup.ts |
| `act() warnings` only in CI | Slower CI runner exposes a useEffect race | Wrap state updates in `await act(() => { ... })` |
| Snapshot diff | A new package version pinned differently in CI | Make sure `package-lock.json` is committed |

## "Sentry dashboard is empty"

```mermaid
flowchart TB
  A[No events] --> B{NEXT_PUBLIC_SENTRY_DSN set on Vercel?}
  B -- no --> C[Set it — production AND preview env]
  B -- yes --> D{NODE_ENV === production?}
  D -- no --> E[Sentry only inits in prod by design — see lib/sentry.ts]
  D -- yes --> F{Test event manually}
  F --> G[Add a temp button that throws → trigger → wait 1 min → check Sentry]
  G -- still nothing --> H[Check Sentry project's inbound filters / quota]
```

## Common dev-time errors

| Error | What it actually means | Fix |
|---|---|---|
| `Hydration failed because the server rendered HTML didn't match the client` | A component renders different output server vs client (most common: localStorage read, `Date.now()`, or `Math.random()` outside useEffect) | Move that read into `useEffect` |
| `Cannot use both x: and useState` in a server component | Tried to use a hook in a non-`"use client"` file | Add `"use client"` at the top, or move the stateful chunk into a child client component |
| `Maximum update depth exceeded` | A useEffect has no dependency array and updates state | Add the dependency array |
| `Module not found: Can't resolve 'X'` after `npm install` | Lockfile out of sync | `rm -rf node_modules package-lock.json && npm install` |
