/**
 * WHAT: Unit tests for components/layout/MobileOrderBar.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - renders an "Order online" link pointing at /order on normal pages
 *       - link sits inside a container marked md:hidden (chrome
 *         element only on mobile)
 *       - renders NOTHING on /order/* (the ordering flow has its own
 *         mobile cart/checkout bar — two stacked fixed bars sending the
 *         user backwards mid-order is the bug this guards against)
 */
import { render, screen } from "@testing-library/react";
import MobileOrderBar from "@/components/layout/MobileOrderBar";

// usePathname is mocked via a mutable (mock-prefixed so jest's hoist
// guard allows the factory to close over it). Reset per test.
let mockPathname = "/";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

beforeEach(() => {
  mockPathname = "/";
});

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

  it("renders nothing on /order routes (no stacked bar mid-order)", () => {
    mockPathname = "/order/jackson-raymond-rd-ms";
    const { container } = render(<MobileOrderBar />);
    expect(container.firstChild).toBeNull();
    expect(
      screen.queryByRole("link", { name: /order online/i }),
    ).not.toBeInTheDocument();
  });

  it("still renders on the /order-adjacent but non-order path", () => {
    mockPathname = "/our-story";
    render(<MobileOrderBar />);
    expect(
      screen.getByRole("link", { name: /order online/i }),
    ).toBeInTheDocument();
  });
});
