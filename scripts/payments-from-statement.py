#!/usr/bin/env python3
"""
Build data/season4Payments.json — the SBI statement and the payment form, as
two flat lists for the lookup tabs on the players page.

    python3 scripts/payments-from-statement.py \
        "~/Downloads/Email_Statement.pdf" \
        "~/Downloads/PAYMENT CPL-4 (Responses).xlsx"

The statement PDF is password protected. Pass the password in the environment,
so that it is never typed into a file or left in shell history:

    STATEMENT_PASSWORD=... python3 scripts/payments-from-statement.py ...

IMPORTANT — the output is a bank statement and a list of payment references.
It is gitignored, and lib/players.js only loads it outside production. It must
never be committed or deployed.

Every parsed row is checked against the statement's own running balance before
anything is written: previous balance +credit -debit must equal the balance the
bank printed on that row. If a single row fails, the script writes nothing and
exits non-zero, because a half-right statement is worse than none.
"""

import json
import os
import re
import sys

import openpyxl
import pypdf

OUT = os.path.join(
    os.path.dirname(__file__), "..", "data", "season4Payments.json"
)

# Column indexes in the payment form export.
TIMESTAMP, EMAIL, NAME, BANK_NAME, REF = 0, 1, 2, 3, 4

# One transaction begins where a value date and a transaction date sit together.
TXN = re.compile(r"(?=\d{2}/\d{2}/\d{4}\s+\d{2}/\d{2}/\d{4})")

# "UPI/CR/<ref>/<payer>/<bank>/<handle or phone>/<note>"
UPI = re.compile(
    r"UPI/(?P<dir>CR|DR)/(?P<ref>\d+)/(?P<payer>[^/]*)/(?P<bank>[^/]*)/"
    r"(?P<handle>[^/]*)/(?P<note>[^\s]*)"
)

MONEY = r"[\d,]+\.\d{2}"


def money(text):
    return float(text.replace(",", ""))


def parse_statement(path, password):
    reader = pypdf.PdfReader(path)
    if reader.is_encrypted and not reader.decrypt(password):
        sys.exit("statement: wrong password")

    # Every page, page 1 included. It carries the account summary AND the
    # first few transactions underneath it — skipping it silently loses real
    # payments.
    text = "\n".join(page.extract_text() for page in reader.pages)

    # Strip the page furniture first. It lands directly after the last
    # transaction on each page, and left in place it hides that row's balance
    # from the end-of-row match below — silently dropping one transaction per
    # page, which is exactly the kind of loss that looks like a clean parse.
    text = re.sub(r"\d+Page no\.", "", text)
    text = "\n".join(
        line for line in text.split("\n") if line.strip() != "Balance"
    )

    # The summary panel trails the final transaction. Cut the ledger there, so
    # that the last row ends where every other row ends; the full text is still
    # returned for check_summary to reconcile against.
    ledger = text.split("Statement Summary")[0]

    rows = []
    for block in TXN.split(ledger):
        if "UPI/" not in block:
            continue
        flat = " ".join(block.split())
        upi = UPI.search(flat)
        if not upi:
            continue

        # A row ends "<debit> <credit> <balance>", an unused column printed as
        # a bare "-". This must stay anchored to the end of the row: the same
        # three-token shape appears earlier if you let it float, and matches
        # one column to the left — reading a ₹2,500 credit as a ₹2,500
        # balance. Everything that could follow the last row (page furniture,
        # the summary panel) is stripped before we get here.
        tail = re.search(
            rf"(?P<debit>{MONEY}|-)\s+(?P<credit>{MONEY}|-)\s+(?P<balance>{MONEY})\s*$",
            flat,
        )
        if not tail:
            continue

        rows.append({
            "date": re.match(r"(\d{2}/\d{2}/\d{4})", flat).group(1),
            "ref": upi.group("ref"),
            "payer": " ".join(upi.group("payer").split()),
            "bank": upi.group("bank"),
            "handle": upi.group("handle"),
            "direction": upi.group("dir"),
            "debit": 0.0 if tail.group("debit") == "-" else money(tail.group("debit")),
            "credit": 0.0 if tail.group("credit") == "-" else money(tail.group("credit")),
            "balance": money(tail.group("balance")),
        })

    return rows, text


