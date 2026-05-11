/**
 * WHAT: Tests the CartContext provider + useCart hook. Cart state is
 *       lifted out of LocationMenu so it survives the user's navigation
 *       from /order/[id] (menu page) -> /order/[id]/checkout (form).
 *       Persisted to localStorage so a hard refresh doesn't wipe the cart.
 * WHY:  Test-first locks the contract: hook outside provider throws,
 *       add/changeQty/remove/clear all work, locationId switches reset
 *       the cart (you can't carry a Shreveport cart to a Norman order),
 *       and localStorage is the source of truth on remount.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/components/order/CartContext";

// Small test harness that drives the hook through clickable buttons.
function Harness({ locationId }: { locationId: string }) {
  const { cart, addToCart, changeQty, removeLine, clearCart, setLocation } =
    useCart();
  return (
    <div>
      <span data-testid="loc">{cart.locationId ?? "none"}</span>
      <span data-testid="lines">{JSON.stringify(cart.lines)}</span>
      <button onClick={() => setLocation(locationId)}>set-loc</button>
      <button onClick={() => addToCart("fried-green-tomatoes")}>add</button>
      <button onClick={() => addToCart("fried-pickles")}>add-2</button>
      <button onClick={() => changeQty("fried-green-tomatoes", 1)}>plus</button>
      <button onClick={() => changeQty("fried-green-tomatoes", -1)}>minus</button>
      <button onClick={() => removeLine("fried-green-tomatoes")}>remove</button>
      <button onClick={() => clearCart()}>clear</button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("CartContext", () => {
  it("throws if useCart is called outside a CartProvider", () => {
    function NakedConsumer() {
      useCart();
      return null;
    }
    // React logs the thrown error — silence the noise during this assertion.
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<NakedConsumer />)).toThrow(/CartProvider/);
    errSpy.mockRestore();
  });

  it("starts with an empty cart and no location", () => {
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    expect(screen.getByTestId("loc").textContent).toBe("none");
    expect(screen.getByTestId("lines").textContent).toBe("[]");
  });

  it("addToCart adds an item with qty 1, increments on second add", () => {
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
    });
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-green-tomatoes", qty: 1 },
    ]);
    act(() => {
      fireEvent.click(screen.getByText("add"));
    });
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-green-tomatoes", qty: 2 },
    ]);
  });

  it("changeQty +1 / -1 increments and decrements", () => {
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
      fireEvent.click(screen.getByText("plus"));
    });
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-green-tomatoes", qty: 2 },
    ]);
    act(() => {
      fireEvent.click(screen.getByText("minus"));
    });
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-green-tomatoes", qty: 1 },
    ]);
  });

  it("changeQty -1 from qty 1 removes the line (no zero-qty lines)", () => {
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
      fireEvent.click(screen.getByText("minus"));
    });
    expect(screen.getByTestId("lines").textContent).toBe("[]");
  });

  it("removeLine drops the line entirely", () => {
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
      fireEvent.click(screen.getByText("add-2"));
      fireEvent.click(screen.getByText("remove"));
    });
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-pickles", qty: 1 },
    ]);
  });

  it("clearCart empties the cart but keeps the location", () => {
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
      fireEvent.click(screen.getByText("clear"));
    });
    expect(screen.getByTestId("lines").textContent).toBe("[]");
    expect(screen.getByTestId("loc").textContent).toBe(
      "shreveport-greenwood-rd-la",
    );
  });

  it("setLocation to a NEW location resets the cart", () => {
    const { rerender } = render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
    });
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-green-tomatoes", qty: 1 },
    ]);
    rerender(
      <CartProvider>
        <Harness locationId="norman-w-main-ok" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
    });
    expect(screen.getByTestId("loc").textContent).toBe("norman-w-main-ok");
    expect(screen.getByTestId("lines").textContent).toBe("[]");
  });

  it("setLocation to the SAME location does not reset the cart", () => {
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
      // Calling setLocation with the same id should be a no-op for lines.
      fireEvent.click(screen.getByText("set-loc"));
    });
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-green-tomatoes", qty: 1 },
    ]);
  });

  it("persists to localStorage and rehydrates on remount", () => {
    const { unmount } = render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("set-loc"));
      fireEvent.click(screen.getByText("add"));
      fireEvent.click(screen.getByText("add"));
    });
    // Confirm the persisted shape directly so we know it's not just react state.
    const raw = window.localStorage.getItem("sams_cart");
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw!);
    expect(persisted.locationId).toBe("shreveport-greenwood-rd-la");
    expect(persisted.lines).toEqual([
      { id: "fried-green-tomatoes", qty: 2 },
    ]);

    unmount();
    render(
      <CartProvider>
        <Harness locationId="shreveport-greenwood-rd-la" />
      </CartProvider>,
    );
    expect(screen.getByTestId("loc").textContent).toBe(
      "shreveport-greenwood-rd-la",
    );
    expect(JSON.parse(screen.getByTestId("lines").textContent || "")).toEqual([
      { id: "fried-green-tomatoes", qty: 2 },
    ]);
  });

  it("survives a corrupted localStorage entry without crashing", () => {
    window.localStorage.setItem("sams_cart", "{not json");
    expect(() =>
      render(
        <CartProvider>
          <Harness locationId="shreveport-greenwood-rd-la" />
        </CartProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByTestId("loc").textContent).toBe("none");
    expect(screen.getByTestId("lines").textContent).toBe("[]");
  });
});
