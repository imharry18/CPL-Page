import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { SQUAD_MAX } from "@/lib/auctionMoney";

/**
 * Commit a FateGrid draw.
 *
 * The drawn players are allotted to their side there and then — they do not go
 * under the hammer afterwards. Written to data/season4Players.json, the same
 * file the captains sit in. `viceCaptain` is the mark of having been drawn
 * rather than bought, which is what lets a re-draw find them again.
 *
 * A fresh draw clears the previous one first, so running the grid twice
 * replaces the drawn rather than accumulating them.
 */

const FILE = path.join(process.cwd(), "data", "season4Players.json");

export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "not admin" }, { status: 403 });
  }

  const { pairs } = await request.json();
  if (!Array.isArray(pairs) || pairs.length === 0) {
    return Response.json({ error: "pairs required" }, { status: 400 });
  }

  const players = JSON.parse(await readFile(FILE, "utf8"));
  const byName = new Map(players.map((player) => [player.name, player]));

  /* A captain is never a vice captain. Checked here as well as in the page
     that builds the draw, because this route rewrites the same field the
     captains live in — and the cleanup below would clear a captain's side if
     one had ever been flagged. */
  const captains = new Set(
    SEASON_4_SIDES.map((side) => {
      const match = players.find(
        (player) => player.team === side.name && player.route === "captain"
      );
      return match?.name;
    }).filter(Boolean)
  );

  const clash = pairs.filter(({ player }) => captains.has(player));
  if (clash.length) {
    return Response.json(
      { error: `captain cannot be a vice captain: ${clash.map((c) => c.player).join(", ")}` },
      { status: 409 }
    );
  }

  const missing = pairs.filter(({ player }) => !byName.has(player));
  if (missing.length) {
    return Response.json(
      { error: `no such player: ${missing.map((m) => m.player).join(", ")}` },
      { status: 404 }
    );
  }

  // Clear the last draw. Only vice captains are touched: a captain's side is
  // set by hand and a bought player's by the auction, and neither is this
  // route's to undo.
  for (const player of players) {
    if (player.viceCaptain && !captains.has(player.name)) {
      player.viceCaptain = false;
      player.team = "";
    }
  }

  /* A draw cannot push a side past the ten.
   *
   * The auction counts a side's squad off the roster plus what it has bought,
   * so while the iconic eight are undrawn every side looks a man smaller than
   * it will finish and may buy one more than it should. Run the grid after
   * that has happened and a side quietly ends up with eleven. This will not
   * write that: it refuses, and says which side and by how much, so the draw
   * is re-made rather than the roster silently broken.
   *
   * Counted after the clear above, so re-running the same draw is not read as
   * adding a second vice captain to every side.
   */
  const full = [];
  const taking = new Map();
  for (const { side } of pairs) taking.set(side, (taking.get(side) ?? 0) + 1);
  for (const [side, adding] of taking) {
    // Counted against everything the draw gives this side, not one at a time:
    // a side now draws two, and checking them singly lets the second through.
    const held = players.filter((player) => player.team === side).length;
    if (held + adding > SQUAD_MAX) {
      full.push(`${side} would hold ${held + adding}`);
    }
  }
  if (full.length) {
    return Response.json(
      {
        error: `the draw would take a side past ${SQUAD_MAX}: ${full.join(", ")}`,
      },
      { status: 409 }
    );
  }

  for (const { side, player } of pairs) {
    const record = byName.get(player);
    record.team = side;
    record.viceCaptain = true;
  }

  // Same write-and-rename as the auction ledger: a crash mid-save must not
  // leave the roster truncated.
  const temp = `${FILE}.tmp`;
  await writeFile(temp, `${JSON.stringify(players, null, 1)}\n`);
  await rename(temp, FILE);

  return Response.json({ allotted: pairs.length });
}
