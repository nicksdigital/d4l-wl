"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [prevPathname, setPrevPathname] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle initial page load
  useEffect(() => {
    // Force the splash screen to disappear after a maximum time
    // This ensures it never gets stuck
    const forceHideTimer = setTimeout(() => {
      setIsLoading(false);
      setIsInitialLoad(false);
      setPrevPathname(pathname || '');
    }, 2000); // Maximum time the splash screen can stay visible
    
    if (isInitialLoad) {
      // Short timeout for initial load to prevent flash
      const initialTimer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
        setPrevPathname(pathname || '');
      }, 800);
      
      return () => {
        clearTimeout(initialTimer);
        clearTimeout(forceHideTimer);
      };
    }
    
    return () => clearTimeout(forceHideTimer);
  }, [isInitialLoad, pathname]);

  // Handle subsequent navigation
  useEffect(() => {
    if (!isInitialLoad && prevPathname !== pathname) {
      setIsLoading(true);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPrevPathname(pathname || '');
      }, 1200); // Transition duration
      
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname, isInitialLoad]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="relative">
            {/* Animated logo with glassmorphism effects */}
            <div className="absolute -inset-20 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="absolute -inset-24 bg-purple-500/20 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 animate-bounce" style={{ animationDuration: '2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                  Loading...
                </h2>
                <div className="flex space-x-2 justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
              
              {/* Animated particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/30 animate-float"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDuration: `${3 + Math.random() * 5}s`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
