"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import SkillMeter from "@/components/SkillMeter";
import SquadPopup from "@/components/lobby/SquadPopup";
import { SQUAD_MAX, money, nextBid, purses } from "@/lib/auctionMoney";
import { nextInQueue, queueFor } from "@/lib/auctionQueue";

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
/* Long enough for the room to read a result before the next face arrives.
   Only used when nothing is being announced — an announcement waits for Next. */
const CALL_PAUSE = 1200;

export default function AuctionLive({
  sides,
  players,
  initial,
  eyebrow,
  order = [],
  admin = false,
  poll = 1500,
}) {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  // Which side's squad is open, from a right-click on its cell in the rail.
  const [squad, setSquad] = useState(null);
  const [confirmRestart, setConfirmRestart] = useState(false);

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

  /* Every change goes through the server, which is the only thing that decides
     what a bid costs or whether it is allowed. The board takes back whatever
     the ledger says and never guesses — a bid refused for want of purse simply
     does not move the screen. */
  const send = useCallback(async (body) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "failed");
      setState(data);
      return data;
    } catch (problem) {
      setError(problem.message);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

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

  /* Who is coming. Worked out with the same rule the console uses, from the
     same running order and the same ledger, so the screen at the front of the
     hall cannot name someone other than the one about to be called. Anyone
     watching on a call has no room to read, and this is how they know to get
     ready. */
  const upNext = nextInQueue(
    queueFor({ order, history: state.history, pass: state.pass }),
    state.current
  );

  const announcing = Boolean(state.sold || state.unsold);

  /* What each player went for, so the squad panel can show a price beside a
     name. Straight off the ledger, like everything else here. */
  const paid = Object.fromEntries(
    state.history.filter((sale) => sale.team).map((sale) => [sale.name, sale.price])
  );

  /* Whether the first pass is done and there are players owed a second call.
     Same rule as the queue itself, so the button appears exactly when the
     round it opens has somebody in it. */
  const stillToCall = queueFor({ order, history: state.history, pass: 1 });
  const reoffer = queueFor({ order, history: state.history, pass: 2 });
  const secondPassReady =
    state.pass !== 2 && stillToCall.length === 0 && reoffer.length > 0;

  /* The keyboard is the console.

     Bidding is eight keys, and calling the lot is two more, because during a
     fast raise the hand should not have to find a button. The number a side
     answers to is printed on its cell in the rail, so what the auctioneer
     presses is what the room can see.

       1 - 8        that side bids, at the asking price
       Enter        sold, to whoever holds the bid
       Cmd+Enter    unsold
       Cmd+Z        one step back — the last raise, or the last result

     Held in a ref so the handler is bound once and still sees the current
     ledger; rebinding it on every state change would drop a keystroke pressed
     in the gap. */
  const live = useRef(null);
  useEffect(() => {
    live.current = { state, table, asking, announcing, busy };
  });

  useEffect(() => {
    if (!admin) return undefined;

    const onKey = (event) => {
      const now = live.current;
      if (!now || now.busy) return;

      // Never steal a key from something being typed into.
      const el = event.target;
      if (el?.isContentEditable || /^(input|textarea|select)$/i.test(el?.tagName ?? "")) {
        return;
      }

      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        send({ action: "back" });
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        // An announcement is up: Enter takes it down and moves the night on,
        // which is the same key doing the same job — finish with this lot.
        if (now.announcing) {
          send({ action: "next" });
          return;
        }
        if (meta) {
          if (now.state.current) send({ action: "unsold" });
          return;
        }
        if (now.state.current && now.state.leader) send({ action: "sold" });
        return;
      }

      if (/^[1-8]$/.test(event.key) && !meta) {
        const side = now.table.find((s) => String(s.no) === event.key);
        if (!side || !now.state.current || now.announcing) return;
        event.preventDefault();
        send({ action: "bid", team: side.name });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [admin, send]);

  /* The order calls itself: the moment a lot is resolved and nothing is being
     announced, the next name in the file goes up. Moved here from the console
     along with everything else — without it the board would sit on an empty
     lot waiting for a press that no longer exists. */
  const calling = useRef(false);
  useEffect(() => {
    if (!admin) return undefined;
    if (state.current || state.notice || announcing || busy) return undefined;
    if (!upNext || calling.current) return undefined;

    const id = setTimeout(() => {
      calling.current = true;
      send({ action: "lot", name: upNext }).finally(() => {
        calling.current = false;
      });
    }, CALL_PAUSE);

    return () => clearTimeout(id);
  }, [admin, state.current, state.notice, announcing, busy, upNext, send]);

  // The page's colour: whoever currently holds the bid, the buyer while the
  // stamp is up over a cleared board, the house red when nobody has bid.
  // Leader first — a live bid always outranks a stamp from the lot before.
  const theme = leader ?? buyer;

  return (
    <>
      {/* Below a tablet the board is not drawn at all. It is a screen for the
          front of a hall — and for the call it is shared to — and shrinking it
          to a phone would leave every figure on it too small to read. */}
      <section className="stage-small">
        <p className="stage-small-tag num">Live Auction</p>
        <h2 className="display">Open this on a laptop</h2>
        <p>
          The auction board is built for a big screen. On a phone, follow the
          shared screen on the call.
        </p>
      </section>

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
        // Neither announcement wants "the next lot is on its way" showing
        // through it — the stamp is laid over the board, not instead of it.
        !announcing && (
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
          // A side already holding the bid cannot bid against itself, and one
          // with no lot to bid on has nothing to press for.
          const canBid =
            admin && Boolean(state.current) && !announcing && !bidding && !out;

          const inside = (
            <>
              <span className="rail-spine" aria-hidden="true" />

              <p className="rail-name">
                {/* The key that bids for this side, printed where the room and
                    the auctioneer can both see it. */}
                <span className="rail-no num" aria-hidden="true">
                  {side.no}
                </span>
                <span className="rail-team">{side.name}</span>
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
            </>
          );

          const className = `rail-side${bidding ? " is-bidding" : ""}${
            out ? " is-out" : ""
          }${canBid ? " is-live" : ""}`;
          const style = { "--team": side.color, "--team-lit": side.colorLit };

          /* Right-click opens the squad, on the auctioneer's machine and on a
             visitor's alike — it reads the ledger and changes nothing, and
             "who has this side actually got?" is the question most often
             asked out loud during an auction. */
          const onContextMenu = (event) => {
            event.preventDefault();
            setSquad(side);
          };

          // A cell is only a button where it can do something. Rendering one
          // for a visitor would put a control on screen that does nothing.
          return admin ? (
            <button
              type="button"
              key={side.name}
              className={className}
              style={style}
              disabled={!canBid}
              onClick={() => send({ action: "bid", team: side.name })}
              onContextMenu={onContextMenu}
              title={`Press ${side.no} to bid · right-click for the squad`}
            >
              {inside}
            </button>
          ) : (
            <div
              key={side.name}
              className={className}
              style={style}
              onContextMenu={onContextMenu}
            >
              {inside}
            </div>
          );
        })}
        </aside>
      </div>

      {/* Who is coming, small, in the bottom corner. It is a footnote to the
          lot rather than part of it — the room is looking at the man under the
          hammer, and this is only for anyone who wants to get ready. Taken out
          of the layout altogether so it costs the board no height. */}
      {upNext && (
        <p className="stage-next num">
          <span className="stage-next-tag">Next</span>
          <b className="stage-next-name">{upNext}</b>
        </p>
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
          {admin && (
            <button
              type="button"
              className="stamp-next"
              disabled={busy}
              autoFocus
              onClick={() => send({ action: "next" })}
            >
              Next player
            </button>
          )}
        </div>
      )}

      {/* And the same for a lot nobody wanted. It stays up until Next, exactly
          as a sale does — the room is told, rather than the board simply going
          quiet and the next face arriving. */}
      {state.unsold && (
        <div className="sold is-unsold" role="status">
          <p className="sold-stamp display">Unsold</p>
          <p className="sold-name display">{state.unsold.name}</p>
          <p className="sold-to num">No bids</p>
          <p className="sold-note num">He comes back in the second round</p>
          {admin && (
            <button
              type="button"
              className="stamp-next"
              disabled={busy}
              autoFocus
              onClick={() => send({ action: "next" })}
            >
              Next player
            </button>
          )}
        </div>
      )}

      {/* One side's squad, from a right-click on the rail. The same panel the
          teams page uses — one squad list, not two. */}
      {squad && (
        <SquadPopup
          side={squad}
          players={players}
          paid={paid}
          onClose={() => setSquad(null)}
        />
      )}

      {/* Everything that is not a bid. Small, out of the way, and only on the
          machine running the night. */}
      {admin && (
        <div className="deck">
          <p className="deck-keys num" aria-hidden="true">
            <b>1</b>–<b>8</b> bid · <b>↵</b> sold · <b>⌘↵</b> unsold ·{" "}
            <b>⌘Z</b> back
          </p>

          {state.notice ? (
            <button
              type="button"
              className="deck-btn is-go"
              disabled={busy}
              onClick={() => send({ action: "notice", notice: null })}
            >
              Begin the round
            </button>
          ) : (
            secondPassReady && (
              <button
                type="button"
                className="deck-btn is-go"
                disabled={busy}
                onClick={() =>
                  send({ action: "notice", notice: "unsold", pass: 2 })
                }
              >
                Start unsold · {reoffer.length}
              </button>
            )
          )}

          <button
            type="button"
            className="deck-btn"
            disabled={busy || !state.current}
            onClick={() => send({ action: "unsold" })}
          >
            Unsold
          </button>
          <button
            type="button"
            className="deck-btn"
            disabled={busy}
            onClick={() => send({ action: "back" })}
          >
            Back
          </button>
          <button
            type="button"
            className="deck-btn"
            disabled={busy}
            onClick={() => send({ action: "shuffle" })}
          >
            Shuffle
          </button>
          <button
            type="button"
            className="deck-btn is-danger"
            onClick={() => setConfirmRestart(true)}
          >
            Restart
          </button>

          {error && <p className="deck-error num">{error}</p>}
        </div>
      )}

      {confirmRestart && (
        <div
          className="confirm-scrim"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmRestart(false);
          }}
        >
          <div className="confirm" role="dialog" aria-modal="true">
            <p className="confirm-tag num">Restart the auction</p>
            <p className="confirm-line">
              Every sale, every bid and every unsold call is deleted, and the
              night starts again from the first name in the running order.
            </p>
            <p className="confirm-sum num">
              {state.history.length} results will be lost
            </p>
            <div className="confirm-row">
              <button
                type="button"
                className="deck-btn"
                onClick={() => setConfirmRestart(false)}
              >
                Keep going
              </button>
              <button
                type="button"
                className="deck-btn is-danger"
                disabled={busy}
                onClick={() => {
                  send({ action: "restart" });
                  setConfirmRestart(false);
                }}
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
