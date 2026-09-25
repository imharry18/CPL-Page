/**
 * The Season 4 lobby tiles.
 *
 * A tile shows its title and an arrow, nothing else.
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
    title: "Teams",
    href: "/lobby/teams",
    image: "/lobby/teams-v2.jpg",
    position: "50% 50%",
    accent: "#c8102e",
  },
  {
    id: "auction",
    span: "1x2",
    title: "Auction",
    href: "/lobby/auction",
    image: "/lobby/auction-v2.jpg",
    position: "50% 62%",
    accent: "#7a0a19",
  },
  {
    id: "players",
    span: "1x2",
    title: "Players",
    href: "/lobby/players",
    image: "/lobby/players-v2.jpg",
    position: "50% 60%",
    accent: "#e8394a",
  },
  {
    id: "matches",
    span: "2x1",
    title: "Matches",
    href: "/lobby/matches",
    image: "/lobby/matches-v2.jpg",
    position: "60% 50%",
    accent: "#121b16",
  },
  {
    id: "rules",
    span: "2x1",
    title: "Rules",
    href: "/lobby/rules",
    image: "/lobby/rules-v2.jpg",
    position: "55% 50%",
    accent: "#e8394a",
  },
];
