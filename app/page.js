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
import AboutSection from "@/components/sections/AboutSection";
import ClosingSection from "@/components/sections/ClosingSection";
import { SECTIONS } from "@/lib/cplData";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <Intro />

      <ScrubVideo />
      <BallCanvas />
      <div className="backdrop backdrop-vignette" aria-hidden="true" />
      <div className="backdrop backdrop-grain" aria-hidden="true" />

      <Navbar sections={SECTIONS} />
      <RevealOnScroll />

      <main className="shell">
        <HeroSection />
        <AboutSection />
        <ClosingSection />
      </main>
    </>
  );
}
