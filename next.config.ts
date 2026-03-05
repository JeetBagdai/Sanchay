import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this directory so Next.js doesn't walk up
  // into parent directories and misidentify the workspace root,
  // which causes module resolution failures (e.g. "Can't resolve tailwindcss").
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
