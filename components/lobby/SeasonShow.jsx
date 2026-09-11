"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/* Past this many slides the dots stop being a row of dots and become a wall of
   them, so the run is shown as a bar instead. */
const DOTS_MAX = 12;

/** The two letters a slide falls back to when it has no picture. */
function initials(title = "?") {
  return title
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);
}

/**
 * One side, one player, or one fact — filling the screen.
 *
 * A slide is `{ key, src, stat, statUnit, tag, title, sub, note, tint }` —
 * everything but `key` is optional, so the same stage carries a plain
 * photograph, a side with its colours, a player with their year and role, or
 * a number with nothing to photograph: `stat` takes the picture's place and is
 * set as large as the crest would have been, `statUnit` a word underneath it.
 *
 * The slide is the page: the side's own colour is washed across the whole
 * frame, its crest stands on the right, and its name is set against it on the
 * left. Each one arrives rather than appears — the artwork rises into place
 * and the lines follow it in order — so the show has the movement of a
 * broadcast rather than the stillness of a list.
 *
 * Nothing moves on its own. A slide stays up until someone changes it — the
 * arrows, the dots or the left and right keys — because the board is talked
 * over, and a slide that leaves in the middle of a sentence takes the room's
 * attention with it.
 */
export default function SeasonShow({ slides, label }) {
  const [at, setAt] = useState(0);
  /* Which way the show is moving, so the outgoing slide leaves the way the
     incoming one arrives — forward slides exit left, back slides exit right. */
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (step) => {
      setDir(step >= 0 ? 1 : -1);
      setAt((now) => (now + step + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    function onKey(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      go(event.key === "ArrowRight" ? 1 : -1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section
      className="show"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        className="show-stage"
        /* Announced as one region so a screen reader is told the slide
           changed, rather than being walked through every slide at once. */
        aria-live="polite"
        data-dir={dir}
      >
        {slides.map((slide, i) => {
          // The one on screen and the one after it are fetched; the rest wait.
          // A pool of eighty photographs must not all be pulled at once, but
          // the next slide has to be there before the fade starts or the stage
          // goes blank mid-change.
          const near = i === at || i === (at + 1) % slides.length;

          return (
            <article
              className={`show-slide${i === at ? " is-on" : ""}`}
              key={slide.key}
              style={slide.tint}
              aria-hidden={i === at ? undefined : true}
            >
              {/* The side's colour, thrown across the whole frame. */}
              <div className="show-tint" aria-hidden="true" />

              {slide.src && (
                /* The same picture blown up, blurred and drifting, so the
                   frame behind the crest is the crest's own colour rather
                   than flat black. */
                <Image
                  className="show-wash"
                  src={slide.src}
                  alt=""
                  fill
                  sizes="100vw"
                  aria-hidden="true"
                  loading={near ? "eager" : "lazy"}
                />
              )}

              {/* The slide's number, set huge and hollow behind the card —
                  the one piece of set-dressing that is not the picture. */}
              <p className="show-ghost num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>

              <div className="show-body">
                <div className="show-card">
                  {slide.tag && <p className="show-tag num">{slide.tag}</p>}
                  <h2 className="show-title display">{slide.title}</h2>
                  {slide.sub && <p className="show-sub num">{slide.sub}</p>}
                  {slide.note && <p className="show-note">{slide.note}</p>}
                </div>

                <figure className="show-figure">
                  {slide.src ? (
                    <Image
                      className="show-art"
                      src={slide.src}
                      alt={slide.title ?? `Slide ${i + 1} of ${slides.length}`}
                      fill
                      sizes="(max-width: 900px) 80vw, 45vw"
                      loading={near ? "eager" : "lazy"}
                    />
                  ) : slide.stat != null ? (
                    /* A fact: the number stands where the crest would, its
                       unit set underneath the way a caption sits under a
                       photograph. */
                    <div className="show-stat">
                      <p className="show-stat-fig display">{slide.stat}</p>
                      {slide.statUnit && (
                        <p className="show-stat-unit num">{slide.statUnit}</p>
                      )}
                    </div>
                  ) : (
                    /* No photograph for this one: their initials on the side's
                       own colour, rather than a broken frame. */
                    <p className="show-blank display">{initials(slide.title)}</p>
                  )}
                </figure>
              </div>
            </article>
          );
        })}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="show-step is-back"
              onClick={() => go(-1)}
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              className="show-step is-next"
              onClick={() => go(1)}
              aria-label="Next slide"
            >
              →
            </button>
          </>
        )}

        {slides.length > 1 && (
          <div className="show-foot">
            <p className="show-no num">
              {String(at + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </p>

            {slides.length <= DOTS_MAX ? (
              <div className="show-dots">
                {slides.map((slide, i) => (
                  <button
                    key={slide.key}
                    type="button"
                    className={`show-dot${i === at ? " is-on" : ""}`}
                    onClick={() => setAt(i)}
                    aria-label={slide.title ?? `Slide ${i + 1}`}
                    aria-current={i === at ? "true" : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="show-bar" aria-hidden="true">
                {/* The run through the set — how far in you are, not how long
                    is left. */}
                <span
                  className="show-run"
                  style={{ width: `${((at + 1) / slides.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
