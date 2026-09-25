import { readFile } from "node:fs/promises";
import path from "node:path";

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

/* The entry form asks for a position in prose — "Attack", "Defence" — while
   the site talks in the four football positions. One table for both forms,
   because the two sheets word them differently. */
const POSITIONS = {
  attack: "Attacker",
  attacker: "Attacker",
  forward: "Attacker",
  defence: "Defender",
  defense: "Defender",
  defender: "Defender",
  midfield: "Midfielder",
  midfielder: "Midfielder",
  goalkeeper: "Goalkeeper",
  keeper: "Goalkeeper",
};

function positionFor(value) {
  const key = (value || "").toLowerCase().trim();
  return POSITIONS[key] || null;
}

/* Self-rating arrives as either a number ("4") or a row of stars ("⭐⭐⭐⭐").
   A few entrants ticked two star boxes; the higher one is what they meant. */
function ratingFor(value) {
  const stars = (value || "").split(",").map((part) => (part.match(/⭐/g) || []).length);
  const best = Math.max(0, ...stars);
  if (best) return best;
  const number = parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(5, Math.max(1, number)) : 0;
}

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

function toPlayers(rows) {
  if (rows.length < 2) return [];
  const [headers, ...body] = rows;
  const find = columnFinder(headers);

  const iName = find("name");
  const iYear = find("year");
  const iRate = find("rate", "rating", "gameplay");
  // "primary" before "position": on the registration form both columns say
  // "position", and the secondary one says "secondary" or "comfortable".
  const iPrimary = find("primary", "position");
  const iSecondary = find("secondary", "comfortable");

  if (iName === null) return [];

  // Later rows win, so someone who submitted twice appears once.
  const byName = new Map();
  for (const cells of body) {
    const name = (cells[iName] || "").replace(/\s+/g, " ").trim();
    if (!name) continue;

    byName.set(name.toLowerCase(), {
      name,
      year: cells[iYear] ?? "",
      role: positionFor(cells[iPrimary]) || "Midfielder",
      secondary: positionFor(cells[iSecondary]),
      rating: ratingFor(cells[iRate]),
      // Only the auction writes these; a live sheet knows nothing about them.
      route: "auction",
      pot: 0,
      priority: null,
      paid: true,
      team: "",
    });
  }

  return [...byName.values()].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
}

/**
 * Join the night's results onto the pool.
 *
 * A player's side comes from two places, kept apart on purpose: `team` in
 * season4Players.json is a standing fact — the eight captains, set before
 * anyone bids — and data/auctionState.json is what happened tonight. The
 * ledger wins where it has something to say.
 *
 * That separation is the whole point: emptying the ledger puts every squad
 * back to the captains and every purse back to full, without touching the
 * roster. Nothing has to be unpicked to start again.
 */
async function withSquads(players) {
  let ledger;
  try {
    ledger = JSON.parse(
      await readFile(
        path.join(process.cwd(), "data", "auctionState.json"),
        "utf8"
      )
    );
  } catch {
    return players;
  }

  const bought = new Map(
    (ledger.history ?? [])
      .filter((sale) => sale.team)
      .map((sale) => [sale.name, sale])
  );
  if (bought.size === 0) return players;

  return players.map((player) => {
    const sale = bought.get(player.name);
    return sale ? { ...player, team: sale.team, price: sale.price } : player;
  });
}

export async function getPlayers() {
  if (!PLAYERS_CSV_URL) {
    return { players: await withSquads(fallback), live: false };
  }

  try {
    const response = await fetch(PLAYERS_CSV_URL, {
      // Re-fetch at most every 5 minutes. New entries show up on their own;
      // the page is still served instantly from cache in between.
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`sheet responded ${response.status}`);

    const players = toPlayers(parseCsv(await response.text()));
    if (players.length === 0) throw new Error("sheet parsed to zero players");

    return { players: await withSquads(players), live: true };
  } catch (error) {
    // A sheet that is unshared, renamed or briefly unreachable must not take
    // the page down with it.
    console.warn("[players] live sheet unavailable, using committed list:", error.message);
    return { players: await withSquads(fallback), live: false };
  }
}
