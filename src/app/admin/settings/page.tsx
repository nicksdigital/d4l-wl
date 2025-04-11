"use client";

import AdminNavigation from '@/components/admin/AdminNavigation';

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminNavigation />
      
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-white/10 relative">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="p-6 relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-white">Admin Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Site Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Site Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="D4L Platform"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="contact@d4l.finance"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Admin Access</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Admin Wallet Address</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-800/50 rounded-lg p-5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Platform Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Maintenance Mode</h4>
                  <p className="text-sm text-gray-400">Temporarily disable access to the platform</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700 cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-gray-400 transition-transform"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Public Registration</h4>
                  <p className="text-sm text-gray-400">Allow new users to sign up</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-blue-600 cursor-pointer">
                  <div className="absolute left-7 top-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md mr-2 hover:bg-gray-600 transition-colors">
              Reset
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
