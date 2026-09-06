#!/usr/bin/env python3
"""
Build data/season4Auction.json — the lot list for the Live Auction.

    python3 scripts/auction-from-players.py

Only players who have paid go under the hammer, so the list is drawn from the
"paid" flag in data/season4Players.json. Everyone keeps the details they gave
on the entry form; what the auction adds is a photo, a base price, and two
blanks for the night itself.

Re-running rebuilds the list from the roster. It does NOT clear a sale: any
lot already carrying a soldPrice or a team keeps them, so adding a late player
mid-auction cannot wipe the bids already made.
"""

import difflib
import json
import os
import re

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "..", "data")
PLAYERS = os.path.join(DATA, "season4Players.json")
OUT = os.path.join(DATA, "season4Auction.json")
PHOTO_INDEX = os.path.join(HERE, "..", "public", "players", "index.json")
ICONIC = os.path.join(DATA, "season4Iconic.js")


def iconic_names():
    """The eight names out of data/season4Iconic.js.

    Read with a regex rather than duplicated into Python: one list, so the
    auction and the FateGrid can never disagree about who is iconic."""
    try:
        with open(ICONIC) as handle:
            body = handle.read()
    except OSError:
        return set()
    inside = re.search(r"SEASON_4_ICONIC\s*=\s*\[(.*?)\]", body, re.S)
    return set(re.findall(r'"([^"]+)"', inside.group(1))) if inside else set()

# Every player enters at the same price; the bidding is what separates them.
BASE_PRICE = 20000

# Photos whose filename name cannot be reached from the roster name by any
# rule, mapped by hand. Kept small and evidenced:
#   Meet Agrawal   — the photo says "Mitul agrawal"; his entry-form address is
#                    under that name too, so they are the same person.
#   Uddhav Bajaj   — the photo says "Uddhav Bjaaj", the surname mistyped.
PHOTO_AS = {
    "Meet Agrawal": "Mitul agrawal",
    "Uddhav Bajaj": "Uddhav Bjaaj",
}


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def photo_lookup(roster):
    """Player name -> photo URL.

    Entrants do not write their name the same way twice: the roster has
    "Sai Kashinath Doifode" where the photo says "Sai Doifode", and "Anirudh"
    where the photo says "Anirudh Sandel". So a plain slug match finds only
    about half of them. Match on the exact name first, then on a close spelling,
    then on two shared words, and finally on one shared word where exactly one
    player could be meant.

    The photo folder is gitignored and may not be there at all on a fresh
    clone, in which case every lot simply has no photo."""
    try:
        with open(PHOTO_INDEX) as handle:
            index = json.load(handle)
    except OSError:
        return {}

    # First file wins where somebody sent several; the rest stay in the index
    # if a better one needs picking by hand.
    # First file wins where somebody sent several; the rest stay in the index
    # if a better one needs picking by hand.
    photos = {name.lower(): files[0] for name, files in sorted(index.items())}
    found = {}

    def tokens(name):
        return [t for t in name.split() if len(t) > 1]

    for player in roster:
        key = player.lower()
        pw = tokens(key)
        hit = photos.get(PHOTO_AS.get(player, "").lower()) or photos.get(key)

        # All of one name's words appear in the other's: "Sai Doifode" inside
        # "Sai Kashinath Doifode", "Anirudh" inside "Anirudh Sandel".
        if not hit:
            subset = [
                p for p in photos
                if set(pw) <= set(tokens(p)) or set(tokens(p)) <= set(pw)
            ]
            hit = photos[subset[0]] if len(subset) == 1 else None

        # Otherwise the surname must match outright. Matching on a close
        # spelling alone pairs "Aditya Tekade" with "Aditya Pandey", which is
        # worse than showing no photograph at all.
        if not hit and pw:
            same_surname = [p for p in photos if tokens(p) and tokens(p)[-1] == pw[-1]]
            if len(same_surname) == 1 and set(pw) & set(tokens(same_surname[0])):
                hit = photos[same_surname[0]]

        if hit:
            found[player] = hit

    return found


def main():
    with open(PLAYERS) as handle:
        players = json.load(handle)

    existing = {}
    if os.path.exists(OUT):
        with open(OUT) as handle:
            existing = {lot["name"]: lot for lot in json.load(handle)}

    # Who actually goes under the hammer. A captain is on his side by hand and
    # an iconic player is allotted by the FateGrid, so neither is a lot — and a
    # player already carrying a side is one or the other.
    iconic = iconic_names()
    for_sale = [
        p
        for p in players
        if p.get("paid") and not p.get("team") and p["name"] not in iconic
    ]
    held = sum(1 for p in players if p.get("paid")) - len(for_sale)

    photos = photo_lookup([p["name"] for p in for_sale])
    lots, without_photo = [], []

    for player in for_sale:
        photo = photos.get(player["name"])
        if not photo:
            without_photo.append(player["name"])

        was = existing.get(player["name"], {})
        lots.append({
            "name": player["name"],
            "year": player["year"],
            "hostellite": player["hostellite"],
            "bat": player["bat"],
            "bowl": player["bowl"],
            "allround": player["allround"],
            "rating": player["rating"],
            "role": player["role"],
            "prefers": player["prefers"],
            "photo": f"/players/{photo}" if photo else None,
            "basePrice": BASE_PRICE,
            # Filled in on the night.
            "soldPrice": was.get("soldPrice"),
            "team": was.get("team", ""),
        })

    lots.sort(key=lambda lot: lot["name"].lower())
    with open(OUT, "w") as handle:
        json.dump(lots, handle, indent=1, ensure_ascii=False)
        handle.write("\n")

    sold = sum(1 for lot in lots if lot["soldPrice"] is not None)
    print(f"{len(lots)} lots, of {len(players)} in the pool")
    print(f"  {held} held back — captains, vice captains and the iconic eight")
    print(f"  base price Rs{BASE_PRICE:,} each")
    print(f"  {len(lots) - len(without_photo)} with a photo, {len(without_photo)} without")
    print(f"  {sold} already sold, {len(lots) - sold} still to go")
    if without_photo:
        print("  no photo: " + ", ".join(sorted(without_photo)))


if __name__ == "__main__":
    main()
