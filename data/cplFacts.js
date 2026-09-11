/**
 * The Campus Premier League's own record book — Seasons 1 through 3, read out
 * as one fact per slide for the Season 4 screen's Facts tab.
 *
 * Every number here is pulled from the season data captured in
 * CPL_ALL_SEASONS_SEASON_3_FINAL_UPDATED_SEASON_2.json and
 * CPL_PLAYERS_ALL_SEASONS_SEASON_3_FINAL_UPDATED_SEASON_2.json — nothing is
 * invented. Season 4's own facts (the pool, the purse, the format) are built
 * alongside these in app/lobby/season4/page.js, where the live numbers behind
 * them already live.
 *
 * Shape matches what SeasonShow expects for a fact slide: `tag`, `title`,
 * `stat`, `statUnit`, `note`. `key` and `tint` are filled in by the page.
 */
export const CPL_FACTS = [
  {
    tag: "Career · all seasons",
    title: "The name at the top of every board",
    stat: "390",
    statUnit: "career runs · Harish",
    note: "He also leads the all-time six-hitting (45) and wicket-taking (18) lists — the only player to top all three.",
  },
  {
    tag: "Season 3 · 26 Jan 2026",
    title: "CPL's only century",
    stat: "101",
    statUnit: "Harish, Rastriya Rifles",
    note: "The tournament's highest individual score — still the only hundred anyone has made in three seasons.",
  },
  {
    tag: "Season 3 · final",
    title: "The Godfathers, by six runs",
    stat: "58-8",
    statUnit: "vs Rastriya Rifles' 52-9 (7.5)",
    note: "Played at BCCI, Nagpur on 26 January 2026 — the only final so far held away from the usual ground.",
  },
  {
    tag: "Season 3 · bowling",
    title: "The best figures CPL has seen",
    stat: "6-22",
    statUnit: "Harshit, Bajrang United",
    note: "He also topped the wicket-takers' list for the season, with 14.",
  },
  {
    tag: "Season 3 · in numbers",
    title: "Sixes outnumbered fours two to one",
    stat: "208",
    statUnit: "sixes · 86 fours",
    note: "Nagpur's tournament total, across two days of the group stage and the final.",
  },
  {
    tag: "Season 3 · 26 Jan 2026",
    title: "The biggest total CPL has seen",
    stat: "165",
    statUnit: "vs Trishul Titans",
    note: "Harish's 101 off 31 balls — the tournament's only century — with Jatin's 54 off 23 beside him.",
  },
];
