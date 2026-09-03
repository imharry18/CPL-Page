import AuctionLot from "@/components/lobby/AuctionLot";
import LobbySub from "@/components/lobby/LobbySub";
import { AUCTION_BASE, REVEAL } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "Auction — Season 4, Campus Premier League",
  description:
    "The Season 4 auction. Every player in the pool goes under the hammer at the Live Auction on 12 September.",
};

export default async function LobbyAuctionPage() {
  // One lot per entrant, so the count is the pool itself rather than a number
  // that has to be kept in step by hand.
  const { players } = await getPlayers();

  return (
    <LobbySub
      eyebrow={`${REVEAL.date} · ${REVEAL.time}`}
      title="Auction"
      what="The lots"
      reveal={REVEAL}
      fill
    >
      <AuctionLot total={players.length} basePrice={AUCTION_BASE} />
    </LobbySub>
  );
}
