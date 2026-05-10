/**
 * WHAT: Unit tests for components/sections/DishCard.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - renders dish name as a heading
 *       - renders price formatted as $X.XX
 *       - renders description text
 *       - renders image with dish name as alt (a11y)
 *       - renders a "Signature" badge when item.signature === true
 *       - omits the badge when item.signature is falsy
 *       - renders a tag pill per tag, formatted readably
 *         (gf -> GF, family-size -> "family size")
 */
import { render, screen } from "@testing-library/react";
import DishCard from "@/components/sections/DishCard";
import type { MenuItem } from "@/lib/menu";

const baseItem: MenuItem = {
  id: "test-dish",
  category: "seafood",
  name: "Test Dish",
  description: "A delicious test dish for the unit suite.",
  price: 12.5,
  imageUrl: "/images/hero-shrimp.jpg",
  tags: [],
};

describe("DishCard", () => {
  it("renders the dish name as a heading", () => {
    render(<DishCard item={baseItem} />);
    expect(
      screen.getByRole("heading", { name: /test dish/i }),
    ).toBeInTheDocument();
  });

  it("renders price formatted to two decimals with a $ prefix", () => {
    render(<DishCard item={baseItem} />);
    expect(screen.getByText("$12.50")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<DishCard item={baseItem} />);
    expect(
      screen.getByText(/delicious test dish for the unit suite/i),
    ).toBeInTheDocument();
  });

  it("renders an image with the dish name as alt text", () => {
    render(<DishCard item={baseItem} />);
    const img = screen.getByRole("img", { name: /test dish/i });
    expect(img).toBeInTheDocument();
  });

  it("renders a Signature badge when item.signature is true", () => {
    render(<DishCard item={{ ...baseItem, signature: true }} />);
    expect(screen.getByText(/^signature$/i)).toBeInTheDocument();
  });

  it("does not render the Signature badge when signature is falsy", () => {
    render(<DishCard item={baseItem} />);
    expect(screen.queryByText(/^signature$/i)).not.toBeInTheDocument();
  });

  it("renders a pill per tag, formatting 'gf' as GF", () => {
    render(<DishCard item={{ ...baseItem, tags: ["gf"] }} />);
    expect(screen.getByText("GF")).toBeInTheDocument();
  });

  it("formats 'family-size' as readable text", () => {
    render(<DishCard item={{ ...baseItem, tags: ["family-size"] }} />);
    expect(screen.getByText(/family size/i)).toBeInTheDocument();
  });

  it("renders a typographic placeholder when imageUrl is missing", () => {
    const itemNoImage: MenuItem = { ...baseItem };
    delete itemNoImage.imageUrl;
    render(<DishCard item={itemNoImage} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    // Fallback area carries the dish name (and the article heading also
    // does), so the name appears at least twice.
    expect(screen.getAllByText(/test dish/i).length).toBeGreaterThanOrEqual(2);
  });

  it("omits the price line when price is missing", () => {
    const itemNoPrice: MenuItem = { ...baseItem };
    delete itemNoPrice.price;
    render(<DishCard item={itemNoPrice} />);
    expect(screen.queryByText(/^\$\d/)).not.toBeInTheDocument();
  });
});
