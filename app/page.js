"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ScrollVideoPlayer from "@/components/ScrollVideoPlayer";
import AboutSection from "@/components/sections/AboutSection";
import ChampionsSection from "@/components/sections/ChampionsSection";
import HeroSection from "@/components/sections/HeroSection";
import RecordsSection from "@/components/sections/RecordsSection";
import RegisterSection from "@/components/sections/RegisterSection";
import StatsSection from "@/components/sections/StatsSection";
import MomentsSection from "@/components/sections/MomentsSection";
import {
  getChampions,
  getLeagueHighlights,
  getSeasonStats,
  formatNrr,
} from "@/lib/cplData";

const CHAMPIONS = getChampions();
const LEAGUE_HIGHLIGHTS = getLeagueHighlights();

function rankClass(index) {
  if (index === 0) return "rank-gold";
  if (index === 1) return "rank-silver";
  if (index === 2) return "rank-bronze";
  return "";
}

export default function Home() {
  const [activeSeason, setActiveSeason] = useState("s1");
  const [activeTab, setActiveTab] = useState("points");

  const seasonStats = getSeasonStats(activeSeason);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.02 }
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el);
    });
    return () => revealObserver.disconnect();
  }, []);

  const handleNavigate = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleRegister = useCallback(() => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScq9CSsKVhVQcWhjYG5UqFzhEZvUjDcFiVILCbMcI4LyhUIpA/viewform", "_blank");
  }, []);

  return (
    <main style={{ position: "relative", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .cinematic-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1; pointer-events: none;
        }
        .ambient-orbs { position: fixed; inset: 0; z-index: 2; pointer-events: none; overflow: hidden; }
        .ambient-orbs::before, .ambient-orbs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.25;
          animation: orb-float 15s ease-in-out infinite alternate;
        }
        .ambient-orbs::before { width: 500px; height: 500px; top: 5%; left: -10%; background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%); }
        .ambient-orbs::after { width: 400px; height: 400px; bottom: 10%; right: -5%; background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%); animation-delay: -5s; }
        .scroll-container { position: relative; width: 100%; z-index: 10; pointer-events: none; }
        .scroll-container > * { pointer-events: auto; }
      `}} />
      <ScrollVideoPlayer />
      <div className="cinematic-overlay" />
      <div className="ambient-orbs" />

      <Navbar onNavigate={handleNavigate} />

      <div className="scroll-container">
        <HeroSection onRegister={handleRegister} />
        <MomentsSection />
        <AboutSection onChampions={() => handleNavigate("champions")} />
        <ChampionsSection champions={CHAMPIONS} onRegister={handleRegister} />
        <StatsSection
          seasonStats={seasonStats}
          activeSeason={activeSeason}
          setActiveSeason={setActiveSeason}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          formatNrr={formatNrr}
          rankClass={rankClass}
        />
        <RecordsSection highlights={LEAGUE_HIGHLIGHTS} onRegister={handleRegister} />
        <RegisterSection
          onNotify={handleRegister}
          onTop={() => handleNavigate("hero")}
        />
      </div>
    </main>
  );
}
