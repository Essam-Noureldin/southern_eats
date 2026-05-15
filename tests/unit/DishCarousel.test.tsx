/**
 * WHAT: Unit tests for components/sections/DishCarousel — the infinite
 *       conveyor belt of signature dishes.
 * WHY:  Locks the new contract after the redesign from a button-driven
 *       scroll-snap carousel to a pure-CSS marquee belt:
 *       - section landmark + heading containing "known"
 *       - "See the full menu" link → /menu
 *       - every signature dish is announced exactly once (the loop
 *         duplicates render aria-hidden, so they're out of the a11y tree)
 *       - the belt renders REPEATS (3) copies for the seamless loop
 *       - the track carries the marquee animation + hover-pause
 *       - the old prev/next buttons are gone (a forever-loop has no page)
 */
import { render, screen } from "@testing-library/react";
import DishCarousel from "@/components/sections/DishCarousel";
import { menu } from "@/lib/menu";

const REPEATS = 3;
const signatures = menu.filter((m) => m.signature);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("DishCarousel", () => {
  it("renders a section heading naming what the brand is known for", () => {
    render(<DishCarousel />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent?.toLowerCase()).toContain("known");
  });

  it("links to the full menu at /menu", () => {
    render(<DishCarousel />);
    const links = screen.getAllByRole("link", { name: /full menu/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/menu");
    }
  });

  it("has at least one signature dish to put on the belt", () => {
    expect(signatures.length).toBeGreaterThan(0);
  });

  it("announces each signature dish exactly once (loop copies aria-hidden)", () => {
    render(<DishCarousel />);
    for (const item of signatures) {
      // getAllByRole ignores aria-hidden subtrees, so despite REPEATS
      // copies in the DOM the heading resolves to exactly one node.
      const headings = screen.getAllByRole("heading", {
        name: new RegExp(escape(item.name), "i"),
      });
      expect(headings).toHaveLength(1);
    }
  });

  it("renders REPEATS copies of every signature card for a seamless loop", () => {
    render(<DishCarousel />);
    const cards = screen.getAllByTestId("dish-belt-card");
    expect(cards).toHaveLength(signatures.length * REPEATS);
  });

  it("drives the belt with the css marquee animation and pauses on hover", () => {
    render(<DishCarousel />);
    const track = screen.getByTestId("dish-belt-track");
    expect(track.className).toContain("animate-dish-marquee");
    expect(track.className).toContain("[animation-play-state:paused]");
  });

  it("no longer renders prev/next buttons", () => {
    render(<DishCarousel />);
    expect(screen.queryByRole("button", { name: /previous/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /next/i })).toBeNull();
  });
});
