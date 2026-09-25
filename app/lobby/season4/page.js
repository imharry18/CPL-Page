import fs from "node:fs";
import path from "node:path";

import LobbySub from "@/components/lobby/LobbySub";
import SeasonTabs from "@/components/lobby/SeasonTabs";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { photoFor, photoIndex } from "@/lib/auction";
import { REVEAL } from "@/lib/cplData";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "Season 1 — Football Premier League",
  description:
    "Season 1 on one screen: every side and every player in the pool, a slide at a time.",
};

/* The folder is read on every request rather than at build time, so a picture
   dropped into public/season4 shows up on the next load without a rebuild —
   and the squads come off the auction ledger, which changes all night. */
export const dynamic = "force-dynamic";

const IMAGE_PATTERN = /\.(webp|jpe?g|png|avif)$/i;

/**
 * Every picture in public/season4, in name order — so slides are ordered by
 * naming them 01, 02, 03 rather than by editing any code.
 */
function readSlides() {
  const dir = path.join(process.cwd(), "public", "season4");
  try {
    return fs
      .readdirSync(dir)
      .filter((file) => IMAGE_PATTERN.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => ({ key: file, src: `/season4/${file}` }));
  } catch {
    return [];
  }
}

export default async function LobbySeason4Page() {
  const [{ players }, photos] = await Promise.all([getPlayers(), photoIndex()]);
  const pictures = readSlides();

  /* A side that has not been announced yet still gets its slide — under its
     number and its teaser, the same way its card reads in the lobby. */
  const teams = SEASON_4_SIDES.map((side) => ({
    key: `side-${side.no}`,
    src: side.name ? side.logo : null,
    tag: `Side ${String(side.no).padStart(2, "0")}`,
    title: side.name ?? "To be named",
    sub: side.captain ? `Captain · ${side.captain}` : "Captain to be named",
    note: side.note ?? side.teaser,
    tint: { "--tie": side.color, "--tie-lit": side.colorLit },
  }));

  /* A player bought at the auction takes their side's colours, so the pool
     turns into eight squads as the night goes on. */
  const byName = new Map(SEASON_4_SIDES.map((side) => [side.name, side]));
  const pool = players.map((player) => {
    const side = byName.get(player.team);
    const src = photoFor(photos, player.name);
    return {
      key: player.name,
      src,
      tag: player.team || "In the pool",
      title: player.name,
      sub: [player.year, player.role].filter(Boolean).join(" · "),
      /* The photo folder is gitignored — a clone of the repo has none, so
         every slide falls to initials here. Say why, in the spot that would
         otherwise carry the position preference, rather than leaving a slide
         with big letters and no explanation. */
      note: src
        ? player.secondary &&
          player.secondary !== player.role &&
          `Also plays ${player.secondary.toLowerCase()}`
        : "Photo not included in this repository",
      tint: side ? { "--tie": side.color, "--tie-lit": side.colorLit } : undefined,
    };
  });

  const shows = [
    ...(pictures.length > 0
      ? [{ id: "season", name: "Season", slides: pictures }]
      : []),
    { id: "teams", name: "Teams", slides: teams },
    { id: "players", name: "Players", slides: pool },
  ];

  return (
    /* No heading: the slide is the page, so nothing sits between the top of
       the screen and the side being shown but the way back to the lobby. */
    <LobbySub reveal={REVEAL} lock={false} fill head={false} bare>
      <SeasonTabs shows={shows} />
    </LobbySub>
  );
}
