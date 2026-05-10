/**
 * WHAT: Smoke test for /order — renders the page and runs jest-axe
 *       with the region rule disabled (we use landmark unit tests
 *       instead of axe's stricter region rule, see TESTING.md).
 * WHY:  Catches accidental landmark removal or any axe regression
 *       introduced by future edits to the order page or its deps.
 * IF REMOVED: a future change could ship an inaccessible page silently.
 * COMMON MISTAKE: forgetting that OrderExperience is a client
 *       component — but jsdom handles it fine, no mock needed.
 */
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import OrderPage from "@/app/order/page";

expect.extend(toHaveNoViolations);

describe("/order page", () => {
  it("renders without crashing", () => {
    const { container } = render(<OrderPage />);
    expect(container).toBeTruthy();
  });

  it("exposes the page H1 with 'nearest' wording", () => {
    const { getByRole } = render(<OrderPage />);
    const h1 = getByRole("heading", { level: 1 });
    expect(h1.textContent?.toLowerCase()).toContain("nearest");
  });

  it("has no axe violations", async () => {
    const { container } = render(<OrderPage />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
