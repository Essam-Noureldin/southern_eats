import "@testing-library/jest-dom";

/**
 * WHAT: Test-environment polyfills + browser API mocks.
 * WHY:  jsdom doesn't ship matchMedia, IntersectionObserver, or
 *       ResizeObserver. Without mocks any component using them blows up.
 * IF REMOVED: render() throws "matchMedia is not a function" on any
 *       component or layout that respects prefers-reduced-motion.
 * COMMON MISTAKE: applying these mocks unconditionally — node-env tests
 *       (HTTP integration tests using `@jest-environment node`) crash
 *       at suite load with "window is not defined". The typeof window
 *       guard below fixes that.
 */
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      // Returns matches:true for prefers-reduced-motion so Framer Motion
      // variants stay inert in tests — keeps axe from flagging invisible
      // mid-animation text as a contrast failure.
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

  class IntersectionObserverMock {
    root = null;
    rootMargin = "";
    thresholds: ReadonlyArray<number> = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = IntersectionObserverMock;

  class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ResizeObserver = ResizeObserverMock;
}
