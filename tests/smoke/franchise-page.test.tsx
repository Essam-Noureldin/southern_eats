import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import FranchisePage from "@/app/franchise/page";

expect.extend(toHaveNoViolations);

/**
 * WHAT: Smoke for /franchise — the page that pays off the FranchiseTease
 *       homepage CTA and the "Franchise opportunities" button on /our-story.
 * WHY:  Until this branch, /franchise 404'd — the same broken-CTA pattern
 *       we just fixed for /our-story. Test-first locks the contract: the
 *       page exists, has a single h1, names the verified franchise terms
 *       ($25k fee, 6% royalty, 50k territory — the same numbers
 *       NumbersBand on the homepage shows), and reads clean to axe.
 */
describe("FranchisePage smoke", () => {
  it("has no axe violations", async () => {
    const { container } = render(<FranchisePage />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("renders exactly one h1", () => {
    render(<FranchisePage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
  });

  it("names the verified franchise terms", () => {
    render(<FranchisePage />);
    expect(screen.getAllByText(/\$25k|\$25,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/6%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/50k|50,000/i).length).toBeGreaterThan(0);
  });

  it("references the 41 / 11 / 2008 scale facts consistent with the rest of the site", () => {
    render(<FranchisePage />);
    expect(screen.getAllByText(/41/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/11/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2008/).length).toBeGreaterThan(0);
  });

  it("links to /contact as the next step for a prospective franchisee", () => {
    render(<FranchisePage />);
    // Both the hero and the bottom-of-page CTA link to /contact — assert
    // at least one and that every contact-CTA points at the right place.
    const contactLinks = screen.getAllByRole("link", {
      name: /contact|enquire|get in touch|apply/i,
    });
    expect(contactLinks.length).toBeGreaterThan(0);
    for (const link of contactLinks) {
      expect(link).toHaveAttribute("href", "/contact");
    }
  });

  it("includes a marquee strip with franchise-positioning phrases", () => {
    render(<FranchisePage />);
    const marquee = screen.getByTestId("franchise-marquee");
    expect(marquee).toHaveAttribute("aria-hidden", "true");
    const track = screen.getByTestId("franchise-marquee-track");
    expect(track.className).toMatch(/animate-marquee/);
    expect(screen.getAllByText(/operators wanted/i).length).toBeGreaterThan(0);
  });
});
