/**
 * WHAT: Unit tests for components/layout/MobileOrderBar.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - renders an "Order online" link pointing at /order
 *       - link sits inside a container marked md:hidden (chrome
 *         element only on mobile)
 */
import { render, screen } from "@testing-library/react";
import MobileOrderBar from "@/components/layout/MobileOrderBar";

describe("MobileOrderBar", () => {
  it("renders an Order online CTA pointing at /order", () => {
    render(<MobileOrderBar />);
    const cta = screen.getByRole("link", { name: /order online/i });
    expect(cta).toHaveAttribute("href", "/order");
  });

  it("the wrapper carries the md:hidden class so it disappears on desktop", () => {
    const { container } = render(<MobileOrderBar />);
    const wrapper = container.firstElementChild as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toMatch(/md:hidden/);
  });
});
