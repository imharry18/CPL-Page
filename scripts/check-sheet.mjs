#!/usr/bin/env node
/**
 * Check a published Google Sheet CSV before you wire it into the site.
 *
 *   node scripts/check-sheet.mjs "<published csv url>"
 *
 * It answers three questions:
 *   1. Is the URL actually public? (no login, no redirect to sign-in)
 *   2. Does it parse into players, and how many?
 *   3. Has any private column leaked into it — email, phone, photo link?
 *
 * Question 3 is the important one. Publishing the wrong tab exposes ~100
 * students' contact details on a URL that needs no login.
 */

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/check-sheet.mjs \"<published csv url>\"");
  process.exit(1);
}

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE = /\b[6-9]\d{9}\b/; // Indian mobile numbers
const DRIVE = /drive\.google\.com|docs\.google\.com\/open/i;

const response = await fetch(url, { redirect: "follow" });

console.log(`\nHTTP ${response.status}  ${response.url.slice(0, 90)}`);

if (!response.ok) {
  console.error(
    "\n✗ Not public. A 307 or 401 means it still needs a login.\n" +
      "  Use File → Share → Publish to web (not just 'anyone with the link').\n"
  );
  process.exit(1);
}

const text = await response.text();

if (text.trimStart().startsWith("<")) {
  console.error(
    "\n✗ That returned a web page, not CSV.\n" +
      "  In Publish to web, pick 'Comma-separated values (.csv)' as the format.\n"
  );
  process.exit(1);
}

const lines = text.split("\n").filter((line) => line.trim());
const header = lines[0] || "";
const rows = lines.length - 1;

console.log(`\nColumns : ${header.trim()}`);
console.log(`Rows    : ${rows}`);

const leaks = [];
if (EMAIL.test(text)) leaks.push("email addresses");
if (PHONE.test(text)) leaks.push("mobile numbers");
if (DRIVE.test(text)) leaks.push("Drive photo links");

if (leaks.length) {
  console.error(
    `\n✗ PRIVATE DATA IN A PUBLIC URL: ${leaks.join(", ")}.\n` +
      "  Do NOT use this URL. Unpublish it now, then publish only a tab built\n" +
      "  with: =QUERY('Form Responses 1'!A:L, \"select C, D, E, H, I, J, K\", 1)\n"
  );
  process.exit(1);
}

console.log("\n✓ Public, parses as CSV, and contains no email, phone or photo link.");
console.log("  Safe to paste into PLAYERS_CSV_URL in lib/cplData.js.\n");
