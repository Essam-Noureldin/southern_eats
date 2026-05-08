/**
 * WHAT: Unit tests for components/sections/FranchiseTease.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - eyebrow "Franchise opportunities"
 *       - h2 "Bring Sam's to your town."
 *       - body copy naming $25k fee and 18-year operations playbook
 *       - "See the numbers" CTA pointing at /franchise
 */
import { render, screen } from "@testing-library/react";
import FranchiseTease from "@/components/sections/FranchiseTease";

describe("FranchiseTease", () => {
  it("renders the 'Franchise opportunities' eyebrow", () => {
    render(<FranchiseTease />);
    expect(screen.getByText(/franchise opportunities/i)).toBeInTheDocument();
  });

  it("renders an h2 reading 'Bring Sam's to your town.'", () => {
    render(<FranchiseTease />);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.textContent?.toLowerCase()).toContain("bring sam");
    expect(h2.textContent?.toLowerCase()).toContain("your town");
  });

  it("references the $25k franchise fee", () => {
    render(<FranchiseTease />);
    expect(screen.getByText(/\$25k/)).toBeInTheDocument();
  });

  it("links 'See the numbers' to /franchise", () => {
    render(<FranchiseTease />);
    const cta = screen.getByRole("link", { name: /see the numbers/i });
    expect(cta).toHaveAttribute("href", "/franchise");
  });
});
