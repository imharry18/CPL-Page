"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Text that resolves rather than appears.
 *
 * Every figure on this board changes while the room is watching it, and a
 * number that simply swaps is a number somebody missed. Running the characters
 * before they settle does two things: it says *this just changed*, and it holds
 * the eye on the thing that changed for the third of a second it takes to land.
 *
 * Used on the name of the lot, on the price as it climbs, and on a side's purse
 * as it is spent.
 *
 * Two rules keep it from becoming noise:
 *
 *   - It runs on a change of text, never on a re-render. A raise redraws the
 *     whole board and only the figure that actually moved should scramble.
 *   - It is short. During a fast raise the price must be readable before the
 *     next bid lands, so this finishes well inside the time between presses.
 *
 * Layout never moves: the width is held by the final string from the first
 * frame, because the scramble is the same length as the text it resolves to.
 */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

// Kept out of the scramble so a figure still reads as a figure while it runs,
// and a name keeps its shape.
const FIXED = new Set([" ", "·", ".", ",", "-", "—", "/", "₹", "'", "’"]);

export default function Decode({
  text = "",
  className,
  // Money scrambles through digits alone; a name through letters. A price
  // rolling through letters reads as a fault rather than as a machine working.
  digits = false,
  duration = 460,
  as: Tag = "span",
  ...rest
}) {
  const [shown, setShown] = useState(text);
  const [prev, setPrev] = useState(text);
  const frame = useRef(null);

  /* Snapped to the new text during the render that brings it, not afterwards
     in an effect. Waiting for the effect would show the previous name for a
     frame first — and on a board where the whole point is that a change is
     noticed, a frame of the wrong name is the one thing to avoid. It also
     means a screen with reduced motion is simply correct, with nothing to
     undo. */
  if (prev !== text) {
    setPrev(text);
    setShown(text);
  }

  useEffect(() => {
    // A board that has asked for less motion gets the answer, not the working.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const pool = digits ? DIGITS : LETTERS;
    const chars = [...text];
    const start = performance.now();

    const tick = () => {
      const progress = Math.min((performance.now() - start) / duration, 1);

      /* Left to right, because that is the direction the eye is already
         travelling. Everything past the front is still running. */
      const settled = Math.floor(progress * chars.length);

      setShown(
        chars
          .map((char, i) => {
            if (i < settled || FIXED.has(char)) return char;
            /* In a figure only the numerals move. Letting "Cr" roll through
               digits turned "₹99.8 Cr" into "₹99.8 88" halfway, which reads as
               a broken number rather than as one being counted. */
            if (digits && !/[0-9]/.test(char)) return char;
            const glyph = pool[Math.floor(Math.random() * pool.length)];
            // A scrambling letter takes the case of the letter it will become,
            // so the word keeps its silhouette while it resolves.
            return char === char.toLowerCase() && !digits
              ? glyph.toLowerCase()
              : glyph;
          })
          .join("")
      );

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setShown(text);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [text, digits, duration]);

  return (
    <Tag className={className} {...rest}>
      {shown}
    </Tag>
  );
}
