/**
 * WHAT: Unit tests for components/sections/DishCarousel.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - section landmark with a heading containing "known for"
 *       - "See the full menu" link points at /menu
 *       - renders one DishCard per signature menu item (filtered
 *         from lib/menu — currently 5 signature items)
 *       - prev/next buttons exist with accessible names and call
 *         scrollBy on the scroll container in opposite directions
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import DishCarousel from "@/components/sections/DishCarousel";
import { menu } from "@/lib/menu";

describe("DishCarousel", () => {
  it("renders a section heading naming what the brand is known for", () => {
    render(<DishCarousel />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent?.toLowerCase()).toContain("known");
  });

  it("links to the full menu at /menu", () => {
    render(<DishCarousel />);
    // Desktop and mobile each render their own visible-at-breakpoint link
    const links = screen.getAllByRole("link", { name: /full menu/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/menu");
    }
  });

  it("renders a card for each signature menu item", () => {
    render(<DishCarousel />);
    const expected = menu.filter((m) => m.signature).slice(0, 6);
    expect(expected.length).toBeGreaterThan(0);
    // Names contain regex specials like "(", ")", "'" — escape them.
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const item of expected) {
      expect(
        screen.getByRole("heading", {
          name: new RegExp(escape(item.name), "i"),
        }),
      ).toBeInTheDocument();
    }
  });

  it("renders previous and next buttons with accessible names", () => {
    render(<DishCarousel />);
    expect(
      screen.getByRole("button", { name: /previous/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("scrolls the carousel forward when next is clicked", () => {
    const scrollBy = jest.fn();
    Element.prototype.scrollBy = scrollBy;
    render(<DishCarousel />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    });
    expect(scrollBy).toHaveBeenCalled();
    const arg = scrollBy.mock.calls[0][0];
    expect(arg.left).toBeGreaterThan(0);
  });

  it("scrolls the carousel backward when previous is clicked", () => {
    const scrollBy = jest.fn();
    Element.prototype.scrollBy = scrollBy;
    render(<DishCarousel />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    });
    expect(scrollBy).toHaveBeenCalled();
    const arg = scrollBy.mock.calls[0][0];
    expect(arg.left).toBeLessThan(0);
  });
});
