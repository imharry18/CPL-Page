/**
 * The Season 4 lobby tiles.
 *
 * `span` is "<columns>x<rows>" on the four-column desktop grid — that is what
 * makes the mosaic uneven, so a card's size is chosen here rather than in CSS.
 *
 * Each image is composed and cropped for its tile rather than sharing one
 * generic stadium photograph. `position` keeps the important face or piece of
 * action visible when the mosaic changes shape on a smaller screen.
 */
export const LOBBY_CARDS = [
  {
    id: "teams",
    span: "2x2",
    eyebrow: "The draw",
    title: "Teams",
    note: "Eight sides. One cup. Squads are settled at the auction.",
    stat: "08 sides",
    href: "/lobby/teams",
    image: "/lobby/teams.jpg",
    position: "50% 42%",
    accent: "#c8102e",
  },
  {
    id: "auction",
    span: "1x2",
    eyebrow: "12 Sep",
    title: "Auction",
    note: "The pool goes under the hammer.",
    stat: "Night one",
    href: "/lobby/auction",
    image: "/lobby/auction.jpg",
    position: "50% 35%",
    accent: "#7a0a19",
  },
  {
    id: "players",
    span: "1x2",
    eyebrow: "The pool",
    title: "Players",
    note: "Everyone who entered, with their own skill ratings.",
    stat: "Browse all",
    href: "/lobby/players",
    image: "/lobby/players.jpg",
    position: "50% 30%",
    accent: "#e8394a",
  },
  {
    id: "matches",
    span: "2x1",
    eyebrow: "20 Sep",
    title: "Matches",
    note: "Twelve matches, one day. Group stage, semis, final, a champion.",
    stat: "12 matches",
    href: "/lobby/matches",
    image: "/lobby/matches.jpg",
    position: "64% 50%",
    accent: "#121b16",
  },
  {
    id: "rules",
    span: "2x1",
    eyebrow: "Before you play",
    title: "Rules",
    note: "Hostel players form the core. After the toss, nobody’s year matters.",
    stat: "How it works",
    href: "/lobby/rules",
    image: "/lobby/rules.jpg",
    position: "66% 50%",
    accent: "#e8394a",
  },
];
