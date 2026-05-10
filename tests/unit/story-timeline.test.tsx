/**
 * WHAT: Tests the StoryTimeline component used on /our-story.
 * WHY:  The timeline carries the brand's narrative arc as four named
 *       milestones (founding / pivot / first franchise / today). Test-
 *       first locks the contract: the four labelled milestones render,
 *       each in its own list item, each carrying its year/era marker
 *       and short description, all reachable in the document so a
 *       refactor can't silently drop one.
 */
import { render, screen } from "@testing-library/react";
import StoryTimeline from "@/components/sections/StoryTimeline";

describe("StoryTimeline", () => {
  beforeEach(() => {
    // Force reduced-motion so the IO-driven Revealable starts revealed
    // and the test runs without an observer mock.
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it("renders an ordered list with four milestones", () => {
    render(<StoryTimeline />);
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
  });

  it("includes the named era markers in order", () => {
    render(<StoryTimeline />);
    expect(screen.getByText("2008")).toBeInTheDocument();
    expect(screen.getByText(/the pivot/i)).toBeInTheDocument();
    expect(screen.getByText(/first franchise/i)).toBeInTheDocument();
    expect(screen.getByText(/today/i)).toBeInTheDocument();
  });

  it("names the verifiable founding facts (Shreveport / Taco Bell)", () => {
    render(<StoryTimeline />);
    expect(screen.getAllByText(/shreveport/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/taco bell/i).length).toBeGreaterThan(0);
  });

  it("references the 41 / 11 scale at the today milestone", () => {
    render(<StoryTimeline />);
    expect(screen.getAllByText(/41/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/11/).length).toBeGreaterThan(0);
  });
});
