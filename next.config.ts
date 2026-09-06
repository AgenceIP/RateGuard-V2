import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node_modules lives in the parent "hackathon" folder (its package-lock.json
  // is the real install root), so Turbopack's workspace root must point there
  // too, or it can't resolve next/package.json from inside this folder.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
