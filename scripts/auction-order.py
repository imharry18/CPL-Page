#!/usr/bin/env python3
"""
Write data/auctionOrder.json — the running order for the auction.

    python3 scripts/auction-order.py            # keep the existing order
    python3 scripts/auction-order.py --shuffle  # draw a fresh random order

The console calls players in exactly this order, so the auctioneer never picks
who is next: the file decides, and the night runs down it. Reorder the list by
hand any time — the console reads it fresh on every load.

Only players who have paid go in. Re-running keeps the order already there and
appends anyone new at the end, so a late entrant does not reshuffle a list
people have already seen.
"""

import json
import os
import random
import sys

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "..", "data")
PLAYERS = os.path.join(DATA, "season4Players.json")
OUT = os.path.join(DATA, "auctionOrder.json")


def main(shuffle=False):
    with open(PLAYERS) as handle:
        players = json.load(handle)

    paid = [p["name"] for p in players if p.get("paid")]

    existing = []
    if os.path.exists(OUT) and not shuffle:
        with open(OUT) as handle:
            existing = [n for n in json.load(handle) if n in set(paid)]

    if shuffle:
        order = paid[:]
        random.shuffle(order)
        added = []
    else:
        # Keep what is already set, then append anyone not in it yet.
        added = [n for n in paid if n not in set(existing)]
        order = existing + added

    with open(OUT, "w") as handle:
        json.dump(order, handle, indent=1, ensure_ascii=False)
        handle.write("\n")

    print(f"{len(order)} players in the running order")
    if shuffle:
        print("  drawn fresh at random")
    elif existing:
        print(f"  {len(existing)} kept in place, {len(added)} appended")
    else:
        print("  first run — roster order")
    print(f"  -> data/auctionOrder.json")


if __name__ == "__main__":
    main(shuffle="--shuffle" in sys.argv)
