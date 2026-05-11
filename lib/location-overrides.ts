/**
 * WHAT: Read/write layer for per-location editable fields (hours, phone)
 *       set via the /admin panel. Two backends: an in-memory Map (used
 *       in dev/test/CI when Vercel KV env vars aren't configured) and
 *       a Vercel KV (Upstash Redis) backend via REST.
 * WHY:  Static `lib/locations.ts` stays the source of truth. Overrides
 *       merge on top of it inside `getLocationsWithOverrides()` so that
 *       a deploy of new code never wipes the franchise's hour edits.
 *       Splitting the backend behind an interface keeps tests fast
 *       (in-memory, no network) and prod durable (KV, survives deploys).
 * IF REMOVED: /admin edits would either need to live in committed code
 *       (defeating the point) or use a heavier persistence story.
 * COMMON MISTAKE: storing each override as its own Redis key. With ~50
 *       locations and frequent "show me all current overrides" reads,
 *       one HASH (HGETALL → entire map in one call) is much cheaper
 *       on Upstash's per-command quota than N GETs.
 */
import type { Hours } from "./locations";
import { env } from "./env";

export interface LocationOverride {
  hours?: Hours[];
  phone?: string;
  updatedAt: string; // ISO timestamp — set on every write
}

const HASH_KEY = "location:overrides";

interface OverridesBackend {
  getAll(): Promise<Map<string, LocationOverride>>;
  set(id: string, fields: Partial<Omit<LocationOverride, "updatedAt">>): Promise<void>;
  clear(id: string): Promise<void>;
}

/**
 * In-memory backend. Lives for the lifetime of the Node process.
 * Survives HMR in dev (the module is cached) but NOT a server restart,
 * and emphatically not across serverless lambdas in prod — anyone
 * deploying without KV configured is opting into demo-grade persistence.
 */
export function createInMemoryBackend(): OverridesBackend {
  const store = new Map<string, LocationOverride>();
  return {
    async getAll() {
      return new Map(store);
    },
    async set(id, fields) {
      const existing = store.get(id) ?? { updatedAt: "" };
      const next: LocationOverride = {
        ...existing,
        ...fields,
        updatedAt: new Date().toISOString(),
      };
      store.set(id, next);
    },
    async clear(id) {
      store.delete(id);
    },
  };
}

/**
 * Vercel KV (Upstash REST) backend. Uses the command-based REST API
 * (POST `{url}` with a JSON array `["HGETALL", "<key>"]`). All edits
 * land in a single hash so HGETALL returns every override in one call.
 */
export function createKvBackend(url: string, token: string): OverridesBackend {
  async function command(args: (string | number)[]): Promise<unknown> {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      // Upstash answers in <30ms typically; cap at 5s to bound a stuck call.
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      throw new Error(`KV ${args[0]} failed: ${res.status} ${res.statusText}`);
    }
    const body = (await res.json()) as { result?: unknown; error?: string };
    if (body.error) throw new Error(`KV ${args[0]} error: ${body.error}`);
    return body.result;
  }

  return {
    async getAll() {
      const result = (await command(["HGETALL", HASH_KEY])) as
        | string[]
        | Record<string, string>
        | null;
      const out = new Map<string, LocationOverride>();
      if (!result) return out;
      // Upstash returns hashes in two shapes across SDK versions: a flat
      // [k1, v1, k2, v2, …] array OR a {k: v} object. Handle both so a
      // platform upgrade doesn't silently empty the admin panel.
      if (Array.isArray(result)) {
        for (let i = 0; i + 1 < result.length; i += 2) {
          try {
            out.set(result[i], JSON.parse(result[i + 1]));
          } catch {
            // Skip malformed entries rather than failing the whole load.
          }
        }
      } else {
        for (const [id, raw] of Object.entries(result)) {
          try {
            out.set(id, JSON.parse(raw));
          } catch {
            // Skip malformed entries.
          }
        }
      }
      return out;
    },
    async set(id, fields) {
      const current = (await command(["HGET", HASH_KEY, id])) as string | null;
      const existing: LocationOverride = current
        ? (() => {
            try {
              return JSON.parse(current) as LocationOverride;
            } catch {
              return { updatedAt: "" };
            }
          })()
        : { updatedAt: "" };
      const next: LocationOverride = {
        ...existing,
        ...fields,
        updatedAt: new Date().toISOString(),
      };
      await command(["HSET", HASH_KEY, id, JSON.stringify(next)]);
    },
    async clear(id) {
      await command(["HDEL", HASH_KEY, id]);
    },
  };
}

/**
 * Lazily-chosen backend. In test runs we always use the in-memory backend
 * so a stray test doesn't try to hit prod KV. Outside tests, if the KV
 * env vars are populated we use KV; otherwise in-memory.
 */
let backend: OverridesBackend | null = null;

function getBackend(): OverridesBackend {
  if (backend) return backend;
  if (
    process.env.NODE_ENV !== "test" &&
    env.KV_REST_API_URL &&
    env.KV_REST_API_TOKEN
  ) {
    backend = createKvBackend(env.KV_REST_API_URL, env.KV_REST_API_TOKEN);
  } else {
    backend = createInMemoryBackend();
  }
  return backend;
}

/**
 * Test seam — lets the test harness inject a backend (typically a fresh
 * in-memory one per test). Never call from app code.
 */
export function __setBackendForTests(b: OverridesBackend | null): void {
  backend = b;
}

export async function getAllOverrides(): Promise<Map<string, LocationOverride>> {
  return getBackend().getAll();
}

export async function getOverride(id: string): Promise<LocationOverride | null> {
  const all = await getAllOverrides();
  return all.get(id) ?? null;
}

export async function setOverride(
  id: string,
  fields: Partial<Omit<LocationOverride, "updatedAt">>,
): Promise<void> {
  return getBackend().set(id, fields);
}

export async function clearOverride(id: string): Promise<void> {
  return getBackend().clear(id);
}
