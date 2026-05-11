/**
 * WHAT: POST /api/order — accepts JSON cart submissions from CheckoutForm,
 *       runs the same security stack as /api/contact (honeypot, rate-limit,
 *       sanitize), then validates the cart against the real menu, computes
 *       totals server-side, and dispatches an order email via lib/email.
 *       Returns { ok, orderId, summary } so the client can stash the
 *       summary in sessionStorage before navigating to the confirmation page.
 * WHY:  This endpoint accepts unauthenticated user input that triggers a
 *       transactional email. Same defence layers as the contact form.
 *       Critical difference: we NEVER trust the client's totals — every
 *       price comes from the server-side `menu` import, and subtotal/tax/
 *       total are computed here. Otherwise a tampered request could
 *       submit "100× Family Pack at $0.01 each".
 * IF REMOVED: CheckoutForm has nothing to submit to.
 * COMMON MISTAKE: reading prices from the request body. Always re-look-up
 *       the menu item by id and use its server-side price.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { sanitizeString } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getHoneypotFieldName,
  isHoneypotTriggered,
} from "@/lib/honeypot";
import { sendOrderEmail } from "@/lib/email";
import { LOCATIONS } from "@/lib/locations";
import { menu } from "@/lib/menu";

const HP_FIELD = getHoneypotFieldName();

const TAX_RATE = 0.0825;
const MAX_LINES = 50;
const MAX_QTY_PER_LINE = 50;

const lineSchema = z.object({
  id: z.string().min(1).max(100),
  qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
});

const schema = z
  .object({
    locationId: z.string().min(1).max(100),
    lines: z.array(lineSchema).min(1).max(MAX_LINES),
    name: z.string().min(1).max(200),
    phone: z.string().min(7).max(30),
    pickupTime: z.string().min(1).max(40),
    renderedAt: z.coerce.number().optional(),
    [HP_FIELD]: z.string().optional(),
  })
  .passthrough();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function fail(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

// Phone sanitiser. Allow digits and the common formatting chars; strip
// everything else so we never log/email anything that could carry an
// injection payload. Specific to this route — kept inline rather than
// pulled into lib/sanitize because no other surface needs it yet.
function sanitizePhone(input: string): string {
  return input.replace(/[^\d+\-()\s]/g, "").trim().slice(0, 30);
}

function makeOrderId(): string {
  // Short, URL-safe, unique-enough for a demo. Not crypto-strength; if
  // this ever becomes a real ordering system swap in crypto.randomUUID().
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `ord_${t}_${r}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid request body");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Invalid order data");
  }
  const data = parsed.data as Record<string, unknown> & {
    locationId: string;
    lines: Array<{ id: string; qty: number }>;
    name: string;
    phone: string;
    pickupTime: string;
  };

  // 1. Honeypot — fake success so bots can't probe.
  if (isHoneypotTriggered(data[HP_FIELD])) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 2. Rate limit — same per-IP shape as /api/contact. Different key so
  //    the limits don't share a bucket.
  const ip = clientIp(req);
  const limit = checkRateLimit(`order:${ip}`, {
    max: Number(process.env.RATE_LIMIT_MAX ?? 3),
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 600000),
  });
  if (!limit.allowed) {
    return fail(429, "Too many requests. Try again later.");
  }

  // 3. Location lookup. Must be a known store id.
  const location = LOCATIONS.find((l) => l.id === data.locationId);
  if (!location) {
    return fail(400, "Invalid order data");
  }

  // 4. Cart line validation. Every id must resolve to a priced menu item.
  //    Look up server-side prices — NEVER trust client-supplied prices.
  const resolved = data.lines.map((line) => {
    const item = menu.find((m) => m.id === line.id);
    if (!item || typeof item.price !== "number") return null;
    return {
      id: item.id,
      name: item.name,
      qty: line.qty,
      price: item.price,
      lineTotal: item.price * line.qty,
    };
  });
  if (resolved.some((r) => r === null)) {
    return fail(400, "Invalid order data");
  }
  const lines = resolved as NonNullable<(typeof resolved)[number]>[];

  // 5. Sanitize the customer-supplied strings.
  const cleanName = sanitizeString(data.name, 100);
  const cleanPhone = sanitizePhone(data.phone);
  const cleanPickup = sanitizeString(data.pickupTime, 40);
  if (!cleanName || cleanPhone.length < 7 || !cleanPickup) {
    return fail(400, "Invalid order data");
  }

  // 6. Compute totals server-side.
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // 7. Build the summary we'll return to the client AND email.
  const orderId = makeOrderId();
  const addressStr = `${location.address.street}, ${location.address.city}, ${location.address.state} ${location.address.zip}`;
  const summary = {
    orderId,
    locationName: location.name,
    locationAddress: addressStr,
    customer: { name: cleanName, phone: cleanPhone },
    pickupTime: cleanPickup,
    lines: lines.map((l) => ({
      id: l.id,
      name: l.name,
      qty: l.qty,
      price: l.price,
      lineTotal: Math.round(l.lineTotal * 100) / 100,
    })),
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };

  // 8. Send (or stub).
  const result = await sendOrderEmail({
    orderId,
    locationName: location.name,
    locationAddress: addressStr,
    customer: { name: cleanName, phone: cleanPhone },
    pickupTime: cleanPickup,
    lines: lines.map((l) => ({
      name: l.name,
      qty: l.qty,
      price: l.price,
      lineTotal: l.lineTotal,
    })),
    subtotal,
    tax,
    total,
  });
  if (!result.ok) {
    return fail(500, "Could not place your order. Please try again.");
  }

  return NextResponse.json({ ok: true, orderId, summary }, { status: 200 });
}
