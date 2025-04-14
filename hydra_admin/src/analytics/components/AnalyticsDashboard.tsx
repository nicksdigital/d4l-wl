'use client';

import { useState } from 'react';
import { useAnalytics } from '../hooks';
import { AnalyticsTimePeriod } from '../models';
import { 
  FiRefreshCw,
  FiUsers,
  FiActivity,
  FiDollarSign,
  FiTrendingUp
} from 'react-icons/fi';

interface AnalyticsDashboardProps {
  initialPeriod?: AnalyticsTimePeriod;
}

export function AnalyticsDashboard({ initialPeriod = 'week' }: AnalyticsDashboardProps) {
  const { 
    stats, 
    snapshots, 
    isLoading, 
    error, 
    period, 
    setPeriod, 
    fetchData 
  } = useAnalytics({ initialPeriod });

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-gray-800 rounded-lg">
          {['day', 'week', 'month', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as AnalyticsTimePeriod)}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => fetchData()}
          disabled={isLoading}
          className="btn-secondary"
        >
          <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<FiUsers className="h-5 w-5" />} 
          color="blue" 
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={<FiUsers className="h-5 w-5" />} 
          color="green" 
          isLoading={isLoading}
        />
        <StatCard 
          title="New Users" 
          value={stats.newUsers} 
          icon={<FiUsers className="h-5 w-5" />} 
          color="purple" 
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Transactions" 
          value={stats.totalTransactions} 
          icon={<FiActivity className="h-5 w-5" />} 
          color="cyan" 
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Volume" 
          value={stats.totalVolume} 
          icon={<FiDollarSign className="h-5 w-5" />} 
          color="yellow" 
          suffix="D4L"
          isLoading={isLoading}
        />
        <StatCard 
          title="Avg. Transaction" 
          value={stats.averageTransactionValue} 
          icon={<FiTrendingUp className="h-5 w-5" />} 
          color="pink" 
          suffix="D4L"
          isLoading={isLoading}
        />
      </div>

      {/* Snapshots Table */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Daily Snapshots</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Transactions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Volume (D4L)
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {isLoading ? (
                [...Array(7)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                    </td>
                  </tr>
                ))
              ) : snapshots.length > 0 ? (
                snapshots.map((snapshot) => (
                  <tr key={snapshot.date} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(snapshot.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {snapshot.users.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {snapshot.transactions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {snapshot.volume.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No snapshots found for the selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'cyan' | 'yellow' | 'pink';
  suffix?: string;
  isLoading: boolean;
}

function StatCard({ title, value, icon, color, suffix, isLoading }: StatCardProps) {
  // Color mapping
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-500/5 border-blue-500/30',
    green: 'from-green-600/20 to-green-500/5 border-green-500/30',
    purple: 'from-purple-600/20 to-purple-500/5 border-purple-500/30',
    cyan: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/30',
    yellow: 'from-yellow-600/20 to-yellow-500/5 border-yellow-500/30',
    pink: 'from-pink-600/20 to-pink-500/5 border-pink-500/30',
  };

  const iconColorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    pink: 'text-pink-400',
  };

  return (
    <div className={`card-gradient bg-gradient-to-br ${colorMap[color]} p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-700/50 rounded mt-2 animate-pulse"></div>
          ) : (
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-white">
                {value.toLocaleString()}
              </p>
              {suffix && <span className="ml-1 text-gray-400">{suffix}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${iconColorMap[color]} bg-white/5`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
