"use client";

/**
 * WHAT: Client-side checkout form on /order/[id]/checkout. Reads the cart
 *       from useCart(), renders the order summary read-only on the left,
 *       a customer-detail form on the right (name, phone, pickup time +
 *       honeypot), and POSTs to /api/order on submit. On success it
 *       stashes the server-computed summary in sessionStorage and
 *       navigates to /order/[id]/confirmation?orderId=...
 * WHY:  All security composition (rate limit, honeypot, sanitize, total
 *       computation) lives in the /api/order route. This component's job
 *       is to capture input, send it, and hand off to the confirmation
 *       page. sessionStorage (not localStorage) for the summary: the
 *       confirmation is a one-tab event, no need to persist past it.
 * IF REMOVED: /order/[id]/checkout has no submission UI.
 * COMMON MISTAKE: trusting client-side totals. Subtotal/tax/total in this
 *       file are display-only — the server recomputes everything and that
 *       result is what the user (and the franchise) see on the confirmation.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/order/CartContext";
import { getHoneypotFieldName } from "@/lib/honeypot";
import { menu } from "@/lib/menu";
import type { Location } from "@/lib/locations";

const HP_FIELD = getHoneypotFieldName();
const TAX_RATE = 0.0825;

interface Props {
  location: Location;
}

type Status = "idle" | "loading" | "error";

export default function CheckoutForm({ location }: Props) {
  const { cart } = useCart();
  const router = useRouter();

  // Captured ONCE at mount so the server's timing trap can measure the
  // gap. Reading Date.now() at submit time would make the gap ~0 every
  // time and defeat the check.
  const [renderedAt] = useState<number>(() => Date.now());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [hpValue, setHpValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Derived view of the cart for the summary panel. Same shape as
  // LocationMenu's cart — re-resolved against the menu so we always have
  // names + prices for rendering.
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

  const cartMatchesLocation = cart.locationId === location.id;
  const isEmpty = cartItems.length === 0 || !cartMatchesLocation;

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="font-display text-xl text-charcoal">
          Your cart is empty.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Head back to the menu to add something good.
        </p>
        <Link
          href={`/order/${location.id}`}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-sams-red px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-sams-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
        >
          &larr; Back to menu
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locationId: location.id,
          lines: cart.lines,
          name,
          phone,
          pickupTime,
          renderedAt,
          [HP_FIELD]: hpValue,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as {
        ok: boolean;
        orderId?: string;
        summary?: unknown;
      };
      if (!data.ok || !data.orderId) {
        setStatus("error");
        return;
      }
      // Stash the server-computed summary so the confirmation page can
      // read it. sessionStorage scope is per-tab — fine for this flow.
      try {
        window.sessionStorage.setItem(
          `sams_order_${data.orderId}`,
          JSON.stringify(data.summary),
        );
      } catch {
        // Storage full / disabled — confirmation will fall back gracefully.
      }
      router.push(`/order/${location.id}/confirmation?orderId=${data.orderId}`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <aside
        aria-label="Order summary"
        className="lg:col-span-1 lg:order-2"
      >
        <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-cream p-6 shadow-sm">
          <h2 className="font-display text-2xl text-charcoal">Your order</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pickup from {location.name}
          </p>
          <ul className="mt-6 space-y-3 border-t border-border pt-4">
            {cartItems.map(({ item, qty, lineTotal }) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-charcoal">
                  {qty}&times; {item.name}
                </span>
                <span className="font-semibold text-charcoal">
                  ${lineTotal.toFixed(2)}
                </span>
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
          <p className="mt-4 text-xs text-muted-foreground">
            Pickup only. Pay in store.
          </p>
        </div>
      </aside>

      <form
        onSubmit={onSubmit}
        data-testid="checkout-form"
        noValidate
        className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8 lg:col-span-2 lg:order-1"
      >
        {/* Honeypot — off-screen, aria-hidden, tabbable -1. Bots fill every input. */}
        <input
          type="text"
          name={HP_FIELD}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          value={hpValue}
          onChange={(e) => setHpValue(e.target.value)}
          className="pointer-events-none absolute -left-[9999px] opacity-0"
        />

        <div>
          <label
            htmlFor="checkout-name"
            className="mb-1.5 block text-sm font-medium"
          >
            Full name
          </label>
          <input
            id="checkout-name"
            name="name"
            type="text"
            required
            minLength={1}
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="checkout-phone"
            className="mb-1.5 block text-sm font-medium"
          >
            Phone
          </label>
          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            required
            minLength={7}
            maxLength={30}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="checkout-pickup"
            className="mb-1.5 block text-sm font-medium"
          >
            Pickup time
          </label>
          <input
            id="checkout-pickup"
            name="pickupTime"
            type="datetime-local"
            required
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-sams-red px-8 py-3 text-base font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "loading" ? "Placing order…" : `Place order — $${total.toFixed(2)}`}
        </button>

        {status === "error" ? (
          <p role="alert" className="text-sm text-sams-red">
            Something went wrong. Please try again in a moment.
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Demo order — no card details collected, no charge made.
        </p>
      </form>
    </div>
  );
}
