/**
 * WHAT: Smoke test for /order/[id]/checkout — server component, async
 *       params, 404 on bad id, renders the page H1 with "Checkout" and
 *       runs jest-axe with the region rule disabled.
 * WHY:  Regression guard. If a future edit breaks the page chrome or
 *       removes the H1, this fails.
 */
import { render as rtlRender } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

// CheckoutForm calls useRouter() at render. Smoke tests bypass Next's
// app router context, so we mock the hook to a no-op router. Without
// this, render() throws "invariant expected app router to be mounted".
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  notFound: () => {
    throw new Error("notFound");
  },
}));

import OrderCheckoutPage from "@/app/order/[id]/checkout/page";
import { CartProvider } from "@/components/order/CartContext";

expect.extend(toHaveNoViolations);

function render(ui: React.ReactElement) {
  return rtlRender(<CartProvider>{ui}</CartProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("/order/[id]/checkout page", () => {
  it("renders the page H1 for a valid id", async () => {
    const ui = await OrderCheckoutPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { getByRole } = render(ui);
    const h1 = getByRole("heading", { level: 1 });
    expect(h1.textContent?.toLowerCase()).toContain("checkout");
  });

  it("has no axe violations", async () => {
    const ui = await OrderCheckoutPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { container } = render(ui);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
