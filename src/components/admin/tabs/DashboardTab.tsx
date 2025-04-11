"use client";

import { useState } from 'react';
import { StatCard } from '../AdminDashboard';

interface DashboardTabProps {
  stats: {
    totalRegistered: number;
    totalMinted: number;
    totalClaimed: number;
    totalRewards: number;
    totalUsers: number;
    conversionRate: string;
  };
  isLoading: boolean;
}

export default function DashboardTab({ stats, isLoading }: DashboardTabProps) {
  const [timeframe, setTimeframe] = useState('all');
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-700/50 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
        <div className="flex p-1 bg-gray-800/50 rounded-lg border border-white/10">
          <button 
            onClick={() => setTimeframe('day')} 
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'day' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Day
          </button>
          <button 
            onClick={() => setTimeframe('week')} 
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setTimeframe('month')} 
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => setTimeframe('all')} 
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeframe === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Registered" value={stats.totalRegistered} icon="users" color="blue" />
        <StatCard title="NFTs Minted" value={stats.totalMinted} icon="nft" color="purple" />
        <StatCard title="Tokens Claimed" value={stats.totalClaimed} icon="token" color="green" />
        <StatCard title="Total Rewards" value={stats.totalRewards} icon="reward" color="yellow" suffix="D4L" />
        <StatCard title="Active Users" value={stats.totalUsers} icon="users" color="cyan" />
        <StatCard title="Conversion Rate" value={stats.conversionRate} icon="analytics" color="pink" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Recent Registrations</h3>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</button>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/5">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="hover:bg-white/10 transition-colors">
                      <td className="px-4 py-3 text-sm text-white/90">0x{Math.random().toString(16).substring(2, 10)}...{Math.random().toString(16).substring(2, 10)}</td>
                      <td className="px-4 py-3 text-sm text-white/90">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Registered</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/10 blur-3xl rounded-full translate-x-1/4 translate-y-1/4"></div>
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg border border-blue-500/30 hover:from-blue-600/30 hover:to-blue-800/30 transition-colors text-white text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Sync Blockchain Data</h4>
                    <p className="text-sm text-gray-400">Update local database with on-chain data</p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg border border-purple-500/30 hover:from-purple-600/30 hover:to-purple-800/30 transition-colors text-white text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Pause Airdrop</h4>
                    <p className="text-sm text-gray-400">Temporarily disable token claims</p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg border border-green-500/30 hover:from-green-600/30 hover:to-green-800/30 transition-colors text-white text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Generate Report</h4>
                    <p className="text-sm text-gray-400">Create CSV export of all data</p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-lg border border-yellow-500/30 hover:from-yellow-600/30 hover:to-yellow-800/30 transition-colors text-white text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Send Notification</h4>
                    <p className="text-sm text-gray-400">Notify all users about updates</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity Chart */}
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-cyan-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Activity Overview</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-400">Registrations</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-400">Claims</span>
              </div>
            </div>
          </div>
          
          {/* Mock Chart - In a real app, use a chart library like Chart.js or Recharts */}
          <div className="h-64 bg-gray-800/50 rounded-lg border border-white/10 p-4">
            <div className="h-full flex items-end justify-between gap-1">
              {[...Array(14)].map((_, i) => {
                const registrationHeight = 30 + Math.random() * 50;
                const claimHeight = 20 + Math.random() * 40;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-purple-500/70 rounded-t-sm" style={{ height: `${claimHeight}%` }}></div>
                    <div className="w-full bg-blue-500/70 rounded-t-sm" style={{ height: `${registrationHeight}%` }}></div>
                    <span className="text-[10px] text-gray-500 mt-1">{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">Last 14 days</div>
        </div>
      </div>
    </div>
  );
}
