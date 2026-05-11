"use client";

/**
 * WHAT: Hook that returns [ref, revealed]. `revealed` is false until the
 *       referenced element first intersects the viewport, then flips
 *       true and stays true (the observer disconnects on first hit).
 * WHY:  Two components on the site use the exact same pattern — a stat
 *       grid that should slide up when scrolled into view (NumbersBand
 *       on the homepage, FranchiseStatGrid on /franchise). Extracting
 *       the lazy-init + IntersectionObserver dance into a hook keeps
 *       both consumers tiny and ensures they share the SSR / no-IO /
 *       reduced-motion fallbacks (all three start `revealed=true` so
 *       content is visible immediately and never gets stuck hidden).
 * IF REMOVED: each consumer would need to inline the same ~25 lines.
 * COMMON MISTAKE 1: setting revealed via useEffect on mount rather than
 *       through the lazy initializer. The React 19 lint rule
 *       `react-hooks/set-state-in-effect` flags that.
 * COMMON MISTAKE 2: forgetting `suppressHydrationWarning` on the element
 *       whose className depends on `revealed`. SSR returns `true` (so
 *       crawlers / no-JS users see content) while the client's first
 *       paint returns `false` (so the reveal animation plays). React 19
 *       treats that intentional diff as a hydration warning AND falls
 *       back to a client-only re-render unless suppressHydrationWarning
 *       is set on the diverging element. See NumbersBand and
 *       FranchiseStatGrid for the canonical usage.
 */
import { useEffect, useRef, useState } from "react";

export function useRevealOnView<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
    if (typeof IntersectionObserver === "undefined") return true;
    return false;
  });

  useEffect(() => {
    if (revealed) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio > 0) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return [ref, revealed];
}
