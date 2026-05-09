import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileOrderBar from "@/components/layout/MobileOrderBar";

expect.extend(toHaveNoViolations);

/**
 * WHAT: Smoke for the layout chrome (Navbar, Footer, MobileOrderBar) in
 *       isolation. RootLayout is awkward to mount in jsdom because it
 *       returns the <html> element — so we exercise its constituent
 *       parts directly.
 * WHY:  These render on every page; an axe regression here ships
 *       site-wide.
 */
describe("Layout chrome smoke", () => {
  it("Navbar has no axe violations", async () => {
    const { container } = render(<Navbar />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("Footer has no axe violations", async () => {
    const { container } = render(<Footer />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("MobileOrderBar has no axe violations", async () => {
    const { container } = render(<MobileOrderBar />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
