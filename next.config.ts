import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.remotive.com" },
      { protocol: "https", hostname: "**.jobicy.com" },
      { protocol: "https", hostname: "**.adzuna.com" },
    ],
  },
};

export default nextConfig;
