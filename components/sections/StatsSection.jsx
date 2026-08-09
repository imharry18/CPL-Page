"use client";

export default function StatsSection({ seasonStats, activeSeason, setActiveSeason, activeTab, setActiveTab, formatNrr, rankClass }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .section-stats {
          min-height: 140vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 10vh clamp(1rem, 5vw, 4rem); position: relative; background: transparent; box-sizing: border-box;
        }
        .stats-eyebrow { display: block; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: var(--accent-blue); margin-bottom: 1rem; text-align: center; }
        .stats-title { font-size: clamp(3rem, 6vw, 4.5rem); font-weight: 800; color: #fff; margin-bottom: 3rem; text-align: center; line-height: 1.1; letter-spacing: -0.04em; }
        .toggle-group { display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; padding: 0.5rem; background: rgba(20,20,20,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; backdrop-filter: blur(20px); margin-bottom: 1.5rem; }
        .toggle-btn { padding: 0.75rem 1.5rem; border-radius: 100px; background: transparent; border: none; color: var(--text-secondary); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; }
        .toggle-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .toggle-btn.active { background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%); color: #000; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); }
        .glass-panel { max-width: 900px; width: 100%; background: rgba(15,15,15,0.8); backdrop-filter: blur(40px) saturate(180%); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: clamp(1.5rem, 4vw, 3rem); box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05); }
        .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .panel-title { font-size: 1rem; font-weight: 700; color: var(--accent-blue); letter-spacing: 0.15em; text-transform: uppercase; }
        .panel-meta { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -1rem; padding: 0 1rem; }
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; text-align: left; }
        .data-table th { padding: 1rem; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.4); white-space: nowrap; }
        .data-table td { padding: 1rem; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.04); white-space: nowrap; transition: background 0.3s; }
        .data-table tr:hover td { background: rgba(255,255,255,0.03); }
        .data-table tr.qualified td { background: rgba(14, 165, 233, 0.05); }
        .data-table tr.top-player td { background: rgba(14, 165, 233, 0.08); }
        .team-name { font-weight: 600; color: #fff; }
        .pts-cell { font-weight: 800; color: var(--accent-blue); }
        .nrr-pos { color: #34d399; font-weight: 600; }
        .nrr-neg { color: #f87171; font-weight: 600; }
        .rank-gold td:first-child { color: #0ea5e9; font-weight: 800; }
        .rank-silver td:first-child { color: #e5e7eb; font-weight: 700; }
        .rank-bronze td:first-child { color: #cd7f32; font-weight: 700; }
        .qual-badge { display: inline-flex; align-items: center; justify-content: center; width: 1.25rem; height: 1.25rem; margin-left: 0.5rem; border-radius: 50%; background: rgba(14, 165, 233, 0.2); color: var(--accent-blue); font-size: 0.6rem; }
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
        .overview-item { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; text-align: center; }
        .ov-val { font-size: 1.8rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
        .ov-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; }
        .empty-box { text-align: center; padding: 3rem 1.5rem; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }
        .empty-title { font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .empty-desc { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; max-width: 400px; margin: 0 auto; }
      `}} />
      <section id="stats" className="section-stats">
        <div className="reveal">
          <span className="stats-eyebrow">Season Archives</span>
          <h2 className="stats-title">
            The Numbers
            <br />
            Don't Lie.
          </h2>
        </div>

        <div className="toggle-group reveal" data-delay="0.1s">
          <button type="button" className={`toggle-btn ${activeSeason === "s1" ? "active" : ""}`} onClick={() => { setActiveSeason("s1"); setActiveTab("points"); }}>Season 1</button>
          <button type="button" className={`toggle-btn ${activeSeason === "s2" ? "active" : ""}`} onClick={() => { setActiveSeason("s2"); setActiveTab("points"); }}>Season 2</button>
          <button type="button" className={`toggle-btn ${activeSeason === "s3" ? "active" : ""}`} onClick={() => { setActiveSeason("s3"); setActiveTab("points"); }}>Season 3</button>
        </div>

        {seasonStats.hasData ? (
          <>
            <div className="toggle-group reveal" data-delay="0.2s" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <button type="button" className={`toggle-btn ${activeTab === "points" ? "active" : ""}`} onClick={() => setActiveTab("points")} style={{ background: activeTab === 'points' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'points' ? '#fff' : 'var(--text-muted)' }}>Points Table</button>
              <button type="button" className={`toggle-btn ${activeTab === "batting" ? "active" : ""}`} onClick={() => setActiveTab("batting")} style={{ background: activeTab === 'batting' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'batting' ? '#fff' : 'var(--text-muted)' }}>Top Batters</button>
              <button type="button" className={`toggle-btn ${activeTab === "bowling" ? "active" : ""}`} onClick={() => setActiveTab("bowling")} style={{ background: activeTab === 'bowling' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'bowling' ? '#fff' : 'var(--text-muted)' }}>Top Bowlers</button>
              <button type="button" className={`toggle-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")} style={{ background: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'overview' ? '#fff' : 'var(--text-muted)' }}>Overview</button>
            </div>

            <div className="glass-panel reveal" data-delay="0.3s">
              <div className="panel-header">
                <span className="panel-title">
                  {activeSeason === "s1" ? "CPL Season 1" : activeSeason === "s2" ? "CPL Season 2" : "CPL Season 3 — Group A"}
                </span>
                <span className="panel-meta">
                  {activeTab === "points" && "Points Table"}
                  {activeTab === "batting" && "Orange Cap Race"}
                  {activeTab === "bowling" && "Purple Cap Race"}
                  {activeTab === "overview" && "Tournament Stats"}
                </span>
              </div>

              {activeTab === "points" && (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Team</th><th>M</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonStats.points.map((team, i) => (
                        <tr key={team.Team} className={`${i < seasonStats.qualifyCount ? "qualified" : ""} ${rankClass(i)}`}>
                          <td>{i + 1}</td>
                          <td className="team-name">{team.Team}{team.Qualifier === 1 && <span className="qual-badge" title="Qualified">Q</span>}</td>
                          <td>{team.M}</td><td>{team.W}</td><td>{team.L}</td><td className="pts-cell">{team.Pts}</td>
                          <td className={team.NRR >= 0 ? "nrr-pos" : "nrr-neg"}>{formatNrr(team.NRR)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "batting" && (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>#</th><th>Player</th><th>Team</th><th>Runs</th><th>HS</th><th>Avg</th><th>SR</th><th>6s</th></tr>
                    </thead>
                    <tbody>
                      {seasonStats.topBat.map((p, i) => (
                        <tr key={p.player_id || p.player} className={`${i === 0 ? "top-player" : ""} ${rankClass(i)}`}>
                          <td>{i + 1}</td><td className="team-name">{p.player}</td>
                          <td style={{ fontSize: "0.75rem", opacity: 0.6 }}>{p.team}</td>
                          <td className="pts-cell">{p.runs}</td><td>{p.highest_score ?? "—"}</td>
                          <td>{p.average ?? p.bat_average ?? "—"}</td><td>{p.strike_rate ?? "—"}</td><td>{p.sixes ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "bowling" && (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>#</th><th>Player</th><th>Team</th><th>Wkts</th><th>Best</th><th>Econ</th><th>Avg</th></tr>
                    </thead>
                    <tbody>
                      {seasonStats.topBowl.map((p, i) => (
                        <tr key={p.player_id || p.player} className={`${i === 0 ? "top-player" : ""} ${rankClass(i)}`}>
                          <td>{i + 1}</td><td className="team-name">{p.player}</td>
                          <td style={{ fontSize: "0.75rem", opacity: 0.6 }}>{p.team}</td>
                          <td className="pts-cell">{p.wickets}</td><td>{p.best_bowling ?? "—"}</td>
                          <td>{p.economy ?? "—"}</td><td>{p.bowling_average ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "overview" && (
                <div className="overview-grid">
                  {seasonStats.overview.map((row) => (
                    <div key={row.Statistic} className="overview-item">
                      <span className="ov-val">{typeof row.Value === "number" && row.Value % 1 !== 0 ? row.Value.toFixed(2) : row.Value}</span>
                      <span className="ov-label">{row.Statistic}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="glass-panel reveal" data-delay="0.2s" style={{ maxWidth: "480px" }}>
            <div className="empty-box">
              <div className="empty-icon">🏆</div>
              <p className="empty-title">Archive Being Restored</p>
              <p className="empty-desc">Detailed match stats for this season are currently being archived. Check the Champions section for the winner.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
