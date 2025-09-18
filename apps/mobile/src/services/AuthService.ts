import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ApiService } from './ApiService';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';
  profilePhoto?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class AuthServiceClass {
  private user: User | null = null;
  private tokens: AuthTokens | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    try {
      // Load stored authentication data
      const [storedTokens, storedUser] = await Promise.all([
        this.getStoredTokens(),
        this.getStoredUser(),
      ]);

      if (storedTokens && storedUser) {
        this.tokens = storedTokens;
        this.user = storedUser;

        // Check if tokens are still valid
        if (this.isTokenExpired()) {
          await this.refreshTokens();
        } else {
          this.scheduleTokenRefresh();
        }
      }
    } catch (error) {
      console.error('Auth service initialization error:', error);
      await this.logout();
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await ApiService.post('/auth/login', credentials);
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }

      const { user, accessToken, refreshToken } = response.data;
      
      // Calculate expiration time (assuming 30 minutes for access token)
      const expiresAt = Date.now() + (30 * 60 * 1000);
      
      this.tokens = { accessToken, refreshToken, expiresAt };
      this.user = user;

      // Store authentication data
      await Promise.all([
        this.storeTokens(this.tokens),
        this.storeUser(user),
      ]);

      // Set up token refresh
      this.scheduleTokenRefresh();
      
      // Update API service with token
      ApiService.setAuthToken(accessToken);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Call logout endpoint if we have a valid token
      if (this.tokens?.accessToken) {
        try {
          await ApiService.post('/auth/logout');
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
      }

      // Clear stored data
      await Promise.all([
        this.clearStoredTokens(),
        this.clearStoredUser(),
      ]);

      // Clear in-memory data
      this.tokens = null;
      this.user = null;

      // Clear API service token
      ApiService.clearAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshTokens(): Promise<void> {
    try {
      if (!this.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await ApiService.post('/auth/refresh-token', {
        refreshToken: this.tokens.refreshToken,
      });

      if (!response.success) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, refreshToken } = response.data;
      const expiresAt = Date.now() + (30 * 60 * 1000);

      this.tokens = { accessToken, refreshToken, expiresAt };
      
      await this.storeTokens(this.tokens);
      ApiService.setAuthToken(accessToken);
      
      this.scheduleTokenRefresh();
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      throw error;
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      if (!this.tokens || !this.user) {
        return false;
      }

      // If token is expired and we can't refresh, logout
      if (this.isTokenExpired()) {
        try {
          await this.refreshTokens();
        } catch (error) {
          return false;
        }
      }

      // Verify token with server
      try {
        const response = await ApiService.get('/auth/me');
        if (response.success) {
          this.user = response.data;
          await this.storeUser(this.user);
          return true;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }

      return false;
    } catch (error) {
      console.error('Auth status check error:', error);
      return false;
    }
  }

  getUser(): User | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  isAuthenticated(): boolean {
    return !!(this.tokens && this.user && !this.isTokenExpired());
  }

  private isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.expiresAt - (5 * 60 * 1000); // Refresh 5 minutes before expiry
  }

  private scheduleTokenRefresh(): void {
    if (!this.tokens) return;

    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh 5 minutes before expiry
    const refreshTime = this.tokens.expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshTokens();
        } catch (error) {
          console.error('Scheduled token refresh failed:', error);
        }
      }, refreshTime);
    }
  }

  // Secure storage methods
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      const tokenData = JSON.stringify(tokens);
      
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('@auth_tokens', tokenData);
      } else {
        await SecureStore.setItemAsync('auth_tokens', tokenData);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      let tokenData: string | null;
      
      if (Platform.OS === 'web') {
        tokenData = await AsyncStorage.getItem('@auth_tokens');
      } else {
        tokenData = await SecureStore.getItemAsync('auth_tokens');
      }
      
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  }

  private async clearStoredTokens(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('@auth_tokens');
      } else {
        await SecureStore.deleteItemAsync('auth_tokens');
      }
    } catch (error) {
      console.error('Error clearing stored tokens:', error);
    }
  }

  private async storeUser(user: User): Promise<void> {
    try {
      const userData = JSON.stringify(user);
      await AsyncStorage.setItem('@auth_user', userData);
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  }

  private async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('@auth_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  private async clearStoredUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@auth_user');
    } catch (error) {
      console.error('Error clearing stored user:', error);
    }
  }
}

export const AuthService = new AuthServiceClass();
