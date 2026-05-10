/**
 * WHAT: Unit tests for components/sections/StoryTease.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - eyebrow "Our story" + h2 with display headline
 *       - body copy naming Sam Gazawaneh and Shreveport 2008 origin
 *       - "Read our story" CTA pointing at /our-story
 *       - storefront photo with descriptive alt naming the brand
 *
 *       Original tests asserted on Tracy & Mo Elbahgha — that was a
 *       mis-attribution carried over from the lovable demo. Tracy & Mo
 *       are franchisees of the Lansing, MI location; Sam Gazawaneh is
 *       the actual founder. See MASTER_PROMPT_DEVIATIONS.md.
 */
import { render, screen } from "@testing-library/react";
import StoryTease from "@/components/sections/StoryTease";

describe("StoryTease", () => {
  it("renders an 'Our story' eyebrow", () => {
    render(<StoryTease />);
    // The literal "Our story" appears in the eyebrow AND the "Read our story" CTA
    expect(screen.getAllByText(/our story/i).length).toBeGreaterThan(0);
  });

  it("renders an h2 headline mentioning the Taco Bell origin detail", () => {
    render(<StoryTease />);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.textContent?.toLowerCase()).toContain("taco bell");
  });

  it("names Sam Gazawaneh and Shreveport / 2008", () => {
    render(<StoryTease />);
    expect(screen.getByText(/sam gazawaneh/i)).toBeInTheDocument();
    expect(screen.getByText(/shreveport/i)).toBeInTheDocument();
    expect(screen.getByText(/2008/)).toBeInTheDocument();
  });

  it("links 'Read our story' to /our-story", () => {
    render(<StoryTease />);
    const cta = screen.getByRole("link", { name: /read our story/i });
    expect(cta).toHaveAttribute("href", "/our-story");
  });

  it("renders a storefront image with alt text naming Sam's Southern Eatery", () => {
    render(<StoryTease />);
    const img = screen.getByRole("img");
    const alt = img.getAttribute("alt") ?? "";
    expect(alt.toLowerCase()).toContain("sam");
    expect(alt.toLowerCase()).toContain("southern eatery");
  });
});
