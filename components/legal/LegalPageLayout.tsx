/**
 * WHAT: Shared layout for the three legal pages (Privacy, Terms, Cookies).
 *       Renders the title, last-updated date, content, and the
 *       solicitor-review banner.
 * WHY:  Same shape on every legal page. One place to edit branding,
 *       spacing, and the solicitor banner.
 * IF REMOVED: each legal page repeats the same wrapper markup.
 * COMMON MISTAKE: hiding the solicitor banner via CSS so it does not
 *       show on the live site. Don't — it must stay visible until
 *       the real solicitor pass is done, at which point it gets
 *       deleted from the page (not hidden).
 */
import type { ReactNode } from "react";

type Props = {
  title: string;
  lastUpdatedISO: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  title,
  lastUpdatedISO,
  children,
}: Props) {
  const lastUpdated = new Date(lastUpdatedISO).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-charcoal">
      <header className="mb-10 border-b border-charcoal/10 pb-6">
        <h1 className="font-display text-4xl text-sams-red">{title}</h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Last updated: {lastUpdated}
        </p>
      </header>

      <div
        role="alert"
        className="mb-10 rounded border border-butter bg-butter/20 px-5 py-4 text-sm"
      >
        <strong className="font-semibold">Placeholder content.</strong>{" "}
        This page must be reviewed and finalised by a qualified solicitor
        before the site goes to public launch. Contact the developer
        before publishing.
      </div>

      <article className="prose prose-stone max-w-none space-y-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-charcoal [&_h2]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold">
        {children}
      </article>
    </main>
  );
}
