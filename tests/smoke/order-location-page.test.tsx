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
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import OrderLocationPage from "@/app/order/[id]/page";

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
});
