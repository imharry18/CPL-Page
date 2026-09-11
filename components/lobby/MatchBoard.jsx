"use client";

import { useEffect, useRef, useState } from "react";

import PlayoffBracket from "@/components/lobby/PlayoffBracket";
import RoundPlates from "@/components/lobby/RoundPlates";
import ThroneRoom from "@/components/lobby/ThroneRoom";
import { tintFor } from "@/lib/matchTints";

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

/* Round 2 is matches 5 to 8, so the same table read the other way round: every
   place from 1st to 8th, in order, against the match and the result that fills
   it. The four winners take the top half and the four losers the bottom, which
   is the order the next round is seeded in. */
const RECKONING_PLACES = [
  ...PROGRESSION.map(({ winner }, i) => ({ place: winner, no: i + 5, won: true })),
  ...PROGRESSION.map(({ loser }, i) => ({ place: loser, no: i + 5, won: false })),
];

/* The tones a place can carry where it is not one of eight numbered seats:
   gold for the two who are already through, the tech blue for the two who play
   their way in behind them, and the house red for everyone who is out. */
const TONES = {
  gold: { "--tie": "#b08a12", "--tie-lit": "#f4d67a" },
  tech: { "--tie": "#0b7fd4", "--tie-lit": "#46aef7" },
  dead: { "--tie": "#c8102e", "--tie-lit": "#ff5a6e" },
};

/* Round 3 sends four sides on and four home, and unlike the Reckoning it is not
   a table: the top two are already in the Fantastic 4, the crossover winners
   join them, and their losers go out with the bottom two. `tie` is which band
   or match on the left the place comes from, counting down the board. */
const LAST_STAND_PLACES = [
  { key: "q1", tie: 0, up: true, tone: "gold", lead: "1st", text: "Straight through" },
  { key: "q2", tie: 0, up: true, tone: "gold", lead: "2nd", text: "Straight through" },
  { key: "w9", tie: 1, up: true, tone: "tech", lead: "W · 9", text: "Into Fantastic 4" },
  { key: "w10", tie: 2, up: true, tone: "tech", lead: "W · 10", text: "Into Fantastic 4" },
  { key: "l9", tie: 1, up: false, tone: "dead", lead: "L · 9", text: "Eliminated" },
  { key: "l10", tie: 2, up: false, tone: "dead", lead: "L · 10", text: "Eliminated" },
  { key: "e7", tie: 3, up: false, tone: "dead", lead: "7th", text: "Eliminated" },
  { key: "e8", tie: 3, up: false, tone: "dead", lead: "8th", text: "Eliminated" },
];

const RECKONING_PLATES = PROGRESSION.map(({ seeds }) => ({
  a: `${ORDINALS[seeds[0]]} Place`,
  b: `${ORDINALS[seeds[1]]} Place`,
}));

/* The Reckoning read the same way: every place is one row, against the tie that
   settles it. Winners keep the green rise and losers the red sink, and each
   place carries its own match's colour. */
const RECKONING_SEATS = RECKONING_PLACES.map(({ place, no, won }) => ({
  key: `p${place}`,
  tie: no - 5,
  up: won,
  tone: won ? "in" : "out",
  style: tintFor(no),
  lead: ORDINALS[place],
  text: `${won ? "Winner" : "Loser"} · Match ${no}`,
}));

/**
 * A round as two columns: the ties on the left, where they send each side on
 * the right, and a wire between the two.
 *
 * Each place is a plate — cut corner, colour and all — and sits on the same row
 * as a plate on the left, so the two columns read as one board rather than as a
 * board and a list beside it. The rows the plates leave — the label between a
 * tie's two sides, and the gap between ties — are left empty, which is what
 * `gridRow` is counting past.
 *
 * The wires are measured off the board rather than worked out from the row
 * heights, because those are clamps that move with the viewport: whatever the
 * plates end up doing, the lines are drawn between where they actually are.
 *
 * They read the same way as the playoff bracket's: one neutral line leaves a
 * tie at the match label — which already carries the marker the board uses for
 * "this flows on" — and forks at a dot, green for the side going up and red
 * for the one going down. Each arm then runs down its own lane through the
 * gutter and turns in at its place, arrowhead first. The lanes are handed out
 * shortest wire first, so the short hops stay near the ties and the long drops
 * take the outside.
 */
/* How far into the gutter the neutral stem runs before it forks, and the room
   left at the far end for an arrowhead. */
const FORK = 0.2;
const HEAD = 7;

