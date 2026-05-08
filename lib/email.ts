/**
 * WHAT: Resend wrapper with stub-mode fallback. Called by the
 *       /api/contact route handler when a contact form submission
 *       passes validation.
 * WHY:  Two reasons:
 *       1. Local dev shouldn't require a real Resend account. With
 *          RESEND_API_KEY or CONTACT_FORM_FROM_EMAIL empty we log
 *          and return success — the form flow works end-to-end.
 *       2. Demo deploys can ship before the franchise's DNS is
 *          verified. Same fallback covers that gap.
 *       Composing the wrapper here means the route handler never
 *       branches on env vars itself — fewer code paths, easier to
 *       reason about in security review.
 * IF REMOVED: route handler would couple to Resend directly and
 *       crash whenever env vars are absent.
 * COMMON MISTAKE: reading env vars at module load. Read at call
 *       time so tests can mutate process.env between test cases.
 */
import { Resend } from "resend";

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
    console.log("[email:stub-mode]", payload);
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
