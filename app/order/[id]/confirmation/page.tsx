import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCATIONS } from "@/lib/locations";
import OrderConfirmation from "@/components/order/OrderConfirmation";

/**
 * WHAT: /order/[id]/confirmation — server component. Resolves the
 *       location id (404 if unknown) and the optional ?orderId search
 *       param, then renders OrderConfirmation (client) which reads the
 *       stashed summary out of sessionStorage.
 * WHY:  Keeping the page as a server component lets us static-generate
 *       it for every location AND keep the URL-handling logic out of
 *       the client component (which only needs the resolved props).
 * IF REMOVED: CheckoutForm has nowhere to navigate to after a successful
 *       submission.
 * COMMON MISTAKE: forgetting that searchParams is also a Promise in
 *       Next 15+ (same async-API change as params).
 */

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ orderId?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const loc = LOCATIONS.find((l) => l.id === id);
  if (!loc) return { title: "Location not found" };
  return {
    title: `Order received — ${loc.name}`,
    // Confirmation pages should not be indexed even on the real site —
    // they're per-order ephemeral views, not crawlable content.
    robots: { index: false, follow: false },
  };
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const location = LOCATIONS.find((l) => l.id === id);
  if (!location) notFound();

  // searchParams can be string | string[] | undefined. Coerce to a single
  // string and fall back to an empty id (the client will render the
  // missing-order fallback).
  const rawOrderId = sp.orderId;
  const orderId =
    typeof rawOrderId === "string"
      ? rawOrderId
      : Array.isArray(rawOrderId)
        ? (rawOrderId[0] ?? "")
        : "";

  return (
    <main>
      <section className="border-b border-border bg-cream py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="font-display text-3xl text-charcoal md:text-5xl">
            Order received
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks &mdash; we&rsquo;ll have it ready for you at {location.name}.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <OrderConfirmation location={location} orderId={orderId} />
        </div>
      </section>
    </main>
  );
}
