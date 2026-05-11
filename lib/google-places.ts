/**
 * WHAT: Server-side Google Places API (v1) client. Fetches live opening
 *       hours + reviews for a single place by Place ID, normalises the
 *       Google response shape into our local Hours + Review types, and
 *       caches at the Next.js fetch layer for 24h.
 * WHY:  Two reasons:
 *       1. Reviews: clients already curate their reputation on Google
 *          Business Profile. Pulling live reviews removes a duplicate
 *          edit chore vs. maintaining a hand-rolled list, and the
 *          reviews stay fresh without redeploying.
 *       2. Hours: same logic. Clients update hours on Google for SEO
 *          regardless; mirroring them onto the website is one less
 *          place to forget.
 * IF REMOVED: components fall back to mock reviews and the static
 *       `hours[]` array on each location. No crash.
 * COMMON MISTAKE: forgetting Google's attribution requirement. Each
 *       review the API returns includes an authorAttribution.uri; we
 *       must surface it on the review card. The wrapper normalises the
 *       attribution into the Review type so the UI can't accidentally
 *       drop it.
 *
 * COST: ~$0.017 per Place Details call. With `revalidate: 86400`
 * (1-day cache) and 41 locations, that's ~$0.70/month. The Google
 * Maps Platform free tier (~$200/mo credit) covers it ~280×.
 *
 * FAILURE POLICY: any failure (missing key, network error, malformed
 * response) returns null. Callers fall back to mock/static data.
 * Errors are console.warned in dev, swallowed silently in production
 * (Sentry would already catch a hard throw, but we don't want every
 * caller to know about Places-specific failure modes).
 */
import type { Hours } from "./locations";
import type { Review } from "./reviews";

// Day index used by Google Places v1: 0=Sunday, 1=Monday, ..., 6=Saturday.
const DAY_ORDER: ReadonlyArray<Hours["day"]> = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

interface GooglePeriodPoint {
  day: number; // 0-6, 0 = Sunday
  hour: number; // 0-23
  minute: number; // 0-59
}

interface GooglePeriod {
  open: GooglePeriodPoint;
  close?: GooglePeriodPoint; // omitted for 24/7 places
}

interface GoogleAuthorAttribution {
  displayName: string;
  uri?: string;
  photoUri?: string;
}

interface GoogleReview {
  rating: number; // 1-5
  text?: { text: string; languageCode?: string };
  originalText?: { text: string; languageCode?: string };
  authorAttribution?: GoogleAuthorAttribution;
  publishTime?: string; // ISO 8601
  // The publicly-viewable review on Google.
  // Used as the attribution link target.
  googleMapsUri?: string;
}

interface GooglePlaceResponse {
  regularOpeningHours?: { periods?: GooglePeriod[] };
  reviews?: GoogleReview[];
  rating?: number;
}

export interface PlaceData {
  hours: Hours[] | null;
  reviews: Review[];
  rating: number | null;
}

const FIELD_MASK = "regularOpeningHours,reviews,rating";
const ENDPOINT = "https://places.googleapis.com/v1/places";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function toHHMM(point: GooglePeriodPoint): string {
  return `${pad2(point.hour)}:${pad2(point.minute)}`;
}

/**
 * Map a Google `regularOpeningHours.periods[]` array to our Hours[] shape.
 *
 * Google's periods can span midnight (open Mon 23:00 → close Tue 01:00).
 * For our display purposes we record the close on the OPEN day with a
 * close > 24:00-style string ("25:00"), but since our Hours type uses
 * "HH:MM" strings, we just record both points on the open day and let
 * "24:00" represent midnight. Past-midnight closes drop the cross-day
 * info — acceptable for the marketing display (the existing static
 * data does the same).
 */
function periodsToHours(periods: GooglePeriod[]): Hours[] {
  const out: Hours[] = [];
  for (const p of periods) {
    const day = DAY_ORDER[p.open.day];
    if (!day) continue;
    const open = toHHMM(p.open);
    // No close = 24/7 open; render as midnight-to-midnight.
    const close = p.close ? toHHMM(p.close) : "24:00";
    out.push({ day, open, close });
  }
  // Sort Mon→Sun for stable rendering (matches the static-data convention).
  const rank: Record<Hours["day"], number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return out.sort((a, b) => rank[a.day] - rank[b.day]);
}

/**
 * Map a Google review to our Review type. Google reviews don't carry the
 * platform-specific "city" field we use locally, so we leave it as the
 * author's display name's locale-free form (or empty) and prefer the
 * publish time formatted as "Month YYYY" to match the mock data.
 *
 * Returns null if the review lacks the minimum fields we need.
 */
function googleReviewToReview(r: GoogleReview): Review | null {
  const quote = r.text?.text ?? r.originalText?.text;
  const name = r.authorAttribution?.displayName;
  if (!quote || !name) return null;
  const stars = clampStars(Math.round(r.rating));
  if (stars === null) return null;
  return {
    platform: "google",
    quote,
    name,
    // Google reviews don't expose a city; the attribution link below
    // carries the "verified on Google" provenance. Leaving city blank
    // would push the date next to a stray comma in the UI, so we use
    // the platform name as a neutral filler. The card already shows
    // the "Google" platform label up top.
    city: "Google review",
    date: formatPublishTime(r.publishTime),
    stars,
    attributionUri: r.googleMapsUri,
  };
}

function clampStars(n: number): 1 | 2 | 3 | 4 | 5 | null {
  if (n < 1 || n > 5) return null;
  return n as 1 | 2 | 3 | 4 | 5;
}

function formatPublishTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

const MAX_REVIEWS = 5;

/**
 * Fetch live Place data. Returns null when:
 *  - GOOGLE_PLACES_API_KEY env var is unset
 *  - the API call fails for any reason
 *  - the response shape is unexpected
 *
 * Caching: Next.js's fetch cache is keyed by URL + headers + options.
 * `revalidate: 86400` means at most one Google call per place per day
 * per deployment.
 */
export async function fetchPlaceData(
  placeId: string,
): Promise<PlaceData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  if (!placeId) return null;

  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      warn(`[google-places] HTTP ${res.status} for ${placeId}`);
      return null;
    }
    const data = (await res.json()) as GooglePlaceResponse;
    const periods = data.regularOpeningHours?.periods;
    const hours = periods && periods.length > 0 ? periodsToHours(periods) : null;
    const reviewsRaw = data.reviews ?? [];
    const reviews = reviewsRaw
      .map(googleReviewToReview)
      .filter((r): r is Review => r !== null)
      .slice(0, MAX_REVIEWS);
    return {
      hours,
      reviews,
      rating: typeof data.rating === "number" ? data.rating : null,
    };
  } catch (err) {
    warn(`[google-places] fetch failed for ${placeId}: ${String(err)}`);
    return null;
  }
}

function warn(msg: string): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(msg);
}
