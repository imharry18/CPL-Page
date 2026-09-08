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
    title: "The umpire's word stands",
    body:
      "No arguing with the umpire. Raise a concern through your captain — never by surrounding the umpire.",
  },
  {
    title: "Decisions can be reviewed — by umpires only",
    body:
      "A decision may be changed, but only by the umpires conferring between themselves against the rulebook. If the batting side, the bowling side, or any other team interferes while that is happening, it becomes a penalty.",
  },
  {
    title: "Penalties are not open to objection",
    body:
      "Once a penalty is awarded it is final. A penalty is set as n, where n is 1, 2 or 3, and is served in one of these forms:",
    points: [
      "The bowling side bowls n extra balls",
      "The batting side receives n fewer balls",
      "n × 2 runs awarded to the opposition, or n × 2 runs deducted",
    ],
  },
  {
    title: "Who can raise a penalty",
    body:
      "Umpires, the committee, any player on the field, or any other team may raise one. It is decided by the organisers, the umpires and both captains together.",
  },
  {
    title: "Everything is on record",
    body:
      "Every match is streamed live on YouTube. If you believe a run has been scored wrongly, you may query it at any time — the footage settles it.",
  },
  {
    title: "Fights carry a team punishment",
    body:
      "No fighting during matches. Captains are responsible for pulling their own players back.",
    emphasis: "One person's mistake can disqualify the entire team.",
  },
  {
    title: "Sledging — hard, but clean",
    body:
      "Sledging is allowed, and allowed to be sharp. The limits are absolute:",
    points: [
      "Sledge the player, not personally",
      "No physical contact and no physical intimidation",
      "Nothing about anyone's family",
    ],
  },
  {
    title: "The batting side runs water and fetches the ball",
    body: "While your side is batting, these are yours to handle:",
    points: [
      "Water for both teams",
      "Looking after the match ball",
      "Chasing down every six",
    ],
  },
  {
    title: "Health comes before the tournament",
    body:
      "Nothing here is worth an injury. Run hard, but keep your head — don't collide, don't get hit, don't play through something serious.",
    emphasis: "Your health matters more than any match.",
  },
  {
    title: "Leave the place better than you found it",
    body:
      "Build a good atmosphere. Make sure everyone enjoys it.",
    emphasis: "Nobody gets left out.",
  },,
];

/**
 * The auction's own conditions, shown under their own heading after the
 * playing rules.
 *
 * Every figure here is enforced by the auction itself — the purse, the squad
 * cap and the raise are in lib/auctionMoney.js, not just written down. If one
 * changes there, change it here too: a rule the room reads and a rule the
 * console applies must not disagree.
 */
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
