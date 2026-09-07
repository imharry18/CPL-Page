"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The board's third dimension.
 *
 * Two things share one WebGL context, because opening a second one — or worse,
 * building and tearing down a renderer on every sale, sixty times an evening —
 * is the most expensive thing this board could do.
 *
 *   The field   A slow drift of points at depth, tinted by whichever side
 *               currently holds the bid. It is always there. It is what makes
 *               the board sit in a room rather than on a page, and it moves
 *               slowly enough that a camera on a call never has to chase it.
 *
 *   The burst   Fired when a lot closes. A sale throws light outward in the
 *               buying side's colour and pulls it up, with a shockwave riding
 *               through. An unsold lot gets the same machinery with the life
 *               taken out — grey, slower, falling. Nobody cheers, and the
 *               board should not pretend otherwise.
 *
 * Everything is stepped by hand off one timer. There is no shader to compile
 * mid-auction and no per-frame allocation: a dropped frame here is a dropped
 * frame in the hall.
 */

const BURST = 520;
const FIELD = 340;
const LIFE = 2.6;

export default function StageFX({ kind, color = "#c8102e" }) {
  const host = useRef(null);

  /* The scene is built once and lives for the night. A sale is a message left
     here for the loop to pick up, not a reason to rebuild anything. */
  const shot = useRef({ id: 0, kind: null, colour: color });
  const tint = useRef(color);
  /* Whether an announcement is on screen right now — null the moment Next is
     pressed. The burst fires once per sale, but the waves keep going for as
     long as the stamp is up, so they need to know when it comes down. */
  const showing = useRef(null);

  useEffect(() => {
    tint.current = color;
    showing.current = kind ?? null;
    if (kind) {
      shot.current = { id: shot.current.id + 1, kind, colour: color };
    }
  }, [kind, color]);

  useEffect(() => {
    const mount = host.current;
    if (!mount) return undefined;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL. The board is a board without it; nothing here is load-bearing.
      return undefined;
    }

    const size = () => [mount.clientWidth || 1280, mount.clientHeight || 720];
    let [width, height] = size();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
    camera.position.z = 14;

    /* ---- the field ------------------------------------------------------ */
    const fieldPos = new Float32Array(FIELD * 3);
    for (let i = 0; i < FIELD; i++) {
      // A slab of depth rather than a sphere: it should read as space behind
      // the board, not as a ball floating in front of it.
      fieldPos[i * 3] = (Math.random() - 0.5) * 46;
      fieldPos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      fieldPos[i * 3 + 2] = -Math.random() * 42 - 4;
    }
    const fieldGeo = new THREE.BufferGeometry();
    fieldGeo.setAttribute("position", new THREE.BufferAttribute(fieldPos, 3));
    const fieldMat = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.16,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const field = new THREE.Points(fieldGeo, fieldMat);
    scene.add(field);

    /* ---- the burst ------------------------------------------------------ */
    const burstPos = new Float32Array(BURST * 3);
    const burstVel = new Float32Array(BURST * 3);
    const burstGeo = new THREE.BufferGeometry();
    burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPos, 3));
    const burstMat = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      // Additive is what makes a crowd of small points read as light rather
      // than as dots on a dark screen.
      blending: THREE.AdditiveBlending,
    });
    const burst = new THREE.Points(burstGeo, burstMat);
    scene.add(burst);

    /* Three shockwaves rather than one, leaving a beat apart and travelling at
       different speeds. One ring reads as a diagram; three read as an impact,
       and the gaps between them are what carry the sense of force. */
    const RINGS = [
      { delay: 0, speed: 13, weight: 0.5 },
      { delay: 0.42, speed: 9, weight: 0.34 },
      { delay: 0.84, speed: 5.5, weight: 0.22 },
    ];
    // How often each wave leaves again. The stamp can be up for a while — the
    // room is cheering, and the auctioneer takes it down when it is ready —
    // so the waves keep coming rather than the screen going still under it.
    const CYCLE = 1.9;
    const ringGeo = new THREE.RingGeometry(1, 1.12, 96);
    const rings = RINGS.map((spec) => {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      scene.add(mesh);
      return { ...spec, mesh, mat };
    });

    /** Throw every point back to the middle and give it a new direction. */
    function arm(sold) {
      for (let i = 0; i < BURST; i++) {
        const theta = Math.random() * Math.PI * 2;
        // An even scatter over a sphere, so the burst has no seams in it.
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = (sold ? 3.4 : 1.4) * (0.35 + Math.random() * 0.9);

        burstVel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
        burstVel[i * 3 + 1] = Math.cos(phi) * speed;
        burstVel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.6;

        burstPos[i * 3] = 0;
        burstPos[i * 3 + 1] = 0;
        burstPos[i * 3 + 2] = 0;
      }
      burstGeo.attributes.position.needsUpdate = true;
    }

    let firing = null;
    let seen = 0;
    let waves = 0;

    /* ---- the loop ------------------------------------------------------- */
    let last = performance.now();
    let elapsed = 0;
    let frame;

    const draw = () => {
      const now = performance.now();
      /* Capped: a machine that was asleep, or a tab that was in the background,
         must not teleport the field or skip a burst forward to its end. */
      const step = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += step;

      // A new sale has been left for us.
      if (shot.current.id !== seen) {
        seen = shot.current.id;
        const sold = shot.current.kind === "sold";
        firing = { sold, t: 0 };
        waves = 0;
        arm(sold);
        const c = new THREE.Color(sold ? shot.current.colour : "#8a8f95");
        burstMat.color.copy(c);
        for (const r of rings) r.mat.color.copy(c);
      }

      // The field takes the leading side's colour, and eases into it rather
      // than cutting, so a raise changes the room instead of flicking it.
      fieldMat.color.lerp(new THREE.Color(tint.current), Math.min(step * 3, 1));
      field.rotation.y = elapsed * 0.012;
      field.position.y = Math.sin(elapsed * 0.14) * 0.6;

      if (firing) {
        firing.t += step;
        const life = Math.min(firing.t / LIFE, 1);
        // Hard in, long out.
        const fade =
          life < 0.08 ? life / 0.08 : Math.pow(1 - (life - 0.08) / 0.92, 1.6);

        for (let i = 0; i < BURST; i++) {
          burstPos[i * 3] += burstVel[i * 3] * step;
          burstPos[i * 3 + 1] += burstVel[i * 3 + 1] * step;
          burstPos[i * 3 + 2] += burstVel[i * 3 + 2] * step;

          // A sale rises and slows; a lot nobody wanted sinks.
          burstVel[i * 3 + 1] += (firing.sold ? 0.9 : -1.5) * step;
          burstVel[i * 3] *= 1 - 0.9 * step;
          burstVel[i * 3 + 2] *= 1 - 0.9 * step;
        }
        burstGeo.attributes.position.needsUpdate = true;

        burstMat.opacity = fade * (firing.sold ? 1 : 0.5);

        if (life >= 1) {
          // The light settles, but the waves carry on below for as long as the
          // announcement is up.
          firing = null;
          burstMat.opacity = 0;
        }
      }

      /* The waves, on their own repeating clock. They belong to the
         announcement rather than to the burst: one set of rings and then a
         still screen reads as something that finished, and the room is still
         cheering. Three leave in sequence and the sequence goes round. */
      const on = showing.current;
      if (on) {
        waves += step;
        const sold = on === "sold";
        for (const r of rings) {
          const own = waves - r.delay;
          if (own <= 0) {
            r.mat.opacity = 0;
            continue;
          }
          const reach = (own % CYCLE) / CYCLE;
          const spread = 1 + reach * r.speed * (sold ? 1 : 0.55);
          r.mesh.scale.set(spread, spread, 1);
          // Fades as it travels, so each wave dies before the next arrives.
          r.mat.opacity = Math.max(0, 1 - reach) * r.weight * (sold ? 1 : 0.4);
        }
      } else if (waves !== 0) {
        waves = 0;
        for (const r of rings) r.mat.opacity = 0;
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };

    if (still) {
      // One frame, so the depth is there, and then nothing moves again.
      renderer.render(scene, camera);
    } else {
      frame = requestAnimationFrame(draw);
    }

    const onResize = () => {
      [width, height] = size();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      fieldGeo.dispose();
      fieldMat.dispose();
      burstGeo.dispose();
      burstMat.dispose();
      ringGeo.dispose();
      for (const r of rings) r.mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // Built once for the night. Colour and sales arrive through the refs above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="stage-fx" ref={host} aria-hidden="true" />;
}
