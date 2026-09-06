import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import LobbySub from "@/components/lobby/LobbySub";
import MatchBoard from "@/components/lobby/MatchBoard";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { REVEAL, SEASON_4 } from "@/lib/cplData";

export const metadata = {
  title: "Matches — Season 4, Campus Premier League",
  description:
    "Twelve matches in a single day on 20 September. The draw is made at the Live Auction on 12 September.",
};

// The file is read on every request, never cached — otherwise a fresh draw
// would not show up on the next load.
export const dynamic = "force-dynamic";

const FILE = path.join(process.cwd(), "data", "matches_round_1.json");

/**
 * Read the Round 1 draw, and put it back to undrawn.
 *
 * A refresh always starts from an empty grid: the draw is something you make
 * on the night, in front of everyone, not a result the page remembers. The
 * matches stay in the file as a record of the last draw — only the flag is
 * cleared.
 */
async function readAndReset() {
  let saved;
  try {
    saved = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    return { drawn: false, matches: [] };
  }

  if (saved.drawn) {
    await writeFile(
      FILE,
      `${JSON.stringify({ ...saved, drawn: false }, null, 1)}\n`
    );
  }

  return { drawn: false, matches: saved.matches ?? [] };
}

export default async function LobbyMatchesPage() {
  const [round1, admin] = await Promise.all([readAndReset(), isAdmin()]);

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
