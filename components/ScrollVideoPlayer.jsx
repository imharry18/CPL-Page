"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollVideoPlayer() {
  const canvasRef = useRef(null);
  const [frameCount, setFrameCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const imagesRef = useRef({}); // Cache of index -> Image elements
  const loadedIndexesRef = useRef(new Set()); // Indexes of fully loaded images
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const scrollDirectionRef = useRef(1); // 1 = down, -1 = up
  const lastScrollTopRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  const STEP = 3; // Render every 3rd frame to reduce network/CPU load by 67% for 60fps smoothness

  const getSteppedIndex = (idx) => {
    if (frameCount === 0) return 0;
    return Math.min(frameCount - 1, Math.floor(idx / STEP) * STEP);
  };

  // 1. Preload Frame 0 immediately for instant display, then stream anchors in background
  function preloadAnchors(total) {
    // Load first frame immediately and show page right away
    loadImage(0, () => {
      drawFrame(0);
      setIsReady(true);
    });

    const failSafeTimeout = setTimeout(() => {
      setIsReady(true);
    }, 400);

    // Preload first 20 stepped frames for initial smooth scroll
    for (let i = 1; i <= 20; i++) {
      const nextIdx = Math.min(total - 1, i * STEP);
      loadImage(nextIdx);
    }

    // Preload anchor frames across timeline in background
    const numAnchors = 40;
    for (let i = 0; i < numAnchors; i++) {
      const rawIdx = Math.min(total - 1, Math.floor(i * (total - 1) / (numAnchors - 1)));
      const idx = getSteppedIndex(rawIdx);
      loadImage(idx, () => {
        clearTimeout(failSafeTimeout);
        setIsReady(true);
      });
    }
  }

  const loadImage = (index, callback) => {
    const steppedIndex = getSteppedIndex(index);

    if (imagesRef.current[steppedIndex]) {
      if (loadedIndexesRef.current.has(steppedIndex)) {
        if (callback) callback();
      } else {
        const img = imagesRef.current[steppedIndex];
        const oldOnload = img.onload;
        const oldOnerror = img.onerror;

        img.onload = () => {
          if (oldOnload) oldOnload();
          loadedIndexesRef.current.add(steppedIndex);
          if (steppedIndex === getSteppedIndex(Math.round(currentFrameRef.current))) {
            drawFrame(steppedIndex);
          }
          if (callback) callback();
        };
        img.onerror = () => {
          if (oldOnerror) oldOnerror();
          if (callback) callback();
        };
      }
      return;
    }

    const img = new Image();
    const paddedIndex = steppedIndex.toString().padStart(4, "0");
    img.src = `/frames/frame_${paddedIndex}.jpg`;
    imagesRef.current[steppedIndex] = img;

    if (typeof img.decode === "function") {
      img.decode()
        .then(() => {
          loadedIndexesRef.current.add(steppedIndex);
          if (steppedIndex === getSteppedIndex(Math.round(currentFrameRef.current))) {
            drawFrame(steppedIndex);
          }
          if (callback) callback();
        })
        .catch(() => {
          img.onload = () => {
            loadedIndexesRef.current.add(steppedIndex);
            if (steppedIndex === getSteppedIndex(Math.round(currentFrameRef.current))) {
              drawFrame(steppedIndex);
            }
            if (callback) callback();
          };
          img.onerror = () => { if (callback) callback(); };
        });
    } else {
      img.onload = () => {
        loadedIndexesRef.current.add(steppedIndex);
        if (steppedIndex === getSteppedIndex(Math.round(currentFrameRef.current))) {
          drawFrame(steppedIndex);
        }
        if (callback) callback();
      };
      img.onerror = () => { if (callback) callback(); };
    }
  };

  const getNearestLoadedFrame = (targetIndex) => {
    const steppedTarget = getSteppedIndex(targetIndex);
    if (loadedIndexesRef.current.size === 0) return null;
    if (loadedIndexesRef.current.has(steppedTarget)) return steppedTarget;

    let nearest = null;
    let minDistance = Infinity;

    for (const idx of loadedIndexesRef.current) {
      const dist = Math.abs(idx - steppedTarget);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = idx;
      }
    }
    return nearest;
  };

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const steppedIndex = getSteppedIndex(index);
    const drawIndex = getNearestLoadedFrame(steppedIndex);
    if (drawIndex === null) return;

    const img = imagesRef.current[drawIndex];
    if (img && img.complete) {
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  };

  const prefetchFrames = (currentIndex, direction, count = 10) => {
    if (frameCount === 0) return;
    for (let i = 1; i <= count; i++) {
      const nextIndex = currentIndex + (i * STEP * direction);
      if (nextIndex >= 0 && nextIndex < frameCount) {
        loadImage(nextIndex);
      }
    }
  };

  useEffect(() => {
    fetch("/frames/metadata.json")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.frameCount > 0) {
          setFrameCount(data.frameCount);
          preloadAnchors(data.frameCount);
        }
      })
      .catch(() => {
        setFrameCount(1560);
        preloadAnchors(1560);
      });

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (frameCount === 0) return;

    const animate = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.05) {
        const nextFrame = current + diff * 0.05;
        currentFrameRef.current = nextFrame;

        const roundedIndex = Math.min(frameCount - 1, Math.max(0, Math.round(nextFrame)));
        drawFrame(roundedIndex);
        prefetchFrames(roundedIndex, scrollDirectionRef.current, 10);
      } else if (Math.round(current) !== target) {
        currentFrameRef.current = target;
        drawFrame(target);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [frameCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (frameCount === 0) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;

      if (scrollTop > lastScrollTopRef.current) scrollDirectionRef.current = 1;
      else if (scrollTop < lastScrollTopRef.current) scrollDirectionRef.current = -1;
      lastScrollTopRef.current = scrollTop;

      const targetIndex = Math.min(frameCount - 1, Math.max(0, Math.floor(scrollFraction * frameCount)));
      targetFrameRef.current = targetIndex;
      loadImage(targetIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [frameCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      drawFrame(Math.round(currentFrameRef.current));
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [frameCount]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          zIndex: 0, backgroundColor: "#000", pointerEvents: "none"
        }}
      />

    </>
  );
}

