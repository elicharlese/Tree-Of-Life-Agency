'use client';

import { useState, useEffect, useContext } from 'react';

// Mock auth hook for now - this would typically use the AuthContext
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Simulate checking for stored auth token
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // In a real app, you'd validate the token with your API
      // For now, we'll create a mock user
      const mockUser: User = {
        id: '1',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@treeoflife.com',
        role: 'ADMIN',
      };
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  return authState;
}

// Additional auth hooks for common operations
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      window.location.href = '/auth/signin';
    }
  }, [isAuthenticated, isLoading]);
  
  return { isAuthenticated, isLoading };
}

export function useRoleCheck(requiredRole: User['role']) {
  const { user } = useAuth();
  
  const roleHierarchy = {
    CLIENT: 1,
    AGENT: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
    DEVELOPER: 5,
  };
  
  const hasPermission = user && roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  
  return { hasPermission, userRole: user?.role };
}
