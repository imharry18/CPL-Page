#!/usr/bin/env python3
"""
Normalise the player photos in public/players to one format.

    python3 scripts/photos-to-webp.py

The Drive export arrives as a mix of JPEG, PNG, WebP and HEIC — and some of it
is mislabelled, with HEIC files carrying a .jpg extension. A browser cannot
show HEIC at all, so an auction screen reading the folder straight would have
holes in it. This rewrites every image as WebP at a sane size and throws the
original away; the zip in Downloads is the source of truth if it needs redoing.

Filenames become <player-slug>.webp, or <player-slug>-2.webp where somebody
submitted more than one, so the auction can find a photo by name instead of
parsing "IMG_20260807-WA0253 - Rishi Rathi(1).jpg" at render time. The mapping
is written to public/players/index.json.

HEIC is decoded with macOS `sips`, which is already on the machine — no extra
dependency for three files.
"""

import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image, ImageOps

HERE = os.path.dirname(__file__)
FOLDER = os.path.join(HERE, "..", "public", "players")
INDEX = os.path.join(FOLDER, "index.json")

# Big enough to fill an auction screen, small enough that the whole set is a
# few megabytes rather than two hundred.
MAX_EDGE = 1400
QUALITY = 84


def person(filename):
    """The player's name, as the form export encodes it in the filename.

    Files arrive as "<original> - <Name>.<ext>", sometimes with a "(1)" that
    Drive adds for duplicates, and sometimes with roll-number prefixes on the
    name itself ("A11_B3_49_Sahil_Kulkarni")."""
    stem = os.path.splitext(filename)[0]
    match = re.search(r" - (.+)$", stem)
    name = match.group(1) if match else stem
    name = re.sub(r"\(\d+\)$", "", name).replace("_", " ")
    parts = [p for p in name.split() if not re.fullmatch(r"(?i)sap\d*|[ab]\d+|\d+", p)]
    return " ".join(parts).strip()


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def load(path):
    """Open an image, decoding HEIC via sips first if Pillow cannot."""
    try:
        return ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    except Exception:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            out = tmp.name
        try:
            subprocess.run(
                ["sips", "-s", "format", "png", path, "--out", out],
                check=True,
                capture_output=True,
            )
            return ImageOps.exif_transpose(Image.open(out)).convert("RGB")
        finally:
            if os.path.exists(out):
                os.unlink(out)


def main():
    files = sorted(
        f
        for f in os.listdir(FOLDER)
        if not f.startswith(".") and f != "index.json"
    )
    if not files:
        sys.exit("nothing to convert — already normalised?")

    # Keyed by slug, not by the name as typed: two entrants wrote their own
    # name in different cases, which slugged to the same file and silently
    # overwrote each other. The slug is the filename, so it is the only safe
    # thing to count duplicates by. The first spelling seen becomes the name
    # the index reports.
    seen, canonical, index, failed = {}, {}, {}, []
    before = after = 0

    for filename in files:
        source = os.path.join(FOLDER, filename)
        name = person(filename)
        try:
            image = load(source)
        except Exception as error:
            failed.append((filename, str(error).split("\n")[0][:70]))
            continue

        base = slug(name) or "unnamed"
        seen[base] = seen.get(base, 0) + 1
        canonical.setdefault(base, name)
        stem = base if seen[base] == 1 else f"{base}-{seen[base]}"

        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        target = os.path.join(FOLDER, f"{stem}.webp")
        image.save(target, "WEBP", quality=QUALITY, method=6)

        before += os.path.getsize(source)
        after += os.path.getsize(target)
        index.setdefault(canonical[base], []).append(f"{stem}.webp")
        os.unlink(source)

    with open(INDEX, "w") as handle:
        json.dump(index, handle, indent=1, ensure_ascii=False, sort_keys=True)
        handle.write("\n")

    print(f"converted {sum(len(v) for v in index.values())} images for {len(index)} people")
    print(f"  {before / 1e6:,.0f} MB -> {after / 1e6:,.1f} MB")
    print(f"  index written to public/players/index.json")
    for filename, error in failed:
        print(f"  FAILED {filename}: {error}")


if __name__ == "__main__":
    main()
