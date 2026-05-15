/**
 * WHAT: Smoke test for /menu/[slug] — confirms the dish detail page
 *       renders the dish hero (name, price, description, image) and a
 *       "Back to menu" link. Tests the underlying DishDetail component
 *       directly so we don't have to await the async params Promise.
 * WHY:  The detail page is the morph target for the View Transitions
 *       polish. If the hero image's view-transition-name is wrong, the
 *       morph breaks. This test locks: image is rendered with the dish
 *       name as alt, the heading is an h1, price formatting is correct,
 *       and a back-to-menu link exists.
 * IF REMOVED: a future refactor could ship a detail page missing the
 *       hero image or back link without a single test failing.
 */
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import DishDetail from "@/app/menu/[slug]/DishDetail";

expect.extend(toHaveNoViolations);

describe("DishDetail (renders /menu/[slug] body)", () => {
  it("renders the dish name as an h1", () => {
    render(<DishDetail slug="jumbo-shrimp-15" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent?.toLowerCase()).toContain("jumbo shrimp");
  });

  it("renders the dish price formatted as $X.XX", () => {
    render(<DishDetail slug="jumbo-shrimp-15" />);
    // Real samsofmobile.com price (12-pc Shrimp, nearest portion to our
    // 15-count item) — see the PRICES note in lib/menu.ts.
    expect(screen.getByText("$16.99")).toBeInTheDocument();
  });

  it("renders the dish description", () => {
    render(<DishDetail slug="jumbo-shrimp-15" />);
    expect(
      screen.getByText(/hand-breaded jumbo shrimp/i),
    ).toBeInTheDocument();
  });

  it("renders an image with the dish name as alt text", () => {
    render(<DishDetail slug="jumbo-shrimp-15" />);
    const img = screen.getByRole("img", { name: /jumbo shrimp/i });
    expect(img).toBeInTheDocument();
  });

  it("renders a 'Back to menu' link pointing to /menu", () => {
    render(<DishDetail slug="jumbo-shrimp-15" />);
    const back = screen.getByRole("link", { name: /back to menu/i });
    expect(back).toHaveAttribute("href", "/menu");
  });

  it("renders an 'Order online' CTA pointing to /order", () => {
    render(<DishDetail slug="jumbo-shrimp-15" />);
    const order = screen.getByRole("link", { name: /order online/i });
    expect(order).toHaveAttribute("href", "/order");
  });

  it("returns null for an unknown slug (Page-level handles 404)", () => {
    const { container } = render(<DishDetail slug="not-a-real-dish" />);
    expect(container.firstChild).toBeNull();
  });

  it("has no axe violations for a real dish", async () => {
    const { container } = render(<DishDetail slug="jumbo-shrimp-15" />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
