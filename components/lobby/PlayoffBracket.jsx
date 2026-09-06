import { tintFor } from "@/lib/matchTints";

/**
 * The road to the final.
 *
 * Each tie is two plates with the tie's name between them, and the wires run
 * left to right in the order the ties are played:
 *
 *   1st ─┐                                    ┌──────────▼
 *        QUALIFIER 1 ──┬──────────────────────┘   WINNER Q1
 *   2nd ─┘             │                             FINAL
 *                      ▼   LOSER Q1               WINNER Q2
 *                          QUALIFIER 2 ──────────────▲
 *                          WINNER ELIMINATOR
 *   3rd ─┐                     ▲
 *        ELIMINATOR ───────────┘
 *   4th ─┘
 *
 * The plates carry league positions until the league has been played — the
 * shape of the playoffs is fixed long before the names in it are.
 */
const TIES = [
  { key: "q1", name: "Qualifier 1", no: 11, top: "1st place", bottom: "2nd place" },
  { key: "el", name: "Eliminator", no: 12, top: "3rd place", bottom: "4th place" },
  {
    key: "q2",
    name: "Qualifier 2",
    no: 13,
    top: "Loser Q1",
    bottom: "Winner Eliminator",
  },
  {
    key: "fi",
    name: "Final",
    top: "Winner Q1",
    bottom: "Winner Q2",
    isFinal: true,
  },
];

export default function PlayoffBracket() {
  return (
    <div className="bracket-wrap">
      <p className="bracket-lede">
        Top four after the league. First and second get two chances at the
        final; third and fourth get one.
      </p>

      <div className="bracket">
        {TIES.map((tie) => (
          <section
            /* The final takes no match tint — it keeps the house red, so the
               destination never reads as just another coloured tie. */
            className={`tie tie-${tie.key}${tie.isFinal ? " is-final" : " is-tinted"}`}
            key={tie.key}
            style={tintFor(tie.no)}
            aria-label={tie.name}
          >
            <p className="plate">{tie.top}</p>
            <p className="tie-name">{tie.name}</p>
            <p className="plate">{tie.bottom}</p>
          </section>
        ))}

        {/* Wires are decoration over a structure the plates already state —
            every one of them is hidden from assistive tech, and they are not
            drawn at all once the board stacks. */}
        <span className="wire wire-q1" aria-hidden="true" />
        <span className="wire wire-drop" aria-hidden="true" />
        <span className="wire wire-el" aria-hidden="true" />
        <span className="wire wire-q2" aria-hidden="true" />
      </div>
    </div>
  );
}
