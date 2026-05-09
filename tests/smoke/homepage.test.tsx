import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import HomePage from "@/app/page";

expect.extend(toHaveNoViolations);

/**
 * WHAT: Smoke test for the marketing homepage. Renders the full page and
 *       asserts (a) the H1 surfaces brand copy and (b) jest-axe finds no
 *       WCAG violations in the rendered tree.
 * WHY:  Cheaper to catch missing alt text, broken heading hierarchy, and
 *       form-label issues here than to wait for a manual audit.
 * COMMON MISTAKE: rendering the page with all its layout chrome (Navbar,
 *       Footer, etc.). The page component renders just the page; the
 *       chrome lives in app/layout.tsx and is harder to mount in jsdom.
 *       Smoke covers the page in isolation, integration tests cover the
 *       layout chrome.
 */
describe("HomePage smoke", () => {
  it("renders the brand tagline H1", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1 }),
    ).toHaveTextContent(/jumbo shrimp/i);
  });

  it("has no axe-detected accessibility violations", async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container, {
      // The 'region' rule fails on every fragment of text not inside a
      // landmark element. Pages with footer copyright lines, eyebrow caps,
      // etc. trip it constantly. We disable it at smoke level and rely on
      // landmark unit tests (Footer, Navbar) for landmark coverage.
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
