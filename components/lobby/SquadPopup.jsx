"use client";

import { useEffect, useRef } from "react";

import { money } from "@/lib/auctionMoney";

/**
 * One side's squad, over the top of the teams grid.
 *
 * Themed with the side's own two colours, passed down as custom properties so
 * the stylesheet never has to know the eight teams exist.
 *
 * Squads are empty until the auction: every player carries a `team` in
 * data/season4Players.json, blank until a side calls them.
 */
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
            {squad.length === 0
              ? "No squad yet"
              : `${squad.length} ${squad.length === 1 ? "player" : "players"}`}
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

        {squad.length === 0 ? (
          <p className="squad-empty">
            Squads are built from scratch at the Live Auction. Nobody has been
            called for {side.name} yet.
          </p>
        ) : (
          <ol className="squad-list">
            {squad.map((player, i) => (
              <li key={player.name}>
                <span className="squad-no num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="squad-player">
                  <b>{player.name}</b>
                  <small>
                    {player.year}
                    {player.prefers && ` · Prefers ${player.prefers.toLowerCase()}`}
                  </small>
                </span>
                <span className="squad-buy">
                  {paid[player.name] != null && (
                    <b className="squad-price num">{money(paid[player.name])}</b>
                  )}
                  <span className="squad-role">{player.role}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
