// AuthContext
// Provides authentication context for the entire application
// Enhanced with enterprise-grade debugging and monitoring

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import authService from '../services/authService';
import enterpriseDebugger from '../services/EnterpriseDebugger';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      enterpriseDebugger.startTimer('auth_check');
      const token = localStorage.getItem('accessToken');
      
      // Authentication status check
      
      if (token) {
        try {
          const userData = await authService.getProfile();
        
          // Ensure user object has the correct structure
          const normalizedUser = {
            id: userData.id, // Add numeric ID for API calls
            user_id: userData.id || userData.user_id,
            email: userData.email,
            name: userData.fullName || userData.name,
            fullName: userData.fullName,
            role: userData.role,
            status: userData.status,
            phone: userData.phone,
            createdAt: userData.createdAt
          };
          
          setUser(normalizedUser);
        setIsAuthenticated(true);
        
        // Authentication successful
        } catch (error) {
          // API call failed, but token exists - use token payload as fallback
          // API call failed, using token payload as fallback
          
          try {
            // Extract user data from token payload
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const normalizedUser = {
              id: tokenPayload.userId, // Add numeric ID for API calls
              user_id: tokenPayload.userId,
              email: tokenPayload.email,
              name: tokenPayload.name || tokenPayload.email.split('@')[0],
              fullName: tokenPayload.name || tokenPayload.email.split('@')[0],
              role: tokenPayload.role,
              status: 'active', // Default status for token fallback
              phone: null,
              createdAt: new Date()
            };
            
            setUser(normalizedUser);
            setIsAuthenticated(true);
            
            // Authentication successful (token fallback)
          } catch (tokenError) {
            // Token parsing failed
            // Clear invalid tokens and log out user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            
            enterpriseDebugger.endTimer('auth_check');
            enterpriseDebugger.trackAuthState('UNAUTHENTICATED', null);
          }
        }
      } else {
        // No token - ensure user is logged out
        setUser(null);
        setIsAuthenticated(false);
        
        enterpriseDebugger.endTimer('auth_check');
        enterpriseDebugger.trackAuthState('UNAUTHENTICATED', null);
        enterpriseDebugger.log('INFO', 'AuthContext', 'No token found, user logged out');
      }
    } catch (error) {
      enterpriseDebugger.trackError(error, 'AuthContext', {
        context: 'checkAuthStatus',
        hasToken: !!localStorage.getItem('accessToken')
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only check auth status on initial load if we haven't checked yet
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuthStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const login = useCallback(async (credentials) => {
    try {
      enterpriseDebugger.startTimer('login_process');
      setLoading(true);
      
      enterpriseDebugger.log('INFO', 'AuthContext', 'Starting login process', {
        email: credentials.email,
        hasPassword: !!credentials.password,
        deviceInfo: credentials.deviceInfo
      });
      
      const response = await authService.login(credentials.email, credentials.password);
      
      enterpriseDebugger.log('INFO', 'AuthContext', 'Login API response received', {
        success: response.success,
        hasUser: !!response.user,
        hasAccessToken: !!response.accessToken,
        hasRefreshToken: !!response.refreshToken,
        responseKeys: Object.keys(response),
        fullResponse: response
      });
      
      const { accessToken, refreshToken, user: userData } = response;
      
      enterpriseDebugger.log('INFO', 'AuthContext', 'Destructured response data', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!userData,
        accessTokenType: typeof accessToken,
        refreshTokenType: typeof refreshToken,
        userDataType: typeof userData,
        accessTokenValue: accessToken,
        refreshTokenValue: refreshToken
      });
      
      // Store tokens with detailed logging
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Immediate verification
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      enterpriseDebugger.log('INFO', 'AuthContext', 'Tokens stored in localStorage', {
        accessTokenLength: accessToken ? accessToken.length : 0,
        refreshTokenLength: refreshToken ? refreshToken.length : 0,
        storedAccessTokenLength: storedAccessToken ? storedAccessToken.length : 0,
        storedRefreshTokenLength: storedRefreshToken ? storedRefreshToken.length : 0,
        tokensMatch: accessToken === storedAccessToken && refreshToken === storedRefreshToken,
        localStorageKeys: Object.keys(localStorage),
        tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
        storedTokenPreview: storedAccessToken ? storedAccessToken.substring(0, 20) + '...' : null
      });
      
      // Ensure user object has the correct structure
      const normalizedUser = {
        id: userData.id, // Add numeric ID for API calls
        user_id: userData.id || userData.user_id,
        email: userData.email,
        name: userData.fullName || userData.name,
        fullName: userData.fullName,
        role: userData.role,
        status: userData.status,
        phone: userData.phone,
        createdAt: userData.createdAt
      };
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
      
      enterpriseDebugger.endTimer('login_process');
      enterpriseDebugger.trackAuthState('AUTHENTICATED', normalizedUser);
      enterpriseDebugger.log('INFO', 'AuthContext', 'Login successful', {
        user: normalizedUser.email,
        role: normalizedUser.role,
        loginTime: 'completed'
      });
      
      return response;
    } catch (error) {
      enterpriseDebugger.trackError(error, 'AuthContext', {
        context: 'login',
        email: credentials.email
      });
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshTokenValue);
      const { accessToken } = response;
      
      localStorage.setItem('accessToken', accessToken);
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Call logout directly instead of depending on it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, []); // Remove logout dependency to prevent circular dependency

  // Debug function to check token status (available in console)
  window.debugAuth = () => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Access Token:', token ? `${token.substring(0, 20)}...` : 'None');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None');
    console.log('User Data:', user ? JSON.parse(user) : 'None');
    console.log('Current Auth State:', { user, isAuthenticated, loading });
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token Payload:', payload);
        console.log('Token Expiry:', new Date(payload.exp * 1000));
        console.log('Token Valid:', payload.exp * 1000 > Date.now());
      } catch (e) {
        console.log('Token Parse Error:', e.message);
      }
    }
    console.log('========================');
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshToken,
    checkAuthStatus,
    setUser
  }), [user, loading, isAuthenticated, login, logout, register, refreshToken, checkAuthStatus, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
