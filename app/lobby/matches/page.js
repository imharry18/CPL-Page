import { readFile } from "node:fs/promises";
import path from "node:path";

import LobbySub from "@/components/lobby/LobbySub";
import MatchBoard from "@/components/lobby/MatchBoard";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { REVEAL, SEASON_4 } from "@/lib/cplData";

export const metadata = {
  title: "Matches — Season 4, Campus Premier League",
  description:
    "Fourteen matches in a single day on 20 September. The draw is made at the Live Auction, and every round after the first is seeded on the points table.",
};

// The file is read on every request, never cached — otherwise a fresh draw
// would not show up on the next load.
export const dynamic = "force-dynamic";

const FILE = path.join(process.cwd(), "data", "matches_round_1.json");

/**
 * Read the Round 1 draw.
 *
 * Reading only. This used to clear the `drawn` flag on the way past, which
 * made a page load a write — including the one Next fires when a link is
 * merely hovered — and meant the draw made in front of the room lasted
 * exactly until the next person opened the page. The fixture is a fact about
 * the night, so it is read the same way by everyone who asks.
 */
async function readDraw() {
  try {
    const saved = JSON.parse(await readFile(FILE, "utf8"));
    return { drawn: Boolean(saved.drawn), matches: saved.matches ?? [] };
  } catch {
    return { drawn: false, matches: [] };
  }
}

export default async function LobbyMatchesPage() {
  const [round1, admin] = await Promise.all([readDraw(), isAdmin()]);

  return (
    <LobbySub
      eyebrow={`${SEASON_4[1].day} ${SEASON_4[1].month} · Football Ground`}
      title="Matches"
      reveal={REVEAL}
      lock={false}
    >
      <MatchBoard
        sides={SEASON_4_SIDES}
        initial={round1}
        admin={admin}
        crownedOn={`${SEASON_4[1].day} ${SEASON_4[1].month}`}
      />
    </LobbySub>
  );
}
