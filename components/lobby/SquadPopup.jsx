"use client";

import { useEffect, useRef } from "react";

import { SQUAD_MAX, money } from "@/lib/auctionMoney";

/**
 * One side's squad, as a team photograph rather than a list.
 *
 * Ten places on the grass, and the side fills them as the night goes on: a
 * silhouette and a name where someone has been won, an empty shirt and a
 * question mark where nobody has. The point of drawing it this way is that the
 * gaps are the information — a captain looking at this should see at a glance
 * how many places he still has to fill and how much he has left to fill them
 * with, which a list of the players he already owns does not tell him.
 *
 * Deliberately no photographs. Not every player has one, and a lineup where
 * some faces are portraits and the rest are placeholders looks broken; eleven
 * identical silhouettes look like a team sheet.
 *
 * Themed with the side's own two colours, passed down as custom properties so
 * the stylesheet never has to know the eight sides exist.
 */

/** A standing figure. One shape, drawn once, used ten times. */
function Figure() {
  return (
    <svg className="peg-body" viewBox="0 0 40 74" aria-hidden="true">
      {/* Head, then shoulders falling into a torso, then two legs. Kept as one
          filled path so it reads as a shape at any size rather than as an
          illustration that falls apart when it is small. */}
      <circle cx="20" cy="9" r="7.4" />
      <path d="M20 18.5c-7.2 0-12.4 4.3-13.4 11L4.4 43.2c-.3 2 1.1 3.6 3 3.6h1.5l1.2 22.6c.1 2 1.7 3.5 3.6 3.5s3.5-1.5 3.6-3.5l1-18.6h2.4l1 18.6c.1 2 1.7 3.5 3.6 3.5s3.5-1.5 3.6-3.5l1.2-22.6h1.5c1.9 0 3.3-1.6 3-3.6l-2.2-13.7c-1-6.7-6.2-11-13.4-11Z" />
    </svg>
  );
}

export default function SquadPopup({ side, players, paid = {}, onClose }) {
  const panel = useRef(null);

  // Escape closes, and focus moves into the panel so the keyboard is not left
  // behind on the card underneath.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const squad = players.filter((player) => player.team === side.name);

  /* Ten places, in the order a side is built: the captain first because he was
     there before the auction, then the vice captain the grid drew him, then
     everyone bought, in the order they were bought. The rest stand empty. */
  const ranked = [...squad].sort((a, b) => {
    const rank = (p) => {
      const first = p.name.split(" ")[0].toLowerCase();
      if (side.captain && first === side.captain.toLowerCase()) return 0;
      if (p.viceCaptain) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });

  const places = Array.from({ length: SQUAD_MAX }, (_, i) => ranked[i] ?? null);
  const short = SQUAD_MAX - squad.length;

  function roleOf(player) {
    const first = player.name.split(" ")[0].toLowerCase();
    if (side.captain && first === side.captain.toLowerCase()) return "Captain";
    if (player.viceCaptain) return "Vice captain";
    return paid[player.name] != null ? money(paid[player.name]) : player.role;
  }

  return (
    <div
      className="squad-scrim"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="squad"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="squad-title"
        style={{ "--team": side.color, "--team-lit": side.colorLit }}
      >
        <header className="squad-head">
          <p className="squad-captain num">
            {side.captain ? `Captain ${side.captain}` : "Captain to be named"}
          </p>
          <h2 className="squad-name display" id="squad-title">
            {side.name}
          </h2>
          <p className="squad-count num">
            {squad.length} of {SQUAD_MAX}
            {short > 0 && <span> · {short} to fill</span>}
          </p>

          {/* What is left to spend, and what has gone. Only shown once the
              ledger knows this side's purse — before the auction there is
              nothing to report. */}
          {Number.isFinite(side.left) && (
            <dl className="squad-purse num">
              <div>
                <dt>Purse left</dt>
                <dd>{money(side.left)}</dd>
              </div>
              <div>
                <dt>Spent</dt>
                <dd>{money(side.spent)}</dd>
              </div>
            </dl>
          )}

          <button
            type="button"
            className="squad-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* The lineup. Two rows of five, the way a team stands for a
            photograph — ten in a single row would leave no width for names. */}
        <ol className="squad-lineup">
          {places.map((player, i) => (
            <li
              className={`peg${player ? " is-filled" : ""}`}
              key={player?.name ?? `empty-${i}`}
              /* Each figure rises a beat after the one before it, so the side
                 assembles rather than appearing. */
              style={{ "--i": i }}
            >
              <span className="peg-shape">
                <Figure />
                {!player && (
                  <span className="peg-mark num" aria-hidden="true">
                    ?
                  </span>
                )}
              </span>

              <span className="peg-no num">{String(i + 1).padStart(2, "0")}</span>

              {player ? (
                <>
                  <b className="peg-name">{player.name}</b>
                  <small className="peg-meta num">{roleOf(player)}</small>
                </>
              ) : (
                <>
                  <b className="peg-name is-empty">Open</b>
                  <small className="peg-meta num">Not yet won</small>
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
