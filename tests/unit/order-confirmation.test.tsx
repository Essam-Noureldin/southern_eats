/**
 * WHAT: Tests the OrderConfirmation client component on /order/[id]/confirmation.
 * WHY:  Confirmation reads the order summary from sessionStorage (stashed
 *       by CheckoutForm right before navigation). Test-first locks the
 *       contract: a present summary renders, a missing one falls back
 *       gracefully, the cart is cleared on mount, and the "back to menu"
 *       link points at the per-location menu.
 */
import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import OrderConfirmation from "@/components/order/OrderConfirmation";
import { CartProvider, useCart } from "@/components/order/CartContext";
import type { Location } from "@/lib/locations";

const location: Location = {
  id: "shreveport-greenwood-rd-la",
  name: "Shreveport — Greenwood Rd",
  address: {
    street: "6122 Greenwood Rd",
    city: "Shreveport",
    state: "LA",
    zip: "71119",
  },
  phone: "(318) 631-7782",
  coords: { lat: 32.4522114, lng: -93.8622371 },
  hours: [],
};

const summary = {
  orderId: "ord_abc123",
  locationName: location.name,
  lines: [
    {
      id: "fried-green-tomatoes",
      name: "Fried Green Tomatoes",
      qty: 2,
      price: 5.99,
      lineTotal: 11.98,
    },
  ],
  subtotal: 11.98,
  tax: 0.99,
  total: 12.97,
  customer: { name: "Karen Holiday", phone: "(318) 555-0199" },
  pickupTime: "2026-05-12T18:30",
};

// Reads the cart state out for an assertion. The OrderConfirmation should
// clear the cart on mount so a refresh shows the confirmation but the
// next visit to /order/[id] starts fresh.
function CartProbe({ onRead }: { onRead: (lineCount: number) => void }) {
  const { cart } = useCart();
  onRead(cart.lines.length);
  return null;
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

describe("OrderConfirmation — with stashed summary", () => {
  beforeEach(() => {
    window.sessionStorage.setItem(
      "sams_order_ord_abc123",
      JSON.stringify(summary),
    );
  });

  it("renders the order id, location, customer, pickup, and totals", () => {
    render(
      <CartProvider>
        <OrderConfirmation location={location} orderId="ord_abc123" />
      </CartProvider>,
    );
    expect(screen.getByText(/order received/i)).toBeInTheDocument();
    expect(screen.getByText(/ord_abc123/)).toBeInTheDocument();
    expect(screen.getByText(/shreveport/i)).toBeInTheDocument();
    expect(screen.getByText(/karen holiday/i)).toBeInTheDocument();
    expect(screen.getByText(/fried green tomatoes/i)).toBeInTheDocument();
    expect(screen.getByText("$12.97")).toBeInTheDocument();
  });

  it("renders a back-to-menu link routing to /order/[id]", () => {
    render(
      <CartProvider>
        <OrderConfirmation location={location} orderId="ord_abc123" />
      </CartProvider>,
    );
    const link = screen.getByRole("link", { name: /back to menu/i });
    expect(link).toHaveAttribute("href", `/order/${location.id}`);
  });

  it("clears the cart on mount", () => {
    // Seed a cart with an item, mount confirmation, expect cart to be empty.
    let observed: number | null = null;
    function Seeder() {
      const { setLocation, addToCart } = useCart();
      useEffect(() => {
        setLocation(location.id);
        addToCart("fried-green-tomatoes");
      }, [setLocation, addToCart]);
      return null;
    }
    render(
      <CartProvider>
        <Seeder />
        <OrderConfirmation location={location} orderId="ord_abc123" />
        <CartProbe onRead={(n) => (observed = n)} />
      </CartProvider>,
    );
    expect(observed).toBe(0);
  });
});

describe("OrderConfirmation — missing summary", () => {
  it("renders a fallback message when sessionStorage has no entry for the orderId", () => {
    render(
      <CartProvider>
        <OrderConfirmation location={location} orderId="ord_missing" />
      </CartProvider>,
    );
    expect(screen.getByText(/can.?t find that order/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to menu/i }),
    ).toBeInTheDocument();
  });
});
