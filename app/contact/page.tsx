/**
 * WHAT: /contact page. Eyebrow + headline + ContactForm.
 * WHY:  Gives the contact form a permalink. Linked from the footer
 *       (when the franchise asks us to add a Contact link), wired to
 *       the same /api/contact endpoint.
 * IF REMOVED: contact form has no canonical URL.
 */
import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Drop the Sam's Southern Eatery team a line — questions, catering, partnerships.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Get in touch
      </p>
      <h1 className="mb-3 font-display text-4xl md:text-6xl">
        Say hello.
      </h1>
      <p className="mb-10 text-lg text-muted-foreground">
        Catering, questions, complaints, compliments — we read every note.
      </p>
      <ContactForm />
    </main>
  );
}
