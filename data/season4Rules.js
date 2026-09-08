/**
 * The Season 4 playing conditions.
 *
 * Add a rule by adding an entry — the page numbers them itself, so inserting
 * one in the middle does not mean renumbering the rest.
 *
 * `points` is optional: use it where a rule has parts that must be read
 * separately rather than as a paragraph. `emphasis` is the one line of a rule
 * that has to land — it is set apart from the body.
 */
export const SEASON_4_RULES = [
  {
    title: "The umpire's word is final",
    body:
      "Do not argue with an umpire. If you think something is wrong, your captain says so — nobody else, and never by crowding round.",
  },
  {
    title: "Only umpires change a decision",
    body:
      "Umpires may talk it over between themselves and change a call. While they are deciding, everybody else stays quiet — batting side, bowling side, and anyone watching. Interrupting them is a penalty.",
  },
  {
    title: "A penalty is final once it is given",
    body:
      "Anyone may ask for one — an umpire, the committee, a player on the field, or another team. The organisers, the umpires and both captains decide it together. After that it is not up for discussion. A penalty is 1, 2 or 3 units, and is served one of three ways:",
    points: [
      "The bowling side bowls that many extra balls",
      "The batting side gets that many fewer balls",
      "Two runs a unit, given to the other side or taken off yours",
    ],
  },
  {
    title: "Every match is filmed",
    body:
      "All of it goes out live on YouTube. If you think a run has been given wrongly, say so at any time — the video settles it.",
  },
  {
    title: "Ten players a side",
    body:
      "Captain and vice captain are two of the ten. A side that has ten is full.",
  },
  {
    title: "Nobody bowls more than two overs",
    body:
      "In a seven-over match, two bowlers bowl two overs each and three bowlers bowl one each. In a six-over match, two bowlers bowl two each and two bowlers bowl one each.",
    emphasis: "Five bowlers in a seven-over game, four in a six.",
  },
  {
    title: "Fourteen matches, all in one day",
    body:
      "Eight sides, and every round after the first is seeded on the points table — so how you finish one round decides who you meet in the next.",
    points: [
      "Openers — 4 matches, the draw made on the night",
      "Reckoning — 4 matches: 1st plays 2nd, 3rd plays 4th, and so on down",
      "Last Stand — 2 matches: the top two are through, the bottom two are out, and the middle four cross over for the last places",
      "Fantastic 4 — Qualifier 1, Eliminator, Qualifier 2, and the Final",
    ],
    emphasis: "Nothing is fixed in advance except the first four. The table decides the rest.",
  },
  {
    title: "The squad you win is the squad you play",
    body:
      "The list at the end of the auction is the final list. No players added afterwards, no swaps, no trades — whoever you bought is who you have.",
  },
  {
    title: "There are no automatic outs",
    body:
      "No local rules. Nothing like \u201cover that wall is out\u201d, \u201cone hand one bounce\u201d, or \u201cwhere the ball lands decides it\u201d. Only the laws of cricket, and only the umpire, give a batter out.",
  },
  {
    title: "No fighting, ever",
    body:
      "Captains pull their own players back before it starts. There is no version of this that ends well for your side.",
    emphasis: "One player losing his temper can disqualify the whole team.",
  },
  {
    title: "Sledge the cricket, not the person",
    body:
      "Talk as much as you like, and make it sharp. Three lines you do not cross:",
    points: [
      "Nothing personal — play the batter, not the man",
      "Nothing about anyone's family",
      "No pushing, no blocking, no hand laid on anyone",
    ],
  },
  {
    title: "The batting side looks after the ground",
    body: "While your side is batting, these are yours:",
    points: [
      "Water for both teams",
      "Looking after the match ball",
      "Fetching every six",
    ],
  },
  {
    title: "Your health comes first",
    body:
      "Play hard, but do not get hurt for a match. Do not run into each other, and do not play on through anything serious.",
    emphasis: "No game here is worth an injury.",
  },
  {
    title: "Leave it better than you found it",
    body:
      "Make it a good day for everybody who turns up, not only for whoever wins.",
    emphasis: "Nobody gets left out.",
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

export const SEASON_4_AUCTION_RULES = [
  {
    title: "Every side has ₹100 crore",
    body:
      "The same purse for all eight, and nothing is added to it. What a side spends early is not there later.",
  },
  {
    title: "Ten players a side",
    body:
      "Captain and vice captain included. A side with ten is out of the bidding for good, however much of its purse is left.",
  },
  {
    title: "Every lot opens at ₹20 lakh",
    body:
      "The first side to bid takes the player at that price — nobody raises against an empty room. Every bid after that goes up by one step.",
  },
  {
    title: "The raise is fixed, not offered",
    body:
      "You cannot name a figure. Bidding is a side saying yes at the next price, and the step is set by where the bidding has reached:",
    points: [
      "Up to ₹1 crore — ₹20 lakh a step",
      "₹1 crore to ₹4 crore — ₹50 lakh a step",
      "Above ₹4 crore — ₹1 crore a step",
    ],
  },
  {
    title: "You cannot bid against yourself",
    body:
      "The side already holding the bid cannot raise it, and no side may bid past what is left in its purse. Both are refused by the console, not argued about.",
  },
  {
    title: "Captains and the iconic eight are not for sale",
    body:
      "A captain is on his side already. The iconic eight are drawn to their sides by the FateGrid and become vice captains there and then. Neither goes under the hammer.",
  },
  {
    title: "The order is decided before the night, not during it",
    body:
      "Players are called in the order the list holds, and it calls itself — nobody chooses who comes next once the auction has started.",
  },
  {
    title: "Unsold players get two more calls",
    body:
      "A player nobody bids for is not out. Once the running order has been worked through, every unsold player is called again in the Recall, and once more after that in Last Chance.",
    emphasis: "Going unsold the first time costs you nothing.",
  },
  {
    title: "Sold is sold",
    body:
      "When a lot is closed the player belongs to that side at that price. A bid or a sale can be taken back only at the moment it happens, by the organisers, and only for a mistake — not for a change of mind.",
  },
];
