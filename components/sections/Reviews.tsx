/**
 * WHAT: Homepage social-proof section. "What folks say" eyebrow +
 *       headline + 3-card grid + pull-quote blockquote.
 * WHY:  Trust signal between the founder story and the franchise
 *       pitch. Three cards is the sweet spot — enough to establish
 *       a chorus, few enough to read in two seconds. The pull quote
 *       is the kicker; "A franchise that doesn't suck." is verbatim
 *       from a real TripAdvisor headline (cited as such).
 * IF REMOVED: homepage loses its social-proof beat between story
 *       and franchise.
 * COMMON MISTAKE: animating the grid in on scroll with overlapping
 *       fades — Framer Motion variants on three siblings end up
 *       fighting each other. Static for now; animation when there's
 *       a real reason for it.
 */
import ReviewCard from "./ReviewCard";
import { reviews, pullQuote } from "@/lib/reviews";

export default function Reviews() {
  const lead = reviews.slice(0, 3);

  return (
    <section
      aria-labelledby="reviews-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          What folks say
        </p>
        <h2
          id="reviews-heading"
          className="mb-10 font-display text-4xl md:text-6xl"
        >
          From the people who matter.
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {lead.map((r, i) => (
            <ReviewCard key={`${r.name}-${i}`} review={r} />
          ))}
        </div>
        <blockquote className="mt-16 max-w-3xl border-l-4 border-sams-red pl-6">
          <p className="font-display text-4xl italic leading-tight md:text-6xl">
            &ldquo;{pullQuote.text}&rdquo;
          </p>
          <footer className="mt-3 text-sm text-muted-foreground">
            &mdash; {pullQuote.source}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
