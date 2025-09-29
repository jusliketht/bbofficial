// =====================================================
// MOBILE AUTHENTICATION CONTEXT
// Cross-platform authentication for mobile apps
// =====================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useBiometrics } from '../hooks/useBiometrics';

// =====================================================
// TYPES
// =====================================================
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// =====================================================
// CONTEXT CREATION
// =====================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================================================
// AUTH PROVIDER COMPONENT
// =====================================================
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { authenticateWithBiometrics } = useBiometrics();

  const isAuthenticated = !!user;

  // =====================================================
  // PERSISTENT STORAGE
  // =====================================================
  const STORAGE_KEYS = {
    ACCESS_TOKEN: '@burnblack_access_token',
    REFRESH_TOKEN: '@burnblack_refresh_token',
    USER_DATA: '@burnblack_user_data',
    DEVICE_ID: '@burnblack_device_id',
  };

  // =====================================================
  // DEVICE MANAGEMENT
  // =====================================================
  const getDeviceId = async (): Promise<string> => {
    try {
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  // =====================================================
  // TOKEN MANAGEMENT
  // =====================================================
  const saveTokens = async (tokens: LoginResponse['tokens']) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  };

  const getStoredTokens = async () => {
    try {
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  };

  const clearTokens = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  // =====================================================
  // API CALLS
  // =====================================================
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const deviceId = await getDeviceId();
      const response = await api.post('/api/auth/login', {
        email,
        password,
        deviceInfo: {
          platform: 'mobile',
          deviceId,
          userAgent: 'React Native App',
        },
      });
      return response.data;
    },
    onSuccess: async (data: LoginResponse) => {
      setUser(data.user);
      await saveTokens(data.tokens);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      // Register device for push notifications
      await registerDevice(data.user.id);
      
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      Alert.alert('Login Failed', error.response?.data?.error || 'An error occurred');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const deviceId = await getDeviceId();
      const response = await api.post('/api/auth/register', {
        ...userData,
        deviceInfo: {
          platform: 'mobile',
          deviceId,
          userAgent: 'React Native App',
        },
      });
      return response.data;
    },
    onSuccess: async (data: LoginResponse) => {
      setUser(data.user);
      await saveTokens(data.tokens);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      // Register device for push notifications
      await registerDevice(data.user.id);
      
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      Alert.alert('Registration Failed', error.response?.data?.error || 'An error occurred');
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const { refreshToken } = await getStoredTokens();
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await api.post('/api/auth/refresh', { refreshToken });
      return response.data;
    },
    onSuccess: async (data: LoginResponse) => {
      setUser(data.user);
      await saveTokens(data.tokens);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
    },
    onError: async () => {
      await logout();
    },
  });

  // =====================================================
  // DEVICE REGISTRATION
  // =====================================================
  const registerDevice = async (userId: string) => {
    try {
      const deviceId = await getDeviceId();
      await api.post('/api/mobile/device/register', {
        deviceId,
        platform: 'mobile',
        appVersion: '1.0.0',
        deviceInfo: {
          platform: 'mobile',
          deviceId,
          userAgent: 'React Native App',
        },
      });
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    try {
      // Call logout API
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      await clearTokens();
      queryClient.clear();
    }
  };

  const refreshToken = async () => {
    await refreshTokenMutation.mutateAsync();
  };

  const loginWithBiometrics = async () => {
    try {
      const result = await authenticateWithBiometrics();
      if (result.success) {
        // Implement biometric login logic
        const deviceId = await getDeviceId();
        const response = await api.post('/api/mobile/auth/biometric', {
          biometricToken: result.token,
          deviceId,
        });
        
        const data = response.data;
        setUser(data.user);
        await saveTokens(data.tokens);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      }
    } catch (error) {
      Alert.alert('Biometric Login Failed', 'Please try again or use your password');
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await api.put('/api/users/profile', userData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    } catch (error) {
      Alert.alert('Update Failed', 'Failed to update profile');
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await api.put('/api/users/change-password', {
        oldPassword,
        newPassword,
      });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Change Password Failed', 'Failed to change password');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post('/api/auth/forgot-password', { email });
      Alert.alert('Success', 'Password reset email sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await api.post('/api/auth/reset-password', { token, newPassword });
      Alert.alert('Success', 'Password reset successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  // =====================================================
  // INITIALIZATION
  // =====================================================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        const { accessToken } = await getStoredTokens();

        if (storedUser && accessToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verify token is still valid
          try {
            await api.get('/api/users/profile');
          } catch (error) {
            // Token expired, try to refresh
            await refreshToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    loginWithBiometrics,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
