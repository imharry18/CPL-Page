"use client";

import { useDeferredValue, useMemo, useState } from "react";

const ROLES = ["All", "Batter", "Bowler", "All-rounder"];
const YEARS = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];
const SORTS = [
  { key: "name", label: "A–Z" },
  { key: "rating", label: "Rating" },
];

/** Fold accents and case so "Rathi" finds "rathi" and stray spacing is ignored. */
function normalise(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const PIP = { Best: 4, Good: 3, Average: 2, Okay: 1 };

function Skill({ label, value }) {
  const level = PIP[value] || 0;
  return (
    <div className="skill">
      <span className="skill-label">{label}</span>
      <span className="skill-pips" title={value} aria-label={`${label}: ${value}`}>
        {[1, 2, 3, 4].map((step) => (
          <i key={step} className={step <= level ? "on" : undefined} aria-hidden="true" />
        ))}
      </span>
    </div>
  );
}

export default function PlayersBrowser({ players }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [year, setYear] = useState("All");
  const [sort, setSort] = useState("name");

  // Typing stays instant even while 96 rows re-filter: React renders the input
  // with the new value immediately and the list with the value it can keep up
  // with. Without this, every keystroke waits for the whole list.
  const deferredQuery = useDeferredValue(query);

  // Precompute the searchable string once, not on every keystroke.
  const indexed = useMemo(
    () => players.map((player) => ({ ...player, search: normalise(player.name) })),
    [players]
  );

  const results = useMemo(() => {
    const needle = normalise(deferredQuery.trim());
    const list = indexed.filter(
      (player) =>
        (!needle || player.search.includes(needle)) &&
        (role === "All" || player.role === role) &&
        (year === "All" || player.year === year)
    );
    return sort === "rating"
      ? [...list].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
      : list;
  }, [indexed, deferredQuery, role, year, sort]);

  return (
    <>
      <div className="finder">
        <div className="finder-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a player"
            aria-label="Search players by name"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              Clear
            </button>
          )}
        </div>

        <div className="finder-filters">
          <div className="tabs" role="group" aria-label="Role">
            {ROLES.map((option) => (
              <button
                key={option}
                type="button"
                className="tab"
                aria-pressed={role === option}
                onClick={() => setRole(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="tabs tabs-secondary" role="group" aria-label="Year of study">
            {YEARS.map((option) => (
              <button
                key={option}
                type="button"
                className="tab"
                aria-pressed={year === option}
                onClick={() => setYear(option)}
              >
                {option === "All" ? "All years" : option.replace(" Year", "")}
              </button>
            ))}
          </div>

          <div className="tabs tabs-secondary" role="group" aria-label="Sort">
            {SORTS.map((option) => (
              <button
                key={option.key}
                type="button"
                className="tab"
                aria-pressed={sort === option.key}
                onClick={() => setSort(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* aria-live means a screen reader hears the count change as you type,
          instead of silence. */}
      <p className="finder-count" aria-live="polite">
        <span className="num">{String(results.length).padStart(2, "0")}</span>
        {results.length === 1 ? " player" : " players"}
        {results.length !== players.length && ` of ${players.length}`}
      </p>

      {results.length === 0 ? (
        <p className="finder-empty">
          No player matches “{query}”. Check the spelling, or clear the filters.
        </p>
      ) : (
        <ol className="roster">
          {results.map((player, i) => (
            <li className="player" key={`${player.name}-${i}`}>
              <span className="player-no num">{String(i + 1).padStart(2, "0")}</span>

              <span className="player-id">
                <b>{player.name}</b>
                <small>
                  {player.year}
                  {player.hostellite && " · Hostellite"}
                  {player.prefers && ` · Prefers ${player.prefers.toLowerCase()}`}
                </small>
              </span>

              <span className={`player-role role-${player.role.toLowerCase().replace("-", "")}`}>
                {player.role}
              </span>

              <span className="player-skills">
                <Skill label="Bat" value={player.bat} />
                <Skill label="Bowl" value={player.bowl} />
                <Skill label="All" value={player.allround} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
