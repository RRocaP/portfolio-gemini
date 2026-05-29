import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Served on Vercel (custom domain). trailingSlash kept to preserve existing
  // /en/ URLs; output:"export"/basePath/unoptimized-images were GitHub-Pages-only.
  trailingSlash: true,
  turbopack: {
    root: configDir,
  },
};

export default nextConfig;
