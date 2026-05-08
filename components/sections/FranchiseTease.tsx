/**
 * WHAT: Full-bleed sams-red franchise pitch section. Eyebrow,
 *       Fraunces italic headline, supporting copy with the $25k
 *       fee and 18-year playbook, single cream-pill CTA to
 *       /franchise.
 * WHY:  Doubles as the closing call-to-action of the homepage.
 *       Sams-red full-bleed contrasts every other section and
 *       gives the franchise pitch its own visual moment instead
 *       of being buried in the footer.
 * IF REMOVED: no clear inbound for prospective franchisees from
 *       the homepage; lead-gen drops to the navbar Franchise link.
 */
import Link from "next/link";

export default function FranchiseTease() {
  return (
    <section
      aria-labelledby="franchise-tease-heading"
      className="bg-sams-red py-20 text-cream md:py-28"
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] opacity-80">
          Franchise opportunities
        </p>
        <h2
          id="franchise-tease-heading"
          className="mt-4 font-display text-5xl italic leading-[0.95] md:text-7xl"
        >
          Bring Sam&apos;s to your town.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg opacity-90 md:text-xl">
          51 locations and growing. $25k franchise fee, territory
          protection, and an operations playbook built over 18 years.
        </p>
        <Link
          href="/franchise"
          className="mt-8 inline-flex items-center rounded-full bg-cream px-8 py-4 text-base font-semibold text-sams-red transition-transform hover:scale-[1.03]"
        >
          See the numbers &rarr;
        </Link>
      </div>
    </section>
  );
}
