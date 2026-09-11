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

export default function PlayersBrowser({
  players,
  sides = [],
  iconic = [],
  order = [],
  admin = false,
}) {
  const [query, setQuery] = useState("");
  /* The running order starts as the file on disk and is replaced by whatever
     the shuffle writes, so the list re-lays itself without a reload. */
  const [draw, setDraw] = useState(order);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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

  /* Every side, by the name a player's `team` field holds. A captain is set
     by hand, an iconic player by the FateGrid draw, and everyone else by the
     auction — three different routes to the same fact, and the row wears the
     side's colours the moment any of them lands. */
  const sideByTeam = useMemo(
    () => new Map(sides.filter((side) => side.name).map((side) => [side.name, side])),
    [sides]
  );

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

  /* Three lists, because the pool is three different things. The eight
     captains and the eight iconic players are settled before a bid is taken —
     one is appointed, the other is drawn by the FateGrid — so they sit at the
     top in their own fixed order and never move. Everyone under them is what
     actually goes under the hammer, and that list is the running order. */
  const groups = useMemo(() => {
    const byName = new Map(paid.map((player) => [player.name, player]));

    const captainRows = sides
      .map((side) => paid.find((player) => captains.get(player.name) === side))
      .filter(Boolean);

    const iconicRows = iconic.map((name) => byName.get(name)).filter(Boolean);

    const spoken = new Set([
      ...captainRows.map((player) => player.name),
      ...iconicRows.map((player) => player.name),
    ]);

    // Everyone left is a lot. The drawn order leads; anyone the draw has not
    // seen yet — a late entry — falls in behind it, still alphabetical.
    const rest = paid.filter((player) => !spoken.has(player.name));
    const at = new Map(draw.map((name, i) => [name, i]));
    const lotRows = [...rest].sort(
      (a, b) =>
        (at.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
        (at.get(b.name) ?? Number.MAX_SAFE_INTEGER)
    );

    return { captainRows, iconicRows, lotRows };
  }, [paid, sides, captains, iconic, draw]);

  const results = useMemo(() => {
    const needle = normalise(deferredQuery.trim());
    const match = (list) =>
      needle ? list.filter((player) => player.search.includes(needle)) : list;
    return {
      captainRows: match(groups.captainRows),
      iconicRows: match(groups.iconicRows),
      lotRows: match(groups.lotRows),
    };
  }, [groups, deferredQuery]);

  const found =
    results.captainRows.length + results.iconicRows.length + results.lotRows.length;

  /* Redraw the order the auction will be called in. The same action the
     console used to own: it rewrites data/auctionOrder.json, which is the one
     place the board reads the night's running order from. The pool is sent
     with it so a player added since the last draw is dealt in. */
  async function shuffle() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "shuffle",
          names: groups.lotRows.map((player) => player.name),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "shuffle failed");
      setDraw(body.order ?? []);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }

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
        <span className="num">{String(found).padStart(2, "0")}</span>
        {found === 1 ? " player" : " players"}
        {found !== paid.length && ` of ${paid.length}`}
      </p>

      {found === 0 ? (
        <p className="finder-empty">
          No player matches “{query}”. Check the spelling.
        </p>
      ) : (
        <>
          {/* The captains are eight names already settled, read at a glance
              rather than studied — so their block is the tight one. */}
          <Group
            title="The captains"
            note="Eight sides, eight names. Set before the auction, not won in it."
            rows={results.captainRows}
            sideByTeam={sideByTeam}
            badge="Captain"
            tight
          />

          <Group
            title="Iconic players"
            note="Allotted by the FateGrid draw, one to each side. They never go under the hammer."
            rows={results.iconicRows}
            sideByTeam={sideByTeam}
            badge="Iconic"
          />

          <Group
            title="The auction pool"
            note="In the order they will be called on the night."
            rows={results.lotRows}
            sideByTeam={sideByTeam}
          >
            {admin && (
              <button
                type="button"
                className="btn roster-shuffle"
                disabled={busy}
                onClick={shuffle}
              >
                {busy ? "Drawing…" : "Shuffle the players"}
              </button>
            )}
          </Group>

          {error && <p className="finder-empty">{error}</p>}
        </>
      )}
    </>
  );
}

/**
 * One block of the pool: its heading, and its rows numbered from one.
 *
 * `badge` is for the two blocks that are not lots. A captain and an iconic
 * player are already spoken for, so the row says what they are rather than
 * what they play — the skills underneath still carry the cricket.
 */
function Group({ title, note, rows, sideByTeam, tight, badge, children }) {
  if (rows.length === 0) return null;

  return (
    <section className="roster-group">
      <div className="roster-head">
        <div className="roster-head-id">
          <h2 className="roster-title num">{title}</h2>
          <p className="roster-note">{note}</p>
        </div>
        {children}
      </div>

      <ol className={`roster${tight ? " is-tight" : ""}`}>
        {rows.map((player, i) => {
          const side = sideByTeam.get(player.team);

          return (
            <li
              className={`player${side ? " is-team" : ""}`}
              key={`${player.name}-${i}`}
              style={
                side
                  ? { "--team": side.color, "--team-lit": side.colorLit }
                  : undefined
              }
            >
              <span className="player-no num">{String(i + 1).padStart(2, "0")}</span>

              <span className="player-id">
                <b>{player.name}</b>
                {/* Set at the auction. Until a side calls the player, there is
                    nothing to show rather than an empty placeholder. */}
                {player.team && <span className="player-team">{player.team}</span>}
              </span>

              {badge ? (
                <span className={`player-role player-badge is-${badge.toLowerCase()}`}>
                  {badge}
                </span>
              ) : (
                <span className={`player-role role-${player.role.toLowerCase().replace("-", "")}`}>
                  {player.role}
                </span>
              )}

              <span className="player-skills">
                <Skill label="Bat" value={player.bat} />
                <Skill label="Bowl" value={player.bowl} />
                <Skill label="All" value={player.allround} />
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
