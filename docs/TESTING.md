# TESTING.md

## Philosophy

**Test-first integration.** No code is done until its tests pass. No feature is integrated until it has been tested in isolation first.

Workflow for every feature:
1. Write the test that defines "working correctly"
2. Run the test → confirm it FAILS (red)
3. Write the implementation
4. Run the test → confirm it PASSES (green)
5. Run the full suite → confirm no regressions

If you're about to write implementation code without a test already written, stop and write the test first.

## Test pyramid

```
        ╱╲
       ╱  ╲      smoke (~15%)  — full pages, jest-axe
      ╱────╲     integration (~15%) — API routes, multi-step flows
     ╱      ╲    unit (~70%)    — utilities, components in isolation
    ╱────────╲
```

At the latest clean state: **30 suites, 206 tests passing**.

## Folder layout

```
tests/
├── __mocks__/              global mocks (e.g. next/font)
├── jest.setup.ts           run before every test (browser API mocks)
├── unit/                   pure functions + components
│   ├── env.test.ts
│   ├── sanitize.test.ts
│   ├── rate-limit.test.ts
│   ├── honeypot.test.ts
│   ├── email.test.ts
│   ├── sentry.test.ts
│   └── <Component>.test.tsx
├── integration/
│   ├── api/contact.test.ts          (uses @jest-environment node)
│   ├── ga-consent-wiring.test.tsx
│   └── security-headers.test.ts     (regression guard)
└── smoke/
    ├── homepage.test.tsx
    ├── contact-page.test.tsx
    ├── legal-pages.test.tsx
    └── layout-chrome.test.tsx
```

## Tooling

| Tool | What for |
|---|---|
| `next/jest` | SWC-backed Jest transformer — same compiler as the build, faster than ts-jest |
| `@testing-library/react` | DOM-based component testing |
| `@testing-library/jest-dom` | Extra matchers like `.toHaveTextContent` |
| `@testing-library/user-event` | Realistic user interaction (typing, clicking) |
| `msw` | HTTP request mocking |
| `jest-axe` | Accessibility assertions |

> ⚠️ **Use `jest-axe`, NOT `@axe-core/react`.** The latter is a runtime browser console logger, not a Jest matcher.

## How to add a new test

### Adding a unit test for a function

1. Create `tests/unit/<name>.test.ts`.
2. Import the function under test.
3. Write a `describe` block with discrete `it` cases.

```typescript
import { sanitizeName } from "@/lib/sanitize";

describe("sanitizeName", () => {
  it("trims surrounding whitespace", () => {
    expect(sanitizeName("  Sam  ")).toBe("Sam");
  });
  it("rejects names over 200 chars", () => {
    expect(() => sanitizeName("a".repeat(201))).toThrow();
  });
});
```

### Adding a unit test for a component

1. Create `tests/unit/<Component>.test.tsx`.
2. Render it with `@testing-library/react`.
3. Assert against role, text, or accessible name — never CSS classes.

> 💡 **Two CTAs by breakpoint.** Several sections render the same link twice (desktop + mobile, breakpoint-gated visibility). Use `getAllByRole("link", { name: /order online/i })` — `getByRole` will throw because there are multiple matches.

### Adding an integration test for an API route

1. Create `tests/integration/api/<route>.test.ts`.
2. **Add the docblock at the top**:
   ```typescript
   /**
    * @jest-environment node
    */
   ```
3. Import the route handler directly: `import { POST } from "@/app/api/<route>/route";`
4. Construct a `Request` and call `POST(request)`.

### Adding a smoke test

1. Create `tests/smoke/<page>.test.tsx`.
2. Render the page component.
3. Run jest-axe with the `region` rule disabled.

```typescript
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

it("has no axe violations", async () => {
  const { container } = render(<Page />);
  const results = await axe(container, {
    rules: { region: { enabled: false } },
  });
  expect(results).toHaveNoViolations();
});
```

## Running tests

| Command | What it runs |
|---|---|
| `npm test` | Everything |
| `npm run test:watch` | Watch mode |
| `npm run test:unit` | `tests/unit/**` only |
| `npm run test:integration` | `tests/integration/**` only |
| `npm run test:ci` | Full suite + coverage report + open-handles detection |
| `npx jest tests/smoke` | Just smoke |
| `npx jest <pattern>` | Filter by file path or test name |

## Coverage thresholds

`jest.config.ts` enforces 80% coverage on branches, functions, lines, statements. The `npm run test:ci` command fails if any threshold is missed.

## Debugging tips

| Symptom | First thing to check |
|---|---|
| `Cannot find module '@/...'` | tsconfig `paths` vs jest `moduleNameMapper` drift |
| `window is not defined` | A node-env test imports a module that touches window — see jest.setup.ts guard |
| `Hydration failed` only in test | A component reads localStorage/Date.now() outside useEffect |
| Test flaky in CI, fine locally | Timing-dependent assertion — wrap state updates in `await act()` |
| `next/script` test ran fine in isolation but fails when re-mounting | next/script has an internal "already-loaded" registry by id; use unique ids per test (we do this in `tests/integration/ga-consent-wiring.test.tsx`) |

## Pre-commit and pre-push

- **pre-commit**: `tsc --noEmit` + `lint-staged`. Tests don't run on commit (would be slow on every save).
- **pre-push**: full Jest suite. Catches regressions before they reach origin.

If a hook fails, fix the underlying issue. Don't `--no-verify` to bypass.
