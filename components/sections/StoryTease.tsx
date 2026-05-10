/**
 * WHAT: "Our story" tease — split layout, headline + founder narrative on
 *       one side, branded storefront photo on the other. CTA to /our-story
 *       for the full read.
 * WHY:  Trust pivot for a 51-location chain. Tells the actual founding
 *       story — Sam Gazawaneh, a Shreveport gas-station worker, bought an
 *       old Taco Bell in 2008 and taught himself to cook. That's a much
 *       sharper origin than the generic "couple eloped" story we inherited
 *       from the lovable demo (which was about a Lansing franchisee, not
 *       the founder — see MASTER_PROMPT_DEVIATIONS.md).
 * IF REMOVED: homepage skips from numbers-band to reviews and the brand
 *       loses the human story that distinguishes it from other Southern
 *       fried-chicken chains.
 * COMMON MISTAKE: claiming a portrait is "the founder" when no real
 *       portrait exists. Show what we can verify; don't fabricate.
 *
 * !!! BEFORE LAUNCH !!!
 *   - The storefront photo (/images/sams-storefront.jpg) is sourced from
 *     the Stillwater News Press 2018 article. It's a press photo we don't
 *     hold rights to. Either license it from Stillwater News, replace
 *     with a Shreveport (flagship) location photo provided by the
 *     franchise, or replace with a real portrait of Sam Gazawaneh once
 *     the franchise is engaged.
 *   - All founder facts (gas-station worker, old Taco Bell, self-taught
 *     cook, hands-on with new openings) come from the Stillwater News
 *     Press piece. Confirm with the franchise before public launch in
 *     case any detail has changed.
 */
import Image from "next/image";
import Link from "next/link";
import WeightShiftHeading from "@/components/typography/WeightShiftHeading";

export default function StoryTease() {
  return (
    <section
      aria-labelledby="story-tease-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:gap-16 md:px-8">
        <div className="order-2 md:order-1">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Our story
          </p>
          <WeightShiftHeading
            id="story-tease-heading"
            className="font-display text-4xl leading-[1.05] md:text-6xl"
          >
            It started in an old <em>Taco Bell</em>, with a fryer Sam taught
            himself to use.
          </WeightShiftHeading>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Sam Gazawaneh was a gas-station worker in Shreveport when he
            bought a shuttered Taco Bell in 2008. Chicken didn&apos;t sell, so
            he taught himself fish, shrimp, and po&apos; boys. Eighteen years
            later he still works a week in the kitchen of every new Sam&apos;s
            that opens.
          </p>
          <Link
            href="/our-story"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-sams-red underline underline-offset-4"
          >
            Read our story &rarr;
          </Link>
        </div>
        <div className="order-1 md:order-2">
          <Image
            src="/images/sams-storefront.jpg"
            alt="A Sam's Southern Eatery location with the brand sign reading 'Sam's Southern Eatery & Seafood, Opening Soon'"
            width={800}
            height={600}
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
