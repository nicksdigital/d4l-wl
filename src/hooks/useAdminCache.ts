import { useState } from 'react';
import { ContentTags } from '@/lib/cache';

/**
 * Custom hook for admin cache management
 * Provides functions to clear specific content tags or all admin-related cache
 */
export function useAdminCache() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Clear all admin-related cache
   */
  const clearAllCache = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token' // In a real app, use a proper auth token
        },
        body: JSON.stringify({
          action: 'clear_all'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cache');
      }

      setSuccess('All admin cache cleared successfully');
    } catch (err) {
      setError((err as Error).message);
      console.error('Error clearing admin cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear specific content tags
   * @param tags Array of content tags to clear
   */
  const clearCacheTags = async (tags: string[]) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token' // In a real app, use a proper auth token
        },
        body: JSON.stringify({
          action: 'clear_tags',
          tags
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cache tags');
      }

      setSuccess(`Cache tags cleared successfully: ${tags.join(', ')}`);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error clearing cache tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear cache for a specific content type
   * @param contentType The content type to clear cache for
   */
  const clearContentTypeCache = async (contentType: keyof typeof ContentTags) => {
    const tag = ContentTags[contentType];
    await clearCacheTags([tag]);
  };

  return {
    isLoading,
    error,
    success,
    clearAllCache,
    clearCacheTags,
    clearContentTypeCache
  };
}
