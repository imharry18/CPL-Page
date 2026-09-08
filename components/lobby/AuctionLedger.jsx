"use client";

import { useEffect, useRef } from "react";

import { SQUAD_MIN, money } from "@/lib/auctionMoney";
import { ROUNDS, roundName } from "@/lib/auctionQueue";

/**
 * The night on one card: what has gone, what has not, and what is coming.
 *
 * The board shows one lot and one name after it, which is right for the room
 * but leaves the auctioneer with nothing to answer "who did Blazing Blades
 * get?" or "how many are left?" from. This is that answer, behind a button,
 * so the broadcast stays a broadcast.
 *
 * Everything here is derived from the ledger the board is already holding —
 * no fetch, no second copy of the night.
 */
export default function AuctionLedger({
  sold,
  unsold,
  upcoming,
  squads,
  onClose,
}) {
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      // Escape only, like the guide: every other key still belongs to the
      // auction underneath, and a bid must not be swallowed by an open panel.
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="guide-scrim"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="guide ledger"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ledger-title"
      >
        <header className="guide-head">
          <p className="guide-tag num">The night so far</p>
          <h2 className="display" id="ledger-title">
            Sold and unsold
          </h2>
          <button
            type="button"
            className="guide-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {/* Side by side, because the two are read against each other: what the
            room has spent, and who is still owed a call. */}
        <div className="ledger-cols">
          <section className="ledger-col">
            <h3 className="guide-sub num">
              Sold <span className="ledger-count">{sold.length}</span>
            </h3>
            {sold.length === 0 ? (
              <p className="ledger-none">Nothing has gone yet.</p>
            ) : (
              <ol className="ledger-list">
                {sold.map((sale) => (
                  <li key={sale.name} className="ledger-row">
                    <b>{sale.name}</b>
                    <span className="ledger-team">{sale.team}</span>
                    <span className="ledger-price num">{money(sale.price)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="ledger-col">
            <h3 className="guide-sub num">
              Unsold <span className="ledger-count">{unsold.length}</span>
            </h3>
            {unsold.length === 0 ? (
              <p className="ledger-none">Nobody has gone unsold.</p>
            ) : (
              <ol className="ledger-list">
                {unsold.map((sale) => (
                  <li key={sale.name} className="ledger-row is-unsold">
                    <b>{sale.name}</b>
                    {/* A refusal in the last round is final; an earlier one
                        brings the player back, and the auctioneer needs to
                        know which of the two they are looking at. */}
                    <span className="ledger-team">
                      {(sale.pass ?? 1) >= ROUNDS
                        ? "Rejected"
                        : roundName((sale.pass ?? 1) + 1)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* The nine-player minimum, which nothing in the auction enforces —
            a side is told it is short, not stopped from being short. Until
            now it was not even told: SQUAD_MIN was declared and never read.
            One line, because it only matters near the end, and by then it
            matters a great deal. */}
        <section className="ledger-next">
          <h3 className="guide-sub num">
            Squads
            <span
              className={`ledger-count${squads.slack < 0 ? " is-short" : ""}`}
            >
              {squads.needed} to fill · {squads.left} left
            </span>
          </h3>
          {squads.slack < 0 ? (
            <p className="ledger-none is-short">
              {-squads.slack} short of giving every side {SQUAD_MIN}. Some side
              will finish below the minimum.
            </p>
          ) : (
            <p className="ledger-none">
              {squads.slack} to spare on the {SQUAD_MIN}-player minimum.
              {squads.short.length > 0 &&
                ` Shortest: ${squads.short
                  .map((s) => `${s.name} needs ${s.needs}`)
                  .join(", ")}.`}
            </p>
          )}
        </section>

        <section className="ledger-next">
          <h3 className="guide-sub num">Next five</h3>
          {upcoming.length === 0 ? (
            <p className="ledger-none">The order is finished.</p>
          ) : (
            <ol className="ledger-queue">
              {upcoming.map((name, i) => (
                <li key={name}>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  {name}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
