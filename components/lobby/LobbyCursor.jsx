"use client";

import { useEffect, useRef } from "react";

/**
 * The lobby's cursor: a reticle rather than an arrow.
 *
 * Two parts, moving at different speeds, which is the whole trick. A dot that
 * sits exactly under the pointer so clicking still feels precise, and a ring
 * that chases it a few frames behind so the hand has weight. The ring opens
 * and turns on anything you can press, and closes as you press it.
 *
 * Where it takes its colour from is the point of doing this at all: on the
 * auction board a side's colour is already washing the screen, and the reticle
 * reads that off whatever is under the pointer. Hovering a side in the rail
 * turns the cursor that side's colour.
 *
 * Rules it has to obey:
 *
 *   - Never gets in the way. `pointer-events: none` on both parts, always.
 *   - Never on touch. A finger has no hover, so there is nothing to follow and
 *     the native cursor is not in the way in the first place.
 *   - Never costs the auction a frame. One rAF, two transforms, no layout
 *     read per frame — the position comes off the last mouse event.
 *   - Gives up gracefully. If reduced motion is asked for, the ring stops
 *     trailing and simply sits on the dot.
 */

// How much of the remaining distance the ring closes each frame. Low enough to
// read as weight, high enough that it is never left behind on a fast flick.
const CHASE = 0.18;

const PRESSABLE = 'a,button,[role="button"],input,select,textarea,summary,label';

export default function LobbyCursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    // A finger has no pointer to follow, and a stylus has no hover state.
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dotEl = dot.current;
    const ringEl = ring.current;
    if (!dotEl || !ringEl) return undefined;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let shown = false;
    let frame;

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;

      if (!shown) {
        shown = true;
        document.body.classList.add("has-reticle");
      }

      /* What is under the pointer decides how the reticle looks. Read from the
         event's own target rather than by hit-testing the document, which
         would be a layout read on every mouse move. */
      const target = event.target;
      const hot = target?.closest?.(PRESSABLE);
      ringEl.classList.toggle("is-hot", Boolean(hot));

      /* A side's colour, if the thing under the pointer has one. Every card
         that carries a team sets --team on itself, so this needs no map of
         the eight and cannot fall out of step with them. */
      const themed = target?.closest?.("[style*='--team']");
      const colour = themed
        ? getComputedStyle(themed).getPropertyValue("--team-lit").trim()
        : "";
      ringEl.style.setProperty("--reticle", colour || "");
      dotEl.style.setProperty("--reticle", colour || "");
    };

    const onLeave = () => {
      shown = false;
      document.body.classList.remove("has-reticle");
    };
    const onDown = () => ringEl.classList.add("is-down");
    const onUp = () => ringEl.classList.remove("is-down");

    const draw = () => {
      // The ring closes a fraction of the gap each frame; the dot is exact.
      rx += (x - rx) * (still ? 1 : CHASE);
      ry += (y - ry) * (still ? 1 : CHASE);
      dotEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ringEl.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("has-reticle");
    };
  }, []);

  return (
    <>
      <span className="reticle-dot" ref={dot} aria-hidden="true" />
      {/* Two elements, and the split is load-bearing. The outer one is moved
          by this component and does nothing else; the inner one is turned and
          opened by the stylesheet and never moves.

          They cannot be the same element. CSS applies the `rotate` property
          after the `transform` property, so a rotate on the thing carrying the
          translate spins the whole coordinate system: the reticle orbited the
          top-left corner of the screen instead of turning on the spot. */}
      <span className="reticle" ref={ring} aria-hidden="true">
        <span className="reticle-ring">
          {/* Four ticks rather than a closed ring: a solid circle reads as a
              loading spinner, and a broken one reads as a sight. */}
          <i className="reticle-tick" />
          <i className="reticle-tick" />
          <i className="reticle-tick" />
          <i className="reticle-tick" />
        </span>
      </span>
    </>
  );
}
