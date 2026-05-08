/**
 * WHAT: Mobile-only sticky bottom bar with a single Order Online CTA.
 *       Lives in chrome (RootLayout), not page content — appears on
 *       every page on small viewports.
 * WHY:  On a phone, the navbar's "Order Online" pill scrolls away
 *       within the first screen. A persistent thumb-zone CTA at the
 *       bottom keeps the conversion path one tap away on long pages
 *       without being a popup.
 * IF REMOVED: mobile users have to scroll back to the top to find
 *       the order CTA. Conversions drop.
 * COMMON MISTAKE: forgetting to add bottom padding to the Footer on
 *       mobile — without it this fixed bar overlaps the copyright
 *       line. Footer.tsx therefore uses pb-24 md:pb-12.
 */
import Link from "next/link";

export default function MobileOrderBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-cream to-transparent p-3 md:hidden">
      <Link
        href="/order"
        className="block w-full rounded-full bg-sams-red py-4 text-center text-base font-semibold text-cream shadow-2xl"
      >
        Order online &rarr;
      </Link>
    </div>
  );
}
