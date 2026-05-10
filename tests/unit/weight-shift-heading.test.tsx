/**
 * WHAT: Tests the WeightShiftHeading client component.
 * WHY:  This is a polish component that ties the headline weight to
 *       the user's scroll progress. Test-first locks the contract:
 *       the component sets `font-variation-settings: "wght" N` inline
 *       on the rendered element, where N is interpolated from the
 *       intersection ratio between minWeight and maxWeight.
 * IF REMOVED: a future tweak to the IntersectionObserver setup or the
 *       weight math could silently break the visual effect with no
 *       failing test to catch it.
 */
import { render, screen, act } from "@testing-library/react";
import WeightShiftHeading from "@/components/typography/WeightShiftHeading";

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
  // The default jest.setup.ts mock reports prefers-reduced-motion as
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

describe("WeightShiftHeading", () => {
  beforeEach(() => {
    lastCallback = null;
    lastObserved = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = CapturingIO;
  });

  it("renders the children inside the requested element (default h2)", () => {
    setReducedMotion(false);
    render(
      <WeightShiftHeading id="t1">It started with a fryer.</WeightShiftHeading>,
    );
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /it started with a fryer/i,
    });
    expect(heading).toBeInTheDocument();
    expect(heading.id).toBe("t1");
  });

  it("respects the `as` prop to render a different heading level", () => {
    setReducedMotion(false);
    render(
      <WeightShiftHeading as="h1">Hello there</WeightShiftHeading>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: /hello there/i }),
    ).toBeInTheDocument();
  });

  it("starts at minWeight before any intersection callback fires", () => {
    setReducedMotion(false);
    render(
      <WeightShiftHeading minWeight={400} maxWeight={900}>
        Pull quote
      </WeightShiftHeading>,
    );
    const heading = screen.getByRole("heading");
    expect(heading.style.fontVariationSettings).toBe('"wght" 400');
  });

  it("interpolates weight to maxWeight when fully in view", () => {
    setReducedMotion(false);
    render(
      <WeightShiftHeading minWeight={400} maxWeight={900}>
        Pull quote
      </WeightShiftHeading>,
    );
    expect(lastObserved).not.toBeNull();
    expect(lastCallback).not.toBeNull();
    act(() => {
      lastCallback!([{ intersectionRatio: 1, target: lastObserved! }]);
    });
    const heading = screen.getByRole("heading");
    expect(heading.style.fontVariationSettings).toBe('"wght" 900');
  });

  it("interpolates weight midway when half in view", () => {
    setReducedMotion(false);
    render(
      <WeightShiftHeading minWeight={400} maxWeight={900}>
        Pull quote
      </WeightShiftHeading>,
    );
    act(() => {
      lastCallback!([{ intersectionRatio: 0.5, target: lastObserved! }]);
    });
    const heading = screen.getByRole("heading");
    // 400 + 0.5 * 500 = 650
    expect(heading.style.fontVariationSettings).toBe('"wght" 650');
  });

  it("clamps weight to maxWeight under reduced-motion (no observer needed)", () => {
    setReducedMotion(true);
    render(
      <WeightShiftHeading minWeight={400} maxWeight={900}>
        Pull quote
      </WeightShiftHeading>,
    );
    const heading = screen.getByRole("heading");
    expect(heading.style.fontVariationSettings).toBe('"wght" 900');
    // No observer should have been wired up because the early-return
    // path renders a static heading.
    expect(lastObserved).toBeNull();
  });
});
