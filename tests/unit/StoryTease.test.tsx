/**
 * WHAT: Unit tests for components/sections/StoryTease.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - eyebrow "Our story" + h2 with display headline
 *       - body copy naming Tracy and Mo Elbahgha and Shreveport 2008
 *       - "Read our story" CTA pointing at /our-story
 *       - founders photo with descriptive alt mentioning Tracy and Mo
 */
import { render, screen } from "@testing-library/react";
import StoryTease from "@/components/sections/StoryTease";

describe("StoryTease", () => {
  it("renders an 'Our story' eyebrow", () => {
    render(<StoryTease />);
    // The literal "Our story" appears in the eyebrow AND the "Read our story" CTA
    expect(screen.getAllByText(/our story/i).length).toBeGreaterThan(0);
  });

  it("renders an h2 headline mentioning eloping", () => {
    render(<StoryTease />);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2.textContent?.toLowerCase()).toContain("eloped");
  });

  it("names Tracy and Mo Elbahgha and Shreveport / 2008", () => {
    render(<StoryTease />);
    expect(screen.getByText(/tracy and mo/i)).toBeInTheDocument();
    expect(screen.getByText(/elbahgha/i)).toBeInTheDocument();
    expect(screen.getByText(/shreveport.*2008|2008.*shreveport/i)).toBeInTheDocument();
  });

  it("links 'Read our story' to /our-story", () => {
    render(<StoryTease />);
    const cta = screen.getByRole("link", { name: /read our story/i });
    expect(cta).toHaveAttribute("href", "/our-story");
  });

  it("renders a founders image with alt text naming Tracy and Mo", () => {
    render(<StoryTease />);
    const img = screen.getByRole("img");
    const alt = img.getAttribute("alt") ?? "";
    expect(alt.toLowerCase()).toContain("tracy");
    expect(alt.toLowerCase()).toContain("mo");
  });
});
