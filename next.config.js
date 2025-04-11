/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.ipfs.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self' https://* http://* ws://* wss://* data: blob: 'unsafe-inline' 'unsafe-eval';
              script-src 'self' https://* http://* 'unsafe-inline' 'unsafe-eval' blob:;
              style-src 'self' https://* http://* 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://* http://* data: https://fonts.gstatic.com;
              img-src 'self' https://* http://* data: blob:;
              media-src 'self' https://* http://* data: blob:;
              connect-src 'self' https://* http://* ws://* wss://* data:;
              frame-src 'self' https://* http://* https://verify.walletconnect.org https://verify.walletconnect.com;
              worker-src 'self' blob:;
              child-src 'self' blob:;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  // Compiler options
  compiler: {
    // This enables the styled-components SWC transform
    styledComponents: true,
  },
  // Disable SSR for compatibility with Wagmi
  experimental: {
    // Add any experimental features here
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
