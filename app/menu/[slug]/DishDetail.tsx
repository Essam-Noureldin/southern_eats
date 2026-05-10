import Image from "next/image";
import Link from "next/link";
import { getMenuItem, type DishTag } from "@/lib/menu";

/**
 * WHAT: Renders the dish detail body for /menu/[slug]. Pure component —
 *       takes a slug, looks up the dish, returns null if missing
 *       (the wrapping page is responsible for calling notFound() so
 *       this component is also unit-testable without the App Router).
 * WHY:  Splitting the async params resolution (in page.tsx) from the
 *       sync render body lets us unit-test DishDetail directly without
 *       mocking the Promise that the App Router supplies.
 * IF REMOVED: dish detail page has no body.
 * COMMON MISTAKE: putting the notFound() call here. Server components
 *       can call notFound() too, but doing it here couples the test
 *       to next/navigation's redirect — keep this component pure.
 */
function formatTag(tag: DishTag): string {
  if (tag === "gf") return "GF";
  return tag.replace("-", " ");
}

export default function DishDetail({ slug }: { slug: string }) {
  const item = getMenuItem(slug);
  if (!item) return null;

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-20">
      <Link
        href="/menu"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
      >
        <span aria-hidden="true">&larr;</span>
        Back to menu
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted shadow-xl">
          {/*
           * Same view-transition-name as the matching DishCard image on
           * /menu — the browser morphs from the grid thumbnail to this
           * hero on navigation when document.startViewTransition fires.
           */}
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            style={{ viewTransitionName: `dish-${item.id}` }}
          />
          {item.signature ? (
            <span className="absolute left-4 top-4 rounded-full bg-butter px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal">
              Signature
            </span>
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-sams-red">
            {item.category}
          </p>
          <h1 className="font-display text-5xl leading-tight md:text-6xl">
            {item.name}
          </h1>
          <p className="mt-4 font-display text-3xl text-sams-red">
            ${item.price.toFixed(2)}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          {item.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {formatTag(t)}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/order"
              className="inline-flex items-center justify-center rounded-full bg-sams-red px-6 py-3 font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Order online
            </Link>
            <Link
              href="/locations"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 font-semibold transition-colors hover:bg-card"
            >
              Find a location
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
