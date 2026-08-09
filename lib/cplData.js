import seasonsData from "@/data/CPL_ALL_SEASONS_SEASON_3_FINAL_UPDATED_SEASON_2.json";
import playersData from "@/data/CPL_PLAYERS_ALL_SEASONS_SEASON_3_FINAL_UPDATED_SEASON_2.json";

export { seasonsData };

const playerSeasonStats = playersData["Player Season Stats"] || [];

function getSeasonPlayerStats(seasonName) {
  return playerSeasonStats.filter((player) => player.season === seasonName);
}

export const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "champions", label: "Champions" },
  { id: "stats", label: "Stats" },
  { id: "format", label: "Format" },
  { id: "register", label: "Register" },
];

const SEASON_COLORS = {
  1: "#fbbf24",
  2: "#ef4444",
  3: "#38bdf8",
  4: "#6366f1",
};

const S1_TOP_BAT = getSeasonPlayerStats("CPL Season 1");
const S1_TOP_BOWL = [...S1_TOP_BAT];
const S2_TOP_BAT = getSeasonPlayerStats("CPL Season 2");
const S2_TOP_BOWL = [...S2_TOP_BAT];

function sumPlayerStat(statKey) {
  return playerSeasonStats.reduce((total, player) => total + (Number(player[statKey]) || 0), 0);
}

function getAllTimeTopPlayer(statKey) {
  const playerTotals = {};
  playerSeasonStats.forEach(p => {
    // Normalizing names slightly to avoid case mismatches
    let name = (p.player || "").trim();
    if (!name) return;
    if (!playerTotals[name]) {
      playerTotals[name] = 0;
    }
    playerTotals[name] += (Number(p[statKey]) || 0);
  });

  const sorted = Object.entries(playerTotals).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    return { player: sorted[0][0], value: sorted[0][1] };
  }
  return null;
}

export function getLeagueHighlights() {
  const topRuns = getAllTimeTopPlayer("runs");
  const topWickets = getAllTimeTopPlayer("wickets");
  const topSixes = getAllTimeTopPlayer("sixes");
  const topFours = getAllTimeTopPlayer("fours");

  return {
    totals: {
      runs: sumPlayerStat("runs"),
      wickets: sumPlayerStat("wickets"),
      sixes: sumPlayerStat("sixes"),
      fours: sumPlayerStat("fours"),
    },
    leaders: {
      runs: topRuns
        ? { player: topRuns.player, season: "All Time", value: `${topRuns.value} runs` }
        : { player: "—", season: "", value: "—" },
      wickets: topWickets
        ? { player: topWickets.player, season: "All Time", value: `${topWickets.value} wickets` }
        : { player: "—", season: "", value: "—" },
      sixes: topSixes
        ? { player: topSixes.player, season: "All Time", value: `${topSixes.value} sixes` }
        : { player: "—", season: "", value: "—" },
      fours: topFours
        ? { player: topFours.player, season: "All Time", value: `${topFours.value} fours` }
        : { player: "—", season: "", value: "—" },
    },
  };
}

export function getChampions() {
  const s3 = seasonsData["CPL Season 3 Overall"] || {};

  const s1TopRuns = [...S1_TOP_BAT].sort((a, b) => (b.runs || 0) - (a.runs || 0))[0];
  const s1TopWkts = [...S1_TOP_BOWL]
    .filter((p) => (p.wickets || 0) > 0)
    .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0];

  return [
    {
      season: 1,
      year: "2025",
      winner: "Chennai Super Kings",
      captain: "Harshvardhan",
      runnerUp: "Sunrisers Hyderabad",
      final: "CSK won the inaugural season",
      topScorer: s1TopRuns
        ? `${s1TopRuns.player} — ${s1TopRuns.runs} runs`
        : "Ansh — 119 runs",
      topWickets: s1TopWkts
        ? `${s1TopWkts.player} — ${s1TopWkts.wickets} wickets`
        : "Harsh Vardhan — 8 wickets",
      venue: "Basket Ball Court",
      color: SEASON_COLORS[1],
    },
    {
      season: 2,
      year: "2025",
      winner: "Royal Challengers Bengaluru",
      captain: "Harish",
      runnerUp: "Chennai Super Kings",
      final: "RCB finished top of the Season 2 standings",
      topScorer: S2_TOP_BAT.length
        ? `${[...S2_TOP_BAT].sort((a, b) => (b.runs || 0) - (a.runs || 0))[0].player} — ${[...S2_TOP_BAT].sort((a, b) => (b.runs || 0) - (a.runs || 0))[0].runs} runs`
        : "Keshav Gupta — 125 runs",
      topWickets: S2_TOP_BOWL.length
        ? `${[...S2_TOP_BOWL].sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0].player} — ${[...S2_TOP_BOWL].sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0].wickets} wickets`
        : "Ansh — 10 wickets",
      venue: "Football Ground",
      color: SEASON_COLORS[2],
    },
    {
      season: 3,
      year: "2026",
      winner: s3.Winner || "The Godfathers",
      captain: "Shantanu",
      runnerUp: s3["Runner Up"] || "Rastriya Rifles",
      final: s3["Final Result"] || s3.Final || "",
      topScorer: s3["Top Run Scorer"]
        ? `${s3["Top Run Scorer"]} — ${s3["Top Runs"]} runs`
        : "Harish — 186 runs",
      topWickets: s3["Top Wicket Taker"]
        ? `${s3["Top Wicket Taker"]} — ${s3["Top Wickets"]} wickets`
        : "Harshit — 14 wickets",
      venue: "Football Ground",
      color: SEASON_COLORS[3],
    },
  ];
}

