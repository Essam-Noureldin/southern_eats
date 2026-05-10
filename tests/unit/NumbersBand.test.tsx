/**
 * WHAT: Unit tests for components/sections/NumbersBand.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - section heading carrying the "41 locations. 11 states" promise
 *       - four stat tiles (number + label) for Locations / Franchise fee /
 *         Royalty / Population territory
 */
import { render, screen } from "@testing-library/react";
import NumbersBand from "@/components/sections/NumbersBand";

describe("NumbersBand", () => {
  it("renders the pull-quote naming 41 locations and 11 states", () => {
    render(<NumbersBand />);
    expect(
      screen.getByText(/41 locations\.?\s*11 states/i),
    ).toBeInTheDocument();
  });

  it("renders the four stat numbers", () => {
    render(<NumbersBand />);
    expect(screen.getAllByText("41").length).toBeGreaterThan(0);
    expect(screen.getByText("$25k")).toBeInTheDocument();
    expect(screen.getByText("6%")).toBeInTheDocument();
    expect(screen.getByText("50k")).toBeInTheDocument();
  });

  it("renders the four stat labels", () => {
    render(<NumbersBand />);
    expect(screen.getByText(/^locations$/i)).toBeInTheDocument();
    expect(screen.getByText(/franchise fee/i)).toBeInTheDocument();
    expect(screen.getByText(/^royalty$/i)).toBeInTheDocument();
    expect(screen.getByText(/population territory/i)).toBeInTheDocument();
  });
});
