"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `sections` arrives as a prop rather than being imported from lib/cplData —
 * that import chain ends at a 300KB JSON file, and this only needs five labels.
 */
export default function Navbar({ sections, nextDate }) {
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const barRef = useRef(null);
  const listRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;

    function read() {
      const y = window.scrollY;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      if (barRef.current) {
        barRef.current.style.setProperty(
          "--p",
          (scrollable > 0 ? y / scrollable : 0).toFixed(4)
        );
      }
      setStuck(y > 40);
      // Get out of the way going down, come back the moment they go up. The
      // 6px threshold stops trackpad jitter from flickering the bar.
      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 320);
        lastY = y;
      }
      ticking = false;
    }

    // Scroll fires far more often than the screen repaints, so we only flag
    // that work is needed and do it once per frame.
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    }

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);

  // Slide one shared pill under the active link rather than fading a border on
  // each. One moving element reads as a single object tracking you; five
  // independent fades read as five separate effects.
  const positionMarker = useCallback(() => {
    const list = listRef.current;
    const marker = markerRef.current;
    if (!list || !marker) return;
    const current = list.querySelector('[aria-current="true"]');
    if (!current) {
      marker.style.opacity = "0";
      return;
    }
    // Measure both boxes and subtract, rather than trusting offsetLeft. Rects
    // are what the element actually occupies right now, whatever the layout.
    const listBox = list.getBoundingClientRect();
    const box = current.getBoundingClientRect();
    marker.style.opacity = "1";
    marker.style.width = `${box.width}px`;
    marker.style.height = `${box.height}px`;
    marker.style.transform = `translate3d(${box.left - listBox.left}px, ${
      box.top - listBox.top
    }px, 0)`;
  }, []);

  useEffect(() => {
    positionMarker();
    // The display font loads after first paint and the labels change width when
    // it swaps in. Measuring before that leaves the pill the wrong size.
    document.fonts?.ready.then(positionMarker).catch(() => {});
    window.addEventListener("resize", positionMarker, { passive: true });
    return () => window.removeEventListener("resize", positionMarker);
  }, [active, positionMarker]);

  // A menu you cannot close with Escape is a trap.
  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="progress" aria-hidden="true">
        <div className="progress-bar" ref={barRef} />
      </div>

      <header
        className={`nav${stuck ? " is-stuck" : ""}${hidden && !open ? " is-hidden" : ""}`}
      >
        <div className="nav-inner">
          <a className="nav-brand" href="#top">
            <span className="nav-crest">
              <Image src="/logo.png" alt="" width={72} height={72} priority />
            </span>
            <span className="nav-word">
              <b>Campus Premier League</b>
              <i>Season 04</i>
            </span>
          </a>

          <nav className="nav-links" aria-label="Sections" ref={listRef}>
            <span className="nav-marker" ref={markerRef} aria-hidden="true" />
            {sections.map(({ id, label, href }) => (
              <a
                key={id}
                className="nav-link"
                href={href || `#${id}`}
                aria-current={active === id ? "true" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>

          <p className="nav-status">
            <span className="dot" aria-hidden="true" />
            {nextDate}
          </p>

          {/* One call to action on the whole site. The forms live in the
              lobby, so this is the only door and there is nothing to choose
              between. */}
          <Link className="btn btn-primary nav-cta" href="/lobby">
            Lobby
          </Link>

          <button
            type="button"
            className={`nav-burger${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        id="nav-sheet"
        className={`nav-sheet${open ? " is-open" : ""}`}
        hidden={!open}
      >
        <nav aria-label="Sections">
          {sections.map(({ id, label, href }, i) => (
            <a
              key={id}
              href={href || `#${id}`}
              style={{ "--delay": `${0.05 + i * 0.05}s` }}
              onClick={() => setOpen(false)}
            >
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
          <Link
            href="/lobby/players"
            style={{ "--delay": `${0.05 + sections.length * 0.05}s` }}
            onClick={() => setOpen(false)}
          >
            <span className="num">{String(sections.length + 1).padStart(2, "0")}</span>
            Players
          </Link>
        </nav>
        <p className="nav-sheet-foot">{nextDate}</p>
      </div>
    </>
  );
}
