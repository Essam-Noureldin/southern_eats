# DESIGN.md

> Single source of truth for visual design. Brand tokens live in `app/globals.css` `@theme {}` block (Tailwind v4 CSS-first). Don't hardcode hex values in components — always use the token utilities (e.g. `bg-sams-red`, `text-cream`).

## Palette

| Token | Hex | When to use |
|---|---|---|
| `sams-red` | `#c11127` | Primary CTA, FranchiseTease section background, accent on Hero |
| `cream` | `#f5ebdc` | Body background, footer background, MobileOrderBar gradient |
| `charcoal` | `#1f1a14` | Headlines on cream, NumbersBand background, footer text inverse |
| `butter` | `#e8b048` | Secondary accent — star ratings, tags, hover states |
| `moss` | `#3f4f2f` | Reserved for future use (catering / sustainability messaging) |

Plus the shadcn/ui semantic tokens: `background`, `foreground`, `card`, `card-foreground`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`. These are mapped to the brand palette via `:root` in `app/globals.css`.

## Typography

| Token | Family | Weights | When to use |
|---|---|---|---|
| `font-display` | `Fraunces, serif` | 600 italic | Display headlines (Hero, FranchiseTease, NumbersBand pull-quote) |
| `font-body` | `DM Sans, sans-serif` | 400/500/600 | Everything else: paragraphs, navigation, buttons |

Loaded via `next/font/google` — self-hosted at build time. **No runtime requests to Google Fonts.**

## Spacing scale

Tailwind defaults except the custom `--spacing-section: 6rem` token, used as `py-section` for the vertical rhythm between major sections.

## Component vocabulary

### Buttons

| Variant | Class snippet |
|---|---|
| Primary CTA | `bg-sams-red px-8 py-3 rounded-full text-cream font-semibold transition-transform hover:scale-[1.02]` |
| Secondary CTA | `border border-charcoal/20 px-8 py-3 rounded-full text-charcoal hover:bg-charcoal hover:text-cream` |
| Inverse (on charcoal) | `bg-cream px-8 py-3 rounded-full text-charcoal font-semibold` |

### Cards

`rounded-2xl border border-border bg-card p-6 md:p-10`

### Section eyebrows

`text-xs uppercase tracking-[0.3em] text-muted-foreground` — used as the small label above section headlines.

## Layout primitives

| Layout | Class snippet |
|---|---|
| Page max width | `mx-auto max-w-3xl px-4 md:px-8` (legal pages) or `mx-auto max-w-7xl px-4 md:px-8` (sections) |
| Section vertical | `py-16 md:py-24` |
| Two-column split | `grid gap-10 md:grid-cols-2 md:gap-16` |

## Animation principles

| Rule | Why |
|---|---|
| Use `transform` and `opacity` only | GPU-composited, no layout reflow, won't trigger CLS |
| Always respect `prefers-reduced-motion` | Accessibility — vestibular-disorder users disable motion |
| Keep durations 200–600ms | Faster = jittery, slower = laggy |
| Use spring easings on Framer Motion | More natural than linear/ease |
| Test at 375px viewport | Animations that look great on desktop can stutter on cheap Android phones |

`jest.setup.ts` mocks `matchMedia` to claim `prefers-reduced-motion: reduce` is true so animations stay inert in tests — preventing axe from flagging mid-animation transparency as a contrast failure.

## Two-CTAs-by-breakpoint pattern

Several sections render the same link twice — once visible at desktop only, once at mobile only — using Tailwind's responsive prefixes:

```tsx
<a href="/order" className="hidden md:inline-flex ...">Order online</a>
<a href="/order" className="inline-flex md:hidden ...">Order online</a>
```

It's cleaner than a JS-level conditional render, but it means tests need `getAllByRole("link", { name: /order online/i })`, not `getByRole`. Logged in `MASTER_PROMPT_DEVIATIONS.md`.

## Icons

Inline SVG, not a library. Reasons:

- Lucide (or any icon lib) ships ~50 KB minimum even when tree-shaken
- We use ~12 icons across the whole site — manual inline is cheaper
- Inline SVG can be data-tested via `data-testid="<name>-icon"`

Where icons appear: ReviewCard star ratings (`data-testid="review-star"`), social links in Footer, hamburger toggle in Navbar.

## Responsive breakpoints

Tailwind defaults:

| Prefix | Min width | Target |
|---|---|---|
| (none) | 0 | Mobile |
| `sm:` | 640 | Large phones / small tablets |
| `md:` | 768 | Tablets / small laptops — primary "desktop" breakpoint for this site |
| `lg:` | 1024 | Most laptops |
| `xl:` | 1280 | Large monitors |
| `2xl:` | 1536 | Cinema |

The site is **mobile-first** — base styles target 375px, breakpoints add desktop features (multi-column layouts, larger type, two-CTA pattern).

## Photography style

| Attribute | Direction |
|---|---|
| Mood | Warm, hand-crafted, never over-styled |
| Lighting | Natural / warm artificial — no cool blue tones |
| Composition | Overhead OR 3/4 — never directly side-on |
| Backgrounds | Wood, butcher paper, cream linen — never branded plates |
| Filters | Minimal — slight warmth, NO heavy filter |

## What to avoid

| ❌ Don't | Why |
|---|---|
| Purple gradients | The default AI/SaaS aesthetic — wrong for a Southern eatery |
| Stock photography | Looks generic; defeats the trust-building purpose |
| Overly rounded corners (`rounded-3xl` on small elements) | Looks toy-like, not hand-crafted |
| Gradients in headlines | Hurts readability and contrast scores |
| More than two font weights per page | Visual noise |
| Uppercase body copy | Legibility hit; fine for eyebrow caps, never for paragraphs |
| Inter font | The default-everywhere font; wrong for this brand |
