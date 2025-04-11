"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AirdropRegistration {
  id: string;
  address: string;
  email?: string;
  twitter?: string;
  discord?: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  tokenAmount?: number;
}

export default function AirdropManager() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = useState<AirdropRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<AirdropRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for demonstration
  const mockRegistrations: AirdropRegistration[] = [
    {
      id: '1',
      address: '0x1234...5678',
      email: 'user1@example.com',
      twitter: '@user1',
      discord: 'user1#1234',
      registrationDate: '2025-03-15',
      status: 'approved',
      tokenAmount: 1000
    },
    {
      id: '2',
      address: '0x5678...9012',
      email: 'user2@example.com',
      registrationDate: '2025-03-16',
      status: 'pending'
    },
    {
      id: '3',
      address: '0x9012...3456',
      email: 'user3@example.com',
      twitter: '@user3',
      registrationDate: '2025-03-17',
      status: 'rejected'
    }
  ];
  
  useEffect(() => {
    // In a real app, we would fetch data from an API
    // For demonstration, we'll use mock data
    setTimeout(() => {
      setRegistrations(mockRegistrations);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleSelectRegistration = (reg: AirdropRegistration) => {
    setSelectedReg(reg);
  };
  
  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would update via an API
      // For demonstration, we'll update the local state
      const updatedRegistrations = registrations.map(reg => 
        reg.id === id ? { ...reg, status: newStatus } : reg
      );
      setRegistrations(updatedRegistrations);
      
      if (selectedReg && selectedReg.id === id) {
        setSelectedReg({ ...selectedReg, status: newStatus });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetTokenAmount = async (id: string, amount: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would update via an API
      // For demonstration, we'll update the local state
      const updatedRegistrations = registrations.map(reg => 
        reg.id === id ? { ...reg, tokenAmount: amount } : reg
      );
      setRegistrations(updatedRegistrations);
      
      if (selectedReg && selectedReg.id === id) {
        setSelectedReg({ ...selectedReg, tokenAmount: amount });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while setting the token amount');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredRegistrations = registrations.filter(reg => {
    // Apply status filter
    if (filter !== 'all' && reg.status !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        reg.address.toLowerCase().includes(searchLower) ||
        reg.email?.toLowerCase().includes(searchLower) ||
        reg.twitter?.toLowerCase().includes(searchLower) ||
        reg.discord?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  if (isLoading && registrations.length === 0) {
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
          <h2 className="text-xl font-bold">Airdrop Registration Management</h2>
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700 pr-6">
            <h3 className="text-lg font-semibold mb-4">Registrations ({filteredRegistrations.length})</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredRegistrations.map(reg => (
                <div 
                  key={reg.id}
                  onClick={() => handleSelectRegistration(reg)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedReg?.id === reg.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{reg.address}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{reg.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reg.status === 'approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : reg.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {selectedReg ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Registration Details</h3>
                  <div className="flex gap-2">
                    {selectedReg.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedReg.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                        disabled={isLoading}
                      >
                        Approve
                      </button>
                    )}
                    {selectedReg.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedReg.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                        disabled={isLoading}
                      >
                        Reject
                      </button>
                    )}
                    {selectedReg.status !== 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedReg.id, 'pending')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm"
                        disabled={isLoading}
                      >
                        Mark Pending
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Wallet Address</h4>
                    <p className="font-medium">{selectedReg.address}</p>
                  </div>
                  
                  {selectedReg.email && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                      <p>{selectedReg.email}</p>
                    </div>
                  )}
                  
                  {selectedReg.twitter && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Twitter</h4>
                      <p>{selectedReg.twitter}</p>
                    </div>
                  )}
                  
                  {selectedReg.discord && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Discord</h4>
                      <p>{selectedReg.discord}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Registration Date</h4>
                    <p>{selectedReg.registrationDate}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      selectedReg.status === 'approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : selectedReg.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {selectedReg.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Token Amount</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={selectedReg.tokenAmount || 0}
                        onChange={(e) => handleSetTokenAmount(selectedReg.id, parseInt(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                        min="0"
                      />
                      <span>D4L</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Select a registration to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
