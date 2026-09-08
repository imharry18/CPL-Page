"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import SkillMeter from "@/components/SkillMeter";
import AuctionGuide from "@/components/lobby/AuctionGuide";
import AuctionLedger from "@/components/lobby/AuctionLedger";
import AuctionStrip from "@/components/lobby/AuctionStrip";
import Decode from "@/components/lobby/Decode";
import SquadPopup from "@/components/lobby/SquadPopup";
import StageFX from "@/components/lobby/StageFX";
import { SQUAD_MAX, SQUAD_MIN, money, nextBid, purses } from "@/lib/auctionMoney";
import {
  ROUNDS,
  nextInQueue,
  outcomes,
  queueFor,
  roundName,
} from "@/lib/auctionQueue";

/* useLayoutEffect on the client, useEffect on the server. There is no layout
   to measure during a server render, and React warns if you ask for one. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;


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
/**
 * How hard to squeeze a name so it lands on one or two lines.
 *
 * The announcement has one width, and the names it has to carry run from
 * "Anirudh" to "Bhavishya Nilesh Agrawal". A width narrow enough for the long
 * ones leaves the short ones as a small block in the middle of a big screen;
 * a width wide enough for the short ones runs the long ones under the rail.
 * So the width stays and the type gives.
 */
function fitFor(name = "") {
  if (name.length >= 20) return " is-longest";
  if (name.length >= 14) return " is-long";
  return "";
}

/**
 * A first guess at how hard to squeeze the lot's name, used for the very first
 * paint before it can be measured. Character count is only a rough proxy —
 * "Aryan Gulhare" and "Aditya Pandey" are both thirteen characters and one of
 * them is a good deal wider — so the real work is done by measurement in the
 * component. This only has to stop the first frame arriving badly wrong.
 */
function lotFit(name = "") {
  if (name.length >= 18) return " is-longest";
  if (name.length >= 15) return " is-long";
  return "";
}

/* Long enough for the room to read a result before the next face arrives.
   Only used when nothing is being announced — an announcement waits for Next. */
const CALL_PAUSE = 1200;

