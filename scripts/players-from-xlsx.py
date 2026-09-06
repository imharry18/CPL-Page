#!/usr/bin/env python3
"""
Turn the Google Form export into data/season4Players.json.

Run it again whenever either sheet changes:

    python3 scripts/players-from-xlsx.py \
        "~/Downloads/Campus Premier League Season 4.xlsx" \
        "~/Downloads/PAYMENT CPL-4 (Responses).xlsx"

The payment export is optional. Given it, every player gets "paid": true/false;
without it, nobody is marked paid.

IMPORTANT — this script exists so that the private columns never reach the
site. Both exports carry email addresses, and the entry form also carries
mobile numbers and Drive photo links. The payment form additionally carries
bank-registered names, UTR/RRN transaction numbers and screenshots of the
transfers. None of that is written out — only the fields built in main().
Do not add contact, bank or transaction fields here: the JSON is served to
the public.
"""

import collections
import json
import os
import re
import sys

import openpyxl

SCORE = {"Best": 4, "Good": 3, "Average": 2, "Okay": 1}
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "season4Players.json")

# The private sidecar: mobile number and payment reference, keyed by player
# name. Gitignored, and lib/players.js only reads it outside production, so it
# is there while you run the auction on your own machine and nowhere else.
OUT_PRIVATE = os.path.join(
    os.path.dirname(__file__), "..", "data", "season4Private.json"
)

# Column indexes in the entry form export.
TIMESTAMP, EMAIL, NAME, YEAR, HOSTEL, MOBILE = 0, 1, 2, 3, 4, 5
BAT, BOWL, ALLROUND, SUIT = 7, 8, 9, 10

# Column indexes in the payment form export. The rest of that sheet — bank
# name, UTR and screenshot link — is deliberately never read.
PAY_EMAIL, PAY_NAME, PAY_REF = 1, 2, 4

# Payment rows whose name is spelled differently from the entry form and whose
# address is not on the entry form either, so neither automatic pass can pair
# them. Maps the payment-form name, lowercased, to the entry-form name.
PAID_AS = {
    "sai doifode": "Sai Kashinath Doifode",
}

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
    # Entered on 6 Sep, after the export this script was last run against, and
    # paid. Drop this entry once the sheet is re-downloaded — the ADDITIONS
    # loop skips anyone the sheet already carries, so it will not duplicate.
    {
        "name": "Anshul Ghate",
        "year": "3rd Year",
        "hostellite": False,
        "bat": "Good",
        "bowl": "Good",
        "allround": "Best",
        "prefers": "Batting",
    },
    # Paid the entry fee and filled the payment form, but never the entry form,
    # so there are no self-rated skills for him. Rated as Shantanu is, by
    # instruction.
    {
        "name": "Om More",
        "year": "3rd Year",
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


def reference(value):
    """The payment reference as digits. openpyxl hands back a float for a
    12-digit UTR, so "927331165912.0" has to lose its tail."""
    return re.sub(r"\D", "", clean(value).split(".")[0])


def read_payments(path):
    """The (address, name, reference) of every payment row.

    Address and name lowercased, as filled in on the payment form. The bank-
    registered name and the screenshot link are never read at all."""
    if not path:
        return []

    rows = list(
        openpyxl.load_workbook(path, data_only=True)
        .worksheets[0]
        .iter_rows(values_only=True)
    )[1:]

    return [
        (
            clean(row[PAY_EMAIL]).lower(),
            clean(row[PAY_NAME]).lower(),
            reference(row[PAY_REF]),
        )
        for row in rows
        if clean(row[PAY_NAME])
    ]


def main(path, payments_path=None):
    payments = read_payments(payments_path)

    # The reference, reachable by either key a player can be matched on. The
    # payment sheet is read for this and for the unmatched report only — it no
    # longer sets anyone's "paid" flag.
    ref_by_key = {}
    for email, name, ref in payments:
        if not ref:
            continue
        ref_by_key[email] = ref
        ref_by_key[name] = ref
        if name in PAID_AS:
            ref_by_key[PAID_AS[name].lower()] = ref

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
    private = {}
    for row in by_name.values():
        if clean(row[NAME]).lower() in WITHDRAWN:
            continue
        bat, bowl, allround = clean(row[BAT]), clean(row[BOWL]), clean(row[ALLROUND])
        name = RENAME.get(clean(row[NAME]).lower(), title_name(row[NAME]))
        people.append({
            "name": name,
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
            # Everybody starts unpaid, on purpose. The payment form turned out
            # to disagree with the bank statement in both directions — people
            # who paid and never filled it in, and references on it with no
            # money behind them — so it is not trusted to mark anyone paid.
            # Tick players off by hand instead.
            "paid": False,
            # Filled in at the auction, one of the eight sides in
            # data/season4Sides.js. Empty means unsold / not yet called.
            "team": "",
        })

        # Straight into the sidecar, never into the dict above.
        private[name] = {
            "phone": phone(row[MOBILE]),
            "ref": ref_by_key.get(clean(row[EMAIL]).lower())
            or ref_by_key.get(clean(row[NAME]).lower())
            or ref_by_key.get(name.lower())
            or "",
        }

    have = {p["name"].lower() for p in people}
    for extra in ADDITIONS:
        if extra["name"].lower() in have:
            continue
        person = dict(extra)
        person["rating"] = sum(
            SCORE.get(person[k], 0) for k in ("bat", "bowl", "allround")
        )
        person["role"] = role_for(person["bat"], person["bowl"], person["allround"])
        person["paid"] = False
        person["team"] = ""
        people.append(person)

    people.sort(key=lambda p: p["name"].lower())
    with open(OUT, "w") as handle:
        json.dump(people, handle, indent=1, ensure_ascii=False)
        handle.write("\n")

    with open(OUT_PRIVATE, "w") as handle:
        json.dump(private, handle, indent=1, ensure_ascii=False, sort_keys=True)
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

    print(f"paid: 0, unpaid: {len(people)} — everyone starts unpaid, tick by hand")

    if payments_path:
        # A payment with nobody to attach it to means either a spelling PAID_AS
        # has to cover, or someone who paid without entering.
        entry_emails = {clean(r[EMAIL]).lower() for r in by_name.values()}
        entry_names = {clean(r[NAME]).lower() for r in by_name.values()}
        output_names = {p["name"].lower() for p in people}
        for email, name, _ in sorted(set(payments)):
            if email in entry_emails or name in entry_names:
                continue
            if PAID_AS.get(name, "").lower() in output_names:
                continue
            print(f"  unmatched payment: {name}")

    leaked = sorted(
        k
        for person in people
        for k in person
        if k in ("email", "mobile", "photo", "phone", "ref", "utr")
    )
    print("private fields in the public JSON:", leaked or "none")
    print(
        f"sidecar: {len(private)} rows, "
        f"{sum(1 for v in private.values() if v['phone'])} with a phone, "
        f"{sum(1 for v in private.values() if v['ref'])} with a reference"
    )


if __name__ == "__main__":
    if not 2 <= len(sys.argv) <= 3:
        sys.exit(__doc__)
    main(*[os.path.expanduser(a) for a in sys.argv[1:]])
