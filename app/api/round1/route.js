import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";

/**
 * Save the Round 1 draw.
 *
 * The admin check is repeated here on purpose. The Shuffle button is only
 * rendered for the auction machine, but a hidden button is not a lock — this
 * is the lock. Without it, anyone could POST a fixture of their choosing.
 *
 * Only side names that actually exist are accepted, and each side has to
 * appear exactly once across the four matches, so a malformed or partial draw
 * can never overwrite a good one.
 */

const FILE = path.join(process.cwd(), "data", "matches_round_1.json");

export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const { matches } = await request.json();

  const names = SEASON_4_SIDES.map((side) => side.name);
  const flat = Array.isArray(matches)
    ? matches.flatMap((match) => [match?.a, match?.b])
    : [];

  const valid =
    matches?.length === names.length / 2 &&
    flat.length === names.length &&
    flat.every((name) => names.includes(name)) &&
    new Set(flat).size === names.length;

  if (!valid) {
    return Response.json(
      { error: "each side must appear exactly once across four matches" },
      { status: 400 }
    );
  }

  // Written the same way as the auction ledger: to a neighbour and renamed
  // over the top, so a crash mid-save cannot leave the fixture truncated for
  // every board that is about to read it.
  const temp = `${FILE}.tmp`;
  await writeFile(temp, `${JSON.stringify({ drawn: true, matches }, null, 1)}\n`);
  await rename(temp, FILE);

  return Response.json({ drawn: true, matches });
}

/** The draw as it stands. Public: this is what is on the screen in the hall. */
export async function GET() {
  try {
    return Response.json(JSON.parse(await readFile(FILE, "utf8")), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // No draw made yet. Every board polls this, and a 500 here would put an
    // error in the console of every phone in the room.
    return Response.json({ drawn: false, matches: [] });
  }
}
