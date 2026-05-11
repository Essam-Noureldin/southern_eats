/**
 * WHAT: Unit tests for lib/location-overrides.ts — both backends.
 * WHY:  The store is the persistence trust boundary for /admin. If a
 *       backend silently loses writes or returns malformed reads the
 *       admin panel becomes a "looks like it saved but didn't" disaster.
 *       Exercise both in-memory and KV (with fetch mocked) so the two
 *       paths can't diverge.
 */
import {
  createInMemoryBackend,
  createKvBackend,
  type LocationOverride,
} from "@/lib/location-overrides";

describe("createInMemoryBackend", () => {
  it("returns an empty map when nothing has been set", async () => {
    const b = createInMemoryBackend();
    expect((await b.getAll()).size).toBe(0);
  });

  it("set + getAll round-trips an override", async () => {
    const b = createInMemoryBackend();
    await b.set("shreveport-greenwood-rd-la", { phone: "(555) 555-5555" });
    const all = await b.getAll();
    expect(all.get("shreveport-greenwood-rd-la")?.phone).toBe("(555) 555-5555");
  });

  it("set stamps updatedAt as an ISO string", async () => {
    const b = createInMemoryBackend();
    await b.set("x", { phone: "(555) 000-0000" });
    const v = (await b.getAll()).get("x")!;
    expect(() => new Date(v.updatedAt).toISOString()).not.toThrow();
    expect(v.updatedAt).toBe(new Date(v.updatedAt).toISOString());
  });

  it("set merges into existing override (hours edit doesn't drop phone)", async () => {
    const b = createInMemoryBackend();
    await b.set("x", { phone: "(555) 000-0000" });
    await b.set("x", {
      hours: [{ day: "Mon", open: "09:00", close: "17:00" }],
    });
    const v = (await b.getAll()).get("x")!;
    expect(v.phone).toBe("(555) 000-0000");
    expect(v.hours).toHaveLength(1);
  });

  it("clear removes the entry entirely", async () => {
    const b = createInMemoryBackend();
    await b.set("x", { phone: "(555) 000-0000" });
    await b.clear("x");
    expect((await b.getAll()).has("x")).toBe(false);
  });

  it("getAll returns a copy — mutating it doesn't poison the store", async () => {
    const b = createInMemoryBackend();
    await b.set("x", { phone: "(555) 000-0000" });
    const all = await b.getAll();
    all.delete("x");
    expect((await b.getAll()).has("x")).toBe(true);
  });
});

describe("createKvBackend", () => {
  const URL = "https://kv.example.com";
  const TOKEN = "test-token";

  function mockFetchOnce(body: unknown) {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => body,
    } as Response);
  }

  function mockFetchSequence(bodies: unknown[]) {
    const fn = jest.fn();
    for (const b of bodies) {
      fn.mockResolvedValueOnce({ ok: true, json: async () => b } as Response);
    }
    global.fetch = fn;
    return fn;
  }

  afterEach(() => {
    delete (global as { fetch?: unknown }).fetch;
  });

  it("getAll parses an HGETALL flat-array response", async () => {
    const override: LocationOverride = {
      phone: "(555) 555-5555",
      updatedAt: "2026-05-11T12:00:00.000Z",
    };
    mockFetchOnce({ result: ["loc-1", JSON.stringify(override)] });

    const b = createKvBackend(URL, TOKEN);
    const all = await b.getAll();
    expect(all.get("loc-1")).toEqual(override);
  });

  it("getAll parses an HGETALL object-shape response", async () => {
    const override: LocationOverride = {
      phone: "(555) 555-5555",
      updatedAt: "2026-05-11T12:00:00.000Z",
    };
    mockFetchOnce({ result: { "loc-1": JSON.stringify(override) } });

    const b = createKvBackend(URL, TOKEN);
    const all = await b.getAll();
    expect(all.get("loc-1")).toEqual(override);
  });

  it("getAll returns an empty map when HGETALL result is null", async () => {
    mockFetchOnce({ result: null });
    const b = createKvBackend(URL, TOKEN);
    expect((await b.getAll()).size).toBe(0);
  });

  it("getAll skips malformed JSON entries instead of failing", async () => {
    mockFetchOnce({
      result: [
        "good",
        JSON.stringify({ phone: "(555) 555-5555", updatedAt: "x" }),
        "bad",
        "not-json{",
      ],
    });
    const b = createKvBackend(URL, TOKEN);
    const all = await b.getAll();
    expect(all.has("good")).toBe(true);
    expect(all.has("bad")).toBe(false);
  });

  it("set fetches existing, merges, and writes back", async () => {
    const existing: LocationOverride = {
      phone: "(555) 000-0000",
      updatedAt: "2026-05-10T12:00:00.000Z",
    };
    const fn = mockFetchSequence([
      { result: JSON.stringify(existing) }, // HGET
      { result: 1 }, // HSET
    ]);

    const b = createKvBackend(URL, TOKEN);
    await b.set("loc-1", {
      hours: [{ day: "Mon", open: "09:00", close: "17:00" }],
    });

    expect(fn).toHaveBeenCalledTimes(2);
    const setBody = JSON.parse(fn.mock.calls[1][1].body as string);
    expect(setBody[0]).toBe("HSET");
    expect(setBody[1]).toBe("location:overrides");
    expect(setBody[2]).toBe("loc-1");
    const written = JSON.parse(setBody[3] as string) as LocationOverride;
    expect(written.phone).toBe("(555) 000-0000"); // merged
    expect(written.hours).toHaveLength(1);
    expect(written.updatedAt).not.toBe(existing.updatedAt); // refreshed
  });

  it("clear calls HDEL with the right key", async () => {
    const fn = mockFetchSequence([{ result: 1 }]);
    const b = createKvBackend(URL, TOKEN);
    await b.clear("loc-1");
    const body = JSON.parse(fn.mock.calls[0][1].body as string);
    expect(body).toEqual(["HDEL", "location:overrides", "loc-1"]);
  });

  it("authorizes every request with the Bearer token", async () => {
    const fn = mockFetchSequence([{ result: null }]);
    const b = createKvBackend(URL, TOKEN);
    await b.getAll();
    expect(fn.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("throws when the HTTP response is non-ok", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Error",
      json: async () => ({}),
    } as Response);
    const b = createKvBackend(URL, TOKEN);
    await expect(b.getAll()).rejects.toThrow(/HGETALL failed: 500/);
  });

  it("throws when the JSON body carries an error field", async () => {
    mockFetchOnce({ error: "WRONGTYPE Operation against a key" });
    const b = createKvBackend(URL, TOKEN);
    await expect(b.getAll()).rejects.toThrow(/HGETALL error/);
  });
});
