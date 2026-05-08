"use client";

/**
 * WHAT: Cookie consent banner. First-visit popup with Accept/Decline.
 *       Writes the choice to localStorage and broadcasts events that
 *       GAScript (and any other consent-sensitive component) listens to.
 * WHY:  GDPR/UK PECR/CCPA require opt-in for non-essential cookies.
 *       This is the legally-required gate before GA can load.
 * IF REMOVED: GA loads on first visit with no opt-in => compliance
 *       violation in UK/EU.
 * COMMON MISTAKE: pre-selecting "Accept", styling Decline smaller, or
 *       making Decline harder to find. All three count as dark patterns
 *       under GDPR — buttons must be visually equal and equally easy.
 *
 * SSR-safe via useSyncExternalStore — no hydration mismatch under
 * React 19's stricter rules. getServerSnapshot returns null (unknown
 * state) so the banner renders nothing on the server. Client snapshot
 * reads localStorage and re-renders on `storage` (cross-tab) events.
 */
import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie_consent";
type Consent = "accepted" | "declined" | null;

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  // Same-tab updates do not fire `storage`, so we also listen to our
  // own internal change event (dispatched by Accept/Decline below).
  window.addEventListener("cookie-consent-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie-consent-changed", callback);
  };
}

function getSnapshot(): Consent {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "declined" ? v : null;
}

function getServerSnapshot(): Consent {
  return null;
}

export default function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // SSR (consent === null because getServerSnapshot) AND
  // client-with-no-stored-choice (also null) both render the banner.
  // We need to distinguish "unknown on server" from "unknown on client".
  // Solution: only render the banner once we have a definitive client
  // answer. We get that via a second snapshot that returns a sentinel
  // for "client mounted, no choice yet."
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  if (!isClient) return null; // SSR / pre-hydrate — render nothing
  if (consent !== null) return null; // returning visitor / choice already made

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    window.dispatchEvent(new Event("cookie-consent-accepted"));
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  const decline = () => {
    window.localStorage.setItem(STORAGE_KEY, "declined");
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  return (
    <section
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-charcoal/10 bg-cream px-6 py-5 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-charcoal sm:max-w-2xl">
          We use a small number of cookies to understand how visitors use this
          site. You can accept or decline analytics cookies. Read our{" "}
          <Link href="/cookies" className="underline hover:text-sams-red">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={decline}
            className="rounded border border-charcoal/30 px-4 py-2 text-sm font-medium text-charcoal hover:bg-charcoal/5"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded bg-sams-red px-4 py-2 text-sm font-medium text-cream hover:bg-sams-red/90"
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}

// Subscribe-noop for the client-mounted sentinel. We just need ANY
// useSyncExternalStore that returns false on server, true on client —
// no real subscription needed because the value never changes after mount.
function subscribeNoop(): () => void {
  return () => undefined;
}
