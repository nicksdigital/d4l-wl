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

export default function AirdropTab() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = useState<AirdropRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<AirdropRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [airdropStatus, setAirdropStatus] = useState<'active' | 'paused'>('active');
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
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
    },
    {
      id: '4',
      address: '0xabcd...ef01',
      email: 'user4@example.com',
      discord: 'user4#5678',
      registrationDate: '2025-03-18',
      status: 'pending'
    },
    {
      id: '5',
      address: '0xef01...2345',
      email: 'user5@example.com',
      twitter: '@user5',
      discord: 'user5#9012',
      registrationDate: '2025-03-19',
      status: 'approved',
      tokenAmount: 1500
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

  const toggleAirdropStatus = () => {
    setAirdropStatus(prev => prev === 'active' ? 'paused' : 'active');
  };

  const handleBatchAction = (action: 'approve' | 'reject' | 'delete') => {
    if (selectedItems.length === 0) return;

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedItems.length} registrations?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would update via an API
      // For demonstration, we'll update the local state
      let updatedRegistrations;
      
      if (action === 'delete') {
        updatedRegistrations = registrations.filter(reg => !selectedItems.includes(reg.id));
      } else {
        updatedRegistrations = registrations.map(reg => 
          selectedItems.includes(reg.id) 
            ? { ...reg, status: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected' } 
            : reg
        );
      }
      
      setRegistrations(updatedRegistrations);
      setSelectedItems([]);
      
      // Update selected registration if it was part of the batch action
      if (selectedReg && selectedItems.includes(selectedReg.id)) {
        if (action === 'delete') {
          setSelectedReg(null);
        } else {
          setSelectedReg({ 
            ...selectedReg, 
            status: action === 'approve' ? 'approved' : 'rejected' 
          });
        }
      }
    } catch (err: any) {
      setError(err.message || `An error occurred while performing the ${action} action`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedItems.length === filteredRegistrations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredRegistrations.map(reg => reg.id));
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
        <h2 className="text-xl font-bold text-white">Airdrop Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={toggleAirdropStatus}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              airdropStatus === 'active' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${airdropStatus === 'active' ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${airdropStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            {airdropStatus === 'active' ? 'Airdrop Active' : 'Airdrop Paused'}
          </button>
          <button 
            onClick={() => setShowBatchActions(!showBatchActions)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Batch Actions
          </button>
        </div>
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
            className="px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white min-w-[200px]"
          />
        </div>
        
        {showBatchActions && selectedItems.length > 0 && (
          <div className="flex gap-2 items-center bg-gray-800/70 px-3 py-2 rounded-lg border border-gray-700">
            <span className="text-white text-sm">{selectedItems.length} selected</span>
            <button 
              onClick={() => handleBatchAction('approve')}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              Approve
            </button>
            <button 
              onClick={() => handleBatchAction('reject')}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Reject
            </button>
            <button 
              onClick={() => handleBatchAction('delete')}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border-r border-gray-700 pr-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Registrations ({filteredRegistrations.length})</h3>
            {showBatchActions && (
              <button 
                onClick={toggleAllSelection}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {selectedItems.length === filteredRegistrations.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredRegistrations.map(reg => (
              <div 
                key={reg.id}
                onClick={() => handleSelectRegistration(reg)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedReg?.id === reg.id 
                    ? 'bg-blue-900/30 border border-blue-500/30' 
                    : 'hover:bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  {showBatchActions && (
                    <div className="mr-2" onClick={(e) => { e.stopPropagation(); toggleItemSelection(reg.id); }}>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(reg.id)}
                        className="h-4 w-4 text-blue-600 rounded bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                        onChange={() => {}}
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h4 className="font-medium text-white">{reg.address}</h4>
                    <p className="text-sm text-gray-400">{reg.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    reg.status === 'approved' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                      : reg.status === 'rejected'
                        ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                        : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {selectedReg ? (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedReg.address}</h3>
                  <p className="text-gray-400">Registered on {selectedReg.registrationDate}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  selectedReg.status === 'approved' 
                    ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                    : selectedReg.status === 'rejected'
                      ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {selectedReg.status.charAt(0).toUpperCase() + selectedReg.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Contact Information</h4>
                  <div className="space-y-3">
                    {selectedReg.email && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-white">{selectedReg.email}</span>
                      </div>
                    )}
                    {selectedReg.twitter && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span className="text-white">{selectedReg.twitter}</span>
                      </div>
                    )}
                    {selectedReg.discord && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.865-.608 1.25-1.845-.276-3.68-.276-5.487 0-.163-.393-.406-.874-.617-1.25a.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056c2.053 1.508 4.041 2.423 5.993 3.029.078.028.164-.002.184-.06.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 12.299 12.299 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127c-.598.35-1.22.645-1.873.892a.077.077 0 0 0-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .184.061c1.961-.607 3.95-1.522 6.002-3.029a.082.082 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        <span className="text-white">{selectedReg.discord}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Token Allocation</h4>
                  <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white">Amount:</span>
                      <span className="text-white font-bold">{selectedReg.tokenAmount || 0} D4L</span>
                    </div>
                    <input
                      type="number"
                      value={selectedReg.tokenAmount || 0}
                      onChange={(e) => handleSetTokenAmount(selectedReg.id, parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mb-2"
                      min="0"
                    />
                    <button 
                      onClick={() => handleSetTokenAmount(selectedReg.id, 1000)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                    >
                      Set Default (1000 D4L)
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4">Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedReg.id, 'approved')}
                    disabled={selectedReg.status === 'approved'}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedReg.status === 'approved'
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReg.id, 'rejected')}
                    disabled={selectedReg.status === 'rejected'}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedReg.status === 'rejected'
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReg.id, 'pending')}
                    disabled={selectedReg.status === 'pending'}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedReg.status === 'pending'
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    Mark as Pending
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg">Select a registration to view details</p>
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
