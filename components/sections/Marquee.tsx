/**
 * WHAT: Decorative looping marquee band — display-italic phrases sliding
 *       sideways forever. Pure CSS animation; pauses on hover.
 * WHY:  Diner-blackboard / Southern signage feel. Breaks up two
 *       cream-tone sections with a charcoal strip and reinforces the
 *       brand promise (hand-breaded, fried gold, 51 locations…) without
 *       adding another full section.
 * IF REMOVED: homepage flow loses a visual breather between the story
 *       block and the reviews; everything still works.
 * COMMON MISTAKE: animating with JS / requestAnimationFrame. CSS keyframe
 *       animation runs on the compositor thread — 60fps with zero JS
 *       cost. The loop is seamless because the inner track repeats the
 *       phrase set REPEATS times and translates by exactly -100/REPEATS%.
 */
import { Fragment } from "react";

const PHRASES = [
  "Hand-breaded",
  "Fried gold",
  "41 locations",
  "11 states",
  "Since 2008",
] as const;

// Three copies = seamless loop on any reasonable viewport. The animation
// translates the track by -33.333% (1 / REPEATS) so the second copy ends
// up exactly where the first started — no visible seam.
const REPEATS = 3;

export default function Marquee() {
  return (
    <section
      data-testid="marquee"
      aria-hidden="true"
      className="overflow-hidden border-y border-cream/15 bg-charcoal py-5 md:py-7"
    >
      <div
        data-testid="marquee-track"
        className="flex w-max items-center gap-10 whitespace-nowrap font-display text-2xl italic text-cream animate-marquee hover:[animation-play-state:paused] md:gap-14 md:text-4xl"
      >
        {Array.from({ length: REPEATS }).map((_, copyIndex) => (
          <Fragment key={copyIndex}>
            {PHRASES.map((phrase, i) => (
              <Fragment key={`${copyIndex}-${i}`}>
                <span>{phrase}</span>
                <span aria-hidden="true" className="text-butter/70">
                  &middot;
                </span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
