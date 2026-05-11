"use client";

/**
 * WHAT: Cart state lifted out of LocationMenu so it survives navigation
 *       from /order/[id] (menu) to /order/[id]/checkout (form) to
 *       /order/[id]/confirmation. Persists to localStorage so a refresh
 *       or accidental tab-close doesn't lose the cart.
 * WHY:  Without a shared provider, every page mount would start with an
 *       empty cart and the user would have to re-add every dish. We use
 *       useSyncExternalStore to treat localStorage as the source of
 *       truth — no setState-in-effect, no hydration mismatch, and
 *       cross-tab updates come for free via the `storage` event.
 * IF REMOVED: cart vanishes the moment the user clicks "Continue to
 *       checkout" — they land on /checkout with nothing to check out.
 * COMMON MISTAKE: returning a fresh-object from getSnapshot. React's
 *       useSyncExternalStore caches by reference — if you return a new
 *       JSON.parse() result every call, React loops infinitely. We
 *       memoize on the raw string and only re-parse when it changes.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "sams_cart";
// Same-tab updates do not fire the native `storage` event, so we
// dispatch our own change event on every write. useSyncExternalStore
// listens for both, so cross-tab and same-tab updates both refresh.
const CHANGE_EVENT = "sams_cart_changed";

export interface CartLine {
  id: string;
  qty: number;
}

export interface CartState {
  locationId: string | null;
  lines: CartLine[];
}

interface CartContextValue {
  cart: CartState;
  setLocation: (locationId: string) => void;
  addToCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
}

const EMPTY_CART: CartState = { locationId: null, lines: [] };

const CartContext = createContext<CartContextValue | null>(null);

function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.locationId !== null && typeof v.locationId !== "string") return false;
  if (!Array.isArray(v.lines)) return false;
  return v.lines.every(
    (l) =>
      l &&
      typeof l === "object" &&
      typeof (l as CartLine).id === "string" &&
      typeof (l as CartLine).qty === "number" &&
      (l as CartLine).qty > 0,
  );
}

// Module-level cache. useSyncExternalStore demands that getSnapshot
// return the SAME reference when the underlying data hasn't changed —
// otherwise React detects "snapshot changed" on every render and loops.
// cachedRaw is the last-seen serialized cart; cachedSnapshot is the
// parsed result. We only re-parse when the serialized form changes.
let cachedRaw: string | null = null;
let cachedSnapshot: CartState = EMPTY_CART;

function readSnapshot(): CartState {
  if (typeof window === "undefined") return EMPTY_CART;
  let raw: string;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return EMPTY_CART;
  }
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  if (raw === "") {
    cachedSnapshot = EMPTY_CART;
    return cachedSnapshot;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    cachedSnapshot = isCartState(parsed) ? parsed : EMPTY_CART;
  } catch {
    cachedSnapshot = EMPTY_CART;
  }
  return cachedSnapshot;
}

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}

function getServerSnapshot(): CartState {
  return EMPTY_CART;
}

function writeCart(next: CartState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage full / disabled — the in-memory cache below still updates
    // so this render's mutation isn't lost; only persistence is missed.
    cachedRaw = JSON.stringify(next);
    cachedSnapshot = next;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);

  const setLocation = useCallback((locationId: string) => {
    const current = readSnapshot();
    // Switching to a DIFFERENT location resets the cart — you can't
    // pick up "shrimp from Shreveport" at the Norman counter.
    if (current.locationId !== null && current.locationId !== locationId) {
      writeCart({ locationId, lines: [] });
      return;
    }
    if (current.locationId === locationId) return; // no-op
    writeCart({ ...current, locationId });
  }, []);

  const addToCart = useCallback((id: string) => {
    const current = readSnapshot();
    const existing = current.lines.find((l) => l.id === id);
    const lines = existing
      ? current.lines.map((l) =>
          l.id === id ? { ...l, qty: l.qty + 1 } : l,
        )
      : [...current.lines, { id, qty: 1 }];
    writeCart({ ...current, lines });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    const current = readSnapshot();
    const lines = current.lines
      .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0);
    writeCart({ ...current, lines });
  }, []);

  const removeLine = useCallback((id: string) => {
    const current = readSnapshot();
    writeCart({
      ...current,
      lines: current.lines.filter((l) => l.id !== id),
    });
  }, []);

  const clearCart = useCallback(() => {
    const current = readSnapshot();
    writeCart({ ...current, lines: [] });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({ cart, setLocation, addToCart, changeQty, removeLine, clearCart }),
    [cart, setLocation, addToCart, changeQty, removeLine, clearCart],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (ctx === null) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return ctx;
}
