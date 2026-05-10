/**
 * WHAT: /franchise — long-form pitch page for prospective franchisees.
 *       Pays off the FranchiseTease homepage CTA and the "Franchise
 *       opportunities" button on /our-story.
 * WHY:  /franchise was 404'ing — the same broken-CTA pattern we just
 *       fixed for /our-story. The numbers (41 locations, 11 states,
 *       since 2008, $25k fee, 6% royalty, 50k territory) are the
 *       verified facts already on the homepage NumbersBand. The page
 *       expands the pitch into the editorial long-form treatment used
 *       on /our-story so the two pages feel of-a-kind.
 * IF REMOVED: FranchiseTease and /our-story CTAs 404 again.
 *
 * !!! BEFORE LAUNCH !!!
 *   - Numbers are sourced from the homepage NumbersBand which was
 *     already in the Lovable demo. Confirm the actual fee / royalty /
 *     territory terms with the franchise office before public launch.
 *   - The /contact page is the current capture point; if a
 *     dedicated franchisee-application form is ever built, swap the
 *     CTAs to point there instead.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

export default function FranchisePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Franchise opportunities
      </p>
      <h1 className="font-display text-4xl leading-[1.05] md:text-7xl">
        Bring Sam&apos;s to <em>your town</em>.
      </h1>

      <p className="mt-8 text-xl leading-relaxed text-muted-foreground md:text-2xl">
        41 locations. 11 Southern states. One playbook, refined over
        eighteen years &mdash; from Sam Gazawaneh&apos;s first fryer in
        Shreveport in 2008 to the latest opening this year.
      </p>

      <Image
        src="/images/sams-storefront.jpg"
        alt="A Sam's Southern Eatery storefront with the brand sign reading 'Sam's Southern Eatery & Seafood, Opening Soon'"
        width={1200}
        height={900}
        className="mt-12 aspect-[4/3] w-full rounded-2xl object-cover"
      />

      <WeightShiftHeading
        as="h2"
        className="mt-16 font-display text-3xl md:text-5xl"
      >
        The numbers, plainly.
      </WeightShiftHeading>

      <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-8 md:grid-cols-4">
        {TERMS.map((t) => (
          <div key={t.label}>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">
              {t.label}
            </dt>
            <dd className="mt-1 font-display text-3xl md:text-4xl">
              {t.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 text-lg leading-relaxed">
        No surprise line items. No percentage that creeps after year
        three. The fee is what we ask to bring you onto the system. The
        6% royalty funds the support you actually use. The 50,000-person
        territory means the Sam&apos;s up the road won&apos;t be ours.
      </p>

      <WeightShiftHeading
        as="h2"
        className="mt-16 font-display text-3xl md:text-5xl"
      >
        What you actually get.
      </WeightShiftHeading>

      <ul className="mt-6 space-y-6 text-lg leading-relaxed">
        <li>
          <strong className="font-display text-2xl italic">
            A working menu.
          </strong>{" "}
          Hand-breaded chicken, jumbo shrimp, cornmeal-crusted catfish,
          hush puppies, gumbo, the comeback sauce. Recipes locked in,
          with prep guides and supplier contacts.
        </li>
        <li>
          <strong className="font-display text-2xl italic">
            Territory protection.
          </strong>{" "}
          Every franchise gets a 50,000-population radius the brand
          won&apos;t open inside. Cannibalising a partner is the fastest
          way to lose a partner.
        </li>
        <li>
          <strong className="font-display text-2xl italic">
            A founder who shows up.
          </strong>{" "}
          Sam still works a full week in the kitchen of every new
          opening &mdash; sleeves up, training the line by feel rather
          than by manual.
        </li>
        <li>
          <strong className="font-display text-2xl italic">
            Eighteen years of playbook.
          </strong>{" "}
          What works in a dining room of forty seats versus eighty.
          What dishes pull on a Tuesday. Where the margin is and where
          the waste is. Documented, not folkloric.
        </li>
      </ul>

      <figure className="mt-12">
        <Image
          src="/images/dish-jumboshrimp-wide.jpeg"
          alt="A platter of golden hand-breaded jumbo fried shrimp — the Sam's signature dish"
          width={1920}
          height={1080}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
        <figcaption className="mt-3 text-sm italic text-muted-foreground">
          The signature: hand-breaded jumbo shrimp.
        </figcaption>
      </figure>

      <WeightShiftHeading
        as="h2"
        className="mt-16 font-display text-3xl md:text-5xl"
      >
        Who we&apos;re looking for.
      </WeightShiftHeading>

      <p className="mt-6 text-lg leading-relaxed">
        Operators, not absentee investors. People who&apos;ll be on the
        floor a few nights a week, who care that the catfish is hot and
        the cornmeal is fresh, who&apos;d rather train a new cook than
        write a memo about training a new cook. If that&apos;s you, the
        rest is paperwork.
      </p>

      <p className="mt-4 text-lg leading-relaxed">
        Existing restaurant experience helps but isn&apos;t required.
        Sam started without it. What matters more is the work ethic and
        the willingness to show up.
      </p>

      <WeightShiftHeading
        as="h2"
        className="mt-16 font-display text-3xl md:text-5xl"
      >
        Next steps.
      </WeightShiftHeading>

      <p className="mt-6 text-lg leading-relaxed">
        Send us a note with the city or region you&apos;re thinking
        about. We&apos;ll send back the Franchise Disclosure Document
        and book a call. No high-pressure sales sequence &mdash; just a
        conversation about whether your market fits the model.
      </p>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center rounded-full bg-sams-red px-7 py-4 text-base font-semibold text-cream transition-transform hover:scale-[1.03]"
        >
          Contact the franchise team
        </Link>
        <Link
          href="/our-story"
          className="inline-flex items-center rounded-full border border-charcoal/30 px-7 py-4 text-base font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
        >
          Read Sam&apos;s story
        </Link>
      </div>
    </main>
  );
}
