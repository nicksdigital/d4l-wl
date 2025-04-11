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

export default function ContentTab() {
  const { isConnected, address } = useWeb3();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Mock data for demonstration
  const mockPages: PageContent[] = [
    {
      id: '1',
      title: 'Home Page',
      slug: '/',
      content: 'Welcome to D4L - the future of decentralized finance. Our platform offers innovative solutions for token distribution and community building.',
      lastModified: '2025-03-15',
      status: 'published'
    },
    {
      id: '2',
      title: 'About Us',
      slug: '/about',
      content: 'Learn more about the D4L team and our mission. We are a group of blockchain enthusiasts dedicated to creating a fair and transparent ecosystem.',
      lastModified: '2025-03-10',
      status: 'published'
    },
    {
      id: '3',
      title: 'Roadmap',
      slug: '/roadmap',
      content: 'Our vision for the future of D4L includes multiple phases of development, community growth, and ecosystem expansion.',
      lastModified: '2025-03-20',
      status: 'draft'
    },
    {
      id: '4',
      title: 'FAQ',
      slug: '/faq',
      content: 'Frequently asked questions about D4L, token distribution, and platform features.',
      lastModified: '2025-03-18',
      status: 'published'
    },
    {
      id: '5',
      title: 'Token Economics',
      slug: '/tokenomics',
      content: 'Detailed breakdown of D4L token distribution, vesting schedules, and utility within our ecosystem.',
      lastModified: '2025-03-22',
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

  const filteredPages = pages.filter(page => {
    // Apply status filter
    if (filter !== 'all' && page.status !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        page.title.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower) ||
        page.content.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  if (isLoading && pages.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-white">Content Management</h2>
        <button
          onClick={handleCreatePage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Page
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-w-[200px]"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border-r border-gray-700 pr-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pages ({filteredPages.length})</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredPages.map(page => (
              <div 
                key={page.id}
                onClick={() => handleSelectPage(page)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedPage?.id === page.id 
                    ? 'bg-blue-900/30 border border-blue-500/30' 
                    : 'hover:bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">{page.title}</h4>
                    <p className="text-sm text-gray-400">{page.slug}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    page.status === 'published' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {isEditing || isCreating ? (
            <PageEditor 
              page={selectedPage!} 
              onSave={handleSavePage} 
              onCancel={() => {
                setIsEditing(false);
                setIsCreating(false);
              }}
              isLoading={isLoading}
            />
          ) : selectedPage ? (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedPage.title}</h3>
                  <p className="text-gray-400">Last modified: {selectedPage.lastModified}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  selectedPage.status === 'published' 
                    ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                    : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {selectedPage.status.charAt(0).toUpperCase() + selectedPage.status.slice(1)}
                </span>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Page URL</h4>
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3 flex items-center">
                  <span className="text-gray-500">https://d4l.finance</span>
                  <span className="text-white">{selectedPage.slug}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Content Preview</h4>
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3 min-h-[200px] text-white">
                  {selectedPage.content}
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleEditPage}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Edit Page
                  </button>
                  <button
                    onClick={() => handleSavePage({
                      ...selectedPage,
                      status: selectedPage.status === 'published' ? 'draft' : 'published'
                    })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedPage.status === 'published'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {selectedPage.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDeletePage(selectedPage.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-lg">Select a page to view details or create a new one</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
      `}</style>
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
  const [formData, setFormData] = useState<PageContent>({ ...page });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        {page.id ? 'Edit Page' : 'Create New Page'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Page Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">URL Slug</label>
            <div className="flex items-center bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
              <span className="bg-gray-800 px-3 py-2 text-gray-500">https://d4l.finance</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="flex-1 bg-transparent border-none px-3 py-2 text-white focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Page'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
