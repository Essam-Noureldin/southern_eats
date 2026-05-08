/**
 * WHAT: Smoke tests for the three legal pages (Privacy, Terms, Cookies).
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - each page renders without crashing
 *       - each page has the right h1
 *       - each page contains the structural section headings a regulator
 *         expects (data collected, rights, contact, etc.). If a future
 *         edit accidentally gutted a section, this catches it.
 *
 * COMMON MISTAKE: testing the *exact wording* of legal pages. The
 * solicitor will rewrite that. Test the structure, not the prose.
 */
import { render, screen } from "@testing-library/react";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import CookiesPage from "@/app/cookies/page";

describe("Privacy Policy page", () => {
  it("renders an h1 with 'Privacy Policy'", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /privacy policy/i }),
    ).toBeInTheDocument();
  });

  it("contains the structural sections a regulator expects", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /information we collect/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /how we use/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /your rights/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /contact/i })).toBeInTheDocument();
  });
});

describe("Terms & Conditions page", () => {
  it("renders an h1 with 'Terms'", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /terms/i }),
    ).toBeInTheDocument();
  });

  it("contains the structural sections", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { name: /use of (the )?site/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /(intellectual property|content)/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /(liability|disclaimers)/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /governing law/i })).toBeInTheDocument();
  });
});

describe("Cookie Policy page", () => {
  it("renders an h1 with 'Cookie Policy'", () => {
    render(<CookiesPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /cookie policy/i }),
    ).toBeInTheDocument();
  });

  it("contains the structural sections", () => {
    render(<CookiesPage />);
    expect(screen.getByRole("heading", { name: /what (are )?cookies/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /how we use cookies/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /(your choices|managing cookies)/i })).toBeInTheDocument();
  });

  it("explicitly mentions Google Analytics", () => {
    render(<CookiesPage />);
    expect(screen.getByText(/google analytics/i)).toBeInTheDocument();
  });
});

describe("All legal pages — placeholder warning", () => {
  it("each page surfaces a 'solicitor review required' note for the developer", () => {
    // Implemented as a visible note (not a hidden comment) so anyone
    // who deploys without the solicitor pass sees it on the live page.
    const { unmount: u1 } = render(<PrivacyPage />);
    expect(screen.getByText(/solicitor/i)).toBeInTheDocument();
    u1();
    const { unmount: u2 } = render(<TermsPage />);
    expect(screen.getByText(/solicitor/i)).toBeInTheDocument();
    u2();
    render(<CookiesPage />);
    expect(screen.getByText(/solicitor/i)).toBeInTheDocument();
  });
});
