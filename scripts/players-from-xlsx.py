#!/usr/bin/env python3
"""
Turn the Google Form export into data/season4Players.json.

Run it again whenever the sheet changes:

    python3 scripts/players-from-xlsx.py "~/Downloads/Campus Premier League Season 4.xlsx"

IMPORTANT — this script exists so that the private columns never reach the
site. The export contains email addresses, mobile numbers and Drive photo
links for every entrant. Only the fields listed in KEEP below are written out.
Do not add contact fields here: the JSON is served to the public.
"""

import collections
import json
import os
import sys

import openpyxl

SCORE = {"Best": 4, "Good": 3, "Average": 2, "Okay": 1}
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "season4Players.json")

# Column indexes in the form export.
TIMESTAMP, EMAIL, NAME, YEAR, HOSTEL = 0, 1, 2, 3, 4
BAT, BOWL, ALLROUND, SUIT = 7, 8, 9, 10


def clean(value):
    return " ".join(str(value).split()) if value is not None else ""


def role_for(bat, bowl, allround):
    """Read the role off the skill ratings, not off the preference question —
    that question puts ~90% of entrants in one bucket, which makes the filter
    on the site useless."""
    b, w, a = SCORE.get(bat, 0), SCORE.get(bowl, 0), SCORE.get(allround, 0)
    if a >= 3 and abs(b - w) <= 1:
        return "All-rounder"
    if b > w:
        return "Batter"
    if w > b:
        return "Bowler"
    return "All-rounder"


def main(path):
    rows = list(openpyxl.load_workbook(path, data_only=True).worksheets[0].iter_rows(values_only=True))[1:]

    # Oldest first, so a later submission overwrites an earlier one.
    rows = [r for r in rows if clean(r[NAME])]
    rows.sort(key=lambda r: str(r[TIMESTAMP]))

    # Two passes of deduplication:
    #   1. by email  — the same account submitting twice
    #   2. by name   — the same person submitting from two different accounts
    by_email = {}
    for row in rows:
        by_email[clean(row[EMAIL]).lower() or clean(row[NAME]).lower()] = row

    by_name = {}
    for row in by_email.values():
        by_name[clean(row[NAME]).lower()] = row

    people = []
    for row in by_name.values():
        bat, bowl, allround = clean(row[BAT]), clean(row[BOWL]), clean(row[ALLROUND])
        people.append({
            "name": clean(row[NAME]),
            "year": clean(row[YEAR]),
            "hostellite": clean(row[HOSTEL]) == "Yes",
            "bat": bat,
            "bowl": bowl,
            "allround": allround,
            "rating": SCORE.get(bat, 0) + SCORE.get(bowl, 0) + SCORE.get(allround, 0),
            "role": role_for(bat, bowl, allround),
            "prefers": {"Good in Batting": "Batting", "Good in Bowling": "Bowling"}.get(
                clean(row[SUIT]), ""
            ),
        })

    people.sort(key=lambda p: p["name"].lower())
    with open(OUT, "w") as handle:
        json.dump(people, handle, indent=1, ensure_ascii=False)
        handle.write("\n")

    print(f"{len(rows)} form rows -> {len(people)} players")
    print("roles:", dict(collections.Counter(p["role"] for p in people)))
    leaked = [k for k in people[0] if k in ("email", "mobile", "photo", "phone")]
    print("private fields in output:", leaked or "none")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(os.path.expanduser(sys.argv[1]))
