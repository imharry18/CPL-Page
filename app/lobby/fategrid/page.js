import FateGrid from "@/components/lobby/FateGrid";
import LobbySub from "@/components/lobby/LobbySub";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { photoFor, photoIndex } from "@/lib/auction";
import { REVEAL } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "FateGrid — Season 1, Football Premier League",
  description:
    "Pot 1 and pot 2 drawn to the four second-year sides, decided on the spin.",
};

// The roster is read on every load, so an allotment made by the grid shows up
// without a rebuild.
export const dynamic = "force-dynamic";

export default async function FateGridPage() {
  const [{ players }, photos, admin] = await Promise.all([
    getPlayers(),
    photoIndex(),
    isAdmin(),
  ]);

  /* The grid is for the second years in pots 1 and 2, and for the four
     second-year sides only. Everyone else — pots 3 and 4, and every first
     year — goes under the hammer instead. Both facts are read off the roster
     rather than kept in a list of their own, so re-potting a player in
     data/season4Players.json is the whole change. */
  const sides = SEASON_4_SIDES.filter((side) => side.year === "2nd Year");

  const pool = players
    .filter((player) => player.route === "fategrid")
    .map((player) => ({
      name: player.name,
      role: player.role,
      rating: player.rating,
      pot: player.pot,
      team: player.team,
      photo: photoFor(photos, player.name),
    }));

  /* The draw as it already stands, read back off the roster rather than kept
     anywhere of its own: the grid's whole output is who sits on which side, so
     the allotment IS the record. Handed to the board so a page opened after
     the draw shows the pairs that were settled, not the trigger. */
  const drawn = pool
    .filter((player) => player.team)
    .map((player) => ({ side: player.team, player: player.name }));

  return (
    <LobbySub
      eyebrow="The names · The sides"
      title="FateGrid"
      reveal={REVEAL}
      lock={false}
      fill
    >
      <FateGrid sides={sides} players={pool} initial={drawn} admin={admin} />
    </LobbySub>
  );
}
