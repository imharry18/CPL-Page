"use client";

import { useState } from "react";

import TeamCards from "@/components/TeamCards";

/**
 * The only genuinely interactive part of the page, so the only section that
 * needs to be a Client Component. It receives finished tables as props — it
 * never sees the source JSON.
 */

const SEASONS = [
  { key: "s1", label: "Season 1", title: "CPL Season 1" },
  { key: "s2", label: "Season 2", title: "CPL Season 2" },
  { key: "s3", label: "Season 3", title: "CPL Season 3 — Group A" },
];

const VIEWS = [
  { key: "points", label: "Points table", meta: "Standings" },
  { key: "batting", label: "Batting", meta: "Most runs" },
  { key: "bowling", label: "Bowling", meta: "Most wickets" },
  { key: "overview", label: "Overview", meta: "Tournament totals" },
  // Only Season 3's franchises were recorded, so this tab is offered on that
  // season alone rather than shown empty on the other two.
  { key: "teams", label: "Teams", meta: "The eight franchises", season: "s3" },
];

function formatNrr(nrr) {
  if (nrr == null || nrr === "") return "—";
  const value = Number(nrr);
  if (Number.isNaN(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

export default function StatsSection({ seasons, teams }) {
  const [season, setSeason] = useState("s3");
  const [view, setView] = useState("points");

  const data = seasons[season];
  const seasonMeta = SEASONS.find((s) => s.key === season);
  const viewMeta = VIEWS.find((v) => v.key === view);
  const views = VIEWS.filter((v) => !v.season || v.season === season);

  return (
    <section id="stats" className="section">
      <div className="wrap">
        <div className="head reveal">
          <p className="eyebrow">The archive</p>
          <h2 className="display display-l head-title">Every ball counted.</h2>
          <div className="seam-rule head-rule" />
        </div>

        <div className="reveal">
          <div className="tabs" role="tablist" aria-label="Season">
            {SEASONS.map((s) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                className="tab"
                aria-selected={season === s.key}
                onClick={() => {
                  setSeason(s.key);
                  setView("points");
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="tabs tabs-secondary" role="tablist" aria-label="Table">
            {views.map((v) => (
              <button
                key={v.key}
                type="button"
                role="tab"
                className="tab"
                aria-selected={view === v.key}
                onClick={() => setView(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="panel" role="tabpanel" aria-label={`${seasonMeta.title} — ${viewMeta.label}`}>
            <div className="panel-bar">
              <b>{seasonMeta.title}</b>
              <span>{viewMeta.meta}</span>
            </div>

            {view === "points" && (
              <div className="table-scroll">
                <table className="table">
                  <caption className="sr-only">
                    {seasonMeta.title} points table
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="rank">#</th>
                      <th scope="col">Team</th>
                      <th scope="col">M</th>
                      <th scope="col">W</th>
                      <th scope="col">L</th>
                      <th scope="col">Pts</th>
                      <th scope="col">NRR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.points.map((team, i) => (
                      <tr
                        key={team.Team}
                        className={`${i < data.qualifyCount ? "qualified" : ""} ${
                          i === 0 ? "is-lead" : ""
                        }`}
                      >
                        <td className="rank">{String(i + 1).padStart(2, "0")}</td>
                        <td className="cell-name">{team.Team}</td>
                        <td>{team.M}</td>
                        <td>{team.W}</td>
                        <td>{team.L}</td>
                        <td className="cell-key">{team.Pts}</td>
                        <td className={team.NRR >= 0 ? "nrr-pos" : "nrr-neg"}>
                          {formatNrr(team.NRR)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === "batting" && (
              <div className="table-scroll">
                <table className="table">
                  <caption className="sr-only">{seasonMeta.title} leading run scorers</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="rank">#</th>
                      <th scope="col">Player</th>
                      <th scope="col">Runs</th>
                      <th scope="col">HS</th>
                      <th scope="col">Avg</th>
                      <th scope="col">SR</th>
                      <th scope="col">6s</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topBat.map((p, i) => (
                      <tr key={p.player_id || p.player} className={i === 0 ? "is-lead" : ""}>
                        <td className="rank">{String(i + 1).padStart(2, "0")}</td>
                        <td className="cell-name">{p.player}</td>
                        <td className="cell-key">{p.runs}</td>
                        <td>{p.highest_score ?? "—"}</td>
                        <td>{p.average ?? p.bat_average ?? "—"}</td>
                        <td>{p.strike_rate ?? "—"}</td>
                        <td>{p.sixes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === "bowling" && (
              <div className="table-scroll">
                <table className="table">
                  <caption className="sr-only">{seasonMeta.title} leading wicket takers</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="rank">#</th>
                      <th scope="col">Player</th>
                      <th scope="col">Wkts</th>
                      <th scope="col">Best</th>
                      <th scope="col">Econ</th>
                      <th scope="col">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topBowl.map((p, i) => (
                      <tr key={p.player_id || p.player} className={i === 0 ? "is-lead" : ""}>
                        <td className="rank">{String(i + 1).padStart(2, "0")}</td>
                        <td className="cell-name">{p.player}</td>
                        <td className="cell-key">{p.wickets}</td>
                        <td>{p.best_bowling ?? "—"}</td>
                        <td>{p.economy ?? "—"}</td>
                        <td>{p.bowling_average ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === "teams" && (
              <div className="panel-teams">
                <p className="panel-note">
                  These were the Season 3 franchises. Season 4 squads do not
                  exist yet — they are built from scratch at the auction.
                </p>
                <TeamCards teams={teams} />
              </div>
            )}

            {view === "overview" && (
              <dl className="overview">
                {data.overview.map((row) => (
                  <div key={row.Statistic}>
                    <dt>{row.Statistic}</dt>
                    <dd>
                      {typeof row.Value === "number" && row.Value % 1 !== 0
                        ? row.Value.toFixed(2)
                        : row.Value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
