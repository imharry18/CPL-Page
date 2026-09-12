"use client";

import { useState } from "react";

import SeasonShow from "@/components/lobby/SeasonShow";

/**
 * The Season 4 screen: one slide show at a time, chosen by the same tabs the
 * match board uses — the eight sides, then every player in the pool, and the
 * season's own pictures first where any have been dropped in.
 *
 * The slide is the whole page here, so the tabs sit over it rather than above
 * it: nothing is between the top of the screen and the side being shown.
 */
export default function SeasonTabs({ shows }) {
  const [at, setAt] = useState(0);
  const show = shows[at];

  return (
    <div className="showboard">
      {/* Keyed on the set, so switching tabs starts that show at its own
          first slide rather than at whatever number the last one reached. */}
      <SeasonShow
        key={show.id}
        slides={show.slides}
        label={show.name}
        auto={show.id === "teams" ? 3000 : undefined}
      />

      <div className="show-tabs" role="tablist" aria-label="Season 4">
        {shows.map((one, i) => (
          <button
            key={one.id}
            type="button"
            role="tab"
            className="show-tab display"
            aria-selected={at === i}
            onClick={() => setAt(i)}
          >
            {one.name}
          </button>
        ))}
      </div>
    </div>
  );
}
