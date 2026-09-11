"use client";

import { money } from "@/lib/auctionMoney";

/**
 * The run of play, under the lot.
 *
 * Four results, then the man on the block, then the one after him. The board
 * used to say only who was next, in the corner — which told the room where it
 * was going but never where it had just been, so a captain who looked up late
 * had no way of knowing what the last four had gone for without asking.
 *
 * Read left to right into the lit cell. The four behind are sunk and muted so
 * they read as history at a glance; each wears the colour of the side that
 * bought the player, or red where nobody did. The lot on the block takes the
 * leading side's colour, the same one the bid is written in. What is coming is
 * green — the only cell that is about the future.
 */
export default function AuctionStrip({ past, current, next, sides = [] }) {
  const sideByName = new Map(sides.map((side) => [side.name, side]));

  return (
    <ol
      className="strip-run"
      aria-label={
        next
          ? "The last four lots, the current lot and what is next"
          : "The last four lots and the current lot"
      }
    >
      {past.map((sale, i) => {
        const side = sideByName.get(sale.team);
        return (
          <li
            className={`run-cell is-past${sale.team ? "" : " is-unsold"}`}
            key={`${sale.name}-${i}`}
            style={
              side
                ? { "--team": side.color, "--team-lit": side.colorLit }
                : undefined
            }
          >
            <b>{sale.name}</b>
            {sale.team ? (
              <span className="run-note num">
                <em className="run-team">{sale.team}</em>
                <span className="run-price">{money(sale.price)}</span>
              </span>
            ) : (
              <span className="run-note num">Unsold</span>
            )}
          </li>
        );
      })}

      <li className="run-cell is-now">
        <b>{current ?? "—"}</b>
        <span className="run-note num">Under the hammer</span>
      </li>

      {next && (
        <li className="run-cell is-next">
          <b>{next}</b>
          <span className="run-note num">Next</span>
        </li>
      )}
    </ol>
  );
}
