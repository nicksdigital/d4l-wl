"use client";

import { useState } from 'react';

interface SiteSettings {
  siteName: string;
  contactEmail: string;
  adminWalletAddress: string;
  maintenanceMode: boolean;
  publicRegistration: boolean;
  tokenSymbol: string;
  tokenDecimals: number;
  darkModeDefault: boolean;
  animationsEnabled: boolean;
  glassmorphismIntensity: number;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'D4L Platform',
    contactEmail: 'contact@d4l.finance',
    adminWalletAddress: '0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be',
    maintenanceMode: false,
    publicRegistration: true,
    tokenSymbol: 'D4L',
    tokenDecimals: 18,
    darkModeDefault: true,
    animationsEnabled: true,
    glassmorphismIntensity: 70
  });
  
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }));
  };
  
  const handleRangeChange = (name: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        siteName: 'D4L Platform',
        contactEmail: 'contact@d4l.finance',
        adminWalletAddress: '0xDe43d4FaAC1e6F0d6484215dfEEA1270a5A3A9be',
        maintenanceMode: false,
        publicRegistration: true,
        tokenSymbol: 'D4L',
        tokenDecimals: 18,
        darkModeDefault: true,
        animationsEnabled: true,
        glassmorphismIntensity: 70
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Admin Settings</h2>
        {saveSuccess && (
          <div className="bg-green-900/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Settings saved successfully
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection('general')}
                className={`w-full px-4 py-2 rounded-lg text-left flex items-center gap-3 transition-colors ${
                  activeSection === 'general'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                    : 'text-white hover:bg-gray-700/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                General
              </button>
              <button
                onClick={() => setActiveSection('access')}
                className={`w-full px-4 py-2 rounded-lg text-left flex items-center gap-3 transition-colors ${
                  activeSection === 'access'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                    : 'text-white hover:bg-gray-700/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Access Control
              </button>
              <button
                onClick={() => setActiveSection('token')}
                className={`w-full px-4 py-2 rounded-lg text-left flex items-center gap-3 transition-colors ${
                  activeSection === 'token'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                    : 'text-white hover:bg-gray-700/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Token Settings
              </button>
              <button
                onClick={() => setActiveSection('appearance')}
                className={`w-full px-4 py-2 rounded-lg text-left flex items-center gap-3 transition-colors ${
                  activeSection === 'appearance'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                    : 'text-white hover:bg-gray-700/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appearance
              </button>
            </nav>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Site Name</label>
                    <input 
                      type="text" 
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      name="contactEmail"
                      value={settings.contactEmail}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Access Control Settings */}
            {activeSection === 'access' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Access Control</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Admin Wallet Address</label>
                    <input 
                      type="text" 
                      name="adminWalletAddress"
                      value={settings.adminWalletAddress}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                    <div>
                      <h4 className="font-medium text-white">Maintenance Mode</h4>
                      <p className="text-sm text-gray-400">Temporarily disable access to the platform</p>
                    </div>
                    <div 
                      className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-700'}`}
                      onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                    <div>
                      <h4 className="font-medium text-white">Public Registration</h4>
                      <p className="text-sm text-gray-400">Allow new users to sign up</p>
                    </div>
                    <div 
                      className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${settings.publicRegistration ? 'bg-blue-600' : 'bg-gray-700'}`}
                      onClick={() => setSettings(prev => ({ ...prev, publicRegistration: !prev.publicRegistration }))}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.publicRegistration ? 'left-7' : 'left-1'}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Token Settings */}
            {activeSection === 'token' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Token Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Token Symbol</label>
                    <input 
                      type="text" 
                      name="tokenSymbol"
                      value={settings.tokenSymbol}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Token Decimals</label>
                    <input 
                      type="number" 
                      name="tokenDecimals"
                      value={settings.tokenDecimals}
                      onChange={handleChange}
                      min="0"
                      max="18"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Standard ERC-20 tokens use 18 decimals</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Appearance Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                    <div>
                      <h4 className="font-medium text-white">Dark Mode Default</h4>
                      <p className="text-sm text-gray-400">Set dark mode as the default theme</p>
                    </div>
                    <div 
                      className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${settings.darkModeDefault ? 'bg-blue-600' : 'bg-gray-700'}`}
                      onClick={() => setSettings(prev => ({ ...prev, darkModeDefault: !prev.darkModeDefault }))}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.darkModeDefault ? 'left-7' : 'left-1'}`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                    <div>
                      <h4 className="font-medium text-white">Enable Animations</h4>
                      <p className="text-sm text-gray-400">Enable UI animations and transitions</p>
                    </div>
                    <div 
                      className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${settings.animationsEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
                      onClick={() => setSettings(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }))}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.animationsEnabled ? 'left-7' : 'left-1'}`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium text-white">Glassmorphism Intensity</h4>
                      <span className="text-white">{settings.glassmorphismIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.glassmorphismIntensity}
                      onChange={(e) => handleRangeChange('glassmorphismIntensity', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-sm text-gray-400 mt-2">Adjust the intensity of glassmorphism effects throughout the UI</p>
                    
                    {/* Glassmorphism Preview */}
                    <div className="mt-4 relative h-24 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                      <div 
                        className="absolute inset-0 backdrop-blur-md bg-gray-800/50 border border-white/10"
                        style={{ opacity: settings.glassmorphismIntensity / 100 }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-medium">Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
