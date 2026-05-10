/**
 * WHAT: Tests the OrderExperience client component on /order.
 * WHY:  The page lists every Sam's location and lets users pick where
 *       to order from. Until the franchise wires per-location order
 *       URLs, each card shows a disabled "coming soon" affordance with
 *       a tel: phone link as the working fallback. Test-first locks
 *       the contract: search filters by name/city/state, missing
 *       orderUrl yields a disabled button, present orderUrl yields a
 *       real outbound link, and the phone + directions links are
 *       present on every card.
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

  it("renders a disabled coming-soon button when orderUrl is missing", () => {
    render(<OrderExperience locations={locations} />);
    const comingSoon = screen.getAllByRole("button", { name: /coming soon/i });
    // Two of the three test locations are missing orderUrl.
    expect(comingSoon).toHaveLength(2);
    for (const btn of comingSoon) {
      expect(btn).toBeDisabled();
    }
  });

  it("renders a tel: phone link on every location", () => {
    render(<OrderExperience locations={locations} />);
    expect(
      screen.getByRole("link", { name: /\(318\) 631-7782/i }),
    ).toHaveAttribute("href", "tel:+13186317782");
    expect(
      screen.getByRole("link", { name: /\(405\) 561-7400/i }),
    ).toHaveAttribute("href", "tel:+14055617400");
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
