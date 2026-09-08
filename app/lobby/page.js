import LobbyBar from "@/components/lobby/LobbyBar";
import LobbyGrid from "@/components/lobby/LobbyGrid";
import RestartSeason from "@/components/lobby/RestartSeason";
import { LOBBY_CARDS } from "@/data/lobbyCards";
import { isAdmin } from "@/lib/admin";
import { SEASON_4 } from "@/lib/cplData";

export const metadata = {
  title: "Season 4 — Campus Premier League",
  description:
    "The Season 4 lobby: teams, the auction, the fixtures, players, records and how to enter.",
};

/**
 * The lobby is one screen and never scrolls — that is the whole point of a
 * lobby. The shell is pinned to the viewport and the mosaic divides up whatever
 * height is left over, so every card is reachable without moving the page.
 */
// The Restart button is decided on the server, so its markup never reaches a
// browser that has no business with it.
export const dynamic = "force-dynamic";

export default async function LobbyPage() {
  const admin = await isAdmin();

  return (
    <>
      <div className="backdrop backdrop-vignette" aria-hidden="true" />
      <div className="backdrop backdrop-grain" aria-hidden="true" />

      <div className="lobby-shell">
        <LobbyBar />

        <main className="lobby" id="lobby">
          <div className="lobby-head lobby-top">
            <div>
              <p className="eyebrow">Campus Premier League</p>
              <h1 className="display lobby-title">Season 04</h1>
              <p className="lobby-sub num">
                Auction {SEASON_4[0].day} {SEASON_4[0].month} · Tournament{" "}
                {SEASON_4[1].day} {SEASON_4[1].month}
              </p>
            </div>

            {admin && <RestartSeason />}
          </div>

          <LobbyGrid cards={LOBBY_CARDS} />
        </main>
      </div>
    </>
  );
}
