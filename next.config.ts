import type { NextConfig } from 'next';

// Determine if we're in production or development
const isProd = process.env.NODE_ENV === 'production';
const isDeployedToDomain = process.env.NEXT_PUBLIC_DEPLOYED_DOMAIN === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Configure asset prefix for production environments
  assetPrefix: isProd && isDeployedToDomain ? 'https://d4l.ai' : undefined,
  // Configure base path if needed
  // basePath: isProd && isDeployedToDomain ? '' : '',
  // Configure trailing slash behavior
  trailingSlash: true, // Changed to true to ensure proper static asset paths
  // Configure output for better static file handling
  output: isProd ? 'standalone' : undefined,
  // Disable powered by header
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.ipfs.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.infura.io',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.walletconnect.com',
        pathname: '**',
      },
    ],
    // Ensure images are properly optimized
    unoptimized: false,
    // Increase image size limits if needed
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optimize static asset handling
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config: any) => {
    // Required for Wagmi and AppKit SSR compatibility
    config.externals = [...(config.externals || []), "pino-pretty", "lokijs", "encoding"];
    
    // Optimize bundle size
    if (isProd) {
      // Enable production optimizations
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    
    return config;
  },
};

export default nextConfig;