function SplitRound({ head, label, matches, places, startAt }) {
  const board = useRef(null);
  const [wires, setWires] = useState(null);

  useEffect(() => {
    const root = board.current;
    if (!root) return undefined;

    function measure() {
      const ties = [...root.querySelectorAll(".tie")];
      const seats = [...root.querySelectorAll(".seat")];
      if (ties.length !== matches.length || seats.length !== places.length) {
        return;
      }

      const box = root.getBoundingClientRect();

      /* What is left of the screen under the heading and the round tabs. The
         rows are cut from this, so the board fills the page it is on instead
         of stopping short on a tall screen or running off a short one — and
         the page never has to be scrolled to see the round out. Only the space
         above the board decides it, so setting it cannot feed back into it. */
      const page = root.closest("main");
      const below = page ? parseFloat(getComputedStyle(page).paddingBottom) : 0;
      // A few pixels in hand, so rounding on the rows cannot tip the page into
      // a scrollbar over nothing.
      const fill = Math.max(0, Math.round(window.innerHeight - box.top - below - 8));
      if (root.style.getPropertyValue("--fill") !== `${fill}px`) {
        root.style.setProperty("--fill", `${fill}px`);
        return void requestAnimationFrame(measure);
      }

      const ends = places.map((place, i) => {
        const tie = ties[place.tie].getBoundingClientRect();
        const seat = seats[i].getBoundingClientRect();
        return {
          key: place.key,
          up: place.up,
          x1: tie.right - box.left,
          y1: tie.top + tie.height / 2 - box.top,
          x2: seat.left - box.left,
          y2: seat.top + seat.height / 2 - box.top,
        };
      });

      // Shortest first, so a lane is never crossed by a wire that had a
      // straighter way through.
      const order = [...ends].sort(
        (a, b) => Math.abs(a.y2 - a.y1) - Math.abs(b.y2 - b.y1)
      );

      setWires({
        w: box.width,
        h: box.height,
        // One stem to a tie, however many places it settles: both arms fork
        // off the same point, so the split reads as one decision.
        stems: ties.map((node, i) => {
          const tie = node.getBoundingClientRect();
          const x1 = tie.right - box.left;
          return {
            key: `s${i}`,
            x1,
            y: tie.top + tie.height / 2 - box.top,
            fork: x1 + (ends[0].x2 - x1) * FORK,
          };
        }),
        arms: ends.map((end) => {
          const fork = end.x1 + (end.x2 - end.x1) * FORK;
          const tip = end.x2 - HEAD;
          const lane =
            fork + ((tip - fork) * (order.indexOf(end) + 1)) / (ends.length + 1);
          return {
            key: end.key,
            tone: end.up ? "in" : "out",
            d: `M ${fork} ${end.y1} H ${lane} V ${end.y2} H ${tip}`,
            // The head, pointing into the plate the arm lands on.
            head: `${end.x2} ${end.y2} ${tip} ${end.y2 - 3.4} ${tip} ${end.y2 + 3.4}`,
          };
        }),
      });
    }

    /* Measured a frame late, so the rows have settled at their new heights
       before anything is read off them: the plate and gap heights are tied to
       the viewport, so a window that changes size moves both columns and every
       wire has to be drawn again. */
    let frame = 0;
    let settle = 0;
    const remeasure = () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      frame = requestAnimationFrame(measure);
      // And again once the resize has stopped, because a window dragged to a
      // new size arrives in steps and only the last one is the real layout.
      settle = setTimeout(measure, 200);
    };

    measure();
    const watch = new ResizeObserver(remeasure);
    watch.observe(root);
    window.addEventListener("resize", remeasure);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      watch.disconnect();
      window.removeEventListener("resize", remeasure);
    };
  }, [matches, places]);

  return (
    <div className="round-split" ref={board}>
      <RoundPlates startAt={startAt} matches={matches} />

      <aside className="seats" aria-label={label}>
        <p className="seats-head num">{head}</p>
        <ol className="seats-list">
          {places.map(({ key, up, tone, style, lead, text }, i) => (
            <li
              className={`plate seat is-${tone}`}
              key={key}
              style={{ ...(style ?? TONES[tone]), gridRow: i * 2 + 1 }}
            >
              <em className="seat-no">{lead}</em>
              <b aria-hidden="true">{up ? "↑" : "↓"}</b>
              <span className="seat-from num">{text}</span>
            </li>
          ))}
        </ol>
      </aside>

      {wires && (
        <svg
          className="wires"
          viewBox={`0 0 ${wires.w} ${wires.h}`}
          /* The box is measured, so it is already in the board's own pixels;
             letting the viewBox letterbox itself into the element would move
             every wire off its plate the moment the two disagree. */
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {wires.stems.map(({ key, x1, y, fork }) => (
            <g className="wire is-stem" key={key}>
              <path d={`M ${x1} ${y} H ${fork}`} />
              {/* The fork, marked so the split reads as a decision rather than
                  as two lines that happen to touch. */}
              <circle cx={fork} cy={y} r="2.8" />
            </g>
          ))}

          {wires.arms.map(({ key, tone, d, head }) => (
            <g className={`wire is-${tone}`} key={key}>
              <path d={d} />
              <polygon points={head} />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

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
        ?
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
const LAST_STAND_PLATES = [
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
];

function SeededRound({ after }) {
  return (
    <>
      <p className="fx-hint fx-note num">
        Seeded on the {ROUNDS[after - 1]} points table
      </p>

      <SplitRound
        head="After the Last Stand"
        label="Where the Last Stand leaves each side"
        matches={LAST_STAND_PLATES}
        places={LAST_STAND_PLACES}
      />
    </>
  );
}

export default function MatchBoard({ sides, initial, admin, crownedOn }) {
  /* The draw that has actually been made, if one has. Every board starts here
     rather than spinning from nothing: the fixture belongs to the night, not
     to whoever happens to have the page open, and a phone opened after the
     draw must show the same four ties as the screen at the front of the room. */
  const saved =
    initial?.drawn && initial.matches?.length === sides.length / 2
      ? initial.matches
      : null;

  const [round, setRound] = useState(0);
  const [matches, setMatches] = useState(saved ?? []);
  // Whether what is on screen is the real draw rather than the spin.
  const [official, setOfficial] = useState(Boolean(saved));
  /* "ready" is eight question marks and nothing moving: until the draw is
     made there is no fixture, and a board hunting through combinations nobody
     will play reads as a result that keeps changing its mind. "stopping" is
     the wind-down the room watches, "stopped" is a made draw — and a made draw
     is written to file, so it is what every board opens on from then until the
     season is restarted. */
  const [phase, setPhase] = useState(saved ? "stopped" : "ready");
  const byName = new Map(sides.map((side) => [side.name, side]));
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /**
   * Bring the wheel to rest on `final`.
   *
   * The result is decided before the wind-down starts; the slowing is theatre
   * over a fixture that already exists, so what you watch land is exactly what
   * gets saved and the animation can never disagree with the draw.
   */
  function settle(final, save) {
    timers.current.forEach(clearTimeout);
    setPhase("stopping");

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
        if (!save) {
          setOfficial(true);
          return;
        }
        try {
          const response = await fetch("/api/round1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matches: final }),
          });
          if (!response.ok) throw new Error(await response.text());
          setOfficial(true);
        } catch (error) {
          console.error("[round1] could not save the draw:", error);
        }
      }, at + 220)
    );
  }

  function draw() {
    if (phase !== "ready") return;
    settle(drawPairs(sides), true);
  }

  /* Everyone else's board follows the draw rather than inventing one.
     Only the auction machine can save a fixture, so a visitor pressing Stop
     was landing on four ties of their own that nobody else could see. This
     watches for the real draw and settles onto it the moment it exists —
     whether this board is still spinning or has already stopped on a guess. */
  useEffect(() => {
    if (admin || official) return undefined;

    const id = setInterval(async () => {
      try {
        const response = await fetch("/api/round1", { cache: "no-store" });
        if (!response.ok) return;
        const draw = await response.json();
        if (!draw.drawn || draw.matches?.length !== sides.length / 2) return;
        clearInterval(id);
        settle(draw.matches, false);
      } catch {
        // The draw is not made yet, or the machine is between saves. Keep
        // spinning and ask again — a board that gives up here is a board
        // showing the wrong fixture for the rest of the night.
      }
    }, 2000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, official, sides]);

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
            {phase === "ready" && admin && (
              <button type="button" className="shuffle" onClick={draw}>
                Draw the Openers
              </button>
            )}

            <span className="fx-hint num">
              {phase === "ready"
                ? admin
                  ? "Eight sides, four ties"
                  : "Waiting for the draw"
                : phase === "stopping"
                  ? "Finding a combination"
                  : official
                    ? "Draw made and saved"
                    : "Waiting for the draw"}
            </span>
          </div>

          <div
            className={`fx-grid${phase === "stopping" ? " is-spinning" : ""}`}
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
        <SplitRound
          head="After the Reckoning"
          label="Where the Reckoning leaves each place"
          startAt={5}
          matches={RECKONING_PLATES}
          places={RECKONING_SEATS}
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
