import FateGrid from "@/components/lobby/FateGrid";
import LobbySub from "@/components/lobby/LobbySub";
import { SEASON_4_ICONIC } from "@/data/season4Iconic";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { photoFor, photoIndex } from "@/lib/auction";
import { REVEAL } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "FateGrid — Season 4, Campus Premier League",
  description:
    "Eight iconic players drawn to eight sides, decided on the spin.",
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

  /* The iconic eight, named in data/season4Iconic.js rather than drawn at
     random: the same eight face the grid on every load, and the auction knows
     to leave them alone. What the spin decides is which side each one goes to,
     not who is in the draw.

     A name that no longer matches the roster is dropped rather than rendered
     as a blank card — better eight minus one than a hole on the screen. */
  const byName = new Map(players.map((player) => [player.name, player]));
  const missing = SEASON_4_ICONIC.filter((name) => !byName.has(name));

  const iconic = SEASON_4_ICONIC.filter((name) => byName.has(name)).map(
    (name) => {
      const player = byName.get(name);
      return {
        name: player.name,
        role: player.role,
        rating: player.rating,
        photo: photoFor(photos, player.name),
      };
    }
  );

  if (missing.length) {
    console.warn("[fategrid] not in the roster:", missing.join(", "));
  }

  return (
    <LobbySub
      eyebrow="Eight names · Eight sides"
      title="FateGrid"
      reveal={REVEAL}
      lock={false}
      fill
    >
      <FateGrid sides={SEASON_4_SIDES} players={iconic} admin={admin} />
    </LobbySub>
  );
}
