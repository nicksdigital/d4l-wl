'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiGift, 
  FiFileText, 
  FiSettings, 
  FiDatabase,
  FiBarChart2,
  FiLogOut
} from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/users', label: 'Users', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/airdrop', label: 'Airdrop', icon: <FiGift className="w-5 h-5" /> },
    { path: '/content', label: 'Content', icon: <FiFileText className="w-5 h-5" /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
    { path: '/cache', label: 'Cache', icon: <FiDatabase className="w-5 h-5" /> },
  ];

  return (
    <div className="h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">D4L</span>
          </div>
          <span className="ml-3 text-xl font-semibold text-white">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={isActive ? 'nav-item-active' : 'nav-item-inactive'}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute right-0 w-1 h-8 bg-blue-500 rounded-l-md"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-white text-sm">{user?.wallet.slice(0, 2)}</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white truncate">
              {user?.wallet.slice(0, 6)}...{user?.wallet.slice(-4)}
            </p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
