import Image from "next/image";

/**
 * The eight franchise cards. Lives inside the archive's Season 3 tab, so there
 * is no scroll-reveal on the cards — they appear on a tab press, long after the
 * reveal observer has finished its pass, and would otherwise never be marked
 * visible.
 */
export default function TeamCards({ teams }) {
  return (
    <div className="teams-grid">
      {teams.map((team, i) => (
        <article className="team" key={team.id} style={{ "--team": team.color }}>
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
  );
}
