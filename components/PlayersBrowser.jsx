"use client";

import { useDeferredValue, useMemo, useState } from "react";

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

export default function PlayersBrowser({ players, sides = [] }) {
  const [query, setQuery] = useState("");

  /* A side names its captain by first name only, so the captain is the player
     on that side whose first name matches. Keyed by player name, carrying the
     side's own two colours so the row can wear them. */
  const captains = useMemo(() => {
    const map = new Map();
    for (const side of sides) {
      if (!side.name || !side.captain) continue;
      const player = players.find(
        (entry) =>
          entry.team === side.name &&
          entry.name.split(" ")[0].toLowerCase() === side.captain.toLowerCase()
      );
      if (player) map.set(player.name, side);
    }
    return map;
  }, [sides, players]);

  // Typing stays instant even while 96 rows re-filter: React renders the input
  // with the new value immediately and the list with the value it can keep up
  // with. Without this, every keystroke waits for the whole list.
  const deferredQuery = useDeferredValue(query);

  // Precompute the searchable string once, not on every keystroke.
  const indexed = useMemo(
    () => players.map((player) => ({ ...player, search: normalise(player.name) })),
    [players]
  );

  // Only players who have paid the entry fee. Everyone who entered stays in
  // data/season4Players.json — this list is a view over it, not the record —
  // so someone can be added back later by flipping their "paid" flag.
  const paid = useMemo(() => indexed.filter((player) => player.paid), [indexed]);

  const results = useMemo(() => {
    const needle = normalise(deferredQuery.trim());
    if (!needle) return paid;
    return paid.filter((player) => player.search.includes(needle));
  }, [paid, deferredQuery]);

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

      </div>

      {/* aria-live means a screen reader hears the count change as you type,
          instead of silence. */}
      <p className="finder-count" aria-live="polite">
        <span className="num">{String(results.length).padStart(2, "0")}</span>
        {results.length === 1 ? " player" : " players"}
        {results.length !== paid.length && ` of ${paid.length}`}
      </p>

      {results.length === 0 ? (
        <p className="finder-empty">
          No player matches “{query}”. Check the spelling.
        </p>
      ) : (
        <ol className="roster">
          {results.map((player, i) => (
            <li
              className={`player${captains.has(player.name) ? " is-captain" : ""}`}
              key={`${player.name}-${i}`}
              style={
                captains.has(player.name)
                  ? {
                      "--team": captains.get(player.name).color,
                      "--team-lit": captains.get(player.name).colorLit,
                    }
                  : undefined
              }
            >
              <span className="player-no num">{String(i + 1).padStart(2, "0")}</span>

              <span className="player-id">
                <b>{player.name}</b>
                <small>
                  {player.year}
                  {player.hostellite && " · Hostellite"}
                  {player.prefers && ` · Prefers ${player.prefers.toLowerCase()}`}
                </small>
                {/* Set at the auction. Until a side calls the player, there is
                    nothing to show rather than an empty placeholder. */}
                {player.team && (
                  <span className="player-team">
                    {captains.has(player.name) && (
                      <b className="player-captain">Captain</b>
                    )}
                    {player.team}
                  </span>
                )}
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
