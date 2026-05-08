/**
 * WHAT: Unit tests for components/analytics/GAScript.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - renders nothing when gaId is missing/empty (dormant flow for
 *         speculative deploys)
 *       - renders nothing pre-consent
 *       - renders Google's gtag scripts after `cookie-consent-accepted`
 *       - respects existing localStorage consent on mount (returning user)
 *       - never loads when consent is declined
 *
 * COMMON MISTAKE: testing GA by stubbing window.gtag and asserting calls.
 * That's brittle — Google can change the call shape. Test that the
 * <Script> tags are rendered with the correct src and inline config.
 */
import { act, render, screen } from "@testing-library/react";
import GAScript from "@/components/analytics/GAScript";

// next/script appends <script> tags directly to the document, not the
// render container. Scrub them between tests so assertions are not
// polluted by prior renders.
beforeEach(() => {
  window.localStorage.clear();
  document.querySelectorAll("script").forEach((s) => s.remove());
});

describe("GAScript", () => {
  it("renders nothing when gaId is undefined", () => {
    const { container } = render(<GAScript gaId={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when gaId is an empty string", () => {
    const { container } = render(<GAScript gaId="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing pre-consent (no localStorage, no event yet)", () => {
    const { container } = render(<GAScript gaId="G-TESTID" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the gtag scripts when localStorage is set + accept event fires (matches CookieConsent flow)", () => {
    render(<GAScript gaId="G-TESTID" />);
    // CookieConsent writes localStorage then dispatches the event —
    // the event without the localStorage write would mean state was
    // never actually persisted. Mirror the real flow here.
    act(() => {
      window.localStorage.setItem("cookie_consent", "accepted");
      window.dispatchEvent(new Event("cookie-consent-accepted"));
    });
    const scripts = document.querySelectorAll("script");
    const srcLoader = Array.from(scripts).find((s) =>
      s.src.includes("googletagmanager.com/gtag/js"),
    );
    expect(srcLoader).toBeDefined();
    expect(srcLoader?.src).toContain("id=G-TESTID");

    const inlineConfig = Array.from(scripts).find(
      (s) => !s.src && s.textContent?.includes("gtag('config', 'G-TESTID'"),
    );
    expect(inlineConfig).toBeDefined();
  });

  it("does NOT load GA when only the event fires without localStorage being set (defence: state must persist)", () => {
    render(<GAScript gaId="G-EVENT-ONLY" />);
    act(() => {
      window.dispatchEvent(new Event("cookie-consent-accepted"));
    });
    const srcLoader = Array.from(document.querySelectorAll("script")).find(
      (s) => s.src.includes("googletagmanager.com/gtag/js"),
    );
    expect(srcLoader).toBeUndefined();
  });

  it("loads GA immediately when consent is already in localStorage on mount", () => {
    window.localStorage.setItem("cookie_consent", "accepted");
    render(<GAScript gaId="G-RETURNINGUSER" />);
    const scripts = document.querySelectorAll("script");
    const srcLoader = Array.from(scripts).find((s) =>
      s.src.includes("id=G-RETURNINGUSER"),
    );
    expect(srcLoader).toBeDefined();
  });

  it("does NOT load GA when consent is 'declined' in localStorage", () => {
    window.localStorage.setItem("cookie_consent", "declined");
    const { container } = render(<GAScript gaId="G-DECLINED" />);
    const scripts = container.querySelectorAll("script");
    expect(scripts.length).toBe(0);
  });

  it("ignores cookie-consent-accepted events that fire when gaId is empty", () => {
    render(<GAScript gaId="" />);
    act(() => {
      window.dispatchEvent(new Event("cookie-consent-accepted"));
    });
    const srcLoader = Array.from(document.querySelectorAll("script")).find(
      (s) => s.src.includes("googletagmanager.com/gtag/js"),
    );
    expect(srcLoader).toBeUndefined();
  });
});

// Use it once to silence "unused import" if Screen isn't referenced above.
void screen;
