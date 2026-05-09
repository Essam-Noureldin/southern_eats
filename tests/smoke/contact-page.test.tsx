import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import ContactPage from "@/app/contact/page";

expect.extend(toHaveNoViolations);

/**
 * WHAT: Smoke for /contact — heading hierarchy, form labels, focus-visible
 *       handling. Forms are the highest-risk surface for accessibility
 *       regressions because every input needs an associated label.
 * WHY:  A label-less input is invisible to screen readers and a hard
 *       blocker for users with motor disabilities relying on voice control.
 */
describe("ContactPage smoke", () => {
  it("has no axe violations", async () => {
    const { container } = render(<ContactPage />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
