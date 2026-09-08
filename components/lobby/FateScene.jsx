"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The FateGrid spectacle, in WebGL.
 *
 * Sixteen cards — eight sides and eight iconic players — as textured planes.
 * At rest they hang in two columns facing the room. On the draw they are
 * thrown onto two counter-rotating rings, the outer one carrying the sides and
 * the inner one the players, and both wind up to speed. When the count runs
 * out the rings brake, each side swings round to meet the player it drew, and
 * the pair holds together while the grid is written underneath.
 *
 * Everything the eye reads is drawn into a canvas texture per card — crest,
 * name, colour, corner brackets — so the whole scene is one material type and
 * sixteen draw calls, and nothing has to be downloaded that the page was not
 * already loading.
 *
 * The card art is composed at twice its on-screen size, because a plane seen
 * at an angle on the far side of a ring still has to hold its lettering.
 */

const CARD_W = 2.9;
const CARD_H = 1.15;

/* The result card: one box per pair, and the last thing the room looks at, so
   it is wider than the two it replaces and carries everything at once —
   the crest on the left, the side and the name it drew up the middle, and the
   player's own face on the right. */
/* Wider than it was, and deliberately so. The box height is fixed by having
   to fit four rows in one frustum, and the width follows the height through
   this ratio — so the only way to use the space left and right of the board
   was to make the artwork itself wider. The middle grew with it, which is
   where the two names live, so they are set larger as well. */
const RESULT_W = 6.94;
const RESULT_H = 1.45;
const RTEX_W = 1800;
const RTEX_H = 376;

/* The world-space height the camera takes in at the cards' depth, and the
   middle of it. Derived from the camera below (fov 46 at z 9.4, looking from
   y 1.1); kept a little inside the true frustum so the top and bottom cards
   are not flush against the edge of the screen.
 *
 * The middle is ZERO, not the camera's own height. The camera stands at y 1.1
 * but LOOKS AT the origin, so it is pitched down about 7 degrees and the band
 * it can see on this plane — roughly -4.04 to +4.04 — is centred on the point
 * it is aimed at. Taking the camera's height as the middle instead put the top
 * of the column at +4.77 against a ceiling of +4.04, and the first card of
 * each column was cut in half by the top of the screen. */
const READY_SPAN = 7.5;
const READY_MID = 0;
const TEX_W = 1024;
const TEX_H = 406;

/** Load an image, or resolve null — a missing photo must not stall the draw. */
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** A hex colour at an alpha, for layering a side's colour over the dark. */
function tint(hex, alpha) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((d) => d + d).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Draw an image to cover a square, cropping from the top rather than the
 * middle.
 *
 * A crest is built downwards from its crown and a photograph is a person
 * standing up, so a centred crop of either takes the top off the thing you
 * wanted to see — the Rifles' lion lost its head. `bias` is how far down the
 * overflow to slide: 0 keeps the very top, 1 would be the bottom.
 */
