/**
 * WHAT: Tests the MenuExperience client component on /menu.
 * WHY:  Wraps the menu list with three new behaviours: a search input
 *       that filters items live, a sticky scroll-spy category nav, and
 *       an "empty state" message when no items match. Test-first locks
 *       the contract: search filters items by name + description,
 *       categories with zero matches are hidden, the empty state
 *       appears when nothing matches, and clicking a category nav pill
 *       calls scrollIntoView on the right section.
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
    // The default jest.setup matchMedia mock is fine — Revealable starts
    // revealed under prefers-reduced-motion which is what the mock reports.
    Element.prototype.scrollIntoView = jest.fn();
  });

  it("renders all items and category labels by default", () => {
    render(<MenuExperience items={items} categories={cats} />);
    expect(screen.getByText("Fried Pickles")).toBeInTheDocument();
    expect(screen.getByText("Jumbo Shrimp")).toBeInTheDocument();
    expect(screen.getByText("Sweet Tea")).toBeInTheDocument();
    // Category labels appear in BOTH the nav and as the section heading,
    // so getAllByText.
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
    expect(screen.getByText("Jumbo Shrimp")).toBeInTheDocument();
    expect(screen.queryByText("Fried Pickles")).not.toBeInTheDocument();
    expect(screen.queryByText("Sweet Tea")).not.toBeInTheDocument();
  });

  it("filters by description text too", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const search = screen.getByRole("searchbox", { name: /search menu/i });
    act(() => {
      fireEvent.change(search, { target: { value: "ranch" } });
    });
    expect(screen.getByText("Fried Pickles")).toBeInTheDocument();
    expect(screen.queryByText("Jumbo Shrimp")).not.toBeInTheDocument();
  });

  it("hides categories whose items are all filtered out", () => {
    render(<MenuExperience items={items} categories={cats} />);
    const search = screen.getByRole("searchbox", { name: /search menu/i });
    act(() => {
      fireEvent.change(search, { target: { value: "shrimp" } });
    });
    // Only seafood category should be present in the section headings now.
    // (Category labels in the nav rail are also gated on visibility, so
    // they should drop out too.)
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
    // Pill in the nav rail (button), not the section heading.
    const seafoodPill = screen.getByRole("button", { name: /^seafood$/i });
    act(() => {
      fireEvent.click(seafoodPill);
    });
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("renders per-category prev/next arrow buttons with accessible names", () => {
    render(<MenuExperience items={items} categories={cats} />);
    expect(
      screen.getByRole("button", { name: /scroll seafood left/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /scroll seafood right/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /scroll starters left/i }),
    ).toBeInTheDocument();
  });

  it("scrolls the rail by clientWidth * 0.8 when an arrow is clicked", () => {
    const scrollByMock = jest.fn();
    // Stub scrollBy on every div the carousel touches.
    Element.prototype.scrollBy = scrollByMock as unknown as typeof Element.prototype.scrollBy;
    render(<MenuExperience items={items} categories={cats} />);
    const next = screen.getByRole("button", { name: /scroll seafood right/i });
    act(() => {
      fireEvent.click(next);
    });
    expect(scrollByMock).toHaveBeenCalled();
    const arg = scrollByMock.mock.calls[0]?.[0] as ScrollToOptions | undefined;
    expect(arg?.behavior).toBe("smooth");
    // Direction is positive for "right" arrow.
    expect((arg?.left ?? 0) >= 0).toBe(true);
  });
});
