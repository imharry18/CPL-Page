"use client";

import { useEffect, useRef, useState } from "react";

import PlayoffBracket from "@/components/lobby/PlayoffBracket";
import RoundPlates from "@/components/lobby/RoundPlates";
import ThroneRoom from "@/components/lobby/ThroneRoom";

/* Named for what each stage actually does, not for its number:
     Openers  — the eight go in, the draw decides who meets who
     Ladder   — 1v2, 3v4, 5v6, 7v8; every match settles a place
     Cut      — two through, two out, four still fighting
     Last Four — the bracket
     Crown    — the side left standing */
const ROUNDS = ["Openers", "Reckoning", "Last Stand", "Fantastic 4", "Crown"];

/* Round 2 splits the Round 1 table three ways: the top two go straight
   through, the bottom two are out, and the middle four cross over — 3 plays 5,
   4 plays 6 — for the last two places. Nobody knows who fills a slot until
   Round 1 is played, so the placings stand in for the sides. */
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const QUALIFY = [0, 1];
const CROSSOVER = [[2, 4], [3, 5]];
const ELIMINATED = [6, 7];

/* Round 2 pairs the table off in twos — 1v2, 3v4, 5v6, 7v8 — and every match
   decides two places at once: its winner takes the seat matching the match
   number, its loser drops four below. So Match 1 settles 1st and 5th, Match 2
   settles 2nd and 6th, and so on down. */
const PROGRESSION = [0, 1, 2, 3].map((i) => ({
  seeds: [i * 2, i * 2 + 1],
  winner: i,
  loser: i + 4,
}));

/** Fisher–Yates, then take the shuffled sides two at a time. */
function drawPairs(sides) {
  const deck = [...sides];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return Array.from({ length: deck.length / 2 }, (_, i) => ({
    a: deck[i * 2].name,
    b: deck[i * 2 + 1].name,
  }));
}

function Side({ side }) {
  if (!side) {
    return (
      <span className="fx-side is-blank">
        <i className="fx-logo" aria-hidden="true" />
        —
      </span>
    );
  }
  return (
    <span
      className="fx-side"
      style={{ "--team": side.color, "--team-lit": side.colorLit }}
    >
      {/* Painted as a background so a side whose artwork is missing shows its
          own colour rather than a broken-image icon, same as the team cards. */}
      <i
        className="fx-logo"
        style={{ backgroundImage: `url("${side.logo}")` }}
        aria-hidden="true"
      />
      {side.name}
    </span>
  );
}

/**
 * A round where every match settles two places in the next table.
 *
 * The pairing is shown as usual; underneath, an arrow up to the place the
 * winner takes and an arrow down to the place the loser drops to. The chips
 * carry the same rise-and-glow / sink-and-dim as the qualified and eliminated
 * bands, so the two outcomes read without being spelled out.
 */
