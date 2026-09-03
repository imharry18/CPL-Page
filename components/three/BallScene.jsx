"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The signature element: a cricket ball, built to match a real one.
 *
 * What makes it read as real rather than as "a red sphere":
 *  - Pebbled leather grain, as a proper normal map derived from a height field.
 *  - One hemisphere polished and one scuffed. Fielders shine one side of the
 *    ball all match to make it swing; that asymmetry is the single most
 *    recognisable thing about a used cricket ball, and no shader preset has it.
 *  - Six rows of stitching straddling a raised seam ridge, which is what a real
 *    seam is — not a painted line.
 *  - A gold maker's stamp on each face.
 *  - It spins about the axis through the seam, so the seam holds its angle the
 *    way a seam-up delivery does.
 *
 * Performance rules it follows:
 *  - One canvas, one renderer, one loop for the whole site.
 *  - Scroll is read inside the loop, never in a scroll handler.
 *  - Every texture is generated in the browser, so none of this costs a
 *    download.
 *  - The loop stops when the tab is hidden, and never starts under
 *    prefers-reduced-motion.
 */

/* The ball owns the opening and the closing shot. Through the middle of the
   page — where the tables, cards and rosters live — it stays small and near the
   edges, so it never sits behind a card and muddies the text. */
const KEYFRAMES = [
  { at: 0.0, x: 2.05, y: 0.15, z: 0.0, scale: 1.15 },
  { at: 0.14, x: 2.6, y: -0.7, z: -2.4, scale: 0.4 },
  { at: 0.34, x: -2.9, y: 0.5, z: -3.0, scale: 0.34 },
  { at: 0.55, x: 2.9, y: 0.7, z: -3.2, scale: 0.3 },
  { at: 0.78, x: -2.8, y: -0.4, z: -3.0, scale: 0.32 },
  { at: 1.0, x: 0.0, y: 0.1, z: 0.9, scale: 1.5 },
];

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function sampleKeyframes(p, out) {
  let i = 0;
  while (i < KEYFRAMES.length - 2 && p > KEYFRAMES[i + 1].at) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const span = b.at - a.at;
  const t = smoothstep(span <= 0 ? 0 : THREE.MathUtils.clamp((p - a.at) / span, 0, 1));
  out.x = a.x + (b.x - a.x) * t;
  out.y = a.y + (b.y - a.y) * t;
  out.z = a.z + (b.z - a.z) * t;
  out.scale = a.scale + (b.scale - a.scale) * t;
  return out;
}

function canvas2d(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext("2d")];
}

/**
 * Leather colour, with the gold stamping real balls carry on each face.
 *
 * UVs: v = 0.5 is the seam, so v = 0.28 and v = 0.72 land in the middle of the
 * two faces. Near the poles a sphere squeezes the texture horizontally, so the
 * stamp is drawn stretched to compensate and comes out square on the ball.
 */
function makeLeatherColor() {
  const W = 1024;
  const H = 512;
  const [canvas, ctx] = canvas2d(W, H);

  ctx.fillStyle = "#7e1c17";
  ctx.fillRect(0, 0, W, H);

  // Mottling — leather is never one flat colour.
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 6 + Math.random() * 34;
    const light = Math.random() > 0.5;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, light ? "rgba(190,60,45,0.10)" : "rgba(40,6,4,0.12)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function stamp(v) {
    const y = v * H;
    // sin(theta) is how much the sphere pinches the texture at this latitude.
    const pinch = Math.max(0.35, Math.sin(v * Math.PI));
    ctx.save();
    ctx.translate(W * 0.5, y);
    ctx.scale(1 / pinch, 1);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(206,168,90,0.92)";
    ctx.font = "700 46px Archivo, Helvetica, Arial, sans-serif";
    ctx.fillText("CPL", 0, -18);
    ctx.font = "500 19px Archivo, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(206,168,90,0.7)";
    ctx.fillText("SEASON 04", 0, 20);
    ctx.strokeStyle = "rgba(206,168,90,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 96, 52, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  stamp(0.28);
  stamp(0.72);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Pebble grain as a real normal map: build a height field of overlapping
 * bumps, then read its slope in x and y to get the surface direction.
 * A bumpMap fakes this from greyscale and always looks slightly mushy.
 */
function makeLeatherNormal(size) {
  const [heightCanvas, hctx] = canvas2d(size, size);
  hctx.fillStyle = "#808080";
  hctx.fillRect(0, 0, size, size);
  const pebbles = size * 6;
  for (let i = 0; i < pebbles; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 6;
    const gradient = hctx.createRadialGradient(x, y, 0, x, y, r);
    const peak = Math.random() > 0.5 ? 255 : 0;
    gradient.addColorStop(0, `rgba(${peak},${peak},${peak},0.5)`);
    gradient.addColorStop(1, "rgba(128,128,128,0)");
    hctx.fillStyle = gradient;
    hctx.beginPath();
    hctx.arc(x, y, r, 0, Math.PI * 2);
    hctx.fill();
  }

  const height = hctx.getImageData(0, 0, size, size).data;
  const [normalCanvas, nctx] = canvas2d(size, size);
  const normal = nctx.createImageData(size, size);
  const at = (x, y) => height[((y & (size - 1)) * size + (x & (size - 1))) * 4];
  const strength = 2.4;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) / 255;
      const dy = (at(x, y + 1) - at(x, y - 1)) / 255;
      // Normalise (-dx*s, -dy*s, 1) and pack into 0..255.
      const nx = -dx * strength;
      const ny = -dy * strength;
      const len = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      normal.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      normal.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      normal.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      normal.data[i + 3] = 255;
    }
  }
  nctx.putImageData(normal, 0, 0);

  const texture = new THREE.CanvasTexture(normalCanvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 3);
  return texture;
}

