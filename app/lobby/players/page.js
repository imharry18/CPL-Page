import Link from "next/link";
import LobbySub from "@/components/lobby/LobbySub";
import PlayersBrowser from "@/components/PlayersBrowser";
import { REVEAL, SEASON_4 } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";

/**
 * The registration sheet also holds email addresses, phone numbers and photo
 * links. None of that is here — data/season4Players.json is generated with
 * names and cricket details only, so there is no way for contact details to
 * reach the browser even by accident.
 */

export const metadata = {
  title: "Season 4 players — Campus Premier League",
  description:
    "Every player in the Season 4 pool, with year and self-rated batting, bowling and all-round skill. Search by name.",
};

export default async function PlayersPage() {
  const { players } = await getPlayers();

  return (
    <>
      <a className="skip-link" href="#roster">
        Skip to the list
      </a>

      {/* Part of the lobby rather than the main site: the lobby's bar, no
          navbar. The pool is the one thing here that is already public, so it
          carries no countdown. */}
      <LobbySub
        eyebrow="Season 04 · Player pool"
        title="Players"
        reveal={REVEAL}
        lock={false}
      >
        <div id="roster" className="players-page">
          <p className="lede players-lede">
            {players.length} in the hat — everyone who entered before the
            deadline. Skill ratings are the players’ own, from the entry form;
            the auction on {SEASON_4[0].day} {SEASON_4[0].month} decides who
            ends up where.
          </p>

          <PlayersBrowser players={players} />

          <p className="players-back">
            <Link className="btn" href="/lobby">
              Back to the lobby
            </Link>
          </p>
        </div>
      </LobbySub>
    </>
  );
}
