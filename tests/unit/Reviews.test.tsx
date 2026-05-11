/**
 * WHAT: Unit tests for components/sections/Reviews.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - eyebrow "What folks say" + h2 "From the people who matter."
 *       - renders 3 review cards from the reviews data
 *       - blockquote with the pull quote text + attribution
 *
 *       Reviews is an async server component — we await the JSX it
 *       returns, then render. The `getHomepageReviews` helper is
 *       mocked so tests are deterministic and don't depend on whether
 *       any location has a googlePlaceId set.
 */
import { render, screen } from "@testing-library/react";
import { reviews, pullQuote } from "@/lib/reviews";

jest.mock("@/lib/reviews", () => {
  const actual = jest.requireActual("@/lib/reviews");
  return {
    ...actual,
    getHomepageReviews: jest
      .fn()
      .mockImplementation((limit = 3) => Promise.resolve(actual.reviews.slice(0, limit))),
  };
});

import Reviews from "@/components/sections/Reviews";

async function renderReviews() {
  const tree = await Reviews();
  render(tree);
}

describe("Reviews", () => {
  it("renders the 'What folks say' eyebrow", async () => {
    await renderReviews();
    expect(screen.getByText(/what folks say/i)).toBeInTheDocument();
  });

  it("renders an h2 reading 'From the people who matter'", async () => {
    await renderReviews();
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.textContent?.toLowerCase()).toContain("people who matter");
  });

  it("renders 3 review cards (the lead slate)", async () => {
    await renderReviews();
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBe(3);
  });

  it("renders the pull quote text and source", async () => {
    await renderReviews();
    expect(screen.getByText(new RegExp(pullQuote.text, "i"))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(pullQuote.source, "i")),
    ).toBeInTheDocument();
  });

  it("uses real review attributions, not placeholders", async () => {
    await renderReviews();
    const lead = reviews.slice(0, 3);
    for (const r of lead) {
      const escapedName = r.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(
        screen.getByText(new RegExp(escapedName)),
      ).toBeInTheDocument();
    }
  });
});
