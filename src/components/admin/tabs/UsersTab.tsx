"use client";

import { useState, useEffect } from 'react';
import useWeb3 from '@/hooks/useWeb3';

interface User {
  id: string;
  address: string;
  email: string;
  username: string;
  joinDate: string;
  lastActive: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'pending' | 'suspended';
  kycVerified: boolean;
  tokenBalance: number;
}

export default function UsersTab() {
  const { isConnected, address } = useWeb3();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      email: 'user1@example.com',
      username: 'satoshi_nakamoto',
      joinDate: '2025-01-15',
      lastActive: '2025-03-25',
      role: 'admin',
      status: 'active',
      kycVerified: true,
      tokenBalance: 5000
    },
    {
      id: '2',
      address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      email: 'user2@example.com',
      username: 'vitalik_fan',
      joinDate: '2025-02-10',
      lastActive: '2025-03-24',
      role: 'user',
      status: 'active',
      kycVerified: true,
      tokenBalance: 1200
    },
    {
      id: '3',
      address: '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
      email: 'user3@example.com',
      username: 'crypto_whale',
      joinDate: '2025-02-20',
      lastActive: '2025-03-20',
      role: 'user',
      status: 'pending',
      kycVerified: false,
      tokenBalance: 0
    },
    {
      id: '4',
      address: '0x71be63f3384f5fb98995898a86b02fb2426c5788',
      email: 'user4@example.com',
      username: 'blockchain_dev',
      joinDate: '2025-03-01',
      lastActive: '2025-03-22',
      role: 'moderator',
      status: 'active',
      kycVerified: true,
      tokenBalance: 2500
    },
    {
      id: '5',
      address: '0xfabb0ac9d68b0b445fb7357272ff202c5651694a',
      email: 'user5@example.com',
      username: 'defi_trader',
      joinDate: '2025-03-05',
      lastActive: '2025-03-15',
      role: 'user',
      status: 'suspended',
      kycVerified: true,
      tokenBalance: 750
    },
    {
      id: '6',
      address: '0x1cbd3b2770909d4e10f157cabc84c7264073c9ec',
      email: 'user6@example.com',
      username: 'nft_collector',
      joinDate: '2025-03-10',
      lastActive: '2025-03-23',
      role: 'user',
      status: 'active',
      kycVerified: false,
      tokenBalance: 300
    }
  ];
  
  useEffect(() => {
    // In a real app, we would fetch data from an API
    // For demonstration, we'll use mock data
    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(false);
  };
  
  const handleEditUser = () => {
    setIsEditing(true);
  };
  
  const handleUpdateUser = async (updatedUser: User) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would update via an API
      // For demonstration, we'll update the local state
      const updatedUsers = users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      
      setUsers(updatedUsers);
      setSelectedUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage('User updated successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the user');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would update via an API
      // For demonstration, we'll update the local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      );
      
      setUsers(updatedUsers);
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
      
      setSuccessMessage(`User status updated to ${newStatus}`);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would update via an API
      // For demonstration, we'll update the local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      
      setUsers(updatedUsers);
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      
      setSuccessMessage(`User role updated to ${newRole}`);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user role');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleKYC = async (userId: string, verified: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would update via an API
      // For demonstration, we'll update the local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, kycVerified: verified } : user
      );
      
      setUsers(updatedUsers);
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, kycVerified: verified });
      }
      
      setSuccessMessage(`User KYC status updated to ${verified ? 'verified' : 'unverified'}`);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating KYC status');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Apply status filter
    if (filter !== 'all' && user.status !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.address.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  if (isLoading && users.length === 0) {
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
        <h2 className="text-xl font-bold text-white">User Management</h2>
        
        {successMessage && (
          <div className="bg-green-900/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}
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
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-w-[200px]"
          />
        </div>
        
        <div className="text-gray-400 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border-r border-gray-700 pr-6">
          <h3 className="text-lg font-semibold text-white mb-4">User List</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredUsers.map(user => (
              <div 
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id 
                    ? 'bg-blue-900/30 border border-blue-500/30' 
                    : 'hover:bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-white">{user.username}</h4>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                      : user.status === 'pending'
                      ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-900/30 text-red-400 border border-red-500/30'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {isEditing && selectedUser ? (
            <UserEditor 
              user={selectedUser} 
              onSave={handleUpdateUser} 
              onCancel={() => setIsEditing(false)}
              isLoading={isLoading}
            />
          ) : selectedUser ? (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedUser.username}</h3>
                  <p className="text-gray-400">Member since {selectedUser.joinDate}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  selectedUser.status === 'active' 
                    ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                    : selectedUser.status === 'pending'
                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                    : 'bg-red-900/30 text-red-400 border border-red-500/30'
                }`}>
                  {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">User Information</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3">
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{selectedUser.email}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3">
                      <p className="text-sm text-gray-400">Wallet Address</p>
                      <p className="text-white truncate">{selectedUser.address}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3">
                      <p className="text-sm text-gray-400">Last Active</p>
                      <p className="text-white">{selectedUser.lastActive}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Account Status</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">Role</p>
                        <p className="text-white capitalize">{selectedUser.role}</p>
                      </div>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value as 'user' | 'admin' | 'moderator')}
                        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">KYC Verification</p>
                        <p className={`${selectedUser.kycVerified ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedUser.kycVerified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleKYC(selectedUser.id, !selectedUser.kycVerified)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          selectedUser.kycVerified
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {selectedUser.kycVerified ? 'Revoke' : 'Verify'}
                      </button>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3">
                      <p className="text-sm text-gray-400">Token Balance</p>
                      <p className="text-white">{selectedUser.tokenBalance.toLocaleString()} D4L</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleEditUser}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Edit User
                  </button>
                  {selectedUser.status !== 'active' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Activate
                    </button>
                  )}
                  {selectedUser.status !== 'suspended' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-400 text-lg">Select a user to view details</p>
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

interface UserEditorProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function UserEditor({ user, onSave, onCancel, isLoading }: UserEditorProps) {
  const [formData, setFormData] = useState<User>({ ...user });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-6">
        Edit User: {user.username}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Wallet Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Token Balance</label>
            <input
              type="number"
              name="tokenBalance"
              value={formData.tokenBalance}
              onChange={handleChange}
              min="0"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="kycVerified"
              name="kycVerified"
              checked={formData.kycVerified}
              onChange={(e) => setFormData(prev => ({ ...prev, kycVerified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-900/50"
            />
            <label htmlFor="kycVerified" className="ml-2 block text-sm text-gray-400">
              KYC Verified
            </label>
          </div>
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
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
