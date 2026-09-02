import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* There is a stray package-lock.json in the home directory above this
     project. Without this, Turbopack walks up, finds it, and guesses the wrong
     project root. Pinning it removes the guess. */
  turbopack: { root: projectRoot },
};

export default nextConfig;
