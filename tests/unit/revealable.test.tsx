/**
 * WHAT: Tests the Revealable wrapper component.
 * WHY:  Generic reveal-on-view primitive used across /our-story for
 *       images and timeline nodes. Test-first locks the contract:
 *       wraps children in a div with data-revealable, the div carries
 *       the reveal-on-view class, gains is-revealed once the
 *       IntersectionObserver fires, accepts an optional delay applied
 *       as inline animationDelay, and falls back to revealed under
 *       reduced-motion / no-IO so content is always visible.
 * IF REMOVED: a regression in the IO setup or the reduce-motion
 *       fallback would silently leave content stuck at opacity 0.
 */
import { render, screen, act } from "@testing-library/react";
import Revealable from "@/components/Revealable";

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

describe("Revealable", () => {
  beforeEach(() => {
    lastCallback = null;
    lastObserved = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = CapturingIO;
  });

  it("renders children", () => {
    setReducedMotion(false);
    render(
      <Revealable>
        <p>Hello</p>
      </Revealable>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("starts without is-revealed and gains it on intersection", () => {
    setReducedMotion(false);
    render(
      <Revealable>
        <p>x</p>
      </Revealable>,
    );
    const wrapper = screen.getByTestId("revealable");
    expect(wrapper.className).toMatch(/reveal-on-view/);
    expect(wrapper.className).not.toMatch(/is-revealed/);
    expect(lastCallback).not.toBeNull();
    act(() => {
      lastCallback!([{ intersectionRatio: 0.4, target: lastObserved! }]);
    });
    expect(wrapper.className).toMatch(/is-revealed/);
  });

  it("starts revealed under reduced-motion (no observer wiring)", () => {
    setReducedMotion(true);
    render(
      <Revealable>
        <p>x</p>
      </Revealable>,
    );
    const wrapper = screen.getByTestId("revealable");
    expect(wrapper.className).toMatch(/is-revealed/);
    expect(lastObserved).toBeNull();
  });

  it("applies the optional delay as inline animationDelay", () => {
    setReducedMotion(false);
    render(
      <Revealable delayMs={200}>
        <p>x</p>
      </Revealable>,
    );
    const wrapper = screen.getByTestId("revealable");
    expect(wrapper.style.animationDelay).toBe("200ms");
  });

  it("forwards an additional className", () => {
    setReducedMotion(false);
    render(
      <Revealable className="rounded-2xl">
        <p>x</p>
      </Revealable>,
    );
    const wrapper = screen.getByTestId("revealable");
    expect(wrapper.className).toMatch(/rounded-2xl/);
  });
});
