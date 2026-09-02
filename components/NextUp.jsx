"use client";

import { useSyncExternalStore } from "react";

/**
 * "Auction — in 10 days".
 *
 * Today's date only exists in the browser. The page is built once, ahead of
 * time, so the server genuinely cannot know it — render it on the server and
 * the number would be frozen at whenever the build ran.
 *
 * useSyncExternalStore is the tool for exactly this: it renders the server
 * value (nothing) during hydration, then swaps in the real one, without the
 * hydration mismatch you get from reading Date.now() during render.
 */

const HOUR = 60 * 60 * 1000;

function subscribe(onChange) {
  const id = setInterval(onChange, HOUR);
  return () => clearInterval(id);
}

// getSnapshot is called on every render and must return the same value until
// something actually changes, or React re-renders forever. Day granularity is
// naturally stable — it only moves at midnight.
let cachedDay = null;
function getToday() {
  const day = Math.floor(Date.now() / 86_400_000);
  if (cachedDay !== day) cachedDay = day;
  return cachedDay;
}

const getServerToday = () => null;

export default function NextUp({ dates }) {
  const today = useSyncExternalStore(subscribe, getToday, getServerToday);

  // Server render and first hydration pass: show the first date with no
  // countdown, so the layout is identical and nothing jumps.
  const fallback = dates[0];
  if (today === null) {
    return (
      <p className="nextup">
        <span className="nextup-label">Next up</span>
        <span className="nextup-event">{fallback.label}</span>
        <span className="nextup-when">
          {fallback.day} {fallback.month}
        </span>
      </p>
    );
  }

  const upcoming = dates
    .map((date) => ({
      ...date,
      day_number: Math.floor(Date.parse(`${date.iso}T00:00:00Z`) / 86_400_000),
    }))
    .find((date) => date.day_number >= today);

  if (!upcoming) {
    return (
      <p className="nextup">
        <span className="nextup-label">Season 04</span>
        <span className="nextup-event">Complete</span>
      </p>
    );
  }

  const daysAway = upcoming.day_number - today;
  const when =
    daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `In ${daysAway} days`;

  return (
    <p className="nextup">
      <span className="nextup-label">Next up</span>
      <span className="nextup-event">{upcoming.label}</span>
      <span className="nextup-when">
        {upcoming.day} {upcoming.month} · {when}
      </span>
    </p>
  );
}
