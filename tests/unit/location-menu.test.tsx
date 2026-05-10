/**
 * WHAT: Tests the LocationMenu client component on /order/[id].
 * WHY:  This is the cart-driving heart of the in-house ordering flow
 *       — Add buttons, quantity controls, line totals, subtotal/tax/
 *       total math, and the disabled-empty checkout CTA. Test-first
 *       locks: empty state, add increments cart, +/- changes qty,
 *       Remove drops the line, totals match the math, and the
 *       checkout link only activates once a priced item is added.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import LocationMenu from "@/components/order/LocationMenu";
import { menu } from "@/lib/menu";
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

// Pick a known-priced item from the real menu. We assert against real
// data because the component imports the menu directly — keeps the
// test tied to what users actually see.
const SAMPLE = menu.find((m) => m.id === "fried-green-tomatoes")!;

describe("LocationMenu", () => {
  it("renders the cart with an empty-state message and disabled checkout", () => {
    render(<LocationMenu location={location} />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    const checkout = screen.getByRole("button", {
      name: /add items to checkout/i,
    });
    expect(checkout).toBeDisabled();
  });

  it("only renders menu items that have a price", () => {
    render(<LocationMenu location={location} />);
    // Fried Green Tomatoes is priced — should appear.
    expect(screen.getByText(SAMPLE.name)).toBeInTheDocument();
    // Pick an unpriced item from the menu — should NOT appear.
    const unpriced = menu.find((m) => typeof m.price !== "number");
    if (unpriced) {
      expect(screen.queryByText(unpriced.name)).not.toBeInTheDocument();
    }
  });

  it("adds an item to the cart when Add is clicked", () => {
    render(<LocationMenu location={location} />);
    const addBtn = screen.getByRole("button", {
      name: new RegExp(`add ${SAMPLE.name} to cart`, "i"),
    });
    act(() => {
      fireEvent.click(addBtn);
    });
    // The add button updates its visible text to reflect the count,
    // and the empty-cart message disappears.
    expect(
      screen.queryByText(/your cart is empty/i),
    ).not.toBeInTheDocument();
    expect(addBtn.textContent).toMatch(/1 in cart/i);
  });

  it("renders subtotal + tax + total once an item is added", () => {
    render(<LocationMenu location={location} />);
    const addBtn = screen.getByRole("button", {
      name: new RegExp(`add ${SAMPLE.name} to cart`, "i"),
    });
    act(() => {
      fireEvent.click(addBtn);
    });
    const price = SAMPLE.price!;
    const subtotalEl = screen.getByText("Subtotal").parentElement!;
    expect(subtotalEl.textContent).toContain(`$${price.toFixed(2)}`);
    const taxEl = screen.getByText(/estimated tax/i).parentElement!;
    expect(taxEl.textContent).toMatch(/\$\d+\.\d{2}/);
    const totalEl = screen.getByText(/^total$/i).parentElement!;
    // Total should equal price * 1.0825 (TAX_RATE) within rounding.
    const expectedTotal = (price * 1.0825).toFixed(2);
    expect(totalEl.textContent).toContain(`$${expectedTotal}`);
  });

  it("increments quantity via the + button", () => {
    render(<LocationMenu location={location} />);
    const addBtn = screen.getByRole("button", {
      name: new RegExp(`add ${SAMPLE.name} to cart`, "i"),
    });
    act(() => {
      fireEvent.click(addBtn);
    });
    const plusBtn = screen.getByRole("button", {
      name: new RegExp(`increase ${SAMPLE.name} quantity`, "i"),
    });
    act(() => {
      fireEvent.click(plusBtn);
    });
    // qty goes 1 → 2; both line total AND subtotal will render as
    // "$11.98" because there's only one cart item — getAllByText finds
    // both, which proves the math propagated through the cart.
    const lineTotal = (2 * SAMPLE.price!).toFixed(2);
    expect(screen.getAllByText(`$${lineTotal}`).length).toBeGreaterThanOrEqual(
      1,
    );
    // The qty span shows the new count.
    const qtySpan = screen.getByText("2", {
      selector: 'span[aria-live="polite"]',
    });
    expect(qtySpan).toBeInTheDocument();
  });

  it("removes the line when Remove is clicked", () => {
    render(<LocationMenu location={location} />);
    const addBtn = screen.getByRole("button", {
      name: new RegExp(`add ${SAMPLE.name} to cart`, "i"),
    });
    act(() => {
      fireEvent.click(addBtn);
    });
    const removeBtn = screen.getByRole("button", {
      name: new RegExp(`remove ${SAMPLE.name} from cart`, "i"),
    });
    act(() => {
      fireEvent.click(removeBtn);
    });
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("activates the Continue to checkout link once items are added", () => {
    render(<LocationMenu location={location} />);
    const addBtn = screen.getByRole("button", {
      name: new RegExp(`add ${SAMPLE.name} to cart`, "i"),
    });
    act(() => {
      fireEvent.click(addBtn);
    });
    const checkout = screen.getByRole("link", {
      name: /continue to checkout/i,
    });
    expect(checkout).toHaveAttribute(
      "href",
      `/order/${location.id}/checkout`,
    );
    expect(checkout.textContent).toMatch(/\(1\)/);
  });
});
