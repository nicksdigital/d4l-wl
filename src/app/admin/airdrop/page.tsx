"use client";

import AdminNavigation from '@/components/admin/AdminNavigation';
import AirdropManager from '@/components/admin/AirdropManager';

export default function AirdropManagementPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminNavigation />
      
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-500/10 blur-3xl rounded-full translate-x-1/4 translate-y-1/4"></div>
        <div className="p-6 relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-white">Airdrop Registration Management</h2>
          <AirdropManager />
        </div>
      </div>
    </div>
  );
}
