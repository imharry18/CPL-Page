"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { SQUAD_MAX, SQUAD_MIN, money, nextBid, purses } from "@/lib/auctionMoney";

/**
 * The auction console.
 *
 * Left: whoever is under the hammer, as large as the screen allows — this is
 * the panel someone reads from across the room. Right: every control, grouped
 * by how often it is pressed. The eight side buttons take a bid at the current
 * price; the raise control follows the current price tier automatically;
 * Sold and Unsold end the lot; Undo walks the last result back.
 *
 * The server owns the state. Every press posts and takes the state that comes
 * back, so the console can never drift from the ledger — if a bid is refused
 * for want of purse, the board simply does not move.
 */
/* Long enough for the room to read who bought whom before the next face
   arrives; short enough that the night keeps moving. */
const SOLD_PAUSE = 2000;

export default function AuctionConsole({
  sides,
  players,
  initial,
  order: initialOrder = [],
  iconic = [],
}) {
  const [order, setOrder] = useState(initialOrder);
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [error, setError] = useState(null);

  const byName = useMemo(
    () => new Map(players.map((player) => [player.name, player])),
    [players]
  );
  const lot = state.current ? byName.get(state.current) : null;

  const table = useMemo(
    () => purses(sides, state.history),
    [sides, state.history]
  );

  /* The last word on each player. A name can appear in the history twice — a
     lot that went unsold in the first pass and sold in the second — so the
     latest entry is the one that counts, never the first. */
  const outcome = useMemo(() => {
    const last = new Map();
    for (const sale of state.history) last.set(sale.name, sale);
    return last;
  }, [state.history]);

  /* The running order, straight out of data/auctionOrder.json. The auctioneer
     does not decide who is next — the file does — so this is a list to walk
     down, not a chooser. Anyone paid but missing from the file is appended, so
     a late entrant is never silently dropped from the night. */
  const running = useMemo(() => {
    const listed = order.filter(
      (name) => byName.has(name) && !new Set(iconic).has(name)
    );
    // Only players who have paid go under the hammer, so only they can be
    // appended — otherwise a missing order file turns the night into the whole
    // 104-name pool instead of the 70 who are actually in it.
    const listedSet = new Set(listed);
    /* Anyone paid but not in the file, except those who are not for sale: a
       captain is on his side by hand and an iconic player is allotted by the
       FateGrid. The iconic eight have to be named here rather than inferred
       from a side — until the grid is drawn they carry no team, and without
       this they walk straight back into the order. */
    const spokenFor = new Set(iconic);
    const missing = players
      .filter(
        (p) => p.paid && !p.team && !spokenFor.has(p.name) && !listedSet.has(p.name)
      )
      .map((p) => p.name);
    return [...listed, ...missing].map((name, i) => ({
      name,
      no: i + 1,
      player: byName.get(name),
      sale: outcome.get(name) ?? null,
    }));
  }, [order, players, byName, outcome]);

  // Three states a name can be in, and every list on screen is one of them.
  const pending = useMemo(() => running.filter((row) => !row.sale), [running]);
  const passed = useMemo(
    () => running.filter((row) => row.sale && !row.sale.team),
    [running]
  );
  const sold = useMemo(
    () => running.filter((row) => row.sale?.team),
    [running]
  );

  /* The second pass. Nobody is called twice in the first run down the order,
     so the players who went unsold wait at the foot of the list until the
     order is exhausted and the round is opened. Read from the ledger, not
     from the browser: a reload — or the machine dying and coming back — has
     to resume the round it was in. */
  const secondPass = state.pass === 2;
  const firstPassDone = pending.length === 0;
  const complete = firstPassDone && passed.length === 0;

  // What the console is working through right now.
  const live = secondPass ? passed : pending;
  const remaining = live;

  const at = live.findIndex((row) => row.name === state.current);
  const upNext =
    live.find((row, i) => i > at && row.name !== state.current) ??
    live.find((row) => row.name !== state.current);

  // Unsold names sit at the foot of the list, after everyone still to come.
  const queue = useMemo(
    () => (secondPass ? passed : [...pending, ...passed]),
    [pending, passed, secondPass]
  );

  /* No "call next" button: the order calls itself. The moment a lot is
     resolved and nothing is under the hammer, the next name in the file goes
     up. Held back while a notice is on the screen — that pause is the point of
     it — and while a request is in flight, so one gap cannot fire twice.

     A lot that has just closed gets two seconds first: the room's board is
     running its SOLD stamp over the player, and calling the next name on top
     of that would cut the moment off. A gap with no lot behind it — a reload,
     the first lot of the night — starts straight away. */
  const calling = useRef(false);
  const closed = useRef(false);
  useEffect(() => {
    if (state.current) {
      closed.current = true;
      return undefined;
    }
    /* A sale being announced stops everything. Without this the pause below
       simply expires and calls the next lot, which clears state.sold — taking
       the stamp off the board in the hall and closing this console's popup on
       its own. Next is the only thing that ends an announcement. */
    if (state.notice || state.sold || busy || complete) return undefined;
    if (!upNext || calling.current) return undefined;

    const wait = closed.current ? SOLD_PAUSE : 0;
    const id = setTimeout(() => {
      calling.current = true;
      closed.current = false;
      send({ action: "lot", name: upNext.name }).finally(() => {
        calling.current = false;
      });
    }, wait);

    return () => clearTimeout(id);
  }, [state.current, state.notice, state.sold, busy, complete, upNext]);

  // The console usually knows first — it is the thing pressing the buttons —
  // but it listens on the same stream as the room so a second window, or a
  // press whose reply was lost, can never leave this board stale.
  useEffect(() => {
    const source = new EventSource("/api/auction/stream");
    source.onmessage = (event) => {
      try {
        setState(JSON.parse(event.data));
      } catch {
        // Skip a malformed frame; the next change resends everything.
      }
    };
    return () => source.close();
  }, []);

  async function send(body) {
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
      // A shuffle comes back with the new running order alongside the state.
      if (data.order) setOrder(data.order);
      setState(data);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }

  const leader = table.find((side) => side.name === state.leader);
  // What the next bidder pays. The first bid of a lot takes the base price.
  const asking = nextBid(state.bid, Boolean(state.leader));

  return (
    <main className="console">
      {/* Top right, away from everything pressed during a lot — a restart is
          the one action here that cannot be undone. */}
      <button
        type="button"
        className="btn-restart"
        onClick={() => setConfirmRestart(true)}
      >
        Restart
      </button>

      {/* A sale stops the console until it is acknowledged: the stamp is up on
          the board in the hall, and the next lot must not be called over the
          top of it. Next takes it down on every screen at once. */}
      {state.sold && (
        <div className="confirm-scrim">
          <div className="confirm is-sale" role="dialog" aria-modal="true">
            <p className="confirm-tag num">Sold</p>
            <p className="sale-name display">{state.sold.name}</p>
            <p className="sale-to num">to</p>
            <p className="sale-team display">{state.sold.team}</p>
            <p className="sale-price display">{money(state.sold.price)}</p>
            <button
              type="button"
              className="btn-call is-sold sale-next"
              disabled={busy}
              autoFocus
              onClick={() => send({ action: "next" })}
            >
              Next player
            </button>
          </div>
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
              {sold.length} sold · {passed.length} unsold · {state.history.length}{" "}
              results will be lost
            </p>
            <div className="confirm-row">
              <button
                type="button"
                className="btn-call"
                onClick={() => setConfirmRestart(false)}
              >
                Keep going
              </button>
              <button
                type="button"
                className="btn-call is-sold"
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

      {/* ---------------------------------------------------------------- */}
      <section className="console-lot">
        {lot ? (
          <>
            {/* Small: the console is for calling the room, and the room has
                the big picture on the other screen. */}
            <div className="lot-shot is-small">
              {lot.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lot.photo} alt="" />
              ) : (
                <span className="lot-shot-none num">No photo</span>
              )}
            </div>

            <div className="lot-who">
              <p className="lot-tag num">
                Under the hammer
                {at >= 0 && <span> · {at + 1} of {running.length}</span>}
              </p>
              <h1 className="lot-name display">{lot.name}</h1>
            </div>
          </>
        ) : (
          <div className="lot-empty">
            <p className="lot-tag num">No lot</p>
            <p className="display">Pick a player to start the bidding.</p>
          </div>
        )}
        {/* Sold players live here, on the left, once they leave the running
            order — the night's tally where the auctioneer can see it. */}
        {sold.length > 0 && (
          <div className="sold-roll">
            <p className="queue-tag num">Sold · {sold.length}</p>
            <ol>
              {[...sold].reverse().map((row) => (
                <li key={row.name}>
                  <span className="roll-name">{row.name}</span>
                  <em className="num">
                    {row.sale.team} · {money(row.sale.price)}
                  </em>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="console-controls">
        <div className="bid">
          <p className="bid-tag num">Current bid</p>
          <p className="bid-figure display">{money(state.bid)}</p>
          <p className="bid-leader num">
            {leader ? (
              <span style={{ color: leader.colorLit }}>{leader.name}</span>
            ) : (
              "No bid yet"
            )}
          </p>
          {lot && (
            <p className="bid-asking num">
              Next bid <b>{money(asking)}</b>
            </p>
          )}
        </div>

        {/* One button per side, and pressing it IS the raise: the side takes
            the lot at the asking price and the board moves up a step. The side
            already holding the bid cannot bid against itself. */}
        <div className="teams">
          {table.map((side) => (
            <button
              key={side.name}
              type="button"
              className={`btn-team${
                state.leader === side.name ? " is-leading" : ""
              }${side.bought >= SQUAD_MAX ? " is-full" : ""}${
                side.bought < SQUAD_MIN ? " is-short" : ""
              }`}
              style={{ "--team": side.color, "--team-lit": side.colorLit }}
              disabled={
                busy ||
                !lot ||
                state.leader === side.name ||
                side.left < asking ||
                side.bought >= SQUAD_MAX
              }
              onClick={() => send({ action: "bid", team: side.name })}
            >
              <b>{side.name}</b>
              <span className="btn-team-purse num">
                {money(side.left)} · {side.bought}/{SQUAD_MAX}
              </span>
            </button>
          ))}
        </div>

        <div className="calls">
          <button
            type="button"
            className="btn-call is-sold"
            disabled={busy || !lot || !state.leader}
            onClick={() => send({ action: "sold" })}
          >
            Sold
          </button>
          <button
            type="button"
            className="btn-call is-unsold"
            disabled={busy || !lot}
            onClick={() => send({ action: "unsold" })}
          >
            Unsold
          </button>
          {/* Two different takings-back: this one steps the live bidding back
              a raise, Undo below reopens the last lot that was closed. */}
          <button
            type="button"
            className="btn-call is-undo"
            disabled={busy || (state.bids ?? []).length === 0}
            onClick={() => send({ action: "undobid" })}
          >
            Undo bid
          </button>
          <button
            type="button"
            className="btn-call is-undo"
            disabled={busy || state.history.length === 0}
            onClick={() => send({ action: "undo" })}
          >
            Undo sale
          </button>
        </div>

        {error && <p className="console-error num">{error}</p>}

        {complete ? (
          /* Nothing left in either pass — the night is done, and the console
             says so rather than showing an empty list. */
          <div className="queue-done">
            <p className="queue-tag num">Every player allotted</p>
            <p className="display">Auction completed</p>
            <p className="queue-done-sum num">
              {sold.length} sold · {passed.length} unsold
            </p>
          </div>
        ) : (
          <div className="queue">
            <div className="queue-head">
              <p className="queue-tag num">
                {secondPass ? "Unsold — second call" : "Running order"} ·{" "}
                {remaining.length} left
              </p>

              {/* The order runs itself, so this says who is coming rather
                  than offering a button that calls them. */}
              {upNext && !state.notice && (
                <p className="queue-next num">
                  Next · <b>{upNext.name}</b>
                </p>
              )}

              <button
                type="button"
                className="btn-shuffle"
                disabled={busy}
                onClick={() => send({ action: "shuffle" })}
              >
                Shuffle
              </button>
            </div>

            {/* Offered only once the order has been walked to the end, so the
                second pass cannot start over the top of the first. */}
            {/* Between the two passes the room gets a card, not a lot: the
                captains talk while the screen says so. Pressing this puts the
                notice up and stops the order calling itself; Begin clears it
                and the unsold names start. */}
            {firstPassDone && !secondPass && passed.length > 0 && (
              <button
                type="button"
                className="btn-second"
                disabled={busy}
                onClick={() =>
                  send({ action: "notice", notice: "unsold", pass: 2 })
                }
              >
                Start unsold players · {passed.length}
              </button>
            )}

            {state.notice && (
              <button
                type="button"
                className="btn-second is-go"
                disabled={busy}
                onClick={() => send({ action: "notice", notice: null })}
              >
                Begin the unsold round
              </button>
            )}

            <ol className="order">
              {queue.map((row) => (
                <li
                  key={row.name}
                  className={`order-row${
                    row.name === state.current ? " is-live" : ""
                  }${row.sale && !row.sale.team ? " is-unsold" : ""}`}
                >
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => send({ action: "lot", name: row.name })}
                  >
                    <span className="order-no num">
                      {String(row.no).padStart(2, "0")}
                    </span>
                    <span className="order-name">{row.name}</span>
                    <em className="num">
                      {row.sale && !row.sale.team
                        ? "Unsold"
                        : (row.player?.role ?? "")}
                    </em>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

      </section>
    </main>
  );
}
