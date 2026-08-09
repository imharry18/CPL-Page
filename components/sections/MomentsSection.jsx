"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Supported extensions in priority order
const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "mp4", "webm"];

function isVideo(src) {
  return /\.(mp4|webm)$/i.test(src);
}

function MomentVideo({ src, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      controlsList="nodownload"
      disablePictureInPicture
    />
  );
}

export default function MomentsSection() {
  const [media, setMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackRef = useRef(null);
  const autoPlayRef = useRef(null);
  const touchStartRef = useRef(0);

  // Discover media files by probing /moments/1.jpg, /moments/2.jpg, etc.
  useEffect(() => {
    let cancelled = false;

    async function probeFile(index) {
      for (const ext of EXTENSIONS) {
        try {
          const res = await fetch(`/moments/${index}.${ext}`, { method: "HEAD" });
          if (res.ok) return `/moments/${index}.${ext}`;
        } catch {
          // skip
        }
      }
      return null;
    }

    async function discoverMedia() {
      const found = [];
      let index = 1;
      let consecutiveMisses = 0;

      while (consecutiveMisses < 3) {
        const src = await probeFile(index);
        if (src) {
          found.push(src);
          consecutiveMisses = 0;
        } else {
          consecutiveMisses++;
        }
        index++;
      }

      if (!cancelled && found.length > 0) {
        setMedia(found);
      }
    }

    discoverMedia();
    return () => { cancelled = true; };
  }, []);

  // Auto-play: advance every 4 seconds
  useEffect(() => {
    if (media.length <= 1) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        goNext();
      }, 4000);
    };

    startAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [media.length]);

  const resetAutoPlay = useCallback(() => {
    clearInterval(autoPlayRef.current);
    if (media.length > 1) {
      autoPlayRef.current = setInterval(() => {
        goNext();
      }, 4000);
    }
  }, [media.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (media.length || 1));
  }, [media.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (media.length || 1)) % (media.length || 1));
  }, [media.length]);

  const handlePrev = () => {
    goPrev();
    resetAutoPlay();
  };

  const handleNext = () => {
    goNext();
    resetAutoPlay();
  };

  // Touch/swipe support
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  if (media.length === 0) return null;

  // Build visible slides: prev, current, next for smooth infinite loop
  const prevIdx = (currentIndex - 1 + media.length) % media.length;
  const nextIdx = (currentIndex + 1) % media.length;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .section-moments {
          position: relative; width: 100%; padding: 10vh 0 12vh; overflow: hidden;
        }
        .moments-header {
          text-align: center; margin-bottom: 4rem; padding: 0 clamp(1rem, 5vw, 4rem);
        }
        .moments-eyebrow {
          display: inline-block; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.25em;
          text-transform: uppercase; color: var(--accent-gold); margin-bottom: 1.25rem;
        }
        .moments-title {
          font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; color: #fff;
          letter-spacing: -0.04em; line-height: 1.1;
        }

        .moments-carousel {
          position: relative; width: 100%; max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; justify-content: center; gap: 1.5rem;
          padding: 0 clamp(1rem, 3vw, 3rem);
        }

        .moments-track {
          position: relative; width: 100%; max-width: 900px; aspect-ratio: 16/10;
          border-radius: 20px; overflow: hidden;
        }

        .moment-slide {
          position: absolute; inset: 0; opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          transform: scale(0.95);
          border-radius: 20px; overflow: hidden;
        }
        .moment-slide.active {
          opacity: 1; transform: scale(1); z-index: 2;
        }
        .moment-slide.prev, .moment-slide.next {
          opacity: 0; z-index: 1;
        }

        .moment-slide img, .moment-slide video {
          width: 100%; height: 100%; object-fit: contain; display: block; border-radius: 20px;
        }

        .moment-slide::after {
          content: ""; position: absolute; inset: 0; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06); pointer-events: none;
        }

        .moments-nav-btn {
          flex-shrink: 0; width: 56px; height: 56px; border-radius: 50%;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); backdrop-filter: blur(8px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .moments-nav-btn:hover {
          background: rgba(212, 175, 55, 0.15); border-color: rgba(212, 175, 55, 0.4);
          transform: scale(1.1); box-shadow: 0 8px 30px rgba(212, 175, 55, 0.15);
        }
        .moments-nav-btn:active { transform: scale(0.95); }

        .moments-dots {
          display: flex; justify-content: center; gap: 0.5rem; margin-top: 2.5rem;
        }
        .moments-dot {
          width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; padding: 0;
          background: rgba(255,255,255,0.15); transition: all 0.4s ease;
        }
        .moments-dot.active {
          background: var(--accent-gold); width: 28px; border-radius: 4px;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
        }

        .moments-counter {
          text-align: center; margin-top: 1.25rem; font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3);
        }

        @media (max-width: 768px) {
          .moments-nav-btn { width: 44px; height: 44px; }
          .moments-carousel { gap: 0.75rem; }
        }
      `}} />

      <section id="moments" className="section-moments">
        <div className="moments-header reveal">
          <span className="moments-eyebrow">Captured Moments</span>
          <h2 className="moments-title">
            The Story in
            <br />
            Every Frame.
          </h2>
        </div>

        <div
          className="moments-carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Left Arrow */}
          <button
            type="button"
            className="moments-nav-btn"
            onClick={handlePrev}
            aria-label="Previous moment"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Track */}
          <div className="moments-track" ref={trackRef}>
            {media.map((src, i) => {
              let slideClass = "moment-slide";
              if (i === currentIndex) slideClass += " active";
              else if (i === prevIdx) slideClass += " prev";
              else if (i === nextIdx) slideClass += " next";

              return (
                <div key={src} className={slideClass}>
                  {isVideo(src) ? (
                    <MomentVideo src={src} isActive={i === currentIndex} />
                  ) : (
                    <img src={src} alt={`CPL Moment ${i + 1}`} loading="lazy" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            className="moments-nav-btn"
            onClick={handleNext}
            aria-label="Next moment"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="moments-dots">
          {media.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`moments-dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => { setCurrentIndex(i); resetAutoPlay(); }}
              aria-label={`Go to moment ${i + 1}`}
            />
          ))}
        </div>

        <div className="moments-counter">
          {currentIndex + 1} / {media.length}
        </div>
      </section>
    </>
  );
}
