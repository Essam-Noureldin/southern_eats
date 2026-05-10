"use client";

/**
 * WHAT: Anchor wrapper that intercepts left-clicks and routes through
 *       `document.startViewTransition()` so the browser captures
 *       before/after snapshots and morphs elements with matching
 *       `view-transition-name` between pages.
 * WHY:  React 19.2 doesn't export <ViewTransition> at runtime (canary
 *       only). The browser's native View Transitions API is the stable
 *       fallback — same effect, driven from the DOM side. Modifier-
 *       clicks and middle-clicks fall through to the normal Link
 *       behaviour. Browsers without API support also fall through.
 * IF REMOVED: clicking a dish thumbnail still navigates correctly
 *       (next/link does that on its own) — the morph just doesn't fire.
 * COMMON MISTAKE: calling startViewTransition with a synchronous
 *       callback that just calls router.push(). router.push is async,
 *       so the transition's "new" snapshot would be captured BEFORE
 *       React renders the destination page — you'd see a hard cut
 *       between two identical old-page snapshots. The fix: return a
 *       Promise from the callback that only resolves once the new
 *       pathname commits, watched via usePathname.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export default function DishLink({
  href,
  children,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const pendingResolve = useRef<(() => void) | null>(null);

  // Resolve any in-flight view transition once the new pathname commits.
  // The View Transitions API holds the morph open until this fires.
  useEffect(() => {
    if (pendingResolve.current) {
      pendingResolve.current();
      pendingResolve.current = null;
    }
  }, [pathname]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>): void {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;
    if (typeof document === "undefined") return;
    if (typeof document.startViewTransition !== "function") return;
    if (pathname === href) return;

    e.preventDefault();
    document.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        pendingResolve.current = resolve;
        router.push(href);
        // Hard cap so the morph never hangs if the navigation stalls
        // (offline, errored route, etc.). 1s is well past the typical
        // local-route render of 30-150ms.
        setTimeout(() => {
          if (pendingResolve.current === resolve) {
            pendingResolve.current = null;
            resolve();
          }
        }, 1000);
      });
    });
  }

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
