"use client";

/**
 * WHAT: Client orchestrator for /order/[id]. Renders the menu grid
 *       (grouped by category) on the left, a cart sidebar on the
 *       right with line-by-line +/- controls, subtotal/tax/total,
 *       and a "Continue to checkout" CTA that's disabled until at
 *       least one item is in the cart.
 * WHY:  This is the heart of the in-house ordering flow. As of
 *       feature-order-checkout, cart state has been lifted to a
 *       Context (components/order/CartContext) so the cart survives
 *       navigation to /order/[id]/checkout. This component is now a
 *       *consumer* of useCart — it doesn't own the state.
 * IF REMOVED: /order/[id] renders the location header but no menu
 *       and no cart — the order flow can't proceed.
 * COMMON MISTAKE: filtering the menu without a price check. Items
 *       in lib/menu.ts have an OPTIONAL price (the live brand site
 *       doesn't publish prices for many items); adding a $undefined
 *       item to a cart with a $undefined total breaks every math
 *       call downstream. We filter to priced items only here so the
 *       cart math stays sound.
 */
import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Location } from "@/lib/locations";
import { menu, categories } from "@/lib/menu";
import { useCart } from "@/components/order/CartContext";

interface Props {
  location: Location;
}

// Tax rate placeholder. Real rate would come from a per-jurisdiction
// lookup on the location's state — not in scope for the demo flow.
// Labelled "Estimated tax" in the UI so users aren't misled.
const TAX_RATE = 0.0825;

export default function LocationMenu({ location }: Props) {
  const { cart, setLocation, addToCart, changeQty, removeLine } = useCart();

  // Tell the cart which location this menu is for. The provider
  // resets the cart if the new location differs from the previous one
  // (you can't move a Shreveport cart to a Norman counter).
  useEffect(() => {
    setLocation(location.id);
  }, [location.id, setLocation]);

  // Only items with a real price can be added to the cart — the menu
  // file leaves price undefined for items where the live brand site
  // doesn't publish one. See the SECURITY/no-fabrication block in
  // lib/menu.ts for the why.
  const orderableByCategory = useMemo(() => {
    const priced = menu.filter((m) => typeof m.price === "number");
    return categories
      .map((c) => ({
        ...c,
        items: priced.filter((m) => m.category === c.id),
      }))
      .filter((c) => c.items.length > 0);
  }, []);

  function getQty(id: string): number {
    return cart.lines.find((l) => l.id === id)?.qty ?? 0;
  }

  const cartItems = useMemo(
    () =>
      cart.lines
        .map((line) => {
          const item = menu.find((m) => m.id === line.id);
          if (!item || typeof item.price !== "number") return null;
          return { ...line, item, lineTotal: line.qty * item.price };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [cart.lines],
  );

  const subtotal = cartItems.reduce((s, x) => s + x.lineTotal, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const itemCount = cartItems.reduce((s, x) => s + x.qty, 0);
  const isEmpty = cartItems.length === 0;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {orderableByCategory.map((cat) => (
          <section key={cat.id} className="mb-12 last:mb-0">
            <h2 className="mb-6 font-display text-3xl text-charcoal">
              {cat.label}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {cat.items.map((item) => (
                <li key={item.id} className="list-none">
                  <article className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    {item.imageUrl && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-display text-lg text-charcoal">
                        {item.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sams-red">
                        ${item.price!.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(item.id)}
                        aria-label={`Add ${item.name} to cart`}
                        className="rounded-full bg-sams-red px-4 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-sams-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
                      >
                        {getQty(item.id) > 0
                          ? `Add (${getQty(item.id)} in cart)`
                          : "Add"}
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <aside aria-label="Your order" className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-cream p-6 shadow-sm">
          <h2 className="font-display text-2xl text-charcoal">Your order</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pickup from {location.name}
          </p>

          {isEmpty ? (
            <p className="mt-6 text-sm italic text-muted-foreground">
              Your cart is empty. Tap Add on any dish to start.
            </p>
          ) : (
            <>
              <ul className="mt-6 space-y-4 border-t border-border pt-4">
                {cartItems.map(({ item, qty, lineTotal }) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => changeQty(item.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-charcoal/20 transition-colors hover:bg-sams-red hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
                        >
                          &minus;
                        </button>
                        <span aria-live="polite" className="min-w-[1.5rem] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => changeQty(item.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-charcoal/20 transition-colors hover:bg-sams-red hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeLine(item.id)}
                          className="ml-auto text-xs text-charcoal/60 underline underline-offset-2 hover:text-sams-red"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-charcoal">
                      ${lineTotal.toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-1 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Estimated tax</dt>
                  <dd>${tax.toFixed(2)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold text-charcoal">
                  <dt>Total</dt>
                  <dd>${total.toFixed(2)}</dd>
                </div>
              </dl>
            </>
          )}

          {isEmpty ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-charcoal/10 px-5 py-3 text-sm font-semibold text-charcoal/40"
            >
              Add items to checkout
            </button>
          ) : (
            <Link
              href={`/order/${location.id}/checkout`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sams-red px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-sams-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
            >
              Continue to checkout ({itemCount}) &rarr;
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
