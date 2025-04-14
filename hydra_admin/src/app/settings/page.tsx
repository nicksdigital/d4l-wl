'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface Settings {
  siteTitle: string;
  siteDescription: string;
  airdropEnabled: boolean;
  maintenanceMode: boolean;
  contractAddresses: {
    token: string;
    nft: string;
    airdrop: string;
  };
}

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    siteTitle: '',
    siteDescription: '',
    airdropEnabled: false,
    maintenanceMode: false,
    contractAddresses: {
      token: '',
      nft: '',
      airdrop: ''
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await settingsApi.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (name: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof Settings]
    }));
  };

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      contractAddresses: {
        ...prev.contractAddresses,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const response = await settingsApi.updateSettings(settings);
      if (response.success) {
        setNotification({
          type: 'success',
          message: 'Settings updated successfully'
        });
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while updating settings'
      });
    } finally {
      setIsSaving(false);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Configure your D4L platform</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          notification.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? (
            <FiCheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <FiAlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="card p-6 animate-pulse space-y-4">
          <div className="h-6 bg-gray-700/50 rounded w-1/4"></div>
          <div className="h-10 bg-gray-700/50 rounded"></div>
          <div className="h-6 bg-gray-700/50 rounded w-1/4 mt-6"></div>
          <div className="h-20 bg-gray-700/50 rounded"></div>
          <div className="h-6 bg-gray-700/50 rounded w-1/4 mt-6"></div>
          <div className="h-10 bg-gray-700/50 rounded"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* General Settings */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">General Settings</h2>
              
              <div className="mb-4">
                <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-300 mb-1">
                  Site Title
                </label>
                <input
                  type="text"
                  id="siteTitle"
                  name="siteTitle"
                  value={settings.siteTitle}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-300 mb-1">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  rows={3}
                  value={settings.siteDescription}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="airdropEnabled"
                    checked={settings.airdropEnabled}
                    onChange={() => handleToggleChange('airdropEnabled')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                  />
                  <label htmlFor="airdropEnabled" className="ml-2 block text-sm text-gray-300">
                    Enable Airdrop
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={() => handleToggleChange('maintenanceMode')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-300">
                    Maintenance Mode
                  </label>
                </div>
              </div>
            </div>
            
            {/* Contract Settings */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Contract Addresses</h2>
              
              <div className="mb-4">
                <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-1">
                  Token Contract
                </label>
                <input
                  type="text"
                  id="token"
                  name="token"
                  value={settings.contractAddresses.token}
                  onChange={handleContractAddressChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="0x..."
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="nft" className="block text-sm font-medium text-gray-300 mb-1">
                  NFT Contract
                </label>
                <input
                  type="text"
                  id="nft"
                  name="nft"
                  value={settings.contractAddresses.nft}
                  onChange={handleContractAddressChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="0x..."
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="airdrop" className="block text-sm font-medium text-gray-300 mb-1">
                  Airdrop Contract
                </label>
                <input
                  type="text"
                  id="airdrop"
                  name="airdrop"
                  value={settings.contractAddresses.airdrop}
                  onChange={handleContractAddressChange}
                  className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="0x..."
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FiSave className="mr-2" />
                    <span>Save Settings</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
