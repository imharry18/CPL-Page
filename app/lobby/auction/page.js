import AuctionLive from "@/components/lobby/AuctionLive";
import LobbySub from "@/components/lobby/LobbySub";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { photoFor, photoIndex, readOrder, readState } from "@/lib/auction";
import { REVEAL } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "Auction — Season 4, Campus Premier League",
  description:
    "The Season 4 auction, live. Every player in the pool goes under the hammer.",
};

// The board is the state of the room; it must never come from a cache.
export const dynamic = "force-dynamic";

export default async function LobbyAuctionPage() {
  const [{ players }, state, photos, order, admin] = await Promise.all([
    getPlayers(),
    readState(),
    photoIndex(),
    // The running order is public — the rules say so — and the board uses it
    // to tell the room who is coming, which matters most to anyone watching
    // on a call rather than sitting in the hall.
    readOrder(),
    /* The controls live on this page now, but they are still decided on the
       server: the board is public and shared to a call, and a visitor pressing
       "3" must not be able to bid. Only the machine with a .admin file gets
       them, and /api/auction refuses everyone else regardless. */
    isAdmin(),
  ]);

  // The whole pool goes down with the page so that the board can change lot
  // without a round trip for the player — only the state is polled.
  const pool = players.map((player) => ({
    name: player.name,
    year: player.year,
    role: player.role,
    prefers: player.prefers,
    // Carried so the squad panel can list who a side already holds, and mark
    // the one the FateGrid drew them.
    team: player.team ?? "",
    viceCaptain: Boolean(player.viceCaptain),
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
        order={order}
        admin={admin}
      />
    </LobbySub>
  );
}
