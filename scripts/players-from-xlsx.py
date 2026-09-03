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
import re
import sys

import openpyxl

SCORE = {"Best": 4, "Good": 3, "Average": 2, "Okay": 1}
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "season4Players.json")

# Column indexes in the form export.
TIMESTAMP, EMAIL, NAME, YEAR, HOSTEL, MOBILE = 0, 1, 2, 3, 4, 5
BAT, BOWL, ALLROUND, SUIT = 7, 8, 9, 10

# Hand corrections, applied every run so that re-importing the sheet never
# quietly undoes them. Keys are the name as typed into the form, lowercased.
RENAME = {
    "mukhtarhussain": "Mukhtar Hussain",
}

# Entrants to drop, whatever the sheet says.
WITHDRAWN = {
    "abishak jagotra",
}

# Rows dropped by the address that submitted them. Use this where two rows are
# the same person but neither the mobile nor the email matches, so no automatic
# pass can pair them up — here, a Parth Patil entry whose number differs from
# the other one by a single digit.
DISCARDED_ROWS = {
    "parthpatil0907@gmail.com",
}

# People who are playing but never filled the form in. Skipped if the sheet
# already carries them, so adding one to the sheet later does not duplicate.
ADDITIONS = [
    {
        "name": "Harish",
        "year": "4th Year",
        "hostellite": False,
        "bat": "Best",
        "bowl": "Best",
        "allround": "Best",
        "prefers": "",
    },
]


def clean(value):
    return " ".join(str(value).split()) if value is not None else ""


def phone(value):
    """The last ten digits, or "" if there are not ten.

    The column comes back from openpyxl as a float, so "8275294974.0" has to
    lose its decimal tail before anything else. Anything that is not ten digits
    is treated as no number at all rather than guessed at."""
    digits = re.sub(r"\D", "", clean(value).split(".")[0])
    return digits[-10:] if len(digits) >= 10 else ""


def title_name(value):
    """First letter of every part of the name capitalised, the rest lowered.

    Entrants type their own names into the form, so the sheet has "HARISH",
    "harish" and "Harish" all meaning the same person. Normalising here means
    the site never shows a shouted name and the sort is stable."""
    return " ".join(
        word[:1].upper() + word[1:].lower() for word in clean(value).split()
    )


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
    rows = [
        r
        for r in rows
        if clean(r[NAME]) and clean(r[EMAIL]).lower() not in DISCARDED_ROWS
    ]
    rows.sort(key=lambda r: str(r[TIMESTAMP]))

    # Three passes of deduplication, each keeping the latest submission:
    #   1. by mobile — the surest key, and the only one that catches a person
    #                  who re-entered under a different address AND a different
    #                  spelling of their name
    #   2. by email  — the same account submitting twice
    #   3. by name   — someone who used two accounts and two numbers
    #
    # A row with no usable number keys on its own position, so that the rows
    # missing a number do not all collapse into one person.
    by_phone = {}
    for i, row in enumerate(rows):
        by_phone[phone(row[MOBILE]) or f"row-{i}"] = row

    by_email = {}
    for row in by_phone.values():
        by_email[clean(row[EMAIL]).lower() or clean(row[NAME]).lower()] = row

    by_name = {}
    for row in by_email.values():
        by_name[clean(row[NAME]).lower()] = row

    people = []
    for row in by_name.values():
        if clean(row[NAME]).lower() in WITHDRAWN:
            continue
        bat, bowl, allround = clean(row[BAT]), clean(row[BOWL]), clean(row[ALLROUND])
        people.append({
            "name": RENAME.get(clean(row[NAME]).lower(), title_name(row[NAME])),
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

    have = {p["name"].lower() for p in people}
    for extra in ADDITIONS:
        if extra["name"].lower() in have:
            continue
        person = dict(extra)
        person["rating"] = sum(
            SCORE.get(person[k], 0) for k in ("bat", "bowl", "allround")
        )
        person["role"] = role_for(person["bat"], person["bowl"], person["allround"])
        people.append(person)

    people.sort(key=lambda p: p["name"].lower())
    with open(OUT, "w") as handle:
        json.dump(people, handle, indent=1, ensure_ascii=False)
        handle.write("\n")

    print(f"{len(rows)} form rows")
    print(f"  {len(rows) - len(by_phone)} duplicate by mobile")
    print(f"  {len(by_phone) - len(by_email)} further duplicate by email")
    print(f"  {len(by_email) - len(by_name)} further duplicate by name")
    print(
        f"  {len(DISCARDED_ROWS)} row discarded by hand, "
        f"{len(WITHDRAWN)} withdrawn, {len(ADDITIONS)} added by hand"
    )
    print(f"  -> {len(people)} players")
    print("roles:", dict(collections.Counter(p["role"] for p in people)))
    leaked = [k for k in people[0] if k in ("email", "mobile", "photo", "phone")]
    print("private fields in output:", leaked or "none")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(os.path.expanduser(sys.argv[1]))
