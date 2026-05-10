"use client";

/**
 * WHAT: Anchor wrapper that intercepts left-clicks and routes through
 *       `document.startViewTransition()` so the browser captures
 *       before/after snapshots and morphs elements with matching
 *       `view-transition-name` between pages.
 * WHY:  React 19.2 doesn't export <ViewTransition> at runtime (canary
 *       only). The browser's native View Transitions API is the stable
 *       fallback — it works the same way the React component would,
 *       just driven from the DOM side. Modifier-clicks (open in new
 *       tab, etc.) and middle-clicks fall through to the normal Link
 *       behaviour. Browsers without API support also fall through —
 *       you get a standard navigation, no error, no broken UX.
 * IF REMOVED: clicking a dish thumbnail still navigates correctly
 *       (next/link does that on its own) — the morph just doesn't fire.
 * COMMON MISTAKE: calling preventDefault() unconditionally. Cmd/Ctrl/
 *       Shift-clicks must reach the browser so users can open in new
 *       tab; only intercept the plain primary-button click.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  function handleClick(e: MouseEvent<HTMLAnchorElement>): void {
    // Let the browser handle modifier-clicks (new tab, new window, etc.).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;
    if (typeof document === "undefined") return;
    if (typeof document.startViewTransition !== "function") return;

    e.preventDefault();
    document.startViewTransition(() => {
      router.push(href);
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
