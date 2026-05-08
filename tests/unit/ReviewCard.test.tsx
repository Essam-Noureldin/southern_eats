/**
 * WHAT: Unit tests for components/sections/ReviewCard.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - renders the platform label (TripAdvisor / Google / Yelp / Facebook)
 *       - renders the quote text
 *       - renders attribution with name, city, and date
 *       - renders one star icon per review.stars value
 */
import { render, screen } from "@testing-library/react";
import ReviewCard from "@/components/sections/ReviewCard";
import type { Review } from "@/lib/reviews";

const baseReview: Review = {
  platform: "tripadvisor",
  quote: "Best fried shrimp I've ever had.",
  name: "Karen H.",
  city: "Conway, SC",
  date: "February 2026",
  stars: 5,
};

describe("ReviewCard", () => {
  it("renders the platform label", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText(/TripAdvisor/)).toBeInTheDocument();
  });

  it("renders the quote text", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText(/best fried shrimp/i)).toBeInTheDocument();
  });

  it("renders attribution with name, city, and date", () => {
    render(<ReviewCard review={baseReview} />);
    const attribution = screen.getByText(/Karen H\..*Conway, SC.*February 2026/);
    expect(attribution).toBeInTheDocument();
  });

  it("renders one star icon per review.stars", () => {
    const { container } = render(
      <ReviewCard review={{ ...baseReview, stars: 4 }} />,
    );
    const stars = container.querySelectorAll('[data-testid="review-star"]');
    expect(stars.length).toBe(4);
  });

  it("maps each platform to its proper display label", () => {
    const platforms = [
      { platform: "google" as const, expected: "Google" },
      { platform: "yelp" as const, expected: "Yelp" },
      { platform: "facebook" as const, expected: "Facebook" },
    ];
    for (const { platform, expected } of platforms) {
      const { unmount } = render(
        <ReviewCard review={{ ...baseReview, platform }} />,
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    }
  });
});
