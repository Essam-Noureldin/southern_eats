import type { Metadata } from "next";
import { LOCATIONS } from "@/lib/locations";
import OrderExperience from "@/components/order/OrderExperience";

/**
 * WHAT: /order page — owns its <main> landmark, renders an intro
 *       block and the OrderExperience client component with the full
 *       location dataset.
 * WHY:  Six surfaces in the chrome (Hero, Navbar desktop + mobile,
 *       Footer, MobileOrderBar, dish-detail) link here; this page
 *       fixes the last 404 in the navigation. Page is server-rendered
 *       so location names + addresses ship in HTML on first paint
 *       (SEO win); the search filter is the only piece that needs JS.
 * IF REMOVED: every "Order Online" button on the site 404s again.
 * COMMON MISTAKE: hard-coding a single ordering URL across all
 *       locations. Sam's stores use different platforms (or none yet).
 *       The right shape is per-location orderUrl on lib/locations.ts;
 *       missing = disabled "coming soon" button + working tel: link.
 */
export const metadata: Metadata = {
  title: "Order Online",
  description:
    "Order from your nearest Sam's Southern Eatery. Most stores have online ordering; a few are phone-only — find yours below.",
};

export default function OrderPage() {
  return (
    <main>
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-sams-red">
              Order Online
            </p>
            <h1 className="font-display text-5xl text-charcoal md:text-7xl">
              Pick your <em>nearest</em> Sam&apos;s.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-charcoal/80">
              {LOCATIONS.length} stores across the South. Most take online
              orders; a handful are phone-only. Find yours below.
            </p>
          </div>
          <div className="mt-12">
            <OrderExperience locations={LOCATIONS} />
          </div>
        </div>
      </section>
    </main>
  );
}
