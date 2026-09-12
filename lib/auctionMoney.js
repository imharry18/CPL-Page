/**
 * The auction's money, with no filesystem behind it.
 *
 * Kept apart from lib/auction.js on purpose: the console is a client
 * component, and anything it imports is bundled for the browser. The state
 * helpers there reach for node:fs, which cannot be. Everything in this file is
 * pure arithmetic, so both sides can share it.
 *
 * Every amount is a whole number of rupees. Nothing is stored formatted —
 * formatting is a display concern, and rounding money for storage is how a
 * purse stops adding up.
 */

/** ₹80 crore a side. */
export const PURSE = 80_00_00_000;

/**
 * A squad is nine or ten. The maximum is enforced — a side holding ten cannot
 * bid again, because a bid it is not allowed to win is just a way to run the
 * price up on someone else. The minimum is only reported: a side short of nine
 * near the end needs to be told, not stopped.
 */
export const SQUAD_MIN = 9;
export const SQUAD_MAX = 10;

/** Every lot opens at ₹20 lakh. */
export const BASE_PRICE = 20_00_000;

/**
 * The one legal raise at a given price.
 *
 *   up to ₹1 Cr   — ₹20 lakh a step
 *   up to ₹4 Cr   — ₹50 lakh a step
 *   beyond        — ₹1 Cr a step
 *
 * There is only ever one increment, so the auctioneer never chooses a number
 * or does arithmetic during a live lot: a side either bids or it does not.
 */
export function bidIncrement(currentBid) {
  if (currentBid < 1_00_00_000) return 20_00_000;
  if (currentBid < 4_00_00_000) return 50_00_000;
  return 1_00_00_000;
}

/**
 * What the board reads once `team` has bid.
 *
 * The first bid of a lot is taken at the base price — nobody raises against an
 * empty room. Every bid after that goes up by one increment.
 */
export function nextBid(currentBid, hasLeader) {
  return hasLeader ? currentBid + bidIncrement(currentBid) : currentBid;
}

/** Indian money, short enough to read across a room. */
export function money(rupees) {
  if (!Number.isFinite(rupees)) return "—";
  if (rupees >= 1_00_00_000) {
    const cr = rupees / 1_00_00_000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2).replace(/\.?0+$/, "")} Cr`;
  }
  if (rupees >= 1_00_000) {
    const l = rupees / 1_00_000;
    return `₹${l % 1 === 0 ? l : l.toFixed(2).replace(/\.?0+$/, "")} L`;
  }
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/**
 * What each side has spent and has left, from the sale history alone.
 *
 * Derived rather than stored: a running total kept alongside the history is a
 * second source of truth, and the two drift the first time an undo is missed.
 */
export function purses(sides, history) {
  const spent = new Map(sides.map((side) => [side.name, 0]));
  for (const sale of history) {
    if (sale.team && spent.has(sale.team)) {
      spent.set(sale.team, spent.get(sale.team) + sale.price);
    }
  }
  return sides.map((side) => ({
    ...side,
    spent: spent.get(side.name),
    left: PURSE - spent.get(side.name),
    bought: history.filter((sale) => sale.team === side.name).length,
  }));
}
