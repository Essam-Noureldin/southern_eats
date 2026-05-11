/**
 * WHAT: One review card. Platform label + star rating header,
 *       quote in display font, attribution line.
 * WHY:  Single unit of repetition for the homepage Reviews grid
 *       (and a future /reviews aggregation page if the franchise
 *       wants one). Inline SVG stars instead of lucide-react to
 *       avoid the icon-library dependency cost for one shape.
 * IF REMOVED: Reviews section can't render individual reviews.
 * COMMON MISTAKE: hard-coding 5 stars. Stars are data-driven so a
 *       4-star or 3-star review renders honestly — the master
 *       prompt's reviews policy is real, attributed, honest.
 */
import type { Review } from "@/lib/reviews";
import { PLATFORM_LABELS } from "@/lib/reviews";

const StarIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4 fill-butter text-butter"
    data-testid="review-star"
  >
    <path d="M12 2l2.9 6.9 7.6.6-5.8 4.9 1.8 7.4L12 18l-6.5 3.8 1.8-7.4L1.5 9.5l7.6-.6L12 2z" />
  </svg>
);

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {PLATFORM_LABELS[review.platform]}
        </span>
        <div
          className="flex"
          role="img"
          aria-label={`${review.stars} out of 5 stars`}
        >
          {Array.from({ length: review.stars }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>
      </div>
      <p className="mt-4 flex-1 font-display text-lg leading-snug md:text-xl">
        &ldquo;{review.quote}&rdquo;
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        &mdash; {review.name}, {review.city} &middot; {review.date}
      </p>
      {review.attributionUri ? (
        // Google's policy requires that displayed reviews link back to
        // the source on Google Maps. The mock fallback reviews don't
        // have an attribution URL, so this link is conditional.
        <a
          href={review.attributionUri}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:underline"
        >
          View on Google
        </a>
      ) : null}
    </article>
  );
}
