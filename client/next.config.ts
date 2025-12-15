import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path",
        destination: "http://localhost:5500/api/auth/:path",
      },
    ];
  },
};

export default nextConfig;
