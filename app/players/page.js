import Link from "next/link";
import Navbar from "@/components/Navbar";
import PlayersBrowser from "@/components/PlayersBrowser";
import { REGISTER_URL, SEASON_4, SECTIONS } from "@/lib/cplData";
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

// On this page the section links have to point back to the home page.
const NAV = SECTIONS.map((section) => ({ ...section, href: `/#${section.id}` }));

export default async function PlayersPage() {
  const { players } = await getPlayers();

  return (
    <>
      <a className="skip-link" href="#roster">
        Skip to the list
      </a>

      <div className="backdrop backdrop-vignette" aria-hidden="true" />
      <div className="backdrop backdrop-grain" aria-hidden="true" />

      <Navbar
        sections={NAV}
        registerUrl={REGISTER_URL}
        nextDate={`Auction ${SEASON_4[0].day} ${SEASON_4[0].month}`}
      />

      <main className="shell">
        <section id="roster" className="section players-page">
          <div className="wrap">
            <div className="head">
              <p className="eyebrow">Season 04 · Player pool</p>
              <h1 className="display display-l head-title">
                {players.length} in the hat.
              </h1>
              <p className="lede">
                Everyone who entered before the deadline. Skill ratings are the
                players’ own, from the entry form — the auction on {SEASON_4[0].day}{" "}
                {SEASON_4[0].month} decides who ends up where.
              </p>
              <div className="seam-rule head-rule" />
            </div>

            <PlayersBrowser players={players} />

            <p className="players-back">
              <Link className="btn" href="/">
                Back to the league
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
