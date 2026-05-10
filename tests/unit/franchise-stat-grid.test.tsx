/**
 * WHAT: Tests the franchise-page stats grid reveal-on-view component.
 * WHY:  The four big numbers ($25k / 6% / 50k / 2008) slide up with a
 *       stagger when the band first enters the viewport. Test-first
 *       locks the contract: the tiles render with the right values,
 *       the dl starts without the is-revealed class, the class flips
 *       on once IntersectionObserver fires, reduced-motion bypasses the
 *       observer (state starts revealed so content is visible
 *       immediately), and the stagger is applied via inline
 *       animationDelay on each tile.
 * IF REMOVED: a refactor could silently break the reveal trigger or
 *       drop the stagger and the visual would degrade with no failing
 *       test to catch it.
 */
import { render, screen, act } from "@testing-library/react";
import FranchiseStatGrid from "@/components/sections/FranchiseStatGrid";

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
  // Default jest.setup.ts mock reports prefers-reduced-motion as
  // matching. Override per-test so the IntersectionObserver path runs.
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

describe("FranchiseStatGrid", () => {
  beforeEach(() => {
    lastCallback = null;
    lastObserved = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = CapturingIO;
  });

  it("renders all four stat tiles with their values and labels", () => {
    setReducedMotion(false);
    render(<FranchiseStatGrid />);
    expect(screen.getByText("$25k")).toBeInTheDocument();
    expect(screen.getByText("6%")).toBeInTheDocument();
    expect(screen.getByText("50k")).toBeInTheDocument();
    expect(screen.getByText("2008")).toBeInTheDocument();
    expect(screen.getByText(/franchise fee/i)).toBeInTheDocument();
    expect(screen.getByText(/royalty/i)).toBeInTheDocument();
    expect(screen.getByText(/population territory/i)).toBeInTheDocument();
    expect(screen.getByText(/founded/i)).toBeInTheDocument();
  });

  it("starts without the is-revealed class until the observer fires", () => {
    setReducedMotion(false);
    const { container } = render(<FranchiseStatGrid />);
    const dl = container.querySelector("dl");
    expect(dl).not.toBeNull();
    expect(dl!.className).not.toMatch(/is-revealed/);
  });

  it("adds is-revealed once the band intersects", () => {
    setReducedMotion(false);
    const { container } = render(<FranchiseStatGrid />);
    expect(lastCallback).not.toBeNull();
    expect(lastObserved).not.toBeNull();
    act(() => {
      lastCallback!([{ intersectionRatio: 0.4, target: lastObserved! }]);
    });
    const dl = container.querySelector("dl");
    expect(dl!.className).toMatch(/is-revealed/);
  });

  it("starts revealed under reduced-motion and skips the observer entirely", () => {
    setReducedMotion(true);
    const { container } = render(<FranchiseStatGrid />);
    const dl = container.querySelector("dl");
    expect(dl!.className).toMatch(/is-revealed/);
    expect(lastObserved).toBeNull();
  });

  it("applies a staggered animationDelay across the four tiles", () => {
    setReducedMotion(false);
    const { container } = render(<FranchiseStatGrid />);
    const tiles = container.querySelectorAll(".stat-tile");
    expect(tiles).toHaveLength(4);
    expect((tiles[0] as HTMLElement).style.animationDelay).toBe("0ms");
    expect((tiles[1] as HTMLElement).style.animationDelay).toBe("90ms");
    expect((tiles[2] as HTMLElement).style.animationDelay).toBe("180ms");
    expect((tiles[3] as HTMLElement).style.animationDelay).toBe("270ms");
  });
});
