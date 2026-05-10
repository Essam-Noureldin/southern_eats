/**
 * WHAT: /our-story — long-form brand origin page. Pays off the
 *       StoryTease CTA on the homepage with the verified Sam Gazawaneh
 *       narrative.
 * WHY:  The CTA was previously pointing at a 404; visitors who clicked
 *       it bounced. The page now exists and tells the actual founding
 *       story (gas-station worker buys a closed Taco Bell, teaches
 *       himself to cook, pivots from chicken to seafood, builds a 51-
 *       location chain). Editorial weight — Fraunces display headlines,
 *       generous whitespace — to match the brand's premium positioning.
 * IF REMOVED: 'Read our story' link 404s again.
 *
 * !!! BEFORE LAUNCH !!!
 *   - The two pull quotes attributed to Sam Gazawaneh come from a
 *     Stillwater News Press 2018 opening profile (referenced by the
 *     Tribstar 2017 piece on the Terre Haute opening). Confirm the
 *     quotes with the franchise before public launch.
 *   - The storefront photo (`/images/sams-storefront.jpg`) is a press
 *     photo from Stillwater News — same licensing flag as in
 *     StoryTease.tsx.
 *   - Stats line uses 51 / 9 / 2008 (the verified counts from
 *     samssoutherneatery.com /about). The rest of the site still uses
 *     41 / 11; reconcile in a follow-up branch.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import WeightShiftHeading from "@/components/typography/WeightShiftHeading";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How a Shreveport gas-station worker named Sam Gazawaneh bought a closed Taco Bell, taught himself to cook, and built Sam's Southern Eatery.",
};

export default function OurStoryPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Our story
      </p>
      <h1 className="font-display text-4xl leading-[1.05] md:text-7xl">
        It started in an old <em>Taco Bell</em>.
      </h1>

      <p className="mt-8 text-xl leading-relaxed text-muted-foreground md:text-2xl">
        Sam Gazawaneh wasn&apos;t a chef. He was a gas-station worker in
        Shreveport, Louisiana, who decided in 2008 to do something different
        with his life.
      </p>

      <Image
        src="/images/sams-storefront.jpg"
        alt="A Sam's Southern Eatery location with the brand sign reading 'Sam's Southern Eatery & Seafood, Opening Soon'"
        width={1200}
        height={900}
        className="mt-12 aspect-[4/3] w-full rounded-2xl object-cover"
      />

      <WeightShiftHeading
        as="h2"
        className="mt-16 font-display text-3xl md:text-5xl"
      >
        From a gas station to a fryer.
      </WeightShiftHeading>

      <p className="mt-6 text-lg leading-relaxed">
        He bought a shuttered Taco Bell on the edge of Shreveport. The plan
        was to sell chicken &mdash; he didn&apos;t know much about
        restaurants, and chicken seemed simple. He hung a sign and opened
        the doors.
      </p>

      <p className="mt-4 text-lg leading-relaxed">
        Chicken didn&apos;t move. People wanted seafood. So Sam taught
        himself to cook fish, then shrimp, then po&apos; boys, then the
        comeback sauce. He kept what worked. He let the rest go.
      </p>

      <figure className="mt-10">
        <Image
          src="/images/dish-friedchicken.jpeg"
          alt="A plate of golden hand-breaded fried chicken — the dish Sam started with in 2008"
          width={1200}
          height={1200}
          className="aspect-square w-full rounded-2xl object-cover"
        />
        <figcaption className="mt-3 text-sm italic text-muted-foreground">
          What Sam started with: hand-breaded fried chicken.
        </figcaption>
      </figure>

      <blockquote className="mt-12 border-l-4 border-sams-red pl-6 font-display text-2xl italic leading-snug md:text-3xl">
        &ldquo;I started this business not knowing much about restaurants,
        but people ended up loving the food I made and the feel I gave to
        the restaurant.&rdquo;
        <footer className="mt-4 text-sm not-italic text-muted-foreground">
          &mdash; Sam Gazawaneh, founder
        </footer>
      </blockquote>

      <WeightShiftHeading
        as="h2"
        className="mt-16 font-display text-3xl md:text-5xl"
      >
        Chicken first. Seafood by accident.
      </WeightShiftHeading>

      <figure className="mt-8">
        <Image
          src="/images/dish-jumboshrimp-wide.jpeg"
          alt="A platter of golden hand-breaded jumbo fried shrimp — the dish Sam taught himself to cook and the brand became known for"
          width={1920}
          height={1080}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
        <figcaption className="mt-3 text-sm italic text-muted-foreground">
          The pivot dish: jumbo shrimp.
        </figcaption>
      </figure>

      <p className="mt-8 text-lg leading-relaxed">
        The pivot worked. Sam&apos;s settled into Cajun-leaning Southern
        cooking &mdash; jumbo shrimp, cornmeal-crusted catfish, hush
        puppies, fried green tomatoes, gumbo, and the comeback sauce that
        regulars now ask for by name. The portions stayed plentiful. The
        prices stayed sane.
      </p>

      <blockquote className="mt-8 border-l-4 border-butter pl-6 font-display text-2xl italic leading-snug md:text-3xl">
        &ldquo;I learned to cook on my own and opened Sam&apos;s, mainly
        serving chicken at first, but I eventually learned to prepare fish
        and shrimp and other items, and over time, ended up turning
        Sam&apos;s into a seafood restaurant.&rdquo;
        <footer className="mt-4 text-sm not-italic text-muted-foreground">
          &mdash; Sam Gazawaneh
        </footer>
      </blockquote>

      <WeightShiftHeading
        as="h2"
        className="mt-16 font-display text-3xl md:text-5xl"
      >
        51 dining rooms. One kitchen at a time.
      </WeightShiftHeading>

      <p className="mt-6 text-lg leading-relaxed">
        Sam&apos;s now runs 51 locations across nine Southern states, all
        franchised after Shreveport. Sam still works a week in the kitchen
        of every new opening &mdash; sleeves up, comeback sauce on the
        apron, training the line by feel rather than by manual.
      </p>

      <p className="mt-4 text-lg leading-relaxed">
        That&apos;s the recipe: hand-breaded, fried hot, plates piled high,
        and the founder still showing up to make sure it&apos;s right.
      </p>

      <div className="mt-10 grid grid-cols-3 gap-3 md:gap-4">
        <Image
          src="/images/dish-catfish.jpeg"
          alt="Cornmeal-crusted fried catfish"
          width={600}
          height={600}
          className="aspect-square w-full rounded-xl object-cover"
        />
        <Image
          src="/images/dish-hushpuppies.jpeg"
          alt="A basket of golden hush puppies"
          width={600}
          height={600}
          className="aspect-square w-full rounded-xl object-cover"
        />
        <Image
          src="/images/dish-gumbo.jpg"
          alt="A bowl of dark roux Southern gumbo"
          width={600}
          height={600}
          className="aspect-square w-full rounded-xl object-cover"
        />
      </div>

      <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            Founded
          </dt>
          <dd className="mt-1 font-display text-3xl md:text-4xl">2008</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            Locations
          </dt>
          <dd className="mt-1 font-display text-3xl md:text-4xl">51</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            States
          </dt>
          <dd className="mt-1 font-display text-3xl md:text-4xl">9</dd>
        </div>
      </dl>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/menu"
          className="inline-flex items-center rounded-full bg-sams-red px-7 py-4 text-base font-semibold text-cream transition-transform hover:scale-[1.03]"
        >
          See the menu
        </Link>
        <Link
          href="/franchise"
          className="inline-flex items-center rounded-full border border-charcoal/30 px-7 py-4 text-base font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
        >
          Franchise opportunities
        </Link>
      </div>
    </main>
  );
}
