/**
 * WHAT: Behavioural tests for the LocationFinder section.
 *       (List rendering, filter chips, geolocation button — NOT the
 *       MapLibre canvas, which needs WebGL not available in jsdom.)
 * WHY:  The list + filter is the keyboard-and-screenreader-accessible
 *       path to the same information as the map. It must work without JS
 *       beyond React hydration. Tests lock the contract.
 * IF REMOVED: regressions in filtering or sort silently ship.
 * COMMON MISTAKE: trying to render the map in a unit test. WebGL is
 *       unavailable in jsdom; mock the dynamic import or test the
 *       sub-components independently.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationFinder from "@/components/sections/LocationFinder";
import { LOCATIONS } from "@/lib/locations";

// Stub the dynamically-imported map so jsdom doesn't try to instantiate WebGL.
jest.mock("@/components/sections/LocationMap", () => ({
  __esModule: true,
  default: () => <div data-testid="location-map-stub" />,
}));

describe("LocationFinder", () => {
  it("renders every location as a list item by default", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    const items = screen.getAllByRole("listitem");
    // Expect at least one <li> per location (filter chips also render <li>).
    expect(items.length).toBeGreaterThanOrEqual(LOCATIONS.length);
  });

  it("each location card surfaces name, full address, phone, and a directions link", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    for (const loc of LOCATIONS) {
      expect(screen.getByText(loc.name)).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(loc.address.street, "i")),
      ).toBeInTheDocument();
    }
    // Every location has a phone link.
    const telLinks = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href")?.startsWith("tel:"));
    expect(telLinks.length).toBe(LOCATIONS.length);

    // Every location has a directions link to Google Maps.
    const dirLinks = screen
      .getAllByRole("link")
      .filter((a) =>
        a.getAttribute("href")?.startsWith("https://www.google.com/maps/dir/"),
      );
    expect(dirLinks.length).toBe(LOCATIONS.length);
  });

  it("renders dietary filter chips so the feature is visible in the pitch demo", () => {
    // Per-location dietary data is empty (no-synthetic-data policy) but the
    // chips remain visible — the franchise gets to see the filter UX exists
    // and only needs to provide per-branch tags for it to start narrowing.
    render(<LocationFinder locations={LOCATIONS} />);
    expect(
      screen.getByRole("button", { name: /halal-friendly/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /gluten-free/i }),
    ).toBeInTheDocument();
  });

  it("activating a dietary chip while no location has tags shows an explanatory empty-state", async () => {
    const user = userEvent.setup();
    render(<LocationFinder locations={LOCATIONS} />);

    await user.click(screen.getByRole("button", { name: /halal-friendly/i }));

    // List narrows to zero (no location currently carries any dietary tag),
    // and the empty-state copy explains why instead of dead-ending.
    expect(
      screen.getByText(/halal-friendly.*gluten-free.*vegan.*off by default/i),
    ).toBeInTheDocument();
  });

  it("renders the lazy-loaded map stub", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    expect(screen.getByTestId("location-map-stub")).toBeInTheDocument();
  });

  it("offers a state preset button for every state Sam's operates in", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    // Real franchise footprint as of the data swap on 2026-05-10:
    // 11 states. If LOCATIONS gains a new state, that chip should appear too.
    const stateLabels = [
      "Alabama",
      "Arkansas",
      "Illinois",
      "Louisiana",
      "Missouri",
      "Mississippi",
      "North Carolina",
      "Ohio",
      "Oklahoma",
      "South Carolina",
      "Texas",
    ];
    for (const label of stateLabels) {
      expect(
        screen.getByRole("button", { name: new RegExp(`^${label}$`, "i") }),
      ).toBeInTheDocument();
    }
  });

  it("clicking a state preset narrows the list to ONLY that state's branches", async () => {
    const user = userEvent.setup();
    render(<LocationFinder locations={LOCATIONS} />);

    await user.click(screen.getByRole("button", { name: /^texas$/i }));

    const txBranches = LOCATIONS.filter((l) => l.address.state === "TX");
    const nonTxBranches = LOCATIONS.filter((l) => l.address.state !== "TX");
    for (const loc of txBranches) {
      expect(screen.getByText(loc.name)).toBeInTheDocument();
    }
    for (const loc of nonTxBranches) {
      expect(screen.queryByText(loc.name)).not.toBeInTheDocument();
    }
  });

  it("does NOT render a 'Use my location' button (removed in favour of state presets)", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    expect(
      screen.queryByRole("button", { name: /use my location/i }),
    ).not.toBeInTheDocument();
  });
});