function ProgressionRound({ after }) {
  return (
    <>
      <p className="fx-hint fx-note num">
        Seeded on the {ROUNDS[after - 1]} points table
      </p>

      <div className="fx-grid">
        {PROGRESSION.map(({ seeds, winner, loser }, i) => (
          <article className="fx is-seeded" key={i}>
            <p className="fx-no num">Match {i + 1}</p>

            <div className="fx-tie">
              <span className="fx-side fx-seed">
                <i className="fx-logo" aria-hidden="true" />
                {ORDINALS[seeds[0]]} Place
              </span>
              <p className="fx-v num">vs</p>
              <span className="fx-side fx-seed">
                <i className="fx-logo" aria-hidden="true" />
                {ORDINALS[seeds[1]]} Place
              </span>
            </div>

            <div className="fx-goes">
              <span className="goes is-in">
                <b aria-hidden="true">↑</b> Winner
                <em>{ORDINALS[winner]}</em>
              </span>
              <span className="goes is-out">
                <b aria-hidden="true">↓</b> Loser
                <em>{ORDINALS[loser]}</em>
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

/**
 * A round seeded off the previous round's points table.
 *
 * Shown in the same plates as the playoff bracket, so the three outcomes read
 * as one board: the top two already through, two crossover ties for the last
 * places, and the bottom two already gone. The two bands that are not fixtures
 * carry a tone rather than an arrow, so nothing looks like a match that is not
 * one.
 */
function SeededRound({ after }) {
  return (
    <>
      <p className="fx-hint fx-note num">
        Seeded on the {ROUNDS[after - 1]} points table
      </p>

      <RoundPlates
        matches={[
          {
            label: "Qualified · Playoffs",
            tone: "in",
            a: `${ORDINALS[QUALIFY[0]]} Place`,
            b: `${ORDINALS[QUALIFY[1]]} Place`,
          },
          /* Numbered on from Round 2, which ends at match 8. */
          ...CROSSOVER.map(([a, b], i) => ({
            no: i + 9,
            label: `Match ${i + 9}`,
            a: `${ORDINALS[a]} Place`,
            b: `${ORDINALS[b]} Place`,
          })),
          {
            label: "Eliminated",
            tone: "out",
            a: `${ORDINALS[ELIMINATED[0]]} Place`,
            b: `${ORDINALS[ELIMINATED[1]]} Place`,
          },
        ]}
      />
    </>
  );
}

export default function MatchBoard({ sides, initial, admin, crownedOn }) {
  const [round, setRound] = useState(0);
  const [matches, setMatches] = useState([]);
  /* For the auction machine the board is "spinning" from the moment the page
     loads and keeps hunting until Stop; "stopping" is the wind-down and
     "stopped" is a made draw. Everyone else starts — and stays — "idle": a
     still grid, no animation, until the visitors' view is designed. */
  /* The board spins for everyone. The draw is the moment of the night, so a
     visitor watching on their own phone sees exactly what is on the screen at
     the front of the room — including the Stop button. */
  const [phase, setPhase] = useState("spinning");
  const byName = new Map(sides.map((side) => [side.name, side]));
  const timers = useRef([]);

  /* The idle loop: a steady fast cycle, running until Stop is pressed. Bound
     to the Round 1 tab as well as the phase — left unbound it re-renders the
     whole board 14 times a second behind every other tab, which restarts the
     CSS animations there on every frame and burns battery for nothing. */
  useEffect(() => {
    if (phase !== "spinning" || round !== 0) return undefined;
    const id = setInterval(() => setMatches(drawPairs(sides)), 70);
    return () => clearInterval(id);
  }, [phase, round, sides]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function stop() {
    if (phase !== "spinning") return;
    setPhase("stopping");

    // The result is decided the moment you press Stop; the wind-down is
    // theatre over it. That way what you watch land is exactly what gets
    // saved — the animation can never disagree with the fixture.
    const final = drawPairs(sides);

    // Each frame waits a little longer than the last, so it reads as a wheel
    // losing momentum rather than a list that simply stops updating.
    let delay = 70;
    let at = 0;
    const frames = [];
    while (delay < 420) {
      at += delay;
      frames.push(at);
      delay *= 1.16;
    }

    timers.current = frames.map((time, i) =>
      setTimeout(() => {
        setMatches(i === frames.length - 1 ? final : drawPairs(sides));
      }, time)
    );

    timers.current.push(
      setTimeout(async () => {
        setPhase("stopped");
        try {
          const response = await fetch("/api/round1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matches: final }),
          });
          if (!response.ok) throw new Error(await response.text());
        } catch (error) {
          console.error("[round1] could not save the draw:", error);
        }
      }, at + 220)
    );
  }

  const slots =
    matches.length > 0 ? matches : Array.from({ length: 4 }, () => ({}));

  return (
    <>
      <div className="rounds" role="tablist" aria-label="Rounds">
        {ROUNDS.map((name, i) => (
          <button
            key={name}
            type="button"
            role="tab"
            className="round-tab display"
            aria-selected={round === i}
            onClick={() => setRound(i)}
          >
            {name}
          </button>
        ))}
      </div>

      {round === 0 ? (
        <>
          <div className="fx-bar">
            {/* Once it has landed the draw is made and written to file, so
                there is nothing left to press — no way to fumble a redraw over
                a fixture people have already seen. */}
            {phase !== "stopped" && (
              <button
                type="button"
                className="shuffle"
                onClick={stop}
                disabled={phase === "stopping"}
              >
                {phase === "spinning" ? "Stop" : "Stopping…"}
              </button>
            )}
            <span className="fx-hint num">
              {phase === "spinning"
                ? "Finding a combination"
                : phase === "stopping"
                  ? "Settling"
                  : "Draw made and saved"}
            </span>
          </div>

          <div
            className={`fx-grid${
              phase === "spinning" || phase === "stopping" ? " is-spinning" : ""
            }`}
          >
            {slots.map((match, i) => {
              const a = byName.get(match.a);
              const b = byName.get(match.b);

              return (
                <article
                  className="fx"
                  key={i}
                  /* Each side's colour is handed to the card so the box itself
                     can carry the tie: their colour at their end, meeting in
                     the middle at the "vs". */
                  style={{
                    "--a": a?.color ?? "transparent",
                    "--b": b?.color ?? "transparent",
                  }}
                >
                  <p className="fx-no num">Match {i + 1}</p>
                  <div className="fx-tie">
                    <Side side={a} />
                    <p className="fx-v num">vs</p>
                    <Side side={b} />
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : round === 1 ? (
        /* Seeded straight off the Round 1 table and numbered on from it —
           Round 1 is matches 1 to 4, so these are 5 to 8. The placings stand
           in for the sides, because who fills them is not known until Round 1
           has been played. */
        <RoundPlates
          startAt={5}
          matches={PROGRESSION.map(({ seeds }) => ({
            a: `${ORDINALS[seeds[0]]} Place`,
            b: `${ORDINALS[seeds[1]]} Place`,
          }))}
        />
      ) : round === 2 ? (
        <SeededRound after={round} />
      ) : round === 3 ? (
        /* The playoff shape does not depend on the league, so it is drawn now
           rather than held back — the plates carry positions until they carry
           sides. */
        <PlayoffBracket />
      ) : (
        <ThroneRoom sides={sides} crownedOn={crownedOn} />
      )}
    </>
  );
}
