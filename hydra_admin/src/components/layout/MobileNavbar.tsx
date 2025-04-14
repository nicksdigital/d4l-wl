'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiMenu, 
  FiHome, 
  FiUsers, 
  FiGift, 
  FiFileText, 
  FiSettings 
} from 'react-icons/fi';

interface MobileNavbarProps {
  onMenuClick: () => void;
}

export default function MobileNavbar({ onMenuClick }: MobileNavbarProps) {
  const pathname = usePathname();

  // Bottom navigation items (limited to 5 for mobile)
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/users', label: 'Users', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/airdrop', label: 'Airdrop', icon: <FiGift className="w-5 h-5" /> },
    { path: '/content', label: 'Content', icon: <FiFileText className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center md:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">D4L</span>
          </div>
          <span className="ml-2 text-lg font-semibold text-white">Admin</span>
        </div>
        <div className="w-6"></div> {/* Empty div for flex spacing */}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 md:hidden z-30">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-3 px-2 ${
                  isActive 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 w-full h-0.5 bg-blue-500"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
