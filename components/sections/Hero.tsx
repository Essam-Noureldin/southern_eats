/**
 * WHAT: Homepage hero section. Full-bleed shrimp platter background
 *       with a charcoal gradient veil for legibility, eyebrow line,
 *       display-italic headline, subheadline, and two CTAs.
 * WHY:  The hero is the make-or-break first impression. The lovable
 *       demo earns its appetite-appeal from the photo + heavy gradient
 *       + Fraunces italic headline. Lifted verbatim, then translated
 *       to Tailwind v4 brand tokens (no inline styles, no raw <img>).
 * IF REMOVED: homepage opens on whatever the next section is — no
 *       headline, no above-fold CTA, instant bounce.
 * COMMON MISTAKE: using <img> instead of next/image (no auto-resize,
 *       no AVIF/WebP, no priority loading hint) or putting the
 *       gradient on the image element (image hides gradient on slow
 *       connections). Gradient is its own absolutely-positioned div
 *       on top of the image.
 */
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden"
    >
      <Image
        src="/images/hero-shrimp.jpg"
        alt="Platter of golden hand-breaded jumbo fried shrimp with hush puppies"
        width={1920}
        height={1080}
        priority
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />

      {/* Charcoal gradient veil — heavy at the bottom, fading up.
          Lets the white display headline stay legible against any
          part of the image. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/95 via-charcoal/60 to-charcoal/15" />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 md:px-8 md:pb-36 md:pt-44">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-cream/85 md:text-sm">
          Shreveport, LA &middot; Since 2008
        </p>
        <h1
          id="hero-heading"
          className="font-display text-[3.5rem] font-black italic leading-[0.92] tracking-tight text-cream sm:text-7xl md:text-[7.5rem]"
        >
          Home of the
          <br />
          jumbo shrimp.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-cream/90 md:text-xl">
          Fried hot. Plates piled high. 51 locations across the South.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/order"
            className="inline-flex items-center rounded-full bg-sams-red px-7 py-4 text-base font-semibold text-cream transition-transform hover:scale-[1.03]"
          >
            Order online
          </Link>
          <Link
            href="/locations"
            className="inline-flex items-center rounded-full border border-cream/40 bg-cream/10 px-7 py-4 text-base font-semibold text-cream backdrop-blur transition-colors hover:bg-cream/20"
          >
            Find a location
          </Link>
        </div>
      </div>
    </section>
  );
}
