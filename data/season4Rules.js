/**
 * The Season 4 playing conditions and the auction's own conditions, kept as
 * one numbered list — the page does not split them into sections.
 *
 * Each rule is a title and one line. Add a rule by adding an entry — the page
 * numbers them itself, so inserting one in the middle does not mean
 * renumbering the rest.
 *
 * `points` and `emphasis` remain available where a rule outgrows one line:
 * `points` for parts that must be read separately, `emphasis` for the one
 * line that has to land.
 */
export const SEASON_4_RULES = [
  {
    title: "The referee's word is final",
    body:
      "Do not argue — your captain says it for you, and the live video settles the rest.",
  },
  {
    title: "A penalty is final once it is given",
    body:
      "Anyone may ask; the organisers, referees and both captains decide — 1, 2 or 3 units, served as extra time, fewer players, or two goals a unit.",
  },
  {
    title: "Ten players a side",
    body:
      "Captain and vice captain included — a side that has ten is full, and out of the bidding.",
  },
  {
    title: "Nobody keeps goal more than two halves",
    body:
      "Two keepers take two halves each, the rest take one — five keepers in a seven-half game, four in a six.",
  },
  {
    title: "Fourteen matches, all in one day",
    body:
      "Seven sides, and after the first round the points table decides who you meet next.",
  },
  {
    title: "There are no automatic send-offs",
    body:
      "No local rules — only the Laws of the Game, and only the referee, send a player off.",
  },
  {
    title: "No fighting, ever",
    body:
      "Chirp the game, not the person — nothing personal, nothing about family, no hand on anyone.",
  },
  {
    title: "The attacking side looks after the ground",
    body:
      "Water for both teams, the match ball, and fetching every goal — all yours while you're attacking.",
  },
  {
    title: "Your health comes first",
    body: "Play hard, but no game here is worth an injury.",
  },
  {
    title: "Every side has ₹80 crore",
    body:
      "The same purse for all eight — what you spend early is not there later.",
  },
  {
    title: "Every lot opens at ₹20 lakh",
    body:
      "Bids rise by fixed steps — ₹20 lakh up to ₹1 crore, ₹50 lakh to ₹4 crore, ₹1 crore above — and never past your purse.",
  },
  {
    title: "Captains and the iconic eight are not for sale",
    body:
      "Captains are on their sides already; the iconic eight join them through the FateGrid as vice captains.",
  },
  {
    title: "The order is decided before the night, not during it",
    body:
      "The list calls itself — unsold players are called again in the Recall.",
  },
  {
    title: "Sold is sold",
    body:
      "A closed lot is final — no take-backs, no swaps, no trades.",
  },
];

/**
 * The last word on the page, and set as large as the title.
 *
 * It matters more than any single rule above it: everything here is a starting
 * point, and the captains have a say in what it becomes.
 */
export const SEASON_4_RULES_CLOSING = {
  lead: "These rules are not fixed.",
  body:
    "More can be added, and any of them can change — before the tournament, or on the day if the conditions call for it. Nothing changes without the captains being asked first.",
};
