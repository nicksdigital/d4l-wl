/**
 * Analytics Provider for React applications
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnalyticsEventType } from '../models';

// Analytics context
interface AnalyticsContextType {
  trackEvent: (
    eventType: AnalyticsEventType,
    properties?: Record<string, any>
  ) => void;
  trackPageView: (
    url: string,
    referrer?: string,
    properties?: Record<string, any>
  ) => void;
  trackWalletConnect: (
    walletAddress: string,
    chainId?: number,
    properties?: Record<string, any>
  ) => void;
  trackWalletDisconnect: (
    walletAddress: string,
    properties?: Record<string, any>
  ) => void;
  trackContractInteraction: (
    contractAddress: string,
    method: string,
    walletAddress: string,
    chainId?: number,
    properties?: Record<string, any>
  ) => void;
  sessionId: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Analytics Provider props
interface AnalyticsProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
  disabled?: boolean;
  walletAddress?: string;
  chainId?: number;
}

// Analytics Provider component
export function AnalyticsProvider({
  children,
  apiUrl = '/api/analytics',
  disabled = false,
  walletAddress,
  chainId
}: AnalyticsProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Start a new session when the component mounts
  useEffect(() => {
    if (disabled) return;
    
    const startSession = async () => {
      try {
        const response = await fetch(`${apiUrl}/session/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            walletAddress,
            referrer: document.referrer,
            entryPage: window.location.pathname,
            chainId
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSessionId(data.data.sessionId);
        }
      } catch (error) {
        console.error('Error starting analytics session:', error);
      }
    };
    
    startSession();
    
    // End the session when the component unmounts
    return () => {
      if (sessionId) {
        fetch(`${apiUrl}/session/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId,
            exitPage: window.location.pathname
          })
        }).catch(error => {
          console.error('Error ending analytics session:', error);
        });
      }
    };
  }, [apiUrl, disabled, walletAddress, chainId]);
  
  // Track an event
  const trackEvent = async (
    eventType: AnalyticsEventType,
    properties?: Record<string, any>
  ) => {
    if (disabled) return;
    
    try {
      await fetch(`${apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          sessionId,
          walletAddress,
          url: window.location.pathname,
          referrer: document.referrer,
          metadata: properties
        })
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };
  
  // Track a page view
  const trackPageView = async (
    url: string,
    referrer?: string,
    properties?: Record<string, any>
  ) => {
    if (disabled) return;
    
    try {
      await fetch(`${apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: AnalyticsEventType.PAGE_VIEW,
          sessionId,
          walletAddress,
          url,
          referrer,
          metadata: properties
        })
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };
  
  // Track wallet connect
  const trackWalletConnect = async (
    walletAddress: string,
    chainId?: number,
    properties?: Record<string, any>
  ) => {
    if (disabled) return;
    
    try {
      await fetch(`${apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: AnalyticsEventType.WALLET_CONNECTED,
          sessionId,
          walletAddress,
          url: window.location.pathname,
          referrer: document.referrer,
          metadata: {
            ...properties,
            chainId
          }
        })
      });
    } catch (error) {
      console.error('Error tracking wallet connect:', error);
    }
  };
  
  // Track wallet disconnect
  const trackWalletDisconnect = async (
    walletAddress: string,
    properties?: Record<string, any>
  ) => {
    if (disabled) return;
    
    try {
      await fetch(`${apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: AnalyticsEventType.WALLET_DISCONNECTED,
          sessionId,
          walletAddress,
          url: window.location.pathname,
          referrer: document.referrer,
          metadata: properties
        })
      });
    } catch (error) {
      console.error('Error tracking wallet disconnect:', error);
    }
  };
  
  // Track contract interaction
  const trackContractInteraction = async (
    contractAddress: string,
    method: string,
    walletAddress: string,
    chainId?: number,
    properties?: Record<string, any>
  ) => {
    if (disabled) return;
    
    try {
      await fetch(`${apiUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: AnalyticsEventType.CONTRACT_INTERACTION,
          sessionId,
          walletAddress,
          url: window.location.pathname,
          referrer: document.referrer,
          metadata: {
            ...properties,
            contractAddress,
            method,
            chainId
          }
        })
      });
    } catch (error) {
      console.error('Error tracking contract interaction:', error);
    }
  };
  
  // Create the context value
  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackWalletConnect,
    trackWalletDisconnect,
    trackContractInteraction,
    sessionId
  };
  
  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
}
