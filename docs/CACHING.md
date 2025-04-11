# D4L-NEXT-APP Caching Documentation

## Overview

The D4L-NEXT-APP implements a sophisticated Redis-based caching system to optimize performance, reduce server load, and provide a seamless user experience. This document outlines the caching architecture, configuration, and management tools available in the application.

## Table of Contents

1. [Caching Architecture](#caching-architecture)
2. [Cache Configuration](#cache-configuration)
3. [Content Tags](#content-tags)
4. [Custom Hooks](#custom-hooks)
5. [Admin Cache Management](#admin-cache-management)
6. [Cache Invalidation](#cache-invalidation)
7. [Build Configuration](#build-configuration)
8. [Best Practices](#best-practices)

## Caching Architecture

The caching system is built on Redis, a high-performance in-memory data store, and is integrated with Next.js's built-in caching mechanisms. The architecture follows these principles:

- **Content-based tagging**: Data is cached with specific tags to allow for granular invalidation
- **User-specific caching**: Different caching strategies for authenticated vs. anonymous users
- **Dynamic vs. Static content**: Different expiration policies based on content volatility
- **Admin-controlled invalidation**: Admin interface for cache management

## Cache Configuration

### Page-Level Configuration

Each page in the application has its own caching configuration defined in a separate config file:

```typescript
// src/app/config.ts (Home page)
export const revalidate = 60; // Revalidate every minute

// src/app/claim/config.ts
export const revalidate = 0; // No cache for user-specific content

// src/app/rewards/config.ts
export const revalidate = 0; // No cache for user-specific content
```

### Global Configuration

Global cache settings are defined in `src/lib/cache.ts`:

```typescript
export const defaultCacheConfig = {
  revalidate: 3600, // Default: 1 hour
  tags: [ContentTags.DYNAMIC],
};

export const pageCacheConfig = {
  home: {
    revalidate: 60, // 1 minute
    tags: [ContentTags.DYNAMIC],
  },
  admin: {
    revalidate: 60, // 1 minute
    tags: [ContentTags.ADMIN],
  },
  user: {
    revalidate: 0, // No cache
    tags: [ContentTags.USER],
  },
};
```

## Content Tags

Content tags are used to categorize cached data for targeted invalidation:

```typescript
export enum ContentTags {
  ADMIN = "d4l-admin-content",
  USER = "d4l-user-content",
  DYNAMIC = "d4l-dynamic-content",
}
```

- **ADMIN**: Content managed by administrators (settings, configurations)
- **USER**: User-specific content (profiles, rewards, claims)
- **DYNAMIC**: General dynamic content that changes frequently

## Custom Hooks

### `useCachedData`

This hook fetches and caches data with appropriate tags:

```typescript
const { data, isLoading, error } = useCachedData(
  fetchFunction,
  {
    key: "unique-cache-key",
    tags: [ContentTags.USER],
    expiration: 3600, // 1 hour
  }
);
```

### `useCachedBlockchainData`

Specialized hook for blockchain data with optimized caching strategies:

```typescript
const { data, isLoading, error } = useCachedBlockchainData(
  fetchFunction,
  {
    key: "blockchain-data-key",
    address: userAddress,
    chainId: currentChainId,
    expiration: 300, // 5 minutes
  }
);
```

### `useAdminCache`

Hook for admin-specific cache management:

```typescript
const { clearAllCache, clearCacheByTag, isCacheClearing } = useAdminCache();
```

## Admin Cache Management

### Admin API Endpoint

The application provides an API endpoint for cache management at `/api/admin/cache`:

- **GET**: Retrieves cache statistics
- **POST**: Clears cache based on provided parameters
- **DELETE**: Clears all cache

### AdminCacheManager Component

The `AdminCacheManager` component provides a user-friendly interface for administrators to manage the cache:

- Clear all cache
- Clear cache by specific tags
- View cache statistics
- Schedule automatic cache invalidation

## Cache Invalidation

### Automatic Invalidation

The middleware automatically invalidates cache for admin routes:

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Invalidate cache for admin routes
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('x-invalidate-cache', ContentTags.ADMIN);
    return response;
  }
  
  return NextResponse.next();
}
```

### Manual Invalidation

Cache can be manually invalidated through:

1. Admin dashboard interface
2. API calls to `/api/admin/cache`
3. Revalidation API at `/api/revalidate`

## Build Configuration

When building the application, it's important to understand how caching configurations interact with Next.js:

### Client vs. Server Components

- **Client Components**: Cannot export `revalidate` directly
  ```typescript
  // ❌ Don't do this in client components
  "use client";
  export const revalidate = 60;
  ```

- **Server Components or Config Files**: Can export `revalidate`
  ```typescript
  // ✅ Do this in separate config files
  // config.ts
  export const revalidate = 60;
  ```

### Build Process

The build process validates all revalidate exports. To ensure successful builds:

1. Use static values for revalidate (not dynamic expressions)
2. Keep revalidate exports in separate config files for client components
3. Use the provided `fix-revalidate.sh` script if build issues occur

## Best Practices

1. **Use Content Tags**: Always assign appropriate tags when caching data
2. **User-Specific Content**: Set `revalidate: 0` for user-specific pages
3. **Dynamic Content**: Use short cache durations (1-5 minutes)
4. **Static Content**: Use longer cache durations (1+ hours)
5. **Admin Routes**: Always invalidate cache after admin actions
6. **Security**: Ensure cache management endpoints are properly secured

## Troubleshooting

### Common Issues

1. **Build Errors**: If you encounter build errors related to revalidate, use the `fix-revalidate.sh` script
2. **Stale Data**: If users report stale data, check the cache invalidation triggers
3. **High Redis Memory Usage**: Review cache expiration policies and consider more aggressive invalidation

### Debugging

Enable Redis debugging by setting the environment variable:

```
REDIS_DEBUG=true
```

This will log all Redis operations to the console during development.

## Conclusion

The D4L-NEXT-APP caching system provides a powerful and flexible way to optimize performance while ensuring data freshness. By following the guidelines in this documentation, developers can effectively leverage the caching system to create a responsive and efficient application.
