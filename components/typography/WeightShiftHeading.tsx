"use client";

/**
 * WHAT: Headline element whose Fraunces weight axis tracks how far the
 *       element is into the viewport. Renders as <h2> by default.
 * WHY:  Fraunces ships as a variable font; the wght axis is animatable.
 *       Tying weight to scroll progress gives section headlines a sense
 *       of arrival — the words gain heft as they enter the page.
 *       Editorial / luxury restaurant sites use this for cinematic feel.
 * IF REMOVED: section headlines render at a single static weight (still
 *       legible, just less considered).
 * COMMON MISTAKE: doing this with a scroll listener and setState every
 *       scroll event — that runs ~60 times/sec and stutters. The right
 *       primitive is IntersectionObserver with stepped thresholds.
 */
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface Props {
  as?: ElementType;
  className?: string;
  id?: string;
  children: ReactNode;
  minWeight?: number;
  maxWeight?: number;
}

export default function WeightShiftHeading({
  as: Tag = "h2",
  className,
  id,
  children,
  minWeight = 400,
  maxWeight = 900,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  // Lazy initializer runs once at mount. SSR gets minWeight; the client
  // can decide post-hydration whether to skip the observer entirely
  // (reduced-motion → maxWeight, no IO available → maxWeight).
  const [weight, setWeight] = useState<number>(() => {
    if (typeof window === "undefined") return minWeight;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return maxWeight;
    }
    if (typeof IntersectionObserver === "undefined") return maxWeight;
    return minWeight;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reduced-motion users: lazy initializer already pinned weight to
    // maxWeight; skip the observer entirely. No motion, no payload.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const ratio = Math.max(0, Math.min(1, entry.intersectionRatio));
          setWeight(Math.round(minWeight + ratio * (maxWeight - minWeight)));
        }
      },
      // 11 thresholds (0, 0.1, 0.2 … 1.0) → callback fires at each step
      // as the element enters/leaves view. Smooth enough for the eye.
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [minWeight, maxWeight]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      style={{ fontVariationSettings: `"wght" ${weight}` }}
    >
      {children}
    </Tag>
  );
}
