'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../../libs/shared-utils/api-client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    invitationToken: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  CLIENT: 1,
  AGENT: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
  DEVELOPER: 5,
} as const;

// Permission mappings
const PERMISSIONS = {
  // User management
  'users.view': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'users.create': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'users.edit': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'users.delete': ['SUPER_ADMIN', 'DEVELOPER'],

  // Invitation management
  'invitations.view': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'invitations.create': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'invitations.delete': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],

  // Customer management
  'customers.view': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'customers.create': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'customers.edit': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'customers.delete': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],

  // Project management
  'projects.view': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'projects.create': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'projects.edit': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'projects.delete': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],

  // Service management
  'services.view': ['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'services.create': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'services.edit': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'services.delete': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],

  // Lead management
  'leads.view': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'leads.create': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'leads.edit': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'leads.delete': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],

  // Order management
  'orders.view': ['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'orders.create': ['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'orders.edit': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'orders.delete': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],

  // Activity management
  'activities.view': ['AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],

  // Admin panel access
  'admin.access': ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'],
  'admin.system': ['SUPER_ADMIN', 'DEVELOPER'],
  'admin.developer': ['DEVELOPER'],
} as const;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        // Try to parse stored user
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Verify token is still valid by fetching current user
        const response = await apiClient.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error occurred' 
      };
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    invitationToken: string;
  }) => {
    try {
      const response = await apiClient.register(userData);

      if (response.success && response.data) {
        const { token, user: newUser } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);

        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error occurred' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const allowedRoles = PERMISSIONS[permission as keyof typeof PERMISSIONS];
    if (!allowedRoles) return false;
    
    return allowedRoles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshUser,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for checking permissions
export function usePermissions() {
  const { hasRole, hasPermission } = useAuth();
  
  return {
    hasRole,
    hasPermission,
    canViewUsers: () => hasPermission('users.view'),
    canCreateUsers: () => hasPermission('users.create'),
    canEditUsers: () => hasPermission('users.edit'),
    canDeleteUsers: () => hasPermission('users.delete'),
    canManageInvitations: () => hasPermission('invitations.view'),
    canAccessAdmin: () => hasPermission('admin.access'),
    canAccessSystemSettings: () => hasPermission('admin.system'),
    canAccessDeveloperTools: () => hasPermission('admin.developer'),
  };
}
