/**
 * WHAT: Smoke tests for /admin and /admin/[id]. Async server components,
 *       so we await the page function and pass its result to render().
 *       Mock next/cache + next/navigation because the action revalidate*
 *       calls aren't useful in tests but their absence shouldn't crash.
 * WHY:  Ensures the admin tree renders for a valid id, exposes the
 *       location name as an h1 (so an admin can confirm what they're
 *       editing at a glance), and the index page lists every location.
 * IF REMOVED: a regression to the admin layout could ship without any
 *       test failure.
 */
import { render } from "@testing-library/react";
import AdminIndexPage from "@/app/admin/page";
import AdminLocationPage from "@/app/admin/[id]/page";
import { __setBackendForTests, createInMemoryBackend } from "@/lib/location-overrides";
import { LOCATIONS } from "@/lib/locations";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  __setBackendForTests(createInMemoryBackend());
});

afterEach(() => {
  __setBackendForTests(null);
});

describe("/admin index page", () => {
  it("renders the admin heading", async () => {
    const ui = await AdminIndexPage();
    const { getByRole } = render(ui);
    expect(getByRole("heading", { level: 1 }).textContent).toMatch(/admin/i);
  });

  it("lists every location with an edit link", async () => {
    const ui = await AdminIndexPage();
    const { getAllByRole } = render(ui);
    // First link is the inline "the public locations page" link; the
    // rest are per-row Edit links. Should match the LOCATIONS count.
    const editLinks = getAllByRole("link", { name: /edit/i });
    expect(editLinks).toHaveLength(LOCATIONS.length);
  });
});

describe("/admin/[id] page", () => {
  it("renders the location name as the h1 for a valid id", async () => {
    const ui = await AdminLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { getByRole } = render(ui);
    expect(getByRole("heading", { level: 1 }).textContent).toMatch(
      /Shreveport/i,
    );
  });

  it("renders a Save changes button on the edit form", async () => {
    const ui = await AdminLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { getByRole } = render(ui);
    expect(getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("renders 7 day rows for the hours fieldset (Mon..Sun)", async () => {
    const ui = await AdminLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { getAllByRole } = render(ui);
    // Each day has a "Closed" checkbox — exactly 7.
    const checkboxes = getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(7);
  });

  it("prefills the phone input with the location's current phone", async () => {
    const ui = await AdminLocationPage({
      params: Promise.resolve({ id: "shreveport-greenwood-rd-la" }),
    });
    const { getByLabelText } = render(ui);
    const phone = getByLabelText("Phone") as HTMLInputElement;
    expect(phone.value).toBe("(318) 631-7782");
  });
});
