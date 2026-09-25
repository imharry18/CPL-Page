"use client";

import { useEffect, useRef, useState } from "react";

import FateScene from "@/components/lobby/FateScene";

const SPIN_SECONDS = 3;

/* The rings turning, under the countdown. Started by the press that starts the
   draw, so the browser counts it as sound the room asked for and lets it
   play. It runs a little longer than the count, which carries it over the
   brake rather than cutting out the instant the number reaches nought. */
const SPIN_SOUND = "/sounds/fate-spin.mp3";

/* How long the rings take to stop turning, and then how long the cards take to
   find the side they were drawn to. Both are movement the room watches, so
   they are named here and the scene eases across them. */
const BRAKE_MS = 1200;
const LAND_MS = 2000;

/**
 * FateGrid — the pot 1 and pot 2 second years drawn to the second-year sides,
 * the whole grid on one spin: two players to every side, one out of each pot.
 *
 * Five states, and the screen moves through them without a cut:
 *
 *   ready    two columns, sides on the left and the drawn pool on the right
 *   spin     every card thrown onto two counter-rotating rings, a countdown
 *            in the middle of them
 *   settle   the rings brake
 *   land     each side crosses to the player it drew and the pairs take their
 *            places, two sides to a row and each side's two together
 *   grid     the same pairs, resolved into type
 *
 * There is no cut anywhere in that, because there is nothing to cut to. The
 * board used to tear down the whole arena the moment the count ended and swap
 * in a DOM list, so the room saw the rings stop and then a different picture
 * entirely. The result is now the scene: the two cards of a pair fly to the
 * same spot and hand their opacity to a single box standing there — crest on
 * the left, the side and the name it drew up the middle, the player's own face
 * on the right — so two cards become one result in front of the room.
 *
 * The pairing is decided the instant the spin starts, not when it stops. What
 * the room watches is theatre over a result that already exists — so the
 * animation can never disagree with the draw, however it is interrupted.
 */
