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

  return (
    <LobbySub
      eyebrow="The draw · Eight sides"
      title="Teams"
      reveal={REVEAL}
      lock={false}
      fill
      action={
        /* The iconic draw. Its own screen, because it takes over the room for
           ten seconds when it runs. */
        <Link className="fategrid-link" href="/lobby/fategrid">
          FateGrid
          <span aria-hidden="true">→</span>
        </Link>
      }
    >
      <div className="side-wrap">

        <SideGrid sides={table} players={players} paid={paid} />

      </div>
    </LobbySub>
  );
}
