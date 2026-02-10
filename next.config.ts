import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Only if you have strict typing issues in CI
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
