/**
 * WHAT: /franchise — pitch page for prospective franchisees. Mixes
 *       full-bleed sams-red hero, charcoal numbers band, marquee
 *       strip, and contained prose blocks. Designed to read as a
 *       pitch deck, not as another /our-story long-read.
 * WHY:  /franchise was 404'ing — same broken-CTA pattern we just fixed
 *       for /our-story. First pass of this page accidentally cloned the
 *       /our-story editorial shell (max-w-3xl prose column, eyebrow +
 *       H1 + storefront photo + WeightShiftHeading h2s). Sales page
 *       needs its own rhythm — full-bleed bands, larger typography,
 *       marquee strip — so a visitor flicking between the two pages
 *       sees them as visually distinct surfaces.
 * IF REMOVED: FranchiseTease and /our-story CTAs 404 again.
 *
 * !!! BEFORE LAUNCH !!!
 *   - Numbers ($25k / 6% / 50k / 41 / 11 / 2008) are sourced from the
 *     homepage NumbersBand which was already in the Lovable demo.
 *     Confirm the actual fee / royalty / territory terms with the
 *     franchise office before public launch.
 *   - The /contact page is the current capture point; if a dedicated
 *     franchisee-application form is built, swap the CTAs to it.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import WeightShiftHeading from "@/components/typography/WeightShiftHeading";

export const metadata: Metadata = {
  title: "Franchise opportunities",
  description:
    "Bring Sam's Southern Eatery to your town. 41 locations across 11 states, founded 2008. $25k franchise fee, 6% royalty, 50k population territory protection.",
};

const TERMS = [
  { value: "$25k", label: "Franchise fee" },
  { value: "6%", label: "Royalty" },
  { value: "50k", label: "Population territory" },
  { value: "2008", label: "Founded" },
] as const;

const MARQUEE_PHRASES = [
  "Operators wanted",
  "Territory protected",
  "Sleeves up at every opening",
  "41 dining rooms",
  "11 Southern states",
  "Since 2008",
] as const;

const MARQUEE_REPEATS = 3;

export default function FranchisePage() {
  return (
    <main>
      <section
        aria-labelledby="franchise-hero-heading"
        className="bg-sams-red px-4 py-20 text-cream md:px-8 md:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] opacity-80">
            Franchise opportunities
          </p>
          <h1
            id="franchise-hero-heading"
            className="mt-4 font-display text-5xl leading-[0.95] md:text-8xl"
          >
            Bring Sam&apos;s to <em>your town</em>.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed opacity-90 md:text-2xl">
            41 locations. 11 Southern states. One playbook, refined over
            eighteen years &mdash; from Sam Gazawaneh&apos;s first fryer
            in Shreveport in 2008 to the latest opening this year.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-cream px-7 py-4 text-base font-semibold text-sams-red transition-transform hover:scale-[1.03]"
            >
              Contact the franchise team
            </Link>
            <Link
              href="/our-story"
              className="inline-flex items-center rounded-full border border-cream/40 px-7 py-4 text-base font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              Read Sam&apos;s story
            </Link>
          </div>
        </div>
      </section>

      <section
        data-testid="franchise-marquee"
        aria-hidden="true"
        className="overflow-hidden border-y border-charcoal/15 bg-cream py-5 md:py-7"
      >
        <div
          data-testid="franchise-marquee-track"
          className="flex w-max items-center gap-10 whitespace-nowrap font-display text-2xl italic text-charcoal animate-marquee hover:[animation-play-state:paused] md:gap-14 md:text-4xl"
        >
          {Array.from({ length: MARQUEE_REPEATS }).map((_, copyIndex) => (
            <Fragment key={copyIndex}>
              {MARQUEE_PHRASES.map((phrase, i) => (
                <Fragment key={`${copyIndex}-${i}`}>
                  <span>{phrase}</span>
                  <span aria-hidden="true" className="text-sams-red/70">
                    &middot;
                  </span>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="franchise-numbers-heading"
        className="bg-charcoal px-4 py-20 text-cream md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <WeightShiftHeading
            as="h2"
            id="franchise-numbers-heading"
            className="font-display text-4xl italic text-butter md:text-6xl"
          >
            The numbers, plainly.
          </WeightShiftHeading>

          <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-cream/20 pt-10 md:grid-cols-4 md:gap-6">
            {TERMS.map((t) => (
              <div key={t.label}>
                <dt className="text-xs uppercase tracking-widest opacity-70">
                  {t.label}
                </dt>
                <dd className="mt-1 font-display text-5xl md:text-7xl">
                  {t.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 max-w-3xl text-lg leading-relaxed opacity-90 md:text-xl">
            No surprise line items. No percentage that creeps after year
            three. The fee is what we ask to bring you onto the system.
            The 6% royalty funds the support you actually use. The
            50,000-person territory means the Sam&apos;s up the road
            won&apos;t be ours.
          </p>
        </div>
      </section>

      <section className="bg-cream px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <WeightShiftHeading
            as="h2"
            className="font-display text-4xl md:text-6xl"
          >
            What you actually get.
          </WeightShiftHeading>

          <ul className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
            <li>
              <p className="font-display text-3xl italic text-sams-red">
                A working menu.
              </p>
              <p className="mt-3 text-lg leading-relaxed">
                Hand-breaded chicken, jumbo shrimp, cornmeal-crusted
                catfish, hush puppies, gumbo, the comeback sauce.
                Recipes locked in, with prep guides and supplier
                contacts.
              </p>
            </li>
            <li>
              <p className="font-display text-3xl italic text-sams-red">
                Territory protection.
              </p>
              <p className="mt-3 text-lg leading-relaxed">
                Every franchise gets a 50,000-population radius the
                brand won&apos;t open inside. Cannibalising a partner
                is the fastest way to lose a partner.
              </p>
            </li>
            <li>
              <p className="font-display text-3xl italic text-sams-red">
                A founder who shows up.
              </p>
              <p className="mt-3 text-lg leading-relaxed">
                Sam still works a full week in the kitchen of every new
                opening &mdash; sleeves up, training the line by feel
                rather than by manual.
              </p>
            </li>
            <li>
              <p className="font-display text-3xl italic text-sams-red">
                Eighteen years of playbook.
              </p>
              <p className="mt-3 text-lg leading-relaxed">
                What works in a dining room of forty seats versus
                eighty. What dishes pull on a Tuesday. Where the margin
                is and where the waste is. Documented, not folkloric.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[70vh]">
        <Image
          src="/images/dish-jumboshrimp-wide.jpeg"
          alt="A platter of golden hand-breaded jumbo fried shrimp — the Sam's signature dish"
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="absolute inset-0 flex items-center px-4 md:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <p className="font-display text-3xl italic leading-tight text-cream md:text-6xl">
              &ldquo;The recipe is hand-breaded, fried hot, plates piled
              high &mdash; and the founder still showing up to make sure
              it&apos;s right.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <WeightShiftHeading
              as="h2"
              className="font-display text-4xl md:text-5xl"
            >
              Who we&apos;re looking for.
            </WeightShiftHeading>
            <p className="mt-6 text-lg leading-relaxed">
              Operators, not absentee investors. People who&apos;ll be
              on the floor a few nights a week, who care that the
              catfish is hot and the cornmeal is fresh, who&apos;d
              rather train a new cook than write a memo about training
              a new cook. If that&apos;s you, the rest is paperwork.
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              Existing restaurant experience helps but isn&apos;t
              required. Sam started without it. What matters more is
              the work ethic and the willingness to show up.
            </p>
          </div>
          <div>
            <WeightShiftHeading
              as="h2"
              className="font-display text-4xl md:text-5xl"
            >
              Next steps.
            </WeightShiftHeading>
            <p className="mt-6 text-lg leading-relaxed">
              Send us a note with the city or region you&apos;re
              thinking about. We&apos;ll send back the Franchise
              Disclosure Document and book a call. No high-pressure
              sales sequence &mdash; just a conversation about whether
              your market fits the model.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full bg-sams-red px-7 py-4 text-base font-semibold text-cream transition-transform hover:scale-[1.03]"
              >
                Contact the franchise team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
