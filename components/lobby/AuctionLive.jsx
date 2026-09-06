"use client";

import { useEffect, useRef, useState } from "react";

import SkillMeter from "@/components/SkillMeter";
import { money } from "@/lib/auctionMoney";

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

  const apply = useRef(null);
  apply.current = (next) => setState(next);

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
          apply.current(JSON.parse(event.data));
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
              if (response.ok && alive) apply.current(await response.json());
            } catch {
              // Held state is better than a blank board.
            }
          }, poll);
        }
      };
    } catch {
      fallback = setInterval(async () => {
        const response = await fetch("/api/auction/state", { cache: "no-store" });
        if (response.ok && alive) apply.current(await response.json());
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
