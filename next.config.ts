import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    return [{ source: "/mcp", destination: "/api/mcp" }];
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

export default nextConfig;
