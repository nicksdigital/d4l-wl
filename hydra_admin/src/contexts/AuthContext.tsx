'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  wallet: string;
  isAdmin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify token and set user
        const decoded = jwtDecode<{ wallet: string; isAdmin: boolean; exp: number }>(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token is expired, remove it
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        } else {
          // Token is valid
          setIsAuthenticated(true);
          setUser({
            wallet: decoded.wallet,
            isAdmin: decoded.isAdmin
          });
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(username, password);
      const { token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      const decoded = jwtDecode<{ wallet: string; isAdmin: boolean }>(token);
      setUser({
        wallet: decoded.wallet,
        isAdmin: decoded.isAdmin
      });
      
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
