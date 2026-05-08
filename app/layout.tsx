import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import GAScript from "@/components/analytics/GAScript";

/**
 * WHAT: Self-hosted brand fonts via next/font/google. Exposes CSS
 *       variables that globals.css's @theme block reads.
 * WHY:  next/font downloads fonts at build time and serves them from
 *       our own origin — zero runtime requests to Google, tighter CSP,
 *       no FOIT.
 * IF REMOVED: fonts fall back to ui-serif / ui-sans-serif and the
 *       brand identity collapses.
 * COMMON MISTAKE: importing fonts via @import "https://fonts.googleapis…"
 *       in CSS instead — that requires a Google Fonts CSP entry and
 *       hits Google on every page load.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

/**
 * WHAT: Site-wide metadata defaults — title template, description, OG.
 * WHY:  Next 16 metadata API beats per-page <head> tags: dedupes title
 *       template, generates OG/Twitter Card automatically, no client JS.
 * IF REMOVED: every page would need its own raw <head>; SEO tags drift.
 * COMMON MISTAKE: forgetting `metadataBase`, which makes OG image URLs
 *       relative and breaks rich previews on Slack/iMessage/Twitter.
 *
 * SPECULATIVE BUILD NOTE: robots.index/follow are intentionally false.
 * This site deploys to a non-canonical *.vercel.app URL with the brand's
 * name on it before the franchise owner has signed. Flip both to true
 * on real launch day (see DELIVERY_CHECKLIST.md).
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Sam's Southern Eatery — Home of the jumbo shrimp.",
    template: "%s | Sam's Southern Eatery",
  },
  description:
    "Hand-breaded jumbo shrimp and cornmeal-crusted catfish at 51 locations across the South. Family-owned since 2008 in Shreveport, LA.",
  robots: { index: false, follow: false },
};

/**
 * WHAT: Root document shell. Wraps every page in <html>/<body> and
 *       attaches both font CSS variables.
 * WHY:  App Router requires a single RootLayout per app.
 * IF REMOVED: build fails — Next requires this file at app/layout.tsx.
 * COMMON MISTAKE: rendering a <main> here. Pages own their own
 *       <main> landmark; two <main> elements per document is invalid
 *       HTML and axe will flag it.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">{children}</div>
        {/*
         * GA loads only after cookie consent. Reading the env here on the
         * server and passing as a prop keeps the client component free of
         * direct process.env access. Empty/unset NEXT_PUBLIC_GA_ID =>
         * GAScript renders nothing => analytics flow dormant.
         */}
        <GAScript gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
