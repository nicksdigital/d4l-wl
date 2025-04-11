import { useState } from 'react';
import { useAdminCache } from '@/hooks/useAdminCache';
import { ContentTags } from '@/lib/cache';

/**
 * Admin Cache Manager Component
 * Provides a UI for administrators to manage and invalidate various types of cache
 */
export default function AdminCacheManager() {
  const { isLoading, error, success, clearAllCache, clearCacheTags, clearContentTypeCache } = useAdminCache();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Handle tag selection
  const handleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Get all available content tags
  const contentTagOptions = Object.entries(ContentTags).map(([key, value]) => ({
    key,
    value,
    label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }));

  return (
    <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-700/50 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Cache Management
      </h2>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-200">
          {success}
        </div>
      )}
      
      {/* Clear All Cache Button */}
      <div className="mb-6">
        <button
          onClick={clearAllCache}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Cache
            </span>
          )}
        </button>
        <p className="text-gray-400 text-sm mt-2">
          This will clear all admin-related cache and dynamic content cache.
        </p>
      </div>
      
      {/* Content Type Cache Management */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-white">Clear Cache by Content Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentTagOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => clearContentTypeCache(key as keyof typeof ContentTags)}
              disabled={isLoading}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-white py-2 px-4 rounded-lg border border-gray-600/50 transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Custom Tag Selection */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-white">Clear Multiple Tags</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {contentTagOptions.map(({ value, label }) => (
            <label key={value} className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
                checked={selectedTags.includes(value)}
                onChange={() => handleTagSelection(value)}
                disabled={isLoading}
              />
              <span className="ml-2 text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        <button
          onClick={() => clearCacheTags(selectedTags)}
          disabled={isLoading || selectedTags.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Selected Tags ({selectedTags.length})
        </button>
      </div>
      
      {/* Cache Information */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-2 text-white">Cache Information</h3>
        <p className="text-gray-400 text-sm">
          The D4L application uses a multi-level caching strategy with Redis:
        </p>
        <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
          <li>Admin content is never cached for visitors</li>
          <li>User-specific content is cached for 5 minutes</li>
          <li>Dynamic content is cached for 1 minute</li>
          <li>General content is cached for 1 hour</li>
          <li>When you make changes in the admin area, relevant caches are automatically invalidated</li>
        </ul>
      </div>
    </div>
  );
}
