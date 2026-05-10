"use client";

/**
 * WHAT: The four-tile stats band on /franchise — $25k fee / 6% royalty
 *       / 50k territory / 2008 founded. Tiles slide up with a stagger
 *       when the band first enters the viewport.
 * WHY:  Static numbers read as a spec sheet. A short rise-and-fade as
 *       the band enters view lands the impact at the moment the user
 *       sees them, which is when the pitch is supposed to register. The
 *       pattern is the same one WeightShiftHeading uses — a useState
 *       lazy initializer pins reduced-motion / SSR / no-IO environments
 *       to "revealed" so content is visible immediately, and a normal
 *       client-side IntersectionObserver flips the flag once on first
 *       intersection.
 * IF REMOVED: page works the same; tiles are just static.
 * COMMON MISTAKE: setting state inside useEffect on mount (the React 19
 *       eslint rule react-hooks/set-state-in-effect now flags this).
 *       The lazy initializer makes the first paint correct without a
 *       second render.
 */
import { useEffect, useRef, useState } from "react";

const TERMS = [
  { value: "$25k", label: "Franchise fee" },
  { value: "6%", label: "Royalty" },
  { value: "50k", label: "Population territory" },
  { value: "2008", label: "Founded" },
] as const;

const STAGGER_MS = 90;

export default function FranchiseStatGrid() {
  const ref = useRef<HTMLDListElement | null>(null);
  const [revealed, setRevealed] = useState<boolean>(() => {
    // Default true for environments where we can't observe intersection
    // (SSR / no IntersectionObserver) or where the user has asked the OS
    // to reduce motion. In all of those cases, the static-final state is
    // the right thing to render so the content is visible.
    if (typeof window === "undefined") return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
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

  return (
    <dl
      ref={ref}
      className={`mt-10 grid grid-cols-2 gap-8 border-t border-cream/20 pt-10 md:grid-cols-4 md:gap-6${
        revealed ? " is-revealed" : ""
      }`}
    >
      {TERMS.map((t, i) => (
        <div
          key={t.label}
          className="stat-tile"
          style={{ animationDelay: `${i * STAGGER_MS}ms` }}
        >
          <dt className="text-xs uppercase tracking-widest opacity-70">
            {t.label}
          </dt>
          <dd className="mt-1 font-display text-5xl md:text-7xl">{t.value}</dd>
        </div>
      ))}
    </dl>
  );
}
