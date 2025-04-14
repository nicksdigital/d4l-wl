'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cacheApi } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { FiTrash2, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

// Content tags for cache management
const ContentTags = {
  USER_PROFILES: 'user_profiles',
  NFT_METADATA: 'nft_metadata',
  TOKEN_BALANCES: 'token_balances',
  AIRDROP_DATA: 'airdrop_data',
  CONTENT_PAGES: 'content_pages',
  ANALYTICS_DATA: 'analytics_data',
  SYSTEM_SETTINGS: 'system_settings',
};

export default function CachePage() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Get all available content tags
  const contentTagOptions = Object.entries(ContentTags).map(([key, value]) => ({
    key,
    value,
    label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }));

  // Handle tag selection
  const handleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Clear all cache
  const handleClearAllCache = async () => {
    setIsLoading(true);
    setNotification(null);
    
    try {
      const response = await cacheApi.clearAllCache();
      if (response.success) {
        setNotification({
          type: 'success',
          message: 'All cache cleared successfully'
        });
      } else {
        throw new Error(response.error || 'Failed to clear cache');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while clearing cache'
      });
    } finally {
      setIsLoading(false);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Clear cache by tags
  const handleClearCacheTags = async () => {
    if (selectedTags.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please select at least one tag'
      });
      return;
    }
    
    setIsLoading(true);
    setNotification(null);
    
    try {
      // In a real app, we would call the API for each tag
      // For this demo, we'll just simulate success
      for (const tag of selectedTags) {
        await cacheApi.clearCacheByTag(tag);
      }
      
      setNotification({
        type: 'success',
        message: `Cache cleared for ${selectedTags.length} tag(s)`
      });
      setSelectedTags([]);
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while clearing cache'
      });
    } finally {
      setIsLoading(false);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Clear cache by content type
  const handleClearContentTypeCache = async (contentType: string) => {
    setIsLoading(true);
    setNotification(null);
    
    try {
      const response = await cacheApi.clearCacheByType(contentType);
      if (response.success) {
        setNotification({
          type: 'success',
          message: `Cache cleared for ${contentType.replace(/_/g, ' ').toLowerCase()}`
        });
      } else {
        throw new Error(response.error || 'Failed to clear cache');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while clearing cache'
      });
    } finally {
      setIsLoading(false);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Cache Management</h1>
        <p className="text-gray-400">Manage application cache</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          notification.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? (
            <FiCheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <FiAlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Clear All Cache */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Clear All Cache</h2>
          <p className="text-gray-400 mb-4">
            This will clear all cached data from the application. This action cannot be undone.
          </p>
          <button
            onClick={handleClearAllCache}
            disabled={isLoading}
            className="btn-primary bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FiTrash2 className="mr-2" />
                <span>Clear All Cache</span>
              </div>
            )}
          </button>
        </div>

        {/* Clear Cache by Tags */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Clear Cache by Tags</h2>
          <p className="text-gray-400 mb-4">
            Select specific tags to clear only the cache related to those tags.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {contentTagOptions.map(({ key, value, label }) => (
              <div
                key={key}
                onClick={() => handleTagSelection(value)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTags.includes(value)
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(value)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                  />
                  <label className="ml-2 block text-sm">{label}</label>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleClearCacheTags}
            disabled={isLoading || selectedTags.length === 0}
            className={`btn-primary ${
              selectedTags.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FiTrash2 className="mr-2" />
                <span>Clear Selected Tags</span>
              </div>
            )}
          </button>
        </div>

        {/* Clear Cache by Content Type */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Clear Cache by Content Type</h2>
          <p className="text-gray-400 mb-4">
            Clear cache for specific content types.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTagOptions.map(({ key, value, label }) => (
              <button
                key={key}
                onClick={() => handleClearContentTypeCache(value)}
                disabled={isLoading}
                className="bg-gray-800/70 hover:bg-gray-700/70 text-white py-3 px-4 rounded-lg border border-gray-700/50 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cache Information */}
        <div className="card p-6">
          <div className="flex items-start mb-4">
            <FiInfo className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
            <h2 className="text-xl font-semibold text-white">Cache Information</h2>
          </div>
          
          <p className="text-gray-400 mb-4">
            The D4L application uses a multi-level caching strategy with Redis:
          </p>
          
          <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
            <li>Admin content is never cached for visitors</li>
            <li>User-specific content is cached for 5 minutes</li>
            <li>Dynamic content is cached for 1 minute</li>
            <li>General content is cached for 1 hour</li>
            <li>When you make changes in the admin area, relevant caches are automatically invalidated</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
