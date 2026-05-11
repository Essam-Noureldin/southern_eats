"use server";

/**
 * WHAT: Server actions for the /admin/[id] edit form. Two actions:
 *       `saveOverrideAction` parses the FormData, validates it, and
 *       upserts the override in lib/location-overrides; `clearOverride
 *       Action` removes the override entirely so the location falls
 *       back to its static hours/phone.
 * WHY:  Server actions run on the server only — the form HTML submits
 *       to them via a POST. Means we don't ship validation code to
 *       the client AND the trust boundary stays inside the server (a
 *       client can't bypass zod by sending a hand-crafted request).
 * IF REMOVED: /admin/[id] would need a custom API route + fetch on
 *       submit — more boilerplate, less type safety.
 * COMMON MISTAKE: putting a synchronous helper in this file. Files
 *       marked `"use server"` require every export to be an async
 *       function. The parser lives in lib/override-form-parser.ts.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LOCATIONS } from "@/lib/locations";
import { setOverride, clearOverride } from "@/lib/location-overrides";
import {
  parseOverrideForm,
  DAYS,
} from "@/lib/override-form-parser";

export type SaveResult = { ok: true } | { ok: false; error: string };

async function knownLocationOr404(id: string): Promise<void> {
  if (!LOCATIONS.some((l) => l.id === id)) {
    redirect("/admin?error=unknown-location");
  }
}

export async function saveOverrideAction(
  id: string,
  formData: FormData,
): Promise<SaveResult> {
  await knownLocationOr404(id);

  const phone = formData.get("phone");
  const days: Record<string, { closed: boolean; open: string; close: string }> = {};
  for (const day of DAYS) {
    days[day] = {
      closed: formData.get(`closed_${day}`) === "on",
      open: String(formData.get(`open_${day}`) ?? ""),
      close: String(formData.get(`close_${day}`) ?? ""),
    };
  }

  const result = parseOverrideForm({ phone, days });
  if (!result.ok) return result;

  await setOverride(id, result.fields);
  revalidatePath("/locations");
  revalidatePath(`/order/${id}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return { ok: true };
}

export async function clearOverrideAction(id: string): Promise<SaveResult> {
  await knownLocationOr404(id);
  await clearOverride(id);
  revalidatePath("/locations");
  revalidatePath(`/order/${id}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return { ok: true };
}