export default function FateGrid({ sides, players, initial, admin = false }) {
  /* The spins already made. The drawn are written onto their side in the
     roster the moment the grid lands, so the page hands that back here and the
     board opens on the result rather than offering to draw it again. The grid
     runs once a season; what it decided is not a thing to re-roll because
     somebody reloaded the page.

     Pairs are ordered by the pool, not by when they were drawn, so the board
     lays out the same way on a reload as it did live. */
  const settled = (initial ?? [])
    .map(({ side, player }) => ({
      side: sides.find((s) => s.name === side),
      player: players.find((p) => p.name === player),
    }))
    .filter((pair) => pair.side && pair.player);
  // A grid already drawn opens on its result rather than on the trigger.
  const [phase, setPhase] = useState(settled.length ? "grid" : "ready");

  const [count, setCount] = useState(SPIN_SECONDS);
  const [pairs, setPairs] = useState(settled);
  /* The pairs this spin is for, as against ones read back off the roster: the
     scene keeps a settled card standing on the board and sends only these to
     the rings, so a page opened on a finished grid has none. */
  const [active, setActive] = useState([]);
  const timers = useRef([]);
  const spinSound = useRef(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* Built once and kept, rather than made fresh per draw: a new Audio has to
     fetch before it can sound, and the draw should be heard from its first
     frame. Never constructed on the server, where there is no Audio. */
  useEffect(() => {
    const audio = new Audio(SPIN_SOUND);
    audio.preload = "auto";
    spinSound.current = audio;
    return () => audio.pause();
  }, []);

  function hush() {
    const audio = spinSound.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  /* Back to the start, so the trigger is there to press again. FateScene
     already knows how to take this: clearing `pairs` is what tells it to fly
     the result boxes apart and send the cards home to the ready columns (see
     the "redraw" handling in its render loop) — nothing here has to know how
     that animates, only that it is safe to ask for. */
  function again() {
    if (phase !== "grid") return;
    timers.current.forEach(clearTimeout);
    hush();
    setPairs([]);
    setActive([]);
    setPhase("ready");
  }

  function draw() {
    if (phase !== "ready") return;

    /* One spin settles the whole grid: every side takes one player out of
       each pot, and which player is the only part fate decides.

       Drawn pot by pot rather than from one deck, because that is what makes
       it even — a side cannot end up with two out of the same pot, and no
       side can be handed both of the best names. A pot shorter than the
       number of sides leaves the last sides nothing from it, and those
       pairings are dropped rather than made with a blank: reading `.name` off
       one takes the whole screen down in front of the room. */
    const pots = [...new Set(players.map((player) => player.pot))].sort();
    const chosen = pots.flatMap((pot) => {
      const hat = players.filter((player) => player.pot === pot);
      for (let i = hat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [hat[i], hat[j]] = [hat[j], hat[i]];
      }
      return sides
        .map((side, i) => ({ side, player: hat[i] }))
        .filter((pair) => pair.player);
    });
    if (chosen.length === 0) return;

    const all = chosen;
    setPairs(all);
    setActive(all);

    setPhase("spin");
    setCount(SPIN_SECONDS);

    /* From the top every time, so a second draw sounds like the first. The
       browser can still refuse — sound it has no gesture for, a file it could
       not fetch — and the draw is not a thing to hold up over that. */
    const audio = spinSound.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    // The countdown is its own clock so the number on screen is the number of
    // seconds left, not a frame count that drifts.
    for (let s = 1; s <= SPIN_SECONDS; s++) {
      timers.current.push(
        setTimeout(() => setCount(SPIN_SECONDS - s), s * 1000)
      );
    }
    timers.current.push(
      setTimeout(() => setPhase("settle"), SPIN_SECONDS * 1000)
    );
    // The rings have stopped; now the cards cross to their pairs. This is the
    // movement the room is here for, so it gets its own phase and its own time
    // rather than happening behind a cut.
    timers.current.push(
      setTimeout(() => setPhase("land"), SPIN_SECONDS * 1000 + BRAKE_MS)
    );
    // The pairs are standing where they belong. The reading of it fades up
    // over them.
    timers.current.push(
      setTimeout(() => {
        setPhase("grid");
        /* The draw is the allotment: these players are on their side from
           this moment, so it is written as the grid lands rather than
           waiting for anyone to confirm what the room has already seen.

           The whole board goes in one call. The route clears the last draw
           before writing, so a re-draw replaces the grid rather than adding
           to it. */
        if (!admin) return;
        fetch("/api/fategrid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pairs: all.map(({ side, player }) => ({
              side: side.name,
              player: player.name,
            })),
          }),
        }).catch((error) => {
          console.error("[fategrid] could not save the draw:", error);
        });
      }, SPIN_SECONDS * 1000 + BRAKE_MS + LAND_MS)
    );
  }

  return (
    <div className={`fate is-${phase}`}>
      {/* The arena is never torn down. It carries the spin, the landing and
          the result, which is what makes the draw one continuous shot. */}
      <div className="fate-arena">
        <FateScene
          sides={sides}
          players={players}
          phase={phase}
          pairs={pairs}
          active={active}
        />

        {/* The middle of the rings: the countdown while it runs, the trigger
            before it does, and nothing at all once the cards are moving to
            their places — a number over the landing is something else to
            look at. */}
        <div className="fate-core">
          {phase === "ready" && (
            <button type="button" className="fate-go" onClick={draw}>
              <span className="fate-go-tag num">{players.length} draws</span>
              <span className="fate-go-word display">Believe</span>
            </button>
          )}
          {/* Keyed to the number so every tick replays the animation rather
              than the digit quietly swapping — a countdown the room can feel
              coming, not a label that happens to change. */}
          {phase === "spin" && (
            <p className="fate-count display" key={count} aria-live="off">
              {count}
            </p>
          )}
          {/* The count has run out and the rings are stopping. An ellipsis
              said nothing; this is the moment the draw actually exists, so it
              says so. */}
          {phase === "settle" && (
            <p className="fate-count display is-word" aria-live="off">
              Drawn
            </p>
          )}
        </div>

        {/* The result is the scene now — the boxes standing where the
            cards landed, each with its crest, its side, and the face of the
            player it drew. This list is what a screen reader gets, since the
            canvas cannot be read; it is not drawn, so there is nothing to cut
            to and nothing laid over the picture. */}
        {phase === "grid" && (
          <ol className="sr-only">
            {pairs.map(({ side, player }) => (
              <li key={player.name}>
                {side.name} — {player.name}
              </li>
            ))}
          </ol>
        )}
      </div>

      {phase === "grid" && admin ? (
        <button
          type="button"
          className="fate-go is-again num"
          onClick={again}
        >
          Draw again
        </button>
      ) : (
        <p className="fate-hint num">
          {phase === "ready"
            ? "Two to every side — one out of each pot. The grid decides."
            : phase === "settle"
              ? "Locking the grid"
              : phase === "land"
                ? "Taking their places"
                : phase === "grid"
                  ? "Drawn. Two to every side, one out of each pot."
                  : "Drawing"}
        </p>
      )}
    </div>
  );
}
