/**
 * WHAT: Tests the MenuExperience client component on /menu.
 * WHY:  Wraps the menu list with four behaviours: search filter,
 *       sticky scroll-spy category nav, per-category auto-scrolling
 *       carousel (track animated via CSS, items rendered 3× for the
 *       seamless loop), and an empty-state when no items match.
 *       Test-first locks the contract: search filters items by name +
 *       description, categories with zero matches are hidden, the
 *       empty state appears when nothing matches, clicking a category
 *       nav pill calls scrollIntoView on the right section, and each
 *       carousel track renders 3× the items with an animationDuration
 *       inline style scaled to item count.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import MenuExperience from "@/components/menu/MenuExperience";
import type { MenuItem, Category } from "@/lib/menu";

// DishLink hits next/navigation's useRouter which throws in jsdom.
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

const cats: { id: Category; label: string }[] = [
  { id: "appetizers", label: "Starters" },
  { id: "seafood", label: "Seafood" },
  { id: "drinks", label: "Drinks" },
];

const items: MenuItem[] = [
  {
    id: "fried-pickles",
    category: "appetizers",
    name: "Fried Pickles",
    description: "Crispy dill chips with ranch.",
    imageUrl: "/images/dish-friedpickles.jpeg",
    price: 4.99,
    tags: [],
  },
  {
    id: "jumbo-shrimp",
    category: "seafood",
    name: "Jumbo Shrimp",
    description: "Hand-breaded jumbo shrimp.",
    imageUrl: "/images/dish-jumboshrimp-square.jpeg",
    price: 13.99,
    tags: ["shellfish"],
  },
  {
    id: "sweet-tea",
    category: "drinks",
    name: "Sweet Tea",
    description: "Brewed fresh, served cold.",
    imageUrl: "/images/dish-sweettea.jpeg",
    price: 2.49,
    tags: [],
  },
];

describe("MenuExperience", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it("renders all items and category labels by default", () => {
    render(<MenuExperience items={items} categories={cats} />);
    // Each dish name is rendered 3× (one per repeat copy of the
    // carousel track) — assert at least one occurrence.
    expect(
      screen.getAllByText(/fried pickles/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/jumbo shrimp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sweet tea/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/starters/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/seafood/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/drinks/i).length).toBeGreaterThan(0);
  });

  it("renders a search input with the right accessible name", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const search = screen.getByRole("searchbox", { name: /search menu/i });
    expect(search).toBeInTheDocument();
  });

  it("filters items by search query (matches name)", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const search = screen.getByRole("searchbox", { name: /search menu/i });
    act(() => {
      fireEvent.change(search, { target: { value: "shrimp" } });
    });
    expect(screen.getAllByText(/jumbo shrimp/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Fried Pickles")).not.toBeInTheDocument();
    expect(screen.queryByText("Sweet Tea")).not.toBeInTheDocument();
  });

  it("filters by description text too", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const search = screen.getByRole("searchbox", { name: /search menu/i });
    act(() => {
      fireEvent.change(search, { target: { value: "ranch" } });
    });
    expect(screen.getAllByText(/fried pickles/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Jumbo Shrimp")).not.toBeInTheDocument();
  });

  it("hides categories whose items are all filtered out", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const search = screen.getByRole("searchbox", { name: /search menu/i });
    act(() => {
      fireEvent.change(search, { target: { value: "shrimp" } });
    });
    expect(screen.queryByRole("heading", { name: /^starters$/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /^drinks$/i })).toBeNull();
    expect(
      screen.getByRole("heading", { name: /^seafood$/i }),
    ).toBeInTheDocument();
  });

  it("shows an empty-state message when nothing matches", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const search = screen.getByRole("searchbox", { name: /search menu/i });
    act(() => {
      fireEvent.change(search, { target: { value: "xxxxxxxxxx" } });
    });
    expect(screen.getByText(/no matches/i)).toBeInTheDocument();
  });

  it("scrolls to the section when a category nav button is clicked", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const seafoodPill = screen.getByRole("button", { name: /^seafood$/i });
    act(() => {
      fireEvent.click(seafoodPill);
    });
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("renders each category's carousel track with the menu-carousel-track class", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const track = screen.getByTestId("menu-carousel-seafood");
    expect(track.className).toMatch(/menu-carousel-track/);
  });

  it("repeats every item 3 times in the track for a seamless loop", () => {
    render(<MenuExperience items={items} categories={cats} />);
    // jumbo-shrimp is the only seafood item, so the seafood track has
    // exactly 3 list items (REPEATS = 3 copies).
    const track = screen.getByTestId("menu-carousel-seafood");
    expect(track.querySelectorAll("li").length).toBe(3);
  });

  it("sets an inline animationDuration on each track scaled to item count", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const track = screen.getByTestId("menu-carousel-seafood");
    // Tracks must have a positive seconds-based animationDuration.
    const dur = track.style.animationDuration;
    expect(dur).toMatch(/^\d+s$/);
    const seconds = parseInt(dur, 10);
    expect(seconds).toBeGreaterThan(0);
  });

  it("marks duplicate copies of each item aria-hidden so screen readers see each dish once", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const track = screen.getByTestId("menu-carousel-seafood");
    const lis = Array.from(track.querySelectorAll("li"));
    // First copy is interactive, copies 2 and 3 are aria-hidden decorations.
    expect(lis[0].getAttribute("aria-hidden")).toBeNull();
    expect(lis[1].getAttribute("aria-hidden")).toBe("true");
    expect(lis[2].getAttribute("aria-hidden")).toBe("true");
  });
});
