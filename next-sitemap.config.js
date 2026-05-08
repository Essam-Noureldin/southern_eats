/**
 * WHAT: Config for next-sitemap. Consumed by the `postbuild` script,
 *       which generates `public/sitemap.xml` and `public/robots.txt`
 *       after every `npm run build`.
 * WHY:  Search engines pick up new/changed pages much faster with a
 *       well-formed sitemap than by crawling links. The robots.txt
 *       points crawlers at the sitemap and blocks /api/* from indexing.
 * IF REMOVED: no sitemap ships with the build. SEO indexation slows
 *       and /api/* endpoints risk getting crawled and indexed.
 * COMMON MISTAKE: running `npx next build` instead of `npm run build`.
 *       The postbuild hook only runs from the npm script — bypassing
 *       it ships a stale (or missing) sitemap to production.
 *
 * NOTE: this is a CommonJS file (.js, module.exports) because
 * next-sitemap loads it via require() at build time and does not
 * understand TS or ESM directly without extra plumbing.
 */

const fallbackSiteUrl = "https://example.com";

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Read from env so demo, preview, and production each get their own
  // canonical host. The fallback exists so the build does not crash in
  // very early dev when no env file is in place yet.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl,

  // Generate a matching robots.txt next to the sitemap.
  generateRobotsTxt: true,

  // Exclude API routes — we never want them in Google.
  exclude: ["/api/*"],

  // robots.txt policies: allow everything by default (the speculative-
  // build noindex,nofollow is enforced via the per-page metadata.robots
  // meta tag, not robots.txt — easier to flip on real launch day).
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },

  // Per-route priority + changefreq. Search engines treat these as
  // hints, not hard rules — but they help focus crawl budget on the
  // pages that change most.
  transform: async (_config, path) => {
    let priority = 0.7;
    let changefreq = "monthly";

    if (path === "/") {
      priority = 1.0;
      changefreq = "weekly";
    } else if (
      path === "/privacy" ||
      path === "/terms" ||
      path === "/cookies"
    ) {
      priority = 0.5;
      changefreq = "yearly";
    } else {
      // Story, menu, locations, contact, etc. are "section" pages.
      priority = 0.8;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