export function getSeasonOverview() {
  const s1Overall = seasonsData["CPL Season 1 Overall"] || [];
  const s2Overall = seasonsData["CPL Season 2 Overall"] || [];
  const s3Overall = seasonsData["CPL Season 3 Overall"] || {};

  const s1Map = Object.fromEntries(
    s1Overall.map((row) => [row.Statistic, row.Value])
  );
  const s2Map = Object.fromEntries(
    s2Overall.map((row) => [row.Statistic, row.Value])
  );

  return {
    s1: {
      matches: s1Map.Matches ?? 13,
      sixes: s1Map.Sixes ?? 160,
      runs: s1Map.Runs ?? 1515,
      teams: (seasonsData["CPL Season 1 Points"] || []).length,
    },
    s2: {
      matches: s2Map.Matches ?? 16,
      sixes: s2Map.Sixes ?? 131,
      runs: s2Map.Runs ?? 1853,
      teams: (seasonsData["CPL Season 2 Points"] || []).length,
    },
    s3: {
      matches: null,
      sixes: s3Overall["Tournament Sixes"] ?? 208,
      fours: s3Overall["Tournament Fours"] ?? 86,
      teams: (seasonsData["CPL Season 3 Points - Group A"] || []).length,
    },
  };
}

export function getSeasonStats(seasonKey) {
  if (seasonKey === "s1") {
    const players = getSeasonPlayerStats("CPL Season 1");
    return {
      points: seasonsData["CPL Season 1 Points"] || [],
      topBat: [...players].sort((a, b) => (b.runs || 0) - (a.runs || 0)).slice(0, 5),
      topBowl: [...players]
        .filter((p) => (p.wickets || 0) > 0)
        .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
        .slice(0, 5),
      qualifyCount: 2,
      overview: (seasonsData["CPL Season 1 Overall"] || []).slice(0, 8),
      hasData: true,
    };
  }

  if (seasonKey === "s2") {
    const players = getSeasonPlayerStats("CPL Season 2");
    return {
      points: seasonsData["CPL Season 2 Points"] || [],
      topBat: [...players].sort((a, b) => (b.runs || 0) - (a.runs || 0)).slice(0, 5),
      topBowl: [...players]
        .filter((p) => (p.wickets || 0) > 0)
        .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
        .slice(0, 5),
      qualifyCount: 4,
      overview: (seasonsData["CPL Season 2 Overall"] || []).slice(0, 8),
      hasData: true,
    };
  }

  if (seasonKey === "s3") {
    const players = getSeasonPlayerStats("CPL Season 3");
    return {
      points: seasonsData["CPL Season 3 Points - Group A"] || [],
      topBat: [...players].sort((a, b) => (b.runs || 0) - (a.runs || 0)).slice(0, 5),
      topBowl: [...players]
        .filter((p) => (p.wickets || 0) > 0)
        .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
        .slice(0, 5),
      qualifyCount: 4,
      overview: Object.entries(seasonsData["CPL Season 3 Overall"] || {})
        .filter(([key]) =>
          ["Tournament Sixes", "Tournament Fours", "Top Runs", "Top Wickets"].includes(key)
        )
        .map(([key, val]) => ({ Statistic: key.replace("Tournament ", ""), Value: val })),
      hasData: true,
    };
  }

  return { points: [], topBat: [], topBowl: [], qualifyCount: 0, overview: [], hasData: false };
}

export function formatNrr(nrr) {
  if (nrr == null || nrr === "") return "—";
  const num = Number(nrr);
  if (Number.isNaN(num)) return "—";
  return `${num > 0 ? "+" : ""}${num}`;
}
