import seasonsData from "@/data/CPL_ALL_SEASONS_SEASON_3_FINAL_UPDATED_SEASON_2.json";
import playersData from "@/data/CPL_PLAYERS_ALL_SEASONS_SEASON_3_FINAL_UPDATED_SEASON_2.json";

export { seasonsData };

const playerSeasonStats = playersData["Player Season Stats"] || [];

function getSeasonPlayerStats(seasonName) {
  return playerSeasonStats.filter((player) => player.season === seasonName);
}

/**
 * The two Google Forms.
 *
 * To connect your own: open the form → Send → the link icon (🔗) → Copy, then
 * paste it here. That is the only change needed; every button on the site
 * reads these two constants.
 */
export const REGISTER_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScq9CSsKVhVQcWhjYG5UqFzhEZvUjDcFiVILCbMcI4LyhUIpA/viewform";

/**
 * The payment form. Same as REGISTER_URL: open your Google Form → Send → the
 * 🔗 link icon → Copy, and paste it between the quotes. Collect the UPI
 * reference number and the payment screenshot inside that form.
 *
 * Leave it empty and the "Pay entry fee" buttons simply do not render, rather
 * than pointing at nothing.
 */
export const PAYMENT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeQYv-IX5imUHn6nputIKhBPHNiTWvbq1FpGrKON4t0P2QQVQ/viewform";

/**
 * Live player list, pulled from a published Google Sheet tab.
 *
 * ⚠ NEVER point this at the raw "Form Responses 1" sheet. That sheet holds
 * email addresses and mobile numbers, and publishing it puts every entrant's
 * contact details on a public URL that needs no login.
 *
 * SAFE SETUP:
 *  1. In the responses spreadsheet, add a new tab called "Public".
 *  2. Put this in cell A1 of that tab — it copies across only the harmless
 *     columns and leaves email, phone and the photo link behind:
 *
 *       =QUERY('Form Responses 1'!A:L, "select C, D, E, H, I, J, K", 1)
 *
 *  3. File → Share → Publish to web → choose the "Public" tab (NOT "Entire
 *     document") → Comma-separated values (.csv) → Publish.
 *  4. Paste the URL it gives you below.
 *
 * Leave it empty and the site uses data/season4Players.json instead.
 */
export const PLAYERS_CSV_URL = "";

/**
 * The one moment everything in the lobby unlocks: the Live Auction.
 *
 * Teams, the auction lots, the fixtures and the rules are all held back until
 * this passes, so every locked screen reads from here rather than hard-coding
 * the date in four places.
 */
export const REVEAL = {
  iso: "2026-09-12T21:00:00",
  date: "12 Sep",
  time: "9:00 PM",
  note: "Live Auction",
};

/** What every lot opens at in the auction. */
export const AUCTION_BASE = "₹20,000";

/** Entry fee, shown next to the payment link. */
export const ENTRY_FEE = "₹100";

export const SECTIONS = [
  { id: "schedule", label: "Dates" },
  { id: "champions", label: "Champions" },
  { id: "stats", label: "Archive" },
  { id: "records", label: "Records" },
];

/** Season 4 fixtures. One place to change them when they move.
 *  `iso` is what the countdown reads; day/month are what the page prints. */
export const SEASON_4 = [
  { label: "Auction", day: "12", month: "Sep", iso: "2026-09-12", note: "The pool goes under the hammer" },
  { label: "Tournament", day: "20", month: "Sep", iso: "2026-09-20", note: "Group stage, semis, final — all in one day" },
];

/* Season accents drawn from the ball, the floodlight and the turf — not from
   a generic hue ramp. */
const SEASON_COLORS = {
  1: "#ff5a6e",
  2: "#c8102e",
  3: "#e8394a",
  4: "#ede7da",
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
        ? { player: topRuns.player, value: topRuns.value, unit: "runs" }
        : { player: "—", value: "—", unit: "" },
      wickets: topWickets
        ? { player: topWickets.player, value: topWickets.value, unit: "wkts" }
        : { player: "—", value: "—", unit: "" },
      sixes: topSixes
        ? { player: topSixes.player, value: topSixes.value, unit: "sixes" }
        : { player: "—", value: "—", unit: "" },
      fours: topFours
        ? { player: topFours.player, value: topFours.value, unit: "fours" }
        : { player: "—", value: "—", unit: "" },
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

/**
 * Every season's table, pre-computed on the server.
 *
 * Why this exists: the season data JSON is ~300KB. If the component that
 * switches seasons is a Client Component and it imports the JSON, all 300KB
 * ships to the browser so it can re-filter data it already had. Computing all
 * three seasons here and passing the results down sends a few KB instead.
 */
export function getAllSeasonStats() {
  return {
    s1: getSeasonStats("s1"),
    s2: getSeasonStats("s2"),
    s3: getSeasonStats("s3"),
  };
}

export function formatNrr(nrr) {
  if (nrr == null || nrr === "") return "—";
  const num = Number(nrr);
  if (Number.isNaN(num)) return "—";
  return `${num > 0 ? "+" : ""}${num}`;
}
