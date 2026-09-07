import Link from "next/link";

import LobbySub from "@/components/lobby/LobbySub";
import SideGrid from "@/components/lobby/SideGrid";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { REVEAL } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";
import { purses, readState } from "@/lib/auction";

export const metadata = {
  title: "Teams — Season 4, Campus Premier League",
  description:
    "The eight Season 4 sides. Squads are built from scratch at the auction on 12 September.",
};

/* Squads and purses come out of the auction ledger, so this page is only ever
   as current as its last render. Prerendered at build time it would show the
   eight sides empty for the whole night. */
export const dynamic = "force-dynamic";

export default async function LobbyTeamsPage() {
  const [{ players }, state] = await Promise.all([getPlayers(), readState()]);

  // Purse and prices come from the auction ledger, not the player list: the
  // list records who a side bought, the ledger records what they paid.
  const table = purses(SEASON_4_SIDES, state.history);
  const paid = Object.fromEntries(
    state.history.filter((sale) => sale.team).map((sale) => [sale.name, sale.price])
  );

  const named = SEASON_4_SIDES.filter((side) => side.name).length;
  const left = SEASON_4_SIDES.length - named;

  return (
    <LobbySub
      eyebrow="The draw · Eight sides"
      title="Teams"
      reveal={REVEAL}
      lock={false}
      fill
    >
      <div className="side-wrap">
        {/* Three states, because "8 named, 0 to come" is not a sentence and
            neither is promising names that have already arrived. */}
        <div className="side-top">
        <p className="side-lede">
            {left === 0 ? (
              <>
                All eight named. <span className="lit">Squads</span> are drawn at
                the Live Auction — {REVEAL.date}, {REVEAL.time}.
              </>
            ) : (
              <>
                {named === 0 ? "Eight sides." : `${named} named, ${left} to come.`}{" "}
                <span className="lit">Revealed soon</span> at the Live Auction —{" "}
                {REVEAL.date}, {REVEAL.time}.
              </>
            )}
          </p>

          {/* The iconic draw. Its own screen, because it takes over the room
              for ten seconds when it runs. */}
          <Link className="fategrid-link" href="/lobby/fategrid">
            FateGrid
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <SideGrid sides={table} players={players} paid={paid} />

      </div>
    </LobbySub>
  );
}
