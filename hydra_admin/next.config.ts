import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure async rewrites to proxy API requests to the Fastify backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },

  // Enable experimental features
  experimental: {
    // Enable turbopack
    turbo: {
      // Turbopack configuration options
      resolveAlias: {
        '@': './src',
      },
    },
  },
};

export default nextConfig;
