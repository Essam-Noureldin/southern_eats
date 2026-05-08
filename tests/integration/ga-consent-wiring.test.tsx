/**
 * WHAT: Integration test for the GA + CookieConsent wiring.
 *       Renders the two components together (the way RootLayout does)
 *       and proves that the contract between them holds end-to-end:
 *       click Accept -> GA loads. Click Decline -> GA does NOT load.
 * WHY:  Each component is unit-tested in isolation. This test is the
 *       only thing that would catch a drift in the *contract* between
 *       them — e.g. if someone renamed the cookie-consent-accepted
 *       event in one file and forgot the other.
 *
 * COMMON MISTAKE: re-asserting the unit-level details (button labels,
 * exact localStorage keys). This test should only assert the integrated
 * outcome: clicking Accept causes GA to load. Anything finer-grained
 * is duplicated coverage and a maintenance tax.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GAScript from "@/components/analytics/GAScript";
import CookieConsent from "@/components/consent/CookieConsent";

// Unique GA_ID per test so next/script's internal "already-loaded"
// registry doesn't deduplicate across tests. Without this, test N+1
// silently skips the script tag because it thinks it's already loaded.
let GA_ID = "G-PLACEHOLDER";
let gaCounter = 0;

beforeEach(() => {
  window.localStorage.clear();
  document.querySelectorAll("script").forEach((s) => s.remove());
  gaCounter += 1;
  GA_ID = `G-INTEGRATION-${gaCounter}`;
});

function renderConsentLayer(idOverride?: string) {
  const id = idOverride ?? GA_ID;
  return render(
    <>
      <GAScript gaId={id} />
      <CookieConsent />
    </>,
  );
}

function gaLoaderPresent(id: string = GA_ID): boolean {
  return Array.from(document.querySelectorAll("script")).some((s) =>
    s.src.includes(`googletagmanager.com/gtag/js?id=${id}`),
  );
}

describe("GA + CookieConsent wiring", () => {
  it("does NOT load GA on first visit (banner shown, no choice yet)", () => {
    renderConsentLayer();
    expect(screen.getByRole("region", { name: /cookie/i })).toBeInTheDocument();
    expect(gaLoaderPresent()).toBe(false);
  });

  it("loads GA after the user clicks Accept", async () => {
    const user = userEvent.setup();
    renderConsentLayer();
    expect(gaLoaderPresent()).toBe(false);
    await user.click(screen.getByRole("button", { name: /accept/i }));
    expect(gaLoaderPresent()).toBe(true);
  });

  it("does NOT load GA after the user clicks Decline", async () => {
    const user = userEvent.setup();
    renderConsentLayer();
    await user.click(screen.getByRole("button", { name: /decline/i }));
    expect(gaLoaderPresent()).toBe(false);
  });

  it("loads GA immediately on a return visit when consent was previously accepted", async () => {
    window.localStorage.setItem("cookie_consent", "accepted");
    renderConsentLayer();
    // Banner should not show (returning visit), GA should load.
    expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
    // next/script inserts asynchronously; wait for the loader.
    await waitFor(() => expect(gaLoaderPresent()).toBe(true));
  });

  it("does NOT load GA on a return visit when consent was previously declined", () => {
    window.localStorage.setItem("cookie_consent", "declined");
    renderConsentLayer();
    expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
    expect(gaLoaderPresent()).toBe(false);
  });

  it("does NOT load GA when gaId is empty even after Accept (speculative-deploy scenario)", async () => {
    const user = userEvent.setup();
    renderConsentLayer("");
    await user.click(screen.getByRole("button", { name: /accept/i }));
    // Loader should never have rendered because gaId is empty
    expect(
      Array.from(document.querySelectorAll("script")).some((s) =>
        s.src.includes("googletagmanager.com/gtag/js"),
      ),
    ).toBe(false);
  });
});
