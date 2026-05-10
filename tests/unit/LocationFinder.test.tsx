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

  it("applying a halal-fryer filter narrows the list to halal-only locations", async () => {
    const user = userEvent.setup();
    render(<LocationFinder locations={LOCATIONS} />);

    const halalToggle = screen.getByRole("button", { name: /halal/i });
    await user.click(halalToggle);

    const halalOnly = LOCATIONS.filter((l) => l.dietary.includes("halal-fryer"));
    const nonHalal = LOCATIONS.filter(
      (l) => !l.dietary.includes("halal-fryer"),
    );
    for (const loc of halalOnly) {
      expect(screen.getByText(loc.name)).toBeInTheDocument();
    }
    for (const loc of nonHalal) {
      expect(screen.queryByText(loc.name)).not.toBeInTheDocument();
    }
  });

  it("renders the lazy-loaded map stub", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    expect(screen.getByTestId("location-map-stub")).toBeInTheDocument();
  });

  it("offers a state preset button for every state Sam's operates in", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    const stateLabels = [
      "Louisiana",
      "Texas",
      "Mississippi",
      "Tennessee",
      "Alabama",
      "Georgia",
      "Arkansas",
      "Oklahoma",
    ];
    for (const label of stateLabels) {
      expect(
        screen.getByRole("button", { name: new RegExp(label, "i") }),
      ).toBeInTheDocument();
    }
  });

  it("clicking a state preset re-sorts the list nearest-first to a branch in that state", async () => {
    const user = userEvent.setup();
    render(<LocationFinder locations={LOCATIONS} />);

    await user.click(screen.getByRole("button", { name: /^georgia$/i }));

    // Georgia only has Atlanta in our dataset — should be first card.
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0].textContent).toMatch(/atlanta/i);
  });

  it("does NOT render a 'Use my location' button (removed in favour of state presets)", () => {
    render(<LocationFinder locations={LOCATIONS} />);
    expect(
      screen.queryByRole("button", { name: /use my location/i }),
    ).not.toBeInTheDocument();
  });
});
