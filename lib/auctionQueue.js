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

/** The last word on each player. A name can appear twice — unsold in the first
 *  pass, sold in the second — and it is the latest entry that counts. */
export function outcomes(history = []) {
  const last = new Map();
  for (const sale of history) last.set(sale.name, sale);
  return last;
}

/**
 * The names still to be called, in the order they will be called.
 *
 * In the first pass that is everyone in the running order with no result yet.
 * In the second it is the players who went unsold in the FIRST pass and have
 * not been re-offered — a name that goes unsold twice has had its two turns,
 * which is what lets the night end rather than looping.
 */
export function queueFor({ order = [], history = [], pass = 1 }) {
  const last = outcomes(history);

  if (pass === 2) {
    return order.filter((name) => {
      const sale = last.get(name);
      return sale && !sale.team && (sale.pass ?? 1) < 2;
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
