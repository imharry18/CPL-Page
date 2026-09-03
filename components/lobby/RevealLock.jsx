"use client";

import { useSyncExternalStore } from "react";

/**
 * The countdown that sits beside a page title.
 *
 * Same trick as NextUp: the page is built ahead of time, so the server cannot
 * know what "now" is. useSyncExternalStore renders nothing on the server and
 * swaps in the real figure after hydration — no mismatch, no jump. The clock is
 * read once a minute, which is as fine-grained as days-and-hours ever needs.
 */
const MINUTE = 60 * 1000;

function subscribe(onChange) {
  const id = setInterval(onChange, MINUTE);
  return () => clearInterval(id);
}

let cachedMinute = null;
function getNow() {
  const minute = Math.floor(Date.now() / MINUTE);
  if (cachedMinute !== minute) cachedMinute = minute;
  return cachedMinute;
}

const getServerNow = () => null;

function split(target, nowMinute) {
  const diff = target - nowMinute * MINUTE;
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / MINUTE),
  };
}

export default function RevealLock({ reveal }) {
  const nowMinute = useSyncExternalStore(subscribe, getNow, getServerNow);
  const left = nowMinute === null ? null : split(Date.parse(reveal.iso), nowMinute);
  const open = nowMinute !== null && left === null;

  return (
    <div className={`until${open ? " is-open" : ""}`}>
      <p className="until-label num">
        <span className="until-dot" aria-hidden="true" />
        {open ? "Live now" : "Unlocks in"}
      </p>

      {/* Before hydration this is empty rather than a placeholder number, so
          nothing wrong is ever shown, and the row keeps its height either way. */}
      <p className="until-clock num" aria-live="off">
        {left ? (
          <>
            <b>{left.days}</b>
            <i>d</i>
            <b>{String(left.hours).padStart(2, "0")}</b>
            <i>h</i>
            <b>{String(left.minutes).padStart(2, "0")}</b>
            <i>m</i>
          </>
        ) : (
          <b className="until-open">{open ? "—" : ""}</b>
        )}
      </p>

      <p className="until-when num">
        {reveal.date} · {reveal.time} · {reveal.note}
      </p>
    </div>
  );
}
