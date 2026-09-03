export default function ChampionsSection({ champions }) {
  return (
    <section id="champions" className="section">
      <div className="wrap">
        <div className="head reveal">
          <p className="eyebrow">Hall of champions</p>
          <h2 className="display display-l head-title">Three winners. No repeats.</h2>
          <div className="seam-rule head-rule" />
        </div>

        <div className="champ-list">
          {champions.map((champion, i) => (
            <article
              className="champ reveal"
              key={champion.season}
              style={{ "--champ-accent": champion.color, "--delay": `${i * 0.08}s` }}
            >
              <p className="champ-season">
                <b className="num">0{champion.season}</b>
                {champion.year}
              </p>

              <div>
                <h3 className="champ-name">{champion.winner}</h3>
                <p className="champ-sub">
                  Captain {champion.captain} · beat {champion.runnerUp} · {champion.venue}
                </p>
              </div>

              <div className="champ-stats">
                <p className="champ-stat">
                  <span>Most runs</span>
                  {champion.topScorer}
                </p>
                <p className="champ-stat">
                  <span>Most wickets</span>
                  {champion.topWickets}
                </p>
              </div>
            </article>
          ))}

          <div className="champ-open reveal">
            <div>
              <p className="champ-open-title">Season 04 — unclaimed</p>
              <p className="champ-open-note">Entries closed · decided 20 September</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
