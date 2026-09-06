import AuctionLive from "@/components/lobby/AuctionLive";
import LobbySub from "@/components/lobby/LobbySub";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { photoFor, photoIndex, readState } from "@/lib/auction";
import { REVEAL } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "Auction — Season 4, Campus Premier League",
  description:
    "The Season 4 auction, live. Every player in the pool goes under the hammer on 12 September.",
};

// The board is the state of the room; it must never come from a cache.
export const dynamic = "force-dynamic";

export default async function LobbyAuctionPage() {
  const [{ players }, state, photos] = await Promise.all([
    getPlayers(),
    readState(),
    photoIndex(),
  ]);

  // The whole pool goes down with the page so that the board can change lot
  // without a round trip for the player — only the state is polled.
  const pool = players.map((player) => ({
    name: player.name,
    year: player.year,
    role: player.role,
    prefers: player.prefers,
    bat: player.bat,
    bowl: player.bowl,
    allround: player.allround,
    rating: player.rating,
    photo: photoFor(photos, player.name),
  }));

  return (
    <LobbySub
      eyebrow={`${REVEAL.date} · ${REVEAL.time}`}
      title="Auction"
      what="The lots"
      reveal={REVEAL}
      lock={false}
      head={false}
      fill
    >
      <AuctionLive
        sides={SEASON_4_SIDES}
        players={pool}
        initial={state}
      />
    </LobbySub>
  );
}
