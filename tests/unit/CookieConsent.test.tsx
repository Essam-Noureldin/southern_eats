/**
 * WHAT: Unit tests for components/consent/CookieConsent.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - first visit: banner shown; clicking Accept/Decline hides it,
 *         writes localStorage, dispatches the right events
 *       - returning visit (localStorage already set): banner not shown
 *       - cookie-consent-accepted ONLY fires on Accept (it gates GA)
 *       - cookie-consent-changed fires on either Accept or Decline
 *       - banner is accessible: buttons named, link to /cookies present
 *
 * COMMON MISTAKE: testing the visual styles. The banner's *behaviour*
 * is the legal compliance — colours and animation are cosmetic.
 */
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CookieConsent from "@/components/consent/CookieConsent";

beforeEach(() => {
  window.localStorage.clear();
});

describe("CookieConsent — first visit", () => {
  it("renders the banner when no consent is stored", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("region", { name: /cookie/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /decline/i })).toBeInTheDocument();
  });

  it("includes a link to the Cookie Policy", () => {
    render(<CookieConsent />);
    const link = screen.getByRole("link", { name: /cookie policy/i });
    expect(link).toHaveAttribute("href", "/cookies");
  });
});

describe("CookieConsent — returning visit", () => {
  it("does NOT render the banner when consent is 'accepted'", () => {
    window.localStorage.setItem("cookie_consent", "accepted");
    render(<CookieConsent />);
    expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
  });

  it("does NOT render the banner when consent is 'declined'", () => {
    window.localStorage.setItem("cookie_consent", "declined");
    render(<CookieConsent />);
    expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
  });
});

describe("CookieConsent — Accept flow", () => {
  it("writes 'accepted' to localStorage on click", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByRole("button", { name: /accept/i }));
    expect(window.localStorage.getItem("cookie_consent")).toBe("accepted");
  });

  it("dispatches BOTH cookie-consent-accepted AND cookie-consent-changed", async () => {
    const user = userEvent.setup();
    const onAccepted = jest.fn();
    const onChanged = jest.fn();
    window.addEventListener("cookie-consent-accepted", onAccepted);
    window.addEventListener("cookie-consent-changed", onChanged);
    render(<CookieConsent />);
    await user.click(screen.getByRole("button", { name: /accept/i }));
    expect(onAccepted).toHaveBeenCalledTimes(1);
    expect(onChanged).toHaveBeenCalledTimes(1);
    window.removeEventListener("cookie-consent-accepted", onAccepted);
    window.removeEventListener("cookie-consent-changed", onChanged);
  });

  it("hides the banner after Accept", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByRole("button", { name: /accept/i }));
    expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
  });
});

describe("CookieConsent — Decline flow", () => {
  it("writes 'declined' to localStorage on click", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByRole("button", { name: /decline/i }));
    expect(window.localStorage.getItem("cookie_consent")).toBe("declined");
  });

  it("dispatches cookie-consent-changed but NOT cookie-consent-accepted", async () => {
    const user = userEvent.setup();
    const onAccepted = jest.fn();
    const onChanged = jest.fn();
    window.addEventListener("cookie-consent-accepted", onAccepted);
    window.addEventListener("cookie-consent-changed", onChanged);
    render(<CookieConsent />);
    await user.click(screen.getByRole("button", { name: /decline/i }));
    expect(onAccepted).not.toHaveBeenCalled();
    expect(onChanged).toHaveBeenCalledTimes(1);
    window.removeEventListener("cookie-consent-accepted", onAccepted);
    window.removeEventListener("cookie-consent-changed", onChanged);
  });

  it("hides the banner after Decline", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    await user.click(screen.getByRole("button", { name: /decline/i }));
    expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
  });
});

describe("CookieConsent — cross-tab sync via storage event", () => {
  it("hides the banner if another tab writes 'accepted' to localStorage", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("region", { name: /cookie/i })).toBeInTheDocument();

    act(() => {
      window.localStorage.setItem("cookie_consent", "accepted");
      window.dispatchEvent(new Event("storage"));
    });

    expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
  });
});
