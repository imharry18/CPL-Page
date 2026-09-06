import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { isAdmin } from "@/lib/admin";

/**
 * Commit a FateGrid draw.
 *
 * The eight drawn players become their side's vice captain and are allotted to
 * it there and then — they do not go under the hammer afterwards. Written to
 * data/season4Players.json, the same file the captains sit in.
 *
 * A fresh draw clears the previous one first, so running the grid twice
 * replaces the eight rather than accumulating them.
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
    if (player.viceCaptain) {
      player.viceCaptain = false;
      player.team = "";
    }
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
