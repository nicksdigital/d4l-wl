"use client";

import { useState, useEffect } from 'react';
import useWeb3 from '@/hooks/useWeb3';
import { usePathname } from 'next/navigation';
import DashboardTab from './tabs/DashboardTab';
import AirdropTab from './tabs/AirdropTab';
import ContentTab from './tabs/ContentTab';
import SettingsTab from './tabs/SettingsTab';
import UsersTab from './tabs/UsersTab';
import AdminCacheManager from './AdminCacheManager';

// Stat Card Component with Glassmorphism Effects
interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'cyan' | 'pink';
  suffix?: string;
}

export function StatCard({ title, value, icon, color, suffix }: StatCardProps) {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'nft':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'token':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'reward':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case 'analytics':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'cache':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case 'settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getColorClass = (colorName: string) => {
    switch (colorName) {
      case 'blue':
        return 'from-blue-600/20 to-blue-800/20 text-blue-400';
      case 'purple':
        return 'from-purple-600/20 to-purple-800/20 text-purple-400';
      case 'green':
        return 'from-green-600/20 to-green-800/20 text-green-400';
      case 'yellow':
        return 'from-yellow-600/20 to-yellow-800/20 text-yellow-400';
      case 'cyan':
        return 'from-cyan-600/20 to-cyan-800/20 text-cyan-400';
      case 'pink':
        return 'from-pink-600/20 to-pink-800/20 text-pink-400';
      default:
        return 'from-gray-600/20 to-gray-800/20 text-gray-400';
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative group hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${getColorClass(color)}`}></div>
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:w-1/2 group-hover:h-1/2 transition-all duration-500"></div>
      <div className="absolute bottom-0 right-0 w-0 h-0 bg-purple-500/10 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 group-hover:w-1/3 group-hover:h-1/3 transition-all duration-500"></div>
      <div className="p-6 relative z-10">
        <div className={`inline-block p-3 rounded-full bg-gradient-to-br ${getColorClass(color)} mb-4 shadow-lg shadow-${color}-500/10 group-hover:scale-110 transition-transform duration-300`}>
          {getIconByType(icon)}
        </div>
        <h3 className="text-lg font-medium text-white/70 mb-1">{title}</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix ? ` ${suffix}` : ''}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isConnected, address } = useWeb3();
  const pathname = usePathname();
  
  // For a real app, we would implement proper admin authentication
  // This is just a placeholder - replace with actual admin address
  const adminAddress = '0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be';
  const isAdmin = isConnected && address?.toLowerCase() === adminAddress.toLowerCase();

  // Mock dashboard data
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalMinted: 0,
    totalClaimed: 0,
    totalRewards: 0,
    totalUsers: 0,
    conversionRate: '0%'
  });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mock loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch data from the contracts
    // For demonstration purposes, we'll use mock data
    if (isConnected && isAdmin) {
      setTimeout(() => {
        setStats({
          totalRegistered: 1253,
          totalMinted: 1253,
          totalClaimed: 987,
          totalRewards: 12650,
          totalUsers: 2450,
          conversionRate: '78.8%'
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [isConnected, isAdmin]);

  // Set active tab based on pathname
  useEffect(() => {
    if (pathname === '/admin') {
      setActiveTab('dashboard');
    } else if (pathname === '/admin/airdrop') {
      setActiveTab('airdrop');
    } else if (pathname === '/admin/content') {
      setActiveTab('content');
    } else if (pathname === '/admin/settings') {
      setActiveTab('settings');
    } else if (pathname === '/admin/users') {
      setActiveTab('users');
    } else if (pathname === '/admin/cache') {
      setActiveTab('cache');
    }
  }, [pathname]);
  
  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'analytics' },
    { id: 'airdrop', label: 'Airdrop', icon: 'token' },
    { id: 'content', label: 'Content', icon: 'nft' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'cache', label: 'Cache', icon: 'cache' }
  ];
  
  // Function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'airdrop':
        return <AirdropTab />;
      case 'content':
        return <ContentTab />;
      case 'settings':
        return <SettingsTab />;
      case 'users':
        return <UsersTab />;
      case 'cache':
        return <AdminCacheManager />;
      case 'dashboard':
      default:
        return <DashboardTab stats={stats} isLoading={isLoading} />;
    }
  };

  if (!isConnected || !isAdmin) {
    return (
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-800/10 opacity-20"></div>
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-red-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="relative z-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400 mb-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m0 0V5m0 3h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-6">You need to connect with an admin wallet to access this area.</p>
          <div className="inline-block bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-md rounded-lg px-6 py-3 text-white border border-white/10 shadow-lg hover:shadow-red-500/10 transition-all duration-300">
            {isConnected ? (
              <p>Connected address: <span className="font-mono font-medium">{address?.slice(0, 6)}...{address?.slice(-4)}</span></p>
            ) : (
              <p>Please connect your wallet</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-20"></div>
      
      {/* Glassmorphism Background Blobs */}
      <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-purple-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2 -z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      
      {/* Admin Header with Tabs */}
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
        <div className="absolute top-0 left-0 w-1/3 h-full bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-purple-500/5 blur-3xl rounded-full translate-x-1/2"></div>
        
        <div className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-gray-400">Manage your D4L platform</p>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 shadow-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 backdrop-blur-sm bg-gradient-to-br from-gray-700/30 to-gray-800/30 p-2 rounded-lg border border-white/10 overflow-x-auto shadow-inner">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap relative overflow-hidden ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border border-white/10'
                    : 'text-white/70 hover:bg-white/10 border border-transparent hover:border-white/5'
                }`}
              >
                <span className="text-xl">
                  {item.icon === 'analytics' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {item.icon === 'token' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.icon === 'nft' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {item.icon === 'users' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {item.icon === 'settings' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-30"></div>
        
        {/* Enhanced Glassmorphism Effects */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
        
        <div className="p-6 relative z-10">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
