'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  FiCalendar, 
  FiDownload, 
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiDollarSign
} from 'react-icons/fi';

interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
}

interface DailySnapshot {
  date: string;
  users: number;
  transactions: number;
  volume: number;
}

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    averageTransactionValue: 0
  });
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, period]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch analytics dashboard stats
      const statsResponse = await analyticsApi.getDashboardStats(period as any);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch daily snapshots
      const snapshotsResponse = await analyticsApi.getDailySnapshots(
        dateRange.startDate,
        dateRange.endDate
      );
      if (snapshotsResponse.success) {
        setSnapshots(snapshotsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    
    // Update date range based on period
    const endDate = new Date().toISOString().split('T')[0];
    let startDate;
    
    switch (newPeriod) {
      case 'day':
        startDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'all':
      default:
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
    }
    
    setDateRange({ startDate, endDate });
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleCreateSnapshot = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await analyticsApi.createDailySnapshot(today);
      // Refresh data after creating snapshot
      fetchAnalyticsData();
    } catch (error) {
      console.error('Error creating snapshot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Platform performance metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex p-1 bg-gray-800 rounded-lg">
            {['day', 'week', 'month', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
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
            onClick={handleRefresh}
            className="btn-secondary"
          >
            <FiRefreshCw className="h-5 w-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            onClick={handleCreateSnapshot}
            className="btn-primary"
          >
            <FiCalendar className="h-5 w-5" />
            <span className="hidden sm:inline">Create Snapshot</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Daily Snapshots */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Daily Snapshots</h2>
          <button className="btn-secondary">
            <FiDownload className="h-5 w-5" />
            <span>Export CSV</span>
          </button>
        </div>
        
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

      {/* Chart Placeholder */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6 text-white">Performance Trends</h2>
        <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Chart visualization would appear here</p>
        </div>
      </div>
    </AdminLayout>
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
