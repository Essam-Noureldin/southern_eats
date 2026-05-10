/**
 * WHAT: Tests the Southern marquee band component.
 * WHY:  The marquee is decorative — purely visual. Test-first locks the
 *       contract: it renders the brand phrases in display italic, repeats
 *       them enough times for a seamless loop, and is marked aria-hidden
 *       so screen readers don't announce a looping carousel of disjointed
 *       words.
 * IF REMOVED: a future refactor could drop the aria-hidden (screen-
 *       reader regression) or drop the repeat (visible seam between
 *       loop iterations) silently.
 */
import { render, screen } from "@testing-library/react";
import Marquee from "@/components/sections/Marquee";

describe("Marquee", () => {
  it("renders all brand phrases", () => {
    render(<Marquee />);
    // Each phrase appears multiple times because the loop repeats —
    // assert at least one occurrence of each.
    expect(screen.getAllByText(/hand-breaded/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fried gold/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/41 locations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/11 states/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/since 2008/i).length).toBeGreaterThan(0);
  });

  it("repeats the phrase set at least twice for a seamless loop", () => {
    render(<Marquee />);
    // Use 'Hand-breaded' as the witness — should appear >=2 times.
    const occurrences = screen.getAllByText(/hand-breaded/i);
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });

  it("is marked decorative so screen readers skip it", () => {
    render(<Marquee />);
    const region = screen.getByTestId("marquee");
    expect(region).toHaveAttribute("aria-hidden", "true");
  });

  it("uses the marquee animation utility class on the inner track", () => {
    render(<Marquee />);
    const track = screen.getByTestId("marquee-track");
    expect(track.className).toMatch(/animate-marquee/);
  });
});
