# D4L-NEXT-APP Deployment Guide

## Overview

This document provides instructions for deploying the D4L-NEXT-APP to production environments, with a focus on proper static asset configuration to prevent 404 errors and ensure the glassmorphism design renders correctly.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Static Asset Configuration](#static-asset-configuration)
3. [Deployment Process](#deployment-process)
4. [Troubleshooting](#troubleshooting)
5. [Performance Optimization](#performance-optimization)

## Environment Configuration

### Production Environment Variables

The application uses different environment configurations for development and production. For production deployment, use the `.env.production` file with the following settings:

```
# Deployment Configuration
NEXT_PUBLIC_DEPLOYED_DOMAIN=true

# NextAuth Configuration
NEXTAUTH_URL=https://d4l.ai
NEXTAUTH_SECRET=your_secure_random_string

# Redis Configuration
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token
REVALIDATION_SECRET=your_secure_revalidation_secret
```

### Security Considerations

For production deployments, generate secure random strings for sensitive values:

```bash
# Generate a secure random string for NEXTAUTH_SECRET
openssl rand -base64 32

# Generate a secure random string for REVALIDATION_SECRET
openssl rand -base64 32
```

## Static Asset Configuration

### Next.js Configuration

The application uses a custom Next.js configuration to ensure static assets are properly served:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Configure asset prefix for production environments
  assetPrefix: isProd && isDeployedToDomain ? 'https://d4l.ai' : undefined,
  
  // Configure trailing slash behavior
  trailingSlash: false,
  
  // Configure output for better static file handling
  output: isProd ? 'standalone' : undefined,
  
  // Image optimization settings
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
    ],
    unoptimized: false,
  },
};
```

### Asset Prefix Explanation

The `assetPrefix` configuration is crucial for correctly serving static assets:

- In development: No prefix is used, assets are served from the root path
- In production: Assets are served from the specified domain (e.g., `https://d4l.ai`)

This ensures that all JavaScript, CSS, and image files are requested from the correct location, preventing 404 errors.

### Image Optimization

The application uses Next.js's built-in image optimization with:

- Remote pattern configuration for IPFS images
- Optimization enabled for better performance
- Proper caching headers for optimized delivery

## Deployment Process

### Building for Production

To build the application for production:

```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Build the application
npm run build
```

### Deployment Options

#### Option 1: Standalone Deployment

The application is configured for standalone deployment with:

```bash
# Build the standalone application
npm run build

# The output will be in the .next/standalone directory
cd .next/standalone

# Start the application
node server.js
```

#### Option 2: Container Deployment

For containerized deployment, use the provided Dockerfile:

```bash
# Build the Docker image
docker build -t d4l-next-app .

# Run the container
docker run -p 3000:3000 -e NODE_ENV=production d4l-next-app
```

### CDN Configuration

For optimal performance, configure your CDN with:

1. Cache-Control headers for static assets:
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

2. Proper MIME types for all assets:
   ```
   .js   -> application/javascript
   .css  -> text/css
   .woff2 -> font/woff2
   ```

3. CORS headers for font files:
   ```
   Access-Control-Allow-Origin: *
   ```

## Troubleshooting

### Common Issues

#### 404 Errors for Static Assets

If you encounter 404 errors for static assets:

1. **Check assetPrefix Configuration**:
   - Ensure `NEXT_PUBLIC_DEPLOYED_DOMAIN` is set to `true` in production
   - Verify the domain in `assetPrefix` matches your actual deployment domain

2. **Check Network Requests**:
   - Use browser developer tools to inspect failed requests
   - Verify the requested URLs match your deployment configuration

3. **Check MIME Types**:
   - Ensure your server is sending the correct MIME types for static assets
   - Common issue: JavaScript files served as `text/html` instead of `application/javascript`

#### MIME Type Errors

For MIME type errors:

1. **Server Configuration**:
   - Configure your web server to send the correct MIME types
   - For Nginx:
     ```nginx
     include mime.types;
     default_type application/octet-stream;
     ```

2. **CDN Configuration**:
   - Ensure your CDN preserves MIME types from the origin server
   - Set explicit MIME types for common file extensions

### Debugging Tools

Use these tools to diagnose deployment issues:

1. **Browser Developer Tools**:
   - Network tab to inspect requests and responses
   - Console tab to view JavaScript errors

2. **curl for Headers**:
   ```bash
   curl -I https://d4l.ai/_next/static/chunks/main.js
   ```

3. **Lighthouse for Performance**:
   - Run Lighthouse audits to identify performance issues
   - Focus on "Serve static assets with efficient cache policy"

## Performance Optimization

### Caching Strategy

The application implements a multi-layered caching strategy:

1. **Browser Caching**:
   - Long-lived cache for static assets (1 year)
   - Short-lived cache for dynamic content (configurable)

2. **CDN Caching**:
   - Edge caching for static assets
   - Cache bypass for authenticated content

3. **Redis Caching**:
   - Server-side caching with content tagging
   - Selective invalidation based on content updates

### Glassmorphism Design Considerations

The application's glassmorphism design requires special attention:

1. **CSS Loading**:
   - Critical CSS is inlined for faster rendering
   - Non-critical CSS is loaded asynchronously

2. **Font Loading**:
   - Fonts are preloaded with appropriate `as` values
   - Font-display is set to `swap` to prevent FOIT (Flash of Invisible Text)

3. **Animation Performance**:
   - Hardware-accelerated animations using `transform` and `opacity`
   - Reduced motion option for accessibility

By following these guidelines, you'll ensure that the D4L-NEXT-APP is deployed correctly with all static assets properly served, preventing 404 errors and maintaining the beautiful glassmorphism design.
