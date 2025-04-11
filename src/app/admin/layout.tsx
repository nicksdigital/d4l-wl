"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useWeb3 from '@/hooks/useWeb3';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, address } = useWeb3();
  const router = useRouter();

  // Admin address from environment variable or use a hardcoded one for demo
  const adminAddress = '0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be';

  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else if (isConnected && address) {
      // Check if connected address is admin
      const isAdmin = address.toLowerCase() === adminAddress.toLowerCase();
      if (!isAdmin) {
        router.push('/');
      }
    }
  }, [isConnected, address, router]);

  // Show loading state while checking connection
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-blue-500/20"></div>
          <div className="h-4 w-24 bg-gray-200/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-8">
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
