/**
 * WHAT: Smoke test for /locations — renders the page and runs jest-axe
 *       with the region rule disabled (we use landmark unit tests
 *       instead of axe's stricter region rule, see TESTING.md).
 * WHY:  Catches accidental landmark removal, missing alt text on map
 *       attribution, and any axe regression introduced by future edits.
 * IF REMOVED: a future change could ship an inaccessible page silently.
 * COMMON MISTAKE: trying to render the map in this smoke test. WebGL
 *       is unavailable in jsdom; mock LocationMap so the page renders
 *       its non-canvas chrome.
 */
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import LocationsPage from "@/app/locations/page";

expect.extend(toHaveNoViolations);

jest.mock("@/components/sections/LocationMap", () => ({
  __esModule: true,
  default: () => (
    <div role="region" aria-label="Map of all Sam's Southern Eatery locations" />
  ),
}));

describe("/locations page", () => {
  it("renders without crashing", () => {
    const { container } = render(<LocationsPage />);
    expect(container).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(<LocationsPage />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
