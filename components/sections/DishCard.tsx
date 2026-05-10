/**
 * WHAT: Single-dish card. Square photo (or typographic placeholder when
 *       no photo exists), name, optional price, description, optional
 *       Signature badge, optional tag pills.
 * WHY:  The unit of repetition for both the homepage carousel and the
 *       /menu grid. One presentation component, multiple uses. Items
 *       sourced from the live brand menu don't have prices or photos
 *       yet; rather than fabricate values (memory:
 *       feedback_no_synthetic_data), we render a typographic placeholder
 *       and omit the price line. The card still feels intentional —
 *       Fraunces italic name on cream + sams-red accent — rather than
 *       broken.
 * IF REMOVED: nothing renders for any individual dish.
 * COMMON MISTAKE: rendering raw <img> instead of next/image, or
 *       hardcoding price formatting as a string in the data instead
 *       of a number — breaks every locale switch later.
 */
import Image from "next/image";
import type { MenuItem, DishTag } from "@/lib/menu";

function formatTag(tag: DishTag): string {
  if (tag === "gf") return "GF";
  return tag.replace("-", " ");
}

export default function DishCard({ item }: { item: MenuItem }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.imageUrl ? (
          /*
           * `view-transition-name` is the identity tag the browser uses
           * to morph this image into the same-named image on
           * /menu/[slug] during navigation. The detail-page hero must
           * set the same name. Items without an image don't participate
           * in the morph — that's fine, the detail page also falls back
           * to the typographic hero for them.
           */
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 78vw, (max-width: 768px) 45vw, (max-width: 1024px) 31vw, 24vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ viewTransitionName: `dish-${item.id}` }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full flex-col items-center justify-center bg-cream p-6 text-center"
            style={{ viewTransitionName: `dish-${item.id}` }}
          >
            <span className="font-display text-xs uppercase tracking-[0.3em] text-sams-red">
              Sam&apos;s
            </span>
            <span className="mt-3 font-display text-2xl italic leading-tight text-charcoal md:text-3xl">
              {item.name}
            </span>
            <span className="mt-4 h-px w-10 bg-sams-red/40" />
          </div>
        )}
        {item.signature ? (
          <span className="signature-pulse absolute left-3 top-3 rounded-full bg-butter px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-charcoal shadow-sm">
            Signature
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-tight">{item.name}</h3>
          {typeof item.price === "number" ? (
            <span className="whitespace-nowrap font-display text-lg text-sams-red">
              ${item.price.toFixed(2)}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        {item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                {formatTag(t)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
