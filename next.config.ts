import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse","pdf-lib","openai"],
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  }
};

export default nextConfig;
