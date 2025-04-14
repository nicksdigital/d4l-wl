'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { contentApi } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiImage,
  FiFileText,
  FiLink,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'post' | 'banner' | 'announcement';
  status: 'published' | 'draft';
  author: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContentPage() {
  const { isAuthenticated } = useAuth();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent();
    }
  }, [isAuthenticated]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await contentApi.getContent();
      if (response.success) {
        setContentItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <FiFileText className="h-5 w-5 text-blue-400" />;
      case 'post':
        return <FiFileText className="h-5 w-5 text-green-400" />;
      case 'banner':
        return <FiImage className="h-5 w-5 text-purple-400" />;
      case 'announcement':
        return <FiLink className="h-5 w-5 text-yellow-400" />;
      default:
        return <FiFileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <p className="text-gray-400">Manage website content</p>
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="page">Pages</option>
            <option value="post">Posts</option>
            <option value="banner">Banners</option>
            <option value="announcement">Announcements</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary whitespace-nowrap"
          >
            <FiPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Content</span>
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-gray-700/50 rounded w-1/4 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredContent.length > 0 ? (
                filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(item.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{item.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 capitalize">{item.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <FiEdit className="h-5 w-5" />
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          <FiEye className="h-5 w-5" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No content found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Content Modal - Would be implemented in a real app */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="card-gradient p-6 max-w-md w-full relative z-10">
              <h2 className="text-xl font-bold mb-4 text-white">Add New Content</h2>
              <p className="text-gray-400 mb-6">This is a placeholder for the content creation form.</p>
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary mr-2"
                >
                  Cancel
                </button>
                <button className="btn-primary">
                  Create Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
