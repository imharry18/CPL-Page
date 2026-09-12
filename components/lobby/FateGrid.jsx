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
 * FateGrid — eight iconic players drawn to eight sides.
 *
 * Five states, and the screen moves through them without a cut:
 *
 *   ready    two columns, sides on the left and the iconic eight on the right
 *   spin     every card thrown onto two counter-rotating rings, a countdown
 *            in the middle of them
 *   settle   the rings brake
 *   land     each side crosses to the player it drew and the pairs take their
 *            places, eight cards holding in two columns of four
 *   grid     the same eight pairs, resolved into type
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
  /* A draw already made. The eight are written into the roster as their side's
     vice captain the moment the grid lands, so the page hands that back here
     and the board opens on the result rather than offering to draw it again.
     The grid runs once a season; what it decided is not a thing to re-roll
     because somebody reloaded the page. */
  const settled = (initial ?? [])
    .map(({ side, player }) => ({
      side: sides.find((s) => s.name === side),
      player: players.find((p) => p.name === player),
    }))
    .filter((pair) => pair.side && pair.player);
  const done = settled.length > 0 && settled.length === Math.min(sides.length, players.length);

  const [phase, setPhase] = useState(done ? "grid" : "ready");
  const [count, setCount] = useState(SPIN_SECONDS);
  const [pairs, setPairs] = useState(done ? settled : []);
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
    setPhase("ready");
  }

  function draw() {
    if (phase !== "ready") return;

    const deck = [...players];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    /* Fewer players than sides means the last sides draw nothing. The page
       drops an iconic name that no longer matches the roster, so this is one
       typo in season4Iconic.js away — and reading `.name` off a blank pairing
       takes the whole screen down in front of the room. Better a short grid. */
    const chosen = sides
      .map((side, i) => ({ side, player: deck[i] }))
      .filter((pair) => pair.player);
    setPairs(chosen);

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
        // The draw is the allotment: these eight are their side's vice captain
        // from this moment, so it is written as the grid lands rather than
        // waiting for anyone to confirm what the room has already seen.
        if (!admin) return;
        fetch("/api/fategrid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pairs: chosen.map(({ side, player }) => ({
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
        />

        {/* The middle of the rings: the countdown while it runs, the trigger
            before it does, and nothing at all once the cards are moving to
            their places — a number over the landing is something else to
            look at. */}
        <div className="fate-core">
          {phase === "ready" && (
            <button type="button" className="fate-go" onClick={draw}>
              <span className="fate-go-tag num">Eight draws</span>
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
          {/* The middle is clear again once the pairs have taken their places
              at the sides — the same spot the trigger stood in before the
              draw, now standing empty unless the machine running it wants to
              run it again. Gated to admin: landing here overwrites the eight
              names already written into the roster, the same commit the
              console itself makes. */}
          {phase === "grid" && admin && (
            <button
              type="button"
              className="fate-go is-again num"
              onClick={again}
            >
              Draw again
            </button>
          )}
        </div>

        {/* The result is the scene now — eight boxes standing where the
            cards landed, each with its crest, its side, and the face of the
            player it drew. This list is what a screen reader gets, since the
            canvas cannot be read; it is not drawn, so there is nothing to cut
            to and nothing laid over the picture. */}
        {phase === "grid" && (
          <ol className="sr-only">
            {pairs.map(({ side, player }) => (
              <li key={side.name}>
                {side.name} — vice captain {player.name}
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="fate-hint num">
        {phase === "ready"
          ? "Eight iconic players. Eight sides. The grid decides."
          : phase === "settle"
            ? "Locking the grid"
            : phase === "land"
              ? "Taking their places"
              : phase === "grid"
                ? "Drawn. Every one of them is their side's vice captain."
                : "Drawing"}
      </p>
    </div>
  );
}
