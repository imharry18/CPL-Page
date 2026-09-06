import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { publishNow } from "@/lib/auctionBus";
import {
  BASE_PRICE,
  PURSE,
  SQUAD_MAX,
  nextBid,
  readOrder,
  readState,
  writeOrder,
  writeState,
} from "@/lib/auction";

/**
 * Every change the auction console makes.
 *
 * The console hides its own controls when it is not admin, but that is only
 * cosmetic — this is the check that actually holds, because anything the page
 * renders a visitor can un-hide.
 *
 * A sale is written HERE and nowhere else. data/season4Players.json holds the
 * pool and the eight captains — things that are true before a ball is bowled —
 * and must come through the night unchanged, so that starting again is a
 * matter of emptying one file rather than unpicking results from the roster.
 *
 * Squads are joined back on at read time in lib/players.js.
 */

export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "not admin" }, { status: 403 });
  }

  const { action, name, team, notice, names, pass } = await request.json();
  const state = await readState();

  switch (action) {
    // Put a player under the hammer. Bidding restarts at the base price.
    //
    // A player already resolved tonight cannot go up again: selling twice
    // charges two purses for one man and leaves whichever side lost the race
    // paying for somebody another side is fielding. Undo takes a result off
    // the ledger and makes the player available again — that is the way back.
    case "lot": {
      if (name) {
        const already = state.history.find(
          (sale) => sale.name === name && sale.team
        );
        if (already) {
          return Response.json(
            { error: `${name} is already sold to ${already.team}` },
            { status: 409 }
          );
        }
      }
      state.current = name ?? null;
      state.bid = BASE_PRICE;
      state.leader = null;
      state.bids = [];
      // A lot going up always takes the screen back from a notice or a stamp.
      state.notice = null;
      state.sold = null;
      break;
    }

    // Clear the SOLD stamp. Pressing Next in the console is the only thing
    // that takes it down, so the announcement lasts as long as the room needs.
    case "next":
      state.sold = null;
      break;

    // Hold a message up to the room instead of a lot. Nothing in the ledger
    // changes; this is the screen at the front of the hall pausing.
    case "notice":
      state.notice = notice ?? null;
      // The round travels with the notice that opens it, so a reload during
      // the pause comes back into round two rather than round one.
      if (pass) state.pass = pass;
      break;

    // Wipe the night and start again. Only the ledger is cleared — the running
    // order stays as drawn, and the captains' sides in season4Players.json are
    // not the auction's to touch.
    /**
     * Wipe the night back to the start.
     *
     * The ledger below, and every allotment the night made in the roster: the
     * FateGrid's vice captains as well as anything the auction sold. Captains
     * are left alone — their side is set by hand, not won, so a restart is not
     * this route's business to undo.
     *
     * A vice captain is spotted by having a side while not being a captain,
     * rather than by the viceCaptain flag alone: the flag is missing from
     * rows written before it existed, and a restart that leaves eight players
     * still allotted is worse than useless.
     */
    case "restart": {
      const roster = path.join(process.cwd(), "data", "season4Players.json");
      const players = JSON.parse(await readFile(roster, "utf8"));

      const captains = new Set(
        SEASON_4_SIDES.map(
          (side) =>
            players.find(
              (player) =>
                player.team === side.name &&
                side.captain &&
                player.name.split(" ")[0].toLowerCase() ===
                  side.captain.toLowerCase()
            )?.name
        ).filter(Boolean)
      );

      let cleared = 0;
      for (const player of players) {
        if (!player.team || captains.has(player.name)) continue;
        player.team = "";
        player.viceCaptain = false;
        cleared += 1;
      }

      if (cleared) {
        const temp = `${roster}.tmp`;
        await writeFile(temp, `${JSON.stringify(players, null, 1)}\n`);
        await rename(temp, roster);
      }

      state.sold = null;
      state.current = null;
      state.bid = BASE_PRICE;
      state.leader = null;
      state.bids = [];
      state.notice = null;
      state.pass = 1;
      state.history = [];
      break;
    }

    // Redraw the running order. The order is a file rather than state, so this
    // is the one action that writes outside the ledger.
    case "shuffle": {
      const pool =
        Array.isArray(names) && names.length ? names : await readOrder();
      const deck = [...pool];
      for (let k = deck.length - 1; k > 0; k--) {
        const swap = Math.floor(Math.random() * (k + 1));
        [deck[k], deck[swap]] = [deck[swap], deck[k]];
      }
      await writeOrder(deck);
      return Response.json({ ...state, order: deck });
    }

    // A side bids. The price is worked out here, not sent by the console —
    // the increment is a rule of the auction, so the ledger owns it. Clicking
    // a side IS the raise: first bid takes the base price, every one after it
    // goes up a step.
    case "bid": {
      if (!state.current) {
        return Response.json({ error: "no lot" }, { status: 409 });
      }
      if (state.leader === team) {
        return Response.json(
          { error: `${team} already holds the bid` },
          { status: 409 }
        );
      }

      // A full squad is out of the bidding. Checked here rather than only in
      // the console, because a bid a side cannot be allowed to win would still
      // push the price up on everyone else.
      const held = state.history.filter((sale) => sale.team === team).length;
      if (held >= SQUAD_MAX) {
        return Response.json(
          { error: `${team} already has ${SQUAD_MAX} players` },
          { status: 409 }
        );
      }

      const price = nextBid(state.bid, Boolean(state.leader));
      const spent = state.history
        .filter((sale) => sale.team === team)
        .reduce((total, sale) => total + sale.price, 0);

      if (price > PURSE - spent) {
        return Response.json(
          { error: `${team} cannot cover this bid` },
          { status: 409 }
        );
      }

      state.bids = [...(state.bids ?? []), { team, price }];
      state.bid = price;
      state.leader = team;
      break;
    }

    // Step one bid back on the live lot. Not the same as Undo: this takes back
    // a raise that was called wrong, where Undo takes back a whole sale. With
    // no bids left the lot sits at the base price with nobody leading.
    case "undobid": {
      const bids = [...(state.bids ?? [])];
      if (bids.length === 0) {
        return Response.json({ error: "no bid to take back" }, { status: 409 });
      }
      bids.pop();
      const previous = bids[bids.length - 1];
      state.bids = bids;
      state.bid = previous ? previous.price : BASE_PRICE;
      state.leader = previous ? previous.team : null;
      break;
    }

    case "sold": {
      if (!state.current || !state.leader) {
        return Response.json(
          { error: "need a lot and a leading bidder" },
          { status: 409 }
        );
      }
      const sale = {
        name: state.current,
        team: state.leader,
        price: state.bid,
      };
      state.history.push(sale);
      // Held up to the room until "Next" is pressed.
      state.sold = sale;
      state.current = null;
      state.bid = BASE_PRICE;
      state.leader = null;
      state.bids = [];
      break;
    }

    // Unsold is recorded too, so the log is the whole story of the night and
    // Undo can walk back over it.
    case "unsold": {
      if (!state.current) {
        return Response.json({ error: "no lot" }, { status: 409 });
      }
      state.history.push({ name: state.current, team: null, price: 0 });
      state.current = null;
      state.bid = BASE_PRICE;
      state.leader = null;
      state.bids = [];
      break;
    }

    // Undo the last result and put that player back under the hammer, so the
    // correction is one press rather than a hunt through the pool.
    case "undo": {
      const last = state.history.pop();
      if (!last) {
        return Response.json({ error: "nothing to undo" }, { status: 409 });
      }
      state.sold = null;
      state.current = last.name;
      state.bid = last.price || BASE_PRICE;
      state.leader = null;
      state.bids = [];
      break;
    }

    case "reset":
      state.bid = BASE_PRICE;
      state.leader = null;
      state.bids = [];
      break;

    default:
      return Response.json({ error: `unknown action ${action}` }, { status: 400 });
  }

  await writeState(state);
  // Straight to every board, rather than waiting for the file watcher to
  // notice. The watcher still runs, but only as a safety net.
  publishNow(state);
  return Response.json(state);
}
