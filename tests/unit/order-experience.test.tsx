/**
 * WHAT: Tests the OrderExperience client component on /order.
 * WHY:  The page lists every Sam's location and lets users pick where
 *       to order from. Sam's runs per-location HungerRush subdomains
 *       (37/41 live); the remaining 4 are phone-only on the live site.
 *       Test-first locks the contract: search filters by name/city/
 *       state, locations with orderUrl render a real outbound link,
 *       locations without orderUrl render a working "Call to order"
 *       tel: link (no dead disabled buttons), and a quick-tap phone
 *       link + directions link appear on every card.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import OrderExperience from "@/components/order/OrderExperience";
import type { Location } from "@/lib/locations";

const locations: Location[] = [
  {
    id: "shreveport-greenwood-rd-la",
    name: "Shreveport — Greenwood Rd",
    address: {
      street: "6122 Greenwood Rd",
      city: "Shreveport",
      state: "LA",
      zip: "71119",
    },
    phone: "(318) 631-7782",
    coords: { lat: 32.4522114, lng: -93.8622371 },
    hours: [],
  },
  {
    id: "norman-w-main-ok",
    name: "Norman — W Main St",
    address: {
      street: "408 W Main St",
      city: "Norman",
      state: "OK",
      zip: "73069",
    },
    phone: "(405) 561-7400",
    coords: { lat: 35.2183695, lng: -97.4484078 },
    hours: [],
    orderUrl: "https://order.example.com/norman",
  },
  {
    id: "havelock-w-main-nc",
    name: "Havelock — W Main St",
    address: {
      street: "411 W Main St",
      city: "Havelock",
      state: "NC",
      zip: "28532",
    },
    phone: "(252) 652-6108",
    coords: { lat: 34.8893736, lng: -76.9207378 },
    hours: [],
  },
];

describe("OrderExperience", () => {
  it("renders every location by default", () => {
    render(<OrderExperience locations={locations} />);
    expect(screen.getByText(/Shreveport — Greenwood Rd/)).toBeInTheDocument();
    expect(screen.getByText(/Norman — W Main St/)).toBeInTheDocument();
    expect(screen.getByText(/Havelock — W Main St/)).toBeInTheDocument();
  });

  it("renders a search input with the right accessible name", () => {
    render(<OrderExperience locations={locations} />);
    expect(
      screen.getByRole("searchbox", { name: /search locations/i }),
    ).toBeInTheDocument();
  });

  it("filters by city query", () => {
    render(<OrderExperience locations={locations} />);
    const search = screen.getByRole("searchbox", {
      name: /search locations/i,
    });
    act(() => {
      fireEvent.change(search, { target: { value: "norman" } });
    });
    expect(screen.getByText(/Norman — W Main St/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Shreveport — Greenwood Rd/),
    ).not.toBeInTheDocument();
  });

  it("filters by 2-letter state code", () => {
    render(<OrderExperience locations={locations} />);
    const search = screen.getByRole("searchbox", {
      name: /search locations/i,
    });
    act(() => {
      fireEvent.change(search, { target: { value: "OK" } });
    });
    expect(screen.getByText(/Norman — W Main St/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Shreveport — Greenwood Rd/),
    ).not.toBeInTheDocument();
  });

  it("renders a working outbound order link when orderUrl is set", () => {
    render(<OrderExperience locations={locations} />);
    const orderLink = screen.getByRole("link", {
      name: /order from norman/i,
    });
    expect(orderLink).toHaveAttribute(
      "href",
      "https://order.example.com/norman",
    );
    expect(orderLink).toHaveAttribute("target", "_blank");
    expect(orderLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("renders a 'Call to order' tel link when orderUrl is missing", () => {
    render(<OrderExperience locations={locations} />);
    // Two of the three test locations are missing orderUrl — they
    // get a tel: link styled as a CTA button. Each carries an
    // aria-label naming the store so multiple cards on the page are
    // distinguishable to assistive tech.
    const callShreveport = screen.getByRole("link", {
      name: /call shreveport — greenwood rd to order/i,
    });
    expect(callShreveport).toHaveAttribute("href", "tel:+13186317782");
    const callHavelock = screen.getByRole("link", {
      name: /call havelock — w main st to order/i,
    });
    expect(callHavelock).toHaveAttribute("href", "tel:+12526526108");
    // No disabled buttons anywhere on the page.
    expect(screen.queryAllByRole("button", { name: /coming soon/i })).toHaveLength(
      0,
    );
  });

  it("renders a tel: phone link on every location", () => {
    render(<OrderExperience locations={locations} />);
    // Norman has an orderUrl, so the phone appears once (just the
    // standalone quick-tap link). Phone-only stores show the number
    // twice (quick-tap + 'Call to order' CTA whose aria-label includes
    // the number). Either way, getAllByRole finds the right hrefs.
    expect(
      screen.getByRole("link", { name: /\(405\) 561-7400/i }),
    ).toHaveAttribute("href", "tel:+14055617400");
    const shreveportLinks = screen.getAllByRole("link", {
      name: /318.*631.*7782/i,
    });
    expect(shreveportLinks.length).toBeGreaterThan(0);
    for (const link of shreveportLinks) {
      expect(link).toHaveAttribute("href", "tel:+13186317782");
    }
  });

  it("renders a directions link on every location", () => {
    render(<OrderExperience locations={locations} />);
    const directions = screen.getAllByRole("link", { name: /directions/i });
    expect(directions).toHaveLength(3);
    for (const link of directions) {
      expect(link.getAttribute("href")).toMatch(
        /^https:\/\/www\.google\.com\/maps\/dir\//,
      );
    }
  });

  it("shows an empty-state message when nothing matches", () => {
    render(<OrderExperience locations={locations} />);
    const search = screen.getByRole("searchbox", {
      name: /search locations/i,
    });
    act(() => {
      fireEvent.change(search, { target: { value: "xxxxxxxxxx" } });
    });
    expect(screen.getByText(/no locations match/i)).toBeInTheDocument();
  });

  it("caps search input length to bound the filter work", () => {
    render(<OrderExperience locations={locations} />);
    const search = screen.getByRole("searchbox", {
      name: /search locations/i,
    }) as HTMLInputElement;
    expect(search.maxLength).toBe(100);
  });
});
