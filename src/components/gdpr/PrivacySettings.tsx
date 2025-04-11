"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function PrivacySettings() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load saved preferences
    try {
      const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
      setPreferences(prev => ({ 
        ...prev, 
        ...savedPreferences,
        necessary: true // Always ensure necessary is true
      }));
    } catch (e) {
      console.error('Error parsing cookie preferences:', e);
    }
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot change necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // Initialize services based on selected preferences
    initializeServices(preferences);
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const initializeServices = (prefs: CookiePreferences) => {
    // This function would initialize various services based on user preferences
    if (prefs.analytics) {
      // Initialize analytics (Google Analytics, Mixpanel, etc.)
      console.log('Analytics cookies enabled');
    }
    
    if (prefs.marketing) {
      // Initialize marketing tools (Facebook Pixel, etc.)
      console.log('Marketing cookies enabled');
    }
    
    if (prefs.preferences) {
      // Initialize preference/functionality cookies
      console.log('Preference cookies enabled');
    }
    
    // Necessary cookies are always enabled
    console.log('Necessary cookies enabled');
  };

  return (
    <div className="relative">
      {/* Glassmorphism card */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl blur-sm -z-10"></div>
        <div className="relative p-6 border border-white/10 rounded-xl backdrop-blur-sm bg-black/20">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Privacy Settings
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-300 mb-6">
              Manage your cookie preferences below. You can change these settings at any time. For more information, please read our <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
            </p>
            
            {/* Necessary cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-md">
              <div>
                <h4 className="text-sm font-medium text-white">Necessary Cookies</h4>
                <p className="text-xs text-gray-400">Required for the website to function properly. Cannot be disabled.</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="h-4 w-4 text-blue-600 border-gray-600 rounded bg-gray-700 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Analytics cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-md">
              <div>
                <h4 className="text-sm font-medium text-white">Analytics Cookies</h4>
                <p className="text-xs text-gray-400">Help us understand how visitors interact with our website.</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => handlePreferenceChange('analytics')}
                  className="h-4 w-4 text-blue-600 border-gray-600 rounded bg-gray-700 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Marketing cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-md">
              <div>
                <h4 className="text-sm font-medium text-white">Marketing Cookies</h4>
                <p className="text-xs text-gray-400">Used to track visitors across websites to display relevant advertisements.</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => handlePreferenceChange('marketing')}
                  className="h-4 w-4 text-blue-600 border-gray-600 rounded bg-gray-700 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Preference cookies */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-md">
              <div>
                <h4 className="text-sm font-medium text-white">Preference Cookies</h4>
                <p className="text-xs text-gray-400">Allow the website to remember choices you make and provide enhanced functionality.</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={() => handlePreferenceChange('preferences')}
                  className="h-4 w-4 text-blue-600 border-gray-600 rounded bg-gray-700 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Save button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Preferences
              </button>
            </div>
            
            {/* Success message */}
            {showSuccess && (
              <div className="fixed top-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-md shadow-lg backdrop-blur-sm z-50 animate-fade-in-out">
                Preferences saved successfully!
              </div>
            )}
          </div>
          
          {/* Floating particles for visual appeal */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-1 pointer-events-none">
            <div className="privacy-particle-1 absolute w-3 h-3 rounded-full bg-blue-400/10 blur-sm"></div>
            <div className="privacy-particle-2 absolute w-4 h-4 rounded-full bg-purple-400/10 blur-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Add floating animation keyframes */}
      <style jsx>{`
        .privacy-particle-1 {
          top: 20%;
          left: 10%;
          animation: float-privacy 8s ease-in-out infinite;
        }
        .privacy-particle-2 {
          top: 60%;
          left: 80%;
          animation: float-privacy 12s ease-in-out infinite;
        }
        @keyframes float-privacy {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-5px) translateX(5px); }
          50% { transform: translateY(0px) translateX(0px); }
          75% { transform: translateY(5px) translateX(-5px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