/**
 * The shine. One side of the ball (v < 0.5) is polished smooth, the other is
 * scuffed from hitting the ground. Black = glossy, white = matte.
 */
function makeRoughness() {
  const W = 256;
  const H = 256;
  const [canvas, ctx] = canvas2d(W, H);
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0.0, "#2b2b2b"); // polished face
  gradient.addColorStop(0.4, "#3a3a3a");
  gradient.addColorStop(0.52, "#9c9c9c"); // the seam itself is never polished
  gradient.addColorStop(0.62, "#aaaaaa");
  gradient.addColorStop(1.0, "#b4b4b4"); // scuffed face
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Scuff marks, only on the rough half.
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 500; i++) {
    const y = H * (0.54 + Math.random() * 0.46);
    ctx.fillStyle = Math.random() > 0.5 ? "#d8d8d8" : "#6a6a6a";
    ctx.fillRect(Math.random() * W, y, 1 + Math.random() * 7, 1 + Math.random() * 2);
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function buildBall(quality) {
  const spin = new THREE.Group();
  const segments = quality === "low" ? 64 : 128;

  const colorMap = makeLeatherColor();
  const normalMap = makeLeatherNormal(quality === "low" ? 256 : 512);
  const roughnessMap = makeRoughness();

  const leather = new THREE.MeshPhysicalMaterial({
    map: colorMap,
    normalMap,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap,
    roughness: 1, // multiplies the map
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughnessMap: roughnessMap,
    clearcoatRoughness: 1,
    sheen: 0.5,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color("#ff9a72"),
    specularIntensity: 0.9,
  });

  // Poles moved onto Z, so the UV equator (v = 0.5) lands exactly on the seam
  // and the two faces get their own hemisphere of texture.
  const geometry = new THREE.SphereGeometry(1, segments, segments);
  geometry.rotateX(Math.PI / 2);
  spin.add(new THREE.Mesh(geometry, leather));

  // The raised ridge the stitches are sewn over.
  const ridge = new THREE.Mesh(
    new THREE.TorusGeometry(0.998, 0.016, 12, quality === "low" ? 120 : 220),
    new THREE.MeshPhysicalMaterial({
      color: "#6d1611",
      roughness: 0.62,
      clearcoat: 0.4,
      normalMap,
      normalScale: new THREE.Vector2(0.3, 0.3),
    })
  );
  spin.add(ridge);

  // Six rows of stitching, three either side of the ridge. Each row sits at a
  // different depth, so its radius has to follow the curve of the sphere —
  // otherwise the outer rows float off the surface.
  const perRow = quality === "low" ? 56 : 84;
  const rows = [-0.118, -0.076, -0.034, 0.034, 0.076, 0.118];
  const stitchMat = new THREE.MeshPhysicalMaterial({
    color: "#e9dcc0",
    roughness: 0.62,
    sheen: 0.6,
    sheenColor: new THREE.Color("#fff4dc"),
  });
  const stitches = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.017, 0.062, 0.014),
    stitchMat,
    rows.length * perRow
  );
  const dummy = new THREE.Object3D();
  let index = 0;
  for (const z of rows) {
    const radius = Math.sqrt(Math.max(0, 1 - z * z)) + 0.006;
    // Rows nearer the ridge lean the other way, so the stitching reads as a
    // chevron running along the seam rather than as parallel dashes.
    const lean = z < 0 ? 0.62 : -0.62;
    for (let i = 0; i < perRow; i++) {
      const angle = (i / perRow) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
      dummy.rotation.set(0, 0, angle + lean);
      dummy.updateMatrix();
      stitches.setMatrixAt(index++, dummy.matrix);
    }
  }
  stitches.instanceMatrix.needsUpdate = true;
  spin.add(stitches);

  // Outer group holds the tilt; the inner group spins. Keeping them separate
  // means the seam keeps a fixed angle while the ball rotates through it.
  const tilt = new THREE.Group();
  tilt.rotation.set(0.34, -0.42, 0);
  tilt.add(spin);
  return { tilt, spin };
}

