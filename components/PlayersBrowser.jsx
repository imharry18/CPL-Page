"use client";

import { useDeferredValue, useMemo, useState } from "react";

/** Fold accents and case so "Rathi" finds "rathi" and stray spacing is ignored. */
function normalise(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** A player's own 1–5 rating from the entry form, as pips rather than a number. */
function Skill({ label, value }) {
  const level = Number(value) || 0;
  return (
    <div className="skill">
      <span className="skill-label">{label}</span>
      <span className="skill-pips" title={`${level} of 5`} aria-label={`${label}: ${level} of 5`}>
        {[1, 2, 3, 4, 5].map((step) => (
          <i key={step} className={step <= level ? "on" : undefined} aria-hidden="true" />
        ))}
      </span>
    </div>
  );
}

export default function PlayersBrowser({
  players,
  sides = [],
  order = [],
  admin = false,
}) {
  const [query, setQuery] = useState("");
  /* The running order starts as the file on disk and is replaced by whatever
     the shuffle writes, so the list re-lays itself without a reload. */
  const [draw, setDraw] = useState(order);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  /* Every side, by the name a player's `team` field holds. A captain is set
     by hand, a second year by the FateGrid draw, and a first year by the
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

  /* Three lists, because the pool is three different things, and a player's
     own `route` says which one they are in. The captains are appointed before
     a bid is taken, so they sit at the top in side order and never move. The
     second years are drawn to a side by the FateGrid, pot by pot. Only the
     first years actually go under the hammer, and that list is the running
     order. */
  const groups = useMemo(() => {
    const captainRows = sides
      .map((side) => paid.find((player) => player.team === side.name && player.route === "captain"))
      .filter(Boolean);

    const gridRows = paid
      .filter((player) => player.route === "fategrid")
      .sort((a, b) => a.pot - b.pot || a.name.localeCompare(b.name));

    // The drawn order leads; anyone the draw has not seen yet — a late entry —
    // falls in behind it.
    const at = new Map(draw.map((name, i) => [name, i]));
    const lotRows = paid
      .filter((player) => player.route === "auction")
      .sort(
        (a, b) =>
          (at.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
          (at.get(b.name) ?? Number.MAX_SAFE_INTEGER)
      );

    // In the pool, but neither drawn nor called: the first years, who have no
    // route into a side yet.
    const poolRows = paid
      .filter((player) => player.route === "pool")
      .sort((a, b) => a.name.localeCompare(b.name));

    return { captainRows, gridRows, lotRows, poolRows };
  }, [paid, sides, draw]);

  const results = useMemo(() => {
    const needle = normalise(deferredQuery.trim());
    const match = (list) =>
      needle ? list.filter((player) => player.search.includes(needle)) : list;
    return {
      captainRows: match(groups.captainRows),
      gridRows: match(groups.gridRows),
      lotRows: match(groups.lotRows),
      poolRows: match(groups.poolRows),
    };
  }, [groups, deferredQuery]);

  const found =
    results.captainRows.length +
    results.gridRows.length +
    results.lotRows.length +
    results.poolRows.length;

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
          {/* The captains are seven names already settled, read at a glance
              rather than studied — so their block is the tight one. */}
          <Group
            title="The captains"
            note="One to a side. Set before the auction, not won in it."
            rows={results.captainRows}
            sideByTeam={sideByTeam}
            badge="Captain"
            tight
          />

          <Group
            title="The FateGrid pool"
            note="Second years. Drawn to a side by the grid, never bid for."
            rows={results.gridRows}
            sideByTeam={sideByTeam}
          />

          <Group
            title="The auction pool"
            note="Second years from pots 3 and 4, in the order they will be called."
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

          <Group
            title="First years"
            note="In the pool, but not under the hammer — their route to a side is still to be decided."
            rows={results.poolRows}
            sideByTeam={sideByTeam}
          />

          {error && <p className="finder-empty">{error}</p>}
        </>
      )}
    </>
  );
}

/**
 * One block of the pool: its heading, and its rows numbered from one.
 *
 * `badge` is for the captains' block. A captain is already spoken for, so the
 * row says what they are rather than what they play — the rating underneath
 * still carries the game.
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
                {/* Only worth printing when it says something the badge did
                    not — plenty of entrants named the same position twice. */}
                {player.secondary && player.secondary !== player.role && (
                  <span className="player-second">also {player.secondary}</span>
                )}
                <Skill label="Rating" value={player.rating} />
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
