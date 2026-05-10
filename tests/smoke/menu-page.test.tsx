/**
 * WHAT: Smoke test for /menu — renders the page and confirms every dish
 *       in the menu shows up and is wrapped in a link to its detail page.
 *       Also runs jest-axe.
 * WHY:  /menu is the entry point for the dish-detail morph (polish #2).
 *       If a dish goes missing or its link target is wrong, the
 *       view-transition flow breaks — this test is the regression guard.
 * IF REMOVED: a future refactor could ship a /menu page that's missing
 *       dishes or links to the wrong slug.
 */
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import MenuPage from "@/app/menu/page";
import { menu } from "@/lib/menu";

expect.extend(toHaveNoViolations);

// DishLink calls next/navigation's useRouter, which throws in jsdom
// because there's no App Router context. The smoke test only cares that
// each dish renders a navigable <a> with the right href — the morph
// behaviour belongs in browser/Playwright, not jest.
jest.mock("@/components/menu/DishLink", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("/menu page", () => {
  it("renders without crashing", () => {
    const { container } = render(<MenuPage />);
    expect(container).toBeTruthy();
  });

  it("renders every dish from the menu", () => {
    render(<MenuPage />);
    // Dish names contain regex specials like "(8)" and "(4 fillets)" —
    // escape before building the matcher.
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const dish of menu) {
      expect(
        screen.getAllByRole("heading", {
          name: new RegExp(escape(dish.name), "i"),
        }).length,
      ).toBeGreaterThan(0);
    }
  });

  it("wraps each dish in a link pointing to /menu/<id>", () => {
    render(<MenuPage />);
    const links = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href") ?? "");
    for (const dish of menu) {
      expect(links).toContain(`/menu/${dish.id}`);
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<MenuPage />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
