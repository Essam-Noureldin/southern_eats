/**
 * WHAT: Unit tests for components/sections/NumbersBand.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - section heading carrying the "41 locations. 11 states" promise
 *       - four stat tiles (number + label) for Locations / Franchise fee /
 *         Royalty / Population territory
 *       - tiles slide up with a stagger when the band first enters view
 *         (same pattern as /franchise stat grid)
 */
import { render, screen, act } from "@testing-library/react";
import NumbersBand from "@/components/sections/NumbersBand";

type IOEntry = { intersectionRatio: number; target: Element };
type IOCallback = (entries: IOEntry[]) => void;

let lastCallback: IOCallback | null = null;
let lastObserved: Element | null = null;

class CapturingIO {
  constructor(cb: IOCallback) {
    lastCallback = cb;
  }
  observe(el: Element) {
    lastObserved = el;
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = "";
  thresholds: number[] = [];
}

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe("NumbersBand", () => {
  beforeEach(() => {
    lastCallback = null;
    lastObserved = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = CapturingIO;
  });

  it("renders the pull-quote naming 41 locations and 11 states", () => {
    render(<NumbersBand />);
    expect(
      screen.getByText(/41 locations\.?\s*11 states/i),
    ).toBeInTheDocument();
  });

  it("renders the four stat numbers", () => {
    render(<NumbersBand />);
    expect(screen.getAllByText("41").length).toBeGreaterThan(0);
    expect(screen.getByText("$25k")).toBeInTheDocument();
    expect(screen.getByText("6%")).toBeInTheDocument();
    expect(screen.getByText("50k")).toBeInTheDocument();
  });

  it("renders the four stat labels", () => {
    render(<NumbersBand />);
    expect(screen.getByText(/^locations$/i)).toBeInTheDocument();
    expect(screen.getByText(/franchise fee/i)).toBeInTheDocument();
    expect(screen.getByText(/^royalty$/i)).toBeInTheDocument();
    expect(screen.getByText(/population territory/i)).toBeInTheDocument();
  });

  it("starts without is-revealed and flips on intersection", () => {
    setReducedMotion(false);
    const { container } = render(<NumbersBand />);
    const grid = container.querySelector('[data-testid="numbers-band-grid"]');
    expect(grid).not.toBeNull();
    expect(grid!.className).not.toMatch(/is-revealed/);
    act(() => {
      lastCallback!([{ intersectionRatio: 0.4, target: lastObserved! }]);
    });
    expect(grid!.className).toMatch(/is-revealed/);
  });

  it("starts revealed under reduced-motion (no observer)", () => {
    setReducedMotion(true);
    const { container } = render(<NumbersBand />);
    const grid = container.querySelector('[data-testid="numbers-band-grid"]');
    expect(grid!.className).toMatch(/is-revealed/);
    expect(lastObserved).toBeNull();
  });

  it("staggers animationDelay across the four tiles", () => {
    setReducedMotion(false);
    const { container } = render(<NumbersBand />);
    const tiles = container.querySelectorAll(".stat-tile");
    expect(tiles).toHaveLength(4);
    expect((tiles[0] as HTMLElement).style.animationDelay).toBe("0ms");
    expect((tiles[1] as HTMLElement).style.animationDelay).toBe("90ms");
    expect((tiles[2] as HTMLElement).style.animationDelay).toBe("180ms");
    expect((tiles[3] as HTMLElement).style.animationDelay).toBe("270ms");
  });
});