export default function AuctionLive({
  sides,
  players,
  initial,
  eyebrow,
  order: initialOrder = [],
  admin = false,
  poll = 1500,
}) {
  const [state, setState] = useState(initial);
  /* The running order, following the file rather than frozen at page load.
     A shuffle rewrites data/auctionOrder.json and the stream sends it down
     with the ledger, so a board that has been open all evening calls the same
     list as the one it was shuffled on. */
  const [order, setOrder] = useState(initialOrder);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  // Which side's squad is open, from a right-click on its cell in the rail.
  const [squad, setSquad] = useState(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);

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
          const next = JSON.parse(event.data);
          setState(next);
          if (Array.isArray(next.order)) setOrder(next.order);
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
  /* `quiet` is for the changes the board makes on its own rather than because
     somebody pressed something. This screen is projected in a hall: a red line
     across it explaining that a name the ORDER chose cannot go up is not an
     instruction to the auctioneer, it is the board talking to itself in front
     of the room. Refusals that answer a press — a purse that cannot cover the
     bid, a full squad — are still said, because those the auctioneer has to
     act on. */
  const send = useCallback(async (body, { quiet = false } = {}) => {
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
      if (!quiet) setError(problem.message);
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

  /* The roster with tonight's sales folded in.

     The list this page was given is what the roster said when it loaded, and
     the ledger arrives afterwards over the stream — so a player bought five
     minutes ago is still shown unattached unless the two are merged. Doing it
     here means the rail and the squad panel both count the same squads. */
  const livePlayers = useMemo(() => {
    const won = new Map(
      state.history.filter((sale) => sale.team).map((sale) => [sale.name, sale.team])
    );
    if (won.size === 0) return players;
    return players.map((player) =>
      won.has(player.name) ? { ...player, team: won.get(player.name) } : player
    );
  }, [players, state.history]);

  /* How many each side actually holds. The captain and the vice captain stand
     on their side before a bid is made and count towards the ten, so this is
     everyone carrying the side's name — not just the ones bought. Counting
     purchases alone let a side reach twelve. */
  const held = useMemo(() => {
    const count = new Map(sides.map((side) => [side.name, 0]));
    for (const player of livePlayers) {
      if (player.team && count.has(player.team)) {
        count.set(player.team, count.get(player.team) + 1);
      }
    }
    return count;
  }, [livePlayers, sides]);
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

  /* What the arrows walk: everyone still to be called in the round the night
     is in, with the lot on screen kept in place so stepping has a position to
     step from. */
  const navQueue = queueFor({
    order,
    history: state.history,
    pass: state.pass,
  });

  /* Where the night stands, asked of the round it is actually in rather than
     of round one and round two by name. The same rule as the queue itself, so
     the button to open the next round appears exactly when that round has
     somebody in it — and, on the last round, never. */
  const round = state.pass ?? 1;
  // Empty of its own accord once the last round has been run — queueFor owns
  // the cap, so there is nothing to check for here.
  const reoffer = queueFor({ order, history: state.history, pass: round + 1 });
  const roundOver = navQueue.length === 0;

  /* Where this lot stands in the round being called.
     Counted against the round's OWN list, not the night's: in the first round
     that is the running order, and afterwards it is however many went unsold
     and are owed another call — so "04 of 12" in a later round means the
     fourth of twelve unsold, which is the number the room actually wants. */
  const placeInRound = navQueue.indexOf(state.current);
  const roundTotal =
    navQueue.length + state.history.filter((s) => (s.pass ?? 1) === round).length;
  const calledSoFar =
    placeInRound >= 0
      ? roundTotal - navQueue.length + placeInRound + 1
      : roundTotal - navQueue.length;
  const nextRoundReady = roundOver && reoffer.length > 0;
  // Nobody left to call in this round, and nobody owed another one.
  const complete = roundOver && reoffer.length === 0;

  /* The two columns the ledger panel shows.

     Built from the LAST word on each player rather than from every line in the
     history: a name refused in the first round and bought in the second is in
     the ledger twice, and walking the lines would leave him sitting in the
     unsold column after he had been sold. */
  const { soldList, unsoldList } = useMemo(() => {
    const last = [...outcomes(state.history).values()];
    return {
      soldList: last.filter((entry) => entry.team),
      unsoldList: last.filter((entry) => !entry.team),
    };
  }, [state.history]);

  /* The five after the one on screen.

     Walked from where the lot under the hammer sits in the queue, not from the
     head of it — the same rule nextInQueue uses, and for the same reason, so
     the first of these five is exactly the name the board is showing as NEXT.
     Taking the head instead would have the panel and the board naming two
     different players after an out-of-order call. A lot that is not in the
     queue at all (between lots) falls back to the head, as it does there. */
  /* Can every side still reach the nine?
   *
   * SQUAD_MIN has been in the money file since the start and never once read:
   * the comment beside it says a side short of nine "needs to be told, not
   * stopped", and nothing told anybody. This is the telling.
   *
   * Seats still to fill against players still to be called, counting every
   * round the night has left rather than only this one — a man unsold now is
   * still available in the next round, so counting only the current queue
   * would cry short while there was time.
   */
  const squads = useMemo(() => {
    const needs = sides.map((side) => ({
      name: side.name,
      needs: Math.max(0, SQUAD_MIN - (held.get(side.name) ?? 0)),
    }));
    const needed = needs.reduce((sum, side) => sum + side.needs, 0);

    // Everyone the night can still put under the hammer, counted once.
    const callable = new Set();
    for (let p = round; p <= ROUNDS; p++) {
      for (const name of queueFor({ order, history: state.history, pass: p })) {
        callable.add(name);
      }
    }
    if (state.current) callable.add(state.current);

    return {
      needed,
      left: callable.size,
      slack: callable.size - needed,
      short: needs.filter((side) => side.needs > 0).sort((a, b) => b.needs - a.needs),
    };
  }, [sides, held, order, state.history, state.current, round]);

  const upcoming = useMemo(() => {
    const at = navQueue.indexOf(state.current);
    return navQueue
      .filter((name, i) => i > at && name !== state.current)
      .slice(0, 5);
  }, [navQueue, state.current]);

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
    live.current = {
      state,
      table,
      asking,
      announcing,
      busy,
      queue: navQueue,
      advance,
    };
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
          now.advance();
          return;
        }
        if (meta) {
          if (now.state.current) send({ action: "unsold" });
          return;
        }
        if (now.state.current && now.state.leader) send({ action: "sold" });
        return;
      }

      /* Stepping through the order without calling anyone. Nothing is
         recorded, so a name arrowed past simply comes round again — this is
         for looking ahead, not for skipping a player. */
      if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && !meta) {
        if (now.announcing || now.state.notice) return;
        const queue = now.queue;
        if (queue.length === 0) return;
        event.preventDefault();
        const at = queue.indexOf(now.state.current);
        const step = event.key === "ArrowRight" ? 1 : -1;
        // Wraps, so the end of the order is not a dead end mid-auction.
        const to = at === -1 ? 0 : (at + step + queue.length) % queue.length;
        if (queue[to] !== now.state.current) {
          send({ action: "lot", name: queue[to] });
        }
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
      // Nobody pressed this; the order did. If the name it picked cannot go
      // up, the effect simply runs again on the next name.
      send({ action: "lot", name: upNext }, { quiet: true }).finally(() => {
        calling.current = false;
      });
    }, CALL_PAUSE);

    return () => clearTimeout(id);
  }, [admin, state.current, state.notice, announcing, busy, upNext, send]);

  /* The name, sized to the column it actually has.

     Every name in the pool must land on ONE line: a wrap costs the height of a
     whole line, and that height is what the price below is spending. Character
     count cannot predict the width — two names of the same length differ by a
     fifth — so the text is measured against the column and the type scaled by
     whatever it is over. Cheap: one read on a change of lot, not per frame. */
  const nameRef = useRef(null);
  /* Before the frame is painted, not after.

     The name is keyed to the lot, so every new lot is a brand new element with
     no measured size on it yet — it paints at the rough guess in lotFit() and
     was then snapped to the measured one, which on a long name is a visible
     jump from 0.68 to 0.48. A layout effect runs after the DOM is built and
     before the browser draws, so the first frame the room sees is already the
     right size. */
  useIsomorphicLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return undefined;

    const fit = () => {
      el.style.setProperty("--fit", "1");
      const room = el.clientWidth;
      if (!room) return;

      // The name is nowrap in CSS, so this is already its one-line width.
      const needs = el.scrollWidth;

      /* Floored, so a freak entry cannot shrink the name to something nobody
         can read across a hall. Set below what the pool actually asks for:
         measured against the board's own column, the tightest name in it —
         "Shikhar Karengulwar" — needs 0.478, and the next three are 0.489,
         0.492 and 0.517. At 0.45 every name lands on one line with room to
         spare, and the smallest of them is still around 40px. */
      el.style.setProperty(
        "--fit",
        needs > room ? String(Math.max(0.45, room / needs)) : "1"
      );
    };

    fit();

    /* Measured again once the display face has actually loaded. It is wider
       than the fallback the first paint uses, so a name measured before it
       lands is measured too narrow, keeps --fit at 1, and then runs off the
       side of the card when the real font arrives. */
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) fit();
    });

    // The column is a share of the window, so a resized window is a new fit.
    window.addEventListener("resize", fit);
    return () => {
      alive = false;
      window.removeEventListener("resize", fit);
    };
  }, [lot?.name]);

  /* Finish with this lot and start the next, in one press and one write.
     Sending "next" on its own only took the stamp down, and the board then sat
     on "the next lot is on its way" for a beat before the order called itself.
     Putting the next name up IS what clears the stamp, so there is no gap to
     look at. With nothing left to call it just clears. */
  function advance() {
    return send(upNext ? { action: "lot", name: upNext } : { action: "next" });
  }

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
      /* While a sale or an unsold call is being announced the board goes quiet
         behind it — see .stage.is-announcing. */
      className={`stage${theme ? " is-themed" : ""}${
        announcing ? " is-announcing" : ""
      }`}
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
        /* The pause between two rounds. Everything the auction knows is held
           back so the room has one thing to read. */
        <div className="interlude">
          <p className="interlude-tag num">{roundName(round)}</p>
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
            <p className="lot-tag num">
              Under the hammer
              {roundTotal > 0 && (
                <span className="lot-count">
                  {String(calledSoFar).padStart(2, "0")} of {roundTotal}
                  {round > 1 && " unsold"}
                </span>
              )}
            </p>
            {/* Keyed to the name so every new lot runs the characters again
                rather than the text simply swapping under the room's eyes. */}
            <Decode
              as="h2"
              ref={nameRef}
              className={`live-name display${lotFit(lot.name)}`}
              key={lot.name}
              text={lot.name}
            />
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
              <Decode
                as="p"
                className="live-figure display"
                text={money(state.bid)}
                digits
              />
              <p className="live-leader num">
                {leader ? leader.name : "No bid yet"}
              </p>
            </div>
          </div>
        </div>
      ) : nextRoundReady ? (
        /* The round has been walked to the end. Rather than a bare screen and
           a small button somewhere, the room is shown exactly who is coming
           back: this is the moment the captains look up and count what they
           still need. */
        <div className="interlude">
          <p className="interlude-tag num">
            {roundName(round)} complete
          </p>
          <h2 className="interlude-line display">
            {reoffer.length} went unsold
          </h2>
          <ul className="recall">
            {reoffer.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          {admin && (
            <button
              type="button"
              className="stamp-next"
              disabled={busy}
              autoFocus
              onClick={() =>
                send({ action: "notice", notice: "unsold", pass: round + 1 })
              }
            >
              Next: {roundName(round + 1)}
            </button>
          )}
        </div>
      ) : complete ? (
        <div className="interlude">
          <p className="interlude-tag num">Every player allotted</p>
          <h2 className="interlude-line display">Auction completed</h2>
        </div>
      ) : (
        /* Nothing to say. The stamp is laid over the board rather than instead
           of it, and between lots the next name is already on its way — a
           "standing by" card only ever flashed up in the gap. */
        null
      )}

          {/* The run of play, under the lot. Not shown across an interlude or
              at the end of the night: those screens are one thing to read. */}
          {(state.current || upNext) && !state.notice && !nextRoundReady && !complete && (
            <AuctionStrip
              past={state.history.slice(-4)}
              current={state.current}
              next={upNext}
              sides={sides}
            />
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
          // Named apart from the `squad` state above, which is the panel that
          // is open — shadowing it here would be a trap for the next edit.
          const squadSize = held.get(side.name) ?? side.bought;
          const full = squadSize >= SQUAD_MAX;
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
                <Decode
                  as="b"
                  className="rail-purse num"
                  text={money(side.left)}
                  digits
                />
                <b className="rail-count num">
                  {squadSize}
                  <i>/{SQUAD_MAX}</i>
                </b>
              </div>

              {/* The squad as a bar as well as a figure: through a screen
                  share a filled bar survives compression that eats a small
                  numeral, and full is meant to read at a glance. */}
              <span
                className="rail-fill"
                style={{ "--n": squadSize, "--max": SQUAD_MAX }}
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

      {/* The moment, in three dimensions, behind whichever stamp is up. Only
          mounted while one is — nothing renders on an ordinary lot. */}
      <StageFX
        kind={sold ? "sold" : state.unsold ? "unsold" : null}
        color={buyer?.colorLit ?? buyer?.color ?? "#c8102e"}
      />

      {/* The sale itself. Held over the board rather than replacing it, so the
          player who has just gone is still on screen underneath. */}
      {sold && (
        <div className="sold" role="status">
          {/* SOLD is the smallest thing here now. It says what happened, and
              the room already knows what happened — what it wants is who, to
              whom, and for how much. Those get the size. */}
          <p className="sold-stamp num">Sold</p>

          <Decode
            as="p"
            className={`sold-name display${fitFor(sold.name)}`}
            key={sold.name}
            text={sold.name}
          />

          <p className="sold-to num">to</p>

          {/* The buying side in its own colour — the same one already washing
              the screen and lighting the field behind it. */}
          <Decode
            as="p"
            className={`sold-team display${fitFor(sold.team)}`}
            key={sold.team}
            text={sold.team}
          />

          <p className="sold-price display">
            <span className="sold-price-tag num">for</span>
            {money(sold.price)}
          </p>
          {admin && (
            <button
              type="button"
              className="stamp-next"
              disabled={busy}
              autoFocus
              onClick={advance}
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
          <p className="sold-stamp num">Unsold</p>
          <Decode
            as="p"
            className={`sold-name display${fitFor(state.unsold.name)}`}
            key={state.unsold.name}
            text={state.unsold.name}
          />
          <p className="sold-to num">No bids</p>
          <p className="sold-note num">He comes back in the {roundName(round + 1)}</p>
          {admin && (
            <button
              type="button"
              className="stamp-next"
              disabled={busy}
              autoFocus
              onClick={advance}
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
          players={livePlayers}
          paid={paid}
          onClose={() => setSquad(null)}
        />
      )}

      {/* One button, and only on the machine running the night. Everything
          else is a key, and the keys are behind it. The room is watching a
          broadcast, not an application. */}
      {admin && (
        <div className="deck">
          {/* The one control that is a moment rather than a habit: the round
              only opens once, and it opens in front of everybody. */}
          {state.notice ? (
            <button
              type="button"
              className="deck-btn is-go"
              disabled={busy}
              onClick={() => send({ action: "notice", notice: null })}
            >
              Begin the round
            </button>
          ) : null}

          {/* Beside the guide, and the same shape: two things the auctioneer
              opens between lots, neither of them part of the broadcast. */}
          <button
            type="button"
            className="deck-guide"
            onClick={() => setLedgerOpen(true)}
            aria-label="Sold, unsold and what is coming"
            title="Sold, unsold and what is coming"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {[3, 8, 13].map((y) => (
                <g key={y} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d={`M1 ${y}h1.4`} />
                  <path d={`M5.4 ${y}h9.6`} />
                </g>
              ))}
            </svg>
          </button>

          <button
            type="button"
            className="deck-guide"
            onClick={() => setGuideOpen(true)}
            aria-label="How to run the auction"
            title="How to run the auction"
          >
            ?
          </button>

          {error && <p className="deck-error num">{error}</p>}
        </div>
      )}

      {ledgerOpen && (
        <AuctionLedger
          sold={soldList}
          unsold={unsoldList}
          upcoming={upcoming}
          squads={squads}
          onClose={() => setLedgerOpen(false)}
        />
      )}

      {guideOpen && (
        <AuctionGuide
          busy={busy}
          onClose={() => setGuideOpen(false)}
          onRestart={() => {
            setGuideOpen(false);
            setConfirmRestart(true);
          }}
        />
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
