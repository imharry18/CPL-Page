import FateGrid from "@/components/lobby/FateGrid";
import LobbySub from "@/components/lobby/LobbySub";
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

// The iconic eight are drawn fresh on every load, so the page cannot be
// prerendered with one set baked into it.
export const dynamic = "force-dynamic";

export default async function FateGridPage() {
  const [{ players }, photos, admin] = await Promise.all([
    getPlayers(),
    photoIndex(),
    isAdmin(),
  ]);

  /* The iconic eight. Marked at random for now — swap this for a flag on the
     player once the real list exists, and nothing else here has to change. */
  const pool = players.filter((player) => player.paid);
  const deck = [...pool];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const iconic = deck.slice(0, SEASON_4_SIDES.length).map((player) => ({
    name: player.name,
    role: player.role,
    rating: player.rating,
    photo: photoFor(photos, player.name),
  }));

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
