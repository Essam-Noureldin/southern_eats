import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCATIONS, type Hours } from "@/lib/locations";
import { getOverride } from "@/lib/location-overrides";
import LocationOverrideForm from "@/components/admin/LocationOverrideForm";

/**
 * WHAT: /admin/[id] — edit page for one location's hours + phone.
 *       Loads the location and any existing override, then hands off
 *       to the form component which posts back via server actions.
 * WHY:  Server component so the initial render carries the current
 *       override values without a client fetch. The form itself uses
 *       useActionState (client) for the submit lifecycle.
 * IF REMOVED: the "Edit" link on /admin 404s.
 * COMMON MISTAKE: making this client-side and `fetch`ing the override
 *       on mount — adds a flash of empty inputs and forces extra round
 *       trips. The form has plenty of client state for the submit; the
 *       initial values are server-rendered.
 */
interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const loc = LOCATIONS.find((l) => l.id === id);
  return {
    title: loc ? `Admin · ${loc.name}` : "Admin · Location not found",
    robots: { index: false, follow: false },
  };
}

const DAYS: Hours["day"][] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export default async function AdminLocationPage({ params }: PageProps) {
  const { id } = await params;
  const location = LOCATIONS.find((l) => l.id === id);
  if (!location) notFound();
  const override = await getOverride(id);

  // Compose initial form values: override fields when present, static
  // location fields otherwise. The form is what an admin would edit,
  // not the override delta, so we always show effective current state.
  const effectivePhone = override?.phone ?? location.phone;
  const effectiveHours =
    override?.hours && override.hours.length > 0 ? override.hours : location.hours;
  const hoursByDay = new Map<Hours["day"], Hours>(
    effectiveHours.map((h) => [h.day, h]),
  );
  const initialDays = DAYS.map((day) => {
    const h = hoursByDay.get(day);
    return {
      day,
      closed: !h,
      open: h?.open ?? "10:00",
      close: h?.close ?? "21:00",
    };
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <Link
        href="/admin"
        className="mb-3 inline-block text-sm text-charcoal/70 underline underline-offset-4 hover:text-sams-red"
      >
        &larr; All locations
      </Link>
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-3xl text-charcoal md:text-4xl">
          {location.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {location.address.street}, {location.address.city},{" "}
          {location.address.state} {location.address.zip}
        </p>
        {override ? (
          <p className="mt-2 text-xs text-sams-red">
            Override active — clearing it returns this location to its
            default phone and hours.
          </p>
        ) : null}
      </header>

      <LocationOverrideForm
        locationId={location.id}
        initialPhone={effectivePhone}
        initialDays={initialDays}
        hasOverride={Boolean(override)}
      />
    </main>
  );
}
