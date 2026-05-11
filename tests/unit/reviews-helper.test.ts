/**
 * @jest-environment node
 *
 * WHAT: Unit tests for the getHomepageReviews helper in lib/reviews.
 * WHY:  The helper is the bridge between live Google Places data and
 *       the homepage. Key contracts:
 *         - No locations have placeIds → returns mock fallback.
 *         - Live data returns reviews → uses live, sorted newest-first.
 *         - Live API returns null for every location → falls back to mock.
 *         - 4-star and 5-star reviews are included; <4-star filtered out.
 */
jest.mock("@/lib/google-places", () => ({
  fetchPlaceData: jest.fn(),
}));

jest.mock("@/lib/locations", () => ({
  LOCATIONS: [] as Array<{ id: string; googlePlaceId?: string }>,
}));

import { fetchPlaceData } from "@/lib/google-places";
import { LOCATIONS } from "@/lib/locations";
import { getHomepageReviews, reviews } from "@/lib/reviews";

const mockFetchPlaceData = fetchPlaceData as jest.MockedFunction<typeof fetchPlaceData>;
const mockedLocations = LOCATIONS as unknown as Array<{ id: string; googlePlaceId?: string }>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedLocations.length = 0;
});

describe("getHomepageReviews", () => {
  it("returns mock fallback when no location has a googlePlaceId", async () => {
    mockedLocations.push({ id: "a" }, { id: "b" });
    const result = await getHomepageReviews(3);
    expect(result).toHaveLength(3);
    expect(result).toEqual(reviews.slice(0, 3));
    expect(mockFetchPlaceData).not.toHaveBeenCalled();
  });

  it("returns mock fallback when every fetchPlaceData call returns null", async () => {
    mockedLocations.push({ id: "a", googlePlaceId: "p1" });
    mockFetchPlaceData.mockResolvedValue(null);
    const result = await getHomepageReviews(3);
    expect(result).toEqual(reviews.slice(0, 3));
  });

  it("returns live reviews when any place yields them", async () => {
    mockedLocations.push(
      { id: "a", googlePlaceId: "p1" },
      { id: "b", googlePlaceId: "p2" },
    );
    mockFetchPlaceData
      .mockResolvedValueOnce({
        hours: null,
        reviews: [
          {
            platform: "google",
            quote: "Older live review",
            name: "Anna",
            city: "Google review",
            date: "January 2026",
            stars: 5,
          },
        ],
        rating: 5,
      })
      .mockResolvedValueOnce({
        hours: null,
        reviews: [
          {
            platform: "google",
            quote: "Newer live review",
            name: "Bob",
            city: "Google review",
            date: "April 2026",
            stars: 4,
          },
        ],
        rating: 4.5,
      });
    const result = await getHomepageReviews(3);
    expect(result).toHaveLength(2);
    // Newest first
    expect(result[0]?.name).toBe("Bob");
    expect(result[1]?.name).toBe("Anna");
  });

  it("drops live reviews with fewer than 4 stars", async () => {
    mockedLocations.push({ id: "a", googlePlaceId: "p1" });
    mockFetchPlaceData.mockResolvedValueOnce({
      hours: null,
      reviews: [
        {
          platform: "google",
          quote: "Mediocre",
          name: "Carlos",
          city: "Google review",
          date: "March 2026",
          stars: 3,
        },
        {
          platform: "google",
          quote: "Solid",
          name: "Diana",
          city: "Google review",
          date: "April 2026",
          stars: 4,
        },
      ],
      rating: 3.5,
    });
    const result = await getHomepageReviews(3);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Diana");
  });

  it("respects the limit argument", async () => {
    mockedLocations.push({ id: "a", googlePlaceId: "p1" });
    mockFetchPlaceData.mockResolvedValueOnce({
      hours: null,
      reviews: Array.from({ length: 5 }, (_, i) => ({
        platform: "google" as const,
        quote: `Review ${i}`,
        name: `Person ${i}`,
        city: "Google review",
        date: `2026-0${i + 1}-01`,
        stars: 5 as const,
      })),
      rating: 5,
    });
    const result = await getHomepageReviews(2);
    expect(result).toHaveLength(2);
  });
});
