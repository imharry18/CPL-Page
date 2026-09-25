import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { publishNow } from "@/lib/auctionBus";
import { EMPTY, writeState } from "@/lib/auction";

/**
 * Back to zero.
 *
 * The night is three files, and until now each had its own way back: the
 * auction had a button behind the guide, the FateGrid had "Draw again", the
 * fixture had a redraw. Three ways to undo one evening is three ways to undo
 * half of it — a grid re-run over an auction already in progress, a fixture
 * redrawn after the room has seen it. So there is one button now, it lives in
 * the lobby, and it clears all three together:
 *
 *   the ledger      every bid, sale and unsold call
 *   the roster      every side won tonight, and the eight the grid drew
 *   the fixture     the Openers draw
 *
 * What survives is what was true before anyone sat down: the eight sides and
 * their captains. A captain's side is set by hand rather than won, so it is
 * not this route's to undo — and everything below leans on that, because a
 * captain cleared here could not be put back.
 */

const ROSTER = path.join(process.cwd(), "data", "season4Players.json");
const FIXTURE = path.join(process.cwd(), "data", "matches_round_1.json");

/** Write to a neighbour and rename over the top, as everything else does. */
async function save(file, value) {
  const temp = `${file}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 1)}\n`);
  await rename(temp, file);
}

export async function POST() {
  if (!(await isAdmin())) {
    return Response.json({ error: "not admin" }, { status: 403 });
  }

  const players = JSON.parse(await readFile(ROSTER, "utf8"));

  /* A captain is a player the roster marks `route: "captain"` and puts on that
     side. Matched on the route rather than on the name, because the two are
     spelled by different hands — a restart that clears a captain off their own
     side because a middle name did not line up is worse than no restart. */
  const captains = new Set(
    SEASON_4_SIDES.map(
      (side) =>
        players.find(
          (player) => player.team === side.name && player.route === "captain"
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

  await save(ROSTER, players);
  await save(FIXTURE, { drawn: false, matches: [] });

  const state = { ...EMPTY, bids: [], history: [] };
  await writeState(state);
  // Straight to every board that is watching, rather than waiting for the file
  // watcher: the screen at the front of the room must not carry a sale that no
  // longer exists.
  publishNow(state);

  return Response.json({ cleared, captains: captains.size });
}
