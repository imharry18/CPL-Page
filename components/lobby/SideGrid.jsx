"use client";

import { useState } from "react";
import SquadPopup from "@/components/lobby/SquadPopup";
import { mask } from "@/lib/cipher";

/**
 * The eight side cards, each of which opens its squad.
 *
 * A card is only clickable once its side is named — an unnamed one has nothing
 * to show but ciphertext, so it stays inert rather than opening an empty panel.
 */
export default function SideGrid({ sides, players, paid = {} }) {
  const [open, setOpen] = useState(null);

  return (
    <>
      <div className="side-grid">
        {sides.map((side, i) => {
          const card = (
            <>
              <span className="side-art" aria-hidden="true" />
              <span className="side-sweep" aria-hidden="true" />
              <span className="side-scan" aria-hidden="true" />

              <p className="side-no num">{String(side.no).padStart(2, "0")}</p>

              {/* The name sits on the floor of the card; the detail below it is
                  collapsed to nothing until hover, and expanding it is what
                  lifts the name. */}
              {side.name ? (
                <div className="side-body">
                  <h2 className="side-name side-name-real display">
                    {side.name}
                  </h2>
                  <div className="side-detail">
                    <div>
                      {/* A captain can be named later than the side is, so an
                          unnamed one stays redacted rather than blank. */}
                      <p className="side-meta num">
                        Captain {side.captain || mask(side.no + 3, 3)}
                      </p>
                      <p className="side-note">{side.note}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="side-body">
                  <p className="cipher side-name">{mask(side.no, 7)}</p>
                  <div className="side-detail">
                    <div>
                      <p className="side-meta num">
                        Captain {mask(side.no + 3, 3)}
                      </p>
                      <p className="side-note side-teaser">{side.teaser}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          );

          const style = {
            "--i": i,
            ...(side.logo ? { "--logo": `url("${side.logo}")` } : null),
            ...(side.color
              ? { "--team": side.color, "--team-lit": side.colorLit }
              : null),
          };

          return side.name ? (
            <button
              type="button"
              className="side is-named is-open"
              key={side.no}
              style={style}
              onClick={() => setOpen(side)}
              aria-label={`${side.name} — see the squad`}
            >
              {card}
            </button>
          ) : (
            <article className="side" key={side.no} style={style}>
              {card}
            </article>
          );
        })}
      </div>

      {open && (
        <SquadPopup
          side={open}
          players={players}
          paid={paid}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
