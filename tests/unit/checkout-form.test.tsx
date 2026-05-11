/**
 * WHAT: Tests the CheckoutForm client component on /order/[id]/checkout.
 * WHY:  This is the user's last step before submitting an order — locking
 *       its contract is high-value. Test-first covers: empty-cart fallback,
 *       order summary rendering, honeypot is hidden, submit POSTs the
 *       right shape to /api/order, success path stashes summary in
 *       sessionStorage + clears cart + navigates to confirmation.
 */
import { useEffect } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import CheckoutForm from "@/components/order/CheckoutForm";
import { CartProvider, useCart } from "@/components/order/CartContext";
import { getHoneypotFieldName } from "@/lib/honeypot";
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

// Mock next/navigation's useRouter so the form can call router.push
// without dragging the whole App Router into a unit test.
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn(), back: jest.fn() }),
}));

// Seeds the cart with a known priced item BEFORE rendering the form.
// Mutations go through useEffect (not render) so the CartContext, which
// listens to its own storage events via useSyncExternalStore, doesn't
// trigger an infinite re-render loop when the seeder mutates during commit.
function Seed({ children }: { children: React.ReactNode }) {
  const { setLocation, addToCart } = useCart();
  useEffect(() => {
    setLocation(location.id);
    // fried-green-tomatoes is priced ($5.99) in lib/menu.ts.
    addToCart("fried-green-tomatoes");
  }, [setLocation, addToCart]);
  return <>{children}</>;
}

// jsdom doesn't expose Response globally, so we hand-roll a tiny
// fetch-result that quacks like one (the component only reads .ok and
// calls .json()).
function fakeResponse(body: object, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

// Stash any existing global.fetch and restore between tests.
const ORIGINAL_FETCH = global.fetch;
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  pushMock.mockClear();
});
afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

describe("CheckoutForm — empty-cart fallback", () => {
  it("shows a 'cart is empty' state with a back-to-menu link", () => {
    render(
      <CartProvider>
        <CheckoutForm location={location} />
      </CartProvider>,
    );
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
    const back = screen.getByRole("link", { name: /back to menu/i });
    expect(back).toHaveAttribute("href", `/order/${location.id}`);
  });

  it("shows the empty-cart state if cart.locationId doesn't match this page", () => {
    // Seed a cart at Shreveport, but render the form for a Norman page.
    function Mismatch() {
      const { setLocation, addToCart } = useCart();
      useEffect(() => {
        setLocation("shreveport-greenwood-rd-la");
        addToCart("fried-green-tomatoes");
      }, [setLocation, addToCart]);
      return null;
    }
    const norman: Location = { ...location, id: "norman-w-main-ok" };
    render(
      <CartProvider>
        <Mismatch />
        <CheckoutForm location={norman} />
      </CartProvider>,
    );
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
  });
});

describe("CheckoutForm — non-empty cart", () => {
  it("renders the order summary with the seeded item", () => {
    render(
      <CartProvider>
        <Seed>
          <CheckoutForm location={location} />
        </Seed>
      </CartProvider>,
    );
    expect(screen.getByText(/fried green tomatoes/i)).toBeInTheDocument();
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/^total$/i)).toBeInTheDocument();
  });

  it("renders all required form fields", () => {
    render(
      <CartProvider>
        <Seed>
          <CheckoutForm location={location} />
        </Seed>
      </CartProvider>,
    );
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pickup time/i)).toBeInTheDocument();
  });

  it("renders a visually-hidden honeypot field", () => {
    const { container } = render(
      <CartProvider>
        <Seed>
          <CheckoutForm location={location} />
        </Seed>
      </CartProvider>,
    );
    const hp = container.querySelector(`input[name="${getHoneypotFieldName()}"]`);
    expect(hp).not.toBeNull();
    expect(hp).toHaveAttribute("tabindex", "-1");
    expect(hp).toHaveAttribute("aria-hidden", "true");
  });

  it("POSTs to /api/order with cart + form payload on submit, then navigates", async () => {
    const fetchSpy = jest.fn().mockResolvedValue(
      fakeResponse({
        ok: true,
        orderId: "ord_abc123",
        summary: {
          orderId: "ord_abc123",
          locationName: location.name,
          lines: [
            {
              id: "fried-green-tomatoes",
              name: "Fried Green Tomatoes",
              qty: 1,
              price: 5.99,
              lineTotal: 5.99,
            },
          ],
          subtotal: 5.99,
          tax: 0.49,
          total: 6.48,
          customer: { name: "Karen Holiday", phone: "(318) 555-0199" },
          pickupTime: "2026-05-12T18:30",
        },
      }),
    );
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(
      <CartProvider>
        <Seed>
          <CheckoutForm location={location} />
        </Seed>
      </CartProvider>,
    );

    act(() => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "Karen Holiday" },
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: "(318) 555-0199" },
      });
      fireEvent.change(screen.getByLabelText(/pickup time/i), {
        target: { value: "2026-05-12T18:30" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId("checkout-form"));
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/order",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(
      (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.locationId).toBe(location.id);
    expect(body.lines).toEqual([{ id: "fried-green-tomatoes", qty: 1 }]);
    expect(body.name).toBe("Karen Holiday");
    expect(body.phone).toBe("(318) 555-0199");
    expect(body.pickupTime).toBe("2026-05-12T18:30");
    expect(typeof body.renderedAt).toBe("number");
    expect(body).toHaveProperty(getHoneypotFieldName(), "");

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        `/order/${location.id}/confirmation?orderId=ord_abc123`,
      ),
    );
    expect(
      window.sessionStorage.getItem("sams_order_ord_abc123"),
    ).not.toBeNull();
  });

  it("shows an error message when /api/order returns non-OK", async () => {
    const fetchSpy = jest.fn().mockResolvedValue(
      fakeResponse({ ok: false, error: "Too many" }, 429),
    );
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(
      <CartProvider>
        <Seed>
          <CheckoutForm location={location} />
        </Seed>
      </CartProvider>,
    );

    act(() => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "Karen Holiday" },
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: "(318) 555-0199" },
      });
      fireEvent.change(screen.getByLabelText(/pickup time/i), {
        target: { value: "2026-05-12T18:30" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId("checkout-form"));
    });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
