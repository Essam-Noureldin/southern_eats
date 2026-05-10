import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import OurStoryPage from "@/app/our-story/page";

expect.extend(toHaveNoViolations);

/**
 * WHAT: Smoke for /our-story — the brand origin page that pays off the
 *       homepage StoryTease CTA.
 * WHY:  The page is content-heavy and built around verifiable founder
 *       facts (Sam Gazawaneh, Shreveport, 2008, Taco Bell, gas-station
 *       worker). Test-first locks the contract: the named facts have to
 *       be on the page, the page must have a single h1, and axe must
 *       see a clean accessibility tree.
 *       If any of those break (e.g. someone refactors the page into
 *       multiple h1s, or removes the founder name), this test catches it.
 */
describe("OurStoryPage smoke", () => {
  it("has no axe violations", async () => {
    const { container } = render(<OurStoryPage />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("renders exactly one h1", () => {
    render(<OurStoryPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
  });

  it("names Sam Gazawaneh and the Shreveport / 2008 origin", () => {
    render(<OurStoryPage />);
    expect(screen.getAllByText(/sam gazawaneh/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/shreveport/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2008/).length).toBeGreaterThan(0);
  });

  it("includes the verifiable Taco Bell origin detail", () => {
    render(<OurStoryPage />);
    expect(screen.getAllByText(/taco bell/i).length).toBeGreaterThan(0);
  });

  it("links to /menu and /franchise as next steps", () => {
    render(<OurStoryPage />);
    const menuLink = screen.getByRole("link", { name: /menu/i });
    expect(menuLink).toHaveAttribute("href", "/menu");
    const franchiseLink = screen.getByRole("link", { name: /franchise/i });
    expect(franchiseLink).toHaveAttribute("href", "/franchise");
  });

  it("renders multiple images including the storefront with descriptive alt", () => {
    render(<OurStoryPage />);
    const imgs = screen.getAllByRole("img");
    // Storefront + fried chicken + jumbo shrimp + 3-up dish grid = at least 5
    expect(imgs.length).toBeGreaterThanOrEqual(5);
    // The storefront photo is identifiable by its alt text mentioning the brand
    const storefront = imgs.find((img) => {
      const alt = (img.getAttribute("alt") ?? "").toLowerCase();
      return alt.includes("sam") && alt.includes("southern eatery");
    });
    expect(storefront).toBeDefined();
  });

  it("every image has non-empty alt text", () => {
    render(<OurStoryPage />);
    const imgs = screen.getAllByRole("img");
    for (const img of imgs) {
      const alt = img.getAttribute("alt") ?? "";
      expect(alt.length).toBeGreaterThan(0);
    }
  });
});
