import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The parent image-splitter/ (webpack app) has its own package-lock.json;
  // pin the workspace root to this app so Turbopack doesn't have to guess.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
