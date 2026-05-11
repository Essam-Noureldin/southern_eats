/**
 * WHAT: Integration tests for the /admin server actions —
 *       saveOverrideAction round-trips the form values through the
 *       in-memory backend; clearOverrideAction removes the row.
 * WHY:  The action is the only path a real user has into the overrides
 *       store. Test it end-to-end through real zod parsing so a bug in
 *       the FormData → schema → store pipeline can't ship undetected.
 * COMMON MISTAKE: testing the action without resetting the backend
 *       between specs — writes from one test then leak into the next.
 */
import {
  saveOverrideAction,
  clearOverrideAction,
} from "@/app/admin/actions";
import {
  __setBackendForTests,
  createInMemoryBackend,
  getOverride,
} from "@/lib/location-overrides";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  __setBackendForTests(createInMemoryBackend());
});

afterEach(() => {
  __setBackendForTests(null);
});

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    fd.set(k, v);
  }
  return fd;
}

describe("saveOverrideAction", () => {
  const ID = "shreveport-greenwood-rd-la";

  it("persists a phone-only override", async () => {
    const result = await saveOverrideAction(
      ID,
      form({ phone: "(555) 555-5555" }),
    );
    expect(result.ok).toBe(true);
    const stored = await getOverride(ID);
    expect(stored?.phone).toBe("(555) 555-5555");
    expect(stored?.hours).toBeUndefined();
  });

  it("persists an hours override (a single open day)", async () => {
    const result = await saveOverrideAction(
      ID,
      form({
        phone: "",
        closed_Mon: "on",
        closed_Tue: "on",
        closed_Wed: "on",
        closed_Thu: "on",
        open_Fri: "11:00",
        close_Fri: "23:00",
        closed_Sat: "on",
        closed_Sun: "on",
      }),
    );
    expect(result.ok).toBe(true);
    const stored = await getOverride(ID);
    expect(stored?.hours).toEqual([{ day: "Fri", open: "11:00", close: "23:00" }]);
  });

  it("returns an error and does not persist when a time is malformed", async () => {
    const result = await saveOverrideAction(
      ID,
      form({
        phone: "",
        open_Mon: "25:99",
        close_Mon: "23:00",
      }),
    );
    expect(result.ok).toBe(false);
    expect(await getOverride(ID)).toBeNull();
  });

  it("merges across two writes (phone first, then hours)", async () => {
    await saveOverrideAction(ID, form({ phone: "(555) 555-5555" }));
    await saveOverrideAction(
      ID,
      form({
        phone: "(555) 555-5555",
        open_Mon: "10:00",
        close_Mon: "20:00",
        closed_Tue: "on",
        closed_Wed: "on",
        closed_Thu: "on",
        closed_Fri: "on",
        closed_Sat: "on",
        closed_Sun: "on",
      }),
    );
    const stored = await getOverride(ID);
    expect(stored?.phone).toBe("(555) 555-5555");
    expect(stored?.hours).toHaveLength(1);
  });
});

describe("clearOverrideAction", () => {
  const ID = "norman-w-main-ok";

  it("removes a previously-set override", async () => {
    await saveOverrideAction(ID, form({ phone: "(555) 555-5555" }));
    expect(await getOverride(ID)).not.toBeNull();
    const result = await clearOverrideAction(ID);
    expect(result.ok).toBe(true);
    expect(await getOverride(ID)).toBeNull();
  });

  it("is a no-op when no override exists", async () => {
    const result = await clearOverrideAction(ID);
    expect(result.ok).toBe(true);
    expect(await getOverride(ID)).toBeNull();
  });
});
