"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The moment behind the stamp.
 *
 * A sale is the only thing that happens all night that the room reacts to out
 * loud, so it gets the one piece of spectacle on the board: a burst of light in
 * the buying side's own colour, thrown outward and pulled up, with a ring
 * riding out through it.
 *
 * An unsold lot gets the same machinery with the life taken out — grey, slower,
 * falling rather than rising. Nobody cheers, and the board should not pretend
 * otherwise.
 *
 * Deliberately built out of one THREE.Points and one ring rather than a shader:
 * this runs on the machine driving a live auction and sharing its screen, and a
 * dropped frame here is a dropped frame in the hall.
 *
 * Mounted only while an announcement is up, and everything it allocates is
 * disposed on the way out — over a long night this runs a hundred times.
 */

const COUNT = 520;
const LIFE = 2.6;

export default function StageFX({ kind, color = "#c8102e" }) {
  const host = useRef(null);

  useEffect(() => {
    const mount = host.current;
    if (!mount || !kind) return undefined;

    // A board that respects this setting shows the stamp and nothing moving.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL: the stamp over the board still says everything it needs to.
      return undefined;
    }

    const width = mount.clientWidth || 1280;
    const height = mount.clientHeight || 720;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 14;

    const sold = kind === "sold";
    const tint = new THREE.Color(sold ? color : "#8a8f95");

    /* The burst. Every point gets a direction on a sphere and a speed, and the
       whole cloud is stepped by hand each frame — 520 points is far cheaper to
       move on the CPU than a shader is to compile mid-auction. */
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      // An even scatter over a sphere, so the burst has no seams in it.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = (sold ? 3.4 : 1.4) * (0.35 + Math.random() * 0.9);

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.6;

      // Everything starts at the middle: the stamp lands and this leaves it.
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: tint,
      size: sold ? 0.3 : 0.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      // Additive is what makes a crowd of small points read as light rather
      // than as dots on a dark screen.
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    /* The shockwave — one ring riding out ahead of the burst. It is what makes
       the moment land on a beat rather than simply appearing. */
    const ringGeometry = new THREE.RingGeometry(1, 1.12, 96);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: tint,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);

    /* A plain timer rather than THREE.Clock: three.js deprecates Clock in this
       version and prints a warning on every construction, and this mounts once
       a lot — a hundred lines of console noise across a night. Two numbers do
       the same job, and the order they are read in is the whole fix: asking
       Clock for elapsed time consumed the delta, so the burst never moved. */
    let last = performance.now();
    let elapsed = 0;
    let frame;

    const draw = () => {
      const now = performance.now();
      // Capped, so a tab that was backgrounded does not teleport the burst.
      const step = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += step;
      const t = elapsed;

      // Everything is on one curve: hard in, long out.
      const life = Math.min(t / LIFE, 1);
      const fade = life < 0.08 ? life / 0.08 : Math.pow(1 - (life - 0.08) / 0.92, 1.6);

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3] += velocities[i * 3] * step;
        pos[i * 3 + 1] += velocities[i * 3 + 1] * step;
        pos[i * 3 + 2] += velocities[i * 3 + 2] * step;

        // A sale rises and slows; a lot nobody wanted sinks.
        velocities[i * 3 + 1] += (sold ? 0.9 : -1.5) * step;
        velocities[i * 3] *= 1 - 0.9 * step;
        velocities[i * 3 + 2] *= 1 - 0.9 * step;
      }
      geometry.attributes.position.needsUpdate = true;

      material.opacity = fade * (sold ? 0.95 : 0.5);

      const spread = 1 + life * (sold ? 13 : 7);
      ring.scale.set(spread, spread, 1);
      ringMaterial.opacity = Math.max(0, (1 - life) * (sold ? 0.5 : 0.2));

      // The whole cloud turns, slowly, so it never looks like a still frame.
      points.rotation.y = t * 0.12;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    const onResize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [kind, color]);

  if (!kind) return null;
  return <div className="stage-fx" ref={host} aria-hidden="true" />;
}
