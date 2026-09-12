import fs from "node:fs";
import path from "node:path";

import LobbySub from "@/components/lobby/LobbySub";
import SeasonTabs from "@/components/lobby/SeasonTabs";
import { CPL_FACTS } from "@/data/cplFacts";
import { SEASON_4_NGL } from "@/data/season4Ngl";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { photoFor, photoIndex } from "@/lib/auction";
import { PURSE, SQUAD_MAX, money } from "@/lib/auctionMoney";
import { REVEAL } from "@/lib/cplData";
import { tintFor } from "@/lib/matchTints";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "Season 4 — Campus Premier League",
  description:
    "Season 4 on one screen: the eight sides and every player in the pool, a slide at a time.",
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
         otherwise carry the batting preference, rather than leaving a slide
         with big letters and no explanation. */
      note: src
        ? player.prefers && `Prefers ${player.prefers.toLowerCase()}`
        : "Photo not included in this repository",
      tint: side ? { "--tie": side.color, "--tie-lit": side.colorLit } : undefined,
    };
  });

  /* Three of Season 4's own facts, built from the numbers this page already
     has to hand rather than repeated as fixed text — so a purse or a pool
     size that changes before the night does not leave a fact behind that is
     no longer true. */
  const season4Facts = [
    {
      tag: "Season 4 · a public service announcement",
      title: "No one will use my bat 🏏",
      stat: "NEW",
      statUnit: "a new bat for you",
      note: "Bring your own if you must — but there is a new one waiting, so nobody has to share mine. 🏏",
    },
    {
      tag: "Season 4 · the auction",
      title: "Same purse, same start",
      stat: money(PURSE),
      statUnit: `per side · ${SEASON_4_SIDES.length} sides`,
      note: "Every side walks in with exactly the same budget — what they do with it is the only variable.",
    },
    {
      tag: "Season 4 · 20 Sep 2026",
      title: "One day, start to crown",
      stat: "14",
      statUnit: "matches — Openers to the Crown",
      note: "Group stage, semis and the final, all inside a single day at the football ground.",
    },
    {
      tag: "Season 4 · the Crown",
      title: "Three trophies, not one",
      stat: "3",
      statUnit: "winner · runner-up · 3rd place",
      note: "The final decides the winner and the runner-up; the side eliminated in Qualifier 2 takes the third.",
    },
    {
      tag: "Season 4 · the Crown",
      title: "Ten trophies, not one",
      stat: String(SQUAD_MAX),
      statUnit: "a trophy each · the winning squad",
      note: "The champions do not share a single trophy between them — every member of the winning side takes one home.",
    },
    {
      tag: "Season 4 · the Crown",
      title: "Forty medals, not one",
      stat: "40",
      statUnit: `30 for the podium · 10 for the standouts`,
      note: `A full squad each — ${SQUAD_MAX} medals — for the winners, the runners-up and 3rd place; the last ten go to whoever stood out on the day.`,
    },
  ];

  /* CPL's own record book, three seasons deep, read out as facts rather than
     tables — each one gets its own colour off the same wheel the matches page
     tints its ties with, so no two in a row are mistaken for each other.
     Season 4's own facts lead, so the night opens with what is new rather
     than what is already in the book. */
  const facts = [...season4Facts, ...CPL_FACTS].map((fact, i) => ({
    key: fact.title,
    ...fact,
    tint: tintFor(i + 1),
  }));

  /* The anonymous inbox, one screenshot and its text per slide — the
     the text alone, set as large as the room can read it — no screenshot, so
     nothing on the slide is small enough to need one. A short line gets the
     full stat-sized treatment; a long one is stepped down so it still fits
     the frame it lands in. */
  const ngl = SEASON_4_NGL.map((entry, i) => {
    const words = entry.text.split(/\s+/).length;
    const statSize =
      words <= 6
        ? undefined
        : words <= 15
          ? "clamp(2rem, 5vh, 3.2rem)"
          : words <= 30
            ? "clamp(1.4rem, 3.4vh, 2.1rem)"
            : "clamp(1.1rem, 2.6vh, 1.6rem)";
    return {
      key: entry.file,
      tag: "NGL · anonymous",
      stat: entry.text,
      statSize,
      tint: tintFor(i + 1),
    };
  });

  const shows = [
    ...(pictures.length > 0
      ? [{ id: "season", name: "Season", slides: pictures }]
      : []),
    { id: "teams", name: "Teams", slides: teams },
    { id: "players", name: "Players", slides: pool },
    { id: "facts", name: "Extras", slides: facts },
    ...(ngl.length > 0 ? [{ id: "ngl", name: "NGL", slides: ngl }] : []),
  ];

  return (
    /* No heading: the slide is the page, so nothing sits between the top of
       the screen and the side being shown but the way back to the lobby. */
    <LobbySub reveal={REVEAL} lock={false} fill head={false} bare>
      <SeasonTabs shows={shows} />
    </LobbySub>
  );
}
