'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  FiUsers, 
  FiGift, 
  FiDollarSign, 
  FiPercent, 
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

interface DashboardStats {
  totalRegistered: number;
  totalMinted: number;
  totalClaimed: number;
  totalRewards: number;
  totalUsers: number;
  conversionRate: string;
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistered: 0,
    totalMinted: 0,
    totalClaimed: 0,
    totalRewards: 0,
    totalUsers: 0,
    conversionRate: '0%'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, timeframe]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Overview of your D4L platform</p>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <div className="inline-flex p-1 bg-gray-800 rounded-lg">
          {['day', 'week', 'month', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                timeframe === period
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-800/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Registered" 
            value={stats.totalRegistered} 
            icon={<FiUsers />} 
            color="blue" 
          />
          <StatCard 
            title="NFTs Minted" 
            value={stats.totalMinted} 
            icon={<FiActivity />} 
            color="purple" 
          />
          <StatCard 
            title="Tokens Claimed" 
            value={stats.totalClaimed} 
            icon={<FiGift />} 
            color="green" 
          />
          <StatCard 
            title="Total Rewards" 
            value={stats.totalRewards} 
            icon={<FiDollarSign />} 
            color="yellow" 
            suffix="D4L" 
          />
          <StatCard 
            title="Active Users" 
            value={stats.totalUsers} 
            icon={<FiUsers />} 
            color="cyan" 
          />
          <StatCard 
            title="Conversion Rate" 
            value={stats.conversionRate} 
            icon={<FiTrendingUp />} 
            color="pink" 
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-white">Recent Activity</h2>
        <div className="card p-6">
          <div className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-700/50"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Activity data will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'cyan' | 'pink';
  suffix?: string;
}

function StatCard({ title, value, icon, color, suffix }: StatCardProps) {
  // Color mapping
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-500/5 border-blue-500/30',
    purple: 'from-purple-600/20 to-purple-500/5 border-purple-500/30',
    green: 'from-green-600/20 to-green-500/5 border-green-500/30',
    yellow: 'from-yellow-600/20 to-yellow-500/5 border-yellow-500/30',
    cyan: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/30',
    pink: 'from-pink-600/20 to-pink-500/5 border-pink-500/30',
  };

  const iconColorMap = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
  };

  return (
    <div className={`card-gradient bg-gradient-to-br ${colorMap[color]} p-6`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {suffix && <span className="ml-1 text-gray-400">{suffix}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-full ${iconColorMap[color]} bg-white/5`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
