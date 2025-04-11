import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optimize development performance
  swcMinify: true,
  // Optimize webpack configuration
  webpack: (config: WebpackConfig, { dev, isServer }) => {
    // Conditionally apply optimizations only in development
    if (dev) {
      // Reduce the number of chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              reuseExistingChunk: true,
            },
            // Bundle big third-party libraries separately
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
            },
          },
        },
        runtimeChunk: { name: 'runtime' },
      };
    }

    return config;
  },
  // Only use TypeScript type checking in production builds to speed up development
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Disable ESLint during development for faster builds
    // You should still run ESLint separately in your CI/CD pipeline
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
