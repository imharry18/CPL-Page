import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

/**
 * The old version discovered these files at runtime, by firing HEAD requests
 * at /moments/1.jpg, /moments/1.jpeg, /moments/1.png ... one index at a time
 * until three in a row missed. That is dozens of round-trips before the first
 * photo can even start loading.
 *
 * The folder is known at build time, so we read it at build time. Zero
 * requests, zero waiting, and the images are server-rendered into the HTML.
 */
const IMAGE_PATTERN = /\.(webp|jpe?g|png|avif)$/i;

function readMoments() {
  const dir = path.join(process.cwd(), "public", "moments");
  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return files
    .filter((file) => IMAGE_PATTERN.test(file))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .map((file) => `/moments/${file}`);
}

export default function MomentsSection() {
  const moments = readMoments();
  if (moments.length === 0) return null;

  return (
    <section id="moments" className="section moments">
      <div className="head reveal">
        <p className="eyebrow">From the ground</p>
        <h2 className="display display-l head-title">What it actually looks like.</h2>
        <div className="seam-rule head-rule" />
      </div>

      <div
        className="strip"
        tabIndex={0}
        role="region"
        aria-label="Photographs from past seasons — scroll horizontally"
      >
        {moments.map((src, i) => (
          <figure className="frame" key={src}>
            <Image
              src={src}
              alt={`Campus Premier League match photograph ${i + 1}`}
              fill
              sizes="(max-width: 700px) 78vw, 460px"
              /* The first two are on screen immediately; the rest wait until
                 the user scrolls toward them. */
              loading={i < 2 ? "eager" : "lazy"}
            />
            <figcaption className="frame-no num">
              {String(i + 1).padStart(2, "0")}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="moments-foot">
        <span className="num">{String(moments.length).padStart(2, "0")} frames</span>
        <span aria-hidden="true">— drag sideways</span>
      </p>
    </section>
  );
}
