import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* existing config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.dribbble.com',
      },
    ],
  },
};

export default nextConfig;
