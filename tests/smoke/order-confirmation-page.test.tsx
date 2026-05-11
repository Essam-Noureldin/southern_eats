/**
 * WHAT: Smoke test for /order/[id]/confirmation — server component with
 *       async params + searchParams (Next 15+ Promise APIs). Renders the
 *       H1 "Order received" and is axe-clean.
 * WHY:  Catches accidental layout/landmark removal as the page evolves.
 */
import { render as rtlRender } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import OrderConfirmationPage from "@/app/order/[id]/confirmation/page";
import { CartProvider } from "@/components/order/CartContext";

expect.extend(toHaveNoViolations);

function render(ui: React.ReactElement) {
  return rtlRender(<CartProvider>{ui}</CartProvider>);
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("/order/[id]/confirmation page", () => {
  it("renders the page H1 for a valid id", async () => {
    const ui = await OrderConfirmationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
      searchParams: Promise.resolve({ orderId: "ord_demo" }),
    });
    const { getByRole } = render(ui);
    const h1 = getByRole("heading", { level: 1 });
    expect(h1.textContent?.toLowerCase()).toMatch(/order|received/i);
  });

  it("has no axe violations", async () => {
    const ui = await OrderConfirmationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
      searchParams: Promise.resolve({ orderId: "ord_demo" }),
    });
    const { container } = render(ui);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
