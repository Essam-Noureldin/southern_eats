/**
 * WHAT: Unit tests for next-sitemap.config.js — sitemap + robots.txt
 *       config consumed by the postbuild hook.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - siteUrl reads from NEXT_PUBLIC_SITE_URL with a safe fallback
 *       - generateRobotsTxt is on
 *       - /api/* is excluded (we don't want endpoints in Google)
 *       - priority map covers home (1.0), sections (0.8), legal (0.5)
 *
 * COMMON MISTAKE: hardcoding siteUrl. The deploy URL changes between
 * preview, demo, and production — must come from env.
 */

describe("next-sitemap.config", () => {
  // Re-require with module-cache reset so each test gets a fresh read
  // of process.env at config-load time.
  function loadConfig(envOverrides: Record<string, string | undefined> = {}) {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    if ("NEXT_PUBLIC_SITE_URL" in envOverrides) {
      if (envOverrides.NEXT_PUBLIC_SITE_URL === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = envOverrides.NEXT_PUBLIC_SITE_URL;
      }
    }
    jest.isolateModules(() => {
      // require inside isolateModules so the config re-reads process.env
    });
    let cfg: Record<string, unknown> = {};
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cfg = require("../../next-sitemap.config.js");
    });
    process.env.NEXT_PUBLIC_SITE_URL = original;
    return cfg;
  }

  it("reads siteUrl from NEXT_PUBLIC_SITE_URL", () => {
    const cfg = loadConfig({ NEXT_PUBLIC_SITE_URL: "https://samssoutherneatery.com" });
    expect(cfg.siteUrl).toBe("https://samssoutherneatery.com");
  });

  it("falls back to a placeholder when NEXT_PUBLIC_SITE_URL is unset (so build does not crash)", () => {
    const cfg = loadConfig({ NEXT_PUBLIC_SITE_URL: undefined });
    expect(typeof cfg.siteUrl).toBe("string");
    expect((cfg.siteUrl as string).length).toBeGreaterThan(0);
  });

  it("enables robots.txt generation", () => {
    const cfg = loadConfig();
    expect(cfg.generateRobotsTxt).toBe(true);
  });

  it("excludes /api/* from the sitemap", () => {
    const cfg = loadConfig();
    expect(cfg.exclude).toEqual(expect.arrayContaining(["/api/*"]));
  });

  it("exposes a transform function that assigns priorities by route", async () => {
    const cfg = loadConfig() as {
      transform: (
        c: unknown,
        path: string,
      ) => Promise<{ priority: number; loc: string; changefreq: string; lastmod: string }>;
    };
    const stubConfig = {};
    const home = await cfg.transform(stubConfig, "/");
    const story = await cfg.transform(stubConfig, "/story");
    const privacy = await cfg.transform(stubConfig, "/privacy");
    expect(home.priority).toBe(1.0);
    expect(story.priority).toBe(0.8);
    expect(privacy.priority).toBe(0.5);
  });
});
