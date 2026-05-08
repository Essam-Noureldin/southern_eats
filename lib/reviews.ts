/**
 * WHAT: Customer review data — quotes, attribution, platform, stars.
 * WHY:  Lifted verbatim from lovable-demo for the speculative build.
 *       These are mock attributions modelled on real Sam's review
 *       patterns; they are NOT scraped or fabricated quotes from
 *       real reviewers.
 * IF REMOVED: homepage Reviews section breaks.
 *
 * !!! BEFORE LAUNCH !!!
 * Per master prompt v2 "Reviews policy", launch reviews must be:
 *   - Real, sourced from the franchise's actual Google/TripAdvisor/
 *     Yelp page WITH PERMISSION, OR collected directly from happy
 *     customers via email
 *   - Attributed (name + initial, suburb, or platform)
 *   - Permission-confirmed (never scrape; ToS violation)
 *
 * Replace this file's contents on launch day. Tracked in
 * DELIVERY_CHECKLIST.md.
 */
export type ReviewPlatform = "tripadvisor" | "google" | "yelp" | "facebook";

export interface Review {
  platform: ReviewPlatform;
  quote: string;
  name: string;
  city: string;
  date: string;
  stars: 1 | 2 | 3 | 4 | 5;
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
