/**
 * WHAT: Vertical narrative timeline used on /our-story between the
 *       gas-station-to-fryer section and the seafood-pivot section.
 *       Four milestones (2008 founding / The pivot / First franchise /
 *       Today). Each milestone is a Revealable wrapper so the nodes
 *       fade-up as the user scrolls past them.
 * WHY:  /our-story was a long flat prose column with no structural
 *       waypoint between the founding paragraphs and the rest. The
 *       timeline gives the page a narrative spine — the reader can
 *       see the arc at a glance before reading the prose. Verbal
 *       repetition with the surrounding sections is fine; the timeline
 *       compresses, the prose expands.
 * IF REMOVED: page reads as it did before — less spine, more text-wall.
 *
 * !!! BEFORE LAUNCH !!!
 *   - "First franchise" milestone uses a date-vague label rather than a
 *     specific year because no verified press source pins down the
 *     first franchised location's opening year. Confirm with the
 *     franchise office and add the year if known.
 */
import Revealable from "@/components/Revealable";

interface Milestone {
  era: string;
  title: string;
  body: string;
}

const MILESTONES: ReadonlyArray<Milestone> = [
  {
    era: "2008",
    title: "Shreveport. A closed Taco Bell. A first fryer.",
    body:
      "Sam Gazawaneh, then a gas-station worker in Louisiana, buys a shuttered Taco Bell on the edge of Shreveport. The plan: sell chicken. He doesn't know much about restaurants, and chicken seems simple.",
  },
  {
    era: "The pivot",
    title: "Chicken didn't move. Seafood did.",
    body:
      "Customers keep asking for fish. Sam teaches himself to cook fish, then shrimp, then po' boys, then the comeback sauce. He keeps what works and lets the rest go. Sam's becomes a Cajun-leaning Southern seafood house almost by accident.",
  },
  {
    era: "First franchise",
    title: "One kitchen at a time, expansion begins.",
    body:
      "Operators ask Sam to license the playbook. He says yes, on one condition — he works a full week in the kitchen of every new opening, training the line by feel rather than by manual. The condition still stands.",
  },
  {
    era: "Today",
    title: "41 dining rooms across 11 Southern states.",
    body:
      "Same hand-breaded plates. Same comeback sauce. Same founder still showing up to make sure the catfish is hot and the cornmeal is fresh.",
  },
];

const STAGGER_MS = 90;

export default function StoryTimeline() {
  return (
    <div className="my-16 md:my-24">
      <ol
        aria-label="Sam's Southern Eatery — milestones"
        className="relative border-l-2 border-sams-red/30 pl-8 md:pl-12"
      >
        {MILESTONES.map((m, i) => (
          <li key={m.era} className="relative pb-12 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[42px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-cream bg-sams-red md:-left-[50px]"
            />
            <Revealable delayMs={i * STAGGER_MS}>
              <p className="font-display text-sm uppercase tracking-[0.3em] text-sams-red">
                {m.era}
              </p>
              <p className="mt-2 font-display text-2xl leading-snug md:text-4xl">
                {m.title}
              </p>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {m.body}
              </p>
            </Revealable>
          </li>
        ))}
      </ol>
    </div>
  );
}
