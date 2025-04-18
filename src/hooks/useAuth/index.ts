import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import axios from 'axios';
import { getAuthMessage, getAuthToken, clearAuthToken } from '@/lib/auth/authToken';

interface UseAuthReturn {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  authenticatedAddress: string | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  authError: string | null;
}

export function useAuth(): UseAuthReturn {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedAddress, setAuthenticatedAddress] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if user is already authenticated
  const checkAuthentication = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      if (authToken) {
        const { data } = await axios.get('/api/auth/verify');
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAuthenticatedAddress(authToken.address);
        } else {
          // Clear invalid token
          clearAuthToken();
          setIsAuthenticated(false);
          setAuthenticatedAddress(null);
        }
      } else {
        setIsAuthenticated(false);
        setAuthenticatedAddress(null);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setAuthenticatedAddress(null);
    }
  }, []);

  // Authenticate user
  const login = async (): Promise<boolean> => {
    if (!isConnected || !address) {
      setAuthError('Wallet not connected');
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // Request a nonce
      const nonceResponse = await axios.post('/api/auth/nonce', { address });
      const { nonce } = nonceResponse.data;

      // Create authentication message
      const message = getAuthMessage(address, nonce);

      // Request signature from wallet
      const signature = await signMessageAsync({ message });

      // Verify signature and create token
      const response = await axios.post('/api/auth/login', {
        address,
        signature,
        nonce
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        setAuthenticatedAddress(address);
        return true;
      } else {
        setAuthError('Authentication failed');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Authentication failed');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      await axios.post('/api/auth/logout');
      clearAuthToken();
      setIsAuthenticated(false);
      setAuthenticatedAddress(null);
      disconnect(); // Disconnect wallet
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check authentication on mount and when wallet connection changes
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication, isConnected, address]);

  return {
    isAuthenticating,
    isAuthenticated,
    authenticatedAddress,
    login,
    logout,
    authError
  };
}

export default useAuth;
