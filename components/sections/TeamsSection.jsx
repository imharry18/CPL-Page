import Image from "next/image";

export default function TeamsSection({ teams }) {
  return (
    <section id="teams" className="section">
      <div className="wrap">
        <div className="head reveal">
          <p className="eyebrow">Season 03 · Last year</p>
          <h2 className="display display-l head-title">Last year&rsquo;s eight.</h2>
          <p className="lede">
            These were the Season 3 franchises. Season 4 squads do not exist yet —
            they are built from scratch at the auction on 12 September.
          </p>
          <div className="seam-rule head-rule" />
        </div>

        <div className="teams-grid">
          {teams.map((team, i) => (
            <article
              className="team reveal"
              key={team.id}
              style={{ "--team": team.color, "--delay": `${(i % 4) * 0.06}s` }}
            >
              <div className="team-crest">
                <Image
                  src={team.logo}
                  alt=""
                  width={280}
                  height={280}
                  sizes="(max-width: 620px) 45vw, 240px"
                  loading={i < 4 ? "eager" : "lazy"}
                />
              </div>
              <h3 className="team-name">{team.name}</h3>
              <dl className="team-meta">
                <div>
                  <dt>Captain</dt>
                  <dd>{team.captain}</dd>
                </div>
                <div>
                  <dt>Squad</dt>
                  <dd className="num">{team.squad.length}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
