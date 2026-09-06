import { tintFor } from "@/lib/matchTints";

/**
 * A round as plates: two slots with a label between them, the same shape the
 * playoff bracket uses.
 *
 * Each entry is { a, b, label?, tone? }. `a` and `b` are side names where the
 * draw is known and placings ("3rd Place") where it is not — anything that is
 * not a side is shown as written. `label` defaults to the match number, which
 * counts on from `startAt` so a round's numbering continues the one before it
 * rather than restarting at one.
 *
 * A numbered match also carries its own colour, so two ties on one screen are
 * never mistaken for each other. A toned pair keeps its green or red instead.
 *
 * `tone` marks a pair that is not a fixture: "in" for sides already through,
 * "out" for sides already gone. Those carry the rise-and-glow / sink-and-dim
 * of the qualified and eliminated bands, and drop the arrow marker, so a pair
 * that is not playing each other never reads as a tie.
 */
export default function RoundPlates({ matches, sides = [], startAt = 1 }) {
  const byName = new Map(sides.map((side) => [side.name, side]));

  return (
    <div className="plates">
      {matches.map((match, i) => {
        const label = match.label ?? `Match ${startAt + i}`;
        const tint = match.tone ? undefined : tintFor(match.no ?? startAt + i);

        return (
          <section
            className={`tie${match.tone ? ` is-${match.tone}` : " is-tinted"}`}
            key={`${match.a}-${match.b}`}
            style={tint}
            aria-label={label}
          >
            <Plate name={match.a} side={byName.get(match.a)} />
            <p className={`tie-name${match.tone ? " is-flat" : ""}`}>{label}</p>
            <Plate name={match.b} side={byName.get(match.b)} />
          </section>
        );
      })}
    </div>
  );
}

function Plate({ name, side }) {
  return (
    <p
      className={`plate${side ? " is-side" : ""}`}
      style={side ? { "--team": side.color, "--team-lit": side.colorLit } : undefined}
    >
      {name}
    </p>
  );
}
