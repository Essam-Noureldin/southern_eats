"use client";

/**
 * WHAT: Client confirmation view on /order/[id]/confirmation. Reads the
 *       stashed summary out of sessionStorage by orderId, renders it,
 *       and clears the cart on mount so a refresh shows the confirmation
 *       but the next visit to /order/[id] starts fresh.
 * WHY:  We don't have a real backend to look an order up by id, so the
 *       summary returned by /api/order is stashed in sessionStorage by
 *       CheckoutForm right before this page mounts. This component just
 *       reads it back. If the user landed here without going through the
 *       form (deep link, refresh into a fresh tab), we show a friendly
 *       fallback rather than crashing.
 * IF REMOVED: /order/[id]/confirmation shows nothing meaningful — users
 *       reach a dead-end after submitting an order.
 * COMMON MISTAKE: reading sessionStorage with useState + useEffect. That
 *       trips React 19's set-state-in-effect lint AND races hydration.
 *       We use useSyncExternalStore here for the same reason CartContext
 *       does — the storage IS the state, and React's external-store hook
 *       handles SSR + hydration correctly with no double-render.
 */
import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useCart } from "@/components/order/CartContext";
import type { Location } from "@/lib/locations";

interface OrderSummaryLine {
  id: string;
  name: string;
  qty: number;
  price: number;
  lineTotal: number;
}

interface OrderSummary {
  orderId: string;
  locationName: string;
  lines: OrderSummaryLine[];
  subtotal: number;
  tax: number;
  total: number;
  customer: { name: string; phone: string };
  pickupTime: string;
}

interface Props {
  location: Location;
  orderId: string;
}

function isSummary(v: unknown): v is OrderSummary {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.orderId === "string" &&
    typeof s.locationName === "string" &&
    Array.isArray(s.lines) &&
    typeof s.subtotal === "number" &&
    typeof s.total === "number"
  );
}

// Per-orderId snapshot cache so useSyncExternalStore can return a stable
// reference on repeat reads. The cache is keyed by storage key so two
// different orderIds in the same session don't collide.
const summaryCache = new Map<
  string,
  { raw: string; value: OrderSummary | null }
>();

function readSummary(orderId: string): OrderSummary | null {
  if (typeof window === "undefined") return null;
  const key = `sams_order_${orderId}`;
  let raw: string;
  try {
    raw = window.sessionStorage.getItem(key) ?? "";
  } catch {
    return null;
  }
  const cached = summaryCache.get(key);
  if (cached && cached.raw === raw) return cached.value;
  let value: OrderSummary | null = null;
  if (raw !== "") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isSummary(parsed)) value = parsed;
    } catch {
      value = null;
    }
  }
  summaryCache.set(key, { raw, value });
  return value;
}

// useSyncExternalStore needs subscribe(cb) — sessionStorage doesn't emit
// events on its own (the `storage` event only fires for OTHER tabs/windows,
// not the tab that wrote it). For this view the data is written once
// and never changes, so a no-op subscribe is fine.
function subscribe(): () => void {
  return () => undefined;
}

export default function OrderConfirmation({ location, orderId }: Props) {
  const { clearCart } = useCart();

  const summary = useSyncExternalStore(
    subscribe,
    () => readSummary(orderId),
    () => null,
  );

  // Cart was used to build this order — wipe it so the user doesn't
  // accidentally re-order the same items on their next visit. Mounting
  // is the trigger; the dep array stays stable (clearCart is memoized
  // via useCallback in CartContext) so this runs exactly once.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Distinguish "still hydrating" (server render) from "definitely no
  // summary on client". useSyncExternalStore returns the server snapshot
  // (null) on SSR; after hydration it returns the client snapshot. The
  // mounted sentinel pattern (same one CookieConsent uses) gives us a
  // reliable client/server discriminator without setState-in-effect.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const formattedPickup = useMemo(() => {
    if (!summary?.pickupTime) return null;
    // pickupTime is a datetime-local string like "2026-05-12T18:30".
    // Render it in the user's locale.
    const d = new Date(summary.pickupTime);
    if (Number.isNaN(d.getTime())) return summary.pickupTime;
    return d.toLocaleString();
  }, [summary]);

  if (!isClient) {
    return (
      <div
        aria-busy="true"
        className="rounded-2xl border border-border bg-card p-8 text-center font-display text-xl text-charcoal"
      >
        Loading your order&hellip;
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="font-display text-2xl text-charcoal">
          We can&rsquo;t find that order.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been placed in a different browser tab, or the link
          is old. Head back to the menu and try again.
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

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-sams-red">
        Order received
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Reference: <span className="font-mono">{summary.orderId}</span>
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pickup
          </h3>
          <p className="mt-1 text-base text-charcoal">{summary.locationName}</p>
          <p className="text-sm text-muted-foreground">{formattedPickup}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            For
          </h3>
          <p className="mt-1 text-base text-charcoal">
            {summary.customer.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {summary.customer.phone}
          </p>
        </div>
      </div>

      <ul className="mt-8 space-y-3 border-t border-border pt-4">
        {summary.lines.map((line) => (
          <li key={line.id} className="flex justify-between gap-3 text-sm">
            <span className="text-charcoal">
              {line.qty}&times; {line.name}
            </span>
            <span className="font-semibold text-charcoal">
              ${line.lineTotal.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-1 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>${summary.subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd>${summary.tax.toFixed(2)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold text-charcoal">
          <dt>Total</dt>
          <dd>${summary.total.toFixed(2)}</dd>
        </div>
      </dl>

      <p className="mt-6 rounded-lg bg-butter/30 p-3 text-xs text-charcoal/80">
        Demo order &mdash; no payment was taken and no real order was
        placed. Pay in store when you pick up.
      </p>

      <Link
        href={`/order/${location.id}`}
        className="mt-6 inline-flex items-center justify-center rounded-full border border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sams-red focus-visible:ring-offset-2"
      >
        &larr; Back to menu
      </Link>
    </div>
  );
}
