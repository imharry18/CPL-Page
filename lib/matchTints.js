/**
 * One colour per match, so two ties on the same screen are never confused.
 *
 * The hues are ordered so that consecutive matches land far apart on the
 * wheel — two ties sitting next to each other on screen are the ones that must
 * not be confused, and neighbouring hues would defeat the point. All sit at a
 * similar lightness and saturation, so the set still reads as one family on
 * the near-black page rather than as a bag of loose colours. Each entry is [base, lit]: the base carries
 * fills and edges, the lit one carries text, which needs the extra contrast.
 *
 * Season 4 runs to fourteen matches and the Final takes no tint, so thirteen
 * are asked for against twelve here — match thirteen wraps back to the house
 * red of match one. They are never on screen together, being different rounds.
 * it does, rather than running out.
 */
const TINTS = [
  ["#c8102e", "#ff5a6e"], // 1  — the house red
  ["#0e8d80", "#5ce0c4"], // 2  — teal
  ["#b08a12", "#f4d67a"], // 3  — gold
  ["#7b4bc4", "#b08cf0"], // 4  — violet
  ["#3f8f4e", "#7fc9a4"], // 5  — green
  ["#c1502f", "#ff8a5c"], // 6  — coral
  ["#0b7fd4", "#46aef7"], // 7  — blue
  ["#c96a0d", "#f0a24c"], // 8  — amber
  ["#b23a86", "#e07ab0"], // 9  — magenta
  ["#6b7a8f", "#a9bcd0"], // 10 — steel
  ["#4a5fd0", "#8fa2ff"], // 11 — periwinkle
  ["#8a7b3c", "#d8c98a"], // 12 — brass
];

/**
 * The custom properties for match `n`, counting from 1. Spread straight into
 * a style prop; returns undefined for anything that is not a numbered match,
 * so an untinted tie simply carries no properties.
 */
export function tintFor(n) {
  if (!Number.isFinite(n) || n < 1) return undefined;
  const [base, lit] = TINTS[(n - 1) % TINTS.length];
  return { "--tie": base, "--tie-lit": lit };
}
