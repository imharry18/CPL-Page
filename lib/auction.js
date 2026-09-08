import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { BASE_PRICE } from "@/lib/auctionMoney";

// Re-exported so server code has one place to import the auction from; the
// definitions live in auctionMoney.js because the console bundles them.
export {
  BASE_PRICE,
  PURSE,
  SQUAD_MAX,
  SQUAD_MIN,
  bidIncrement,
  money,
  nextBid,
  purses,
} from "@/lib/auctionMoney";

/**
 * The auction: money, state, and the photographs.
 *
 * Every amount here is a whole number of rupees. Nothing is stored formatted —
 * formatting is a display concern, and rounding money for storage is how a
 * purse stops adding up.
 */

export const STATE_FILE = path.join(
  process.cwd(),
  "data",
  "auctionState.json"
);
const STATE = STATE_FILE;
const PHOTOS = path.join(process.cwd(), "public", "players");

/* `bids` is every bid taken on the lot currently under the hammer, oldest
   first, so a mis-heard raise can be stepped back one at a time. It is cleared
   whenever a lot opens or closes — it belongs to the lot, not to the night.
   `history` is the night, and Undo walks that. */
const EMPTY = {
  current: null,
  bid: BASE_PRICE,
  leader: null,
  bids: [],
  // A message held up to the room instead of a lot — the pause between the
  // main order and the unsold round, where the captains talk.
  notice: null,
  /* The sale currently being announced — { name, team, price }. The board
     holds the SOLD stamp up for exactly as long as this is set, so the room
     reads it until the auctioneer moves on, rather than for a fixed few
     seconds that can run out mid-cheer. */
  sold: null,
  /* The same, for a lot nobody wanted. A player going unsold is a moment too,
     and the room is told rather than left watching the board go blank. */
  unsold: null,
  /* A lot already resolved that the board is looking back at. Changes nothing
     — the night carries on from wherever it was the moment this is cleared. */
  review: null,
  // Which pass the night is in: 1 is the running order, 2 is the unsold
  // round. In the ledger rather than the console so a reload — or a crash and
  // restart — comes back into the same round rather than the first one.
  pass: 1,
  history: [],
};

export async function readState() {
  try {
    return { ...EMPTY, ...JSON.parse(await readFile(STATE, "utf8")) };
  } catch {
    return { ...EMPTY };
  }
}

/**
 * Write the ledger, atomically.
 *
 * Every action writes the whole file, so the auction survives the machine
 * dying — the board reads this back on the next load and carries on. But a
 * plain overwrite is not safe: a crash partway through leaves truncated JSON,
 * and the night's record is gone. Writing to a neighbouring file and renaming
 * makes the swap atomic, so the ledger is always either the old state or the
 * new one, never half of either.
 */
export async function writeState(state) {
  const temp = `${STATE}.tmp`;
  await writeFile(temp, `${JSON.stringify(state, null, 1)}\n`);
  await rename(temp, STATE);
}

/**
 * Player name -> photograph URL.
 *
 * Two naming schemes have to work, because the folder has held both: the raw
 * Drive export ("IMG_2520 - Aditya Pandey.HEIC") and slugified files
 * ("aditya-pandey.webp"). Roll-number prefixes ("a3-b1-06-aum-vishwakarma")
 * and "-2" copies are stripped either way.
 *
 * A missing folder means no photographs, not an error — the console shows a
 * placeholder.
 */
function nameFromFile(file) {
  const stem = file.replace(/\.[^.]+$/, "");

  // Drive export: everything after the last " - " is the player.
  if (stem.includes(" - ")) {
    return stem.slice(stem.lastIndexOf(" - ") + 3).replace(/\(\d+\)$/, "").trim();
  }

  // Slug: hyphens are spaces, minus any trailing copy number and any leading
  // roll-number segments (a3, b1, 06, sap1 …).
  const words = stem
    .replace(/-\d+$/, "")
    .split(/[-_]/)
    .filter(Boolean)
    .filter((word, i, all) =>
      // Keep from the first word that looks like a name rather than a code.
      i >= all.findIndex((w) => /^[a-z]{3,}$/i.test(w) && !/^\d/.test(w))
    )
    .filter((word) => !/^[a-z]{1,3}\d+$/i.test(word) && !/^\d+$/.test(word));

  return words.join(" ").trim();
}

/**
 * The running order — data/auctionOrder.json, written by
 * scripts/auction-order.py.
 *
 * The auctioneer does not choose who is next; this file does. Missing or
 * unreadable means an empty order, and the console falls back to letting a
 * player be picked by hand.
 */
export async function readOrder() {
  try {
    return JSON.parse(
      await readFile(path.join(process.cwd(), "data", "auctionOrder.json"), "utf8")
    );
  } catch {
    return [];
  }
}

/** Replace the running order. Used by the console's shuffle. */
export async function writeOrder(names) {
  const target = path.join(process.cwd(), "data", "auctionOrder.json");
  const temp = `${target}.tmp`;
  await writeFile(temp, `${JSON.stringify(names, null, 1)}\n`);
  await rename(temp, target);
}

export async function photoIndex() {
  let files;
  try {
    files = await readdir(PHOTOS);
  } catch {
    return {};
  }

  const index = {};
  for (const file of files) {
    if (file.startsWith(".")) continue;
    const key = nameFromFile(file).toLowerCase();
    // First file wins, so a "-2" copy never displaces the original.
    if (key && !index[key]) index[key] = `/players/${encodeURIComponent(file)}`;
  }
  return index;
}

/** Levenshtein, capped — only used to forgive a typo in a filename. */
function within(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[b.length] <= max;
}

/**
 * The photo for a player.
 *
 * Deliberately strict about which near-misses count. Putting the wrong face on
 * the screen during the auction is far worse than showing none, so every rule
 * here needs either the surname or the full name to agree — a shared forename
 * is never enough ("Aditya Tekade" must not pick up "Aditya Pandey").
 */
export function photoFor(index, name) {
  const key = name.toLowerCase();
  if (index[key]) return index[key];

  const want = key.split(" ").filter(Boolean);
  const first = want[0];
  const last = want[want.length - 1];

  for (const [candidate, url] of Object.entries(index)) {
    const has = candidate.split(" ").filter(Boolean);

    // Same forename and surname, whatever sits between them.
    if (has[0] === first && has[has.length - 1] === last) return url;

    // One name is contained in the other: "Omsai Gagare" in "Omsai Gagare
    // Patil", or a file named by surname alone.
    const small = has.length <= want.length ? has : want;
    const big = new Set(has.length <= want.length ? want : has);
    if (small.length > 0 && small.every((word) => big.has(word))) return url;

    // A typo in the filename, but only in the surname, and only with the
    // forename matching exactly.
    if (has[0] === first && within(has[has.length - 1], last, 2)) return url;
  }
  return null;
}
