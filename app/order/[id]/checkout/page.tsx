import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCATIONS } from "@/lib/locations";
import CheckoutForm from "@/components/order/CheckoutForm";

/**
 * WHAT: /order/[id]/checkout — server component. Resolves the location id,
 *       404s on bad ids, renders the page header and hands off to the
 *       CheckoutForm client component (which reads the cart from useCart()).
 * WHY:  Splitting the async-param + 404 logic from the form keeps the
 *       form fully unit-testable without mocking Next.js routing.
 * IF REMOVED: "Continue to checkout" from /order/[id] 404s.
 * COMMON MISTAKE: forgetting `await params` in Next 15+ — params is a
 *       Promise; reading .id directly yields "[object Promise]" at runtime.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return LOCATIONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const loc = LOCATIONS.find((l) => l.id === id);
  if (!loc) return { title: "Location not found" };
  return {
    title: `Checkout — ${loc.name}`,
    description: `Place your pickup order at Sam's ${loc.name}.`,
  };
}

export default async function OrderCheckoutPage({ params }: PageProps) {
  const { id } = await params;
  const location = LOCATIONS.find((l) => l.id === id);
  if (!location) notFound();

  return (
    <main>
      <section className="border-b border-border bg-cream py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Link
            href={`/order/${location.id}`}
            className="mb-3 inline-block text-sm text-charcoal/70 underline underline-offset-4 hover:text-sams-red"
          >
            &larr; Back to menu
          </Link>
          <h1 className="font-display text-3xl text-charcoal md:text-5xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pickup at {location.name} &middot; {location.address.street},{" "}
            {location.address.city}, {location.address.state}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <CheckoutForm location={location} />
        </div>
      </section>
    </main>
  );
}
