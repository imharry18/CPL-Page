import fallback from "@/data/season4Players.json";
import { PLAYERS_CSV_URL } from "@/lib/cplData";

/**
 * The Season 4 player list.
 *
 * If PLAYERS_CSV_URL is set, the list is pulled live from a published Google
 * Sheet tab and refreshed every few minutes, so new entries appear without a
 * redeploy. If it is not set — or the fetch fails — it falls back to the
 * committed JSON, so the page is never empty.
 *
 * ⚠ Only ever point this at a SANITISED tab. The raw Form Responses sheet
 * contains email addresses and mobile numbers; publishing that to the web puts
 * every entrant's contact details on a public URL. See the setup notes on
 * PLAYERS_CSV_URL in lib/cplData.js.
 */

const SCORE = { Best: 4, Good: 3, Average: 2, Okay: 1 };

/** Split a CSV line, honouring quoted fields that contain commas. */
function splitRow(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells.map((value) => value.trim());
}

function parseCsv(text) {
  // Split on newlines that are not inside quotes.
  const rows = [];
  let row = "";
  let quoted = false;
  for (const char of text) {
    if (char === '"') quoted = !quoted;
    if (char === "\n" && !quoted) {
      rows.push(row);
      row = "";
    } else if (char !== "\r") {
      row += char;
    }
  }
  if (row.trim()) rows.push(row);
  return rows.filter((line) => line.trim()).map(splitRow);
}

/** Match a column by what its header says, not by position — so reordering
 *  the sheet does not silently shuffle everyone's stats. */
function columnFinder(headers) {
  const lower = headers.map((h) => h.toLowerCase());
  return (...needles) => {
    const index = lower.findIndex((h) => needles.some((n) => h.includes(n)));
    return index === -1 ? null : index;
  };
}

function roleFor(bat, bowl, allround) {
  const b = SCORE[bat] || 0;
  const w = SCORE[bowl] || 0;
  const a = SCORE[allround] || 0;
  if (a >= 3 && Math.abs(b - w) <= 1) return "All-rounder";
  if (b > w) return "Batter";
  if (w > b) return "Bowler";
  return "All-rounder";
}

function toPlayers(rows) {
  if (rows.length < 2) return [];
  const [headers, ...body] = rows;
  const find = columnFinder(headers);

  const iName = find("name");
  const iYear = find("year");
  const iHostel = find("hostell");
  const iBat = find("batsman", "batting", "bat");
  const iBowl = find("bowler", "bowling", "bowl");
  const iAll = find("all-rounder", "all rounder", "allround");
  const iSuit = find("stronger", "suit", "prefer");

  if (iName === null) return [];

  // Later rows win, so someone who submitted twice appears once.
  const byName = new Map();
  for (const cells of body) {
    const name = (cells[iName] || "").replace(/\s+/g, " ").trim();
    if (!name) continue;

    const bat = cells[iBat] ?? "";
    const bowl = cells[iBowl] ?? "";
    const allround = cells[iAll] ?? "";
    const suit = cells[iSuit] ?? "";

    byName.set(name.toLowerCase(), {
      name,
      year: cells[iYear] ?? "",
      hostellite: (cells[iHostel] ?? "").toLowerCase() === "yes",
      bat,
      bowl,
      allround,
      rating: (SCORE[bat] || 0) + (SCORE[bowl] || 0) + (SCORE[allround] || 0),
      role: roleFor(bat, bowl, allround),
      prefers:
        { "good in batting": "Batting", "good in bowling": "Bowling" }[
          suit.toLowerCase()
        ] || "",
    });
  }

  return [...byName.values()].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
}

export async function getPlayers() {
  if (!PLAYERS_CSV_URL) return { players: fallback, live: false };

  try {
    const response = await fetch(PLAYERS_CSV_URL, {
      // Re-fetch at most every 5 minutes. New entries show up on their own;
      // the page is still served instantly from cache in between.
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`sheet responded ${response.status}`);

    const players = toPlayers(parseCsv(await response.text()));
    if (players.length === 0) throw new Error("sheet parsed to zero players");

    return { players, live: true };
  } catch (error) {
    // A sheet that is unshared, renamed or briefly unreachable must not take
    // the page down with it.
    console.warn("[players] live sheet unavailable, using committed list:", error.message);
    return { players: fallback, live: false };
  }
}
