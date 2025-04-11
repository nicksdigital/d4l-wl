// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  reactStrictMode: true,
  // Optimize development performance
  swcMinify: true,
  
  // Configure Turbopack properly for Next.js 15
  experimental: {
    // Use the full Turbopack configuration
    turbo: true,
  },
  
  // Configure image domains for Next.js Image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd4lcdn.tor1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd4lcdn.tor1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Optimize webpack configuration (used when not using turbo)
  webpack: (config, { dev, isServer }) => {
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

    // Add bundle analyzer if ANALYZE is true
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('next/dist/compiled/webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
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
