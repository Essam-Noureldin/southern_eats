/**
 * WHAT: Smoke test for /order/[id] — awaits the async server-component
 *       page with a real location id, then runs jest-axe on the
 *       rendered output (region rule disabled, per project convention).
 * WHY:  The page is async (Next 15+ params are a Promise) so we resolve
 *       it manually here and assert: it renders without crashing for a
 *       known id, exposes the location name as an h1, and clears axe.
 * IF REMOVED: future edits could break the per-location page chrome
 *       without any test failure.
 * COMMON MISTAKE: rendering the Page function directly without awaiting
 *       — async server components return Promise<JSX>; you have to
 *       await it before passing the result to render().
 */
import { render as rtlRender } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import OrderLocationPage from "@/app/order/[id]/page";
import { CartProvider } from "@/components/order/CartContext";

// The page is rendered inside app/order/layout.tsx in real use, which
// supplies the CartProvider. Smoke tests bypass the layout — wrap here.
function render(ui: React.ReactElement) {
  return rtlRender(<CartProvider>{ui}</CartProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
});

expect.extend(toHaveNoViolations);

describe("/order/[id] page", () => {
  it("renders the location name as the h1 for a valid id", async () => {
    const ui = await OrderLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { getByRole } = render(ui);
    const h1 = getByRole("heading", { level: 1 });
    expect(h1.textContent?.toLowerCase()).toContain("shreveport");
  });

  it("has no axe violations", async () => {
    const ui = await OrderLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { container } = render(ui);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("renders a HungerRush demo banner when the location has an orderingUrl set", async () => {
    // shreveport-greenwood-rd-la is seeded with a placeholder orderingUrl
    // in lib/locations.ts (HungerRush routing demo). The banner appears
    // above the menu and the link points at the external URL.
    const ui = await OrderLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { getByRole } = render(ui);
    const link = getByRole("link", { name: /order at|hungerrush|real order/i });
    expect(link.getAttribute("href")).toMatch(/^https?:\/\//);
    expect(link).toHaveAttribute("target", "_blank");
    const rel = link.getAttribute("rel") ?? "";
    expect(rel).toMatch(/noopener/);
    expect(rel).toMatch(/noreferrer/);
  });

  it("renders NO demo banner when the location has no orderingUrl", async () => {
    // havelock-w-main-nc is a phone-only location in lib/locations.ts
    // (no orderingUrl) — the in-house demo flow is the only path.
    const ui = await OrderLocationPage({
      params: Promise.resolve({ id: "havelock-w-main-nc" }),
    });
    const { queryByRole } = render(ui);
    // No external HungerRush link should be present.
    const link = queryByRole("link", {
      name: /order at|hungerrush|real order/i,
    });
    expect(link).toBeNull();
  });

  it("emits a Restaurant JSON-LD script with this location's name + address (A3)", async () => {
    const ui = await OrderLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { container } = render(ui);
    const ldScript = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(ldScript).not.toBeNull();
    const data = JSON.parse(ldScript!.innerHTML);
    expect(data["@type"]).toBe("Restaurant");
    expect(data.name).toContain("Shreveport");
    expect(data.address.addressLocality).toBe("Shreveport");
    expect(data.address.addressRegion).toBe("LA");
    expect(data.geo).toEqual(
      expect.objectContaining({
        "@type": "GeoCoordinates",
        latitude: expect.any(Number),
        longitude: expect.any(Number),
      }),
    );
    expect(data.branchOf["@id"]).toMatch(/#organization$/);
  });
});
