'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import { AnalyticsDashboard } from '@/analytics/components';
import { FiCalendar, FiDownload } from 'react-icons/fi';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const [showCreateSnapshotModal, setShowCreateSnapshotModal] = useState(false);

  const handleCreateSnapshot = () => {
    setShowCreateSnapshotModal(true);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Platform performance metrics</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateSnapshot}
            className="btn-primary"
          >
            <FiCalendar className="h-5 w-5" />
            <span className="hidden sm:inline">Create Snapshot</span>
          </button>

          <button className="btn-secondary">
            <FiDownload className="h-5 w-5" />
            <span className="hidden sm:inline">Export Data</span>
          </button>
        </div>
      </div>

      {/* Analytics Dashboard Component */}
      <AnalyticsDashboard initialPeriod="week" />

      {/* Create Snapshot Modal */}
      {showCreateSnapshotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateSnapshotModal(false)}></div>
            <div className="card-gradient p-6 max-w-md w-full relative z-10">
              <h2 className="text-xl font-bold mb-4 text-white">Create Daily Snapshot</h2>
              <p className="text-gray-400 mb-6">This will create a new analytics snapshot for today. This process may take a few moments to complete.</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCreateSnapshotModal(false)}
                  className="btn-secondary mr-2"
                >
                  Cancel
                </button>
                <button className="btn-primary">
                  Create Snapshot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
