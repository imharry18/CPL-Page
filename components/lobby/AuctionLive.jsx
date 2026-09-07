"use client";

import { useEffect, useState } from "react";

import SkillMeter from "@/components/SkillMeter";
import { SQUAD_MAX, money, nextBid, purses } from "@/lib/auctionMoney";

/**
 * The room's view of the auction.
 *
 * Three things follow the state, and all three are the same fact told louder:
 * the heading is the league until a side bids and that side's name afterwards,
 * the whole screen takes that side's colour, and a sale drops a SOLD stamp
 * across the lot before the board clears.
 *
 * Pushed, not polled. The server holds a connection open and sends the state
 * the instant the console writes it, so on one machine the board moves with
 * the button rather than up to a poll behind it. `poll` is only the fallback
 * for a stream that never opens.
 */
export default function AuctionLive({ sides, players, initial, eyebrow, poll = 1500 }) {
  const [state, setState] = useState(initial);

  /* The stamp is not a timer any more. It is up for exactly as long as the
     ledger says a sale is being announced, and the console takes it down by
     pressing Next — so the room reads it for as long as the room needs, and
     every board comes down together. */
  const sold = state.sold ?? null;

  /* setState is stable, so the stream below can call it directly and the
     effect never has to be torn down and rebuilt to keep up with a render.
     This used to be a ref assigned during render, which React 19 rejects —
     and it was never buying anything, because setState was all it held. */

  useEffect(() => {
    let alive = true;
    let source;
    let fallback;

    // Pushed, not polled: the console writes the state file and the server
    // sends it straight down this connection, so the board moves as the button
    // is pressed. The poll below only exists for when the stream cannot open.
    try {
      source = new EventSource("/api/auction/stream");
      source.onmessage = (event) => {
        if (!alive) return;
        try {
          setState(JSON.parse(event.data));
        } catch {
          // A malformed frame is skipped; the next change resends everything.
        }
      };
      source.onerror = () => {
        // EventSource reconnects on its own. The fallback covers the gap only
        // if it never connects at all.
        if (!fallback) {
          fallback = setInterval(async () => {
            try {
              const response = await fetch("/api/auction/state", {
                cache: "no-store",
              });
              if (response.ok && alive) setState(await response.json());
            } catch {
              // Held state is better than a blank board.
            }
          }, poll);
        }
      };
    } catch {
      fallback = setInterval(async () => {
        const response = await fetch("/api/auction/state", { cache: "no-store" });
        if (response.ok && alive) setState(await response.json());
      }, poll);
    }

    return () => {
      alive = false;
      source?.close();
      clearInterval(fallback);
    };
  }, [poll]);

  const lot = players.find((player) => player.name === state.current);
  const leader = sides.find((side) => side.name === state.leader);
  const buyer = sold ? sides.find((side) => side.name === sold.team) : null;

  /* What each side has left and how full it is, worked out from the sale
     history the board is already being sent. Nothing new is fetched and no
     second source of truth is kept — the same derivation the console uses. */
  const table = purses(sides, state.history);
  // What the next bid would cost, so a side that cannot cover it can be shown
  // as out of this lot rather than merely quiet.
  const asking = nextBid(state.bid, Boolean(state.leader));

  // The page's colour: whoever currently holds the bid, the buyer while the
  // stamp is up over a cleared board, the house red when nobody has bid.
  // Leader first — a live bid always outranks a stamp from the lot before.
  const theme = leader ?? buyer;

  return (
    <div
      className={`stage${theme ? " is-themed" : ""}`}
      style={
        theme ? { "--team": theme.color, "--team-lit": theme.colorLit } : undefined
      }
    >
      {/* The wash that carries the side's colour across the whole screen. */}
      <span className="stage-wash" aria-hidden="true" />

      <div className="stage-head">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display stage-title" aria-live="polite">
          {theme ? theme.name : "Campus Premier League"}
        </h1>
      </div>

      {/* The board and the rail side by side. A shared screen is 16:9: the
          height is spoken for by type sized to be read across a hall, and the
          width is what is going spare. */}
      <div className="stage-body">
        {/* Always rendered, even when there is nothing under the hammer. The
            board and the rail are two grid columns, and a branch that
            evaluates to nothing would leave the rail to slide into the wide
            one and stretch across the screen. */}
        <div className="stage-board">
          {state.notice === "unsold" ? (
        /* The pause between the two passes. Everything the auction knows is
           held back so the room has one thing to read. */
        <div className="interlude">
          <p className="interlude-tag num">Round two</p>
          <h2 className="interlude-line display">
            Now it&rsquo;s the unsold players&rsquo; turn
          </h2>
          <p className="interlude-sub display">Let&rsquo;s discuss something.</p>
        </div>
      ) : lot ? (
        <div className="live">
          <div className="live-shot">
            {lot.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lot.photo} alt="" />
            ) : (
              <span className="lot-shot-none num">No photograph</span>
            )}
          </div>

          <div className="live-who">
            <p className="lot-tag num">Under the hammer</p>
            <h2 className="live-name display">{lot.name}</h2>
            <p className="lot-meta num">
              {lot.year}
              {lot.prefers && ` · Prefers ${lot.prefers.toLowerCase()}`}
            </p>

            <p className={`lot-role role-${lot.role.toLowerCase().replace("-", "")}`}>
              {lot.role}
            </p>

            <div className="lot-skills">
              {[
                ["Bat", lot.bat],
                ["Bowl", lot.bowl],
                ["All-round", lot.allround],
              ].map(([label, value]) => (
                <SkillMeter key={label} label={label} value={value} size="lg" />
              ))}
            </div>

            <div className="live-bid">
              <p className="bid-tag num">Current bid</p>
              <p className="live-figure display">{money(state.bid)}</p>
              <p className="live-leader num">
                {leader ? leader.name : "No bid yet"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        !sold && (
          <div className="live-idle">
            <p className="lot-tag num">Standing by</p>
            <p className="display">The next lot is on its way.</p>
          </div>
        )
      )}
        </div>

      {/* The eight sides, always up.

          The board used to say what was happening and nothing about what was
          at stake: a viewer could see the bid but not who could still answer
          it, who was nearly full, or who had spent the room. In the hall you
          read that off people's faces. Shared to a call there are no faces, so
          it has to be on the screen. */}
      <aside className="rail" aria-label="The eight sides">
        {table.map((side) => {
          const bidding = state.leader === side.name;
          const full = side.bought >= SQUAD_MAX;
          // Out of this lot: nothing left to spend on it, or no room for him.
          const out = !bidding && (full || side.left < asking);

          return (
            <div
              key={side.name}
              className={`rail-side${bidding ? " is-bidding" : ""}${
                out ? " is-out" : ""
              }`}
              style={{ "--team": side.color, "--team-lit": side.colorLit }}
            >
              <span className="rail-spine" aria-hidden="true" />

              <p className="rail-name">
                {side.name}
                {bidding && <em className="rail-flag">Bidding</em>}
                {!bidding && full && <em className="rail-flag">Full</em>}
              </p>

              {/* Purse and squad on one line: the rail divides the height of
                  the board between eight cells, so every row it does not need
                  is height the figures can have instead. */}
              <div className="rail-figs">
                <b className="rail-purse num">{money(side.left)}</b>
                <b className="rail-count num">
                  {side.bought}
                  <i>/{SQUAD_MAX}</i>
                </b>
              </div>

              {/* The squad as a bar as well as a figure: through a screen
                  share a filled bar survives compression that eats a small
                  numeral, and full is meant to read at a glance. */}
              <span
                className="rail-fill"
                style={{ "--n": side.bought, "--max": SQUAD_MAX }}
                aria-hidden="true"
              />
            </div>
          );
        })}
        </aside>
      </div>

      {/* The sale itself. Held over the board rather than replacing it, so the
          player who has just gone is still on screen underneath. */}
      {sold && (
        <div className="sold" role="status">
          <p className="sold-stamp display">Sold</p>
          <p className="sold-name display">{sold.name}</p>
          {/* The buying side in its own colour — the same one already washing
              the screen, so the name and the room agree. */}
          <p className="sold-to num">
            to <b className="sold-team">{sold.team}</b>
          </p>
          <p className="sold-price display">{money(sold.price)}</p>
        </div>
      )}
    </div>
  );
}
