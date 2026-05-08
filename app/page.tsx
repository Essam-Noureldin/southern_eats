/**
 * WHAT: Homepage. Composes the homepage section components in the
 *       order the user scrolls them: Hero -> (DishCarousel ->
 *       NumbersBand -> StoryTease -> Reviews -> FranchiseTease) as
 *       each future feature branch lands.
 * WHY:  Pages own their own <main> landmark — RootLayout deliberately
 *       doesn't render one (axe would flag two <main> elements).
 *       Composing sections here keeps each section a self-contained,
 *       independently testable unit.
 * IF REMOVED: route `/` 404s.
 * COMMON MISTAKE: stuffing section markup directly into this file.
 *       Sections live in components/sections/ and are imported here
 *       so they remain testable in isolation.
 */
import Hero from "@/components/sections/Hero";
import DishCarousel from "@/components/sections/DishCarousel";
import NumbersBand from "@/components/sections/NumbersBand";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <DishCarousel />
      <NumbersBand />
    </main>
  );
}
