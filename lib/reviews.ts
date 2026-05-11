/**
 * WHAT: Customer review data — quotes, attribution, platform, stars.
 * WHY:  Mock attributions modelled on real Sam's review patterns;
 *       they are NOT scraped quotes from real reviewers. Used as
 *       offline-safe fallback when GOOGLE_PLACES_API_KEY is unset
 *       OR a location has no googlePlaceId set.
 * IF REMOVED: homepage Reviews section loses its fallback path.
 *
 * !!! BEFORE LAUNCH !!!
 * Per master prompt v2 "Reviews policy", reviews shown publicly must
 * be one of:
 *   - Live Google Places reviews via lib/google-places.ts (attributed
 *     + linked back to Google per ToS)
 *   - Real reviews sourced from the franchise's actual platforms WITH
 *     PERMISSION
 *   - Real reviews collected directly from happy customers via email
 * The mock array below is dev/CI scaffold only.
 *
 * Tracked in DELIVERY_CHECKLIST.md.
 */
import { fetchPlaceData } from "./google-places";
import { LOCATIONS } from "./locations";

export type ReviewPlatform = "tripadvisor" | "google" | "yelp" | "facebook";

export interface Review {
  platform: ReviewPlatform;
  quote: string;
  name: string;
  city: string;
  date: string;
  stars: 1 | 2 | 3 | 4 | 5;
  /**
   * Source URL for the review (e.g. the live Google Maps review page).
   * Required by Google's ToS when displaying live Google reviews. Mock
   * reviews leave this undefined; the UI hides the "View on Google"
   * link when absent.
   */
  attributionUri?: string;
}

export const reviews: Review[] = [
  {
    platform: "tripadvisor",
    quote:
      "The shrimp were massive… hot, sweet, and tender. Best fried shrimp I've ever had.",
    name: "Karen H.",
    city: "Conway, SC",
    date: "February 2026",
    stars: 5,
  },
  {
    platform: "google",
    quote:
      "Best catfish ever! The fish is so mild and crunchy. Servings were HUGE.",
    name: "Marcus J.",
    city: "Russellville, AR",
    date: "January 2026",
    stars: 5,
  },
  {
    platform: "yelp",
    quote:
      "Lots of good food for a very reasonable price. The owner came over to say hi.",
    name: "Linda P.",
    city: "Rome, GA",
    date: "November 2025",
    stars: 5,
  },
  {
    platform: "google",
    quote:
      "Family-size fish fry fed five of us with leftovers. The hush puppies are unreal.",
    name: "Derrick S.",
    city: "Tyler, TX",
    date: "March 2026",
    stars: 5,
  },
  {
    platform: "facebook",
    quote:
      "Sam's Special 25 is the most addictive thing on a menu in this state.",
    name: "Aisha M.",
    city: "Lafayette, LA",
    date: "December 2025",
    stars: 5,
  },
  {
    platform: "tripadvisor",
    quote: "Drove forty miles for this. Worth every minute.",
    name: "Bill T.",
    city: "Pine Bluff, AR",
    date: "October 2025",
    stars: 5,
  },
];

export const pullQuote = {
  text: "A franchise that doesn't suck.",
  source: "TripAdvisor headline, verbatim",
};

export const PLATFORM_LABELS: Record<ReviewPlatform, string> = {
  tripadvisor: "TripAdvisor",
  google: "Google",
  yelp: "Yelp",
  facebook: "Facebook",
};

/**
 * Get reviews to render on the homepage. Returns up to `limit` reviews.
 *
 * Strategy: gather live Google reviews from every location that has a
 * `googlePlaceId` set, in parallel (with the fetch-layer cache de-duping
 * concurrent calls within a build). If any live reviews come back, use
 * them. Otherwise fall back to the hand-curated mock array above.
 *
 * Returns up to `limit` reviews (default 3) for the homepage grid.
 */
export async function getHomepageReviews(limit = 3): Promise<Review[]> {
  const placeIds = LOCATIONS
    .map((l) => l.googlePlaceId)
    .filter((id): id is string => !!id);
  if (placeIds.length === 0) {
    return reviews.slice(0, limit);
  }
  const results = await Promise.all(placeIds.map((id) => fetchPlaceData(id)));
  const live: Review[] = [];
  for (const r of results) {
    if (!r) continue;
    for (const review of r.reviews) {
      if (review.stars >= 4) live.push(review);
    }
  }
  if (live.length === 0) {
    return reviews.slice(0, limit);
  }
  // Newest first, by parsed date when present.
  live.sort((a, b) => {
    const da = Date.parse(a.date) || 0;
    const db = Date.parse(b.date) || 0;
    return db - da;
  });
  return live.slice(0, limit);
}
