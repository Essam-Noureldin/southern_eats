"use client";

/**
 * WHAT: Client form for editing one location's override. Two submit
 *       paths: "Save changes" calls saveOverrideAction with the form
 *       data; "Reset to default" calls clearOverrideAction (no data).
 * WHY:  useActionState handles the submit lifecycle and surfaces the
 *       server's ok/error result without a manual fetch. Form fields
 *       are uncontrolled (defaultValue) — the server is the source of
 *       truth on save, not React state.
 * IF REMOVED: /admin/[id] has no editor.
 * COMMON MISTAKE: making fields fully controlled with useState. Adds
 *       re-render churn for no gain when the server holds canonical
 *       state.
 */
import { useActionState, useState } from "react";
import {
  saveOverrideAction,
  clearOverrideAction,
  type SaveResult,
} from "@/app/admin/actions";
import type { Hours } from "@/lib/locations";

interface DayInitial {
  day: Hours["day"];
  closed: boolean;
  open: string;
  close: string;
}

interface Props {
  locationId: string;
  initialPhone: string;
  initialDays: DayInitial[];
  hasOverride: boolean;
}

export default function LocationOverrideForm({
  locationId,
  initialPhone,
  initialDays,
  hasOverride,
}: Props) {
  const [saveState, saveFormAction, savePending] = useActionState<
    SaveResult | null,
    FormData
  >(async (_prev, formData) => saveOverrideAction(locationId, formData), null);

  const [clearState, clearFormAction, clearPending] = useActionState<
    SaveResult | null,
    FormData
  >(async () => clearOverrideAction(locationId), null);

  // Local closed-state for each day so the open/close inputs disable
  // when the row is marked closed — purely a UX nicety, not a data
  // dependency (the server reads closed_<day> directly).
  const [closedMap, setClosedMap] = useState<Record<string, boolean>>(
    Object.fromEntries(initialDays.map((d) => [d.day, d.closed])),
  );

  const result = saveState ?? clearState;

  return (
    <div className="space-y-8">
      <form
        action={saveFormAction}
        className="space-y-6 rounded-2xl border border-border bg-card p-6"
        aria-labelledby="override-form-heading"
      >
        <h2
          id="override-form-heading"
          className="font-display text-xl text-charcoal"
        >
          Hours and phone
        </h2>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-charcoal"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={initialPhone}
            maxLength={40}
            className="mt-1 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sams-red/40"
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-charcoal">
            Opening hours (24-hour, HH:MM)
          </legend>
          {initialDays.map((d) => (
            <div
              key={d.day}
              className="grid grid-cols-[60px_auto_1fr_1fr] items-center gap-3 text-sm"
            >
              <span className="font-medium text-charcoal">{d.day}</span>
              <label className="flex items-center gap-1.5 text-charcoal/80">
                <input
                  type="checkbox"
                  name={`closed_${d.day}`}
                  defaultChecked={d.closed}
                  onChange={(e) =>
                    setClosedMap((m) => ({ ...m, [d.day]: e.target.checked }))
                  }
                  aria-label={`${d.day} closed`}
                />
                Closed
              </label>
              <input
                type="text"
                name={`open_${d.day}`}
                defaultValue={d.open}
                pattern="([01]\d|2[0-4]):[0-5]\d"
                placeholder="10:00"
                aria-label={`${d.day} open time`}
                disabled={closedMap[d.day]}
                className="rounded-md border border-border bg-cream px-2 py-1 disabled:opacity-50"
              />
              <input
                type="text"
                name={`close_${d.day}`}
                defaultValue={d.close}
                pattern="([01]\d|2[0-4]):[0-5]\d"
                placeholder="21:00"
                aria-label={`${d.day} close time`}
                disabled={closedMap[d.day]}
                className="rounded-md border border-border bg-cream px-2 py-1 disabled:opacity-50"
              />
            </div>
          ))}
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={savePending}
            className="rounded-full bg-sams-red px-5 py-2 text-sm font-semibold text-cream hover:bg-sams-red/90 disabled:opacity-60"
          >
            {savePending ? "Saving…" : "Save changes"}
          </button>
        </div>

        {result?.ok === true ? (
          <p
            role="status"
            className="text-sm font-medium text-emerald-700"
            aria-live="polite"
          >
            Saved. Public pages have been revalidated.
          </p>
        ) : null}
        {result && result.ok === false ? (
          <p role="alert" className="text-sm font-medium text-sams-red">
            {result.error}
          </p>
        ) : null}
      </form>

      {hasOverride ? (
        <form
          action={clearFormAction}
          className="rounded-2xl border border-border bg-cream p-6"
        >
          <h2 className="font-display text-xl text-charcoal">
            Reset to default
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Removes the override entirely. The location reverts to the
            phone and hours shipped in the code.
          </p>
          <button
            type="submit"
            disabled={clearPending}
            className="mt-4 rounded-full border border-sams-red px-5 py-2 text-sm font-semibold text-sams-red hover:bg-sams-red hover:text-cream disabled:opacity-60"
          >
            {clearPending ? "Clearing…" : "Reset to default"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
