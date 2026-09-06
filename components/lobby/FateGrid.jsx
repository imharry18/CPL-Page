"use client";

import { useEffect, useRef, useState } from "react";

import FateScene from "@/components/lobby/FateScene";

const SPIN_SECONDS = 10;

/**
 * FateGrid — eight iconic players drawn to eight sides.
 *
 * Four states, and the whole screen is one of them at a time:
 *
 *   ready    two columns, sides on the left and the iconic eight on the right
 *   spin     every card thrown onto two counter-rotating rings, ten seconds
 *            on a countdown in the middle of them
 *   settle   the rings brake, and the pairing that was already decided lands
 *   grid     eight boxes: the side's crest, its name, and who it drew
 *
 * The pairing is decided the instant the spin starts, not when it stops. What
 * the room watches is theatre over a result that already exists — so the
 * animation can never disagree with the draw, however it is interrupted.
 */
export default function FateGrid({ sides, players, admin = false }) {
  const [phase, setPhase] = useState("ready");
  const [count, setCount] = useState(SPIN_SECONDS);
  const [pairs, setPairs] = useState([]);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function draw() {
    if (phase !== "ready") return;

    const deck = [...players];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const chosen = sides.map((side, i) => ({ side, player: deck[i] }));
    setPairs(chosen);

    setPhase("spin");
    setCount(SPIN_SECONDS);

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
    // Long enough for the rings to brake and the cards to snap together.
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
      }, SPIN_SECONDS * 1000 + 2600)
    );
  }

  function again() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPairs([]);
    setCount(SPIN_SECONDS);
    setPhase("ready");
  }

  const spinning = phase === "spin" || phase === "settle";

  return (
    <div className={`fate is-${phase}`}>
      {phase === "grid" ? (
        <>
          <ol className="fate-results">
            {pairs.map(({ side, player }, i) => (
              <li
                className="fate-result"
                key={side.name}
                /* Each box arrives a beat after the one above it, and wears
                   its side's colour. */
                style={{
                  "--i": i,
                  "--team": side.color,
                  "--team-lit": side.colorLit,
                }}
              >
                <span
                  className="fate-crest"
                  style={{ backgroundImage: `url("${side.logo}")` }}
                  aria-hidden="true"
                />
                <span className="fate-said">
                  <b className="fate-team display">{side.name}</b>
                  <span className="fate-drew num">Vice captain</span>
                  <b className="fate-player display">{player.name}</b>
                </span>
              </li>
            ))}
          </ol>

          <button type="button" className="fate-go is-again" onClick={again}>
            Draw again
          </button>
        </>
      ) : (
        <>
          {/* The spectacle is WebGL — sixteen textured planes on two rings.
              The readable result underneath stays DOM, because a grid of
              names is a document, not a scene. */}
          <div className="fate-arena">
            <FateScene
              sides={sides}
              players={players}
              phase={phase}
              pairs={pairs}
            />

            {/* The middle of the rings: the countdown while it runs, the
                trigger before it does. */}
            <div className="fate-core">
              {phase === "ready" ? (
                <button type="button" className="fate-go" onClick={draw}>
                  <span className="fate-go-tag num">Eight draws</span>
                  <span className="fate-go-word display">Believe</span>
                </button>
              ) : (
                <p className="fate-count display" aria-live="off">
                  {phase === "settle" ? "…" : count}
                </p>
              )}
            </div>
          </div>

          <p className="fate-hint num">
            {phase === "ready"
              ? "Eight iconic players. Eight sides. The grid decides."
              : phase === "settle"
                ? "Locking the grid"
                : "Drawing"}
          </p>
        </>
      )}
    </div>
  );
}
