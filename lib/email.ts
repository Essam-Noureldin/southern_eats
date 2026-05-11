/**
 * WHAT: Resend wrapper with stub-mode fallback. Called by /api/contact
 *       and /api/order route handlers after validation passes.
 * WHY:  Two reasons:
 *       1. Local dev / preview shouldn't require a real Resend account.
 *          With RESEND_API_KEY or CONTACT_FORM_FROM_EMAIL empty we log a
 *          REDACTED breadcrumb and return success so the form works.
 *       2. Demo deploys ship before the franchise's DNS is verified.
 *          Same fallback.
 *       Composing the wrapper here means the route handler never branches
 *       on env vars itself — fewer code paths, easier to reason about in
 *       security review.
 * IF REMOVED: route handlers couple to Resend directly and crash when
 *       env vars are absent.
 * COMMON MISTAKE: reading env vars at module load. Read at call time so
 *       tests can mutate process.env between test cases.
 *
 * A1 hardening (2026-05-11): in production, stub-mode is fatal — we
 *       return ok:false and never log the payload. Reason: a real
 *       production deploy with missing Resend creds was silently logging
 *       customer name/email/phone/message to Vercel Runtime Logs while
 *       returning success to the user. Stub-mode is dev/preview only.
 */
import { Resend } from "resend";

// Redacted log helper. NEVER log a payload's values in production. In
// dev/preview, log only the structural shape (mode + key names) so a
// developer can confirm the flow without leaking customer PII to logs.
function logStubBreadcrumb(label: string, payload: object): void {
  if (process.env.NODE_ENV === "production") return;
  console.log(label, { mode: "stub", payloadKeys: Object.keys(payload) });
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export type SendResult =
  | { ok: true; mode: "stub" }
  | { ok: true; mode: "live"; id?: string }
  | { ok: false; error: string };

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FORM_FROM_EMAIL;
  const to = process.env.CONTACT_FORM_TO_EMAIL;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "Email service not configured" };
    }
    logStubBreadcrumb("[email:stub-mode]", payload);
    return { ok: true, mode: "stub" };
  }
  if (!to) {
    return { ok: false, error: "CONTACT_FORM_TO_EMAIL not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      subject: `[Sam's Southern] Contact form: ${payload.name}`,
      replyTo: payload.email,
      text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    });
    if (result.error) {
      return {
        ok: false,
        error: result.error.message ?? "Resend error",
      };
    }
    return { ok: true, mode: "live", id: result.data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Order email payload. The /api/order route builds this from the
 * server-computed summary (never client-supplied totals) and hands it
 * to sendOrderEmail. Same stub-mode fallback as sendContactEmail.
 */
export interface OrderEmailPayload {
  orderId: string;
  locationName: string;
  locationAddress: string;
  customer: { name: string; phone: string };
  pickupTime: string;
  lines: Array<{ name: string; qty: number; price: number; lineTotal: number }>;
  subtotal: number;
  tax: number;
  total: number;
}

function formatOrderBody(p: OrderEmailPayload): string {
  const lineRows = p.lines
    .map(
      (l) =>
        `  ${l.qty}× ${l.name}  @ $${l.price.toFixed(2)}  = $${l.lineTotal.toFixed(2)}`,
    )
    .join("\n");
  return [
    `New pickup order — ${p.orderId}`,
    "",
    `Location: ${p.locationName}`,
    `Address:  ${p.locationAddress}`,
    `Pickup:   ${p.pickupTime}`,
    "",
    `Customer: ${p.customer.name}`,
    `Phone:    ${p.customer.phone}`,
    "",
    "Items:",
    lineRows,
    "",
    `Subtotal: $${p.subtotal.toFixed(2)}`,
    `Tax:      $${p.tax.toFixed(2)}`,
    `Total:    $${p.total.toFixed(2)}`,
  ].join("\n");
}

export async function sendOrderEmail(
  payload: OrderEmailPayload,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FORM_FROM_EMAIL;
  const to = process.env.CONTACT_FORM_TO_EMAIL;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "Email service not configured" };
    }
    logStubBreadcrumb("[email:stub-mode:order]", payload);
    return { ok: true, mode: "stub" };
  }
  if (!to) {
    return { ok: false, error: "CONTACT_FORM_TO_EMAIL not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      // A5: route Reply to the staff inbox. Order schema doesn't collect
      // a customer email today, so staff replying must reach an internal
      // alias rather than the no-reply Resend sender. Keeps customer phone
      // numbers out of forwarded reply chains.
      replyTo: to,
      subject: `[Sam's Southern] New pickup order — ${payload.locationName}`,
      text: formatOrderBody(payload),
    });
    if (result.error) {
      return {
        ok: false,
        error: result.error.message ?? "Resend error",
      };
    }
    return { ok: true, mode: "live", id: result.data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
