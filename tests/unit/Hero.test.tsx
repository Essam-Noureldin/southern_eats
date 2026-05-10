/**
 * WHAT: Unit tests for components/sections/Hero.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - eyebrow line naming Shreveport / 2008
 *       - h1 carrying the "jumbo shrimp" tagline
 *       - subheadline naming the "41 locations" scale claim
 *       - two CTAs: Order online -> /order, Find a location -> /locations
 *       - hero image with descriptive alt text (a11y)
 */
import { render, screen } from "@testing-library/react";
import Hero from "@/components/sections/Hero";

describe("Hero — content", () => {
  it("renders an eyebrow line naming Shreveport and 2008", () => {
    render(<Hero />);
    expect(screen.getByText(/shreveport/i)).toBeInTheDocument();
    expect(screen.getByText(/2008/)).toBeInTheDocument();
  });

  it("renders the headline as a level-1 heading containing 'jumbo shrimp'", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent?.toLowerCase()).toContain("jumbo shrimp");
  });

  it("renders a subheadline naming '41 locations'", () => {
    render(<Hero />);
    expect(screen.getByText(/41 locations/i)).toBeInTheDocument();
  });
});

describe("Hero — CTAs", () => {
  it("links 'Order online' to /order", () => {
    render(<Hero />);
    const order = screen.getByRole("link", { name: /order online/i });
    expect(order).toHaveAttribute("href", "/order");
  });

  it("links 'Find a location' to /locations", () => {
    render(<Hero />);
    const locations = screen.getByRole("link", { name: /find a location/i });
    expect(locations).toHaveAttribute("href", "/locations");
  });
});

describe("Hero — image accessibility", () => {
  it("renders a hero image with descriptive alt text", () => {
    render(<Hero />);
    const img = screen.getByRole("img");
    const alt = img.getAttribute("alt") ?? "";
    expect(alt.length).toBeGreaterThan(10);
    // Alt should describe the food, not say "hero" or "image"
    expect(alt.toLowerCase()).toMatch(/shrimp|platter|plate|fried/);
  });
});
