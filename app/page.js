/**
 * A Server Component. Notice there is no "use client" here any more.
 *
 * All the season data is read, sorted and totalled on the server, and only the
 * finished numbers cross to the browser. The three parts that genuinely need
 * to run in the browser — the WebGL ball, the scroll reveals, the stats tabs —
 * are the only Client Components on the page.
 */

import Navbar from "@/components/Navbar";
import Intro from "@/components/Intro";
import RevealOnScroll from "@/components/RevealOnScroll";
import BallCanvas from "@/components/three/BallCanvas";
import ScrubVideo from "@/components/ScrubVideo";
import HeroSection from "@/components/sections/HeroSection";
import MomentsSection from "@/components/sections/MomentsSection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import AboutSection from "@/components/sections/AboutSection";
import ChampionsSection from "@/components/sections/ChampionsSection";
import StatsSection from "@/components/sections/StatsSection";
import RecordsSection from "@/components/sections/RecordsSection";
import ClosingSection from "@/components/sections/ClosingSection";
import { CPL_TEAMS } from "@/data/cplTeams";
import {
  SEASON_4,
  SECTIONS,
  getAllSeasonStats,
  getChampions,
  getLeagueHighlights,
} from "@/lib/cplData";

export default function Home() {
  const champions = getChampions();
  const highlights = getLeagueHighlights();
  const seasons = getAllSeasonStats();

  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <Intro total={highlights.totals.runs} />

      <ScrubVideo />
      <BallCanvas />
      <div className="backdrop backdrop-vignette" aria-hidden="true" />
      <div className="backdrop backdrop-grain" aria-hidden="true" />

      <Navbar
        sections={SECTIONS}
        nextDate={`Auction ${SEASON_4[0].day} ${SEASON_4[0].month}`}
      />
      <RevealOnScroll />

      <main className="shell">
        <HeroSection totals={highlights.totals} dates={SEASON_4} />
        <ScheduleSection dates={SEASON_4} />
        <MomentsSection />
        <AboutSection />
        <ChampionsSection champions={champions} />
        <StatsSection seasons={seasons} teams={CPL_TEAMS} />
        <RecordsSection highlights={highlights} />
        <ClosingSection dates={SEASON_4} />
      </main>
    </>
  );
}
