/**
 * @jest-environment node
 *
 * WHAT: Unit-ish tests for the lib/google-places.ts client. Mocks
 *       global.fetch so no live network traffic; verifies:
 *         - missing API key returns null (offline fallback)
 *         - HTTP error returns null (graceful failure)
 *         - well-formed response is mapped to our Hours + Review types
 *         - day-index mapping is correct (Google uses 0=Sun)
 *         - reviews are capped at 5
 *         - attributionUri is preserved for Google ToS compliance
 * WHY:  This is the single point of contact with an external API. Tests
 *       hold the contract: if Google's response shape changes, this
 *       suite breaks loudly and we know to update the mapper.
 */
import { fetchPlaceData } from "@/lib/google-places";

const ORIGINAL_ENV = process.env;
const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

function mockFetch(payload: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

describe("fetchPlaceData", () => {
  it("returns null when GOOGLE_PLACES_API_KEY is unset", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    const result = await fetchPlaceData("ChIJ-test");
    expect(result).toBeNull();
  });

  it("returns null when placeId is empty", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    const result = await fetchPlaceData("");
    expect(result).toBeNull();
  });

  it("returns null on HTTP error", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    mockFetch({ error: "boom" }, false, 500);
    const result = await fetchPlaceData("ChIJ-test");
    expect(result).toBeNull();
  });

  it("returns null on fetch rejection", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("network")) as unknown as typeof fetch;
    const result = await fetchPlaceData("ChIJ-test");
    expect(result).toBeNull();
  });

  it("maps Google opening hours periods to our Hours[] format with Mon→Sun order", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    mockFetch({
      // Order intentionally not Mon→Sun to verify we sort.
      // Google uses day 0=Sunday.
      regularOpeningHours: {
        periods: [
          {
            open: { day: 0, hour: 11, minute: 0 },
            close: { day: 0, hour: 20, minute: 0 },
          },
          {
            open: { day: 1, hour: 10, minute: 30 },
            close: { day: 1, hour: 22, minute: 0 },
          },
          {
            open: { day: 6, hour: 9, minute: 0 },
            close: { day: 6, hour: 23, minute: 0 },
          },
        ],
      },
    });
    const result = await fetchPlaceData("ChIJ-test");
    expect(result).not.toBeNull();
    expect(result?.hours).toEqual([
      { day: "Mon", open: "10:30", close: "22:00" },
      { day: "Sat", open: "09:00", close: "23:00" },
      { day: "Sun", open: "11:00", close: "20:00" },
    ]);
  });

  it("treats missing close as midnight (24:00)", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    mockFetch({
      regularOpeningHours: {
        periods: [{ open: { day: 1, hour: 8, minute: 0 } }],
      },
    });
    const result = await fetchPlaceData("ChIJ-test");
    expect(result?.hours).toEqual([{ day: "Mon", open: "08:00", close: "24:00" }]);
  });

  it("maps reviews and preserves attributionUri for ToS compliance", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    mockFetch({
      reviews: [
        {
          rating: 5,
          text: { text: "Best catfish in town." },
          authorAttribution: { displayName: "Marcus J." },
          publishTime: "2026-01-15T12:00:00Z",
          googleMapsUri: "https://maps.google.com/?cid=12345",
        },
      ],
    });
    const result = await fetchPlaceData("ChIJ-test");
    expect(result?.reviews).toHaveLength(1);
    const r = result?.reviews[0];
    expect(r?.platform).toBe("google");
    expect(r?.quote).toBe("Best catfish in town.");
    expect(r?.name).toBe("Marcus J.");
    expect(r?.stars).toBe(5);
    expect(r?.attributionUri).toBe("https://maps.google.com/?cid=12345");
  });

  it("caps reviews at 5", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    const sevenReviews = Array.from({ length: 7 }, (_, i) => ({
      rating: 5,
      text: { text: `Review ${i}` },
      authorAttribution: { displayName: `Person ${i}` },
      publishTime: "2026-01-01T00:00:00Z",
    }));
    mockFetch({ reviews: sevenReviews });
    const result = await fetchPlaceData("ChIJ-test");
    expect(result?.reviews).toHaveLength(5);
  });

  it("drops reviews missing required fields without crashing", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    mockFetch({
      reviews: [
        // Missing text
        { rating: 5, authorAttribution: { displayName: "Anon" } },
        // Missing author
        { rating: 5, text: { text: "Solid food" } },
        // Valid
        {
          rating: 4,
          text: { text: "Pretty good" },
          authorAttribution: { displayName: "Jane" },
        },
      ],
    });
    const result = await fetchPlaceData("ChIJ-test");
    expect(result?.reviews).toHaveLength(1);
    expect(result?.reviews[0]?.name).toBe("Jane");
  });

  it("returns rating when present", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    mockFetch({ rating: 4.6 });
    const result = await fetchPlaceData("ChIJ-test");
    expect(result?.rating).toBe(4.6);
  });

  it("sends the API key as an X-Goog-Api-Key header", async () => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key-xyz";
    const fetchSpy = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;
    await fetchPlaceData("ChIJ-abc");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const callArgs = fetchSpy.mock.calls[0];
    expect(callArgs[0]).toContain("places.googleapis.com/v1/places/ChIJ-abc");
    expect(callArgs[1].headers["X-Goog-Api-Key"]).toBe("test-key-xyz");
    expect(callArgs[1].headers["X-Goog-FieldMask"]).toMatch(/reviews/);
  });
});
