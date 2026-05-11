/**
 * @jest-environment node
 *
 * WHAT: Unit tests for getLocationsWithLiveHours in lib/locations.
 * WHY:  This helper is what makes /locations show live Google hours.
 *       Key contracts:
 *         - Locations without googlePlaceId pass through unchanged.
 *         - Locations with placeId and a successful API response have
 *           hours replaced.
 *         - Locations with placeId but null API response keep static hours.
 *         - Empty API hours don't clobber static hours.
 */
jest.mock("@/lib/google-places", () => ({
  fetchPlaceData: jest.fn(),
}));

import { fetchPlaceData } from "@/lib/google-places";
import { getLocationsWithLiveHours, LOCATIONS } from "@/lib/locations";

const mockFetchPlaceData = fetchPlaceData as jest.MockedFunction<typeof fetchPlaceData>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getLocationsWithLiveHours", () => {
  it("returns a copy of LOCATIONS with no API calls when no placeIds are set", async () => {
    // Live LOCATIONS has no googlePlaceId set anywhere yet.
    const enriched = await getLocationsWithLiveHours();
    expect(enriched).toHaveLength(LOCATIONS.length);
    expect(mockFetchPlaceData).not.toHaveBeenCalled();
    // First location should match its static counterpart
    expect(enriched[0]?.id).toBe(LOCATIONS[0]?.id);
    expect(enriched[0]?.hours).toEqual(LOCATIONS[0]?.hours);
  });

  it("keeps static hours when fetchPlaceData returns null", async () => {
    // Temporarily monkey-patch one location to have a placeId so this
    // branch executes. We restore it in afterEach.
    const target = LOCATIONS[0] as { googlePlaceId?: string };
    target.googlePlaceId = "fake-place-id";
    mockFetchPlaceData.mockResolvedValue(null);

    try {
      const enriched = await getLocationsWithLiveHours();
      expect(mockFetchPlaceData).toHaveBeenCalledWith("fake-place-id");
      expect(enriched[0]?.hours).toEqual(LOCATIONS[0]?.hours);
    } finally {
      delete target.googlePlaceId;
    }
  });

  it("replaces hours when fetchPlaceData returns live data", async () => {
    const target = LOCATIONS[0] as { googlePlaceId?: string };
    target.googlePlaceId = "fake-place-id";
    mockFetchPlaceData.mockResolvedValue({
      hours: [{ day: "Mon", open: "06:00", close: "23:00" }],
      reviews: [],
      rating: 4.5,
    });

    try {
      const enriched = await getLocationsWithLiveHours();
      expect(enriched[0]?.hours).toEqual([
        { day: "Mon", open: "06:00", close: "23:00" },
      ]);
    } finally {
      delete target.googlePlaceId;
    }
  });

  it("falls back to static hours when API returns empty hours", async () => {
    const target = LOCATIONS[0] as { googlePlaceId?: string };
    target.googlePlaceId = "fake-place-id";
    mockFetchPlaceData.mockResolvedValue({
      hours: [],
      reviews: [],
      rating: null,
    });

    try {
      const enriched = await getLocationsWithLiveHours();
      expect(enriched[0]?.hours).toEqual(LOCATIONS[0]?.hours);
    } finally {
      delete target.googlePlaceId;
    }
  });
});
