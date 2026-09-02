"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Scroll-scrubbed background footage.
 *
 * The video never plays. It is paused permanently and we set `currentTime`
 * from the scroll position, so the drone orbit is driven entirely by the
 * user's scrolling — the GTA VI approach. The clip is stretched across the
 * entire document, so the shot finishes on the last pixel of scroll rather
 * than freezing part way down.
 *
 * Three things make this smooth rather than stuttery:
 *
 * 1. THE ENCODE. Every frame in stadium-scrub.mp4 is a keyframe. Normally a
 *    video only has one every few seconds, and seeking to an arbitrary time
 *    forces the decoder to rewind to the last keyframe and decode everything
 *    in between. With every frame independent, any seek is one decode.
 *
 * 2. DAMPING. We do not seek to the raw scroll position. We ease toward it,
 *    so a flick of the wheel becomes a glide instead of a jump, and we skip
 *    the seek entirely when the target moved less than one frame.
 *
 * 3. ONE LOOP. Scroll position is read inside requestAnimationFrame, not in
 *    a scroll handler, so we never seek more often than the screen refreshes.
 */

/**
 * Should this visitor get the poster instead of 4MB of video?
 *
 * Someone on a metered connection, or who has asked for less motion, gets the
 * still. Downloading video for a background they did not ask for is not a
 * premium experience, it is a rude one.
 *
 * This is read with useSyncExternalStore rather than by setting state inside
 * an effect. The server has no way to know the answer, so it returns false and
 * React re-checks the moment it hydrates — which is exactly the problem this
 * hook exists to solve.
 */
function subscribe(onChange) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readClient() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigator.connection;
  return (
    reduceMotion ||
    connection?.saveData === true ||
    /2g/.test(connection?.effectiveType || "")
  );
}

const readServer = () => false;

export default function ScrubVideo() {
  const videoRef = useRef(null);
  const posterOnly = useSyncExternalStore(subscribe, readClient, readServer);

  useEffect(() => {
    if (posterOnly) return;

    const video = videoRef.current;
    if (!video) return;

    let ready = false;
    let raf = 0;
    let currentTime = 0;

    function onLoaded() {
      ready = true;
      // Safari on iOS will not decode a frame until the element has played at
      // least once, even muted. Start and immediately stop: one frame decoded,
      // nothing audible, seeking now works.
      video.play().then(() => video.pause()).catch(() => {});
    }

    video.addEventListener("loadeddata", onLoaded, { once: true });

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!ready || !video.duration) return;

      // The orbit is mapped across the whole document, so the last frame lands
      // exactly as you reach the bottom. Measuring it every frame rather than
      // once matters: lazy-loaded images change the page height as you go.
      const doc = document.documentElement;
      const range = doc.scrollHeight - window.innerHeight;
      const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;

      const target = progress * (video.duration - 0.001);
      currentTime += (target - currentTime) * 0.12;

      // One frame at 12fps is 0.083s. Seeking for less than that is work the
      // viewer cannot see.
      if (Math.abs(video.currentTime - currentTime) > 1 / 24) {
        video.currentTime = currentTime;
      }
    }

    raf = requestAnimationFrame(frame);

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("loadeddata", onLoaded);
    };
  }, [posterOnly]);

  return (
    <div className="film" aria-hidden="true">
      {posterOnly ? (
        <Image
          className="film-media"
          src="/stadium-poster.jpg"
          alt=""
          fill
          sizes="100vw"
        />
      ) : (
        <video
          ref={videoRef}
          className="film-media"
          poster="/stadium-poster.jpg"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        >
          {/* Small screens get the 981KB cut. `media` lets the browser pick
              before it downloads anything. */}
          <source src="/stadium-scrub-sm.mp4" type="video/mp4" media="(max-width: 820px)" />
          <source src="/stadium-scrub.mp4" type="video/mp4" />
        </video>
      )}
      <div className="film-scrim" />
    </div>
  );
}
