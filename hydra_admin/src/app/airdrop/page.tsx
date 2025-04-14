'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { airdropApi } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { FiSearch, FiFilter, FiPlus, FiCheck, FiX, FiClock } from 'react-icons/fi';

interface AirdropClaim {
  id: string;
  wallet: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  reason?: string;
}

interface AirdropStats {
  totalAllocated: number;
  totalClaimed: number;
  claimRate: string;
  uniqueClaimers: number;
}

export default function AirdropPage() {
  const { isAuthenticated } = useAuth();
  const [claims, setClaims] = useState<AirdropClaim[]>([]);
  const [stats, setStats] = useState<AirdropStats>({
    totalAllocated: 0,
    totalClaimed: 0,
    claimRate: '0%',
    uniqueClaimers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAirdropData();
    }
  }, [isAuthenticated]);

  const fetchAirdropData = async () => {
    setIsLoading(true);
    try {
      // Fetch airdrop stats
      const statsResponse = await airdropApi.getStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch airdrop claims
      const claimsResponse = await airdropApi.getClaims();
      if (claimsResponse.success) {
        setClaims(claimsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching airdrop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.wallet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Airdrop Management</h1>
        <p className="text-gray-400">Manage token airdrops and claims</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card p-6">
          <p className="text-gray-400 text-sm">Total Allocated</p>
          <p className="text-2xl font-semibold text-white mt-2">
            {isLoading ? (
              <div className="h-8 bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
            ) : (
              <>{stats.totalAllocated.toLocaleString()} D4L</>
            )}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-gray-400 text-sm">Total Claimed</p>
          <p className="text-2xl font-semibold text-white mt-2">
            {isLoading ? (
              <div className="h-8 bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
            ) : (
              <>{stats.totalClaimed.toLocaleString()} D4L</>
            )}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-gray-400 text-sm">Claim Rate</p>
          <p className="text-2xl font-semibold text-white mt-2">
            {isLoading ? (
              <div className="h-8 bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
            ) : (
              <>{stats.claimRate}</>
            )}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-gray-400 text-sm">Unique Claimers</p>
          <p className="text-2xl font-semibold text-white mt-2">
            {isLoading ? (
              <div className="h-8 bg-gray-700/50 rounded w-1/2 animate-pulse"></div>
            ) : (
              <>{stats.uniqueClaimers.toLocaleString()}</>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <FiPlus className="h-5 w-5" />
            <span>Add Allocation</span>
          </button>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Wallet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Reason
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
              ) : filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 font-mono">
                        {claim.wallet.slice(0, 6)}...{claim.wallet.slice(-4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {claim.amount.toLocaleString()} D4L
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        claim.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : claim.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {claim.status === 'approved' && <FiCheck className="mr-1" />}
                        {claim.status === 'rejected' && <FiX className="mr-1" />}
                        {claim.status === 'pending' && <FiClock className="mr-1" />}
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(claim.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {claim.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {claim.status === 'pending' && (
                          <>
                            <button className="text-green-400 hover:text-green-300">
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button className="text-red-400 hover:text-red-300">
                              <FiX className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No claims found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Allocation Modal - Would be implemented in a real app */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="card-gradient p-6 max-w-md w-full relative z-10">
              <h2 className="text-xl font-bold mb-4 text-white">Add Airdrop Allocation</h2>
              <p className="text-gray-400 mb-6">This is a placeholder for the add allocation form.</p>
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary mr-2"
                >
                  Cancel
                </button>
                <button className="btn-primary">
                  Add Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
