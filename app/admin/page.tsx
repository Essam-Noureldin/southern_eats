import type { Metadata } from "next";
import Link from "next/link";
import { LOCATIONS } from "@/lib/locations";
import { getAllOverrides } from "@/lib/location-overrides";

/**
 * WHAT: /admin landing page — lists every Sam's location with a row
 *       indicating whether an override is currently set, plus an edit
 *       link to /admin/[id].
 * WHY:  This is the entry point a franchise manager lands on after
 *       Basic Auth. Showing override status here means they can see
 *       at a glance which locations are still on the default-shipped
 *       hours/phone vs. customised.
 * IF REMOVED: /admin would be a route with no UI; users would need to
 *       guess the /admin/[id] urls.
 * COMMON MISTAKE: leaking the override updatedAt in a way that
 *       betrays a manager's edit schedule. We don't ship raw timestamps
 *       beyond a generic "(edited)" indicator — keeps the admin
 *       surface tight.
 */
export const metadata: Metadata = {
  title: "Admin · Location overrides",
  description: "Manage per-location hours and phone overrides.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic"; // overrides come from KV/in-memory

export default async function AdminIndexPage() {
  const overrides = await getAllOverrides();

  const rows = LOCATIONS.map((loc) => ({
    id: loc.id,
    name: loc.name,
    city: loc.address.city,
    state: loc.address.state,
    hasOverride: overrides.has(loc.id),
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-3xl text-charcoal md:text-4xl">
          Location admin
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit per-location hours and phone numbers. Edits go live
          immediately on{" "}
          <Link
            href="/locations"
            className="underline underline-offset-4 hover:text-sams-red"
          >
            the public locations page
          </Link>
          .
        </p>
      </header>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-charcoal">{row.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.city}, {row.state}
                {row.hasOverride ? " · (edited)" : ""}
              </p>
            </div>
            <Link
              href={`/admin/${row.id}`}
              className="self-start rounded-full border border-border bg-cream px-4 py-1 text-sm font-medium text-charcoal hover:bg-sams-red hover:text-cream sm:self-auto"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
