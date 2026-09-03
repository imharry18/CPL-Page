"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The opening title sequence.
 *
 * Two counters roll up to the total runs scored in the league's history —
 * 49 and 89 reading together as 4,989 — with a line of text between them and
 * a seam that draws itself across as they climb. Then the whole panel lifts
 * away and the page is underneath, already rendered.
 *
 * Two rules it follows:
 *
 * 1. The counters are written straight to the DOM inside one animation frame
 *    loop, not through React state. Sixty state updates a second to animate a
 *    number is how an intro ends up stuttering on the machines it is meant to
 *    impress.
 *
 * 2. It never blocks the content. The page is fully server-rendered behind
 *    this panel, so search engines and anyone without JavaScript get
 *    everything; the panel is only ever a layer on top.
 */

const COUNT_MS = 1400;
const HOLD_MS = 260;
const WIPE_MS = 900;

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export default function Intro({ total }) {
  const [gone, setGone] = useState(false);

  const rootRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const seamRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.dataset.intro = "running";
    document.body.style.overflow = "hidden";

    let raf = 0;
    const timers = [];

    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      root.classList.add("is-out");
      timers.push(
        setTimeout(() => {
          document.documentElement.removeAttribute("data-intro");
          document.body.style.overflow = "";
          // Let the reveals and the hero headline start now, rather than
          // playing to nobody behind the curtain.
          window.dispatchEvent(new Event("intro:done"));
          setGone(true);
        }, WIPE_MS)
      );
    }

    // requestAnimationFrame is paused while a tab is in the background, so a
    // title sequence started there would still be sitting on screen when the
    // visitor finally looks. Skip straight to the end instead.
    if (reduceMotion || document.visibilityState === "hidden") {
      finish();
      return () => {
        timers.forEach(clearTimeout);
        document.documentElement.removeAttribute("data-intro");
        document.body.style.overflow = "";
      };
    }

    // Last line of defence: whatever happens to the frame loop, the panel
    // leaves. Nothing about the page's readability may depend on an animation
    // completing.
    timers.push(setTimeout(finish, COUNT_MS + HOLD_MS + 1200));

    const left = Math.floor(total / 100);
    const right = total % 100;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = easeOut(t);
      if (leftRef.current) {
        leftRef.current.textContent = String(Math.round(left * eased)).padStart(2, "0");
      }
      if (rightRef.current) {
        rightRef.current.textContent = String(Math.round(right * eased)).padStart(2, "0");
      }
      if (seamRef.current) {
        seamRef.current.style.transform = `scaleX(${eased.toFixed(4)})`;
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timers.push(
          setTimeout(() => {
            if (textRef.current) textRef.current.classList.add("is-swapped");
            timers.push(setTimeout(finish, 420));
          }, HOLD_MS)
        );
      }
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.documentElement.removeAttribute("data-intro");
      document.body.style.overflow = "";
    };
  }, [total]);

  if (gone) return null;

  return (
    <div className="intro" ref={rootRef} aria-hidden="true">
      <p className="intro-brand">Campus Premier League</p>

      <div className="intro-core">
        <span className="intro-num" ref={leftRef}>
          00
        </span>

        <span className="intro-mid">
          <span className="intro-text" ref={textRef}>
            <b>Every run since 2025</b>
            <i>Season four starts now</i>
          </span>
          <span className="intro-seam">
            <i ref={seamRef} />
          </span>
        </span>

        <span className="intro-num" ref={rightRef}>
          00
        </span>
      </div>

      <p className="intro-foot">Season 04</p>
    </div>
  );
}
