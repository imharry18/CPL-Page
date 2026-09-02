"use client";

import { useEffect } from "react";

/**
 * Adds `.is-visible` to anything marked `.reveal` or `.line-mask` once it
 * scrolls into view. The animation lives in CSS — JavaScript only decides
 * *when*, never *how*, so the browser can run it off the main thread.
 *
 * The governing rule here is that these elements start at opacity 0, which
 * means every path through this file has to end with them visible. Content
 * that depends on an animation to become readable can end up unreadable:
 *
 *  - requestAnimationFrame is frozen in a background tab, so the intro's
 *    "done" event may arrive very late, or never.
 *  - IntersectionObserver reports nothing at all while a document is hidden,
 *    so waiting on it in a background tab waits forever.
 *
 * So: a manual sweep runs immediately and again whenever the tab is fronted,
 * and there is a hard timeout behind everything.
 */

const SELECTOR = ".reveal, .line-mask";

/** Mark anything already on screen, without waiting to be told. */
function sweep() {
  const limit = window.innerHeight * 0.92;
  document.querySelectorAll(SELECTOR).forEach((el) => {
    if (el.classList.contains("is-visible")) return;
    const box = el.getBoundingClientRect();
    if (box.top < limit && box.bottom > 0) el.classList.add("is-visible");
  });
}

function showEverything() {
  document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add("is-visible"));
}

export default function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showEverything();
      return;
    }

    let observer = null;
    let started = false;

    function start() {
      if (started) return;
      started = true;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
      );

      document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));

      // Don't rely on the observer's first callback for what is already on
      // screen — in a hidden tab it never comes.
      sweep();
    }

    // Wait for the title sequence so the hero reveal is not playing behind the
    // curtain — but never wait on it indefinitely.
    const fallback = setTimeout(start, 2800);
    if (document.documentElement.dataset.intro === "running") {
      window.addEventListener("intro:done", start, { once: true });
    } else {
      start();
    }

    // Coming back to a tab that was opened in the background: this is the
    // moment the observer can finally see anything, so sweep again.
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      start();
      sweep();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(fallback);
      window.removeEventListener("intro:done", start);
      document.removeEventListener("visibilitychange", onVisible);
      observer?.disconnect();
    };
  }, []);

  return null;
}
