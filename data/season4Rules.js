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
  },
];
