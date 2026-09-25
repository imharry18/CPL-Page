/**
 * The two Google Forms.
 *
 * To connect your own: open the form → Send → the link icon (🔗) → Copy, then
 * paste it here. That is the only change needed; every button on the site
 * reads these two constants.
 */
export const REGISTER_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScq9CSsKVhVQcWhjYG5UqFzhEZvUjDcFiVILCbMcI4LyhUIpA/viewform";

/**
 * The payment form. Same as REGISTER_URL: open your Google Form → Send → the
 * 🔗 link icon → Copy, and paste it between the quotes. Collect the UPI
 * reference number and the payment screenshot inside that form.
 *
 * Leave it empty and the "Pay entry fee" buttons simply do not render, rather
 * than pointing at nothing.
 */
export const PAYMENT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeQYv-IX5imUHn6nputIKhBPHNiTWvbq1FpGrKON4t0P2QQVQ/viewform";

/**
 * Live player list, pulled from a published Google Sheet tab.
 *
 * ⚠ NEVER point this at the raw "Form Responses 1" sheet. That sheet holds
 * email addresses and mobile numbers, and publishing it puts every entrant's
 * contact details on a public URL that needs no login.
 *
 * SAFE SETUP:
 *  1. In the responses spreadsheet, add a new tab called "Public".
 *  2. Put this in cell A1 of that tab — it copies across only the harmless
 *     columns and leaves email, phone and the photo link behind:
 *
 *       =QUERY('Form Responses 1'!A:L, "select C, D, E, H, I, J, K", 1)
 *
 *  3. File → Share → Publish to web → choose the "Public" tab (NOT "Entire
 *     document") → Comma-separated values (.csv) → Publish.
 *  4. Paste the URL it gives you below.
 *
 * Leave it empty and the site uses data/season4Players.json instead.
 */
export const PLAYERS_CSV_URL = "";

/**
 * The one moment everything in the lobby unlocks: the Live Auction.
 *
 * Teams, the auction lots, the fixtures and the rules are all held back until
 * this passes, so every locked screen reads from here rather than hard-coding
 * the date in four places.
 */
export const REVEAL = {
  iso: "2026-09-12T21:00:00",
  date: "12 Sep",
  time: "9:00 PM",
  note: "Live Auction",
};

/** What every lot opens at in the auction. */
export const AUCTION_BASE = "₹20,000";

/** Entry fee, shown next to the payment link. */
export const ENTRY_FEE = "₹100";

export const SECTIONS = [];

/** Season 4 fixtures. One place to change them when they move.
 *  `iso` is what the countdown reads; day/month are what the page prints. */
export const SEASON_4 = [
  /* `live` is the night itself. While it is set the site stops counting down
     to the auction and says it is happening — the date is no longer news once
     the room is sitting in front of the board. Take it off after the night and
     everything goes back to reading the date. */
  { label: "Auction", day: "12", month: "Sep", iso: "2026-09-12", live: true, note: "The pool is under the hammer" },
  { label: "Tournament", day: "20", month: "Sep", iso: "2026-09-20", note: "Group stage, semis, final — all in one day" },
];
