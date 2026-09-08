/**
 * Who is still to be called, and who is next.
 *
 * The console has always worked this out for itself. Now the board shows the
 * next name too, and two copies of the rule would be one copy too many: the
 * room would eventually read "Next — X" on the screen at the front of the hall
 * and then hear Y called. So the rule lives here and both sides import it.
 *
 * Pure — no filesystem, no state. The console is a client component and
 * anything it imports is bundled for the browser.
 */

/**
 * How many times the room is asked about a player before he is finished.
 *
 * Three: the running order, then the players nobody wanted, then those same
 * players once more. A name refused three times has had three turns and is
 * out — that cap is the only thing stopping the unsold round re-offering the
 * same men for ever, so the night has an end.
 */
export const ROUNDS = 3;

/** How a round is said out loud.
 *
 * Named for what each one IS rather than numbered: the running order, then the
 * players nobody wanted, then their last time of asking. Kept beside ROUNDS so
 * raising the cap and naming the new round are one change rather than two —
 * anything past the list falls back to a number rather than going blank. */
const NAMES = ["", "Opening", "Recall", "Last Chance"];

export function roundName(pass) {
  return NAMES[pass] ?? `Round ${pass}`;
}

/**
 * The last word on each player. A name can appear more than once — unsold in
 * one round, sold in a later one — and it is the latest entry that counts.
 *
 * With one exception: a sale is final. Nothing after it can un-sell a player,
 * because /api/auction refuses to put a sold name up again — so if a later
 * line ever said otherwise, this would hand the board a name the server will
 * not accept, and the running order would offer him for ever. Undo takes the
 * sale off the history rather than writing over it, which is the way back.
 */
export function outcomes(history = []) {
  const last = new Map();
  for (const sale of history) {
    if (sale.team || !last.get(sale.name)?.team) last.set(sale.name, sale);
  }
  return last;
}

/**
 * The names still to be called, in the order they will be called.
 *
 * In the first round that is everyone in the running order with no result yet.
 * In every round after it, the players who went unsold in an EARLIER round and
 * have not been offered since — so a man refused in round two comes back in
 * round three.
 *
 * Past ROUNDS there is nobody, whoever asks. The cap belongs here rather than
 * in the board that draws the queue, because it is the thing that ends the
 * night: without it the unsold round would keep handing the same names back to
 * itself, and a caller that forgot to check would loop for ever.
 */
export function queueFor({ order = [], history = [], pass = 1 }) {
  if (pass > ROUNDS) return [];

  const last = outcomes(history);

  if (pass > 1) {
    return order.filter((name) => {
      const sale = last.get(name);
      return sale && !sale.team && (sale.pass ?? 1) < pass;
    });
  }

  return order.filter((name) => !last.has(name));
}

/**
 * The next name after `current`.
 *
 * Looks past the lot under the hammer rather than at it, and falls back to the
 * head of the queue when the current name is not in it — which is the case
 * between lots, and after an out-of-order call.
 */
export function nextInQueue(queue = [], current = null) {
  const at = queue.indexOf(current);
  return (
    queue.find((name, i) => i > at && name !== current) ??
    queue.find((name) => name !== current) ??
    null
  );
}
