# SETUP.md — New machine setup

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | 20+ | Required by `engines` in package.json. |
| npm | 10+ | Ships with Node 20. |
| Git | 2.40+ | Husky hooks expect modern git. |
| (optional) Docker | 24+ | Only if running the containerised build. |

If you use `nvm`: `nvm use` reads `.nvmrc` (which says `20`).

## 1. Clone the repo

```bash
git clone https://github.com/Essam-Noureldin/southern_eats.git
cd southern_eats/site
```

## 2. Install dependencies

```bash
npm install
```

This also runs Husky's install script, wiring git hooks into `.git/hooks/`.

**Verify**: `ls .git/hooks/pre-commit .git/hooks/pre-push` — both should exist and point to husky.

## 3. Set up env vars

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the **required** five (see `docs/README.md` → "Required env vars"). The four optional vars are fine to leave empty for local dev.

For the demo Vercel deploy, use:
- `CONTACT_FORM_FROM_EMAIL=onboarding@resend.dev` (Resend's free no-domain sender, only delivers to the email on the Resend account)
- `RESEND_API_KEY=` your Resend test key (free tier covers 3,000/month)

## 4. Verify the test pipeline works

```bash
npm test
```

Expected: 30 suites pass, 206 tests pass (or whatever number the latest commit reports).

## 5. Verify the build works

```bash
npm run build
```

Expected:
- TypeScript clean
- ESLint clean
- All routes render
- `postbuild` hook regenerates `public/sitemap.xml`

## 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the homepage.

## 7. Verify the contact form (stub mode)

1. Open `/contact`
2. Fill in name, email, message
3. Click Send
4. Expected: form swaps to "Got it — thanks for writing."
5. Open the dev server's terminal — you should see `[email:stub-mode] { ... }` logged

If you set a real `RESEND_API_KEY` and `CONTACT_FORM_FROM_EMAIL`, the email actually sends instead.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot find module '@/lib/...'` in tests | tsconfig + jest path alias drift | Confirm `moduleNameMapper` in `jest.config.ts` matches `paths` in `tsconfig.json`. |
| `window is not defined` in a test | A node-env test imports a module that uses `window`. | Check the `typeof window !== 'undefined'` guard in `jest.setup.ts`. |
| Husky hook didn't run on commit | Git hooks not installed | `npm install` again, or `npx husky` to re-bootstrap. |
| `RESEND_API_KEY` set but email doesn't arrive | Sender domain not verified in Resend | Use `onboarding@resend.dev` as `CONTACT_FORM_FROM_EMAIL` for a quick test. |
| Build error: "Cannot find module 'next/jest'" | `node_modules` corrupted | `rm -rf node_modules package-lock.json && npm install`. |
| Hydration warning in dev | Client/server output diverged | Usually `localStorage` read outside `useEffect` — see `components/consent/CookieConsent.tsx` for the SSR-safe pattern. |

## Editor setup (recommended)

- **VS Code** with the ESLint and Tailwind CSS IntelliSense extensions.
- Set `"editor.formatOnSave": true` and `"editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }` in workspace settings.
- The repo includes a `tsconfig.json` with strict mode — let TS errors guide you.
