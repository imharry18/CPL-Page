/**
 * The eight Season 4 sides.
 *
 * A side with a `name` is announced and shows properly; everything else stays
 * redacted until the Live Auction. Fill in the rest here as they are named — the
 * card switches itself over, no other change needed.
 *
 * `captain` is optional: a side can be named before its captain is.
 *
 * `teaser` is the one line a redacted card shows in place of a note. Drop it
 * when the side is announced and give it a real `note` instead.
 *
 * `color` and `colorLit` are sampled from the side's own logo — the accent it
 * actually uses, and a lifted twin of the same hue. Together they make the
 * gradient the squad popup is themed with.
 *
 * `logo` is a file in /public/lobby/teams and fills the whole card. It is
 * painted as a CSS background rather than an <Image> so that a side whose
 * artwork has not been dropped in yet shows its own gradient instead of a
 * broken-image icon.
 */
export const SEASON_4_SIDES = [
  {
    no: 1,
    name: "Rajputana Rifles",
    // India-blue with the fire-red rage on top, rather than the logo's gold.
    color: "#1E5AA8",
    colorLit: "#E8412A",
    captain: "Harish",
    logo: "/lobby/teams/rajputana-rifles.jpg",
    note: "The oldest rifle regiment of the Indian Army.",
  },
  {
    no: 2,
    name: "The Godfathers",
    color: "#E8CE93",
    colorLit: "#F7E6BD",
    captain: "Shantanu",
    logo: "/lobby/teams/the-godfathers.jpg",
    // Named for the wine, so the note plays that straight.
    note: "Patient. Most dangerous in the last five overs.",
  },
  {
    no: 3,
    name: "Vajra Strikers",
    color: "#2B4FC8",
    colorLit: "#5C7DF0",
    captain: "Shreyash",
    logo: "/lobby/teams/vajra-strikers.jpg",
    // The vajra is Indra's thunderbolt — a weapon said never to miss.
    note: "The thunderbolt that never misses. All powerplay.",
  },
  {
    no: 4,
    name: "Mavericks XI",
    color: "#B9B8B4",
    colorLit: "#DEDDDA",
    captain: "Om",
    logo: "/lobby/teams/mavericks-xi.jpg",
    note: "No two overs the same. Impossible to plan for.",
  },
  {
    no: 5,
    name: "Storm Breakers",
    color: "#0B7FD4",
    colorLit: "#46AEF7",
    captain: "Sanidhya",
    logo: "/lobby/teams/storm-breakers.jpg",
    note: "They break a partnership the moment it starts to hurt.",
  },
  {
    no: 6,
    name: "The Overlords",
    color: "#B4551C",
    colorLit: "#E08A4A",
    captain: "Sarvagya",
    logo: "/lobby/teams/the-overlords.jpg",
    note: "Take a game early, never hand it back.",
  },
  {
    no: 7,
    name: "Blazing Blades",
    color: "#CE3308",
    colorLit: "#F86B3F",
    captain: "Mukhtar",
    logo: "/lobby/teams/blazing-blades.jpg",
    note: "Every blade swinging from ball one.",
  },
  {
    no: 8,
    name: "Bajrang United",
    color: "#C96A0D",
    colorLit: "#F0A24C",
    captain: "Paras",
    logo: "/lobby/teams/bajrang-united.jpg",
    note: "No total out of reach.",
  },
];
