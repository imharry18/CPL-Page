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

/* The world-space height the camera takes in at the cards' depth, and the
   middle of it. Derived from the camera below (fov 46 at z 9.4, looking from
   y 1.1); kept a little inside the true frustum so the top and bottom cards
   are not flush against the edge of the screen. */
const READY_SPAN = 7.5;
const READY_MID = 1.05;
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
    // Cover, not stretch — every crest and photograph is a different shape.
    const scale = Math.max(art / image.width, art / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    c.drawImage(image, pad + (art - w) / 2, pad + (art - h) / 2, w, h);
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

    const cards = [];
    const textures = [];
    let stopped = false;

    // Build every card, then start the loop — a card that appears late would
    // pop into a ring that is already turning.
    (async () => {
      const built = await Promise.all([
        ...sides.map(async (side, i) => ({
          kind: "team",
          index: i,
          colour: side.color ?? "#c8102e",
          texture: cardTexture({
            title: side.name,
            sub: side.captain ? `Captain ${side.captain}` : "",
            image: await loadImage(side.logo),
            colour: side.color ?? "#c8102e",
            round: false,
          }),
        })),
        ...players.map(async (player, i) => ({
          kind: "player",
          index: i,
          colour: "#ff5a6e",
          texture: cardTexture({
            title: player.name,
            sub: "Iconic",
            image: await loadImage(player.photo),
            colour: "#ff5a6e",
            round: true,
          }),
        })),
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
        });
        const mesh = new THREE.Mesh(geometry, material);
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

      if (now === "grid" && drawn?.length) {
        // Each side and the player it drew, held together in a column pair.
        const at =
          kind === "team"
            ? index
            : drawn.findIndex((p) => p.player.name === players[index].name);
        const row = at % 4;
        const col = Math.floor(at / 4);
        target.set(
          (col - 0.5) * 6.6 + (kind === "team" ? -1.6 : 1.6),
          2.4 - row * 1.6,
          0
        );
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
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    function frame() {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const { phase: now } = live.current;

      // Wind up hard, hold, then brake — the ring has weight.
      const wanted = now === "spin" ? 5.4 : 0;
      const rate = now === "spin" ? 2.2 : 1.5;
      speed += (wanted - speed) * Math.min(1, dt * rate);
      spin += speed * dt;

      for (const mesh of cards) {
        const to = place(mesh, spin, t);
        // Slower easing on the way out of the rings, so the pairing lands
        // rather than snapping.
        const ease = now === "settle" || now === "grid" ? 2.4 : 6;
        mesh.position.lerp(to, Math.min(1, dt * ease));
        // Always square to the room: a spinning ring must not turn its
        // lettering away.
        mesh.quaternion.copy(camera.quaternion);
        /* Depth: cards on the far side of the ring dim and shrink, the ones
           swinging past the front are full strength. Perspective alone does
           not do this to an unlit material. */
        const depth = THREE.MathUtils.clamp((mesh.position.z + 3.4) / 6.8, 0, 1);
        mesh.material.opacity = 0.34 + depth * 0.66;
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

      renderer.render(scene, camera);
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
      cards.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [sides, players]);

  return <div className="fate-canvas" ref={host} aria-hidden="true" />;
}
