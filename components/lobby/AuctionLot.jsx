"use client";

import { useState } from "react";

const PIP = { Best: 4, Good: 3, Average: 2, Okay: 1 };

/** Rupees, grouped the Indian way — 1,20,000 rather than 120,000. */
const rupees = (value) => `₹${value.toLocaleString("en-IN")}`;

function Skill({ label, value }) {
  const level = PIP[value] || 0;
  return (
    <div className="skill">
      <span className="skill-label">{label}</span>
      <span className="skill-pips" title={value} aria-label={`${label}: ${value}`}>
        {[1, 2, 3, 4].map((step) => (
          <i key={step} className={step <= level ? "on" : undefined} aria-hidden="true" />
        ))}
      </span>
    </div>
  );
}

/**
 * One lot at a time, paged through by the two arrows.
 *
 * The lots are the players who have paid their entry fee — nobody else goes
 * under the hammer — with the photograph and the details they gave on the
 * entry form. `soldPrice` and `team` stay empty until the night itself.
 */
export default function AuctionLot({ lots }) {
  const [index, setIndex] = useState(0);

  if (lots.length === 0) {
    return (
      <p className="finder-empty">
        No lots yet — run scripts/auction-from-players.py.
      </p>
    );
  }

  const step = (by) => setIndex((i) => (i + by + lots.length) % lots.length);
  const lot = lots[index];

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

      {/* Keyed on the lot, so moving to the next one remounts the card and
          the entrance animations run again. Photo and text mount together —
          the lot arrives as one thing, not a name then a face. */}
      <article className="auction-card" key={index}>
        {/* Left: the player's photograph. */}
        <div className="auction-shot">
          {lot.photo ? (
            /* A plain <img>: the folder is gitignored and absent on a fresh
               clone, so these must not go through the build-time optimiser. */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lot.photo} alt={lot.name} className="auction-photo" />
          ) : (
            <>
              <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <circle cx="24" cy="17" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M8 44c0-8.8 7.2-16 16-16s16 7.2 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              <span className="auction-shot-tag num">No photo</span>
            </>
          )}
        </div>

        {/* Right: who they are, what they play, what they start at. */}
        <div className="auction-info">
          <p className="auction-lot num">
            Lot {String(index + 1).padStart(3, "0")}
            <span> / {String(lots.length).padStart(3, "0")}</span>
          </p>

          {/* data-text feeds the two colour-fringed copies the glitch is
              built from — see .auction-name::before / ::after. */}
          <h2 className="auction-name display" data-text={lot.name}>
            {lot.name}
          </h2>

          <p className="auction-type num">
            {lot.role}
            <span> · {lot.year}</span>
            {lot.hostellite && <span> · Hostellite</span>}
            {lot.prefers && <span> · Prefers {lot.prefers.toLowerCase()}</span>}
          </p>

          <div className="auction-skills">
            <Skill label="Bat" value={lot.bat} />
            <Skill label="Bowl" value={lot.bowl} />
            <Skill label="All" value={lot.allround} />
            <div className="skill">
              <span className="skill-label">Rating</span>
              <span className="auction-rating num">{lot.rating} / 12</span>
            </div>
          </div>

          <div className="auction-price">
            <span className="auction-price-label num">
              {lot.soldPrice == null ? "Base price" : "Sold for"}
            </span>
            <b className="auction-price-value num">
              {rupees(lot.soldPrice ?? lot.basePrice)}
            </b>
            {lot.team && <span className="auction-sold num">{lot.team}</span>}
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
