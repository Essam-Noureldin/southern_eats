"use client";

/**
 * WHAT: Client-side contact form. Captures name/email/message,
 *       hidden honeypot field, render timestamp; POSTs JSON to
 *       /api/contact; renders inline status (idle/loading/success/error).
 * WHY:  All security composition lives server-side in /api/contact.
 *       This component's job is just to capture input and send it.
 *       Render timestamp is captured at first mount so the timing
 *       trap on the server can compare it against the submission
 *       time. Honeypot field name is shared via lib/honeypot so it
 *       can't drift.
 * IF REMOVED: no UI for contacting the business.
 * COMMON MISTAKE: capturing renderedAt at submission time. By then
 *       it's "submission time minus zero", defeating the trap.
 *       Capture at first render (useState initialiser) instead.
 */
import { useState } from "react";
import { getHoneypotFieldName } from "@/lib/honeypot";

type Status = "idle" | "loading" | "success" | "error";

const HP_FIELD = getHoneypotFieldName();

export default function ContactForm() {
  // Captured ONCE at mount so the server's timing trap can measure
  // the gap. Reading Date.now() at submit time would make the gap
  // ~0 every time and defeat the check.
  const [renderedAt] = useState<number>(() => Date.now());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hpValue, setHpValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          renderedAt,
          [HP_FIELD]: hpValue,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-card p-8 text-center font-display text-2xl"
      >
        Got it &mdash; thanks for writing.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-10"
      noValidate
    >
      {/* Honeypot — hidden from real users (off-screen + aria-hidden + tabIndex -1).
          Bots that fill every input give themselves away. */}
      <input
        type="text"
        name={HP_FIELD}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        value={hpValue}
        onChange={(e) => setHpValue(e.target.value)}
        className="pointer-events-none absolute -left-[9999px] opacity-0"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-sm font-medium"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            minLength={1}
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={5}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-sams-red px-8 py-3 text-base font-semibold text-cream transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send"}
      </button>

      {status === "error" ? (
        <p role="alert" className="text-sm text-sams-red">
          Something went wrong. Please try again in a moment.
        </p>
      ) : null}
    </form>
  );
}
