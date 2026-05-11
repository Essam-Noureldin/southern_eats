import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCATIONS, getLocationWithOverrides } from "@/lib/locations";
import LocationMenu from "@/components/order/LocationMenu";
import { restaurantLd, jsonLdScript } from "@/lib/json-ld";

/**
 * WHAT: /order/[id] — per-location menu page. Server component:
 *       resolves the route param, 404s on a bad id, renders a header
 *       (location name, address, "Change location" backlink) and
 *       hands off to LocationMenu (client) for the menu grid + cart
 *       sidebar interactivity.
 * WHY:  Splitting the async param resolution from the menu render
 *       keeps LocationMenu unit-testable without mocking Promises
 *       (same pattern as /menu/[slug]/DishDetail). Locations are a
 *       fixed set so generateStaticParams pre-renders all 41.
 * IF REMOVED: every "Start order" link in the picker 404s.
 * COMMON MISTAKE: forgetting `await params` in Next 15+ — params is
 *       a Promise; using `params.id` directly yields "[object
 *       Promise]" at runtime.
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
    title: `Order from ${loc.name}`,
    description: `Build your order from Sam's ${loc.name}. Pickup at ${loc.address.street}, ${loc.address.city}, ${loc.address.state}.`,
  };
}

export default async function OrderLocationPage({ params }: PageProps) {
  const { id } = await params;
  const location = await getLocationWithOverrides(id);
  if (!location) notFound();

  return (
    <main>
      {/*
       * Per-location Restaurant JSON-LD. Lets Google surface this
       * branch in "Sam's Southern Eatery near me" results with its real
       * address, phone, coords, and hours. branchOf links back to the
       * site-wide Organization @id emitted in app/layout.tsx.
       */}
      <script
        {...jsonLdScript(
          restaurantLd(
            location,
            process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          ),
        )}
      />

      {/*
       * Demo-prices banner. Prices on /order are placeholder values
       * anchored against typical casual-Southern price bands (see
       * lib/menu.ts source comments). We surface this honestly so
       * users aren't misled; the franchise replaces the prices with
       * real ones at launch and the banner gets removed in that pass.
       */}
      <div
        role="note"
        className="bg-butter/30 px-4 py-2 text-center text-xs text-charcoal/80 md:px-8"
      >
        Demo prices &mdash; final pricing set per location at launch.
      </div>

      <section className="border-b border-border bg-cream py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Link
            href="/order"
            className="mb-3 inline-block text-sm text-charcoal/70 underline underline-offset-4 hover:text-sams-red"
          >
            &larr; Pick a different location
          </Link>
          <h1 className="font-display text-3xl text-charcoal md:text-5xl">
            {location.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pickup at {location.address.street}, {location.address.city},{" "}
            {location.address.state} {location.address.zip} &middot;{" "}
            {location.phone}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <LocationMenu location={location} />
        </div>
      </section>
    </main>
  );
}