def check_summary(rows, text):
    """Reconcile against the summary the bank prints at the foot of the ledger.

    The balance chain proves the rows are internally consistent, but it cannot
    see a row missing from either end — the first parsed row simply becomes the
    starting point. The summary can: brought forward, total debits, total
    credits and closing balance are the bank's own arithmetic over the whole
    period, so they catch anything dropped anywhere."""
    summary = re.search(
        rf"(?P<forward>{MONEY})CR\s+(?P<debits>{MONEY})\s+(?P<credits>{MONEY})\s+"
        rf"(?P<closing>{MONEY})CR",
        text,
    )
    if not summary:
        return ["could not find the statement summary panel to reconcile against"]

    forward = money(summary.group("forward"))
    closing = money(summary.group("closing"))
    problems = []

    if rows and round(rows[-1]["balance"], 2) != closing:
        problems.append(
            f"closing balance: statement says {closing:,.2f}, "
            f"last parsed row says {rows[-1]['balance']:,.2f} "
            f"(difference {rows[-1]['balance'] - closing:,.2f} — rows missing at the end)"
        )

    if rows:
        opening = round(rows[0]["balance"] - rows[0]["credit"] + rows[0]["debit"], 2)
        # Non-UPI entries are not parsed, so the opening figure only has to
        # match when the whole period is UPI — reported either way.
        if opening != forward:
            problems.append(
                f"opening balance: statement brought forward {forward:,.2f}, "
                f"first parsed row implies {opening:,.2f} "
                f"(difference {opening - forward:,.2f} — rows missing at the start)"
            )

    return problems


def check_balances(rows):
    """Every row must move the balance by exactly its own amount.

    This is the guarantee that the text extraction lined the columns up
    correctly — if a credit were read off the wrong row, or an amount picked up
    from a neighbouring transaction, the chain breaks here."""
    problems = []
    for previous, row in zip(rows, rows[1:]):
        expected = round(previous["balance"] + row["credit"] - row["debit"], 2)
        if expected != row["balance"]:
            problems.append(
                f"{row['date']} {row['ref']}: balance {previous['balance']:,.2f} "
                f"{'+' if row['credit'] else '-'}"
                f"{row['credit'] or row['debit']:,.2f} should be {expected:,.2f}, "
                f"statement says {row['balance']:,.2f}"
            )
    return problems


def parse_form(path):
    rows = list(
        openpyxl.load_workbook(path, data_only=True)
        .worksheets[0]
        .iter_rows(values_only=True)
    )[1:]

    out = []
    for row in rows:
        if not row[NAME]:
            continue
        out.append({
            "at": str(row[TIMESTAMP])[:19],
            "email": " ".join(str(row[EMAIL] or "").split()),
            "name": " ".join(str(row[NAME]).split()),
            "bankName": " ".join(str(row[BANK_NAME] or "").split()),
            "ref": re.sub(r"\D", "", str(row[REF] or "").split(".")[0]),
        })
    return out


def main(statement_path, form_path):
    password = os.environ.get("STATEMENT_PASSWORD")
    if not password:
        sys.exit("set STATEMENT_PASSWORD in the environment")

    bank, text = parse_statement(statement_path, password)
    problems = check_balances(bank) + check_summary(bank, text)
    if problems:
        print(f"{len(problems)} problem(s) reconciling the statement:")
        for problem in problems:
            print(f"  {problem}")
        sys.exit("refusing to write a statement that does not reconcile")

    form = parse_form(form_path)

    # Cross-reference by UTR alone. Names are useless here: plenty of players
    # paid from a parent's account, so the name on the credit is not theirs.
    bank_refs = {row["ref"] for row in bank if row["credit"]}
    form_refs = {row["ref"] for row in form if row["ref"]}
    for row in bank:
        row["onForm"] = row["ref"] in form_refs
    for row in form:
        row["inBank"] = row["ref"] in bank_refs

    with open(OUT, "w") as handle:
        json.dump({"bank": bank, "form": form}, handle, indent=1, ensure_ascii=False)
        handle.write("\n")

    credits = [r for r in bank if r["credit"]]
    print(f"statement: {len(bank)} UPI rows")
    print("  balance chain verified, opening and closing agree with the summary")
    print(f"  {len(credits)} credits, {len(bank) - len(credits)} debits")
    print(f"  {sum(1 for r in credits if r['credit'] == 100)} credits of exactly Rs100")
    print(f"form: {len(form)} submissions, {len(form_refs)} distinct references")
    print(f"  {sum(1 for r in form if not r['inBank'])} form rows with no credit of that reference")
    print(f"  {sum(1 for r in credits if not r['onForm'])} credits with no form row")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*[os.path.expanduser(a) for a in sys.argv[1:]])