function buildMotes(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: new THREE.Color("#ff5a6e"),
      size: 0.026,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
}

export default function BallScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const quality = coarse || window.innerWidth < 760 ? "low" : "high";

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: quality === "high",
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // No WebGL. The page is complete without it.
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "high" ? 2 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      32,
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 6);

    // Clearcoat needs something to reflect or it reads as flat plastic.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.55;

    const { tilt: ball, spin } = buildBall(quality);
    scene.add(ball);

    const motes = buildMotes(quality === "high" ? 480 : 200);
    scene.add(motes);

    scene.add(new THREE.AmbientLight(0x2c231b, 1.1));

    // Floodlight: hard warm key from high and to the side.
    const key = new THREE.DirectionalLight(0xfff4ec, 4.0);
    key.position.set(4.5, 5.5, 3.5);
    scene.add(key);

    // Bounce off the turf, crimson, from below and behind.
    const rim = new THREE.DirectionalLight(0xff2b45, 2.4);
    rim.position.set(-4.5, -2, -3.5);
    scene.add(rim);

    // Cool sky fill, so the shadow side is not dead black.
    const fill = new THREE.DirectionalLight(0xa8ccff, 0.9);
    fill.position.set(-3.5, 3.5, 4.5);
    scene.add(fill);

    // A tight highlight that sells the polish on the shiny face.
    const glint = new THREE.PointLight(0xffffff, 14, 12, 2);
    glint.position.set(1.8, 2.4, 3.2);
    scene.add(glint);

    const target = { x: 0, y: 0, z: 0, scale: 1 };
    const current = { x: KEYFRAMES[0].x, y: KEYFRAMES[0].y, z: 0, scale: KEYFRAMES[0].scale };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let lastScrollY = window.scrollY;
    let spinVelocity = 0;
    let entryProgress = reduceMotion ? 1 : 0;
    let clock = 0;

    function onPointerMove(event) {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
    }
    if (!coarse) window.addEventListener("pointermove", onPointerMove, { passive: true });

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener("resize", resize, { passive: true });

    function frame() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? THREE.MathUtils.clamp(window.scrollY / scrollable, 0, 1) : 0;

      // Scroll speed becomes spin, so it behaves like an object you threw.
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      spinVelocity += delta * 0.00024;
      spinVelocity *= 0.94;
      clock += 0.016;

      sampleKeyframes(progress, target);
      const spread = THREE.MathUtils.clamp(camera.aspect / 1.6, 0.55, 1);

      entryProgress = Math.min(1, entryProgress + 0.02);
      const entry = smoothstep(entryProgress);

      current.x += (target.x * spread - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      current.z += (target.z - current.z) * 0.06;
      current.scale += (target.scale * entry - current.scale) * 0.07;

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      ball.position.set(current.x, current.y + (1 - entry) * 1.5, current.z);
      ball.scale.setScalar(Math.max(0.001, current.scale));

      // Tilt drifts with the pointer and breathes very slightly, so the ball
      // never looks locked to an axis.
      ball.rotation.x = 0.34 + pointer.y * 0.18 + Math.sin(clock * 0.4) * 0.04;
      ball.rotation.y = -0.42 + pointer.x * 0.22;
      ball.rotation.z = Math.cos(clock * 0.31) * 0.05;

      // The spin runs about Z — the axis through the seam.
      spin.rotation.z += 0.0026 + spinVelocity;

      motes.rotation.y += 0.0004;
      motes.position.y = -progress * 1.6;

      renderer.render(scene, camera);
    }

    if (reduceMotion) {
      sampleKeyframes(0, target);
      Object.assign(current, target);
      ball.position.set(current.x, current.y, current.z);
      ball.scale.setScalar(current.scale);
      renderer.render(scene, camera);
    } else {
      renderer.setAnimationLoop(frame);
    }

    function onVisibility() {
      if (reduceMotion) return;
      renderer.setAnimationLoop(document.hidden ? null : frame);
      lastScrollY = window.scrollY;
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : object.material
            ? [object.material]
            : [];
        materials.forEach((material) => {
          ["map", "normalMap", "roughnessMap", "clearcoatRoughnessMap"].forEach((slot) => {
            if (material[slot]) material[slot].dispose();
          });
          material.dispose();
        });
      });
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" />;
}
