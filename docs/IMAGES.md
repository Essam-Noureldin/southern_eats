# IMAGES.md — Image inventory & guidance

## Inventory (current)

| File | Used in | Suggested alt | Notes |
|---|---|---|---|
| `public/images/hero-shrimp.jpg` | `Hero` (homepage) | "Platter of fried jumbo shrimp with hush puppies and dipping sauce" | Full-bleed hero. Priority load via `next/image`. AVIF/WebP auto-served. |
| `public/images/dish-shrimp.jpg` | `DishCarousel` | "Sam's signature jumbo shrimp basket" | Carousel card. |
| `public/images/dish-catfish.jpg` | `DishCarousel` | "Fried catfish basket with hush puppies" | Carousel card. |
| `public/images/dish-chicken.jpg` | `DishCarousel` | "Sam's fried chicken basket with seasoned fries" | Carousel card. |
| `public/images/dish-poboy.jpg` | `DishCarousel` | "Po'boy sandwich with shrimp and lettuce on a French roll" | Carousel card. |
| `public/images/dish-samspecial.jpg` | `DishCarousel` | "Sam's Special — sampler with shrimp, catfish, and chicken" | Carousel card. |
| `public/images/dish-greentomatoes.jpg` | `DishCarousel` | "Fried green tomatoes with remoulade" | Carousel card. |
| `public/images/dish-familyfry.jpg` | `DishCarousel` | "Family-size fried seafood platter" | Carousel card. |
| `public/images/founders.jpg` | `StoryTease` | "Tracy and Mo Elbahgha, founders of Sam's Southern Eatery" | Grayscale on render. |

## Pre-launch image checklist

- [ ] Replace placeholder dish photography with shoot of actual menu items
- [ ] Replace `founders.jpg` with a high-resolution licensed founders photo
- [ ] Add a 1200×630 OG image to `public/og.jpg` for share-card use
- [ ] Generate a complete favicon set (see below)
- [ ] All images compressed to ≤600 KB before placing in `/public`

## Photographer brief (when commissioning a shoot)

- 6–10 hero-quality dish shots (overhead + 3/4 angle)
- 1 founders shot (Tracy & Mo Elbahgha — preferably outside one of the locations)
- 1 wide interior shot per representative location (3 ideal)
- Texture / detail shots of breading, sauces, garnish — for parallax / hover-state image swaps
- Output spec: native resolution JPG, sRGB, no client-side editing applied
- Delivery: shared Drive folder
- Rights: full commercial-use license, perpetual, transferable to franchise (in writing, in the contract)

## Image optimisation

All images are loaded through Next.js's `<Image>` component, never raw `<img>`. Next.js does the heavy lifting:

| Optimisation | What it does |
|---|---|
| AVIF / WebP conversion | Modern format negotiation per request — falls back to original JPG for old browsers |
| Responsive sizes | Generates 6+ sizes at build time; browser picks the best |
| Lazy loading | Below-fold images load on scroll |
| Priority loading | Hero image (`priority` prop) loads in the critical path |
| CLS prevention | `width` + `height` reserved before load, no layout jump |

Manual pre-pass: run new images through [squoosh.app](https://squoosh.app) to compress to ≤600 KB before placing in `/public/images/`. Next will further re-encode at request time, but starting from a reasonable baseline is always faster.

## OG image specs

- Filename: `public/og.jpg`
- Dimensions: **1200 × 630** (Facebook/X recommended)
- File size: ≤300 KB
- Content suggestion: hero dish shot with the wordmark "Sam's Southern Eatery" overlaid on a charcoal panel
- Used by: `app/layout.tsx` `metadata.openGraph.images`

## Favicon set

Generate via [realfavicongenerator.net](https://realfavicongenerator.net) using a 512×512 source SVG of the logomark. Place these files in `public/`:

| File | Used by |
|---|---|
| `favicon.ico` | Legacy browsers |
| `favicon-16x16.png`, `favicon-32x32.png` | Standard browser tabs |
| `apple-touch-icon.png` (180×180) | iOS home screen |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Android home screen |
| `site.webmanifest` | PWA install prompt |

Then add to `app/layout.tsx`:
```tsx
export const metadata = {
  icons: {
    icon: [{ url: "/favicon-32x32.png", sizes: "32x32" }, { url: "/favicon-16x16.png", sizes: "16x16" }],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};
```

## Mock data warning

`lib/menu.ts` and `lib/reviews.ts` ship with **placeholder content** flagged with `!!! BEFORE LAUNCH !!!` blocks. These map 1:1 to the dish images currently in the repo. When real menu items and real photography arrive, both files and the corresponding image set need to be updated together — the dish IDs are the join key.
