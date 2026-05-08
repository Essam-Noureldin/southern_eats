/**
 * WHAT: Unit tests for components/sections/Reviews.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - eyebrow "What folks say" + h2 "From the people who matter."
 *       - renders 3 review cards from the reviews data
 *       - blockquote with the pull quote text + attribution
 */
import { render, screen } from "@testing-library/react";
import Reviews from "@/components/sections/Reviews";
import { reviews, pullQuote } from "@/lib/reviews";

describe("Reviews", () => {
  it("renders the 'What folks say' eyebrow", () => {
    render(<Reviews />);
    expect(screen.getByText(/what folks say/i)).toBeInTheDocument();
  });

  it("renders an h2 reading 'From the people who matter'", () => {
    render(<Reviews />);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.textContent?.toLowerCase()).toContain("people who matter");
  });

  it("renders 3 review cards (the lead slate)", () => {
    render(<Reviews />);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBe(3);
  });

  it("renders the pull quote text and source", () => {
    render(<Reviews />);
    expect(screen.getByText(new RegExp(pullQuote.text, "i"))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(pullQuote.source, "i")),
    ).toBeInTheDocument();
  });

  it("uses real review attributions, not placeholders", () => {
    // Sanity check: each card surfaces the reviewer name from data
    render(<Reviews />);
    const lead = reviews.slice(0, 3);
    for (const r of lead) {
      const escapedName = r.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(
        screen.getByText(new RegExp(escapedName)),
      ).toBeInTheDocument();
    }
  });
});
