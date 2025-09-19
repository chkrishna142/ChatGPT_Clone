import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Force CSS to reload during development
    optimizeCss: false,
  },
};

export default nextConfig;
