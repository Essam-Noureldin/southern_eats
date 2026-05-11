"use client";

/**
 * WHAT: Generic reveal-on-view wrapper. Renders a div around its
 *       children that starts at opacity 0 + translateY(20px) and
 *       animates up + in once the wrapper first enters the viewport.
 * WHY:  /our-story uses several elements (images, timeline nodes) that
 *       benefit from a soft fade-up as they scroll into view rather
 *       than appearing statically. Wrapping them in <Revealable> keeps
 *       the page itself a server component — only the wrapper is
 *       client-side, so the rest of the page stays fast and SSR-rendered.
 *       SSR / no-IO / reduced-motion all start revealed=true so content
 *       is never stuck hidden.
 * IF REMOVED: anything wrapped in <Revealable> would lose its scroll-
 *       triggered fade-up.
 * COMMON MISTAKE: setting state inside useEffect on mount — the React
 *       19 lint rule react-hooks/set-state-in-effect flags it. The
 *       lazy initializer makes the first paint correct without a
 *       second render.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export default function Revealable({
  children,
  className,
  delayMs = 0,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
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

  return (
    // suppressHydrationWarning is the right escape hatch here: by design,
    // the server renders `is-revealed` (so crawlers and no-JS users see
    // content) while the client's first paint renders without it (so the
    // animation can play). React 19 calls this out as a legitimate use
    // case for the flag — same shape as a date/time display that's known
    // to differ between server and client. Without it, React logs a
    // hydration warning AND falls back to a client-only re-render that
    // discards the server HTML.
    <div
      ref={ref}
      data-testid="revealable"
      suppressHydrationWarning
      style={{ animationDelay: `${delayMs}ms` }}
      className={`reveal-on-view${revealed ? " is-revealed" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
}
