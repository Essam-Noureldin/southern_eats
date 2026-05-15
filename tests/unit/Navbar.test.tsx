/**
 * WHAT: Unit tests for components/layout/Navbar.
 * WHY:  Test-first per master prompt. Locks the contract:
 *       - banner landmark rendered (a11y)
 *       - brand link, four nav links, Order Online CTA (desktop)
 *       - mobile menu toggle: closed by default, opens on click,
 *         closes on close button, closes on selecting a nav item
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/layout/Navbar";

describe("Navbar — desktop structure", () => {
  it("renders a banner landmark", () => {
    render(<Navbar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the brand wordmark linking home", () => {
    render(<Navbar />);
    const brand = screen.getByRole("link", { name: /sam'?s/i });
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveAttribute("href", "/");
  });

  it("renders the four primary nav links", () => {
    render(<Navbar />);
    const menu = screen.getAllByRole("link", { name: /^menu$/i });
    const locations = screen.getAllByRole("link", { name: /^locations$/i });
    const story = screen.getAllByRole("link", { name: /our story/i });
    const franchise = screen.getAllByRole("link", { name: /^franchise$/i });
    expect(menu.length).toBeGreaterThan(0);
    expect(locations.length).toBeGreaterThan(0);
    expect(story.length).toBeGreaterThan(0);
    expect(franchise.length).toBeGreaterThan(0);
    expect(menu[0]).toHaveAttribute("href", "/menu");
    expect(locations[0]).toHaveAttribute("href", "/locations");
    expect(story[0]).toHaveAttribute("href", "/our-story");
    expect(franchise[0]).toHaveAttribute("href", "/franchise");
  });

  it("renders an Order Online CTA pointing at /order", () => {
    render(<Navbar />);
    const cta = screen.getAllByRole("link", { name: /order online/i });
    expect(cta.length).toBeGreaterThan(0);
    expect(cta[0]).toHaveAttribute("href", "/order");
  });
});

describe("Navbar — mobile menu", () => {
  it("renders a 'Open menu' button", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /open menu/i }),
    ).toBeInTheDocument();
  });

  it("opens the mobile overlay on click", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    expect(screen.queryByRole("dialog", { name: /mobile/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("dialog", { name: /mobile/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close menu/i }),
    ).toBeInTheDocument();
  });

  it("closes the mobile overlay on close button click", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.queryByRole("dialog", { name: /mobile/i })).not.toBeInTheDocument();
  });

  it("portals the open overlay OUT of the header banner (containing-block regression)", async () => {
    // The bug: the header has `backdrop-blur`, which makes it the
    // containing block for any `position: fixed` descendant — so a
    // fixed overlay nested in the header is clamped to the 64px header
    // instead of the viewport. The overlay MUST be portalled to <body>,
    // i.e. NOT a descendant of the banner element.
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const banner = screen.getByRole("banner");
    const dialog = screen.getByRole("dialog", { name: /mobile/i });
    expect(dialog).toBeInTheDocument();
    expect(banner.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });

  it("locks body scroll while open and restores it on close", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    expect(document.body.style.overflow).not.toBe("hidden");
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("closes the mobile overlay when a nav link inside it is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    const dialog = screen.getByRole("dialog", { name: /mobile/i });
    // Find the Menu link inside the mobile dialog specifically
    const menuLink = Array.from(dialog.querySelectorAll("a")).find(
      (a) => a.textContent?.toLowerCase().includes("menu"),
    );
    expect(menuLink).toBeDefined();
    if (menuLink) await user.click(menuLink);
    expect(screen.queryByRole("dialog", { name: /mobile/i })).not.toBeInTheDocument();
  });
});
