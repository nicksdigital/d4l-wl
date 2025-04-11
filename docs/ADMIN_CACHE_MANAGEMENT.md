# Admin Cache Management Guide

## Overview

The D4L-NEXT-APP provides administrators with powerful tools to manage the Redis cache system. This document explains how to use the admin cache management features, including the UI components and API endpoints.

## Admin Cache Manager Component

The `AdminCacheManager` component is integrated into the admin dashboard and provides a user-friendly interface for cache management operations.

### Location

The component is located at:
```
/src/components/admin/AdminCacheManager.tsx
```

And is integrated into the admin dashboard at:
```
/src/components/admin/AdminDashboard.tsx
```

### Features

The Admin Cache Manager provides the following capabilities:

1. **View Cache Statistics**
   - Total cached items
   - Memory usage
   - Cache hit/miss ratio

2. **Clear All Cache**
   - Completely flush the Redis cache
   - Use with caution as this affects all users

3. **Clear Cache by Tag**
   - Selectively clear cache based on content tags:
     - Admin content
     - User content
     - Dynamic content

4. **Schedule Cache Invalidation**
   - Set up automatic cache clearing at specified intervals

## Using the Admin Cache Manager

### Clearing All Cache

1. Navigate to the Admin Dashboard
2. Find the "Cache Management" section
3. Click the "Clear All Cache" button
4. Confirm the action in the dialog

### Clearing Cache by Tag

1. Navigate to the Admin Dashboard
2. Find the "Cache Management" section
3. Select the content tag from the dropdown
4. Click the "Clear Selected Cache" button
5. Confirm the action in the dialog

### Viewing Cache Statistics

1. Navigate to the Admin Dashboard
2. Find the "Cache Management" section
3. The statistics are displayed at the top of the section
4. Click "Refresh Stats" to get the latest information

## Admin Cache API

The application provides a dedicated API for cache management operations.

### Endpoint

```
/api/admin/cache
```

### Methods

#### GET: Retrieve Cache Statistics

```typescript
// Example response
{
  "totalKeys": 245,
  "memoryUsage": "1.2MB",
  "hitRatio": 0.87,
  "tagCounts": {
    "d4l-admin-content": 42,
    "d4l-user-content": 156,
    "d4l-dynamic-content": 47
  }
}
```

#### POST: Clear Cache by Tag

```typescript
// Example request
{
  "tag": "d4l-admin-content"
}

// Example response
{
  "success": true,
  "clearedKeys": 42,
  "message": "Successfully cleared 42 keys with tag: d4l-admin-content"
}
```

#### DELETE: Clear All Cache

```typescript
// Example response
{
  "success": true,
  "clearedKeys": 245,
  "message": "Successfully cleared all cache"
}
```

## Custom Hook: useAdminCache

The application provides a custom React hook for integrating cache management into custom admin components.

### Usage

```typescript
import { useAdminCache } from '@/hooks/useAdminCache';

function CustomAdminComponent() {
  const { 
    clearAllCache, 
    clearCacheByTag, 
    getCacheStats, 
    isCacheClearing, 
    cacheStats 
  } = useAdminCache();

  const handleClearUserCache = async () => {
    await clearCacheByTag('d4l-user-content');
    // Handle success
  };

  return (
    <div>
      <h2>Cache Statistics</h2>
      <p>Total Keys: {cacheStats?.totalKeys || 'Loading...'}</p>
      
      <button 
        onClick={handleClearUserCache} 
        disabled={isCacheClearing}
      >
        {isCacheClearing ? 'Clearing...' : 'Clear User Cache'}
      </button>
    </div>
  );
}
```

## Best Practices

1. **Scheduled Maintenance**
   - Schedule regular cache clearing during low-traffic periods
   - Use the tag-based clearing to minimize impact

2. **After Content Updates**
   - Always clear the relevant cache after updating content
   - Use the most specific tag possible to minimize disruption

3. **Monitoring**
   - Regularly check cache statistics to ensure optimal performance
   - Watch for excessive growth in cache size

4. **Security**
   - Cache management functions should only be available to authenticated administrators
   - All cache management actions should be logged for audit purposes

## Troubleshooting

### Common Issues

1. **Cache Not Clearing**
   - Verify Redis connection is active
   - Check for errors in the browser console or server logs
   - Ensure the correct tags are being used

2. **Stale Data After Clearing**
   - Some pages may require a hard refresh after cache clearing
   - Verify that the correct cache tags are associated with the content

3. **Performance Issues After Clearing**
   - The first requests after clearing cache will be slower as data is re-cached
   - Consider staggered or targeted cache clearing during high-traffic periods

## Conclusion

The Admin Cache Management system provides powerful tools for maintaining optimal application performance. By following these guidelines, administrators can effectively manage the cache to ensure users always have access to fresh content while maintaining the performance benefits of caching.
