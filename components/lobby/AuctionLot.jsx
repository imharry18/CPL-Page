"use client";

import { useState } from "react";

import { mask } from "@/lib/cipher";

/**
 * One lot at a time, with the pool paged through by the two arrows.
 *
 * Nothing about a player is known before the meet, so every field is masked.
 */
export default function AuctionLot({ total, basePrice }) {
  const [index, setIndex] = useState(0);

  const step = (by) => setIndex((i) => (i + by + total) % total);
  const lot = index + 1;

  return (
    <div className="auction">
      <button
        type="button"
        className="auction-nav"
        onClick={() => step(-1)}
        aria-label="Previous lot"
      >
        <span aria-hidden="true">←</span>
      </button>

      <article className="auction-card">
        {/* Left: the player's photograph. */}
        <div className="auction-shot">
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <circle cx="24" cy="17" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M8 44c0-8.8 7.2-16 16-16s16 7.2 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
          <span className="auction-shot-tag num">No image yet</span>
        </div>

        {/* Right: who they are, what they play, what they start at. */}
        <div className="auction-info">
          <p className="auction-lot num">
            Lot {String(lot).padStart(3, "0")}
            <span> / {String(total).padStart(3, "0")}</span>
          </p>

          <p className="cipher auction-name">{mask(lot, 9)}</p>
          <p className="cipher auction-type">{mask(lot + 4, 6)}</p>

          <div className="auction-price">
            <span className="auction-price-label num">Base price</span>
            <b className="auction-price-value num">{basePrice}</b>
          </div>
        </div>
      </article>

      <button
        type="button"
        className="auction-nav"
        onClick={() => step(1)}
        aria-label="Next lot"
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
