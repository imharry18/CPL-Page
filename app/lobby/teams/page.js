import LobbySub from "@/components/lobby/LobbySub";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { mask } from "@/lib/cipher";
import { REVEAL } from "@/lib/cplData";

export const metadata = {
  title: "Teams — Season 4, Campus Premier League",
  description:
    "The eight Season 4 sides. Squads are built from scratch at the auction on 12 September.",
};

export default function LobbyTeamsPage() {
  const named = SEASON_4_SIDES.filter((side) => side.name).length;
  const left = SEASON_4_SIDES.length - named;

  return (
    <LobbySub
      eyebrow="The draw · Eight sides"
      title="Teams"
      reveal={REVEAL}
      lock={false}
    >
      <div className="side-wrap">
        {/* Three states, because "8 named, 0 to come" is not a sentence and
            neither is promising names that have already arrived. */}
        <p className="side-lede">
          {left === 0 ? (
            <>
              All eight named. <span className="lit">Squads</span> are drawn at
              the Live Auction — {REVEAL.date}, {REVEAL.time}.
            </>
          ) : (
            <>
              {named === 0 ? "Eight sides." : `${named} named, ${left} to come.`}{" "}
              <span className="lit">Revealed soon</span> at the Live Auction —{" "}
              {REVEAL.date}, {REVEAL.time}.
            </>
          )}
        </p>

        <div className="side-grid">
          {SEASON_4_SIDES.map((side, i) => (
            <article
              className={`side${side.name ? " is-named" : ""}`}
              key={side.no}
              /* Each card enters, and its floodlight sweeps, a beat after the
                 one before it — eight at once reads as a flicker. */
              style={{
                "--i": i,
                ...(side.logo ? { "--logo": `url("${side.logo}")` } : null),
              }}
            >
              <span className="side-art" aria-hidden="true" />
              <span className="side-sweep" aria-hidden="true" />
              <span className="side-scan" aria-hidden="true" />

              <p className="side-no num">{String(side.no).padStart(2, "0")}</p>

              {/* The name sits on the floor of the card; the detail below it is
                  collapsed to nothing until hover, and expanding it is what
                  lifts the name. */}
              {side.name ? (
                <div className="side-body">
                  <h2 className="side-name side-name-real display">
                    {side.name}
                  </h2>
                  <div className="side-detail">
                    <div>
                      {/* A captain can be named later than the side is, so an
                          unnamed one stays redacted rather than blank. */}
                      <p className="side-meta num">
                        Captain {side.captain || mask(side.no + 3, 3)}
                      </p>
                      <p className="side-note">{side.note}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="side-body">
                  <p className="cipher side-name">{mask(side.no, 7)}</p>
                  <div className="side-detail">
                    <div>
                      <p className="side-meta num">
                        Captain {mask(side.no + 3, 3)}
                      </p>
                      <p className="side-note side-teaser">{side.teaser}</p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </LobbySub>
  );
}
