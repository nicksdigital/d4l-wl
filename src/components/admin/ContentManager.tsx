"use client";

import { useState, useEffect } from 'react';
import useWeb3 from '@/hooks/useWeb3';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastModified: string;
  status: 'published' | 'draft';
}

export default function ContentManager() {
  const { isConnected, address } = useWeb3();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data for demonstration
  const mockPages: PageContent[] = [
    {
      id: '1',
      title: 'Home Page',
      slug: '/',
      content: 'Welcome to D4L - the future of decentralized finance.',
      lastModified: '2025-03-15',
      status: 'published'
    },
    {
      id: '2',
      title: 'About Us',
      slug: '/about',
      content: 'Learn more about the D4L team and our mission.',
      lastModified: '2025-03-10',
      status: 'published'
    },
    {
      id: '3',
      title: 'Roadmap',
      slug: '/roadmap',
      content: 'Our vision for the future of D4L.',
      lastModified: '2025-03-20',
      status: 'draft'
    }
  ];
  
  useEffect(() => {
    // In a real app, we would fetch data from an API
    // For demonstration, we'll use mock data
    setTimeout(() => {
      setPages(mockPages);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleSelectPage = (page: PageContent) => {
    setSelectedPage(page);
    setIsEditing(false);
    setIsCreating(false);
  };
  
  const handleEditPage = () => {
    setIsEditing(true);
    setIsCreating(false);
  };
  
  const handleCreatePage = () => {
    setSelectedPage({
      id: '',
      title: '',
      slug: '',
      content: '',
      lastModified: new Date().toISOString().split('T')[0],
      status: 'draft'
    });
    setIsEditing(false);
    setIsCreating(true);
  };
  
  const handleSavePage = async (updatedPage: PageContent) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would save to an API
      // For demonstration, we'll update the local state
      
      if (isCreating) {
        // Create new page
        const newPage = {
          ...updatedPage,
          id: Math.random().toString(36).substring(2, 9),
          lastModified: new Date().toISOString().split('T')[0]
        };
        setPages([...pages, newPage]);
        setSelectedPage(newPage);
      } else {
        // Update existing page
        const updatedPages = pages.map(page => 
          page.id === updatedPage.id ? 
            { ...updatedPage, lastModified: new Date().toISOString().split('T')[0] } : 
            page
        );
        setPages(updatedPages);
        setSelectedPage(updatedPage);
      }
      
      setIsEditing(false);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the page');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would delete via an API
      // For demonstration, we'll update the local state
      const updatedPages = pages.filter(page => page.id !== pageId);
      setPages(updatedPages);
      setSelectedPage(null);
      setIsEditing(false);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the page');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && pages.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Content Management</h2>
          <button
            onClick={handleCreatePage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Page
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700 pr-6">
            <h3 className="text-lg font-semibold mb-4">Pages</h3>
            <div className="space-y-2">
              {pages.map(page => (
                <div 
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPage?.id === page.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{page.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{page.slug}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      page.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {page.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {selectedPage ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {isCreating ? 'Create New Page' : isEditing ? 'Edit Page' : 'Page Details'}
                  </h3>
                  <div className="flex gap-2">
                    {!isEditing && !isCreating && (
                      <>
                        <button
                          onClick={handleEditPage}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePage(selectedPage.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {isEditing || isCreating ? (
                  <PageEditor 
                    page={selectedPage} 
                    onSave={handleSavePage} 
                    onCancel={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      if (isCreating) setSelectedPage(null);
                    }}
                    isLoading={isLoading}
                  />
                ) : (
                  <PageViewer page={selectedPage} />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">Select a page to view details</p>
                  <p className="text-gray-400 dark:text-gray-500">or</p>
                  <button
                    onClick={handleCreatePage}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create a new page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PageEditorProps {
  page: PageContent;
  onSave: (page: PageContent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function PageEditor({ page, onSave, onCancel, isLoading }: PageEditorProps) {
  const [formData, setFormData] = useState<PageContent>(page);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Example: /about-us</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Page</span>
          )}
        </button>
      </div>
    </form>
  );
}

interface PageViewerProps {
  page: PageContent;
}

function PageViewer({ page }: PageViewerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold">{page.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Slug: {page.slug}
        </p>
      </div>
      
      <div className="flex gap-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          page.status === 'published' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {page.status}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
          Last modified: {page.lastModified}
        </span>
      </div>
      
      <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Content Preview:</h4>
        <div className="prose dark:prose-invert max-w-none">
          {page.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
