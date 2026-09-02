"use client";

import dynamic from "next/dynamic";

/**
 * three.js is ~150KB gzipped. Loading it inside the first JavaScript bundle
 * would delay the moment the page becomes interactive, for a decoration the
 * user cannot touch. So it loads on its own, after hydration, and the page
 * is complete and readable before it arrives.
 */
const BallScene = dynamic(() => import("./BallScene"), { ssr: false });

export default function BallCanvas() {
  return <BallScene />;
}