function coverSquare(c, image, x, y, size, bias = 0) {
  const scale = Math.max(size / image.width, size / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  c.drawImage(image, x + (size - w) / 2, y + (size - h) * bias, w, h);
}

/** Compose one card: art on the left, name on the right, brackets around. */
function cardTexture({ title, sub, image, colour, round }) {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const c = canvas.getContext("2d");

  const grad = c.createLinearGradient(0, 0, TEX_W, TEX_H);
  grad.addColorStop(0, colour);
  grad.addColorStop(0.55, "#0c1110");
  grad.addColorStop(1, "#07090a");
  c.fillStyle = grad;
  c.fillRect(0, 0, TEX_W, TEX_H);

  c.globalAlpha = 0.85;
  c.fillStyle = "#07090a";
  c.fillRect(6, 6, TEX_W - 12, TEX_H - 12);
  c.globalAlpha = 1;

  // The side's colour down the leading edge.
  c.fillStyle = colour;
  c.fillRect(6, 6, 10, TEX_H - 12);

  const pad = 34;
  const art = TEX_H - pad * 2;
  if (image) {
    c.save();
    c.beginPath();
    if (round) {
      c.arc(pad + art / 2, TEX_H / 2, art / 2, 0, Math.PI * 2);
    } else {
      c.rect(pad, pad, art, art);
    }
    c.clip();
    /* Cover, not stretch — every crest and photograph is a different shape.
       Cropped from the top for the same reason as the result box: a centred
       crop takes the crown off a crest and the head off a photograph. */
    coverSquare(c, image, pad, pad, art, round ? 0.12 : 0);
    c.restore();
  } else {
    c.fillStyle = "rgba(237,231,218,0.06)";
    c.fillRect(pad, pad, art, art);
  }

  const x = pad + art + 34;
  c.fillStyle = "#ede7da";
  c.font = "700 62px Archivo, system-ui, sans-serif";
  c.textBaseline = "middle";

  // One line if it fits, two if it does not — names run long.
  const room = TEX_W - x - pad;
  let line = title;
  if (c.measureText(title).width > room) {
    const words = title.split(" ");
    let first = "";
    while (words.length && c.measureText(`${first}${words[0]} `).width < room) {
      first += `${words.shift()} `;
    }
    c.fillText(first.trim(), x, TEX_H / 2 - 34);
    line = words.join(" ");
    c.fillText(line, x, TEX_H / 2 + 30);
  } else {
    c.fillText(title, x, TEX_H / 2 - 12);
  }

  if (sub) {
    c.fillStyle = colour;
    c.font = "500 30px ui-monospace, monospace";
    c.fillText(sub.toUpperCase(), x, TEX_H - pad - 6);
  }

  // Corner brackets — the one piece of pure decoration, and the thing that
  // makes a flat plane read as a panel rather than a photograph.
  c.strokeStyle = colour;
  c.lineWidth = 4;
  const b = 30;
  for (const [cx, cy, dx, dy] of [
    [14, 14, 1, 1],
    [TEX_W - 14, 14, -1, 1],
    [14, TEX_H - 14, 1, -1],
    [TEX_W - 14, TEX_H - 14, -1, -1],
  ]) {
    c.beginPath();
    c.moveTo(cx + dx * b, cy);
    c.lineTo(cx, cy);
    c.lineTo(cx, cy + dy * b);
    c.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * One pair, composed as a single readable box.
 *
 * Crest left, side and player up the middle, the player's face right — so the
 * room can read who went where off one object rather than inferring it from
 * two cards that happen to be next to each other. Both pictures are the same
 * square in the same frame, and the side's colour is washed across the whole
 * box rather than confined to a stripe, so eight results read as eight sides
 * at a glance from the back of a hall.
 */
function resultTexture({ side, player, crest, photo, colour, colourLit }) {
  const canvas = document.createElement("canvas");
  canvas.width = RTEX_W;
  canvas.height = RTEX_H;
  const c = canvas.getContext("2d");

  // Dark underneath, the side's colour laid over it corner to corner.
  c.fillStyle = "#06080a";
  c.fillRect(0, 0, RTEX_W, RTEX_H);

  const wash = c.createLinearGradient(0, 0, RTEX_W, RTEX_H);
  wash.addColorStop(0, tint(colour, 0.92));
  wash.addColorStop(0.32, tint(colour, 0.3));
  wash.addColorStop(0.68, tint(colour, 0.13));
  wash.addColorStop(1, tint(colourLit, 0.2));
  c.fillStyle = wash;
  c.fillRect(0, 0, RTEX_W, RTEX_H);

  // A little more depth under the type, so the names never sit on the colour.
  const shade = c.createLinearGradient(0, 0, 0, RTEX_H);
  shade.addColorStop(0, "rgba(6,8,10,0.18)");
  shade.addColorStop(0.5, "rgba(6,8,10,0.42)");
  shade.addColorStop(1, "rgba(6,8,10,0.62)");
  c.fillStyle = shade;
  c.fillRect(0, 0, RTEX_W, RTEX_H);

  const pad = 26;
  const art = RTEX_H - pad * 2;
  const cx = pad + 10;
  const px = RTEX_W - pad - art;

  /** One square picture, framed in the side's colour. */
  const square = (image, x, bias) => {
    c.save();
    c.beginPath();
    c.rect(x, pad, art, art);
    c.clip();
    c.fillStyle = "rgba(6,8,10,0.55)";
    c.fillRect(x, pad, art, art);
    if (image) coverSquare(c, image, x, pad, art, bias);
    c.restore();
    c.strokeStyle = tint(colourLit, 0.85);
    c.lineWidth = 3;
    c.strokeRect(x + 1.5, pad + 1.5, art - 3, art - 3);
  };

  // The crest from its very top; the player a touch lower, where a face is.
  square(crest, cx, 0);
  square(photo, px, 0.12);

  /* The middle. Sized to the gap between the two squares and shrunk if a long
     side name and a long player name will not both fit — a result nobody can
     read is worse than a result set small. */
  const x = cx + art + 40;
  const room = px - 40 - x;
  c.textBaseline = "middle";

  const fit = (text, weight, size) => {
    let at = size;
    c.font = `${weight} ${at}px Archivo, system-ui, sans-serif`;
    while (c.measureText(text).width > room && at > 18) {
      at -= 2;
      c.font = `${weight} ${at}px Archivo, system-ui, sans-serif`;
    }
  };

  c.shadowColor = "rgba(0,0,0,0.55)";
  c.shadowBlur = 12;

  c.fillStyle = "#f4f0e6";
  fit(side, 700, 62);
  c.fillText(side, x, RTEX_H / 2 - 74);

  c.shadowBlur = 0;
  c.fillStyle = tint(colourLit, 0.95);
  c.font = "500 30px ui-monospace, monospace";
  c.fillText("VICE CAPTAIN", x, RTEX_H / 2);

  c.shadowBlur = 12;
  c.fillStyle = colourLit;
  fit(player, 700, 72);
  c.fillText(player, x, RTEX_H / 2 + 74);
  c.shadowBlur = 0;

  // The frame, and the corner brackets that make a plane read as a panel.
  c.strokeStyle = tint(colourLit, 0.55);
  c.lineWidth = 3;
  c.strokeRect(2.5, 2.5, RTEX_W - 5, RTEX_H - 5);

  c.strokeStyle = colourLit;
  c.lineWidth = 5;
  const b = 34;
  for (const [bx, by, dx, dy] of [
    [14, 14, 1, 1],
    [RTEX_W - 14, 14, -1, 1],
    [14, RTEX_H - 14, 1, -1],
    [RTEX_W - 14, RTEX_H - 14, -1, -1],
  ]) {
    c.beginPath();
    c.moveTo(bx + dx * b, by);
    c.lineTo(bx, by);
    c.lineTo(bx, by + dy * b);
    c.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function FateScene({ sides, players, phase, pairs }) {
  const host = useRef(null);
  // The loop reads these rather than closing over props, so a phase change
  // never rebuilds the scene. Kept up to date in an effect rather than during
  // render — React 19 rejects the latter, and a frame drawn against the
  // previous phase before the effect runs is not something an eye can catch.
  const live = useRef({ phase, pairs });
  useEffect(() => {
    live.current = { phase, pairs };
  }, [phase, pairs]);

  useEffect(() => {
    const mount = host.current;
    if (!mount) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined; // No WebGL — the DOM board underneath still works.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 1.1, 9.4);
    camera.lookAt(0, 0, 0);

    /* ---------------------------------------------------------------------
       The room the draw happens in.

       Three pieces of pure atmosphere behind the cards, all of them reading
       the same phase the cards do, so the whole screen accelerates together:

         floor    a grid running away to a horizon, scrolling towards the room.
                  It is what gives the scene a ground and a distance — without
                  it sixteen cards turn in a black void with no sense of speed.
         warp     streaks lying along the line of sight. At rest they are
                  specks; on the spin they stretch into lines, which is the
                  oldest trick there is for saying "fast" and still the best.
       There is deliberately no ring behind the middle. One was tried and
       taken out: it lives in the scene at a fixed depth while the Believe
       button is a DOM element centred by the stylesheet, so the two are in
       different coordinate systems and drift apart at every viewport size.
       The button draws its own circles, and they are always in the right
       place.

       All additive and all cheap: two line sets, no shader, no texture,
       nothing to load. The draw itself must never drop a frame for
       decoration, and this is decoration.
       --------------------------------------------------------------------- */
    const HOUSE = new THREE.Color("#c8102e");

    // ---- floor -----------------------------------------------------------
    const GRID_ROWS = 26;
    const GRID_COLS = 22;
    const GRID_STEP = 2.2;
    const gridPts = [];
    for (let i = 0; i <= GRID_COLS; i++) {
      const x = (i - GRID_COLS / 2) * GRID_STEP;
      gridPts.push(x, 0, -GRID_ROWS * GRID_STEP, x, 0, GRID_STEP * 2);
    }
    for (let j = 0; j <= GRID_ROWS; j++) {
      const z = GRID_STEP * 2 - j * GRID_STEP;
      const w = (GRID_COLS / 2) * GRID_STEP;
      gridPts.push(-w, 0, z, w, 0, z);
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(gridPts, 3)
    );
    const gridMat = new THREE.LineBasicMaterial({
      /* The lit red rather than the house red: at this opacity, over black,
         the darker one barely separated from the background and the floor
         read as a smudge instead of a grid. */
      color: new THREE.Color("#ff5a6e"),
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const floor = new THREE.LineSegments(gridGeo, gridMat);
    floor.position.y = -3.4;
    floor.renderOrder = -3;
    scene.add(floor);

    /* The far end of the grid is faded by fog rather than by a dark plane
       standing in front of it. The plane worked, but it was a rectangle: 48
       units by 9, and its edges landed on screen as a faint black box hanging
       in the middle of the scene. Fog has no edges, costs nothing, and fades
       the warp streaks into the distance for free.

       Tuned to start well behind the cards — they sit within ten units of the
       camera and the fog does not begin until twenty-six, so nothing the room
       is meant to read is ever touched by it. */
    scene.fog = new THREE.Fog(0x07090a, 26, 54);

    // ---- warp ------------------------------------------------------------
    const WARP = 220;
    const warpBase = new Float32Array(WARP * 6);
    for (let i = 0; i < WARP; i++) {
      // A hollow cylinder around the line of sight: nothing in the middle,
      // where the cards are, and nothing so far out it never crosses frame.
      const a = Math.random() * Math.PI * 2;
      const r = 5 + Math.random() * 12;
      const z = -50 + Math.random() * 58;
      warpBase[i * 6] = Math.cos(a) * r;
      warpBase[i * 6 + 1] = Math.sin(a) * r * 0.6;
      warpBase[i * 6 + 2] = z;
      warpBase[i * 6 + 3] = Math.cos(a) * r;
      warpBase[i * 6 + 4] = Math.sin(a) * r * 0.6;
      warpBase[i * 6 + 5] = z;
    }
    const warpGeo = new THREE.BufferGeometry();
    warpGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(warpBase.slice(), 3)
    );
    const warpMat = new THREE.LineBasicMaterial({
      color: "#ff5a6e",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const warp = new THREE.LineSegments(warpGeo, warpMat);
    warp.renderOrder = -3;
    scene.add(warp);

    /* Where the eight results stand, measured from the camera rather than
       fixed.

       The board is two columns of four, and it should fill the screen it is
       given — a hard-coded spacing that looks right on a wide share leaves a
       margin on a projector and runs off the edge on a narrow window. So the
       frame is measured at the plane the boxes stand on, the boxes are made as
       large as fit inside it with a real gap between them, and the plane's own
       proportions are kept so the artwork on it never stretches. */
    const RESULT_RATIO = RESULT_W / RESULT_H;
    /* Four rows have to share one frustum, so the box height and the gap
       between rows come out of the same budget. The old board spent almost a
       quarter of the height on margin and left a tenth of a unit between the
       boxes, which is why they read as one block. Nearly all of the margin is
       given back: the gap is five times what it was and the boxes are larger
       with it. */
    const GAP_X = 0.5;
    const GAP_Y = 0.5;
    const EDGE = 0.15;
    const grid = { w: RESULT_W, h: RESULT_H, stepX: 6, stepY: 1.55 };

    function measureGrid() {
      // Half the world the camera takes in, at the depth the boxes sit.
      const dist = camera.position.length();
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
      const halfW = halfH * camera.aspect;

      // As wide as two columns and a gap will allow.
      let w = (halfW * 2 - EDGE * 2 - GAP_X) / 2;
      let h = w / RESULT_RATIO;

      // ...unless four rows of that height would not fit, in which case the
      // height decides and the width follows it.
      const tall = h * 4 + GAP_Y * 3;
      const room = halfH * 2 - EDGE * 2;
      if (tall > room) {
        h = (room - GAP_Y * 3) / 4;
        w = h * RESULT_RATIO;
      }

      grid.w = w;
      grid.h = h;
      grid.stepX = w + GAP_X;
      grid.stepY = h + GAP_Y;
    }
    measureGrid();

    let scroll = 0;
    let warpPull = 0;

    /** Step the backdrop. `rush` is 0 at rest and 1 at full spin. */
    function backdrop(dt, t, rush) {
      // The floor runs towards the room, faster the harder the rings turn.
      scroll = (scroll + dt * (2.2 + rush * 26)) % GRID_STEP;
      floor.position.z = scroll;
      gridMat.opacity = 0.34 + rush * 0.26;

      /* Specks at rest, streaks at speed. Only the far end of each segment is
         moved, so a line grows backwards out of a point rather than sliding. */
      warpPull += (rush - warpPull) * Math.min(1, dt * 2.4);
      const pos = warpGeo.attributes.position.array;
      const stretch = 0.35 + warpPull * 14;
      for (let i = 0; i < WARP; i++) {
        const z = warpBase[i * 6 + 2];
        /* Travel towards the camera and wrap round behind, so it never empties.
           The modulo has to be forced positive: JavaScript keeps the sign of
           the dividend, so while (z + t·speed) is still negative this wrapped
           to as far back as z -100 — deep in the fog, invisible — and the
           field only filled in after the first few seconds. */
        const SPAN = 58;
        const travel = ((((z + t * (3 + warpPull * 60)) % SPAN) + SPAN) % SPAN) - 50;
        pos[i * 6 + 2] = travel;
        pos[i * 6 + 5] = travel - stretch;
      }
      warpGeo.attributes.position.needsUpdate = true;
      warpMat.opacity = 0.1 + warpPull * 0.55;

    }

    const cards = [];
    const textures = [];
    let stopped = false;

    /* The crests and faces, kept after the cards are built.
     *
     * The pairing is not known until the draw starts, so the result boxes
     * cannot be composed up front — and composing them at the moment they are
     * needed would mean loading sixteen images while the cards are mid-flight.
     * Holding the decoded images means the eight boxes are drawn in a few
     * milliseconds, from memory, exactly when the pairing arrives. */
    const art = { crest: new Map(), photo: new Map() };
    // The eight result boxes, once there is a draw to compose them from.
    const results = [];

    // Build every card, then start the loop — a card that appears late would
    // pop into a ring that is already turning.
    (async () => {
      const built = await Promise.all([
        ...sides.map(async (side, i) => {
          const image = await loadImage(side.logo);
          art.crest.set(side.name, image);
          return {
            kind: "team",
            index: i,
            colour: side.color ?? "#c8102e",
            texture: cardTexture({
              title: side.name,
              sub: side.captain ? `Captain ${side.captain}` : "",
              image,
              colour: side.color ?? "#c8102e",
              round: false,
            }),
          };
        }),
        ...players.map(async (player, i) => {
          const image = await loadImage(player.photo);
          art.photo.set(player.name, image);
          return {
            kind: "player",
            index: i,
            colour: "#ff5a6e",
            texture: cardTexture({
              title: player.name,
              sub: "Iconic",
              image,
              colour: "#ff5a6e",
              round: true,
            }),
          };
        }),
      ]);
      if (stopped) {
        built.forEach((b) => b.texture.dispose());
        return;
      }

      const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
      for (const spec of built) {
        const material = new THREE.MeshBasicMaterial({
          map: spec.texture,
          transparent: true,
          side: THREE.DoubleSide,
          /* A transparent plane still writes depth unless told not to, and
             these end the draw stacked on the result box at the same point —
             an invisible card was punching a hole through the box behind it,
             which is why two of the eight showed a crest and a face and no
             name at all. Order decides what is on top here, not depth. */
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 0;
        mesh.userData = spec;
        scene.add(mesh);
        cards.push(mesh);
        textures.push(spec.texture);
      }
    })();

    /* Where a card belongs, for the phase the board is in. Positions are
       targets: the loop eases towards them, so a phase change is a movement
       rather than a jump. */
    const target = new THREE.Vector3();
    function place(mesh, spin, t) {
      const { kind, index } = mesh.userData;
      const n = kind === "team" ? sides.length : players.length;
      const { phase: now, pairs: drawn } = live.current;

      if (now === "ready") {
        /* Fit the whole column into the frustum rather than starting at a
           fixed height and running off the bottom: at eight a side the old
           spacing put three cards below the screen. READY_SPAN is what the
           camera can see at the cards' depth, so the column is centred in it
           however many names there are. */
        const step = Math.min(1.55, READY_SPAN / n);
        const side = kind === "team" ? -1 : 1;
        /* Pushed further apart the more the cards shrink, so the two columns
           clear the trigger in the middle instead of running under it. */
        const spread = 4.4 + (1 - Math.min(1, step / 1.55)) * 1.6;
        target.set(
          side * spread,
          READY_MID + ((n - 1) / 2 - index) * step,
          Math.sin(t + index) * 0.15
        );
        return target;
      }

      /* Each pair's place on the board: two columns of four.
         `land` is the journey to it and `grid` is standing in it, so both ask
         for the same point. The side card, the player card and the result box
         that replaces them all aim at the SAME spot — the two fly in, the box
         comes up underneath them, and what the room sees is two cards becoming
         one rather than a screen being swapped. */
      if ((now === "land" || now === "grid") && drawn?.length) {
        const at =
          kind === "result"
            ? index
            : kind === "team"
              ? index
              : drawn.findIndex((p) => p.player.name === players[index].name);
        /* A side that drew nobody, or a player nobody drew, has no pair to
           join. Sending it to row -1 would stack it on top of the first pair,
           so it is left out at the back instead. */
        if (at < 0) {
          target.set(0, 0, -9);
          return target;
        }
        const row = at % 4;
        const col = Math.floor(at / 4);
        /* Centred on the origin, because that is where the camera is pointed.
           It sits at y 1.1 but LOOKS AT (0,0,0), so it is pitched down and the
           band it can see on this plane is centred on zero — not on the
           camera's own height. Hanging the four rows off 1.05 instead put the
           top one at +4.10 against a ceiling of +4.04 and ate the first pair.
           Centred here they run +3.05 to -3.05, a metre inside on both sides. */
        target.set((col - 0.5) * grid.stepX, (1.5 - row) * grid.stepY, 0);
        return target;
      }

      /* A result box has one place and never moves from it. It used to be
         parked behind the scene until it was wanted, which meant it had to fly
         forward as it faded up — and if its two cards landed first it became
         visible while still on the way in, small and sliding. It is invisible
         until its pair arrives, so standing it in its final spot from the
         start costs nothing and cannot be seen travelling. */
      if (kind === "result") {
        const row = index % 4;
        const col = Math.floor(index / 4);
        target.set((col - 0.5) * 6.0, (1.5 - row) * 1.55, 0);
        return target;
      }

      // spin and settle: two rings, turning against each other.
      const radius = kind === "team" ? 6.6 : 3.5;
      const dir = kind === "team" ? 1 : -1;
      const angle = (index / n) * Math.PI * 2 + spin * dir;
      /* A flattened ellipse rather than a circle, tipped into the screen: it
         reads as a carousel the room is standing in front of, not a wheel
         painted on the wall. */
      target.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.34 + (kind === "team" ? 0 : 0.15),
        Math.sin(angle) * 3.4
      );
      return target;
    }

    const clock = new THREE.Clock();
    let spin = 0;
    let speed = 0;
    let raf = 0;

    function resize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // The result board is sized off the frame, so it is re-measured whenever
      // the frame changes — otherwise it keeps the proportions of whatever the
      // window happened to be when the scene was built.
      measureGrid();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    /* Build the eight result boxes, the moment the draw is known.
       Synchronous: every crest and face was decoded when the cards were built,
       so this is eight canvases and nothing to wait for. */
    function makeResults(drawn) {
      const geometry = new THREE.PlaneGeometry(RESULT_W, RESULT_H);
      drawn.forEach(({ side, player }, i) => {
        const texture = resultTexture({
          side: side.name,
          player: player.name,
          crest: art.crest.get(side.name) ?? null,
          photo: art.photo.get(player.name) ?? null,
          colour: side.color ?? "#c8102e",
          colourLit: side.colorLit ?? side.color ?? "#ff5a6e",
        });
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          opacity: 0,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        // Always over the two cards it is taking the place of.
        mesh.renderOrder = 1;
        /* Held on to, so the box can watch the two cards it replaces and wait
           for the slower of them rather than for the board as a whole. */
        const playerAt = players.findIndex((p) => p.name === player.name);
        mesh.userData = {
          kind: "result",
          index: i,
          team: cards.find(
            (m) => m.userData.kind === "team" && m.userData.index === i
          ),
          player: cards.find(
            (m) => m.userData.kind === "player" && m.userData.index === playerAt
          ),
        };
        // Straight to its place rather than easing in from the parking spot
        // behind the camera, which would read as a card flying in backwards.
        mesh.position.copy(place(mesh, 0, 0));
        mesh.scale.setScalar(0.92);
        scene.add(mesh);
        results.push(mesh);
        textures.push(texture);
      });
    }

    function clearResults() {
      for (const mesh of results) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.map?.dispose();
        mesh.material.dispose();
      }
      results.length = 0;
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const { phase: now, pairs: drawn } = live.current;

      // The draw arrives long before the cards need it, and a redraw takes the
      // old boxes away again.
      if (drawn?.length && results.length === 0 && cards.length) makeResults(drawn);
      if (!drawn?.length && results.length) clearResults();

      // Wind up hard, hold, then brake — the ring has weight.
      const wanted = now === "spin" ? 5.4 : 0;
      const rate = now === "spin" ? 2.2 : 1.5;
      speed += (wanted - speed) * Math.min(1, dt * rate);
      spin += speed * dt;

      /* How far through the landing the pairs are, measured rather than timed:
         the handover happens when the cards have actually arrived, so it can
         never run ahead of the movement on a slow frame. */
      /* Whether the cards are home, asked of each card separately.
       *
       * This used to be one number for the whole board, averaged over the side
       * cards alone — so the boxes faded up on the side cards' progress while
       * the player cards were still crossing the screen, and for a moment the
       * room saw eight results AND eight players in two different places. Each
       * card now gives up its own opacity as IT arrives, and a box waits for
       * BOTH of its cards before showing at all. */
      const landing = now === "land" || now === "grid";

      for (const mesh of cards) {
        const to = place(mesh, spin, t);
        // Slower easing on the way out of the rings, so the pairing lands
        // rather than snapping.
        const ease =
          now === "settle" || now === "land" || now === "grid" ? 2.4 : 6;
        // Measured before the step, against where it is going.
        mesh.userData.near = landing
          ? THREE.MathUtils.clamp(1 - mesh.position.distanceTo(to) / 1.6, 0, 1)
          : 0;
        mesh.position.lerp(to, Math.min(1, dt * ease));
        // Always square to the room: a spinning ring must not turn its
        // lettering away.
        mesh.quaternion.copy(camera.quaternion);
        /* Depth: cards on the far side of the ring dim and shrink, the ones
           swinging past the front are full strength. Perspective alone does
           not do this to an unlit material. */
        const depth = THREE.MathUtils.clamp((mesh.position.z + 3.4) / 6.8, 0, 1);
        /* Handed over to the result box as it lands: the two cards give up
           their opacity at exactly the rate the box takes it, in the same
           place, so the swap is a merge and never a cut. */
        mesh.material.opacity = (0.34 + depth * 0.66) * (1 - mesh.userData.near);
        // Gone, not merely invisible: nothing to sort, nothing to fight with.
        mesh.visible = mesh.material.opacity > 0.01;
        /* In the ready columns the card shrinks to whatever the column can
           hold, so eight a side never overlap; on the rings it goes back to
           full size. Folded in here because this is the only line that owns
           scale — setting it anywhere else is silently overwritten. */
        const count =
          mesh.userData.kind === "team" ? sides.length : players.length;
        const fit =
          now === "ready"
            ? Math.min(1, Math.min(1.55, READY_SPAN / count) / (CARD_H * 1.06))
            : 1;
        const base = (now === "spin" ? 0.94 : 1) + depth * 0.14;
        const scale = base * fit;
        mesh.scale.setScalar(
          mesh.scale.x + (scale - mesh.scale.x) * Math.min(1, dt * 6)
        );
      }

      // The result boxes: up as their own two cards come down, in their place.
      for (const mesh of results) {
        mesh.position.lerp(place(mesh, spin, t), Math.min(1, dt * 3));
        mesh.quaternion.copy(camera.quaternion);
        /* The slower of the two. A box that appeared on the side card alone
           would be standing there while its player was still in the air. */
        const { team, player } = mesh.userData;
        const shown = Math.min(team?.userData.near ?? 0, player?.userData.near ?? 0);
        mesh.material.opacity = shown;
        mesh.visible = shown > 0.01;
        // Scaled to whatever the frame turned out to hold, not to a constant.
        const scale = (grid.w / RESULT_W) * (0.92 + shown * 0.08);
        mesh.scale.setScalar(
          mesh.scale.x + (scale - mesh.scale.x) * Math.min(1, dt * 6)
        );
      }

      // The backdrop rides the ring speed, so the room accelerates with the
      // draw rather than on a clock of its own.
      backdrop(dt, t, THREE.MathUtils.clamp(speed / 5.4, 0, 1));

      renderer.render(scene, camera);
    }

    /* A hook for stepping the loop by hand.
       The preview pane can be collapsed, and a collapsed pane suspends
       requestAnimationFrame — so without this there is no way to watch the
       landing from outside the browser. Dev only, and it only ever calls the
       same frame the loop calls. */
    if (process.env.NODE_ENV !== "production") {
      window.__fate = { frame, cards, results, scene, camera, renderer };
    }

    if (!reduced) frame();
    else renderer.render(scene, camera);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) {
        clock.getDelta();
        frame();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      clearResults();
      cards.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      gridGeo.dispose();
      gridMat.dispose();
      warpGeo.dispose();
      warpMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [sides, players]);

  return <div className="fate-canvas" ref={host} aria-hidden="true" />;
}
