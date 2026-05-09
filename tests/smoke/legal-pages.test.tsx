import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import CookiesPage from "@/app/cookies/page";

expect.extend(toHaveNoViolations);

/**
 * WHAT: Smoke for the three legal pages.
 * WHY:  Legal pages are mostly long-form text — easy to ship without
 *       proper heading hierarchy or with link-text accessibility issues.
 *       jest-axe is the cheap guard.
 */
describe("Legal pages smoke", () => {
  it.each([
    ["Privacy", PrivacyPage],
    ["Terms", TermsPage],
    ["Cookies", CookiesPage],
  ])("%s page has no axe violations", async (_name, Page) => {
    const { container } = render(<Page />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
