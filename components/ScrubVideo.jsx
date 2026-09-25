"use client";

import Image from "next/image";




export default function ScrubVideo() {
  return (
    <div className="film" aria-hidden="true">
      <Image
        className="film-media"
        src="/stadium-bg-v2.jpg"
        alt=""
        fill
        sizes="100vw"
      />
      <div className="film-scrim" />
    </div>
  );
}
