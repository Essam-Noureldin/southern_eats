/**
 * WHAT: "Our story" tease — split layout, headline + 2-sentence
 *       founder narrative on one side, grayscale founders portrait
 *       on the other. CTA to /our-story for the full read.
 * WHY:  Trust pivot for a 51-location chain. Names the actual humans
 *       (Tracy & Mo Elbahgha — Arab-American couple who eloped to
 *       Shreveport in 2008) so the brand reads as family-owned, not
 *       private equity. Critical for franchise lead generation too.
 * IF REMOVED: homepage skips from numbers-band to reviews and the
 *       brand loses the human story that distinguishes it from other
 *       Southern fried-chicken chains.
 * COMMON MISTAKE: writing the alt text as "Founders" or "Our team"
 *       — meaningless to screen readers. Name the people in the photo.
 */
import Image from "next/image";
import Link from "next/link";

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
          <h2
            id="story-tease-heading"
            className="font-display text-4xl leading-[1.05] md:text-6xl"
          >
            It started with a fryer, a recipe, and a couple who{" "}
            <em>eloped</em>.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Tracy and Mo Elbahgha opened the first Sam&apos;s in Shreveport in
            2008. Eighteen years later, the same recipes, the same comeback
            sauce, the same fryers running hot in 51 dining rooms across nine
            states.
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
            src="/images/founders.jpg"
            alt="Tracy and Mo Elbahgha, founders of Sam's Southern Eatery"
            width={800}
            height={1000}
            className="aspect-[4/5] w-full rounded-2xl object-cover grayscale"
          />
        </div>
      </div>
    </section>
  );
}
