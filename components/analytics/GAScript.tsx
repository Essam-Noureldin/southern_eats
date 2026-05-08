"use client";

/**
 * WHAT: Loads Google Analytics 4 (gtag.js) — but only after the user
 *       has accepted cookies via the cookie-consent banner.
 * WHY:  GDPR/ePrivacy require non-essential cookies (analytics) be
 *       gated on opt-in consent. Loading GA without consent is a
 *       compliance violation in the UK/EU.
 * IF REMOVED: site has no analytics; client cannot measure traffic.
 * COMMON MISTAKE: reading process.env.NEXT_PUBLIC_GA_ID inside this
 *       client component. The server-side RootLayout reads env and
 *       passes gaId as a prop — single source of truth, no double
 *       reads, easy to disable for the speculative deploy by leaving
 *       the env var empty.
 *
 * SSR-safe: useSyncExternalStore handles the SSR/hydration split
 * properly — no setState-in-effect, no flash of mismatched state.
 * Listens to both `storage` (other-tab changes) and the custom
 * `cookie-consent-accepted` event (same-tab consent flow).
 */
import { useSyncExternalStore } from "react";
import Script from "next/script";

type Props = {
  gaId: string | undefined;
};

const STORAGE_KEY = "cookie_consent";
const ACCEPTED = "accepted";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener("cookie-consent-accepted", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie-consent-accepted", callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === ACCEPTED;
}

function getServerSnapshot(): boolean {
  // Server render: no localStorage, no consent assumed.
  return false;
}

export default function GAScript({ gaId }: Props) {
  const hasConsent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!gaId || !hasConsent) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
