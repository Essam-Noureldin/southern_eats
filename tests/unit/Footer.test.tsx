/**
 * WHAT: Unit tests for components/layout/Footer.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - contentinfo landmark (a11y)
 *       - copyright line carrying the current year
 *       - links to the three legal pages (Privacy / Terms / Cookies)
 *       - primary nav links repeated in the footer (Menu / Locations /
 *         Our Story / Franchise / Order Online)
 *       - address/origin summary that names Shreveport
 */
import { render, screen } from "@testing-library/react";
import Footer from "@/components/layout/Footer";

describe("Footer — structure", () => {
  it("renders a contentinfo landmark", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the brand wordmark", () => {
    render(<Footer />);
    // "Sam's" appears in both the wordmark and the copyright line
    expect(screen.getAllByText(/sam'?s/i).length).toBeGreaterThan(0);
  });

  it("renders an address/origin summary mentioning Shreveport", () => {
    render(<Footer />);
    // "Shreveport" appears in the brand tagline and the bottom strip
    expect(screen.getAllByText(/shreveport/i).length).toBeGreaterThan(0);
  });
});

describe("Footer — navigation links", () => {
  it("links to the four primary nav destinations", () => {
    render(<Footer />);
    const menu = screen.getByRole("link", { name: /^menu$/i });
    const locations = screen.getByRole("link", { name: /^locations$/i });
    const story = screen.getByRole("link", { name: /our story/i });
    const franchise = screen.getByRole("link", { name: /^franchise$/i });
    expect(menu).toHaveAttribute("href", "/menu");
    expect(locations).toHaveAttribute("href", "/locations");
    expect(story).toHaveAttribute("href", "/our-story");
    expect(franchise).toHaveAttribute("href", "/franchise");
  });

  it("links to Order Online", () => {
    render(<Footer />);
    const cta = screen.getByRole("link", { name: /order online/i });
    expect(cta).toHaveAttribute("href", "/order");
  });
});

describe("Footer — legal links", () => {
  it("links to Privacy, Terms, and Cookies pages", () => {
    render(<Footer />);
    const privacy = screen.getByRole("link", { name: /privacy/i });
    const terms = screen.getByRole("link", { name: /terms/i });
    const cookies = screen.getByRole("link", { name: /cookies/i });
    expect(privacy).toHaveAttribute("href", "/privacy");
    expect(terms).toHaveAttribute("href", "/terms");
    expect(cookies).toHaveAttribute("href", "/cookies");
  });
});

describe("Footer — copyright", () => {
  it("renders a copyright line with the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    // RegExp escape on © isn't needed — it's literal
    expect(screen.getByText(new RegExp(`©.*${year}`))).toBeInTheDocument();
  });
});
