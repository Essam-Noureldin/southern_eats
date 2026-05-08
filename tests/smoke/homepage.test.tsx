import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

/**
 * WHAT: Smoke test that proves the Jest pipeline works end-to-end.
 *       Real homepage smoke (axe, landmarks, etc.) lands in feature-smoke (step 18).
 * WHY:  feature-jest's job is to prove the test infrastructure works.
 *       Without one passing test we can't be confident in later TDD steps.
 */
describe("HomePage", () => {
  it("renders the brand tagline", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1 }),
    ).toHaveTextContent(/jumbo shrimp/i);
  });
});
