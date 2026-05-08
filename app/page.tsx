/**
 * WHAT: Homepage placeholder. Real composition (Hero → DishCarousel →
 *       NumbersBand → StoryTease → Reviews → FranchiseTease) lands
 *       branch-by-branch starting with feature-hero.
 * WHY:  Bootstrap branch ships a working app you can `npm run dev` on,
 *       without committing to homepage layout decisions yet.
 * IF REMOVED: route `/` 404s.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
        Sam&apos;s Southern Eatery
      </p>
      <h1 className="font-display text-5xl md:text-7xl text-primary">
        Home of the jumbo shrimp.
      </h1>
      <p className="mt-6 max-w-xl text-muted-foreground">
        Site under construction. Bootstrap complete — sections land branch by branch.
      </p>
    </main>
  );
}
