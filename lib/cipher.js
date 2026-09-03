const CIPHER = "XX#X0XX#XX7X";

/**
 * A redacted string of a fixed length, derived from `seed`.
 *
 * Derived rather than random on purpose: the auction card is a Client
 * Component and a random mask would differ between the server and the browser,
 * and paging back to lot 12 would show a different cipher than it did the
 * first time.
 */
export function mask(seed, length) {
  return Array.from(
    { length },
    (_, i) => CIPHER[(seed * 7 + i * 3) % CIPHER.length]
  ).join("");
}
