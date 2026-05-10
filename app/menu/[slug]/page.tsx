import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DishDetail from "./DishDetail";
import { getMenuItem, menu } from "@/lib/menu";

/**
 * WHAT: /menu/[slug] page — resolves the route param, returns 404 if
 *       the dish doesn't exist, otherwise hands off to DishDetail for
 *       the rendered body.
 * WHY:  Next 15+ passes params as a Promise and route metadata is
 *       generated per-slug. Splitting the async resolution from the
 *       render body keeps DishDetail unit-testable without mocking
 *       Promises (see tests/smoke/menu-detail-page.test.tsx).
 * IF REMOVED: /menu/[slug] 404s for every dish.
 * COMMON MISTAKE: forgetting to await `params` — you'll get a runtime
 *       warning ("Route used `params.slug`. `params` should be awaited
 *       before using its properties.") plus a `[object Promise]` slug.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return menu.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getMenuItem(slug);
  if (!item) return { title: "Dish not found" };
  return {
    title: item.name,
    description: item.description,
  };
}

export default async function DishPage({ params }: PageProps) {
  const { slug } = await params;
  if (!getMenuItem(slug)) notFound();
  return (
    <main>
      <DishDetail slug={slug} />
    </main>
  );
}
