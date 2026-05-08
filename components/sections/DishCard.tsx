/**
 * WHAT: Single-dish card. Square photo, name, price, description,
 *       optional Signature badge, optional tag pills.
 * WHY:  The unit of repetition for both the homepage carousel and
 *       the future /menu grid. One presentation component, two uses.
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
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 768px) 45vw, (max-width: 1024px) 31vw, 24vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {item.signature ? (
          <span className="absolute left-3 top-3 rounded-full bg-butter px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-charcoal">
            Signature
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-tight">{item.name}</h3>
          <span className="whitespace-nowrap font-display text-lg text-sams-red">
            ${item.price.toFixed(2)}
          </span>
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
