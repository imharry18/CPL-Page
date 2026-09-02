"use client";

import { useState } from "react";

/**
 * Sketchfab embed, behind a click-to-load facade.
 *
 * The iframe is not in the page until someone presses the button. That matters
 * for three reasons:
 *
 *  - The model is 652k triangles with 4K textures. Loading it on every visit,
 *    for a decoration most people scroll past, would cost more than the entire
 *    rest of the site put together.
 *  - It spins up a second WebGL context. The cricket ball already owns one,
 *    and two contexts fighting on a mid-range laptop is how a smooth page
 *    turns into a slideshow.
 *  - It is a third-party frame that sets cookies. Nobody should be tracked by
 *    another company because they scrolled past a section.
 *
 * `dnt=1` is Sketchfab's own do-not-track flag, kept on even after opt-in.
 * The attribution line is required by their terms and stays visible either way.
 */

const MODEL_ID = "1f3a11a2d03f480f92965c1f3014bbe6";
const MODEL_URL =
  "https://sketchfab.com/3d-models/uae-emaar-super-cup-trophy-award-" + MODEL_ID;
const AUTHOR_URL = "https://sketchfab.com/3DserVision_studio";

const EMBED_SRC =
  `https://sketchfab.com/models/${MODEL_ID}/embed` +
  "?dnt=1&autostart=1&autospin=0.3&ui_theme=dark&ui_infos=0&ui_hint=0&transparent=1";

export default function TrophyEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="trophy">
      <div className="trophy-stage">
        {loaded ? (
          <iframe
            className="trophy-frame"
            title="UAE Emaar Super Cup Trophy Award — interactive 3D model"
            src={EMBED_SRC}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        ) : (
          <button type="button" className="trophy-facade" onClick={() => setLoaded(true)}>
            <svg viewBox="0 0 48 64" aria-hidden="true" focusable="false">
              <path
                d="M14 6h20v14a10 10 0 0 1-20 0V6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
              <path
                d="M14 10H8v4a8 8 0 0 0 6 7.7M34 10h6v4a8 8 0 0 1-6 7.7"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
              <path
                d="M24 30v10m-7 0h14v4H17z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
              <path d="M12 50h24v6H12z" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
            <span className="trophy-cta">Load the 3D trophy</span>
            <span className="trophy-note">
              Loads from sketchfab.com · nothing is requested until you press this
            </span>
          </button>
        )}
      </div>

      <figcaption className="trophy-credit">
        <a href={MODEL_URL} target="_blank" rel="noopener noreferrer">
          UAE Emaar Super Cup Trophy Award
        </a>{" "}
        by{" "}
        <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
          3DserVision_studio
        </a>{" "}
        on Sketchfab. Shown as a display model — the CPL cup is decided on 27
        September.
      </figcaption>
    </figure>
  );
}
