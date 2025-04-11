"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentGiven = localStorage.getItem('cookieConsent');
    if (!consentGiven) {
      // Show banner if no consent has been given yet
      setShowBanner(true);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
      } catch (e) {
        console.error('Error parsing cookie preferences:', e);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setShowBanner(false);
    
    // Here you would initialize your analytics, marketing tools, etc.
    initializeServices(allAccepted);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    setPreferences(essentialOnly);
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    setShowBanner(false);
    
    // Only initialize necessary services
    initializeServices(essentialOnly);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
    
    // Initialize services based on selected preferences
    initializeServices(preferences);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Cannot change necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const initializeServices = (prefs: CookiePreferences) => {
    // This function would initialize various services based on user preferences
    // For example:
    
    if (prefs.analytics) {
      // Initialize analytics (Google Analytics, Mixpanel, etc.)
      console.log('Analytics cookies enabled');
      // window.gtag = ...
    }
    
    if (prefs.marketing) {
      // Initialize marketing tools (Facebook Pixel, etc.)
      console.log('Marketing cookies enabled');
      // window.fbq = ...
    }
    
    if (prefs.preferences) {
      // Initialize preference/functionality cookies
      console.log('Preference cookies enabled');
    }
    
    // Necessary cookies are always enabled
    console.log('Necessary cookies enabled');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Main cookie banner with glassmorphism effect */}
      <div className="relative mx-4 mb-4 md:mx-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md -z-10"></div>
        <div className="relative p-4 md:p-6 border border-white/10 rounded-xl">
          {!showPreferences ? (
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-white">Cookie Consent</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Visit our <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link> to learn more.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Customize
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-700 border border-transparent rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Reject Non-Essential
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white">Cookie Preferences</h3>
                <p className="mt-1 text-sm text-gray-300">
                  Customize your cookie preferences below. Necessary cookies are required for the website to function properly.
                </p>
              </div>
              
              <div className="space-y-3">
                {/* Necessary cookies */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md">
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
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md">
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
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md">
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
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md">
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
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
          
          {/* Floating particles for visual appeal */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-1 pointer-events-none">
            <div className="cookie-particle-1 absolute w-3 h-3 rounded-full bg-blue-400/10 blur-sm"></div>
            <div className="cookie-particle-2 absolute w-4 h-4 rounded-full bg-purple-400/10 blur-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Add floating animation keyframes */}
      <style jsx>{`
        .cookie-particle-1 {
          top: 20%;
          left: 10%;
          animation: float-cookie 8s ease-in-out infinite;
        }
        .cookie-particle-2 {
          top: 60%;
          left: 80%;
          animation: float-cookie 12s ease-in-out infinite;
        }
        @keyframes float-cookie {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-5px) translateX(5px); }
          50% { transform: translateY(0px) translateX(0px); }
          75% { transform: translateY(5px) translateX(-5px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
    </div>
  );
}
