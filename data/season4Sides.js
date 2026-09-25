/**
 * FPL Season 1 — the seven sides.
 *
 * Team names are real-world football clubs used as franchise labels for this
 * hostel tournament. Logos should be dropped into /public/teams/ using
 * the filename listed in each `logo` field. Until artwork is added, each card
 * shows its gradient (color → colorLit) instead of a broken-image icon.
 *
 * `color`    — primary club colour, used as the dark anchor of the gradient.
 * `colorLit` — lighter / brighter twin of the same hue, used as the highlight.
 * `year`     — the college year the team represents (informational only).
 * `captain`  — spelled exactly as data/season4Players.json spells the name.
 *
 * Order is the order the sides are shown in: the four 2nd-year sides first,
 * then the three 1st-year ones.
 *
 * To rename a team or swap a logo, change it here — every page that uses teams
 * imports this one array, so nothing else needs touching.
 */
export const SEASON_4_SIDES = [
  {
    no: 1,
    name: "Bayern Munich",
    color: "#DC052D",
    colorLit: "#FF6080",
    year: "2nd Year",
    captain: "Govind Kshirsagar",
    logo: "/teams/bayern-munich.jpg",
    note: "Mia San Mia — 2nd year dominance.",
  },
  {
    no: 2,
    name: "Real Madrid",
    color: "#FEBE10",
    colorLit: "#FFE066",
    year: "2nd Year",
    captain: "Rishi Sharma",
    logo: "/teams/real-madrid.jpg",
    note: "Los Blancos, 2nd year royalty.",
  },
  {
    no: 3,
    name: "PSG",
    color: "#004170",
    colorLit: "#E30613",
    year: "2nd Year",
    captain: "Prit Savaria",
    logo: "/teams/psg.jpg",
    note: "Paris in the house, 2nd year.",
  },
  {
    no: 4,
    name: "Barcelona",
    color: "#A50044",
    colorLit: "#004D98",
    year: "2nd Year",
    captain: "Harsh Khadilkar",
    logo: "/teams/barcelona.jpg",
    note: "Més que un club — 2nd year.",
  },
  {
    no: 5,
    name: "Liverpool",
    color: "#C8102E",
    colorLit: "#F05070",
    year: "1st Year",
    captain: "Keshav Panpalia",
    logo: "/teams/liverpool.jpg",
    note: "You'll never walk alone.",
  },
  {
    no: 6,
    name: "Chelsea",
    color: "#034694",
    colorLit: "#4A7FD4",
    year: "1st Year",
    captain: "Devansh Singh",
    logo: "/teams/chelsea.jpg",
    note: "The Blues, 1st year strong.",
  },
  {
    no: 7,
    name: "Manchester City",
    color: "#1C86CD",
    colorLit: "#6AC8F5",
    year: "1st Year",
    captain: "Soham Choudhary",
    logo: "/teams/manchester-city.jpg",
    note: "Sky blue, 1st year pride.",
  },
];
